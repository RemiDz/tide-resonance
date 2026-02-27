# Tidara App — Full Audit Results

> Comprehensive codebase audit for promotional landing page creation.
> Generated: 24 February 2026

---

## 1. App Identity

| Field | Value |
|-------|-------|
| **App Name** | Tide Resonance |
| **Domain** | tidara.app |
| **Package Name** | `tide-scaffold` |
| **Version** | v1.0 |
| **Page Title** | `"Tide Resonance"` |
| **Meta Description** | `"Live tidal data for sound healing practitioners"` |
| **Theme Color** | `#050810` |
| **Favicon** | `/src/app/favicon.ico` (16×16, 32×32) |
| **OG Image** | None found |
| **Creator** | Remigijus Dzingelevičius |
| **Year** | 2026 |
| **Ecosystem** | Harmonic Waves |

**Header Copy:**
- Left: Green pulsing dot + `"Live"` (status indicator)
- Centre: `"Tide Resonance"` (uppercase, light weight)
- Right: Settings gear icon

**Footer Copy:**
- `"Tide Resonance · Harmonic Waves"`
- `"Crafted by Remigijus Dzingelevičius · 2026"`

**Settings About Section:**
- `"Tide Resonance v1.0"`
- `"Part of the Harmonic Waves ecosystem"`

---

## 2. Core Purpose

**One sentence:** A live tidal data app that helps sound healing practitioners align their practice with the ocean's natural rhythms.

**Problem it solves:** Practitioners working with tidal cycles currently have no elegant, purpose-built tool that combines real-time tide data with phase-aware guidance, ambient soundscapes, and a wellness-oriented interface. Generic tide apps serve fishermen and sailors — Tide Resonance serves healers.

**Target audience:**
- Sound healing practitioners
- Frequency/vibration therapists
- Wellness professionals aligned with natural cycles
- Coastal mindfulness and meditation practitioners
- Anyone interested in tidal rhythms and their energetic qualities

---

## 3. Features List

### 3.1 Harmonic Tidal Prediction (Core Engine)
- Calculates real-time water height, tidal phase, and tide times using harmonic analysis
- Powered by `@neaps/tide-database` (8,000+ global coastal stations) and `@neaps/tide-predictor`
- Runs entirely on-device — no internet needed after initial load
- Updates every 60 seconds

### 3.2 Four-Phase Tidal Energy System
Each tidal phase carries distinct energetic qualities with practitioner-oriented guidance:

| Phase | Symbol | Colour | Qualities | Guidance |
|-------|--------|--------|-----------|----------|
| **Rising Tide** | ↑ | `#4fc3f7` (cyan) | Building · Expansion · Momentum | "Energy is building naturally" / "A time for starting, creating, moving forward" / "The ocean gathers strength" |
| **High Water** | ◆ | `#e0f7fa` (white-cyan) | Fullness · Peak · Abundance | "The ocean has reached its peak" / "A moment of maximum energy and fullness" / "Stillness at the crest before release" |
| **Ebbing Tide** | ↓ | `#7986cb` (indigo) | Release · Letting Go · Cleansing | "Energy is naturally receding" / "A time for releasing what no longer serves" / "The ocean draws back, clearing the shore" |
| **Low Water** | ◇ | `#1a237e` (navy) | Stillness · Rest · Reflection | "The ocean rests at its lowest point" / "A time for quiet reflection and integration" / "Deep stillness before the next cycle begins" |

### 3.3 Hero Section (Data-Dense Visual)
Multi-layered interactive visual at the top of the app:
1. **Sky Layer** — Time-of-day aware gradient (dawn/day/dusk/night) with procedural stars
2. **Animated Waves** — 4-layer sine-wave SVG with caustic effects
3. **Waterline Info** — Current water height relative to today's range
4. **Mini 24h Curve** — Embedded tidal curve shown underwater
5. **Bioluminescent Particles** — Drifting plankton animation below waterline
6. **Phase Label** — Station name + current phase overlay in sky area
7. **Next Tide Overlay** — Prominent countdown: e.g. `"Low Water in 3h 46m"`, then `"Then rising to High Water at 8:19 PM"`

### 3.4 24-Hour Tidal Curve
- Smooth Catmull-Rom spline showing water height throughout the day
- Gradient fill under curve (water depth visualisation)
- Time axis labels at 3-hour intervals
- High/low extreme markers with time + height labels
- Animated "Now" marker with pulsing ripple rings and shimmer
- Past times dimmed, future times bright

