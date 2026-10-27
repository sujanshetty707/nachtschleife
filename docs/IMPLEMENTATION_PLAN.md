# NACHTSCHLEIFE — Implementation Plan & Task List

## Overview

One endless night lap of the Nürburgring Nordschleife in the rain. Scrolling is the lap.  
Stack: Vite + TypeScript, Three.js, GSAP + ScrollTrigger + Lenis, postprocessing, Swup, troika-three-text, detect-gpu.

---

## Architecture Map

```
src/
├── core/
│   ├── renderer.ts        # Three.js WebGL2 renderer, postprocessing, quality tiers
│   ├── scene.ts           # Scene graph root, chapter registration
│   ├── camera.ts          # Camera rig, spring physics, scroll sync
│   ├── scroll.ts          # Lenis init, ScrollTrigger bridge
│   ├── router.ts          # Swup init, route → scene module mapping
│   ├── audio.ts           # Web Audio context, layer management
│   ├── quality.ts         # detect-gpu tier, dynamic resolution scaling
│   └── debug.ts           # ?debug overlay: FPS, draw calls, tier
├── chapters/
│   ├── ch00-scrutineering.ts  # Boot loader, time-based
│   ├── ch01-start.ts          # Hero: car + wet road + sparks title
│   ├── ch02-hatzenbach.ts     # Velocity marquee + wiper text
│   ├── ch03-flugplatz.ts      # Airtime: float → slam
│   ├── ch04-fuchsroehre.ts    # Forest canopy tunnel, word rush
│   ├── ch05-karussell.ts      # World rolls 360°, quote ring
│   ├── ch06-hohe-acht.ts      # Storm, lightning, melting type
│   ├── ch07-pflanzgarten.ts   # Horizontal legend scroll
│   ├── ch08-dottinger.ts      # Flat out: warp, telemetry HUD
│   ├── ch09-telemetry.ts      # Code cylinder, drag-rotate
│   ├── ch10-pitlane.ts        # Pit stop, contact form
│   └── ch11-finish.ts         # Flag shader, credits, first light
├── routes/
│   ├── home.ts            # / — assembles chapters 0–11
│   ├── garage.ts          # /garage — drag-orbit inspection
│   ├── archive.ts         # /archive — grid with Flip transitions
│   ├── telemetry.ts       # /telemetry — horizontal project timeline
│   ├── pit-wall.ts        # /pit-wall — single-screen contact
│   └── not-found.ts       # 404 — red flag
├── audio/
│   ├── rain.ts            # Rain synthesis node graph
│   ├── engine.ts          # Engine tone node graph
│   ├── thunder.ts         # Thunder burst synthesis
│   └── radio.ts           # Pit-radio crackle
├── ui/
│   ├── loader.ts          # ASCII boot terminal
│   ├── cursor.ts          # Custom cursor, headlight follow
│   ├── nav.ts             # Nav bar, route links
│   ├── icons.ts           # Inline SVG icons with state animations
│   ├── easter-eggs.ts     # All 10+ easter eggs
│   └── accessibility.ts  # Reduced-motion, skip link, focus management
├── utils/
│   ├── track-builder.ts   # OSM fetch, DEM fetch, spline + road mesh
│   ├── proxy-car.ts       # Three.js procedural proxy car
│   ├── textures.ts        # Texture loader, KTX2, shared material cache
│   ├── math.ts            # Spring physics, lerp, clamp, remap
│   └── fonts.ts           # Font preload, variable axis helpers
└── types/
    └── index.d.ts         # Shared TypeScript types
```

---

## Milestones

### M0 — Setup, Planning, Asset Audit ✅ IN PROGRESS
- [x] Vite + TypeScript project scaffolded
- [x] Core npm packages installed
- [x] Directory structure created
- [x] ASSETS_NEEDED.md written
- [x] docs/DECISIONS.md written
- [x] docs/CONTENT_SOURCES.md written
- [x] Implementation Plan written
- [ ] .env.example created
- [ ] vite.config.ts configured
- [ ] tsconfig.json tightened
- [ ] index.html shell written
- [ ] Core renderer.ts bootstrapped
- [ ] Tier A asset download scripts written
- [ ] Git init + first commit

