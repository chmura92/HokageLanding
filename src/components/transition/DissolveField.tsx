"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
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

const CONNECTION_DISTANCE = IS_MOBILE ? 1.2 : 1.6;
const CONNECTION_DISTANCE_SQ = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
const MAX_BONDS_PER_PARTICLE = 3;
const MAX_CONNECTIONS = PARTICLE_COUNT * MAX_BONDS_PER_PARTICLE;

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
  varying float vLocalY;

  void main() {
    vColor = aColor;
    vLocalY = position.y;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (60.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const pointFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vLocalY;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float core = 1.0 - smoothstep(0.08, 0.18, dist);
    float halo = (1.0 - smoothstep(0.18, 0.50, dist)) * 0.22;
    float shape = core + halo;

    // Normalize local Y from band-bottom (0) to band-top (1).
    // SPREAD_Y is [-3, 3] so we map that to [0, 1].
    float localY01 = clamp((vLocalY + 3.0) / 6.0, 0.0, 1.0);

    // Dissolve: 0 at the bottom third, 1 by the top.
    float dissolve = smoothstep(0.0, 0.65, localY01);

    float alpha = shape * dissolve * 0.6;

    gl_FragColor = vec4(vColor, alpha);
  }
`;

const lineVertexShader = /* glsl */ `
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vLocalY;

  void main() {
    vColor = aColor;
    vLocalY = position.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const lineFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vLocalY;

  void main() {
    float localY01 = clamp((vLocalY + 3.0) / 6.0, 0.0, 1.0);
    // Bonds fade earlier than dots: start fading at 0.1, fully opaque only at 0.75.
    float dissolve = smoothstep(0.1, 0.75, localY01);
    float alpha = dissolve * 0.25;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

interface ParticleState {
  positions: Float32Array;
  baseVel: Float32Array;
  sizes: Float32Array;
  colors: Float32Array;
  linePositions: Float32Array;
  lineColors: Float32Array;
}

function seedParticleState(): ParticleState {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const baseVel = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const colors = new Float32Array(PARTICLE_COUNT * 3);

  // Line buffers: each bond = 2 vertices × 3 floats position + 3 floats color
  const linePositions = new Float32Array(MAX_CONNECTIONS * 2 * 3);
  const lineColors = new Float32Array(MAX_CONNECTIONS * 2 * 3);

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

  return { positions, baseVel, sizes, colors, linePositions, lineColors };
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

  const lineGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(state.linePositions, 3),
    );
    g.setAttribute("aColor", new THREE.BufferAttribute(state.lineColors, 3));
    g.setDrawRange(0, 0);
    return g;
  }, [state]);

  const lineMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: lineVertexShader,
        fragmentShader: lineFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  const bondCountsRef = useRef<Uint8Array | null>(null);
  if (bondCountsRef.current === null) {
    bondCountsRef.current = new Uint8Array(PARTICLE_COUNT);
  }
  const bondCounts = bondCountsRef.current;

  useFrame(() => {
    const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;

    // 1. Advance particles, respawn off-bottom.
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3] += state.baseVel[i3];
      positions[i3 + 1] += state.baseVel[i3 + 1];

      if (positions[i3 + 1] < SPREAD_Y_BOTTOM) {
        positions[i3] = (Math.random() - 0.5) * SPREAD_X;
        positions[i3 + 1] = SPREAD_Y_TOP;
        positions[i3 + 2] = (Math.random() - 0.5) * SPREAD_Z;
      }
    }
    posAttr.needsUpdate = true;

    // 2. Rebuild bonds — O(n²) is fine at n=80.
    bondCounts.fill(0);
    const linePosAttr = lineGeometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    const lineColAttr = lineGeometry.getAttribute(
      "aColor",
    ) as THREE.BufferAttribute;
    const linePos = linePosAttr.array as Float32Array;
    const lineCol = lineColAttr.array as Float32Array;
    let write = 0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      if (bondCounts[i] >= MAX_BONDS_PER_PARTICLE) continue;
      const i3 = i * 3;
      const ax = positions[i3];
      const ay = positions[i3 + 1];
      const az = positions[i3 + 2];
      const acR = state.colors[i3];
      const acG = state.colors[i3 + 1];
      const acB = state.colors[i3 + 2];

      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        if (bondCounts[j] >= MAX_BONDS_PER_PARTICLE) continue;
        const j3 = j * 3;
        const dx = ax - positions[j3];
        const dy = ay - positions[j3 + 1];
        const dz = az - positions[j3 + 2];
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > CONNECTION_DISTANCE_SQ) continue;

        // Write line segment A → B.
        linePos[write * 6 + 0] = ax;
        linePos[write * 6 + 1] = ay;
        linePos[write * 6 + 2] = az;
        linePos[write * 6 + 3] = positions[j3];
        linePos[write * 6 + 4] = positions[j3 + 1];
        linePos[write * 6 + 5] = positions[j3 + 2];

        lineCol[write * 6 + 0] = acR;
        lineCol[write * 6 + 1] = acG;
        lineCol[write * 6 + 2] = acB;
        lineCol[write * 6 + 3] = state.colors[j3];
        lineCol[write * 6 + 4] = state.colors[j3 + 1];
        lineCol[write * 6 + 5] = state.colors[j3 + 2];

        bondCounts[i]++;
        bondCounts[j]++;
        write++;
        if (write >= MAX_CONNECTIONS) break;
        if (bondCounts[i] >= MAX_BONDS_PER_PARTICLE) break;
      }
      if (write >= MAX_CONNECTIONS) break;
    }

    linePosAttr.needsUpdate = true;
    lineColAttr.needsUpdate = true;
    lineGeometry.setDrawRange(0, write * 2);
  });

  return (
    <>
      <points geometry={geometry} material={material} />
      <lineSegments geometry={lineGeometry} material={lineMaterial} />
    </>
  );
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
