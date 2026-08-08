// oxlint-disable react/only-export-components -- a geometry library keyed by
// category, not a component module; Fast Refresh does a full reload here.
import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';

/* ---------------------------------------------------------------------------
   Original models, built from primitives — everything a carpenter would pick
   up off this counter. The stage lights them per family: amber for the timber
   side, cyan for the metal side.
   ------------------------------------------------------------------------ */

/* Metal runs slightly cool, timber warm. The lighting rig does most of the
   work; these just keep each family on its own side of neutral. */
const STEEL = { color: '#d3dee0', metalness: 0.94, roughness: 0.26 } as const;
const STEEL_DARK = { color: '#93a4a8', metalness: 0.88, roughness: 0.4 } as const;
const IRON = { color: '#5c6668', metalness: 0.72, roughness: 0.58 } as const;
const PLASTIC = { color: '#e4ddd2', metalness: 0.04, roughness: 0.5 } as const;
const PLASTIC_DARK = { color: '#7a7168', metalness: 0.04, roughness: 0.56 } as const;
const VENEER = { color: '#f3e2c8', metalness: 0, roughness: 0.6 } as const;
const CORE = { color: '#a87f52', metalness: 0, roughness: 0.8 } as const;

/** A round-headed screw hole, suggested with a ring rather than real CSG. */
function Hole({ position, r = 0.045 }: { position: [number, number, number]; r?: number }) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[r, r * 0.42, 8, 16]} />
      <meshStandardMaterial {...STEEL_DARK} />
    </mesh>
  );
}

/* --- 01 Ply & Boards ----------------------------------------------------- */

function PlySheetModel() {
  const plies = [0, 1, 2, 3, 4, 5, 6];
  return (
    <group rotation={[0, 0.5, 0.16]}>
      {plies.map((i) => {
        const face = i === 0 || i === plies.length - 1;
        return (
          <mesh key={i} position={[0, (i - 3) * 0.062, 0]}>
            <boxGeometry args={[2.1, 0.06, 1.35]} />
            <meshStandardMaterial {...(face ? VENEER : CORE)} />
          </mesh>
        );
      })}
      {/* A second sheet leaning against the stack, cut corner forward. */}
      <mesh position={[0.15, 0.42, -0.1]} rotation={[0, 0.18, 0.1]}>
        <boxGeometry args={[1.85, 0.17, 1.15]} />
        <meshStandardMaterial color="#c9a678" roughness={0.66} />
      </mesh>
    </group>
  );
}

/* --- 02 Mica & Laminates ------------------------------------------------- */

function LaminateModel() {
  // A laminate sheet is sold rolled — the curve is how you recognise it.
  const curved = useMemo(() => {
    const g = new THREE.PlaneGeometry(2.4, 1.5, 60, 2);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, Math.sin((x / 2.4 + 0.5) * Math.PI * 1.15) * 0.52 - 0.26);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <group rotation={[0, 0.4, 0]}>
      <mesh geometry={curved} position={[0, 0.34, 0]} rotation={[-Math.PI / 2.4, 0, 0]}>
        <meshStandardMaterial color="#efe6d8" roughness={0.16} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, -0.5 - i * 0.05, 0]}>
          <boxGeometry args={[2.2, 0.042, 1.4]} />
          <meshStandardMaterial
            color={i % 2 ? '#a8875e' : '#dcc7a4'}
            roughness={0.3}
            metalness={0.06}
          />
        </mesh>
      ))}
    </group>
  );
}

/* --- 03 Door Locks & Fittings: a butt hinge (kabza) ---------------------- */

function HingeModel() {
  const knuckles = [-0.42, -0.14, 0.14, 0.42];
  return (
    <group rotation={[0.1, 0.6, 0]} scale={1.15}>
      {/* Two leaves, opened to the angle you'd hold one at on the counter. */}
      {[1, -1].map((side) => (
        <group key={side} rotation={[0, side > 0 ? 0.42 : -0.42, 0]}>
          <mesh position={[side * 0.46, 0, 0]}>
            <boxGeometry args={[0.9, 1.32, 0.055]} />
            <meshStandardMaterial {...STEEL} />
          </mesh>
          {[-0.42, 0, 0.42].map((y) => (
            <Hole key={y} position={[side * 0.56, y, 0.03]} />
          ))}
        </group>
      ))}
      {knuckles.map((y, i) => (
        <mesh key={y} position={[0, y, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.24, 20]} />
          <meshStandardMaterial {...(i % 2 ? STEEL_DARK : STEEL)} />
        </mesh>
      ))}
      <mesh>
        <cylinderGeometry args={[0.042, 0.042, 1.5, 12]} />
        <meshStandardMaterial {...STEEL_DARK} />
      </mesh>
    </group>
  );
}

