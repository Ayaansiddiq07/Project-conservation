"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import * as THREE from "three";

/* ─── Floating Solar Panel ─── */
function SolarPanel() {
  const groupRef = useRef<THREE.Group>(null);
  const panelRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    // Slow, organic rotation
    groupRef.current.rotation.y = Math.sin(t * 0.15) * 0.3;
    groupRef.current.rotation.x = Math.sin(t * 0.1 + 1) * 0.08 - 0.1;
    groupRef.current.position.y = Math.sin(t * 0.25) * 0.15;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Solar panel surface */}
      <mesh ref={panelRef} position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[3.2, 0.06, 2]} />
        <meshPhysicalMaterial
          color="#1a3a5c"
          metalness={0.7}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Panel grid lines */}
      {[-0.8, -0.27, 0.27, 0.8].map((x, i) => (
        <mesh key={`vline-${i}`} position={[x, 0.085, 0]}>
          <boxGeometry args={[0.01, 0.005, 2]} />
          <meshBasicMaterial color="#0a1e35" transparent opacity={0.6} />
        </mesh>
      ))}
      {[-0.5, 0, 0.5].map((z, i) => (
        <mesh key={`hline-${i}`} position={[0, 0.085, z]}>
          <boxGeometry args={[3.2, 0.005, 0.01]} />
          <meshBasicMaterial color="#0a1e35" transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Panel frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.3, 0.1, 2.1]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Mount arm */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 1, 8]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Base */}
      <mesh position={[0, -1.15, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.1, 16]} />
        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

/* ─── Star Particle Field ─── */
function StarField({ count = 200 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
      sz[i] = Math.random() * 1.5 + 0.3;
    }
    return [pos, sz];
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.005;
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.008) * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#f5deb3"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ─── Sun Glow ─── */
function SunGlow() {
  const ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current || !glowRef.current) return;
    const t = clock.getElapsedTime();
    const scale = 1 + Math.sin(t * 0.5) * 0.05;
    glowRef.current.scale.setScalar(scale);
  });

  return (
    <group position={[5, 4, -8]}>
      {/* Core */}
      <mesh ref={ref}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#fff5e0" />
      </mesh>
      {/* Inner glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.15} />
      </mesh>
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.04} />
      </mesh>
      {/* Point light */}
      <pointLight color="#f5c869" intensity={15} distance={25} decay={2} />
    </group>
  );
}

/* ─── Orbiting Ring ─── */
function OrbitRing() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.getElapsedTime() * 0.08;
    ref.current.rotation.x = 1.2;
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <torusGeometry args={[2.8, 0.008, 8, 128]} />
      <meshBasicMaterial color="#f59e0b" transparent opacity={0.2} />
    </mesh>
  );
}

/* ─── Main Scene Export ─── */
export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 1, 7], fov: 35 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />

      {/* Lighting */}
      <ambientLight intensity={0.2} color="#b8d4e8" />
      <directionalLight position={[5, 5, 3]} intensity={0.4} color="#fff5e0" />

      <fog attach="fog" args={["#000000", 8, 25]} />

      <SolarPanel />
      <StarField />
      <SunGlow />
      <OrbitRing />
    </Canvas>
  );
}
