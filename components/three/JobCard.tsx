"use client";

import { Billboard, Float } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { JobWithMatch } from "@/lib/types";

const STATUS_COLOR: Record<string, string> = {
  confirmed: "#34d399",
  likely: "#38bdf8",
  not_eligible: "#fb7185",
  needs_review: "#fbbf24",
};

const STATUS_TEXT: Record<string, string> = {
  confirmed: "Confirmed",
  likely: "Likely",
  not_eligible: "Not eligible",
  needs_review: "Needs review",
};

const CARD_WIDTH = 2.3;
const CARD_HEIGHT = 1.44;
const TEX_W = 640;
const TEX_H = 400;

interface JobCardProps {
  job: JobWithMatch;
  position: [number, number, number];
  onSelect: (job: JobWithMatch) => void;
  selected?: boolean;
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let clipped = text;
  while (clipped.length > 1 && ctx.measureText(`${clipped}...`).width > maxWidth) {
    clipped = clipped.slice(0, -1);
  }
  return `${clipped}...`;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Bakes the card content into a texture so the card is a real 3D object.
 * This avoids mounting a React root per card for HTML overlays.
 */
function buildCardTexture(
  job: JobWithMatch,
  accent: string,
  label: string,
  selected: boolean,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    return fallback;
  }

  // Background
  const gradient = ctx.createLinearGradient(0, 0, TEX_W, TEX_H);
  gradient.addColorStop(0, "#0d1526");
  gradient.addColorStop(1, "#070c17");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Border
  ctx.strokeStyle = selected ? accent : "rgba(100,116,139,0.55)";
  ctx.lineWidth = selected ? 5 : 2;
  roundedRect(ctx, 3, 3, TEX_W - 6, TEX_H - 6, 18);
  ctx.stroke();

  // Status bar
  ctx.fillStyle = accent;
  roundedRect(ctx, 26, 30, 150, 8, 4);
  ctx.fill();

  // Title
  ctx.fillStyle = "#f1f5f9";
  ctx.font = "bold 34px ui-sans-serif, system-ui, -apple-system, sans-serif";
  ctx.fillText(fitText(ctx, job.title, TEX_W - 60), 28, 92);

  // Company
  ctx.fillStyle = "#67e8f9";
  ctx.font = "26px ui-sans-serif, system-ui, -apple-system, sans-serif";
  ctx.fillText(fitText(ctx, job.company, TEX_W - 60), 28, 136);

  // Location
  ctx.fillStyle = "#94a3b8";
  ctx.font = "22px ui-sans-serif, system-ui, -apple-system, sans-serif";
  ctx.fillText(fitText(ctx, job.location, TEX_W - 60), 28, 174);

  // Skills preview
  ctx.fillStyle = "#64748b";
  ctx.font = "20px ui-sans-serif, system-ui, -apple-system, sans-serif";
  ctx.fillText(
    fitText(ctx, job.skills.slice(0, 4).join(" · "), TEX_W - 60),
    28,
    212,
  );

  // Status pill
  ctx.font = "bold 22px ui-sans-serif, system-ui, -apple-system, sans-serif";
  const pillText = label;
  const pillW = ctx.measureText(pillText).width + 34;
  ctx.fillStyle = `${accent}22`;
  roundedRect(ctx, 28, TEX_H - 84, pillW, 44, 22);
  ctx.fill();
  ctx.strokeStyle = `${accent}66`;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.fillText(pillText, 45, TEX_H - 53);

  // Score
  if (job.match) {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "22px ui-sans-serif, system-ui, -apple-system, sans-serif";
    const score = `${job.match.score}%`;
    const scoreW = ctx.measureText(score).width;
    ctx.fillText(score, TEX_W - scoreW - 30, TEX_H - 53);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

export default function JobCard({
  job,
  position,
  onSelect,
  selected = false,
}: JobCardProps) {
  const status = job.match?.status;
  const accent = status ? STATUS_COLOR[status] : "#64748b";
  const label = status ? STATUS_TEXT[status] : "Unchecked";

  const texture = useMemo(
    () => buildCardTexture(job, accent, label, selected),
    [job, accent, label, selected],
  );

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group position={position}>
      {/* Billboard keeps every card readable no matter where it sits. */}
      <Billboard>
        <Float speed={1.4} rotationIntensity={0.1} floatIntensity={0.45}>
          <group>
            {/* Card body */}
            <mesh>
              <boxGeometry args={[CARD_WIDTH, CARD_HEIGHT, 0.08]} />
              <meshStandardMaterial
                color={selected ? "#1e293b" : "#0b1220"}
                emissive={accent}
                emissiveIntensity={selected ? 0.3 : 0.1}
                roughness={0.4}
                metalness={0.5}
              />
            </mesh>

            {/* Textured face */}
            <mesh
              position={[0, 0, 0.045]}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(job);
              }}
              onPointerOver={() => {
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "auto";
              }}
            >
              <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
              <meshBasicMaterial map={texture} transparent toneMapped={false} />
            </mesh>
          </group>
        </Float>
      </Billboard>
    </group>
  );
}