/* --- 04 Window Hardware: a tower bolt ------------------------------------ */

function TowerBoltModel() {
  return (
    <group rotation={[0.32, 0.5, Math.PI / 2]} scale={1.05}>
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[0.42, 1.5, 0.08]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      {[-0.82, -0.45, 0.1].map((y) => (
        <Hole key={y} position={[0, y, 0.05]} r={0.05} />
      ))}
      {/* Barrel the rod slides through. */}
      {[-0.62, 0.02].map((y) => (
        <mesh key={y} position={[0, y, 0.15]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.2, 20]} />
          <meshStandardMaterial {...STEEL_DARK} />
        </mesh>
      ))}
      <mesh position={[0, 0.42, 0.15]}>
        <cylinderGeometry args={[0.062, 0.062, 1.5, 16]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0, 1.16, 0.15]}>
        <sphereGeometry args={[0.12, 20, 16]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      {/* Receiver plate on the frame side. */}
      <mesh position={[0, 0.92, 0]}>
        <boxGeometry args={[0.4, 0.34, 0.08]} />
        <meshStandardMaterial {...STEEL_DARK} />
      </mesh>
    </group>
  );
}

/* --- 05 Furniture Hardware: a telescopic drawer channel ------------------ */

function DrawerChannelModel() {
  // Three nested members, drawn out the way they sit when half open.
  return (
    <group rotation={[0.34, 0.62, 0]} scale={1.05}>
      {/* Outer member: a U-channel that screws to the carcass. */}
      <group>
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[2.3, 0.05, 0.42]} />
          <meshStandardMaterial {...STEEL_DARK} />
        </mesh>
        {[-0.2, 0.2].map((z) => (
          <mesh key={z} position={[0, 0, z]}>
            <boxGeometry args={[2.3, 0.4, 0.05]} />
            <meshStandardMaterial {...STEEL_DARK} />
          </mesh>
        ))}
      </group>

      {/* Intermediate member, slid out */}
      <group position={[0.42, 0.06, 0]}>
        <mesh position={[0, -0.14, 0]}>
          <boxGeometry args={[2.1, 0.04, 0.3]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
        {[-0.14, 0.14].map((z) => (
          <mesh key={z} position={[0, 0, z]}>
            <boxGeometry args={[2.1, 0.3, 0.04]} />
            <meshStandardMaterial {...STEEL} />
          </mesh>
        ))}
      </group>

      {/* Inner member, with the fixing holes that go on the drawer box */}
      <group position={[0.84, 0.1, 0]}>
        <mesh>
          <boxGeometry args={[1.95, 0.22, 0.05]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
        {[-0.6, 0, 0.6].map((x) => (
          <Hole key={x} position={[x, 0, 0.04]} r={0.04} />
        ))}
      </group>

      {/* Ball bearings in the race */}
      {[-0.75, -0.3, 0.15, 0.6].map((x) => (
        <mesh key={x} position={[x, -0.06, 0.17]}>
          <sphereGeometry args={[0.05, 14, 12]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      ))}
    </group>
  );
}

/* --- 06 Curtain Fittings ------------------------------------------------- */

function CurtainRodModel() {
  return (
    <group rotation={[0.22, 0.34, 0.06]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.085, 0.085, 2.6, 24]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      {/* Finials */}
      {[-1.42, 1.42].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.11, 0.085, 0.14, 20]} />
            <meshStandardMaterial {...STEEL_DARK} />
          </mesh>
          <mesh position={[Math.sign(x) * 0.16, 0, 0]}>
            <sphereGeometry args={[0.15, 22, 18]} />
            <meshStandardMaterial {...STEEL} />
          </mesh>
        </group>
      ))}
      {/* Rings */}
      {[-0.85, -0.42, 0.02, 0.46, 0.9].map((x) => (
        <mesh key={x} position={[x, 0.02, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.16, 0.028, 10, 26]} />
          <meshStandardMaterial {...STEEL_DARK} />
        </mesh>
      ))}
      {/* Wall brackets */}
      {[-1.1, 1.1].map((x) => (
        <group key={x} position={[x, -0.3, -0.1]}>
          <mesh position={[0, -0.16, 0]}>
            <boxGeometry args={[0.24, 0.36, 0.07]} />
            <meshStandardMaterial {...STEEL_DARK} />
          </mesh>
          <mesh position={[0, 0.14, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.18, 18, 1, true]} />
            <meshStandardMaterial {...STEEL_DARK} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* --- 07 Screws & Fasteners ----------------------------------------------- */

class Helix extends THREE.Curve<THREE.Vector3> {
  radius: number;
  height: number;
  turns: number;

  constructor(radius: number, height: number, turns: number) {
    super();
    this.radius = radius;
    this.height = height;
    this.turns = turns;
  }

  getPoint(t: number, target = new THREE.Vector3()) {
    const a = t * this.turns * Math.PI * 2;
    // Taper the thread toward the point, like a real wood screw.
    const r = this.radius * (0.34 + 0.66 * Math.min(1, t * 3.2));
    return target.set(Math.cos(a) * r, t * this.height - this.height / 2, Math.sin(a) * r);
  }
}

function ScrewModel() {
  const thread = useMemo(() => new THREE.TubeGeometry(new Helix(0.2, 1.9, 13), 320, 0.045, 10, false), []);

  return (
    <group rotation={[0, 0.4, 0.34]} scale={1.05}>
      <mesh geometry={thread} position={[0, -0.05, 0]}>
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.115, 0.115, 1.9, 20]} />
        <meshStandardMaterial {...STEEL_DARK} />
      </mesh>
      {/* Point */}
      <mesh position={[0, -1.08, 0]}>
        <coneGeometry args={[0.115, 0.28, 20]} />
        <meshStandardMaterial {...STEEL_DARK} />
      </mesh>
      {/* Countersunk head with a pozi drive */}
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.36, 0.13, 0.26, 28]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[0.42, 0.045, 0.075]} />
        <meshStandardMaterial {...IRON} />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[0.075, 0.045, 0.42]} />
        <meshStandardMaterial {...IRON} />
      </mesh>
    </group>
  );
}

