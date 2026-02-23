# Tide Resonance — Claude Code Build Instructions

## QUALITY STANDARD — READ THIS FIRST

This app must be built to an **exceptional, production-grade standard**. 

### Craftsmanship Benchmark vs. Design Identity

**lunata.app is the CRAFTSMANSHIP benchmark** — study it to understand the level of polish expected: the precision of typography, the layering of glows and glass, the rhythm of spacing, the smoothness of transitions. That is the minimum quality bar.

**But Tide Resonance must NOT look like lunata.app.** It must have its own unmistakable visual soul. Lunata feels like moonlight — silver, ethereal, celestial. Tide Resonance must feel like **the deep ocean floor** — bioluminescent, fluid, immersive, primal.

### The Unique Visual Identity of Tide Resonance

Think: you are 200 metres underwater. No sunlight. The only light comes from living things — bioluminescent organisms pulsing in slow rhythm. Currents move everything gently. Time slows down. Pressure is felt. This is not a pretty beach app — it's an abyssal experience.

**Distinctive elements that set Tide Resonance apart:**

- **Fluid motion everywhere.** Where lunata uses subtle floating, Tide Resonance should feel like being submerged. Elements drift with current-like motion — slow horizontal sway, not vertical bobbing. CSS animations should use sine-wave easing that mimics underwater movement.

- **Bioluminescent light.** Glows should feel organic and alive — not uniform halos but irregular, pulsing, breathing luminescence. Use layered radial gradients with offset centres so glows feel natural, not centred-and-perfect. Cyan, deep violet, and occasional warm amber (like anglerfish light).

- **Water caustic patterns.** Subtle animated light refraction patterns on surfaces — the dancing light you see on the bottom of a swimming pool. Achievable with CSS: overlapping radial gradients with slow transform animations at different speeds.

- **Depth layering through blur.** Use varying levels of backdrop-blur to create a sense of depth — foreground elements crisp, background elements soft and distant, like looking through water. This is a different use of blur than lunata's glass panels.

- **Organic, asymmetric layouts.** Where possible, avoid rigid symmetry. The ocean is not symmetrical. The tidal curve should feel like a living wave, not a chart. The breath orb should distort slightly, like a bubble underwater.

- **Sound-reactive visuals (future).** Design elements that COULD respond to the audio drone — particles that scatter on frequency changes, glow intensity that maps to volume. Even if not wired up in v1, design with this in mind.

- **Typography: fluid and weighted.** Consider a slightly different font from the ecosystem — something with more character. If staying with Inter, use heavier contrasts: very thin (200) for ambient labels, medium (500) for primary text. All-caps sparingly and only for phase labels.

**This is the minimum quality bar. Do not ship anything that looks generic, flat, or rushed. But also do not ship anything that looks like lunata.app with blue colours. This must be its own world.**

### Non-Negotiable Quality Rules

1. **No placeholder UI.** Every component must be fully styled from the first commit. No grey boxes, no "TODO: style later", no unstyled defaults.

2. **No generic web app aesthetics.** This is NOT a SaaS dashboard. It's a sacred digital instrument for sound healing practitioners. Every visual decision must reflect that.

3. **Typography must be perfect.** Use Inter or a similarly clean sans-serif. Establish a strict type scale: hero text, section headings, body, captions, labels. Use `letter-spacing` deliberately — wide for uppercase labels, tight for large headings. Font weights: 300 for elegance, 400 for body, 500 for emphasis, 600 for headings. Never use bold (700+) except for a single focal element.

4. **Colour must be layered, not flat.** Never use a solid colour background. Always layer: deep gradient base → subtle texture/noise → glass surface → content. Glows must use multiple layered box-shadows at different spreads. Borders should be `rgba(255,255,255,0.06)` to `rgba(255,255,255,0.12)` — never hard white lines.

5. **Animations must be organic.** Use `ease-out` or custom cubic-bezier curves — never linear. Durations: 200-300ms for interactions, 800-1200ms for ambient. Floating elements need different periods (no synchronised bobbing). Everything respects `prefers-reduced-motion`.

6. **Glass/frosted surfaces** use `backdrop-blur` with very low-opacity white backgrounds (`bg-white/[0.03]` to `bg-white/[0.06]`). Combined with a subtle border and a soft shadow, this creates depth without heaviness.

7. **Spacing is generous.** When in doubt, add more whitespace. Cramped layouts feel cheap. Premium layouts breathe. Use Tailwind's spacing scale consistently — don't mix arbitrary values.

8. **Every interactive element must have clear feedback.** Hover states, active states, focus rings (accessible but styled). Transitions on all state changes (colour, opacity, transform).

9. **The app must feel alive.** Subtle ambient animations — particles drifting, glows pulsing, the tidal curve flowing. These aren't decorative — they communicate that the app is connected to something living and real.

