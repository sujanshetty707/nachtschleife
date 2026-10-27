# ASSETS_NEEDED.md — NACHTSCHLEIFE

> Last updated: 2026-10-27
> Tier A = fetch automatically (CC0, public API, no login).
> Tier B = needs owner action (login, token, purchase, captcha).
> Tier C = NEVER (ripped, pirated, unlicensed).

---

## TIER A — Fetch Automatically

### HDRIs (Poly Haven, CC0)

| ID | Description | URL | Target path | Chapter |
|----|-------------|-----|-------------|---------|
| A-HDRI-01 | midnight_forest_4k — night forest | https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/midnight_forest_4k.hdr | public/assets/hdri/midnight_forest_4k.hdr | All night |
| A-HDRI-02 | overcast_soil_puresky_4k — storm sky | https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/overcast_soil_puresky_4k.hdr | public/assets/hdri/overcast_4k.hdr | Hohe Acht |
| A-HDRI-03 | kloppenheim_4k — grey dawn | https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/kloppenheim_4k.hdr | public/assets/hdri/dawn_4k.hdr | Ch.11 Finish |

### PBR Textures (Poly Haven + ambientCG, CC0)

| ID | Description | Source | Target path | Used in |
|----|-------------|--------|-------------|---------|
| A-TEX-01 | Wet asphalt | https://ambientcg.com/get?file=Asphalt004_2K-JPG.zip | public/assets/textures/asphalt_wet/ | Road |
| A-TEX-02 | Dry asphalt | Poly Haven road_stones_03 | public/assets/textures/asphalt_dry/ | Döttinger |
| A-TEX-03 | Concrete | https://ambientcg.com/get?file=ConcreteWall005_2K-JPG.zip | public/assets/textures/concrete/ | Karussell |
| A-TEX-04 | Kerb paint (red/white) | Poly Haven painted_road_02 | public/assets/textures/kerb/ | Kerbs |
| A-TEX-05 | Grass | Poly Haven grass_path_2 | public/assets/textures/grass/ | Edges |
| A-TEX-06 | Gravel | Poly Haven gravel_trail_2 | public/assets/textures/gravel/ | Run-off |
| A-TEX-07 | Metal / Armco | https://ambientcg.com/get?file=MetalPlates008_2K-JPG.zip | public/assets/textures/armco/ | Barriers |
| A-TEX-08 | Carbon fibre (anisotropic) | https://ambientcg.com/get?file=Carbon001_2K-JPG.zip | public/assets/textures/carbon/ | Car panels |
| A-TEX-10 | Rubber sidewall | https://ambientcg.com/get?file=Rubber001_2K-JPG.zip | public/assets/textures/rubber/ | Tyres |

### Track Geometry (OpenStreetMap + DEM, ODbL + MIT)

| ID | Description | Source | Notes |
|----|-------------|--------|-------|
| A-TRACK-01 | Nordschleife centreline + kerbs | Overpass API: way["name"="Nurburgring Nordschleife"] | Credit: c OpenStreetMap contributors (ODbL) |
| A-TRACK-02 | Elevation (DEM) | AWS Terrain Tiles: https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png | Mapzen Terrain, MIT |

### Fonts (npm Fontsource, OFL — free for web)

All installed via npm. Preload: Big Shoulders Display wght, Chakra Petch 400.

| Voice | Family | npm package |
|-------|--------|-------------|
| Hero display | Big Shoulders Display (variable) | @fontsource-variable/big-shoulders-display |
| Rain headlines | Climate Crisis (variable) | @fontsource-variable/climate-crisis |
| Neon signage | Monoton | @fontsource/monoton |
| Boot/pixel | VT323 | @fontsource/vt323 |
| Telemetry | Martian Mono (variable) | @fontsource-variable/martian-mono |
| Code blocks | JetBrains Mono | @fontsource/jetbrains-mono |
| Historic quotes | Fraunces (variable) | @fontsource-variable/fraunces |
| Archive clippings | Special Elite | @fontsource/special-elite |
| Pit board | Permanent Marker | @fontsource/permanent-marker |
| Livery stencils | Saira Stencil One | @fontsource/saira-stencil-one |
| UI labels | Chakra Petch | @fontsource/chakra-petch |
| Body copy | Barlow Semi Condensed | @fontsource/barlow-semi-condensed |

