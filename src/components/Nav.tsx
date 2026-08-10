import { SHOP } from '../data/catalog';

export default function Nav() {
  return (
    <header className="nav">
      <a className="nav__brand" href="#top" aria-label={`${SHOP.name} — home`}>
        <img className="nav__logo" src="/logo-mark.png" alt="" width={508} height={511} />
        <span className="nav__mark">
          Mahadev
          <span>Plywood &amp; Hardware</span>
        </span>
      </a>
      <nav className="nav__links" aria-label="Primary navigation">
        <a href="#counter">The counter</a>
        <a href="#stock">Shop catalogue</a>
        <a href="#contact">Visit the store</a>
      </nav>
      <a className="nav__call" href={SHOP.phoneHref}>
        <span className="nav__callLabel">Call</span>
        {SHOP.phone}
      </a>
    </header>
  );
}
