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

/* --- 05 Furniture Hardware: drawer box on telescopic channels ------------ */

function DrawerChannelModel() {
  const bearingPositions = [-0.58, -0.22, 0.14, 0.5];

  return (
    <group rotation={[0.24, 0.5, 0.02]} scale={0.93} position={[0, 0.03, 0]}>
      {/* A shallow drawer gives the channels a clear job and scale. */}
      <group position={[0, 0.18, 0.24]}>
        <mesh position={[0, -0.34, 0]}>
          <boxGeometry args={[1.82, 0.09, 1.34]} />
          <meshStandardMaterial {...VENEER} />
        </mesh>
        <mesh position={[0, 0.02, 0.68]}>
          <boxGeometry args={[2.02, 0.78, 0.13]} />
          <meshStandardMaterial color="#c99861" roughness={0.62} metalness={0.02} />
        </mesh>
        <mesh position={[0, -0.02, -0.62]}>
          <boxGeometry args={[1.82, 0.64, 0.1]} />
          <meshStandardMaterial {...CORE} />
        </mesh>
        {[-0.91, 0.91].map((x) => (
          <mesh key={x} position={[x, -0.02, 0]}>
            <boxGeometry args={[0.1, 0.64, 1.34]} />
            <meshStandardMaterial {...VENEER} />
          </mesh>
        ))}

        {/* A simple pull makes the object read immediately as a drawer. */}
        <group position={[0, 0.04, 0.82]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.76, 20]} />
            <meshStandardMaterial {...STEEL} />
          </mesh>
          {[-0.3, 0.3].map((x) => (
            <mesh key={x} position={[x, 0, -0.09]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.2, 16]} />
              <meshStandardMaterial {...STEEL_DARK} />
            </mesh>
          ))}
        </group>
      </group>

      {/* A channel on each side, extended beyond its outer mounting rail. */}
      {[-1.02, 1.02].map((x) => (
        <group key={x} position={[x, -0.05, -0.1]}>
          <mesh>
            <boxGeometry args={[0.1, 0.32, 1.8]} />
            <meshStandardMaterial {...STEEL_DARK} />
          </mesh>
          <mesh position={[Math.sign(x) * 0.075, 0.01, 0.38]}>
            <boxGeometry args={[0.08, 0.2, 1.52]} />
            <meshStandardMaterial {...STEEL} />
          </mesh>
          {bearingPositions.map((z) => (
            <mesh key={z} position={[Math.sign(x) * 0.125, 0.13, z - 0.12]}>
              <sphereGeometry args={[0.045, 12, 10]} />
              <meshStandardMaterial color="#d5a45a" metalness={0.8} roughness={0.25} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* --- 06 Curtain Fittings ------------------------------------------------- */

/** A pleated curtain panel, so the rod is unmistakably a curtain rod. */
function CurtainPanel({
  x,
  width,
  drop,
  flip = false,
}: {
  x: number;
  width: number;
  drop: number;
  flip?: boolean;
}) {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, drop, 48, 12);
    const pos = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      // Pleats across the width, opening out toward the hem the way hung
      // fabric does, plus a slow sway so it is not a flat corrugation.
      const t = (v.y + drop / 2) / drop; // 0 at hem, 1 at the rod
      const slack = 0.055 + (1 - t) * 0.085;
      const pleat = Math.sin((v.x / width) * Math.PI * 9) * slack;
      const sway = Math.sin((1 - t) * 2.2) * 0.06;
      pos.setZ(i, pleat + sway);
      // Gathered at the rod, falling wider at the hem.
      pos.setX(i, v.x * (0.82 + (1 - t) * 0.2));
    }
    g.computeVertexNormals();
    return g;
  }, [width, drop]);

  return (
    <mesh
      geometry={geometry}
      position={[x, -drop / 2 - 0.06, 0.03]}
      rotation={[0, flip ? Math.PI : 0, 0]}
    >
      <meshStandardMaterial
        color="#c8b89c"
        roughness={0.94}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function CurtainRodModel() {
  return (
    <group rotation={[0.12, 0.3, 0.04]} position={[0, 0.62, 0]} scale={0.92}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.085, 0.085, 2.6, 24]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>

      {/* The fabric is the whole point — without it this is just a pipe. */}
      <CurtainPanel x={-0.66} width={1.16} drop={2.1} />
      <CurtainPanel x={0.66} width={1.16} drop={2.1} flip />
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
      {/* Wall brackets, set outboard of the fabric so they stay readable */}
      {[-1.28, 1.28].map((x) => (
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

/**
 * The white adhesive pail every carpenter in the country keeps under the bench,
 * a sealant cartridge and a squeeze tube. Modelled on the generic forms of the
 * category rather than any maker's trade dress — no marks, no logos, no
 * borrowed livery.
 */
function AdhesiveModel() {
  const bail = useMemo(() => {
    // Wire handle: a half-circle swept as a tube, the way a pail bail sits.
    const curve = new THREE.CatmullRomCurve3(
      Array.from({ length: 24 }, (_, i) => {
        const a = Math.PI * (i / 23);
        return new THREE.Vector3(Math.cos(a) * 0.63, Math.sin(a) * 0.52 + 0.42, 0);
      }),
    );
    return new THREE.TubeGeometry(curve, 40, 0.022, 8, false);
  }, []);

  return (
    <group rotation={[0, 0.34, 0]} position={[0, -0.1, 0]}>
      {/* Pail — straight-sided with a slight taper, a rolled rim and a lid. */}
      <group position={[-0.62, -0.06, 0]}>
        <mesh>
          <cylinderGeometry args={[0.6, 0.5, 1.2, 44]} />
          <meshStandardMaterial color="#f2efe9" roughness={0.42} metalness={0.02} />
        </mesh>
        {/* Printed band, suggested by tone only. */}
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.575, 0.53, 0.5, 44]} />
          <meshStandardMaterial color="#b9c3cc" roughness={0.5} metalness={0.02} />
        </mesh>
        {/* Rolled rim */}
        <mesh position={[0, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.6, 0.038, 10, 44]} />
          <meshStandardMaterial color="#e6e2da" roughness={0.4} metalness={0.05} />
        </mesh>
        {/* Lid, domed a little so it does not read as a flat disc */}
        <mesh position={[0, 0.63, 0]}>
          <cylinderGeometry args={[0.58, 0.58, 0.07, 44]} />
          <meshStandardMaterial color="#dfd9cf" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.69, 0]}>
          <cylinderGeometry args={[0.3, 0.34, 0.06, 32]} />
          <meshStandardMaterial color="#dfd9cf" roughness={0.45} />
        </mesh>
        {/* Wire bail and its lugs */}
        <mesh geometry={bail} position={[0, 0.18, 0]}>
          <meshStandardMaterial {...STEEL_DARK} />
        </mesh>
        {[-0.6, 0.6].map((x) => (
          <mesh key={x} position={[x, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.05, 14]} />
            <meshStandardMaterial {...STEEL_DARK} />
          </mesh>
        ))}
      </group>

      {/* Sealant cartridge */}
      <group position={[0.68, -0.08, 0.06]} rotation={[0, 0, 0.05]}>
        <mesh>
          <cylinderGeometry args={[0.29, 0.29, 1.42, 32]} />
          <meshStandardMaterial color="#e9e4da" roughness={0.46} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.297, 0.297, 0.62, 32]} />
          <meshStandardMaterial color="#9aa6ae" roughness={0.52} />
        </mesh>
        {/* Crimped base */}
        <mesh position={[0, -0.72, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.06, 32]} />
          <meshStandardMaterial {...PLASTIC_DARK} />
        </mesh>
        {/* Shoulder, threaded neck and the cut nozzle */}
        <mesh position={[0, 0.79, 0]}>
          <cylinderGeometry args={[0.15, 0.29, 0.18, 32]} />
          <meshStandardMaterial color="#e9e4da" roughness={0.46} />
        </mesh>
        <mesh position={[0, 0.93, 0]}>
          <cylinderGeometry args={[0.12, 0.13, 0.14, 24]} />
          <meshStandardMaterial {...PLASTIC_DARK} />
        </mesh>
        <mesh position={[0, 1.16, 0]}>
          <coneGeometry args={[0.115, 0.36, 24, 1, true]} />
          <meshStandardMaterial {...PLASTIC_DARK} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Squeeze tube, lying on its side */}
      <group position={[0.06, -0.62, 0.42]} rotation={[Math.PI / 2, 0, -0.42]}>
        <mesh>
          <cylinderGeometry args={[0.15, 0.15, 0.72, 26]} />
          <meshStandardMaterial color="#eceadf" roughness={0.36} metalness={0.12} />
        </mesh>
        {/* Flattened, crimped tail */}
        <mesh position={[0, -0.42, 0]} scale={[1, 1, 0.22]}>
          <cylinderGeometry args={[0.16, 0.16, 0.12, 20]} />
          <meshStandardMaterial color="#cfc9bc" roughness={0.4} metalness={0.12} />
        </mesh>
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.06, 0.11, 0.14, 20]} />
          <meshStandardMaterial color="#eceadf" roughness={0.36} metalness={0.12} />
        </mesh>
        <mesh position={[0, 0.54, 0]}>
          <cylinderGeometry args={[0.062, 0.062, 0.12, 18]} />
          <meshStandardMaterial {...PLASTIC_DARK} />
        </mesh>
      </group>
    </group>
  );
}

