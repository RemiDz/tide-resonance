# Tide Resonance — Content Studio (/promo)

## Instructions for Claude Code

Build a hidden `/promo` route (Content Studio) within the existing Tide Resonance app at tidara.app. This is a personal tool for the app creator to generate daily social media content using live tidal data. It is NOT linked anywhere in the app navigation.

**Reference:** This follows the exact same pattern as Earth Pulse's Content Studio at shumann.app/promo. Same architecture, same UX flow, adapted for tidal data instead of geomagnetic data.

---

## ARCHITECTURE

### Route Setup

Add a lazy-loaded route in the app's router:

```tsx
const PromoGenerator = lazy(() => import('./components/PromoGenerator'));

// In your route config:
<Route
  path="/promo"
  element={
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white/40">Loading Content Studio...</div>}>
      <PromoGenerator />
    </Suspense>
  }
/>
```

If the app uses Next.js App Router, create `src/app/promo/page.tsx` instead.

### Files to Create

| File | Purpose |
|------|---------|
| `PromoGenerator.tsx` (or `page.tsx`) | Main page component — stats bar, hooks, captions, card display, content calendar |
| `PromoCards.tsx` | 6 shareable card components rendered off-screen for capture |

### Shared Code to Reuse

These already exist in the app — import them directly, do NOT duplicate:

- `useTidalState` hook — live tidal phase, water height, rate of change, next tide times
- `phaseGuidance.ts` — phase labels, qualities, guidance text
- `colour-utils.ts` — phase → colour mapping
- `sky-utils.ts` — time-of-day sky gradients
- `tideEngine.ts` — harmonic tide computation
- `OceanBackground` component — multi-layer bioluminescent background (if reusable), otherwise create a simpler animated background for the promo page

---

## PAGE LAYOUT (Top to Bottom)

