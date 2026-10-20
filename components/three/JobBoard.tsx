"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Component, type ReactNode } from "react";
import AIOrb from "./AIOrb";
import JobCard from "./JobCard";
import type { JobWithMatch, OrbState } from "@/lib/types";

interface JobBoardProps {
  jobs: JobWithMatch[];
  orbState: OrbState;
  selectedJobId?: string | null;
  onSelect: (job: JobWithMatch) => void;
}

/**
 * Even ring of cards below the orb. Every card gets the same angular slice so
 * nothing overlaps, and a gentle wave keeps the ring alive.
 */
function layoutJob(index: number, total: number) {
  const slice = (Math.PI * 2) / Math.max(total, 1);
  const angle = index * slice + slice / 2;
  const radius = 7.8;
  const y = -1.6 + Math.sin(index * 0.8) * 0.65;

  return [
    Math.sin(angle) * radius,
    y,
    Math.cos(angle) * radius,
  ] as [number, number, number];
}

class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-full items-center justify-center p-8 text-center text-sm text-slate-400">
          WebGL is not available in this browser, so the 3D board cannot render.
          The job list and matching still work below.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function JobBoard({
  jobs,
  orbState,
  selectedJobId,
  onSelect,
}: JobBoardProps) {
  return (
    <SceneBoundary>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 2.4, 16], fov: 55 }}
      >
        <color attach="background" args={["#05070f"]} />
        <fog attach="fog" args={["#05070f", 16, 40]} />

        <ambientLight intensity={0.4} />
        <directionalLight position={[6, 10, 8]} intensity={1.1} />
        <directionalLight position={[-7, -4, -6]} intensity={0.35} color="#38bdf8" />

        <Stars radius={70} depth={25} count={1400} factor={3} fade speed={0.5} />

        <mesh rotation-x={-Math.PI / 2} position={[0, -3.4, 0]}>
          <circleGeometry args={[20, 64]} />
          <meshStandardMaterial color="#080d18" roughness={0.95} metalness={0.1} />
        </mesh>

        <AIOrb state={orbState} position={[0, 1.9, 0]} />

        {jobs.map((job, index) => (
          <JobCard
            key={job.id}
            job={job}
            position={layoutJob(index, jobs.length)}
            onSelect={onSelect}
            selected={job.id === selectedJobId}
          />
        ))}

        <OrbitControls
          enableDamping
          dampingFactor={0.06}
          minDistance={6}
          maxDistance={26}
          autoRotate={!selectedJobId}
          autoRotateSpeed={0.35}
          enablePan={false}
        />
      </Canvas>
    </SceneBoundary>
  );
}
