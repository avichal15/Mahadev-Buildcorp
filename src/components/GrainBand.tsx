import { lazy } from 'react';
import SceneBoundary from './SceneBoundary';
import { BRANDS } from '../data/catalog';
import { useReducedMotion } from '../lib/hooks';

const GrainScene = lazy(() => import('./scene/GrainScene'));

function BrandRow({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className="marquee__row" aria-hidden={duplicate || undefined}>
      {BRANDS.map((brand) => (
        <span className="marquee__cell" key={brand}>
          <span className="marquee__item">{brand}</span>
          <span className="marquee__sep" aria-hidden="true" />
        </span>
      ))}
    </div>
  );
}

export default function GrainBand() {
  const reduced = useReducedMotion();

  return (
    <section className="grain section" id="counter">
      {/* Presence is CSS's call, not JS's — a media query that mis-fires must
          never be able to change what is in the document. */}
      <div className="grain__canvas" aria-hidden="true">
        <SceneBoundary>
          <GrainScene reduced={reduced} />
        </SceneBoundary>
      </div>

      <div className="grain__inner shell">
        <div className="split split--end">
          <div className="reveal">
            <p className="tag" style={{ marginBottom: '1.4rem' }}>
              Why builders keep coming back
            </p>
            <h2 className="d2 grain__statement">
              One counter.
              <br />
              The <span className="grad ital">whole job.</span>
            </h2>
          </div>

          <div className="grain__aside reveal" style={{ '--d': '120ms' } as React.CSSProperties}>
            <p className="lede">
              A missing hinge costs a carpenter half a day riding between shops. We carry boards,
              laminates, fittings, fasteners, adhesives and polish under one roof — so the job
              finishes on the day it started.
            </p>
            <p className="tag">Trade rates · Bulk supply · Site delivery on request</p>
          </div>
        </div>

        <div className="brands">
          <p className="tag" style={{ marginBottom: '1.5rem' }}>
            Brands on the shelf
          </p>
          <div className="marquee">
            <div className="marquee__track">
              <BrandRow />
              <BrandRow duplicate />
            </div>
          </div>
        </div>
      </div>

      <div className="fade-top" aria-hidden="true" />
      <div className="fade-bottom" aria-hidden="true" />
    </section>
  );
}
