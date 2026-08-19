# Mahadev Plywood & Hardware

Website for Mahadev Plywood & Hardware, Daurli, Meerut.

```bash
npm run dev
```

Then open the printed localhost URL. `npm run build` produces `dist/`, `npm run preview` serves it, `npm run lint` runs oxlint.

`npm run build:preview` writes **`mahadev-preview.html`** in the project root — the entire site as one self-contained file (~1.4 MB) that runs straight from disk with no server, for sending to someone who just wants to look at it. It rebuilds with code-splitting disabled, so run `npm run build` afterwards to restore a deployable `dist/`. The file is written outside `dist/` on purpose, since that build empties the directory.

## Colour logic

The shop splits in two, and so does the palette: **amber for timber** (boards,
laminates, adhesives, polish) and **cyan for metal** (locks, window and
furniture hardware, fasteners, mesh). `familyOf()` in `src/data/catalog.ts`
decides which, and everything downstream — the stage glow, the rail rows, the
chips, the 3D lighting rig — reads a single `--accent` custom property. So the
colour tells you which half of the counter you are standing at.

Ground is a warm near-black (`#0a0706`), never pure, with drifting light pools
behind the content and a film-grain overlay on top.

## Shape of it

Four sections:

1. **Hero** — a **pinned, scroll-scrubbed scene**, not a screen you scroll past. The section runs 215vh (165vh on phones) and the frame sticks for that whole run while the ply stack opens under scrub, the camera dollies in, the copy parallaxes up and clears, and the veil thins. Standing in a timber yard at five in the evening: a low sun behind it, four raking light shafts, and sawdust hanging in them, with bloom turning lit veneer edges into actual light.
2. **Counter** — the pitch, over a procedural wood-grain shader composited with `mix-blend-mode: exclusion`, plus the brand marquee.
3. **Catalogue** — twelve hand-built product models, one per category, 165 lines total. **Above 1024px** the model sits on a sticky stage beside the category rail. **At or below 1024px that stage would be stranded off-screen above whichever card you tapped**, so the model moves into the open card instead. One `<Canvas>` either way — see `useIsNarrow` in `src/lib/hooks.ts`.
4. **Contact** — phone, shop, hours, email, a warm-filtered map, and a borderless footer.

## Where things live

| Path | What |
| --- | --- |
| `src/data/catalog.ts` | Every product line, brand, and contact detail. **Edit business facts here only.** |
| `src/components/scene/products.tsx` | The twelve product models, built from three.js primitives. |
| `src/components/scene/PlyStack.tsx` | Hero laminate stack. |
| `src/components/scene/HeroAtmosphere.tsx` | Sun, light shafts and sawdust. All three are additive and depth-write-free, so order matters — `renderOrder` is set deliberately. |
| `src/components/scene/GrainField.tsx` | Wood-grain fragment shader. |
| `src/index.css` | Tokens, type scale, layout. |
| `public/logo.png` | Full lockup, used in the footer. |
| `public/logo-mark.png` | Icon only (no text), used in the nav. |

## Notes for whoever picks this up

- **All imagery is original.** The product models are generated from primitives rather than photographed or sourced, so there is nothing here with a licence attached. Real photographs of the shop and stock would strengthen the page further — drop them in and they will sit comfortably alongside the 3D.
- **The gold logo artwork uses transparency,** so keep its alpha channel intact when replacing or optimizing the PNG files.
- **In `scripts/build-preview.mjs`, always replace via a function, never a replacement string.** `String.replace` treats `$&` in a replacement *string* as "the matched text", and minified React contains `.replace(A, "$&/")`. Passing the bundle in as a replacement string splices the matched `<script>` tag into React's key-escaping code and silently corrupts the output.
- **Frame cost on phones is mostly compositing, not the 3D.** A full-screen `mix-blend-mode`, a `backdrop-filter` on a fixed bar, and a drifting layer of large gradients each force per-frame work over the whole page. All three are desktop-only; the mobile block turns them off. Re-enabling any of them globally will show up as scroll jank long before the WebGL does.
- **`antialias` is off on the hero canvas on purpose.** With an EffectComposer present the image resolves through its own render targets, so MSAA on the default framebuffer is never sampled and only costs memory. Edge smoothing comes from the composer's `multisampling` instead.
- **Bloom runs at reduced `resolutionScale`** — it is a blur, so it does not need full resolution, and it is the most expensive pass in the scene.
- **The map iframe is gated on viewport with a timed backstop.** `loading="lazy"` only defers the fetch; the element still creates a browsing context that runs scripts. It is not rendered at all until needed — but it always mounts eventually, so a silent observer can never leave a reader without a map.
- **Scroll progress is sampled on rAF, not from the `scroll` event.** Lenis animates the scroll position frame by frame, so rAF is the cadence that matches what is on screen; the scroll event is coarser and some embedded browsers never fire it at all. The hook caches its layout reads and only recomputes them on resize, so the per-frame cost is one `scrollY` read.
- **`useScrollProgress` divides by height minus one viewport,** because that is the distance a pinned child is actually held for. Divide by the full section height and the scrub finishes early, then sits dead for the rest of the section.
- **Measure expanding drawers after the open state commits, not in the click handler.** The in-card product stage only exists in the DOM once its row is the open one, so measuring on click reads a drawer without the product in it and clips the chip list. The `useLayoutEffect` is keyed on `open` for exactly this reason.
- **three.js is code-split.** First paint ships ~72 kB gzip; the renderer and the postprocessing pass load after, in their own chunks. Keep `Canvas` out of eagerly-imported modules or that regresses.
- **Bloom's `luminanceThreshold` is tuned to sit above the ply's diffuse value.** Lower it and the whole sheet blooms into mush instead of just the veneer highlights, the shafts and the sun. The faint `emissive` on the face plies exists purely to push their lit edges over that threshold.
- **Responsiveness inside a canvas comes from `useThree().size`,** not a JS media query, so it can never disagree with what is on screen. Presence of the decorative grain canvas is CSS's call for the same reason.
- **Expanding rows measure their own height** (`ResizeObserver` plus a measurement on toggle). The CSS `0fr → 1fr` grid trick was tried and does not resolve reliably here.
- **Scroll-reveal state is a `data-in` attribute, not a class — do not "tidy" this.** React owns `className` on those nodes, so a class added imperatively by the observer gets wiped the next time the component re-renders, and since the observer has already unobserved the node the element stays invisible for good. This exact bug made catalogue rows vanish on click. For the same reason `.row` keeps a **static** className and carries its open state on `data-open`.
- Every 3D scene sits behind `SceneBoundary`, so a device without WebGL still gets the whole page and the phone number.
- Opening hours are shown as text only. Structured data in `index.html` deliberately omits `openingHours` because the days of the week were never confirmed — add it there once they are.
