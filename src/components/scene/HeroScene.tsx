import { useEffect, useState, type RefObject } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import PlyStack from './PlyStack';
import HeroAtmosphere from './HeroAtmosphere';

/** Reads the renderer's own measurement rather than a JS media query. */
function Responsive({ onChange }: { onChange: (compact: boolean) => void }) {
  const width = useThree((s) => s.size.width);

  useEffect(() => {
    onChange(width < 900);
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
}: {
  scroll: RefObject<number>;
  pointer: RefObject<{ x: number; y: number }>;
  reduced: boolean;
}) {
  const [compact, setCompact] = useState(false);

  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={reduced ? 'demand' : 'always'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0.34, 4.85], fov: 36 }}
      style={{ pointerEvents: 'none' }}
    >
      <Responsive onChange={setCompact} />

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
      <EffectComposer enabled={!reduced} multisampling={0}>
        <Bloom
          mipmapBlur
          intensity={compact ? 0.85 : 1.35}
          luminanceThreshold={0.58}
          luminanceSmoothing={0.28}
          radius={0.78}
        />
      </EffectComposer>
    </Canvas>
  );
}
