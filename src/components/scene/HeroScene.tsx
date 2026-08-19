import { useEffect, useState, type RefObject } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import PlyStack from './PlyStack';
import HeroAtmosphere from './HeroAtmosphere';

/** Reads the renderer's own measurement rather than a JS media query. */
function Responsive({ onChange }: { onChange: (width: number) => void }) {
  const width = useThree((s) => s.size.width);

  useEffect(() => {
    onChange(width);
  }, [width, onChange]);

  return null;
}

/**
 * Split out from Hero so three.js lands in its own chunk and the headline
 * paints without waiting on the renderer.
 */
export default function HeroScene({
  scroll,
  pointer,
  reduced,
  active,
}: {
  scroll: RefObject<number>;
  pointer: RefObject<{ x: number; y: number }>;
  reduced: boolean;
  active: boolean;
}) {
  const [width, setWidth] = useState(1200);
  const compact = width < 900;
  /*
   * Phones skip the bloom pass entirely. It is the most expensive thing in the
   * scene and the least visible at this size — the emissive veneer edges still
   * read without it, and the frames are worth more than the glow.
   */
  const bloom = width >= 640;

  return (
    <Canvas
      /* Capped at 1.5: the bloom pass is resolution-bound, and past this the
         frame cost is what makes the scrub look choppy rather than the maths. */
      dpr={compact ? [1, 1.25] : [1, 1.5]}
      frameloop={reduced || !active ? 'demand' : 'always'}
      /*
       * antialias is off deliberately. With an EffectComposer in the scene the
       * image is built in its own render targets and resolved through them, so
       * MSAA on the default framebuffer is never sampled — it only costs
       * memory and bandwidth, which is exactly what a phone has least of.
       * Edge smoothing comes from the composer below instead.
       */
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0.34, 4.85], fov: 36 }}
      style={{ pointerEvents: 'none' }}
    >
      <Responsive onChange={setWidth} />

      {/* Procedural studio, baked once — gives the veneer something to catch
          besides the direct lights. No HDRI download. */}
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={4} color="#ffab52" position={[4, 3, 3]} scale={[8, 8, 1]} />
        <Lightformer form="rect" intensity={3} color="#6fe8ec" position={[-5, 2, -4]} scale={[9, 6, 1]} />
        <Lightformer
          form="rect"
          intensity={1.6}
          color="#ff7a18"
          position={[0, -5, 1]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[10, 10, 1]}
        />
      </Environment>

      <PlyStack scroll={scroll} pointer={pointer} />
      <HeroAtmosphere compact={compact} />

      {/* Bloom is what turns lit edges into light. Threshold is set above the
          ply's diffuse so only the veneer highlights, the shafts and the sun
          actually bleed — not the whole sheet. */}
      <EffectComposer enabled={!reduced && bloom} multisampling={compact ? 0 : 4}>
        <Bloom
          mipmapBlur
          /* The bloom is a blur — it does not need full resolution to look
             like light, and this is the single most expensive pass on a
             phone. Quarter-res on mobile, just over half on desktop. */
          resolutionScale={compact ? 0.25 : 0.55}
          intensity={compact ? 0.9 : 1.35}
          luminanceThreshold={0.58}
          luminanceSmoothing={0.28}
          radius={0.78}
        />
      </EffectComposer>
    </Canvas>
  );
}
