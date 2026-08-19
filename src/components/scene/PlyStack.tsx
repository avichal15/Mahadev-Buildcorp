import { useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { veneerTexture } from './textures';

/**
 * A sheet of plywood is the only building material that shows you how it was
 * made. The edge is the product. So the stack is built out of real layers —
 * face veneer, cross-banded cores, face veneer — not a texture pretending.
 */
const TONES = [0xf3e2c8, 0xa87f52, 0xddbd91, 0x8c6742, 0xddbd91, 0xa87f52, 0xf3e2c8];

const SHEET_W = 2.72;
const SHEET_D = 1.46;
const PLY_T = 0.027;

type SheetSpec = {
  y: number;
  rotY: number;
  x: number;
  z: number;
  drift: number;
};

function buildSheets(count: number): SheetSpec[] {
  const spread = 0.47;
  return Array.from({ length: count }, (_, i) => {
    const t = i - (count - 1) / 2;
    return {
      y: t * spread,
      rotY: t * 0.115,
      x: t * 0.055,
      z: t * -0.09,
      drift: i * 1.37,
    };
  });
}

function Sheet({
  spec,
  plies,
  scroll,
}: {
  spec: SheetSpec;
  plies: number;
  scroll: RefObject<number>;
}) {
  const group = useRef<THREE.Group>(null);
  const layers = useRef<THREE.Mesh[]>([]);
  const grain = veneerTexture();

  const tones = useMemo(() => {
    // Resample the veneer/core/veneer ramp to whatever ply count we're running.
    return Array.from({ length: plies }, (_, i) => {
      const idx = Math.round((i / Math.max(1, plies - 1)) * (TONES.length - 1));
      return TONES[idx];
    });
  }, [plies]);

  const jitter = useMemo(
    () =>
      Array.from({ length: plies }, (_, i) =>
        i === 0 || i === plies - 1 ? 0 : (Math.sin(i * 12.9898 + spec.drift) * 0.5 + 0.5) * 0.012,
      ),
    [plies, spec.drift],
  );

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    // Already damped by the parent — every sheet reads the same smoothed
    // number, so the stack opens as one object instead of each layer chasing
    // raw scroll on its own.
    const p = scroll.current;

    // Idle drift, so the stack breathes before anyone touches it.
    group.current.position.y = spec.y + Math.sin(t * 0.42 + spec.drift) * 0.021;
    group.current.rotation.y = spec.rotY + Math.sin(t * 0.3 + spec.drift) * 0.02 + p * 0.16;

    // Scroll pulls the laminate apart — an exploded view of the material.
    // Eased, so the opening accelerates through the middle of the pin instead
    // of creeping linearly for two screens.
    const eased = p * p * (3 - 2 * p);
    const gap = eased * 0.2;
    for (let i = 0; i < layers.current.length; i++) {
      const mesh = layers.current[i];
      if (!mesh) continue;
      const centred = i - (plies - 1) / 2;
      mesh.position.y = centred * PLY_T + centred * gap;
    }
  });

  return (
    <group ref={group} position={[spec.x, spec.y, spec.z]} rotation={[0, spec.rotY, 0]}>
      {tones.map((tone, i) => {
        const centred = i - (plies - 1) / 2;
        const inset = jitter[i];
        return (
          <mesh
            key={i}
            ref={(el) => {
              if (el) layers.current[i] = el;
            }}
            position={[0, centred * PLY_T, 0]}
          >
            <boxGeometry args={[SHEET_W - inset, PLY_T, SHEET_D - inset]} />
            <meshStandardMaterial
              color={tone}
              /* Greyscale grain, tinted by `color` — see veneerTexture. */
              map={grain}
              roughnessMap={grain}
              roughness={i === 0 || i === plies - 1 ? 0.54 : 0.78}
              metalness={0}
              /* A whisper of emissive on the face veneers pushes their lit
                 edges over the bloom threshold, so the stack glows along its
                 laminations instead of just being lit. */
              emissive={i === 0 || i === plies - 1 ? '#ff8c2e' : '#000000'}
              emissiveIntensity={i === 0 || i === plies - 1 ? 0.16 : 0}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function PlyStack({
  scroll,
  pointer,
}: {
  scroll: RefObject<number>;
  pointer: RefObject<{ x: number; y: number }>;
}) {
  const root = useRef<THREE.Group>(null);
  /*
   * Scroll, damped once here and shared with every sheet.
   *
   * Lenis already eases the scroll position, but the raw value still arrives in
   * discrete steps, and anything reading it directly — the ply separation
   * especially — shows those steps as stutter. One damped source keeps the
   * whole scene moving together.
   */
  const smooth = useRef(0);
  const { camera, viewport, size } = useThree();

  // Derived from the renderer's own measurement, so it can never disagree
  // with what is actually on screen.
  const compact = size.width < 900;
  const sheetCount = compact ? 4 : 5;
  const plies = compact ? 5 : 7;
  const sheets = useMemo(() => buildSheets(sheetCount), [sheetCount]);

  // On wide screens the stack sits right of centre so the headline owns the
  // left margin. On narrow screens it centres and lifts above the copy.
  const anchorX = compact ? 0 : Math.min(1.25, viewport.width * 0.115);
  const anchorY = compact ? 0.72 : 0.28;

  useFrame((_state, delta) => {
    if (!root.current) return;
    // Clamped for the same reason as the product rig: a stalled frame must not
    // arrive as one huge step and snap the stack across.
    const d = Math.min(delta, 0.05);
    smooth.current = THREE.MathUtils.damp(smooth.current, scroll.current, 7, d);
    const p = smooth.current;
    const { x, y } = pointer.current;

    // Look along the edges: the stack turns toward the pointer, damped hard so
    // it never feels twitchy.
    const targetY = x * 0.3;
    const targetX = -y * 0.16 + 0.06 + p * 0.2;

    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, targetY, 3, d);
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, targetX, 3, d);
    // As the copy clears out, the stack drifts back to centre frame and takes
    // the whole shot.
    root.current.position.x = THREE.MathUtils.damp(
      root.current.position.x,
      anchorX * (1 - p * 0.85),
      3,
      d,
    );
    root.current.position.y = THREE.MathUtils.damp(
      root.current.position.y,
      anchorY + p * 0.5,
      3,
      d,
    );

    // Scroll dollies the camera into the stack. Kept short of the earlier
    // push-in, which filled the frame with stripes and lost the object.
    camera.position.z = THREE.MathUtils.damp(camera.position.z, 4.85 - p * 1.35, 3, d);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.34 - p * 0.42, 3, d);
    camera.lookAt(0, anchorY * 0.5, 0);
  });

  return (
    <>
      {/* Low amber sun through a shutter: the key that makes the ply read as
          timber rather than grey board. */}
      <directionalLight position={[3.8, 3.4, 3.2]} intensity={3.4} color="#ffab52" />
      {/* Cyan rim from behind draws a cold line down every laminated edge —
          the metal half of the shop answering the wood half. */}
      <directionalLight position={[-3.4, 2.2, -4.6]} intensity={4.2} color="#6fe8ec" />
      {/* Warm bounce off the floor. */}
      <directionalLight position={[1.4, -3.2, 2.2]} intensity={0.85} color="#ff7a18" />
      <ambientLight intensity={0.16} color="#ffd9a8" />
      {/* A close amber point light gives the near corner a hot spot. */}
      <pointLight position={[1.6, 0.9, 2.4]} intensity={7} distance={9} decay={2} color="#ffc24b" />

      <group ref={root} position={[anchorX, anchorY, 0]}>
        {sheets.map((spec, i) => (
          <Sheet key={i} spec={spec} plies={plies} scroll={smooth} />
        ))}
      </group>
    </>
  );
}
