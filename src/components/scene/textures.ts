import * as THREE from 'three';

let veneer: THREE.CanvasTexture | null = null;

/**
 * Veneer figure, drawn once to a canvas and reused by every sheet on the page.
 *
 * Deliberately greyscale: three multiplies `map` by `color`, so one texture
 * tints correctly for a pale face ply and a dark core alike. Painting the wood
 * colour in here would flatten that back to a single species.
 */
export function veneerTexture(): THREE.CanvasTexture {
  if (veneer) return veneer;

  const size = 512;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#d8d8d8';
  ctx.fillRect(0, 0, size, size);

  // Long grain running the length of the sheet, wandering the way real figure
  // does rather than sitting in straight stripes.
  const lines = 260;
  for (let i = 0; i < lines; i++) {
    const y = (i / lines) * size + (Math.random() - 0.5) * 3;
    const dark = Math.random();
    const alpha = 0.04 + dark * 0.16;
    ctx.strokeStyle = dark > 0.82 ? `rgba(60,42,26,${alpha})` : `rgba(255,255,255,${alpha * 0.7})`;
    ctx.lineWidth = 0.6 + Math.random() * (dark > 0.9 ? 2.4 : 1.1);
    ctx.beginPath();

    const amp = 3 + Math.random() * 12;
    const freq = 0.004 + Math.random() * 0.01;
    const phase = Math.random() * Math.PI * 2;
    ctx.moveTo(0, y);
    for (let x = 0; x <= size; x += 8) {
      ctx.lineTo(x, y + Math.sin(x * freq + phase) * amp);
    }
    ctx.stroke();
  }

  // A few knots and mineral streaks so the field is not perfectly uniform.
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 8 + Math.random() * 26;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(58,40,24,0.34)');
    g.addColorStop(0.6, 'rgba(58,40,24,0.10)');
    g.addColorStop(1, 'rgba(58,40,24,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.45, Math.random() * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  veneer = new THREE.CanvasTexture(c);
  veneer.wrapS = THREE.RepeatWrapping;
  veneer.wrapT = THREE.RepeatWrapping;
  veneer.repeat.set(1.6, 1);
  veneer.anisotropy = 4;
  return veneer;
}
