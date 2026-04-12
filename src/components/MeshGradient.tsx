"use client";

import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import dynamic from "next/dynamic";

// ---------------------------------------------------------------------------
// Silk mesh gradient — fullscreen fragment shader.
// Domain-warped value-noise FBM, 4-stop dark→cyan palette, mouse-warp uniform,
// soft vignette, fine film grain. No geometry, no particles, no lines.
// ---------------------------------------------------------------------------

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // Bypass camera projection — fill NDC directly.
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec2  uMouse;        // 0..1 in viewport space — always live

  // ---------- Hash & value noise ----------
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * vnoise(p);
      p  = p * 2.02 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * 2.4;
    vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0) * 2.4;

    float t = uTime * 0.06;

    // ---- Mouse warp: gentle pull of the noise field toward cursor ----
    vec2 toMouse = p - m;
    float dM = length(toMouse);
    float warp = exp(-dM * dM * 0.45);
    p -= toMouse * warp * 0.28;

    // ---- Domain-warped FBM (Inigo Quilez style) ----
    vec2 q = vec2(
      fbm(p + vec2(0.0,  t)),
      fbm(p + vec2(5.2, -t))
    );
    vec2 r = vec2(
      fbm(p + q * 1.6 + vec2(1.7,  9.2) + t * 0.5),
      fbm(p + q * 1.6 + vec2(8.3,  2.8) - t * 0.5)
    );
    float d = fbm(p * 0.9 + r * 1.4 + t * 0.3);

    // Push contrast so most of the screen sits dark with rare highlights
    d = smoothstep(0.18, 0.95, d);

    // Soft luminous lift in the cursor's neighborhood
    float lift = exp(-dM * dM * 0.6) * 0.28;
    d = clamp(d + lift, 0.0, 1.0);

    // ---- 4-stop palette: near-black → indigo → mid blue → cyan-white ----
    vec3 col0 = vec3(0.025, 0.038, 0.068);
    vec3 col1 = vec3(0.062, 0.088, 0.190);
    vec3 col2 = vec3(0.140, 0.260, 0.470);
    vec3 col3 = vec3(0.560, 0.790, 0.960);

    vec3 color = mix(col0, col1, smoothstep(0.00, 0.40, d));
    color      = mix(color, col2, smoothstep(0.40, 0.72, d));
    color      = mix(color, col3, smoothstep(0.78, 0.98, d));

    // ---- Vignette: darken edges, protect the headline area a touch ----
    vec2 vc = uv - 0.5;
    float vig = 1.0 - smoothstep(0.42, 1.05, length(vc * vec2(1.25, 1.55)));
    vig = pow(vig, 1.4);
    color *= mix(0.55, 1.0, vig);

    // ---- Fine film grain (animated) ----
    float g = hash(gl_FragCoord.xy * 0.5 + vec2(uTime * 31.0, uTime * 17.0));
    color += (g - 0.5) * 0.022;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ---------------------------------------------------------------------------

interface MouseRef {
  x: number; // 0..1, relative to canvas wrapper
  y: number; // 0..1
}

function SilkPlane({ mouse }: { mouse: React.RefObject<MouseRef> }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width || 1, size.height || 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    // Mutated in place — never re-create, or React will recompile the shader.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    uniforms.uResolution.value.set(size.width, size.height);
  }, [size.width, size.height, uniforms]);

  // Smoothed mouse — buttery 60fps response without raw jitter.
  const smoothed = useRef({ x: 0.5, y: 0.5 });

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    const m = mouse.current;
    if (!m) return;
    smoothed.current.x += (m.x - smoothed.current.x) * 0.12;
    smoothed.current.y += (m.y - smoothed.current.y) * 0.12;
    uniforms.uMouse.value.set(smoothed.current.x, smoothed.current.y);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------

function MeshGradientInner() {
  const mouse = useRef<MouseRef>({ x: 0.5, y: 0.5 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cachedRect = useRef<DOMRect | null>(null);

  // Pause Canvas entirely when hero scrolls out of view.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const refreshRect = () => {
      cachedRect.current = el.getBoundingClientRect();
    };
    refreshRect();

    const ro = new ResizeObserver(refreshRect);
    ro.observe(el);
    window.addEventListener("scroll", refreshRect, { passive: true });

    const io = new IntersectionObserver(
      (entries) => setVisible(entries[0]?.isIntersecting ?? true),
      { threshold: 0.01 },
    );
    io.observe(el);

    return () => {
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("scroll", refreshRect);
    };
  }, []);

  // Pointer listener bound to the wrapper — only fires while cursor is over
  // the hero. No window-level traffic, no layout reads on every event.
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = cachedRect.current;
    if (!rect) return;
    mouse.current.x = (e.clientX - rect.left) / rect.width;
    mouse.current.y = 1 - (e.clientY - rect.top) / rect.height;
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 z-0"
      onPointerMove={handlePointerMove}
    >
      <Canvas
        camera={{ position: [0, 0, 1], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false }}
        style={{ background: "#0B1221" }}
        frameloop={visible ? "always" : "never"}
      >
        <SilkPlane mouse={mouse} />
      </Canvas>
    </div>
  );
}

const MeshGradient = dynamic(() => Promise.resolve(MeshGradientInner), {
  ssr: false,
});

export default MeshGradient;
