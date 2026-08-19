import {
  lazy,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import SceneBoundary from './SceneBoundary';
import { CATALOG, SHOP, TOTAL_TYPES, familyOf, type Category } from '../data/catalog';
import { useIsNarrow, usePointer, useReducedMotion } from '../lib/hooks';

const ProductStage = lazy(() => import('./scene/ProductStage'));

/** Amber for the timber side of the counter, cyan for the metal side. */
const ACCENT: Record<string, { accent: string; accent2: string; label: string }> = {
  timber: { accent: 'var(--ember)', accent2: 'var(--honey)', label: 'Timber' },
  metal: { accent: 'var(--steel)', accent2: 'var(--steel-deep)', label: 'Metal' },
};

function Row({
  category,
  index,
  open,
  showStageSlot,
  onSelect,
  onKeyDown,
  onPointerMove,
}: {
  category: Category;
  index: number;
  open: boolean;
  /** Narrow screens reserve space here; the single canvas is placed over it. */
  showStageSlot: boolean;
  onSelect: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
  onPointerMove: (e: PointerEvent<HTMLDivElement>) => void;
}) {
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  /*
   * Measure after the open state has committed, never before. The inline stage
   * only exists in the DOM once this row is the open one, so measuring inside
   * the click handler would read a drawer without the product in it and clip
   * the chip list. Keyed on `open` so it re-runs post-commit; the observer then
   * keeps it honest as the face loads and the chips rewrap.
   */
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const measure = () => setHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  return (
    <div
      role="listitem"
      /* Static string on purpose: see useReveals. If this becomes dynamic the
         reveal state gets clobbered on every toggle. */
      className="row reveal"
      data-open={open || undefined}
      style={
        {
          '--d': `${Math.min(index, 8) * 40}ms`,
          '--accent': ACCENT[familyOf(category.title)].accent,
        } as React.CSSProperties
      }
      onPointerMove={onPointerMove}
    >
      <span className="row__halftone" aria-hidden="true" />
      <button
        type="button"
        className="row__trigger"
        onClick={onSelect}
        onKeyDown={onKeyDown}
        aria-expanded={open}
      >
        <span className="row__index">{String(index + 1).padStart(2, '0')}</span>
        <span className="row__body">
          <span className="row__title">{category.title}</span>
          <span className="row__blurb">{category.blurb}</span>
        </span>
      </button>

      <div className="row__list" style={{ height: open ? height : 0 }}>
        <div ref={inner}>
          {/*
            Only a reservation. The canvas is mounted once, outside the rail,
            and positioned over this box — moving it between rows would tear
            down and rebuild the WebGL context on every tap.
          */}
          {showStageSlot && <div className="row__stageSlot" aria-hidden="true" />}
          <ul>
            {category.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function Stock() {
  const [active, setActive] = useState(0);
  const pointer = usePointer();
  const reduced = useReducedMotion();
  const narrow = useIsNarrow(1023);
  const rail = useRef<HTMLDivElement>(null);
  const category = CATALOG[active];
  const family = familyOf(category.title);
  const theme = ACCENT[family];

  // Feeds the halftone bloom its centre.
  const track = useCallback((e: PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }, []);

  const onKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const dir = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + CATALOG.length) % CATALOG.length;
    setActive(next);
    rail.current?.querySelectorAll<HTMLButtonElement>('.row__trigger')[next]?.focus();
  }, []);

  const stageLayer = useRef<HTMLDivElement>(null);

  /*
   * Follows the open row's reserved slot frame by frame while the drawer
   * animates, rather than transitioning to a position measured up front —
   * during a switch the closing row and the opening row are both moving, so
   * any single measurement is stale before it lands. Reading layout each frame
   * for the ~700ms of the animation is exact and costs nothing afterwards.
   */
  useLayoutEffect(() => {
    if (!narrow) return;
    const layer = stageLayer.current;
    const railEl = rail.current;
    if (!layer || !railEl) return;

    let raf = 0;
    let until = 0;

    const place = (settled = false) => {
      const slot = railEl.querySelector<HTMLElement>('.row__stageSlot');
      if (!slot) {
        layer.style.opacity = '0';
        return;
      }
      const slotBox = slot.getBoundingClientRect();
      const railBox = railEl.getBoundingClientRect();
      const drawer = slot.closest<HTMLElement>('.row__list');
      const drawerBox = drawer?.getBoundingClientRect();

      /*
       * While the drawer is opening it clips from the bottom, so the canvas is
       * only as tall as the part of the slot on show. Once the animation is
       * done we stop asking the drawer and use the slot outright — otherwise a
       * transition that never runs would leave the stage permanently hidden.
       */
      const shown =
        settled || !drawerBox
          ? slotBox.height
          : Math.max(0, Math.min(slotBox.height, drawerBox.bottom - slotBox.top));

      layer.style.transform = `translate3d(${Math.round(slotBox.left - railBox.left)}px, ${Math.round(
        slotBox.top - railBox.top,
      )}px, 0)`;
      layer.style.width = `${Math.round(slotBox.width)}px`;
      layer.style.height = `${Math.round(shown)}px`;
      layer.style.opacity = shown > 10 ? '1' : '0';
    };

    const loop = (now: number) => {
      place();
      if (now < until) raf = requestAnimationFrame(loop);
    };

    const run = (ms: number) => {
      until = performance.now() + ms;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };

    /*
     * Placed once synchronously and again after the drawer has finished, so the
     * canvas lands correctly even somewhere rAF never runs. The rAF loop only
     * smooths the travel in between — it is never the thing that makes the
     * stage appear.
     */
    place();
    const settle = window.setTimeout(() => place(true), 560);
    run(700);

    const onResize = () => {
      place(true);
      run(250);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
      window.removeEventListener('resize', onResize);
    };
  }, [active, narrow]);

  const stage = (
    <SceneBoundary>
      <ProductStage
        active={category.title}
        family={family}
        pointer={pointer}
        reduced={reduced}
      />
    </SceneBoundary>
  );

  return (
    <section className="section" id="stock">
      <div className="shell">
        <div className="split stock__head">
          <div className="reveal reveal--drop">
            <p className="tag stock__eyebrow">02 / Shop catalogue</p>
            <h2 className="d2">
              The whole
              <br />
              <span className="grad ital">catalogue</span>
            </h2>
          </div>
          <div className="reveal" style={{ '--d': '120ms' } as React.CSSProperties}>
            <p className="lede">
              {TOTAL_TYPES} types across {CATALOG.length} categories, from marine ply down to a
              single wall plug. Tap a category to turn the product over.
            </p>
            <p className="tag" style={{ marginTop: '1.4rem' }}>
              Not listed? Ask at the counter — {SHOP.phone}
            </p>
          </div>
        </div>

        {/* One custom property, set here, retints the stage, the rail, the
            chips and the glow — the palette follows the product on show. */}
        <div
          className="catalogue"
          style={{ '--accent': theme.accent, '--accent-2': theme.accent2 } as React.CSSProperties}
        >
          {/* Wide screens get the museum stage pinned alongside the rail. Narrow
              screens would leave it stranded off-screen above, so there the
              product moves into the card the reader actually tapped. */}
          {!narrow && (
            <div className="catalogue__stage">
              <div className="stage__frame" onPointerMove={track}>
                <span className="stage__halftone" aria-hidden="true" />
                <div className="stage__canvas" aria-hidden="true">
                  {stage}
                </div>
                <div className="stage__plate">
                  <span className="stage__family">{theme.label}</span>
                  <p className="stage__name">{category.title}</p>
                  <p className="stage__count">
                    {String(active + 1).padStart(2, '0')} /{' '}
                    {String(CATALOG.length).padStart(2, '0')} · {category.items.length} types ·{' '}
                    {category.blurb.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="catalogue__rail" ref={rail} role="list">
            {/*
              Narrow screens mount the canvas exactly once, here, and slide it
              over whichever row is open. Re-parenting it into each row is what
              forced a new WebGL context, a fresh environment bake and a full
              shader recompile on every tap.
            */}
            {narrow && (
              <div className="rail__stageLayer" ref={stageLayer} aria-hidden="true">
                <span className="row__stageGlow" aria-hidden="true" />
                <div className="stage__canvas">{stage}</div>
                <span className="row__stageTag tag">{theme.label} · drag to turn</span>
              </div>
            )}
            {CATALOG.map((c, i) => (
              <Row
                key={c.title}
                category={c}
                index={i}
                open={i === active}
                showStageSlot={narrow && i === active}
                onSelect={() => setActive(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                onPointerMove={track}
              />
            ))}
          </div>
        </div>

        <div className="stock__note reveal">
          <p className="tag">Cut to size · Edge banding · Loaded to your vehicle</p>
          <a className="cta cta--ghost" href={SHOP.phoneHref}>
            <span className="cta__dot" />
            Check stock before you ride over
          </a>
        </div>
      </div>
    </section>
  );
}
