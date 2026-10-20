"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { OrbState } from "@/lib/types";

const PARTICLE_COUNT = 56;

const PALETTE: Record<OrbState, { core: string; glow: string; ring: string }> = {
  idle: { core: "#22d3ee", glow: "#0e7490", ring: "#67e8f9" },
  thinking: { core: "#a78bfa", glow: "#6d28d9", ring: "#c4b5fd" },
  eligible: { core: "#34d399", glow: "#047857", ring: "#6ee7b7" },
  not_eligible: { core: "#fb7185", glow: "#9f1239", ring: "#fda4af" },
};

interface AIOrbProps {
  state: OrbState;
  position?: [number, number, number];
}

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
}

export default function AIOrb({ state, position = [0, 0, 0] }: AIOrbProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const spinnerRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const burstRef = useRef<THREE.InstancedMesh>(null);

  const burstAge = useRef(99);
  const shakeSeed = useRef(0);

  const palette = PALETTE[state];

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: PARTICLE_COUNT }, () => ({
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        life: 0,
      })),
    [],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Kick off a green burst whenever the orb becomes eligible.
  useEffect(() => {
    if (state === "eligible") {
      burstAge.current = 0;
      shakeSeed.current = Math.random() * 10;
      particles.forEach((particle) => {
        const direction = new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5,
        )
          .normalize()
          .multiplyScalar(2.2 + Math.random() * 2.6);
        particle.position.set(0, 0, 0);
        particle.velocity.copy(direction);
        particle.life = 1;
      });
    }
  }, [state, particles]);

  useFrame((rootState, delta) => {
    const t = rootState.clock.elapsedTime;
    const step = Math.min(delta, 0.05);
    burstAge.current += step;

    // Spinner rotation: fast while thinking, slow drift otherwise.
    if (spinnerRef.current) {
      const speed = state === "thinking" ? 3.2 : 0.45;
      spinnerRef.current.rotation.y += step * speed;
      spinnerRef.current.rotation.x = Math.sin(t * 0.8) * 0.25;
    }

    // Core scale.
    if (coreRef.current) {
      let scale = 1;
      if (state === "idle") {
        scale = 1 + 0.09 * Math.sin(t * 2.2);
      } else if (state === "thinking") {
        scale = 1 + 0.06 * Math.sin(t * 7);
      } else if (state === "eligible") {
        const age = burstAge.current;
        scale = 1 + 0.45 * Math.exp(-3.2 * age) * Math.abs(Math.sin(age * 14));
        if (age > 2.5) scale = 1.05;
      } else if (state === "not_eligible") {
        scale = 1 + 0.04 * Math.sin(t * 12);
      }
      coreRef.current.scale.setScalar(scale);

      // Red shake for "not eligible".
      if (state === "not_eligible") {
        const amplitude = 0.11 * Math.exp(-1.2 * burstAge.current) + 0.02;
        coreRef.current.position.x = Math.sin(t * 46 + shakeSeed.current) * amplitude;
        coreRef.current.position.y = Math.cos(t * 39 + shakeSeed.current) * amplitude * 0.4;
      } else {
        coreRef.current.position.x = 0;
        coreRef.current.position.y = 0;
      }
    }

    // Pulsing halo.
    if (haloRef.current) {
      const haloScale = 1.25 + 0.12 * Math.sin(t * 2.2);
      haloRef.current.scale.setScalar(haloScale);
      const material = haloRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.16 + 0.08 * Math.sin(t * 2.2);
    }

    // Expanding shockwave ring on the green burst.
    if (ringRef.current) {
      const age = burstAge.current;
      if (state === "eligible" && age < 1.4) {
        const progress = age / 1.4;
        ringRef.current.visible = true;
        ringRef.current.scale.setScalar(0.6 + progress * 4.2);
        (ringRef.current.material as THREE.MeshBasicMaterial).opacity =
          0.65 * (1 - progress);
      } else {
        ringRef.current.visible = false;
      }
    }

    // Light follows the core colour.
    if (lightRef.current) {
      lightRef.current.intensity =
        state === "eligible"
          ? 3.2 + 2.5 * Math.exp(-3.2 * burstAge.current)
          : state === "thinking"
            ? 2.2
            : 1.6;
    }

    // Burst particles.
    if (burstRef.current) {
      particles.forEach((particle, index) => {
        if (particle.life > 0) {
          particle.life -= step * 0.9;
          particle.velocity.multiplyScalar(0.97);
          particle.position.addScaledVector(particle.velocity, step);
        } else {
          particle.position.set(0, 0, 0);
        }
        dummy.position.copy(particle.position);
        const scale = Math.max(particle.life, 0) * 0.9;
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        burstRef.current!.setMatrixAt(index, dummy.matrix);
      });
      burstRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group position={position}>
      <group ref={spinnerRef}>
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[0.8, 3]} />
          <meshStandardMaterial
            color={palette.core}
            emissive={palette.glow}
            emissiveIntensity={1.4}
            roughness={0.25}
            metalness={0.15}
          />
        </mesh>

        <mesh ref={haloRef}>
          <icosahedronGeometry args={[1.15, 2]} />
          <meshBasicMaterial
            color={palette.ring}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      <pointLight
        ref={lightRef}
        color={palette.core}
        intensity={1.8}
        distance={8}
        decay={2}
      />

      <mesh ref={ringRef} visible={false} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1, 1.22, 48]} />
        <meshBasicMaterial
          color={palette.ring}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <instancedMesh ref={burstRef} args={[undefined, undefined, PARTICLE_COUNT]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial color={palette.ring} transparent opacity={0.9} />
      </instancedMesh>
    </group>
  );
}