### Audio (Web Audio synthesis + CC0 fallbacks)

| ID | Sound | Method |
|----|-------|--------|
| A-AUD-01 | Heavy rain | Web Audio: filtered pink noise |
| A-AUD-02 | Light rain | Web Audio: filtered pink noise (lower gain) |
| A-AUD-03 | Engine tone | Web Audio: sawtooth oscillator with harmonic partials, scroll-mapped pitch |
| A-AUD-04 | Thunder | Web Audio: exponential decay noise burst |
| A-AUD-05 | Tyre spray | Web Audio: high-pass noise |
| A-AUD-06 | Pit-radio crackle | Web Audio: bandpass noise with AM |

---

## TIER B — Owner Action Required

### Hero Car Model (HIGHEST PRIORITY)

**Priority 1 — Porsche 963 GTP/Hypercar**

| Field | Detail |
|-------|--------|
| What | Porsche 963 IMSA GTP / WEC Hypercar — accurate PBR GLB, <=12 MB post-Meshopt |
| Why | Latest Porsche prototype, dual-series (IMSA + WEC), strong accuracy potential |
| Sketchfab search | https://sketchfab.com/search?q=porsche+963+gtp&type=models |
| Licence required | CC-BY or CC0, web delivery and redistribution allowed, NO NC/ND |
| Format | GLB, PBR metallic-roughness textures |
| Target path | public/assets/models/car_hero.glb |
| Chapters | All (Ch.1–11, /garage route) |
| Reference photos | (1) Porsche Motorsport press kit newsroom.porsche.com, (2) IMSA.com race gallery, (3) WEC-media fiawec.com |

**Priority 2 fallback — Porsche 919 Hybrid Evo**

| Field | Detail |
|-------|--------|
| What | Porsche 919 Hybrid Evo (2018 Nordschleife record car) |
| Verified fact | Timo Bernhard lapped Nordschleife in 5:19.546 on 29 June 2018. Source: Porsche Newsroom press release 2018-06-29; confirmed by Motor Sport magazine and Autosport. |
| Sketchfab search | https://sketchfab.com/search?q=porsche+919+hybrid+evo&type=models |
| Target path | public/assets/models/car_hero.glb |

**Proxy in use until real model arrives:** A Three.js procedural car (BoxGeometry fuselage + CylinderGeometry wheels) labelled [PROXY CAR] at all times. All systems (camera, physics spring, scroll sync, lights) are fully wired to the proxy.

### Licensed Photography

> Until licences confirmed, all archive imagery uses in-code SVG silhouettes + text captions.

| ID | What | Source | Licence needed |
|----|------|--------|----------------|
| B-IMG-01 | Porsche 963 night race shot | WEC Media (press registration required) | WEC press kit editorial licence |
| B-IMG-02 | 919 Evo Nordschleife run | Porsche Newsroom (newsroom.porsche.com) | Porsche press licence |
| B-IMG-03 | Niki Lauda 1976 Nordschleife (optional) | Getty / Motorsport Images | Rights-managed purchase — or omit entirely |

### Sketchfab Download API

If you set SKETCHFAB_TOKEN in .env, `scripts/download_sketchfab.ts` will call the official Download API for the model IDs you specify. It will never automate your account or bypass login.

---

## Questions for Owner (batched at M1 gate)

1. **Hero car:** Porsche 963 or 919 Evo? Confirm Sketchfab model ID after accuracy check.
2. **Owner details:** Name, role, GitHub/LinkedIn URLs for portfolio and contact.
3. **Sketchfab token:** Will you provide SKETCHFAB_TOKEN, or drop the GLB manually?
4. **Archive photos:** SVG silhouettes (safe, shippable now) or will you source licensed photos?
5. **Site purpose:** Developer portfolio OR endurance-and-code storytelling? (Affects /telemetry content.)
