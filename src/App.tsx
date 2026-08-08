import { ReactLenis } from 'lenis/react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import GrainBand from './components/GrainBand';
import Stock from './components/Stock';
import Contact from './components/Contact';
import { useReducedMotion, useReveals } from './lib/hooks';

export default function App() {
  const reduced = useReducedMotion();
  useReveals();

  return (
    <ReactLenis root options={{ lerp: reduced ? 1 : 0.09, duration: 1.1 }}>
      <a className="skip" href="#stock">
        Skip to what&rsquo;s in stock
      </a>
      {/* Warm light pooling behind everything, so the page is never flat black. */}
      <div className="atmosphere" aria-hidden="true" />
      <Nav />
      <main id="top">
        <Hero />
        <GrainBand />
        <Stock />
        <Contact />
      </main>
      {/* Film grain over the lot — keeps large flat areas from reading as dead
          vector fills. */}
      <div className="grain-overlay" aria-hidden="true" />
    </ReactLenis>
  );
}
