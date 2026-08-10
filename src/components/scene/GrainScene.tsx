import { Canvas } from '@react-three/fiber';
import GrainField from './GrainField';

export default function GrainScene({ reduced, active }: { reduced: boolean; active: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={reduced || !active ? 'demand' : 'always'}
      gl={{ antialias: false, alpha: false }}
      camera={{ position: [0, 0, 2], fov: 50 }}
      style={{ pointerEvents: 'none' }}
    >
      <GrainField animate={!reduced} />
    </Canvas>
  );
}
