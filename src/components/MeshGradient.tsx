"use client";

import { useRef, useMemo, useEffect, useState } from "react";
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

  // ---------- Storms (distant lightning behind clouds) ----------
  float h11(float n) {
    return fract(sin(n * 91.345) * 47453.5453);
  }
  vec2 h21(float n) {
    return vec2(h11(n), h11(n + 53.7));
  }

  // Lightning brightness envelope: sharp rise (~25ms) then exp decay.
  // Branchless so the shader stays uniform across pixels.
  float strikeEnv(float u, float dur) {
    float r = u / dur;
    float alive = step(0.0, u) * step(u, dur);
    float rise = smoothstep(0.0, 0.06, r);
    float fall = exp(-max(r - 0.06, 0.0) * 5.0);
    return alive * rise * fall;
  }

  // 3.5s windows. Each window: 1 always-on strike + 40% chance of a paired
  // follow-up flash 0.10–0.32s later at a nearby position. Loop covers the
  // current and previous window so flashes never get cut at boundaries.
  float storms(vec2 sp, float t) {
    const float WIN = 3.5;
    float wNow = floor(t / WIN);
    float total = 0.0;

    for (int k = 0; k < 2; k++) {
      float w = wNow - float(k);
      float wStart = w * WIN;
      float seed = w * 17.31;

      float t1 = 0.4 + h11(seed + 1.1) * 2.5;
      vec2 pos1 = (h21(seed + 2.7) - 0.5) * vec2(4.4, 2.6);
      float u1 = t - (wStart + t1);
      float flash1 = strikeEnv(u1, 0.42);
      float d1 = length(sp - pos1);
      float g1 = exp(-d1 * d1 * 0.32);

      float pair = step(0.60, h11(seed + 4.9));
      float dt2 = 0.10 + h11(seed + 6.3) * 0.22;
      vec2 pos2 = pos1 + (h21(seed + 7.9) - 0.5) * 1.6;
      float u2 = t - (wStart + t1 + dt2);
      float flash2 = strikeEnv(u2, 0.36) * pair;
      float d2 = length(sp - pos2);
      float g2 = exp(-d2 * d2 * 0.36);

      total += flash1 * g1 + flash2 * g2;
    }

    return total;
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

    // ---- Storms: distant lightning flashing behind the clouds ----
    float storm = storms(p, uTime);
    // Backlit through cloud density — clouds catch and scatter the light
    float backlit = storm * (0.35 + d * 0.65);
    d = clamp(d + backlit * 0.50, 0.0, 1.0);

    // ---- 4-stop palette: near-black → indigo → mid blue → cyan-white ----
    vec3 col0 = vec3(0.025, 0.038, 0.068);
    vec3 col1 = vec3(0.062, 0.088, 0.190);
    vec3 col2 = vec3(0.140, 0.260, 0.470);
    vec3 col3 = vec3(0.560, 0.790, 0.960);

    vec3 color = mix(col0, col1, smoothstep(0.00, 0.40, d));
    color      = mix(color, col2, smoothstep(0.40, 0.72, d));
    color      = mix(color, col3, smoothstep(0.78, 0.98, d));

    // Direct flash overlay — cool blue-white, modulated by backlit
    color += vec3(0.55, 0.72, 0.92) * backlit * 1.10;

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
    smoothed.current.x += (m.x - smoothed.current.x) * 0.22;
    smoothed.current.y += (m.y - smoothed.current.y) * 0.22;
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

// ---------------------------------------------------------------------------
// On mobile the WebGL shader (5-octave domain-warped FBM, lightning storms)
// saturates the mobile GPU and causes jank across all page animations.
// Skip the Canvas entirely on narrow viewports and render a static CSS
// background instead — visually consistent, zero GPU overhead.
// ---------------------------------------------------------------------------

function MeshGradientMobile() {
  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        background:
          "radial-gradient(ellipse 160% 100% at 50% -5%, #1e3a5f 0%, #111827 55%, #0B1221 100%)",
      }}
    />
  );
}

function MeshGradientDesktop() {
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

  // Window-level pointer listener — covers the entire hero rect, including
  // areas behind child content (photo, headline, buttons) where a wrapper-
  // bound listener wouldn't fire because pointer events get consumed by the
  // foreground elements. The cached rect makes the bounds check O(1) so we
  // don't pay any layout cost per event.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const rect = cachedRect.current;
      if (!rect) return;
      const x = e.clientX;
      const y = e.clientY;
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        return; // outside hero — don't update, freeze last position
      }
      mouse.current.x = (x - rect.left) / rect.width;
      mouse.current.y = 1 - (y - rect.top) / rect.height;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div ref={wrapperRef} className="absolute inset-0 z-0">
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

function MeshGradientInner() {
  // Evaluated once on mount (client-only — this component is dynamic/ssr:false).
  // Avoids a flash: state is correct on the very first render.
  const [isMobile] = useState(
    () => window.matchMedia("(max-width: 767px)").matches,
  );

  return isMobile ? <MeshGradientMobile /> : <MeshGradientDesktop />;
}

const MeshGradient = dynamic(() => Promise.resolve(MeshGradientInner), {
  ssr: false,
});

export default MeshGradient;
