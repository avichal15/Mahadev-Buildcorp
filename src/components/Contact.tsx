import { useEffect, useRef, useState } from 'react';
import { BRANDS, CATALOG, SHOP, TOTAL_TYPES } from '../data/catalog';
import { useOnceInViewport, useReducedMotion } from '../lib/hooks';

const STATS = [
  { value: TOTAL_TYPES, label: 'Types carried' },
  { value: CATALOG.length, label: 'Categories' },
  { value: BRANDS.length, label: 'Brands stocked' },
];

function CountingNumber({ value, start, delay }: { value: number; start: boolean; delay: number }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(() => (reduced ? value : 0));
  const hasStarted = useRef(false);

  useEffect(() => {
    if (reduced) {
      setShown(value);
      return;
    }
    if (!start || hasStarted.current) return;

    hasStarted.current = true;
    let frame = 0;
    let last = -1;
    const duration = Math.min(1420, Math.max(760, 610 + value * 4));
    const timer = window.setTimeout(() => {
      const startedAt = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - (1 - progress) ** 4;
        const next = Math.round(value * eased);

        if (next !== last) {
          last = next;
          setShown(next);
        }

        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [delay, reduced, start, value]);

  return <span className="proof__number" aria-hidden="true">{shown}</span>;
}

export default function Contact() {
  const { address } = SHOP;
  const [mapInteractive, setMapInteractive] = useState(false);
  const stats = useRef<HTMLDListElement>(null);
  const statsInView = useOnceInViewport(stats);
  const mapBlock = useRef<HTMLDivElement>(null);
  // Generous margin so the tiles are already there by the time it is on screen.
  const mapSeen = useOnceInViewport(mapBlock, '600px');
  const [mapDue, setMapDue] = useState(false);

  /*
   * Backstop for the observer. The point of gating the iframe is to keep it out
   * of the initial load, not to hide it — so once the page has settled, mount
   * it regardless. Without this, an observer that never delivers would leave a
   * reader with no map and no way to get one.
   */
  useEffect(() => {
    const id = window.setTimeout(() => setMapDue(true), 2500);
    return () => window.clearTimeout(id);
  }, []);

  const mapNear = mapSeen || mapDue;

  return (
    <section className="section contact" id="contact">
      <div className="shell">
        <div className="split split--end">
          <div className="reveal reveal--drop">
            <p className="tag contact__eyebrow">03 / Find the counter</p>
            <h2 className="d2">
              Come to
              <br />
              <span className="grad ital">the counter.</span>
            </h2>
          </div>

          <div className="proof__col reveal" style={{ '--d': '120ms' } as React.CSSProperties}>
            <p className="lede">
              Tell us the size and the grade. No catalogue hunting, no sales pitch. We&rsquo;ll have
              it cut and at the counter.
            </p>
            <div>
              <p className="tag proof__statsTitle">Stock at a glance</p>
              <dl className="proof__stats" ref={stats} data-live={statsInView || undefined}>
                {STATS.map((stat, index) => (
                  <div
                    className="proof__stat"
                    key={stat.label}
                    style={{ '--sd': `${index * 130}ms` } as React.CSSProperties}
                  >
                    <dt>{stat.label}</dt>
                    <dd>
                      <CountingNumber
                        value={stat.value}
                        start={statsInView}
                        delay={330 + index * 130}
                      />
                      <span className="sr-only">{stat.value}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        <div className="contact__rows">
          <div className="contact__row reveal">
            <span className="tag">Call or WhatsApp</span>
            <a className="contact__value" href={SHOP.phoneHref}>
              {SHOP.phone}
            </a>
          </div>

          <div className="contact__row reveal" style={{ '--d': '80ms' } as React.CSSProperties}>
            <span className="tag">Shop</span>
            <p className="contact__value contact__value--muted">
              {address.line1}
              <br />
              {address.line2}
              <br />
              {address.city}, {address.state} {address.pin}
            </p>
          </div>

          <div className="contact__row reveal" style={{ '--d': '160ms' } as React.CSSProperties}>
            <span className="tag">Open</span>
            <p className="contact__value">{SHOP.hours}</p>
          </div>

          <div className="contact__row reveal" style={{ '--d': '240ms' } as React.CSSProperties}>
            <span className="tag">Email</span>
            <a className="contact__value contact__value--muted" href={`mailto:${SHOP.email}`}>
              {SHOP.email}
            </a>
          </div>
        </div>

        <div className="contact__actions reveal">
          <a className="cta" href={SHOP.phoneHref}>
            <span className="cta__dot" />
            Call {SHOP.phone}
          </a>
          <a
            className="cta cta--steel"
            href={SHOP.whatsappHref}
            target="_blank"
            rel="noreferrer"
          >
            <span className="cta__dot" />
            WhatsApp us
          </a>
          <a className="cta cta--ghost" href={SHOP.mapsUrl} target="_blank" rel="noreferrer">
            <span className="cta__dot" />
            Directions
          </a>
        </div>

        <section className="location reveal" aria-labelledby="location-title">
          <div className="location__intro">
            <div>
              <p className="tag tag--bright">Daurli, Meerut / 250001</p>
              <h3 className="d3 location__title" id="location-title">
                Find the
                <br />
                <span className="grad ital">counter.</span>
              </h3>
            </div>
            <p className="location__note">
              Near Isha Apartments, Kaushalya Nagar. A straightforward stop when the drawing
              turns into a material list.
            </p>
          </div>

          <div className="location__map" ref={mapBlock}>
            <div className="location__mapViewport" data-interactive={mapInteractive || undefined}>
              {/*
               * The iframe is only put in the document once this block is close
               * to view. `loading="lazy"` defers the network fetch but still
               * creates a browsing context that runs its own scripts and
               * compositing, which is what a map costs on a phone. Not
               * rendering it at all until it is needed costs nothing.
               */}
              {mapNear ? (
                <iframe
                  title={`Interactive map to ${SHOP.name}`}
                  src={SHOP.mapsEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  tabIndex={mapInteractive ? 0 : -1}
                />
              ) : (
                <div className="location__mapPlaceholder" aria-hidden="true" />
              )}
              {/* Scan lines over the tiles — the last of the three overlays
                  that put the map in the same light as the page. */}
              <div className="location__wash" aria-hidden="true" />
            </div>
            <div className="location__mapBar">
              <div className="location__marker">
                <span className="location__pin" aria-hidden="true" />
                <span>
                  <strong>Mahadev Plywood &amp; Hardware</strong>
                  <small>
                    {address.line1}, {address.line2}
                  </small>
                </span>
              </div>
              <div className="location__mapActions">
                <button
                  className="location__mapToggle"
                  type="button"
                  aria-pressed={mapInteractive}
                  onClick={() => setMapInteractive((current) => !current)}
                >
                  {mapInteractive ? 'Lock map scrolling' : 'Explore map'}
                </button>
                <a
                  className="location__directions"
                  href={SHOP.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Maps <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="footer">
          {/* The lockup itself, rather than a giant text wordmark that had to be
              hyphenated to fit a phone. */}
          <img
            className="footer__logo"
            src="/logo.png"
            alt={SHOP.name}
            width={694}
            height={664}
            loading="lazy"
          />
          <div className="footer__base">
            <p className="tag tag--bright">{SHOP.tagline}</p>
            <p className="tag">
              {SHOP.legalName} · {address.city}, {address.state}
            </p>
          </div>
        </footer>
      </div>
    </section>
  );
}
