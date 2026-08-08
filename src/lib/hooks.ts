import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Scroll travel across an element, clamped 0…1.
 *
 * Pin-aware: for a tall section holding a sticky child, the travel that matters
 * is the distance the pin is actually held for — the section's height minus one
 * viewport — not the full section height. Getting this wrong makes a scrubbed
 * scene finish early and then sit dead for the rest of the section.
 *
 * Also mirrors the value onto the element as `--p`, so CSS can drive parallax
 * off the same number without a React render per frame.
 */
export function useScrollProgress(target: RefObject<HTMLElement | null>) {
  const progress = useRef(0);

  useEffect(() => {
    let top = 0;
    let travel = 1;
    let last = -1;
    let raf = 0;

    // Layout reads are the expensive part, so they happen on resize only.
    const measure = () => {
      const el = target.current;
      if (!el) return;
      top = el.offsetTop;
      travel = Math.max(1, el.offsetHeight - window.innerHeight);
    };

    /*
     * Sampled on rAF rather than from the `scroll` event. Lenis animates the
     * scroll position frame by frame, so rAF is the cadence that actually
     * matches what is on screen; the scroll event is coarser, and in some
     * embedded browsers does not fire at all. Only `scrollY` is read here —
     * no layout is forced.
     */
    const tick = () => {
      const el = target.current;
      if (el) {
        const p = Math.min(1, Math.max(0, (window.scrollY - top) / travel));
        if (Math.abs(p - last) > 0.0005) {
          last = p;
          progress.current = p;
          el.style.setProperty('--p', p.toFixed(4));
        }
      }
      raf = requestAnimationFrame(tick);
    };

    measure();
    tick();
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [target]);

  return progress;
}

/**
 * Pointer in -1…1, tracked on the window rather than through the R3F event
 * system so the canvas never intercepts a scroll or a tap.
 */
export function usePointer() {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return pointer;
}

/**
 * Marks every `.reveal` once it enters the viewport.
 *
 * This writes a data attribute rather than a class on purpose. React owns the
 * `className` of these elements, so any class added imperatively here gets
 * wiped the next time the component re-renders for an unrelated reason — and
 * because the observer has already unobserved that node, the element would
 * stay invisible for good. React never touches `data-in`.
 */
export function useReveals() {
  useEffect(() => {
    const all = () => document.querySelectorAll<HTMLElement>('.reveal');
    const show = (el: Element) => {
      (el as HTMLElement).dataset.in = 'true';
    };

    if (!('IntersectionObserver' in window)) {
      all().forEach(show);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show(entry.target);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.06 },
    );

    all().forEach((n) => io.observe(n));

    // If the observer never delivers — stalled lifecycle, odd embedded browser
    // — reveal everything rather than leave a blank page. Only fires when
    // nothing at all has been revealed, so real scroll reveals still work.
    const safety = window.setTimeout(() => {
      if (!document.querySelector('.reveal[data-in]')) all().forEach(show);
    }, 2200);

    return () => {
      window.clearTimeout(safety);
      io.disconnect();
    };
  }, []);
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const sync = () => setMatches(mql.matches);
    sync();
    mql.addEventListener('change', sync);
    // Some embedded/preview browsers resize without emitting a matchMedia
    // change, which would strand the component on its first-paint answer.
    window.addEventListener('resize', sync);
    return () => {
      mql.removeEventListener('change', sync);
      window.removeEventListener('resize', sync);
    };
  }, [query]);

  return matches;
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');

/**
 * Viewport width in state, tracked through three signals because none is
 * reliable alone: `resize` misses programmatic viewport changes, matchMedia
 * change misses some embedded browsers, and a ResizeObserver on the root
 * catches layout changes both of those sleep through. Layout decisions that
 * move real content depend on this being right.
 */
export function useIsNarrow(maxWidth = 1023) {
  const [narrow, setNarrow] = useState(() =>
    typeof window === 'undefined' ? false : window.innerWidth <= maxWidth,
  );

  useEffect(() => {
    const sync = () => setNarrow(document.documentElement.clientWidth <= maxWidth);
    sync();

    const mql = window.matchMedia(`(max-width: ${maxWidth}px)`);
    mql.addEventListener('change', sync);
    window.addEventListener('resize', sync);

    const ro = new ResizeObserver(sync);
    ro.observe(document.documentElement);

    return () => {
      mql.removeEventListener('change', sync);
      window.removeEventListener('resize', sync);
      ro.disconnect();
    };
  }, [maxWidth]);

  return narrow;
}
