"use client";

import { Canvas } from "@react-three/fiber";

export default function DissolveField() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ position: "absolute", inset: 0 }}
    >
      {/* Particles arrive in Task 2 */}
    </Canvas>
  );
}