### 3.5 Current Tide Card
- **Water Height** (e.g. "2.15m")
- **Rate of Change** (e.g. "+0.32m/hr" or "−0.18m/hr")
- **Tidal Range** (e.g. "3.5m")
- Progress bar: Low ←→ High with animated dot showing current position

### 3.6 Tidal Energy Card
- Phase arrow + colour-coded phase name
- Qualities (comma-separated descriptors)
- Three descriptive guidance lines with left border accent
- Expandable info explaining the cultural significance of tidal phases

### 3.7 Today's Tides Card
- Lists all predicted high (△) and low (▼) water times for the current day
- 12h or 24h format (user preference)
- Height in metres or feet
- Past times shown faded, future times bright

### 3.8 7-Day Forecast Calendar
- Week-long tidal schedule at a glance
- Day labels (Today/Mon/Tue…) with all extremes for each day
- Expandable info on spring/neap tide patterns

### 3.9 Station Info Card
- Station name, distance from device (km), coordinates (DMS format)
- Data source: `"Harmonic prediction"`
- "Change Station" button
- Expandable info explaining harmonic analysis and on-device calculation

### 3.10 Ambient Drone (5-Layer Synthesised Sound)
A live synthesised ocean drone that evolves with tidal phase:

| Layer | Description | Detail |
|-------|-------------|--------|
| 1 | Deep sub-bass | baseFreq ÷ 4 (very low rumble) |
| 2 | Binaural beat pair | Left: baseFreq, Right: baseFreq + 3Hz (3Hz theta entrainment) |
| 3 | Harmonic overtone | Perfect fifth above (baseFreq × 1.5) |
| 4 | Ocean texture | Bandpass-filtered white noise (300–500Hz range) |
| 5 | Slow LFO modulation | 0.07Hz (~14-second breathing cycle) |

- **Phase modulation**: Sound character changes with tidal phase — brighter at high water, deeper and quieter at low water
- **Base frequency options**: 432 Hz, 440 Hz, 528 Hz (user selectable)
- **Volume**: 0–100% slider (master gain capped at 30% for safety)
- **Fade behaviour**: 2s fade-in, 1s fade-out
- **Default state**: Off

### 3.11 Tide Notifications
- Browser notifications before high and low water events
- Timing options: 15 min, 30 min, or 1 hour before
- Independent high/low water toggles
- Permission handling with user-friendly messaging
- Notification body: `"High Water in 30 minutes at [Station Name]"`

### 3.12 Station Search & Selection
- Full-text fuzzy search across 8,000+ global stations
- Organised by region: UK & Ireland, Europe, Americas, Asia Pacific, Africa
- "Use My Location" button for GPS-based station selection
- 25 curated popular stations

### 3.13 Welcome Flow (Onboarding)
- Title: `"Tide Resonance"`
- Primary CTA: `"Find My Coast"` → triggers device geolocation
- Fallback: `"Use Whitby, England"` if geolocation unavailable
- Error state: `"Location unavailable. Try Whitby instead."`
- One-time display (stored in localStorage)

### 3.14 Display Preferences
- **Units**: Metres / Feet
- **Time format**: 12h / 24h (auto-detected from device locale)
- All preferences persisted to localStorage

### 3.15 Expandable Info Cards
- Every major card has an ℹ button revealing detailed explanations
- Smooth expand/collapse animation
- Educates users about tidal science and terminology

**Premium vs Free:** All features are currently **free**. No paywall, feature gating, or premium tier exists in the codebase.

---

## 4. Tech & Data Sources

### Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | Framework (App Router, RSC) |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4 | Utility-first styling |
| Framer Motion | 12.34.3 | Component animations |
| @neaps/tide-database | 0.6.20260220 | 8,000+ station harmonic data |
| @neaps/tide-predictor | 0.7.0 | Tide prediction from harmonics |
| SunCalc | 1.9.0 | Solar/lunar position calculations |

### External APIs

**None for core functionality.** The app is **offline-first** after initial load.

- **Tide Data**: All computed on-device from bundled harmonic constituents (no live tide API)
- **Geolocation**: Browser's Geolocation API (device GPS, no external service)
- **Notifications**: Browser's Notification API
- **Analytics**: Plausible.io (privacy-friendly, `https://plausible.io/js/pa-B4K9CHK_UaRy2qTFa36MW.js`)

