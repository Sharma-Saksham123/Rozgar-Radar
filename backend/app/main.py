import os
import sys

# Ensure project root is on sys.path so services can be imported cleanly
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.api import api_router
from services.job_ingestion.source_registry import seed_source_registry
from services.job_ingestion.scheduler import run_all_sources
import asyncio
import logging

logger = logging.getLogger("hirepulse_main")

async def periodic_12h_sync():
    """Runs data synchronization across all approved sources every 12 hours."""
    TWELVE_HOURS = 12 * 3600
    while True:
        try:
            await asyncio.sleep(TWELVE_HOURS)
            logger.info("Executing automated 12-hour scheduled sync for all approved sources...")
            await run_all_sources(trigger_type="scheduled")
        except asyncio.CancelledError:
            break
        except Exception as exc:
            logger.error(f"Error during periodic 12h sync: {exc}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    # Seed source registry if needed
    db = SessionLocal()
    try:
        seed_source_registry(db)
    finally:
        db.close()

    # Launch background 12-hour scheduler task
    sync_task = asyncio.create_task(periodic_12h_sync())
    yield
    sync_task.cancel()

app = FastAPI(
    title="HirePulse — Multi-Source Job Aggregator API",
    description=(
        "Production-ready backend API for multi-source job aggregation, "
        "normalization, duplicate detection, freshness tracking, and universal embedding."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Open CORS configuration enabling any external website or mobile app to consume jobs
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for embeddable JavaScript widget
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Mount API routers
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

@app.get("/", tags=["Health"])
def root_info():
    return {
        "name": "HirePulse Job Aggregation API",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "docs_url": "/docs",
        "widget_url": "/static/widget.js",
        "endpoints": {
            "jobs": f"{settings.API_V1_PREFIX}/jobs",
            "filters": f"{settings.API_V1_PREFIX}/jobs/filters",
            "sources": f"{settings.API_V1_PREFIX}/sources",
            "sync": f"{settings.API_V1_PREFIX}/sync",
            "sync_logs": f"{settings.API_V1_PREFIX}/sync/logs",
        }
    }

from fastapi.responses import FileResponse

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}

@app.get("/download/zip", tags=["Download"])
def download_project_zip():
    """Direct one-click download endpoint for the complete project zip."""
    zip_path = os.path.join(root_dir, "HirePulse_Complete_Engine.zip")
    if not os.path.exists(zip_path):
        return {"error": "Zip file not found"}
    return FileResponse(
        path=zip_path,
        filename="HirePulse_Complete_Engine.zip",
        media_type="application/zip"
    )

