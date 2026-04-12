"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

const IS_MOBILE =
  typeof window !== "undefined" && window.innerWidth < 768;
const PARTICLE_COUNT = IS_MOBILE ? 40 : 80;

// Match hero's flow direction so the continuity reads as one system.
const FLOW_BASE_Y = -0.010;
const FLOW_BASE_X = -0.0025;

// Spawn/respawn volume — tuned to fill the band at camera z=6, fov=50.
const SPREAD_X = 8;
const SPREAD_Y_TOP = 3.0;      // local y for spawn top
const SPREAD_Y_BOTTOM = -3.0;  // local y for respawn trigger
const SPREAD_Z = 2.0;

const COLOR_WHITE = new THREE.Color(0.9, 0.92, 0.95);
const COLOR_LIGHT_BLUE = new THREE.Color(0.7, 0.85, 1.0);
const COLOR_TEAL = new THREE.Color(0.176, 0.831, 0.749);
const COLOR_PURPLE = new THREE.Color(0.388, 0.4, 0.945);

function pickParticleColor(rng: number): THREE.Color {
  if (rng < 0.45) return COLOR_WHITE;
  if (rng < 0.8) return COLOR_LIGHT_BLUE;
  if (rng < 0.92) return COLOR_TEAL;
  return COLOR_PURPLE;
}

const pointVertexShader = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;

  void main() {
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (60.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const pointFragmentShader = /* glsl */ `
  varying vec3 vColor;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float core = 1.0 - smoothstep(0.08, 0.18, dist);
    float halo = (1.0 - smoothstep(0.18, 0.50, dist)) * 0.22;
    float alpha = core + halo;

    gl_FragColor = vec4(vColor, alpha * 0.6);
  }
`;

interface ParticleState {
  positions: Float32Array;
  baseVel: Float32Array;
  sizes: Float32Array;
  colors: Float32Array;
}

function seedParticleState(): ParticleState {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const baseVel = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const colors = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * SPREAD_X;
    positions[i3 + 1] =
      SPREAD_Y_BOTTOM + Math.random() * (SPREAD_Y_TOP - SPREAD_Y_BOTTOM);
    positions[i3 + 2] = (Math.random() - 0.5) * SPREAD_Z;

    const speedMul = 0.7 + Math.random() * 0.6;
    baseVel[i3] = FLOW_BASE_X * speedMul;
    baseVel[i3 + 1] = FLOW_BASE_Y * speedMul;
    baseVel[i3 + 2] = 0;

    const sizeRng = Math.random();
    if (sizeRng < 0.06) {
      sizes[i] = 2.0 + Math.random() * 1.0;
    } else if (sizeRng < 0.3) {
      sizes[i] = 1.1 + Math.random() * 0.5;
    } else {
      sizes[i] = 0.55 + Math.random() * 0.4;
    }

    const col = pickParticleColor(Math.random());
    colors[i3] = col.r;
    colors[i3 + 1] = col.g;
    colors[i3 + 2] = col.b;
  }

  return { positions, baseVel, sizes, colors };
}

function ParticleField() {
  const state = useMemo(() => seedParticleState(), []);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(state.positions, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(state.colors, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(state.sizes, 1));
    return g;
  }, [state]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: pointVertexShader,
        fragmentShader: pointFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useFrame(() => {
    const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3] += state.baseVel[i3];
      positions[i3 + 1] += state.baseVel[i3 + 1];

      // Respawn at top when falling off the bottom.
      if (positions[i3 + 1] < SPREAD_Y_BOTTOM) {
        positions[i3] = (Math.random() - 0.5) * SPREAD_X;
        positions[i3 + 1] = SPREAD_Y_TOP;
        positions[i3 + 2] = (Math.random() - 0.5) * SPREAD_Z;
      }
    }

    posAttr.needsUpdate = true;
  });

  return <points geometry={geometry} material={material} />;
}

export default function DissolveField() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ParticleField />
    </Canvas>
  );
}