/* --- 08 Adhesives & Sealants --------------------------------------------- */

function AdhesiveModel() {
  return (
    <group rotation={[0, 0.3, 0]}>
      {/* Tub */}
      <group position={[-0.5, -0.1, 0]}>
        <mesh>
          <cylinderGeometry args={[0.62, 0.52, 1.15, 36]} />
          <meshStandardMaterial {...PLASTIC} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.635, 0.635, 0.42, 36]} />
          <meshStandardMaterial {...PLASTIC_DARK} />
        </mesh>
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[0.66, 0.64, 0.12, 36]} />
          <meshStandardMaterial {...PLASTIC_DARK} />
        </mesh>
      </group>
      {/* Sealant cartridge */}
      <group position={[0.78, -0.05, 0.1]} rotation={[0, 0, 0.06]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 1.5, 28]} />
          <meshStandardMaterial {...PLASTIC} />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.31, 0.31, 0.5, 28]} />
          <meshStandardMaterial {...PLASTIC_DARK} />
        </mesh>
        <mesh position={[0, 0.88, 0]}>
          <coneGeometry args={[0.19, 0.42, 24]} />
          <meshStandardMaterial {...PLASTIC_DARK} />
        </mesh>
        <mesh position={[0, 1.12, 0]}>
          <cylinderGeometry args={[0.06, 0.04, 0.16, 16]} />
          <meshStandardMaterial {...PLASTIC_DARK} />
        </mesh>
      </group>
    </group>
  );
}

/* --- 09 Polish & Finishing ----------------------------------------------- */

function BrushModel() {
  return (
    <group rotation={[0.1, 0.44, 0.5]}>
      {/* Handle, turned to a waist */}
      <mesh position={[0, 0.86, 0]}>
        <cylinderGeometry args={[0.13, 0.1, 1.15, 22]} />
        <meshStandardMaterial color="#caa87c" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.1, 0.17, 0.42, 22]} />
        <meshStandardMaterial color="#caa87c" roughness={0.55} />
      </mesh>
      {/* Ferrule */}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[0.52, 0.38, 0.17]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      {/* Bristles */}
      <mesh position={[0, -0.56, 0]}>
        <boxGeometry args={[0.5, 0.56, 0.13]} />
        <meshStandardMaterial color="#8a7358" roughness={0.92} />
      </mesh>
      <mesh position={[0, -0.86, 0]}>
        <boxGeometry args={[0.48, 0.1, 0.09]} />
        <meshStandardMaterial color="#6b5946" roughness={0.95} />
      </mesh>
      {/* Polish tin alongside */}
      <group position={[0.95, -0.55, -0.1]} rotation={[0, 0, -0.5]}>
        <mesh>
          <cylinderGeometry args={[0.44, 0.44, 0.3, 32]} />
          <meshStandardMaterial {...STEEL_DARK} />
        </mesh>
        <mesh position={[0, 0.17, 0]}>
          <cylinderGeometry args={[0.46, 0.46, 0.06, 32]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      </group>
    </group>
  );
}

/* --- 10 General Hardware: aluminium angle -------------------------------- */

