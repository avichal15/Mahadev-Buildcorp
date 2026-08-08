import { SHOP } from '../data/catalog';

export default function Nav() {
  return (
    <header className="nav">
      <a className="nav__brand" href="#top" aria-label={`${SHOP.name} — home`}>
        {/* The artwork ships on black, so screen blending drops the ground and
            keeps the glow, whatever warmth is behind it. */}
        <img className="nav__logo" src="/logo-mark.webp" alt="" width={200} height={128} />
        <span className="nav__mark">
          Mahadev Buildcorp
          <span>Plywood &amp; Hardware</span>
        </span>
      </a>
      <a className="nav__call" href={SHOP.phoneHref}>
        <span className="nav__callLabel">Call</span>
        {SHOP.phone}
      </a>
    </header>
  );
}
