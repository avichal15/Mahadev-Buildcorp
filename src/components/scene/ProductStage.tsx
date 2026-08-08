import { useLayoutEffect, useRef, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { PRODUCT_MODELS } from './products';

function Rig({
  active,
  pointer,
  spin,
}: {
  active: string;
  pointer: RefObject<{ x: number; y: number }>;
  spin: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const born = useRef(0);
  const Model = PRODUCT_MODELS[active];

  // Restart the entrance whenever the selected product changes.
  useLayoutEffect(() => {
    born.current = 0;
  }, [active]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    born.current = Math.min(1, born.current + delta * 2.6);
    const ease = 1 - Math.pow(1 - born.current, 3);
    g.scale.setScalar(0.86 + ease * 0.14);

    const { x, y } = pointer.current;
    const idle = spin ? state.clock.elapsedTime * 0.22 : 0;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, idle + x * 0.42, 3.2, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -y * 0.24, 3.2, delta);
    g.position.y = THREE.MathUtils.damp(g.position.y, (1 - ease) * -0.35, 4, delta);
  });

  if (!Model) return null;

  return (
    <group ref={group}>
      <Model />
    </group>
  );
}

/**
 * Timber gets a warm key with a cool rim; metal flips it. Same rig, opposite
 * temperature — so the two halves of the shop never look alike.
 */
const RIGS = {
  timber: { key: '#ffab52', rim: '#7fe6ea', bounce: '#ff7a18', amb: '#ffd9a8', pt: '#ffc24b' },
  metal: { key: '#cdf5f8', rim: '#ff8c2e', bounce: '#12a7b8', amb: '#bfe6ea', pt: '#35dfe0' },
} as const;

export default function ProductStage({
  active,
  family,
  pointer,
  reduced,
}: {
  active: string;
  family: 'timber' | 'metal';
  pointer: RefObject<{ x: number; y: number }>;
  reduced: boolean;
}) {
  const rig = RIGS[family];

  return (
    <Canvas
      dpr={[1, 1.8]}
      frameloop={reduced ? 'demand' : 'always'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0.35, 5.4], fov: 32 }}
      style={{ pointerEvents: 'none' }}
    >
      <directionalLight position={[3.6, 4.2, 3.4]} intensity={3.2} color={rig.key} />
      <directionalLight position={[-3.2, 2.4, -4.2]} intensity={4.0} color={rig.rim} />
      <directionalLight position={[1.2, -3.4, 2.0]} intensity={0.9} color={rig.bounce} />
      <ambientLight intensity={0.2} color={rig.amb} />
      <pointLight position={[1.8, 1.0, 2.6]} intensity={8} distance={10} decay={2} color={rig.pt} />

      {/*
       * Polished metal only reads as metal if it has something to reflect. This
       * builds a small studio — two softboxes, an overhead strip and a floor
       * bounce — straight into a cube target, so there is no HDRI to download
       * and nothing to pay anyone for. `frames={1}` bakes it once.
       */}
      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={5}
          color={rig.key}
          position={[4, 3, 3]}
          scale={[7, 7, 1]}
        />
        <Lightformer
          form="rect"
          intensity={4}
          color={rig.rim}
          position={[-5, 2, -3]}
          scale={[9, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#ffffff"
          position={[0, 6, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[10, 2, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.1}
          color={rig.bounce}
          position={[0, -5, 1]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[10, 10, 1]}
        />
      </Environment>

      <Rig active={active} pointer={pointer} spin={!reduced} />
    </Canvas>
  );
}