### M1 — Hero Scene (STOP FOR REVIEW after this) 🔲
- [ ] Renderer: WebGL2, postprocessing pipeline (bloom, DoF, vignette, CA, grain, ACES)
- [ ] Quality tier detection and DPR cap
- [ ] Proxy car: fuselage + wheels, articulated, PBR materials
- [ ] Wet road plane: PBR asphalt + puddle masks + planar reflections (High tier)
- [ ] Night HDRI + floodlight point lights (cool white + warm halogen rim)
- [ ] LED headlight volumes (SpotLight + volumetric shader)
- [ ] Rain layer 1: instanced streaks near camera
- [ ] Chapter 01 scroll: camera dolly + orbit around car
- [ ] Title assembly (sparks particles → letter positions)
- [ ] GSAP ScrollTrigger hooked into Lenis
- [ ] ?debug overlay (FPS, draw calls, tier label)
- [ ] Browser agent review: 1440×900 + 390×844, screenshot + recording, console + FPS check

### M2 — Track Build 🔲
- [ ] Overpass API fetch: Nordschleife polyline
- [ ] DEM tile fetch: elevation sampling along centreline
- [ ] CatmullRomCurve3 spline, frenet frames for banking
- [ ] TubeGeometry road mesh, UV-mapped PBR asphalt
- [ ] Red-white kerb meshes (BoxGeometry instances)
- [ ] Armco barrier instances along spline
- [ ] Forest: instanced InstancedMesh conifers
- [ ] Camera path: CameraHelper riding spline, scroll-driven t parameter
- [ ] Marshal post flash lights (PointLight + timer)
- [ ] Floodlight masts (geometry + SpotLight)

### M3 — Weather System 🔲
- [ ] Rain layer 2: depth-faded sheets (ShaderMaterial, custom depth)
- [ ] Splash ripples on road (animated circle UVs)
- [ ] Tyre-spray rooster tails (ParticleSystem on car rear axle)
- [ ] Lens rain drops (screen-space pass or canvas overlay)
- [ ] Height fog (FogExp2 + custom vertex shader depth fog)
- [ ] Volumetric light shafts (GodraysPass or custom raymarch)
- [ ] Lightning: sky pulse + distant bolt geometry, threshold triggers, WCAG rate check
- [ ] Weather scroll timeline: dry → mist → rain → heavy → storm → clearing
- [ ] Quality tier switches (particle counts, shadow maps, SSR)

### M4 — All Chapters + Routing + Transitions (STOP FOR REVIEW after this) 🔲
- [ ] Lenis + ScrollTrigger chapter registration for all 12 chapters
- [ ] Ch00: ASCII boot terminal, 5-light gantry, sound opt-in
- [ ] Ch01: Spark title + camera dolly (M1 already)
- [ ] Ch02: Velocity-driven marquee + wiper text mask
- [ ] Ch03: Airtime float → slam + bloom spike + shake
- [ ] Ch04: Fuchsröhre tunnel canopy + word rush vanishing point
- [ ] Ch05: World roll 360° + Fraunces quote ring
- [ ] Ch06: Storm + melting Climate Crisis type + typewriter clipping
- [ ] Ch07: Pinned horizontal legend scroll + campfire glow
- [ ] Ch08: Radial warp + telemetry HUD (scroll-velocity data)
- [ ] Ch09: Code cylinder drag-rotate + project stints
- [ ] Ch10: Pit stop + pit-board form + ignition button
- [ ] Ch11: Flag shader + first light + credits scroll
- [ ] Swup router: 5 routes, canvas persistence
- [ ] /garage: drag-orbit + 5 hotspot annotation cards
- [ ] /archive: Flip transition grid
- [ ] /telemetry: horizontal project timeline
- [ ] /pit-wall: single-screen contact
- [ ] 404: red flag + sector time
- [ ] Transitions: iris, split-screen, RGB glitch, rain wipe, shutter, streak, lightning, tunnel, flag