function AluProfileModel() {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    const t = 0.11;
    const w = 0.78;
    s.moveTo(0, 0);
    s.lineTo(w, 0);
    s.lineTo(w, t);
    s.lineTo(t, t);
    s.lineTo(t, w);
    s.lineTo(0, w);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 2.5,
      bevelEnabled: true,
      bevelSize: 0.012,
      bevelThickness: 0.012,
      bevelSegments: 2,
    });
    g.center();
    return g;
  }, []);

  const channel = useMemo(() => {
    const s = new THREE.Shape();
    const t = 0.1;
    const w = 0.62;
    const h = 0.44;
    s.moveTo(0, 0);
    s.lineTo(w, 0);
    s.lineTo(w, h);
    s.lineTo(w - t, h);
    s.lineTo(w - t, t);
    s.lineTo(t, t);
    s.lineTo(t, h);
    s.lineTo(0, h);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 2.5,
      bevelEnabled: true,
      bevelSize: 0.01,
      bevelThickness: 0.01,
      bevelSegments: 2,
    });
    g.center();
    return g;
  }, []);

  return (
    <group rotation={[0.2, 0.62, 0]}>
      <mesh geometry={geo} position={[-0.42, 0.24, 0]} rotation={[0, Math.PI / 2, 0]}>
        <meshStandardMaterial color="#d6e2e4" metalness={0.82} roughness={0.34} />
      </mesh>
      <mesh geometry={channel} position={[0.52, -0.3, 0.12]} rotation={[0, Math.PI / 2, 0]}>
        <meshStandardMaterial color="#9fb0b4" metalness={0.82} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* --- 11 Kitchen Hardware: a cabinet pull --------------------------------- */

function HandleModel() {
  return (
    <group rotation={[0.36, 0.5, 0]} scale={1.1}>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 2.0, 26]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      {[-0.78, 0.78].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.46, 20]} />
            <meshStandardMaterial {...STEEL_DARK} />
          </mesh>
          <mesh position={[0, -0.14, 0]}>
            <cylinderGeometry args={[0.17, 0.14, 0.1, 24]} />
            <meshStandardMaterial {...STEEL_DARK} />
          </mesh>
        </group>
      ))}
      {/* A knob to sit beside it */}
      <group position={[0, -0.72, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.24, 26, 20]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.28, 18]} />
          <meshStandardMaterial {...STEEL_DARK} />
        </mesh>
        <mesh position={[0, -0.18, 0]}>
          <cylinderGeometry args={[0.2, 0.17, 0.08, 24]} />
          <meshStandardMaterial {...STEEL_DARK} />
        </mesh>
      </group>
    </group>
  );
}

/* --- 12 Sheets, Mesh & Seals: woven jali --------------------------------- */

function JaliModel() {
  const bars = 13;
  const span = 2.0;
  const wire = useMemo(() => new THREE.CylinderGeometry(0.022, 0.022, span, 8), [span]);
  const idx = useMemo(() => Array.from({ length: bars }, (_, i) => i), [bars]);
  const step = span / (bars - 1);

  return (
    <group rotation={[0.42, 0.5, 0]}>
      {/* Warp — sits slightly proud of the weft so the weave reads. */}
      {idx.map((i) => (
        <mesh key={`v${i}`} geometry={wire} position={[-span / 2 + i * step, 0, 0.024]}>
          <meshStandardMaterial {...STEEL} />
        </mesh>
      ))}
      {/* Weft */}
      {idx.map((i) => (
        <mesh
          key={`h${i}`}
          geometry={wire}
          position={[0, -span / 2 + i * step, -0.024]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <meshStandardMaterial {...STEEL_DARK} />
        </mesh>
      ))}
      {/* Frame */}
      {(
        [
          [0, span / 2 + 0.07, 0, 0],
          [0, -span / 2 - 0.07, 0, 0],
          [-span / 2 - 0.07, 0, 0, 1],
          [span / 2 + 0.07, 0, 0, 1],
        ] as const
      ).map(([x, y, z, rot], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, 0, rot ? Math.PI / 2 : 0]}>
          <boxGeometry args={[span + 0.3, 0.11, 0.1]} />
          <meshStandardMaterial {...IRON} />
        </mesh>
      ))}
    </group>
  );
}

/* --- registry ------------------------------------------------------------ */

export const PRODUCT_MODELS: Record<string, () => ReactNode> = {
  'Ply & Boards': PlySheetModel,
  'Mica & Laminates': LaminateModel,
  'Door Locks & Fittings': HingeModel,
  'Window Hardware': TowerBoltModel,
  'Furniture Hardware': DrawerChannelModel,
  'Curtain Fittings': CurtainRodModel,
  'Screws & Fasteners': ScrewModel,
  'Adhesives & Sealants': AdhesiveModel,
  'Polish & Finishing': BrushModel,
  'General Hardware': AluProfileModel,
  'Kitchen Hardware': HandleModel,
  'Sheets, Mesh & Seals': JaliModel,
};
