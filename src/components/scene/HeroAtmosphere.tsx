import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * What a timber yard actually looks like at five in the evening: hard shafts of
 * low sun coming through the shutter, and the sawdust hanging in them. The
 * stack alone was an object in a void; this is the room it stands in.
 */

/** Scales a plane to exactly fill the frustum at its own depth. */
function useFrustumFill(planeZ: number) {
  const mesh = useRef<THREE.Mesh>(null);
  const { camera, size } = useThree();

  useFrame(() => {
    if (!mesh.current) return;
    const cam = camera as THREE.PerspectiveCamera;
    const d = Math.max(0.1, cam.position.z - planeZ);
    const h = 2 * d * Math.tan((cam.fov * Math.PI) / 360);
    mesh.current.scale.set(h * (size.width / Math.max(1, size.height)), h, 1);
    mesh.current.position.set(0, cam.position.y, planeZ);
  });

  return mesh;
}

/* --- light shafts -------------------------------------------------------- */

const shaftFrag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  varying vec2 vUv;

  float shaft(float x, float c, float w) {
    float d = (x - c) / w;
    return exp(-d * d);
  }

  void main() {
    // Rake the whole field over so the light comes in on a diagonal.
    float a = -0.46;
    vec2 p = vec2(vUv.x * cos(a) - vUv.y * sin(a), vUv.x * sin(a) + vUv.y * cos(a));
    float t = uTime;

    float v = 0.0;
    v += shaft(p.x, 0.10 + 0.020 * sin(t * 0.28), 0.055) * 0.95;
    v += shaft(p.x, 0.31 + 0.026 * sin(t * 0.21 + 1.2), 0.026) * 0.55;
    v += shaft(p.x, 0.52 + 0.022 * sin(t * 0.25 + 2.1), 0.070) * 0.80;
    v += shaft(p.x, 0.74 + 0.030 * sin(t * 0.18 + 3.4), 0.022) * 0.45;

    // Hold them off the very top and bottom of frame.
    v *= smoothstep(0.0, 0.30, vUv.y) * smoothstep(1.0, 0.62, vUv.y);

    vec3 warm = vec3(1.0, 0.56, 0.19);
    gl_FragColor = vec4(warm * v * 0.5, v * 0.5);
  }
`;

const passthroughVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

function Shafts() {
  const mesh = useFrustumFill(1.35);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((_s, delta) => {
    if (mat.current) mat.current.uniforms.uTime.value += delta;
  });

  return (
    <mesh ref={mesh} renderOrder={3}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={mat}
        vertexShader={passthroughVert}
        fragmentShader={shaftFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* --- the sun behind the stack -------------------------------------------- */

const sunFrag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 c = vUv - vec2(0.68, 0.74);
    c.x *= 1.35;
    float r = length(c);
    float breathe = 0.92 + 0.08 * sin(uTime * 0.5);
    float core = exp(-pow(r / (0.085 * breathe), 2.0));
    float halo = exp(-pow(r / (0.42 * breathe), 2.0)) * 0.5;
    float v = core + halo;
    vec3 warm = mix(vec3(1.0, 0.55, 0.16), vec3(1.0, 0.86, 0.6), core);
    gl_FragColor = vec4(warm * v, v);
  }
`;

function SunGlow() {
  const mesh = useFrustumFill(-4.2);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((_s, delta) => {
    if (mat.current) mat.current.uniforms.uTime.value += delta;
  });

  return (
    <mesh ref={mesh} renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={mat}
        vertexShader={passthroughVert}
        fragmentShader={sunFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* --- sawdust ------------------------------------------------------------- */

const dustVert = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSeed;
  attribute float aScale;
  varying float vFade;

  void main() {
    vec3 p = position;

    // Rise slowly and wrap, with a lazy sideways drift.
    float span = 7.0;
    p.y = mod(p.y + uTime * (0.055 + aSeed * 0.075) + span * 0.5, span) - span * 0.5;
    p.x += sin(uTime * (0.16 + aSeed * 0.22) + aSeed * 31.0) * 0.34;
    p.z += cos(uTime * (0.12 + aSeed * 0.18) + aSeed * 17.0) * 0.22;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aScale * uPixelRatio * (95.0 / max(0.35, -mv.z));

    // Motes only catch the light near the shafts, and fade at the edges.
    float lit = smoothstep(-3.4, 1.6, p.x) * smoothstep(3.6, 0.2, p.x);
    vFade = lit * (0.28 + aSeed * 0.72);
  }
`;

const dustFrag = /* glsl */ `
  precision highp float;
  varying float vFade;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float soft = exp(-pow(d / 0.24, 2.0));
    gl_FragColor = vec4(vec3(1.0, 0.78, 0.46) * soft * vFade, soft * vFade);
  }
`;

function Sawdust({ count = 1300 }: { count?: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { gl } = useThree();

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const scale = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8.4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 7;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5.5;
      seed[i] = Math.random();
      // A few large motes read as chips; the rest as fine dust.
      scale[i] = Math.random() < 0.06 ? 2.4 + Math.random() * 2.2 : 0.5 + Math.random() * 1.0;
    }

    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uPixelRatio: { value: Math.min(2, gl.getPixelRatio()) } }),
    [gl],
  );

  useFrame((_s, delta) => {
    if (mat.current) mat.current.uniforms.uTime.value += delta;
  });

  return (
    <points geometry={geometry} renderOrder={2}>
      <shaderMaterial
        ref={mat}
        vertexShader={dustVert}
        fragmentShader={dustFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function HeroAtmosphere({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <SunGlow />
      <Sawdust count={compact ? 550 : 1300} />
      <Shafts />
    </>
  );
}