### 1. Animated Background
Reuse the app's OceanBackground component if possible, or create a simplified version with:
- Deep ocean gradient background (#050810 → #0a1628)
- Bioluminescent particles (cyan #4fc3f7, violet #7986cb)
- Water caustics (subtle)
- Phase-responsive colour shift

### 2. Header
```
Tide Resonance — Content Studio
[date in format: Monday, 24 February 2026]
Current Phase: Rising Tide ↑  |  Water Height: 2.15m  |  [phase colour badge]
```

### 3. Quick Stats Bar (glass card)
```
Phase: Rising ↑  |  Water Height: 2.15m  |  Rate: +0.32 m/hr  |  Range: 3.5m  |  Next: High Water at 14:32
```
- Use the app's existing glass card styling (backdrop-filter: blur(20px), rgba white borders)
- All data from `useTidalState` hook
- JetBrains Mono for data values

### 4. 24-Hour Tidal Curve
Render the same tidal curve that appears on the dashboard but styled for the content studio context:
- Smooth Catmull-Rom spline showing water height over 24h
- Gradient fill under curve using phase colours
- High/low extreme markers with time + height labels
- "Now" marker with pulsing indicator
- Past times dimmed, future times bright

### 5. Shareable Cards Section

**Format toggle:** Three pill buttons — Post (1:1), Story (9:16), TikTok (9:16 safe)

**6 cards to create** (see CARD SPECIFICATIONS section below)

**Rendering method:**
- Use `html2canvas-pro` to capture card DOM refs
- Cards render off-screen (position: fixed, left: -9999px)
- Scale to 1080px width (1080×1080 for Post, 1080×1920 for Story/TikTok)
- Show as `<img>` tags for mobile long-press save
- Auto-render on data change with useEffect
- "Download All 6 Cards" button with sequential download (200ms delay between each)

**File naming:** `tide-resonance-{cardNum}-{slug}-{YYYY-MM-DD}.png`

### 6. Opening Hooks
- 5 hooks per tidal phase (20 total — see HOOKS section)
- One auto-selected based on day hash: `dayHash = date + month * 31`
- Selectable list — clicking a hook highlights it and updates captions
- Shuffle button to cycle through hooks
- Selected hook has accent glow with phase colour

### 7. Ready-to-Copy Captions
Four caption blocks, each with a copy button:
- **Instagram** (14 hashtags)
- **Twitter/X** (3 hashtags)
- **TikTok** (7 hashtags)
- **WhatsApp/DM** (no hashtags, conversational)

Copy button behaviour:
- Click copies text to `navigator.clipboard`
- Button changes to green checkmark + "Copied!" for 2 seconds
- Styled with phase accent colour

### 8. Content Calendar Hints
Glass card with:
```
💡 Best times to post:
- Instagram: 9-11am, 7-9pm
- TikTok: 7-9am, 12-3pm, 7-11pm
- Twitter: 8-10am, 12-1pm

📅 Content ideas based on current conditions:
- [If Rising Tide]: "Energy is building — share momentum-themed content"
- [If High Water]: "Peak energy moment — post about fullness and abundance"
- [If Ebbing Tide]: "Releasing energy — content about letting go and cleansing"
- [If Low Water]: "Deep stillness — meditation and reflection content"
- Weekly: "Tidal cycle recap — how the week's tides aligned with your practice"
- Evergreen: "Why sound healers track the tide — the science behind tidal resonance"
```

---

## CARD SPECIFICATIONS

All cards share this structure:

### CardShell (wrapper)
- Background: `linear-gradient(160deg, #050810 0%, #0a1628 35%, #0c1832 65%, #0a1628 100%)`
- Border: `1px solid {phaseColor}35`
- Border radius: 16px
- Box shadow: `0 4px 30px rgba(0,0,0,0.5), 0 0 40px {phaseColor}15`
- Star field: 60 tiny white dots scattered (same pattern as Earth Pulse)
- Accent stripe: 2px gradient line at top using phase colour
- Card number indicator: top-right corner, e.g. "1/6"
- Phase colour glow: radial gradient behind content
- Post size: 320×320 display (1080×1080 output)
- Story size: 270×480 display (1080×1920 output)
- TikTok: same as Story with 45px top + 70px bottom safe zone padding

### CardFooter (shared)
- Thin gradient divider line
- `tidara.app` in bold (Playfair Display)
- Date below (JetBrains Mono, small)
- Page dots: 6 dots, active dot uses phase colour

### Card 1: Tidal Phase (slug: `phase`)
- Title: "TIDE RESONANCE" (Playfair Display, uppercase, small)
- Subtitle: "Live Tidal Phase" (JetBrains Mono, tiny)
- Large phase symbol: ↑ ◆ ↓ ◇ (coloured)
- Phase name in colour badge (e.g. "Rising Tide")
- Water height prominently: "2.15m" (large, JetBrains Mono, phase colour)
- Wellness/guidance text: first guidance line from phaseGuidance
- Story mode adds: rate of change, tidal range, next tide time

### Card 2: Current Conditions (slug: `conditions`)
- Title: "CURRENT CONDITIONS"
- Subtitle: "Live Tidal Data"
- Water height with progress bar (Low ← → High)
- Rate of change: "+0.32 m/hr" with up/down arrow
- Tidal range display
- Station name

### Card 3: Energy Guidance (slug: `energy`)
- Title: "TIDAL ENERGY"
- Subtitle: "Kp {phase} Phase · {station}"
- Four rows showing the tidal qualities mapped to practitioner areas:
  - 🧘 Practice: [guidance for practice type]
  - 🎵 Sound: [instrument/frequency suggestion]
  - 💆 Bodywork: [bodywork guidance]
  - 🧠 Mindset: [mental/emotional guidance]
- Each with a coloured progress bar showing intensity (varies by phase)

### Card 4: Practitioner Advice (slug: `advice`)
- Title: "PRACTITIONER GUIDE"
- Subtitle: "Phase-Aligned Recommendations"
- Four recommendation cards:
  - Session type (e.g. "Expansive session — build energy")
  - Instruments (e.g. "Crystal bowls, monochord, voice")
  - Frequencies (e.g. "432 Hz base, perfect fifths")
  - Client guidance (e.g. "Focus on manifestation and intention setting")

### Card 5: Call to Action (slug: `cta`)
- Title: "TIDE RESONANCE"
- Mini 24h tidal curve (simplified SVG)
- Today's summary: "2 high tides, 2 low tides"
- CTA box: "Track the tide in real time" + "tidara.app" + "Free · No account · Works offline"

### Card 6: 7-Day Overview (slug: `forecast`)
- Title: "7-DAY TIDAL CALENDAR"
- Subtitle: "Kp {station name}"
- 7 mini columns showing each day's tidal pattern
- Day labels (Today, Mon, Tue...)
- High/low markers per day
- Current day highlighted with phase colour

---

## HOOKS (20 total: 5 per phase)

### Rising Tide:
- "The ocean is building right now. Can you feel the momentum?"
- "Rising tide energy — this is the time to start something new"
- "Water is climbing. Your energy wants to expand with it"
- "The tide is rising. Nature says: move forward"
- "Building phase. If you've been waiting for a sign — this is it"

### High Water:
- "The ocean just peaked. Everything is full right now"
- "High water — maximum energy, maximum potential"
- "Peak tide. The ocean is holding its breath before releasing"
- "Fullness in the water, fullness in the field. Feel it"
- "High water moment. Pause and receive before the release begins"

### Ebbing Tide:
- "The tide is pulling back. Let it take what you don't need"
- "Ebbing energy — the ocean is cleansing the shore right now"
- "Water is receding. Your body knows it's time to release"
- "The tide is letting go. Are you?"
- "Ebb phase. Everything the ocean releases makes space for what's coming"

### Low Water:
- "The ocean is at its quietest. Deep stillness right now"
- "Low water — the space between breaths. Rest here"
- "The tide has reached its lowest point. Integration time"
- "Stillness in the water. Stillness in you"
- "Low tide. The ocean rests before building again. You should too"

---

## CAPTION TEMPLATES

### Instagram (`igTemplate`)
```
{{hook}} 🌊

The tide at {{station}} is currently {{phase}} — {{qualities}}

{{guidance}}

Track tidal energy for your sound healing practice — link in bio 🔗

#tidehealing #tidalrhythms #soundhealing #moonandtides #oceanhealing #432hz #528hz #frequencyhealing #soundhealingpractitioner #naturalrhythms #tidalenergy #coastalwellness #binauralbeats #energyhealing
```

### Twitter/X (`twitterTemplate`)
```
{{hook}} 🌊

{{phase}} at {{station}}. {{guidance}}

Track it live: tidara.app

#TidalResonance #SoundHealing #OceanEnergy
```

### TikTok (`tiktokTemplate`)
```
{{hook}} 🌊✨

Tide is {{phase}} right now ({{height}}m). {{qualities}}

Sound healers — are you tracking this? Link in bio 👆

#tidalhealing #soundhealing #oceanenergy #432hz #tidehealing #naturalrhythms #fyp
```

### WhatsApp/DM (`whatsappTemplate`)
```
Hey! The tide at {{station}} is {{phase}} right now ({{height}}m). {{guidance}} If you work with natural cycles, check out tidara.app — it tracks tidal energy for practitioners. Free and works offline.
```

### Dynamic Variables

| Variable | Source |
|----------|--------|
| `hook` | Selected from 5 per-phase options |
| `station` | Current station name from useTidalState |
| `phase` | "Rising Tide" / "High Water" / "Ebbing Tide" / "Low Water" |
| `qualities` | "Building · Expansion · Momentum" etc. from phaseGuidance |
| `guidance` | First guidance line from phaseGuidance |
| `height` | Current water height formatted (e.g. "2.15") |

---

## STYLING

### Theme
Match the app's existing deep-ocean aesthetic exactly:

| Token | Value |
|-------|-------|
| Background | `#050810` (abyss) |
| Primary text | `rgba(255,255,255,0.85)` |
| Secondary text | `rgba(255,255,255,0.60)` |
| Muted text | `rgba(255,255,255,0.35)` |
| Glass card bg | `rgba(255,255,255,0.03)` |
| Glass border | `rgba(255,255,255,0.06)` |
| Accent | Dynamic phase colour |

### Phase Colours
| Phase | Colour |
|-------|--------|
| Rising | `#4fc3f7` (cyan) |
| High Water | `#e0f7fa` (white-cyan) |
| Ebbing | `#7986cb` (indigo) |
| Low Water | `#1a237e` (navy) |

### Fonts
- **Playfair Display** — headings, card titles
- **Inter** — body text, descriptions
- **JetBrains Mono** — data values, labels, measurements

### Important CSS Notes
- Cards use **inline styles only** (html2canvas requires it, Tailwind classes won't render)
- Page layout uses Tailwind as normal
- Dark mode only (no light mode)
- Glass cards: `backdrop-filter: blur(20px)` with subtle white borders

---

## DEPENDENCIES

```bash
npm i html2canvas-pro
```

If `react-router-dom` is needed and not already installed, add it. If using Next.js App Router, routing is handled by the file system — no extra dependency needed.

Icons: use `lucide-react` if already in the project. If not, use simple unicode symbols or inline SVGs.

---

## TESTING CHECKLIST

- [ ] `/promo` route loads without errors
- [ ] `/` still loads the normal app (no breaking changes)
- [ ] Current tidal data displays correctly on the promo page
- [ ] All 6 shareable cards render with correct live data
- [ ] Format toggle (Post/Story/TikTok) works and re-renders cards
- [ ] "Download All" saves 6 PNG files sequentially
- [ ] Card images can be long-pressed to save on mobile
- [ ] All 4 caption variants generate with correct dynamic data
- [ ] Copy buttons work and show "Copied!" feedback
- [ ] Hook selection updates the captions
- [ ] Shuffle button cycles through hooks
- [ ] Phase colour accent updates based on current tidal phase
- [ ] `/promo` is NOT linked from the main app navigation
- [ ] Page works on mobile (though optimised for desktop)
- [ ] No console errors
- [ ] Cards look clean when downloaded (no rendering artifacts, text is crisp)

---

## KEY PRINCIPLES

1. **Reuse existing hooks and data** — the promo page is just a different view of the same tidal data the app already computes
2. **All inline styles on cards** — html2canvas cannot read Tailwind classes or CSS custom properties
3. **Phase-driven content** — everything changes based on the current tidal phase (Rising/High/Ebbing/Low)
4. **Mobile-friendly downloads** — render cards as `<img>` tags so users can long-press to save
5. **No i18n needed** — English only for the promo page (unlike Earth Pulse which has Lithuanian)
6. **Hidden route** — not in any navigation, sitemap, or robot meta
