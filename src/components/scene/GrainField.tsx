import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Veneer figure, generated rather than filmed: domain-warped noise banded into
 * grain lines. Composited with CSS `exclusion` over black, so the field is
 * invisible where it is dark and cuts into the headline where it is bright.
 */
const fragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAspect;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = vec2(vUv.x * uAspect, vUv.y);
    float t = uTime * 0.03;

    float w1 = fbm(vec2(p.x * 1.3 + t, p.y * 2.4));
    float w2 = fbm(vec2(p.x * 0.55 - t * 0.6, p.y * 1.1 + w1));

    float lines = sin(p.y * 78.0 + w1 * 28.0 + w2 * 11.0);
    float grain = 1.0 - smoothstep(0.0, 0.8, abs(lines));

    // Large-scale envelope so the field opens and closes like real figure.
    float env = smoothstep(0.18, 0.78, fbm(vec2(p.x * 0.75 - t * 0.4, p.y * 0.85)));

    float g = grain * (0.16 + env * 0.42);

    // Amber timber against a cool counter-tint in the troughs, so the field
    // reads as lit wood rather than television static.
    vec3 warm = vec3(1.0, 0.52, 0.14);
    vec3 cool = vec3(0.18, 0.78, 0.82);
    vec3 tint = mix(cool, warm, smoothstep(0.15, 0.75, env));

    gl_FragColor = vec4(tint * g, 1.0);
  }
`;

export default function GrainField({ animate = true }: { animate?: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uAspect: { value: 1 } }),
    [],
  );

  useFrame((_state, delta) => {
    if (!material.current || !animate) return;
    material.current.uniforms.uTime.value += delta;
  });

  uniforms.uAspect.value = Math.max(0.6, viewport.width / Math.max(0.001, viewport.height));

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
      />
    </mesh>
  );
}
