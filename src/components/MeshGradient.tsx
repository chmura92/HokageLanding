"use client";

import { useRef, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import dynamic from "next/dynamic";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const IS_MOBILE = typeof window !== "undefined" && window.innerWidth < 768;
const PARTICLE_COUNT = IS_MOBILE ? 150 : 300;
const MAX_CONNECTIONS = 600;
const CONNECTION_DISTANCE = 1.4;
const CONNECTION_DISTANCE_SQ = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
const MAX_BONDS_PER_PARTICLE = 4;
const MOUSE_RADIUS = 3.0;
const MOUSE_FORCE = 0.035;
const DAMPING = 0.97;
const AMBIENT_SPEED = 0.12;
const SPREAD_X = 8;
const SPREAD_Y = 5;
const SPREAD_Z = 2.5;
const RETURN_STRENGTH = 0.003;

// ---------------------------------------------------------------------------
// Shaders
// ---------------------------------------------------------------------------

const pointVertexShader = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vDepth;

  void main() {
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mvPosition.z;
    gl_PointSize = aSize * (120.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const pointFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vDepth;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    float depthFade = clamp(1.0 - (vDepth - 3.0) / 6.0, 0.15, 0.8);
    alpha *= depthFade * 0.4;

    gl_FragColor = vec4(vColor, alpha);
  }
`;

const lineVertexShader = /* glsl */ `
  attribute vec3 aLineColor;
  attribute float aLineAlpha;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aLineColor;
    vAlpha = aLineAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const lineFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(vColor, vAlpha);
  }
`;

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const COLOR_WHITE = new THREE.Color(0.9, 0.92, 0.95);
const COLOR_LIGHT_BLUE = new THREE.Color(0.7, 0.85, 1.0);
const COLOR_TEAL = new THREE.Color(0.176, 0.831, 0.749);
const COLOR_PURPLE = new THREE.Color(0.388, 0.4, 0.945);
const LINE_COLOR_IDLE = new THREE.Color(0.4, 0.55, 0.7);
const LINE_COLOR_ACTIVE = new THREE.Color(0.45, 0.7, 0.85);

function pickParticleColor(rng: number): THREE.Color {
  if (rng < 0.45) return COLOR_WHITE.clone();
  if (rng < 0.75) return COLOR_LIGHT_BLUE.clone();
  if (rng < 0.9) return COLOR_TEAL.clone();
  return COLOR_PURPLE.clone();
}

// ---------------------------------------------------------------------------
// Particle System
// ---------------------------------------------------------------------------

interface ParticleMouseRef {
  x: number;
  y: number;
  active: boolean;
}

function ParticleField({ mouse }: { mouse: React.RefObject<ParticleMouseRef> }) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { camera } = useThree();

  const state = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const homePositions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const phases = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * SPREAD_X;
      const y = (Math.random() - 0.5) * SPREAD_Y;
      const z = (Math.random() - 0.5) * SPREAD_Z;
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      homePositions[i3] = x;
      homePositions[i3 + 1] = y;
      homePositions[i3 + 2] = z;
      velocities[i3] = 0;
      velocities[i3 + 1] = 0;
      velocities[i3 + 2] = 0;

      // Vary sizes more: some larger "atoms", most smaller
      const sizeRng = Math.random();
      sizes[i] = sizeRng < 0.1 ? 1.8 + Math.random() * 1.0 : 0.4 + Math.random() * 1.0;

      const col = pickParticleColor(Math.random());
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
      phases[i] = Math.random() * Math.PI * 2;
    }

    return { positions, homePositions, velocities, sizes, colors, phases };
  }, []);

  const pointsGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(state.positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(state.sizes, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(state.colors, 3));
    return geo;
  }, [state]);

  const pointsMaterial = useMemo(
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

  const linesState = useMemo(() => {
    const linePositions = new Float32Array(MAX_CONNECTIONS * 2 * 3);
    const lineColors = new Float32Array(MAX_CONNECTIONS * 2 * 3);
    const lineAlphas = new Float32Array(MAX_CONNECTIONS * 2);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage),
    );
    geo.setAttribute(
      "aLineColor",
      new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage),
    );
    geo.setAttribute(
      "aLineAlpha",
      new THREE.BufferAttribute(lineAlphas, 1).setUsage(THREE.DynamicDrawUsage),
    );
    geo.setDrawRange(0, 0);
    return { linePositions, lineColors, lineAlphas, geo };
  }, []);

  const linesMaterial = useMemo(
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

  const smoothMouse = useRef(new THREE.Vector3(0, 0, 0));
  const bondCounts = useMemo(() => new Uint8Array(PARTICLE_COUNT), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const time = performance.now() * 0.001;

    const pos = state.positions;
    const home = state.homePositions;
    const vel = state.velocities;
    const phases = state.phases;
    const mouseRef = mouse.current;

    // Mouse world position
    if (mouseRef && mouseRef.active) {
      const mouseNDC = new THREE.Vector3(mouseRef.x, mouseRef.y, 0.5);
      mouseNDC.unproject(camera);
      const dir = mouseNDC.sub(camera.position).normalize();
      const t = -camera.position.z / dir.z;
      const worldMouse = camera.position.clone().add(dir.multiplyScalar(t));
      smoothMouse.current.lerp(worldMouse, 0.08);
    }

    const mx = smoothMouse.current.x;
    const my = smoothMouse.current.y;
    const mouseActive = mouseRef ? mouseRef.active : false;

    // Update particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Ambient drift
      const phase = phases[i];
      vel[i3] += Math.sin(time * 0.3 + phase) * AMBIENT_SPEED * dt;
      vel[i3 + 1] += Math.cos(time * 0.25 + phase * 1.3) * AMBIENT_SPEED * dt;
      vel[i3 + 2] += Math.sin(time * 0.2 + phase * 0.7) * AMBIENT_SPEED * 0.2 * dt;

      // Mouse ATTRACTION (particles follow cursor)
      if (mouseActive) {
        const dx = mx - pos[i3];
        const dy = my - pos[i3 + 1];
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);
        if (dist < MOUSE_RADIUS && dist > 0.01) {
          const strength = (1.0 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
          vel[i3] += (dx / dist) * strength;
          vel[i3 + 1] += (dy / dist) * strength;
        }
      }

      // Return to home
      vel[i3] += (home[i3] - pos[i3]) * RETURN_STRENGTH;
      vel[i3 + 1] += (home[i3 + 1] - pos[i3 + 1]) * RETURN_STRENGTH;
      vel[i3 + 2] += (home[i3 + 2] - pos[i3 + 2]) * RETURN_STRENGTH;

      // Damping
      vel[i3] *= DAMPING;
      vel[i3 + 1] *= DAMPING;
      vel[i3 + 2] *= DAMPING;

      // Update position
      pos[i3] += vel[i3];
      pos[i3 + 1] += vel[i3 + 1];
      pos[i3 + 2] += vel[i3 + 2];
    }

    const posAttr = pointsGeometry.getAttribute("position");
    (posAttr as THREE.BufferAttribute).needsUpdate = true;

    // Connection lines with bond limit
    const lp = linesState.linePositions;
    const lc = linesState.lineColors;
    const la = linesState.lineAlphas;
    let lineIdx = 0;

    bondCounts.fill(0);

    for (let i = 0; i < PARTICLE_COUNT && lineIdx < MAX_CONNECTIONS; i++) {
      if (bondCounts[i] >= MAX_BONDS_PER_PARTICLE) continue;

      const i3 = i * 3;
      const ix = pos[i3];
      const iy = pos[i3 + 1];
      const iz = pos[i3 + 2];

      for (let j = i + 1; j < PARTICLE_COUNT && lineIdx < MAX_CONNECTIONS; j++) {
        if (bondCounts[j] >= MAX_BONDS_PER_PARTICLE) continue;

        const j3 = j * 3;
        const dx = ix - pos[j3];
        const dy = iy - pos[j3 + 1];
        const dz = iz - pos[j3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < CONNECTION_DISTANCE_SQ) {
          const v = lineIdx * 6;
          const a = lineIdx * 2;

          lp[v] = ix;
          lp[v + 1] = iy;
          lp[v + 2] = iz;
          lp[v + 3] = pos[j3];
          lp[v + 4] = pos[j3 + 1];
          lp[v + 5] = pos[j3 + 2];

          // Proximity to mouse affects line brightness
          const midX = (ix + pos[j3]) * 0.5;
          const midY = (iy + pos[j3 + 1]) * 0.5;
          const mouseDist = Math.sqrt((midX - mx) * (midX - mx) + (midY - my) * (midY - my));
          const mouseInfluence = mouseActive ? Math.max(0, 1.0 - mouseDist / MOUSE_RADIUS) : 0;

          const ratio = distSq / CONNECTION_DISTANCE_SQ;
          const baseAlpha = (1.0 - ratio) * 0.08;
          const alpha = baseAlpha + mouseInfluence * 0.06;

          const lineColor = mouseInfluence > 0.3 ? LINE_COLOR_ACTIVE : LINE_COLOR_IDLE;
          lc[v] = lineColor.r;
          lc[v + 1] = lineColor.g;
          lc[v + 2] = lineColor.b;
          lc[v + 3] = lineColor.r;
          lc[v + 4] = lineColor.g;
          lc[v + 5] = lineColor.b;

          la[a] = alpha;
          la[a + 1] = alpha;

          bondCounts[i]++;
          bondCounts[j]++;
          lineIdx++;
        }
      }
    }

    linesState.geo.setDrawRange(0, lineIdx * 2);
    (linesState.geo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    (linesState.geo.getAttribute("aLineColor") as THREE.BufferAttribute).needsUpdate = true;
    (linesState.geo.getAttribute("aLineAlpha") as THREE.BufferAttribute).needsUpdate = true;
  });

  useEffect(() => {
    return () => {
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      linesState.geo.dispose();
      linesMaterial.dispose();
    };
  }, [pointsGeometry, pointsMaterial, linesState.geo, linesMaterial]);

  return (
    <>
      <points ref={pointsRef} geometry={pointsGeometry} material={pointsMaterial} />
      <lineSegments ref={linesRef} geometry={linesState.geo} material={linesMaterial} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

function MeshGradientInner() {
  const mouse = useRef<ParticleMouseRef>({ x: 0, y: 0, active: false });

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.current.active = true;
    },
    [],
  );

  const handlePointerLeave = useCallback(() => {
    mouse.current.active = false;
  }, []);

  return (
    <div
      className="absolute inset-0 z-0"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false }}
        style={{ background: "#0B1221" }}
      >
        <ParticleField mouse={mouse} />
      </Canvas>
    </div>
  );
}

const MeshGradient = dynamic(() => Promise.resolve(MeshGradientInner), {
  ssr: false,
});

export default MeshGradient;
