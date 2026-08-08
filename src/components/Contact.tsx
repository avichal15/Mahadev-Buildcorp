import { BRANDS, CATALOG, SHOP, TOTAL_LINES } from '../data/catalog';

const STATS = [
  { value: TOTAL_LINES, label: 'Lines carried' },
  { value: CATALOG.length, label: 'Categories' },
  { value: BRANDS.length, label: 'Brands stocked' },
];

export default function Contact() {
  const { address } = SHOP;

  return (
    <section className="section contact" id="contact">
      <div className="shell">
        <div className="split split--end">
          <h2 className="d2 reveal">
            Come to
            <br />
            <span className="grad ital">the counter.</span>
          </h2>

          <div className="proof__col reveal" style={{ '--d': '120ms' } as React.CSSProperties}>
            <p className="lede">
              Tell us the size and the grade. No catalogue hunting, no sales pitch — we&rsquo;ll have
              it cut and at the counter.
            </p>
            <div className="proof__stats">
              {STATS.map((stat) => (
                <div className="proof__stat" key={stat.label}>
                  <div className="numeral grad">{stat.value}</div>
                  <p className="tag">{stat.label}</p>
                </div>
              ))}
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

        <footer className="footer">
          {/* The lockup itself, rather than a giant text wordmark that had to be
              hyphenated to fit a phone. */}
          <img
            className="footer__logo"
            src="/logo.webp"
            alt={`${SHOP.name} — ${SHOP.legalName}`}
            width={720}
            height={658}
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