/* --- 09 Polish & Finishing ----------------------------------------------- */

function BrushModel() {
  // A lathe profile makes a far more convincing handle than stacked cylinders.
  const handle = useMemo(() => {
    const profile = [
      [0.0, -0.02],
      [0.16, 0.0],
      [0.155, 0.12],
      [0.1, 0.26],
      [0.092, 0.52],
      [0.115, 0.74],
      [0.132, 0.95],
      [0.118, 1.12],
      [0.06, 1.2],
      [0.0, 1.22],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    return new THREE.LatheGeometry(profile, 28);
  }, []);

  return (
    <group rotation={[0.16, 0.5, 0.34]} position={[-0.28, 0.06, 0]}>
      {/* Brush, laid over at an angle rather than standing to attention. */}
      <group rotation={[0, 0, 0.12]}>
        <mesh geometry={handle} position={[0, 0.12, 0]}>
          <meshStandardMaterial color="#c7a274" roughness={0.5} />
        </mesh>
        {/* Ferrule, tapering into the bristles with a visible crimp */}
        <mesh position={[0, 0.02, 0]} scale={[1, 1, 0.42]}>
          <cylinderGeometry args={[0.2, 0.26, 0.34, 26]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
        <mesh position={[0, -0.1, 0]} scale={[1, 1, 0.42]}>
          <cylinderGeometry args={[0.27, 0.27, 0.06, 26]} />
          <meshStandardMaterial {...STEEL_DARK} />
        </mesh>
        {/* Bristles, splaying slightly toward a chiselled tip */}
        <mesh position={[0, -0.42, 0]} scale={[1, 1, 0.4]}>
          <cylinderGeometry args={[0.3, 0.25, 0.62, 26]} />
          <meshStandardMaterial color="#9c8158" roughness={0.95} />
        </mesh>
        <mesh position={[0, -0.74, 0]} scale={[1, 1, 0.36]}>
          <cylinderGeometry args={[0.31, 0.29, 0.08, 26]} />
          <meshStandardMaterial color="#6b5946" roughness={0.98} />
        </mesh>
      </group>

      {/* Polish tin with the lid propped against it. */}
      <group position={[0.96, -0.66, -0.06]}>
        <mesh>
          <cylinderGeometry args={[0.46, 0.46, 0.3, 40]} />
          <meshStandardMaterial {...STEEL_DARK} />
        </mesh>
        <mesh position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.46, 0.022, 8, 40]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
        {/* The polish itself, sitting proud of the rim */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.43, 0.43, 0.04, 36]} />
          <meshStandardMaterial color="#7a4a1e" roughness={0.34} />
        </mesh>
        <mesh position={[0.72, -0.02, 0.16]} rotation={[0.35, 0, 1.2]}>
          <cylinderGeometry args={[0.47, 0.47, 0.06, 40]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      </group>

      {/* Thinner bottle behind, to place the category. */}
      <group position={[0.34, -0.4, -0.66]}>
        <mesh>
          <cylinderGeometry args={[0.26, 0.26, 0.78, 28]} />
          <meshStandardMaterial color="#d8cdb8" roughness={0.28} metalness={0.06} />
        </mesh>
        <mesh position={[0, 0.48, 0]}>
          <cylinderGeometry args={[0.11, 0.2, 0.2, 24]} />
          <meshStandardMaterial color="#d8cdb8" roughness={0.28} metalness={0.06} />
        </mesh>
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[0.115, 0.115, 0.13, 20]} />
          <meshStandardMaterial {...PLASTIC_DARK} />
        </mesh>
      </group>
    </group>
  );
}