### M5 — Typography + Content 🔲
- [ ] Complete font loading system (WOFF2, font-display: swap, preload)
- [ ] Type scale: rem values, 80-char line limit, 4.5:1 contrast check
- [ ] Per-chapter type treatments (all 14 from prompt)
- [ ] Variable font axis animations wired to GSAP / scroll
- [ ] All content text: verified facts, quotes, stories with inline source links
- [ ] SEO: title tags, meta descriptions, OG tags per route
- [ ] DOM text preserved for all animated elements (aria-hidden clones where needed)
- [ ] CONTENT_SOURCES.md completed

### M6 — Icons, Micro-interactions, Easter Eggs 🔲
- [ ] 8 custom SVG icons with idle/hover/press/success animations
- [ ] Magnetic hover buttons
- [ ] Cursor-origin ripple
- [ ] Flip-cover ignition toggle
- [ ] Tyre-compound weather selector (Dry/Intermediate/Wet)
- [ ] Hold-to-launch (1s hold)
- [ ] Custom cursor + headlight pointer follow
- [ ] 10+ easter eggs (Konami, 'box' mini-game, moon clicks, logo red flag, Space rev limiter, DevTools ASCII, favicon/tab flag status, source comment, 3-finger flare, 404 sector time)

### M7 — Audio 🔲
- [ ] Web Audio context, unlock on gesture
- [ ] Rain, wind, thunder, engine, tyre, radio layers
- [ ] Scroll-velocity engine pitch mapping
- [ ] Thunder distance delay
- [ ] Layer ducking (rain ducks engine in heavy rain etc.)
- [ ] Master volume + per-layer gain nodes
- [ ] Sound toggle button with exhaust-puff icon

### M8 — Polish, Performance, Accessibility, Delivery 🔲
- [ ] Dynamic resolution scaling (FPS < 50 → reduce DPR)
- [ ] Tab visibility pause (requestAnimationFrame check)
- [ ] LODs for car and track chunks
- [ ] Shared materials audit
- [ ] prefers-reduced-motion: static poster fallback, lightning off
- [ ] Full keyboard navigation test + visible focus rings
- [ ] Skip link
- [ ] WebGL fallback: static poster with all text readable
- [ ] Chrome, Safari, Firefox, iOS Safari cross-browser test
- [ ] FPS log per tier
- [ ] README.md, CREDITS.md
- [ ] In-site Credits page (Ch11 bottom)
- [ ] Final browser recording (complete scroll lap + all routes)
- [ ] Git final commit, tag v1.0.0

---

## Task List (M0 remaining tasks — starting now)

### Immediate (before M1 feature code):
1. Write .env.example
2. Write vite.config.ts (aliases, manual chunks, worker inline)
3. Tighten tsconfig.json
4. Write index.html shell (semantic, skip link, OG meta, font preloads)
5. Write src/core/renderer.ts (WebGL2 renderer + postprocessing pipeline skeleton)
6. Write src/core/quality.ts (detect-gpu, tier constants)
7. Write src/core/scroll.ts (Lenis init + ScrollTrigger bridge)
8. Write src/core/debug.ts (?debug overlay)
9. Write src/utils/proxy-car.ts (parameterised procedural car)
10. Write src/main.ts (entry point, initialisation order)
11. Write placeholder CSS (design tokens, reset)
12. Git init + commit "M0: setup and planning"

---

## Non-Negotiable Checklist (check before each commit)

- [ ] No console errors
- [ ] No unlicensed assets
- [ ] No invented facts or quotes
- [ ] No game-ripped geometry
- [ ] No secrets committed
- [ ] WCAG flash limit respected (< 3 flashes/sec, no large-area high-contrast flash)
- [ ] prefers-reduced-motion tested
- [ ] DOM text present for all animated content