### Real-Time Data
- Tidal state recomputes every 60 seconds from harmonic constituents
- No WebSockets or server streaming — pure client-side prediction
- Sky state (time-of-day, moon phase) updates every 10 minutes via SunCalc

### Audio System
- Full Web Audio API implementation with 5-layer synthesis graph
- Binaural beat pair (3Hz theta brainwave entrainment)
- Phase-responsive sound modulation (brightness/darkness follows tide)
- Three sacred frequency options: 432Hz, 440Hz, 528Hz

### Data Flow
```
Device GPS → nearest station lookup → harmonic constituents →
on-device tide prediction → UI (hero, cards, curve, audio, notifications)
```

### Deployment
- **Host**: Vercel
- **Domain**: tidara.app

---

## 5. User Experience Flow

### First-Time Visitor
1. **Welcome screen** appears: `"Tide Resonance"` title, `"Find My Coast"` button
2. User taps "Find My Coast" → device geolocation activates → nearest station found
3. (If geolocation fails → `"Use Whitby, England"` fallback offered)
4. Welcome screen dismisses → main app loads with live tidal data

### Main Interaction Loop
1. **See** — Hero visual shows current tidal state at a glance (phase, water level, sky)
2. **Read** — Scroll through data cards (energy guidance, current tide, today's times, 7-day calendar)
3. **Listen** (optional) — Enable ambient drone in settings; sound evolves with tide
4. **Be notified** (optional) — Enable alerts for upcoming high/low water
5. **Explore** — Change station, adjust units/format, read expandable info sections

### Onboarding
- Single welcome screen with geolocation prompt
- No tutorial or guided tour — the interface is self-explanatory
- Expandable ℹ info sections serve as contextual help on every card

---

## 6. Visual Design

### Colour Palette

**Core Depths (CSS Custom Properties):**

| Variable | Hex | Usage |
|----------|-----|-------|
| `--abyss-black` | `#050810` | Base background, viewport theme |
| `--deep-navy` | `#0a1628` | Secondary depth |
| `--ocean-ink` | `#0c1832` | UI element backgrounds |
| `--trench-blue` | `#132640` | Tertiary depth |
| `--bio-cyan` | `#4fc3f7` | Bioluminescent accent (Rising phase) |
| `--bio-violet` | `#7986cb` | Bioluminescent accent (Falling phase) |
| `--bio-amber` | `#ffab40` | Warm accent |

**Phase Colours:**

| Phase | Hex | Character |
|-------|-----|-----------|
| Rising | `#4fc3f7` | Bioluminescent cyan |
| High Water | `#e0f7fa` | Bright white-cyan |
| Falling | `#7986cb` | Deep indigo |
| Low Water | `#1a237e` | Abyssal navy |

**Text Hierarchy:**

| Level | Value |
|-------|-------|
| Primary | `rgba(255, 255, 255, 0.85)` |
| Secondary | `rgba(255, 255, 255, 0.60)` |
| Muted | `rgba(255, 255, 255, 0.35)` |

**Glass System:**

| Property | Value |
|----------|-------|
| Background | `rgba(255, 255, 255, 0.03)` |
| Background subtle | `rgba(255, 255, 255, 0.02)` |
| Border | `rgba(255, 255, 255, 0.06)` |
| Border hover | `rgba(255, 255, 255, 0.12)` |
| Shadow | `0 4px 30px rgba(0, 0, 0, 0.3)` |

**Sky Gradients (Time-of-Day):**

| Time | Gradient Stops |
|------|---------------|
| Night | `#030610 → #050a18 → #0a1628` |
| Dawn | `#1a1030 → #2d1b4e → #4a2040` |
| Day | `#0a1628 → #15294d → #1e3a5f` |
| Dusk | `#0d0a1e → #1a1040 → #2a1535` |

### Typography

| Role | Font Family | Weights | Usage |
|------|-------------|---------|-------|
| Display | Playfair Display | 400, 500, 600 | Hero title, section headings |
| Body | Inter | 200, 300, 400, 500 | Body text, descriptions, UI labels |
| Monospace | JetBrains Mono | 400, 500 | Data values, labels, measurements |

**Type Scale:**

| Class | Font | Size | Weight | Notes |
|-------|------|------|--------|-------|
| `.text-hero` | Playfair Display | `clamp(2rem, 4vw, 2.5rem)` | 500 | Letter-spacing: −0.01em |
| `.text-section` | Playfair Display | `clamp(1.25rem, 2.5vw, 1.5rem)` | 400 | |
| `.text-body` | Inter | 0.875rem | 400 | Line-height: 1.6 |
| `.text-label` | JetBrains Mono | 0.625rem | 500 | Uppercase, letter-spacing: 0.1em |
| `.text-data` | JetBrains Mono | 0.875rem | 400 | |

### Overall Aesthetic

**Theme concept:** "200 metres underwater" — bioluminescent deep ocean. No sunlight reaches this depth, only gently pulsing organisms. Currents move gently. Time slows. Pressure is felt.

- **Mode**: Dark only (no light mode)
- **Glassmorphism**: Cards use `backdrop-filter: blur(20px)` with 3% white background and 6% white borders
- **Phase-driven**: Entire UI subtly shifts colour based on current tidal phase (2.5s crossfade)
- **Organic motion**: Wave physics, particle drift, caustic light patterns — nothing feels mechanical

### Animations & Effects

**Background Layers:**
1. Multi-stop radial gradient atmosphere (deep ocean blues)
2. Water caustics — subtle shifting interference patterns (23s + 31s alternating cycles)
3. 40 bioluminescent particles — drifting plankton (75% cyan, 25% violet), 60–120s drift duration each
4. Depth vignette — darker edges, light filtering from above

**Wave Animation:**
- 4 SVG wave layers at independent frequencies/speeds
- Driven by `requestAnimationFrame` with harmonic overtones
- SVG filters (feTurbulence + feDisplacementMap) for underwater caustics

**Tidal Curve Animation:**
- Shimmer spot travels along the curve (30s loop)
- "Now" marker: 3 concentric pulsing ripple rings (staggered 0.6s delays)
- Glow filter on now marker (pulsing drop-shadow)

**Card & UI Animations:**
- Cards enter with spring easing (0.9s)
- Phase colour transitions: 2.5s ease-out
- Info sections: grid-template-rows expand (300ms)
- Bottom sheet: slide-up 0.3s / slide-down 0.2s
- Header: transparent → frosted glass on scroll (0.3s)

**Accessibility:**
- Full `prefers-reduced-motion` support — all animations reduced to 0.001ms
- Safe area insets for notched devices

---

## 7. Unique Selling Points

1. **Purpose-built for practitioners** — Not a fishing or sailing tide app. Every element is designed for sound healing, wellness, and energetic alignment with natural cycles.

2. **Phase-aware guidance** — The four tidal phases are mapped to energetic qualities (Building, Fullness, Release, Stillness) with poetic practitioner guidance — something no generic tide app offers.

3. **Live synthesised soundscape** — A 5-layer ambient drone (sub-bass, binaural beats, harmonics, ocean noise, LFO breathing) that evolves in real-time with the tide. Includes 3Hz theta brainwave entrainment.

4. **Sacred frequency options** — Choose from 432Hz (Verdi tuning), 440Hz (concert pitch), or 528Hz (Solfeggio "love frequency") as the base tone.

5. **Offline-first, privacy-first** — All tide predictions run on-device from harmonic constituents. No data sent to servers after initial load. Privacy-friendly Plausible analytics only.

6. **8,000+ global stations** — Comprehensive worldwide coverage with instant station search.

7. **Stunning visual design** — Bioluminescent deep-ocean aesthetic with multi-layer animations, phase-responsive colours, and glassmorphism. The UI itself feels like being underwater.

8. **Part of the Harmonic Waves ecosystem** — Fits within a broader suite of tools for frequency and vibration work.

---

## 8. Existing Promo Content

### In-App Copy
- **Meta description**: `"Live tidal data for sound healing practitioners"`
- **Footer**: `"Tide Resonance · Harmonic Waves"` / `"Crafted by Remigijus Dzingelevičius · 2026"`
- **Settings**: `"Tide Resonance v1.0"` / `"Part of the Harmonic Waves ecosystem"`

### Card Info Texts (Education/Marketing Hybrid)

**Tidal Energy Card:**
> "The tidal phase reflects the ocean's current energetic quality. As the tide moves through its cycle — rising, peaking, ebbing, and resting — it carries distinct characteristics that coastal cultures have recognised for thousands of years. Many people find that aligning activities with these natural rhythms creates a deeper sense of flow and connection."

**Current Tide Card:**
> "This shows the live state of the tide at your station. Water height is measured from a reference point called chart datum. The rate of change tells you how quickly the water is moving — faster in mid-tide, slowing as it approaches high or low water. The bar shows where the current level sits between today's lowest and highest predicted points."

**Today's Tides Card:**
> "These are the predicted times and heights for high and low water at your station today. Tides follow a roughly 12-hour 25-minute cycle, so each day the times shift slightly later. Most locations experience two highs and two lows per day. Actual times may vary slightly due to weather and atmospheric pressure."

**Station Card:**
> "Your tidal data is calculated using harmonic analysis — a mathematical method that combines the gravitational effects of the moon, sun, and local geography to predict water levels. This runs entirely on your device with no internet connection needed after the initial load. Data covers over 8,000 coastal stations worldwide."

### No Existing Promo Routes
- No `/promo` route
- No `/pricing` route
- No social media copy generator
- README is generic Next.js boilerplate

---

## 9. Monetisation

**Current status: Entirely free. No monetisation infrastructure exists.**

- No payment provider (no Stripe, LemonSqueezy, Paddle)
- No paid tiers or feature gating
- No pricing pages or subscription logic
- No premium/pro distinctions
- No API keys for payment services

---

## 10. Screenshot Recommendations

**Screenshot 1: Hero Section — Rising Tide, Daytime**
Full hero visual showing animated waves, sky gradient, waterline info, "Low Water in 3h 46m" overlay, station name in sky. Cyan phase colour. Captures the "wow" factor.

**Screenshot 2: Hero Section — High Water, Night**
Same hero but at night with stars visible, white-cyan phase colour at peak fullness. Shows time-of-day awareness.

**Screenshot 3: Tidal Energy Card — Expanded**
The phase guidance card showing "Rising Tide ↑" with "Building · Expansion · Momentum" and the three guidance lines. Shows the wellness/practitioner angle.

**Screenshot 4: 24-Hour Tidal Curve**
The full curve with gradient fill, NOW marker pulsing, high/low labels, shimmer animation. Demonstrates data density and beauty.

**Screenshot 5: Full Card Stack (Scrolled)**
Current Tide card + Today's Tides card visible together — showing water height, rate of change, progress bar, and upcoming tide times. Demonstrates practical data.

**Screenshot 6: 7-Day Calendar**
The tidal calendar showing a full week of tide times. Shows planning utility.

**Screenshot 7: Settings Panel — Sound Section**
Bottom sheet open showing the Ambient Drone toggle, volume slider, and 432/440/528 Hz frequency selector. Highlights the audio feature.

**Screenshot 8: Settings Panel — Station Search**
Bottom sheet with search field active, showing station results from multiple regions. Demonstrates global coverage.

**Screenshot 9: Welcome Screen**
Clean welcome screen with "Tide Resonance" title and "Find My Coast" button. First impression capture.

**Screenshot 10: Mobile Full-Screen Overview**
Complete mobile viewport showing header (Live indicator), hero section, and top of first card. Represents the overall experience.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | App metadata, fonts, analytics |
| `src/app/globals.css` | All CSS variables, animations, glass system (464 lines) |
| `src/lib/tideEngine.ts` | Core tide computation engine |
| `src/lib/colour-utils.ts` | Phase → colour mapping |
| `src/lib/sky-utils.ts` | Time-of-day sky gradients (SunCalc) |
| `src/lib/phaseGuidance.ts` | Phase labels, qualities, and guidance text |
| `src/lib/motion-constants.ts` | Centralised animation timings and easings |
| `src/hooks/useTidalState.ts` | Live tidal state with 60s refresh |
| `src/hooks/useAudioDrone.ts` | 5-layer Web Audio synthesis |
| `src/hooks/useGeolocation.ts` | Device location with Whitby fallback |
| `src/hooks/useSettings.ts` | localStorage preference persistence |
| `src/hooks/useTideNotifications.ts` | Browser notification scheduling |
| `src/components/HeroSection/` | Sky, waves, waterline, mini curve, particles |
| `src/components/TidalCurve/` | 24h curve with NOW marker and shimmer |
| `src/components/OceanBackground/` | Multi-layer bioluminescent background |
| `src/components/SettingsSheet/` | Settings UI with search, audio, notifications |
| `src/components/BottomSheet/` | Glassmorphism sliding panel |
| `src/components/InfoCard/` | Card wrapper with expandable info |
