"use client";

import { useRef, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import dynamic from "next/dynamic";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PARTICLE_COUNT = 300;
const MAX_CONNECTIONS = 800; // max line segments (each = 2 vertices)
const CONNECTION_DISTANCE = 1.6; // distance threshold for connection lines
const CONNECTION_DISTANCE_SQ = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
const MOUSE_RADIUS = 2.0; // radius of mouse influence
const MOUSE_FORCE = 0.08; // strength of repulsion
const DAMPING = 0.96; // velocity damping per frame
const AMBIENT_SPEED = 0.15; // subtle idle drift speed
const SPREAD_X = 8; // particle field width
const SPREAD_Y = 5; // particle field height
const SPREAD_Z = 3; // particle field depth
const RETURN_STRENGTH = 0.002; // how strongly particles return home

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
    vDepth = -mvPosition.z; // positive = further away
    // Size attenuation: larger when closer
    gl_PointSize = aSize * (120.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const pointFragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vDepth;

  void main() {
    // Circular point sprite
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    // Soft glow falloff
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    // Depth-based opacity: closer = brighter
    float depthFade = clamp(1.0 - (vDepth - 3.0) / 6.0, 0.15, 0.7);
    alpha *= depthFade * 0.3;

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
// Color palette helpers
// ---------------------------------------------------------------------------

const COLOR_WHITE = new THREE.Color(0.9, 0.92, 0.95);
const COLOR_LIGHT_BLUE = new THREE.Color(0.7, 0.85, 1.0);
const COLOR_TEAL = new THREE.Color(0.176, 0.831, 0.749); // #2DD4BF
const COLOR_PURPLE = new THREE.Color(0.388, 0.4, 0.945); // #6366F1
const LINE_COLOR = new THREE.Color(0.5, 0.6, 0.75);

function pickParticleColor(rng: number): THREE.Color {
  if (rng < 0.5) return COLOR_WHITE.clone();
  if (rng < 0.8) return COLOR_LIGHT_BLUE.clone();
  if (rng < 0.92) return COLOR_TEAL.clone();
  return COLOR_PURPLE.clone();
}

// ---------------------------------------------------------------------------
// Particle System Component
// ---------------------------------------------------------------------------

interface ParticleMouseRef {
  x: number;
  y: number;
  active: boolean;
}

function ParticleField({
  mouse,
}: {
  mouse: React.RefObject<ParticleMouseRef>;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { camera } = useThree();

  // Pre-allocate typed arrays for particle state
  const state = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const homePositions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const phases = new Float32Array(PARTICLE_COUNT); // per-particle phase offset

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

      // Size: 0.5 to 1.8 range (used as base for shader attenuation)
      sizes[i] = 0.5 + Math.random() * 1.3;

      // Color
      const col = pickParticleColor(Math.random());
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;

      // Random phase offset for ambient motion
      phases[i] = Math.random() * Math.PI * 2;
    }

    return { positions, homePositions, velocities, sizes, colors, phases };
  }, []);

  // Points geometry
  const pointsGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(state.positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(state.sizes, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(state.colors, 3));
    return geo;
  }, [state]);

  // Points material
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

  // Lines geometry — pre-allocate max capacity
  const linesState = useMemo(() => {
    const linePositions = new Float32Array(MAX_CONNECTIONS * 2 * 3);
    const lineColors = new Float32Array(MAX_CONNECTIONS * 2 * 3);
    const lineAlphas = new Float32Array(MAX_CONNECTIONS * 2);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(linePositions, 3).setUsage(
        THREE.DynamicDrawUsage,
      ),
    );
    geo.setAttribute(
      "aLineColor",
      new THREE.BufferAttribute(lineColors, 3).setUsage(
        THREE.DynamicDrawUsage,
      ),
    );
    geo.setAttribute(
      "aLineAlpha",
      new THREE.BufferAttribute(lineAlphas, 1).setUsage(
        THREE.DynamicDrawUsage,
      ),
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

  // Smoothed mouse in world coords
  const smoothMouse = useRef(new THREE.Vector3(0, 0, 0));

  // Animation loop
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05); // clamp delta to avoid jumps
    const time = performance.now() * 0.001;

    const pos = state.positions;
    const home = state.homePositions;
    const vel = state.velocities;
    const phases = state.phases;
    const mouseRef = mouse.current;

    // --- Mouse world position ---
    // Convert normalized mouse [-1,1] to a world-space point on a plane at z=0
    if (mouseRef && mouseRef.active) {
      const mouseNDC = new THREE.Vector3(mouseRef.x, mouseRef.y, 0.5);
      mouseNDC.unproject(camera);
      const dir = mouseNDC.sub(camera.position).normalize();
      const t = -camera.position.z / dir.z;
      const worldMouse = camera.position
        .clone()
        .add(dir.multiplyScalar(t));

      smoothMouse.current.lerp(worldMouse, 0.12);
    }

    const mx = smoothMouse.current.x;
    const my = smoothMouse.current.y;
    const mouseActive = mouseRef ? mouseRef.active : false;

    // --- Update each particle ---
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Ambient drift
      const phase = phases[i];
      const ambientX =
        Math.sin(time * 0.3 + phase) * AMBIENT_SPEED * dt;
      const ambientY =
        Math.cos(time * 0.25 + phase * 1.3) * AMBIENT_SPEED * dt;
      const ambientZ =
        Math.sin(time * 0.2 + phase * 0.7) * AMBIENT_SPEED * 0.3 * dt;

      vel[i3] += ambientX;
      vel[i3 + 1] += ambientY;
      vel[i3 + 2] += ambientZ;

      // Mouse repulsion (only xy plane distance)
      if (mouseActive) {
        const dx = pos[i3] - mx;
        const dy = pos[i3 + 1] - my;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);
        if (dist < MOUSE_RADIUS && dist > 0.01) {
          const force = (1.0 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
          vel[i3] += (dx / dist) * force;
          vel[i3 + 1] += (dy / dist) * force;
        }
      }

      // Return-to-home force (gentle spring)
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

    // Flag position attribute for GPU upload
    const posAttr = pointsGeometry.getAttribute("position");
    (posAttr as THREE.BufferAttribute).needsUpdate = true;

    // --- Connection lines ---
    const lp = linesState.linePositions;
    const lc = linesState.lineColors;
    const la = linesState.lineAlphas;
    let lineIdx = 0;

    for (let i = 0; i < PARTICLE_COUNT && lineIdx < MAX_CONNECTIONS; i++) {
      const i3 = i * 3;
      const ix = pos[i3];
      const iy = pos[i3 + 1];
      const iz = pos[i3 + 2];

      for (
        let j = i + 1;
        j < PARTICLE_COUNT && lineIdx < MAX_CONNECTIONS;
        j++
      ) {
        const j3 = j * 3;
        const dx = ix - pos[j3];
        const dy = iy - pos[j3 + 1];
        const dz = iz - pos[j3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < CONNECTION_DISTANCE_SQ) {
          const v = lineIdx * 6; // 2 vertices * 3 components
          const a = lineIdx * 2; // 2 alpha values

          lp[v] = ix;
          lp[v + 1] = iy;
          lp[v + 2] = iz;
          lp[v + 3] = pos[j3];
          lp[v + 4] = pos[j3 + 1];
          lp[v + 5] = pos[j3 + 2];

          // Fade alpha based on distance — closer = more opaque
          const ratio = distSq / CONNECTION_DISTANCE_SQ;
          const alpha = (1.0 - ratio) * 0.06;

          lc[v] = LINE_COLOR.r;
          lc[v + 1] = LINE_COLOR.g;
          lc[v + 2] = LINE_COLOR.b;
          lc[v + 3] = LINE_COLOR.r;
          lc[v + 4] = LINE_COLOR.g;
          lc[v + 5] = LINE_COLOR.b;

          la[a] = alpha;
          la[a + 1] = alpha;

          lineIdx++;
        }
      }
    }

    // Update draw range and flag attributes
    linesState.geo.setDrawRange(0, lineIdx * 2);
    const lPosAttr = linesState.geo.getAttribute("position");
    (lPosAttr as THREE.BufferAttribute).needsUpdate = true;
    const lColAttr = linesState.geo.getAttribute("aLineColor");
    (lColAttr as THREE.BufferAttribute).needsUpdate = true;
    const lAlphaAttr = linesState.geo.getAttribute("aLineAlpha");
    (lAlphaAttr as THREE.BufferAttribute).needsUpdate = true;
  });

  // Cleanup geometries on unmount
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
      <lineSegments
        ref={linesRef}
        geometry={linesState.geo}
        material={linesMaterial}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Wrapper (same structure as original for Hero.tsx compatibility)
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

// Dynamic export with SSR disabled for Three.js compatibility
const MeshGradient = dynamic(() => Promise.resolve(MeshGradientInner), {
  ssr: false,
});

export default MeshGradient;
