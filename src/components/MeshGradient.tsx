"use client";

import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import dynamic from "next/dynamic";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float elevation =
      sin(pos.x * 2.0 + uTime * 0.5) * 0.3 +
      sin(pos.y * 3.0 + uTime * 0.3) * 0.2 +
      sin(pos.x * 1.5 + pos.y * 2.0 + uTime * 0.4) * 0.15;
    pos.z += elevation;
    vElevation = elevation;

    // subtle mouse parallax
    pos.x += uMouse.x * 0.3;
    pos.y += uMouse.y * 0.3;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vec3 navy   = vec3(0.043, 0.071, 0.129);   // #0B1221
    vec3 teal   = vec3(0.176, 0.831, 0.749);   // #2DD4BF
    vec3 purple = vec3(0.388, 0.400, 0.945);   // #6366F1

    float mixFactor = vUv.x + sin(uTime * 0.2) * 0.3 + vElevation;
    vec3 color = mix(navy, teal, smoothstep(0.0, 0.6, mixFactor));
    color = mix(color, purple, smoothstep(0.4, 1.0, mixFactor + vUv.y * 0.3));
    color = mix(color, navy, 0.5); // keep it dark overall

    gl_FragColor = vec4(color, 1.0);
  }
`;

function GradientMesh({
  mouse,
}: {
  mouse: React.RefObject<{ x: number; y: number }>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    []
  );

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
    if (mouse.current) {
      uniforms.uMouse.value.x +=
        (mouse.current.x - uniforms.uMouse.value.x) * 0.05;
      uniforms.uMouse.value.y +=
        (mouse.current.y - uniforms.uMouse.value.y) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 3, 0, 0]} position={[0, 0, -2]}>
      <planeGeometry args={[12, 12, 50, 50]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function MeshGradientInner() {
  const mouse = useRef({ x: 0, y: 0 });

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    },
    []
  );

  return (
    <div className="absolute inset-0 z-0" onPointerMove={handlePointerMove}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false }}
        style={{ background: "#0B1221" }}
      >
        <GradientMesh mouse={mouse} />
      </Canvas>
    </div>
  );
}

// Dynamic export with SSR disabled for Three.js compatibility
const MeshGradient = dynamic(() => Promise.resolve(MeshGradientInner), {
  ssr: false,
});

export default MeshGradient;
