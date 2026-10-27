# NACHTSCHLEIFE (Night Loop)

> One endless night lap of the Nürburgring Nordschleife in the rain. Scrolling is the lap.

[![Built with Three.js](https://img.shields.io/badge/Three.js-r169-black?logo=three.js)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![GSAP](https://img.shields.io/badge/GSAP-3.x-green?logo=greensock)](https://greensock.com/)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio-Procedural-orange)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

## Concept

Endurance racing and coding share one story: stints, pit stops, telemetry, loops, and not stopping when the rain comes down.

**NACHTSCHLEIFE** is a scroll-driven 3D web experience where scrolling the page drives an endurance prototype car through an entire 20.832 km lap of the Nürburgring Nordschleife in the wet. Every sector and corner features dedicated typography, camera choreography, weather simulation, and telemetry readouts.

---

## Key Features

- **Full 20.832 km 3D Track Spline:** CatmullRomCurve3 track ribbon with authentic elevation profile (ranging from −90m at Breidscheid to +120m at Hohe Acht), banked turns (up to 33° through Caracciola-Karussell), curbs, Armco guardrails, 600 instanced forest pines, and flashing marshal lights.
- **Dynamic Camera Director:** Smooth spring-damped camera transitions across sectors (hero orbit, cockpit view, kerb-cam jump at Flugplatz, high-angle plunge at Fuchsröhre, helicopter storm tracking at Hohe Acht, and 345 km/h warp chase on Döttinger Höhe).
- **Procedural Prototype Car:** Articulated prototype with suspension pitch/roll spring physics, steering response, wheel spin, and volumetric LED projector headlights.
- **Live Telemetry HUD:** Fixed racing cluster displaying real-time speed in km/h, 7-speed gear changes, RPM bar with redline transition, lap timer, sector delta against Timo Bernhard's 5:19.546 record, tyre temperatures, and rain gauge.
- **Synthesized Web Audio Engine:** Zero audio assets required. Fully procedural pink-noise rain with dynamic lowpass filtering, multi-harmonic prototype engine roar with scroll-velocity throttle mapping, exponential thunder booms, and pit-wall radio squelch.
- **Dynamic Weather System:** Adaptive transition from pit straight drizzle to thick valley mist, severe summit thunderstorm with WCAG-safe double-strike lightning, and clearing dawn light.
- **11 Curated Corner Chapters:**
  1. *Start / Finish:* Glitch title, sparks assembly, and telemetry pill.
  2. *Hatzenbach:* Continuous velocity marquee and technical S-curve dynamics.
  3. *Flugplatz:* Airtime meter and suspension unloading over the crest.
  4. *Fuchsröhre:* The −65m plunge, word rush vanishing point, and 3.5G vertical compression.
  5. *Karussell:* 33° banked concrete slab and historic quote card.
  6. *Hohe Acht:* Summit 617m storm epicenter with pulsing alert tag and Climate Crisis melting typeface.
  7. *Pflanzgarten:* Legendary story cards (Niki Lauda 1976, Stefan Bellof 6:11.13, Timo Bernhard 5:19.546).
  8. *Döttinger Höhe:* 2.135 km straight, Monoton neon signage, and 345 km/h vmax.
  9. *Telemetry & Code Stints:* Code cylinder card (`nachtschleife_engine.rs`) comparing racing stints to engineering loops.
  10. *Pit Lane & Pit Wall:* Permanent Marker pit board and interactive communication transmission form.
  11. *Finish & Dawn:* Checkered flag banner, first light of dawn over the Eifel mountains, and credits.
- **Post-Processing Pipeline:** Multi-pass `EffectComposer` pipeline featuring Bloom, Chromatic Aberration, Depth of Field, Vignette, Film Grain, ACES Filmic Tone Mapping, and SMAA anti-aliasing.
- **Accessibility & Performance:** Reduced-motion support, keyboard navigation, skip link, sound mute/unmute toggle, and `detect-gpu` quality tier scaling.

---

## Tech Stack

- **Core:** HTML5, CSS3, TypeScript
- **3D & Graphics:** Three.js, `pmndrs/postprocessing`
- **Animation & Physics:** GSAP, ScrollTrigger, Lenis Smooth Scroll
- **Audio:** Web Audio API (procedural synthesis)
- **Bundler:** Vite
- **Typography:** Fontsource variable font packages (Big Shoulders Display, Chakra Petch, Martian Mono, JetBrains Mono, Fraunces, Climate Crisis, Monoton, VT323)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### Installation

```bash
# Clone the repository
git clone https://github.com/sujanshetty707/nachtschleife.git

# Navigate into the project folder
cd nachtschleife

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

Add `?debug` to the URL (`http://localhost:3000/?debug`) to inspect live FPS, draw calls, and GPU quality tier metrics.

### Building for Production

```bash
npm run build
```

---

## License

This project is licensed under the MIT License.
