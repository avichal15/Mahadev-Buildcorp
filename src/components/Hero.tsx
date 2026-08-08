import { lazy, useRef } from 'react';
import SceneBoundary from './SceneBoundary';
import { usePointer, useReducedMotion, useScrollProgress } from '../lib/hooks';
import { SHOP, TOTAL_LINES } from '../data/catalog';

const HeroScene = lazy(() => import('./scene/HeroScene'));

/**
 * The hero is a pinned scene, not a screen you scroll past. The section runs
 * taller than the viewport, the frame sticks for that whole run, and the ply
 * stack opens under scrub while the copy parallaxes out of the way — so the
 * material gets a beat of its own before the page moves on.
 */
export default function Hero() {
  const hero = useRef<HTMLElement>(null);
  const scroll = useScrollProgress(hero);
  const pointer = usePointer();
  const reduced = useReducedMotion();

  return (
    <section className="hero" ref={hero}>
      <div className="hero__pin">
        <div className="hero__canvas" aria-hidden="true">
          <SceneBoundary>
            <HeroScene scroll={scroll} pointer={pointer} reduced={reduced} />
          </SceneBoundary>
        </div>

        <div className="hero__veil" aria-hidden="true" />

        <div className="hero__inner shell">
          <div className="hero__grid">
            <div>
              <p
                className="tag tag--bright enter"
                style={{ '--ed': '260ms', marginBottom: '1.6rem' } as React.CSSProperties}
              >
                {SHOP.legalName} — Daurli, Meerut
              </p>
              <h1 className="d1 hero__title">
                <span className="enter" style={{ '--ed': '380ms' } as React.CSSProperties}>
                  Every layer
                </span>
                <em className="grad enter" style={{ '--ed': '500ms' } as React.CSSProperties}>
                  in stock
                </em>
              </h1>
            </div>

            <div className="hero__aside">
              <p className="lede enter" style={{ '--ed': '660ms' } as React.CSSProperties}>
                Plywood, laminates and {TOTAL_LINES} lines of hardware, on the shelf for
                Meerut&rsquo;s carpenters, contractors and builders.
              </p>
              <div className="enter" style={{ '--ed': '780ms', marginTop: '2rem' } as React.CSSProperties}>
                <a className="cta" href={SHOP.phoneHref}>
                  <span className="cta__dot" />
                  Call {SHOP.phone}
                </a>
              </div>
            </div>
          </div>

          <div
            className="hero__foot enter"
            style={{ '--ed': '900ms', marginTop: 'clamp(38px, 6vh, 74px)' } as React.CSSProperties}
          >
            <div className="hero__scroll">
              <i />
              <span className="tag">Scroll to open the stack</span>
            </div>
            <p className="tag">
              Open {SHOP.hours} · {SHOP.address.line2}, {SHOP.address.city}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