10. **Mobile-first, always.** Build mobile layout first, enhance for desktop. Test on a real phone viewport (375px width). The app will primarily be used by practitioners on phones and tablets during sessions.

---

## Project Setup

1. Initialise the project:
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-import-alias
```

2. Read the shared style guidance from the ecosystem:
```
../_shared/
```
Use the shared folder to understand the **quality patterns** of the ecosystem — spacing rhythm, component architecture, accessibility standards. Do NOT copy lunata.app's colour palette, visual effects, or design identity. Tide Resonance has its own unique deep-ocean visual language defined above.

3. Install core dependencies:
```bash
npm install @neaps/tide-predictor @neaps/tide-database framer-motion
```

4. Initialise git:
```bash
git init
git remote add origin https://github.com/RemiDz/tide-resonance.git
```

---

## Build Sequence

Read **TIDE_RESONANCE_SPEC.md** for the complete feature specification.

Build in this exact order. **Do not skip ahead.** Each phase must be polished before moving to the next.

### Phase 1 — Foundation + Data Layer
1. Set up the project structure (see file structure in spec)
2. Implement the tidal prediction engine (`tideEngine.ts`)
   - Integrate @neaps/tide-database for station discovery
   - Integrate @neaps/tide-predictor for harmonic predictions
   - Build the `useTidalState` hook that returns live tidal data
   - Test with a known UK station (e.g., Whitby or London Bridge)
3. Build the station picker (geolocation + manual search + favourites)
4. **Verify data is correct** — log predictions and cross-reference with a known tide table

### Phase 2 — Core Visuals
5. Build the background atmosphere (deep ocean gradient + subtle particles)
6. Build the 24-hour tidal curve (SVG) with NOW marker
   - This must be beautiful — smooth bezier curves, not jagged line segments
   - Animated NOW marker with pulsing glow
   - Phase-based colour transitions on the marker and curve fill
   - Past portion slightly muted, future portion bright
   - High/low extremes labelled with times
7. Build the header (station name, current phase, distance)
8. Build the session state card (phase guidance for practitioners)

### Phase 3 — Breathing
9. Implement the breath mapper (tidal rate → breath rhythm)
10. Build the breath orb
    - **This is the emotional centrepiece of the app.** It must feel like watching the ocean breathe.
    - Expanding/contracting with organic easing
    - Three concentric glow rings (like ripples in water)
    - Water-caustic light texture on the orb surface (CSS only)
    - Phase text: "Inhale..." / "Hold..." / "Exhale..." / "Rest..."
11. Add breath controls (speed, toggle, audio cue)

### Phase 4 — Audio Drone
12. Build the Web Audio API drone engine
13. Map tidal phases to sound parameters (see spec for exact sound design)
14. Add audio controls (volume, mute, carrier frequency)
15. Ensure audio starts only after user interaction (browser autoplay policy)

### Phase 5 — Polish + 7-Day View
16. Build the 7-day tidal calendar
17. Animation polish pass — ensure every transition is smooth
18. Mobile optimisation pass — test at 375px width
19. Lighthouse performance audit — target 90+
20. Final visual review against lunata.app benchmark

---

## Critical Technical Notes

### @neaps/tide-database Bundle Size
The station database may be large. Use dynamic imports to lazy-load it:
```typescript
const { nearest } = await import("@neaps/tide-database");
```
This prevents the full database from blocking initial page load.

### Web Audio API Autoplay
Browsers block audio autoplay. The drone engine must:
- NOT start automatically
- Wait for a user tap/click to create the AudioContext
- Show a clear "Enable Sound" button
- Resume AudioContext on user interaction

### Geolocation Fallback
If the user denies location access or is on desktop without GPS:
- Show a clean station search interface
- Offer curated popular stations:
  - UK: Whitby, Brighton, Bristol, London Bridge, Liverpool
  - US: San Francisco, Miami, Seattle, New York
  - Other: Sydney, Tokyo, Lisbon, Cape Town

### SVG Tidal Curve Smoothing
Raw tidal height data points will look jagged if connected with straight lines. Use cubic bezier curve fitting (catmull-rom spline or similar) to create smooth, natural-looking curves. The curve should look like gentle ocean waves, not a stock chart.

---

## Remember

You are building a **sacred digital instrument**, not a weather app. Every design choice should make a sound healing practitioner feel like they've been submerged into the deep ocean. The data is real — the tide is actually moving right now, somewhere — and the app's job is to make that felt.

Study lunata.app for the level of craft. Then **forget about it** and build something that could only be Tide Resonance — an experience that feels like the deep ocean floor, bioluminescent, breathing, alive. When a practitioner opens this app, they should feel the weight and rhythm of water before they read a single word.
