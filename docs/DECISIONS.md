# DECISIONS.md — NACHTSCHLEIFE

> Architecture and trade-off log. Every significant choice is recorded here with rationale.

---

## D-001 Framework: Vite + TypeScript, no React

**Decision:** Vanilla TypeScript with Vite. React is not used.

**Rationale:** The rendering budget is owned entirely by Three.js/WebGL. A VDOM reconciler adds overhead for no benefit on a single-canvas, scroll-driven experience. Swup handles multi-route transitions; GSAP handles all UI animation. This is the correct call for a GPU-bound creative site.

---

## D-002 Smooth scrolling: Lenis

**Decision:** Lenis for smooth scroll, forwarded into GSAP ScrollTrigger via Lenis's `scrollTrigger` adapter.

**Rationale:** Lenis gives physics-based inertia and precise velocity readout needed for speed-driven effects (marquee, chromatic aberration, motion blur). Native scroll events don't expose velocity cleanly.

---

## D-003 Post-processing: pmndrs/postprocessing

**Decision:** `postprocessing` library (Effect Composer on WebGL2 render target) rather than Three.js `EffectComposer`.

**Rationale:** pmndrs/postprocessing is significantly more performant (single-pass multi-effect), has a richer effect library (bloom, DoF, vignette, CA, grain, ACES tone mapping), and is the industry standard for this kind of scene.

**Ultra tier addition:** `realism-effects` for screen-space reflections and motion blur if GPU budget allows (evaluate at M3).

---

## D-004 Hero car: proxy first, real GLB at Tier B

**Decision:** Build all systems against a parameterised proxy car (Three.js geometry). Real licensed GLB replaces it at `public/assets/models/car_hero.glb`.

**Rationale:** Unblocks M1 without waiting for owner to provide token. The proxy is clearly labelled in the scene.

**Licence analysis (when real model arrives):** Will check that the licence permits (a) web delivery (file sent to every visitor's browser), (b) embedding in a built artifact, (c) does not forbid redistribution of the source file. CC-BY and CC0 both permit this. NC and ND do not. Will record reading in this file on receipt.

---

## D-005 Track geometry: procedural from OSM + DEM

**Decision:** Pull Nordschleife polyline from Overpass API, elevation from AWS Terrain Tiles, build road mesh procedurally in Three.js (TubeGeometry along CatmullRomCurve3 with UV-mapped PBR asphalt).

**Rationale:** Avoids any game-rip. OSM licence (ODbL) permits this use with attribution. DEM tiles are MIT.

**Credit:** © OpenStreetMap contributors (ODbL). Attribution shown in Credits page and source comment.

---

## D-006 Font: Climate Crisis YEAR axis for rain

**Decision:** Use Climate Crisis variable font's `YEAR` axis to animate letter melt proportional to rain intensity. Fallback: Rubik Wet Paint (static, no axis), noted in DOM with aria-hidden fallback.

**Licence:** All fonts are OFL (SIL Open Font Licence), which permits use as a web font and redistribution in WOFF2 format.

---

## D-007 Audio: muted by default, Web Audio API

**Decision:** All audio muted on load. Unlock on first user gesture. Synthesise rain, engine, thunder, tyre noise with Web Audio API nodes. No audio files ship unless CC0 source is found for engine base sample.

**Rationale:** Avoids CORS issues, keeps payload small, and complies with autoplay policies across all browsers.

---

## D-008 Quality tiers via detect-gpu

**Decision:** Three tiers: Ultra (GPU tier >= 3), High (tier 1-2), Low/mobile (tier 0 or mobile UA).

| Feature | Ultra | High | Low |
|---------|-------|------|-----|
| SSR + motion blur | Yes | No | No |
| Volumetric fog | Full | Lightweight | Baked fake |
| Depth of field | Real | Real | None |
| Rain particles | 10k | 3k | 500 |
| DPR cap | 2.0 | 1.5 | 1.25 |
| Shadow maps | 2048 | 1024 | None |

---

## D-009 Routing: Swup with persistent WebGL canvas

**Decision:** Swup manages HTML content transitions; the Three.js canvas sits outside Swup's container and persists across routes. Each route registers a scene module that Swup's `contentReplaced` hook activates.

**Rationale:** Canvas setup/teardown on every navigation costs 200–400 ms and causes a flash. Persistence gives instant transitions.

---

## D-010 GSAP plugins: public gsap package

**Decision:** Install the public `gsap` npm package. All plugins (ScrollTrigger, SplitText, ScrambleText, Flip, DrawSVG, MorphSVG, Draggable, Observer) are now included free in the public package as of 2024.

**Rationale:** No Club GSAP token required. Confirmed in GSAP changelog and npm package contents.

---

## D-011 Accessibility: prefers-reduced-motion

**Decision:** A CSS class `.reduced-motion` is applied when `matchMedia('(prefers-reduced-motion: reduce)').matches` is true or when the user clicks the Reduce Effects toggle. All GSAP animations check this flag and substitute simple opacity fades. Lightning is disabled entirely. Scroll-jacking is replaced with normal scroll. Tab title/favicon cycling pauses.

---

## D-012 Verified Nordschleife sector order

Verified against Nordschleife track map (Nürburgring official circuit guide, nürburgring.de) and Wikipedia (CC BY-SA):

1. Start/Finish straight (Pit entrance / Yokohama S)
2. Hatzenbach (fast chicanes)
3. Hocheichen / Quiddelbacher Höhe (crest)
4. Flugplatz (double crest — cars go airborne)
5. Schwedenkreuz / Aremberg / Fuchsröhre (sweeping descent into the foxhole tunnel)
6. Adenauer Forst / Metzgesfeld / Kallenhard
7. Wehrseifen / Breidscheid / Ex-Mühle
8. Bergwerk / Kesselchen / Klostertal
9. Karussell (banked concrete hairpin)
10. Hohe Acht (highest point, 617 m)
11. Wippermann / Brünnchen / Pflanzgarten
12. Stefan Bellof S / Schwalbenschwanz / Galgenmauer
13. Döttinger Höhe (longest straight, ~1.8 km)
14. Antoniusbuche / Tiergarten
15. Start/Finish

Chapters in the site map to this order. Verified: Flugplatz cars do leave the ground (confirmed by multiple onboard videos and track guides). Karussell is a banked concrete corner, original banking up to ~30°. Hohe Acht is the highest point at 617 m above sea level (Nürburgring circuit guide).

---

## D-013 Fonts not available on Fontsource

**Sixtyfour (boot sequence):** Available on Google Fonts (OFL) but not yet on Fontsource. Loading via Google Fonts API with `display=swap` for M0; will switch to self-hosted WOFF2 (extracted) by M5 to avoid third-party DNS call.

---

## D-014 Image fallback strategy

Since no licensed race photography can ship without owner approval, all archive images use procedurally-generated SVG silhouettes (in-code, no external file). A caption with source URL is visible in the DOM. When real images arrive they replace the SVG `<use>` elements.
