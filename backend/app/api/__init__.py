from fastapi import APIRouter
from app.api.jobs import router as jobs_router
from app.api.sources import router as sources_router
from app.api.sync import router as sync_router

api_router = APIRouter()
api_router.include_router(jobs_router)
api_router.include_router(sources_router)
api_router.include_router(sync_router)

__all__ = ["api_router"]