/* --- 10 General Hardware: wall-mounted shelf bracket -------------------- */

/**
 * The hardware itself should explain its purpose. A single bracket, bolted to
 * a wall plate and holding a plywood shelf, stays legible from every angle of
 * the rotating stage — unlike a loose pile of unrelated shop parts.
 */
function GeneralHardwareModel() {
  const mountingBolts: [number, number, number][] = [
    [-0.66, 0.34, 0.16],
    [-0.66, -0.18, 0.16],
    [-0.66, -0.55, 0.16],
  ];

  return (
    <group rotation={[0.16, 0.28, -0.04]} scale={1.04} position={[0.05, -0.08, 0]}>
      {/* A narrow wall plate makes the bracket's mounting point unmistakable. */}
      <mesh position={[-0.72, -0.05, -0.28]}>
        <boxGeometry args={[0.36, 1.82, 0.14]} />
        <meshStandardMaterial color="#405255" metalness={0.76} roughness={0.42} />
      </mesh>

      {/* The small plywood shelf provides just enough context to show what the bracket does. */}
      <mesh position={[0.16, 0.68, 0.2]}>
        <boxGeometry args={[2.22, 0.16, 0.94]} />
        <meshStandardMaterial {...VENEER} />
      </mesh>
      <mesh position={[0.16, 0.58, 0.67]}>
        <boxGeometry args={[2.22, 0.05, 0.045]} />
        <meshStandardMaterial {...CORE} />
      </mesh>

      {/* A heavy-duty steel shelf bracket: wall leg, shelf leg and diagonal brace. */}
      <mesh position={[-0.66, -0.04, 0.03]}>
        <boxGeometry args={[0.16, 1.58, 0.18]} />
        <meshStandardMaterial {...STEEL_DARK} />
      </mesh>
      <mesh position={[0.08, 0.5, 0.03]}>
        <boxGeometry args={[1.64, 0.16, 0.18]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[-0.18, 0.02, 0.03]} rotation={[0, 0, -0.79]}>
        <boxGeometry args={[0.16, 1.46, 0.18]} />
        <meshStandardMaterial color="#b8cdd0" metalness={0.9} roughness={0.27} />
      </mesh>

      {mountingBolts.map((position) => (
        <group key={position.join('-')} position={position}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.052, 20]} />
            <meshStandardMaterial color="#d4a65e" metalness={0.76} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.032]}>
            <boxGeometry args={[0.06, 0.012, 0.012]} />
            <meshStandardMaterial color="#1d2628" metalness={0.42} roughness={0.52} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* --- 11 Kitchen Hardware: a cabinet pull --------------------------------- */

/** A wire pull-out basket with its integrated front pull. */
function HandleModel() {
  const W = 1.9;
  const D = 1.05;
  const H = 0.52;
  const rod = useMemo(() => new THREE.CylinderGeometry(0.026, 0.026, 1, 8), []);
  const uprights = 9;
  const runners = 7;

  return (
    <group rotation={[0.42, 0.56, 0]} scale={0.94} position={[0, 0.12, 0]}>
      {/* Basket floor: wires the long way, a few cross-braces under them. */}
      {Array.from({ length: uprights }, (_, i) => {
        const z = -D / 2 + (i / (uprights - 1)) * D;
        return (
          <mesh
            key={`f${i}`}
            geometry={rod}
            position={[0, -H / 2, z]}
            rotation={[0, 0, Math.PI / 2]}
            scale={[1, W, 1]}
          >
            <meshStandardMaterial {...STEEL} />
          </mesh>
        );
      })}
      {Array.from({ length: 3 }, (_, i) => {
        const x = -W / 2 + 0.2 + (i / 2) * (W - 0.4);
        return (
          <mesh
            key={`b${i}`}
            geometry={rod}
            position={[x, -H / 2 - 0.05, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[1, D, 1]}
          >
            <meshStandardMaterial {...STEEL_DARK} />
          </mesh>
        );
      })}

      {/* Sides: horizontal runners front and back, with vertical stiles. */}
      {Array.from({ length: runners }, (_, i) => {
        const y = -H / 2 + (i / (runners - 1)) * H;
        return [-D / 2, D / 2].map((z) => (
          <mesh
            key={`r${i}${z}`}
            geometry={rod}
            position={[0, y, z]}
            rotation={[0, 0, Math.PI / 2]}
            scale={[1, W, 1]}
          >
            <meshStandardMaterial {...STEEL} />
          </mesh>
        ));
      })}
      {Array.from({ length: 5 }, (_, i) => {
        const x = -W / 2 + (i / 4) * W;
        return [-D / 2, D / 2].map((z) => (
          <mesh key={`u${i}${z}`} geometry={rod} position={[x, 0, z]} scale={[1, H, 1]}>
            <meshStandardMaterial {...STEEL_DARK} />
          </mesh>
        ));
      })}
      {/* Ends */}
      {[-W / 2, W / 2].map((x) =>
        Array.from({ length: 4 }, (_, i) => {
          const y = -H / 2 + (i / 3) * H;
          return (
            <mesh
              key={`e${x}${i}`}
              geometry={rod}
              position={[x, y, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[1, D, 1]}
            >
              <meshStandardMaterial {...STEEL} />
            </mesh>
          );
        }),
      )}

      {/* Rim, so the top edge reads as finished rather than cut off. */}
      {[-D / 2, D / 2].map((z) => (
        <mesh
          key={`rim${z}`}
          position={[0, H / 2, z]}
          rotation={[0, 0, Math.PI / 2]}
          scale={[1, W, 1]}
        >
          <cylinderGeometry args={[0.04, 0.04, 1, 10]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      ))}

      {/* Pull handle on the front face */}
      <group position={[0, 0.04, D / 2 + 0.26]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.075, 0.075, 1.15, 24]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
        {[-0.46, 0.46].map((x) => (
          <mesh key={x} position={[x, 0, -0.13]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.26, 18]} />
            <meshStandardMaterial {...STEEL_DARK} />
          </mesh>
        ))}
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
  'General Hardware': GeneralHardwareModel,
  'Kitchen Hardware': HandleModel,
  'Sheets, Mesh & Seals': JaliModel,
};
