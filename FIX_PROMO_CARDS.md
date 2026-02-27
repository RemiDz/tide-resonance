# Fix Promo Cards — Complete Visual Overhaul

## Problem

The 6 shareable cards on `/promo` are nearly empty. Content is tiny, cramped into small areas with huge dead space. They need to be completely rebuilt to fill their space with rich, visually dense content that looks professional when shared on social media.

## Reference

Study the Earth Pulse promo cards implementation for the visual pattern. Those cards use:
- Large hero data values (36-48px)
- Star field backgrounds
- Radial accent glows
- Coloured accent stripes
- Progress bars with glow effects
- Properly sized typography filling the entire card

Our cards need to match that level of visual quality using Tide Resonance's deep-ocean aesthetic.

---

## CardShell — Shared Wrapper (rebuild this first)

Every card wraps in a `CardShell` component. All styles MUST be inline (html2canvas cannot read Tailwind classes or CSS custom properties).

### CardShell structure:

```
<div ref={innerRef} style={{
  width: isStory ? 270 : 320,
  height: isStory ? 480 : 320,
  background: 'linear-gradient(160deg, #050810 0%, #0a1628 35%, #0c1832 65%, #0a1628 100%)',
  borderRadius: 16,
  border: `1px solid ${color}35`,
  padding: isTiktok ? '45px 20px 70px' : isStory ? '20px 20px 16px' : '16px 16px 12px',
  boxShadow: `0 4px 30px rgba(0,0,0,0.5), 0 0 40px ${color}15`,
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
}}>
  {/* 1. Star field — 60 tiny dots */}
  <StarField />

  {/* 2. Accent top stripe */}
  <div style={{
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    height: 2,
    background: `linear-gradient(90deg, transparent, ${color}90, transparent)`,
    pointerEvents: 'none',
  }} />

  {/* 3. Card number — top right */}
  <div style={{
    position: 'absolute',
    top: 8,
    right: 12,
    fontSize: 8,
    color: '#C8C4DC',
    fontFamily: "'JetBrains Mono', monospace",
  }}>
    {cardNum}/6
  </div>

  {/* 4. Accent glow — behind main content */}
  <div style={{
    position: 'absolute',
    left: '50%',
    top: isStory ? '30%' : '35%',
    transform: 'translate(-50%, -50%)',
    width: 180,
    height: 180,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${color}30 0%, ${color}10 40%, transparent 70%)`,
    pointerEvents: 'none',
  }} />

  {/* 5. Card content (children) */}
  {children}
</div>
```

### StarField component:

Generate 60 dots with deterministic positions (no Math.random — use index-based calculation so they're consistent across renders):

```tsx
const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: (i * 73 + 17) % 100,
  y: (i * 47 + 31) % 100,
  size: (i % 3) + 1,
  opacity: 0.2 + (i % 5) * 0.1,
}));

function StarField() {
  return (
    <>
      {STARS.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${s.x}%`,
          top: `${s.y}%`,
          width: s.size,
          height: s.size,
          borderRadius: '50%',
          backgroundColor: '#C8C4DC',
          opacity: s.opacity,
          pointerEvents: 'none',
        }} />
      ))}
    </>
  );
}
```

### CardFooter component:

```tsx
function CardFooter({ cardNum, isStory, color }: { cardNum: number; isStory: boolean; color: string }) {
  return (
    <div style={{ marginTop: 'auto', width: '100%', textAlign: 'center' }}>
      {/* Gradient divider */}
      <div style={{
        width: '60%',
        height: 1,
        background: `linear-gradient(90deg, transparent, ${color}50, transparent)`,
        margin: '0 auto',
        marginBottom: isStory ? 12 : 8,
      }} />
      {/* App name */}
      <p style={{
        fontSize: 13,
        fontWeight: 700,
        color: '#F0EEF8',
        marginBottom: 3,
        fontFamily: "'Playfair Display', Georgia, serif",
        letterSpacing: '0.05em',
      }}>tidara.app</p>
      {/* Date */}
      <p style={{
        fontSize: 7,
        color: 'rgba(200,196,220,0.6)',
        marginBottom: 4,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
      {/* Page dots */}
      <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginTop: 4 }}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            backgroundColor: i === cardNum - 1 ? color : 'rgba(200,196,220,0.2)',
          }} />
        ))}
      </div>
    </div>
  );
}
```

### Font constants:

```tsx
const FONT_DISPLAY = "'Playfair Display', Georgia, serif";
const FONT_BODY = "'Inter', system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', 'Fira Code', monospace";
```

### Phase colour mapping:

```tsx
const PHASE_COLORS: Record<string, string> = {
  rising: '#4fc3f7',
  high: '#e0f7fa',
  ebbing: '#7986cb',
  low: '#1a237e',
};
```

---

## CARD 1: Tidal Phase (slug: `phase`)

The hero card — shows current phase at a glance. This is the most important card.

```
Layout (top to bottom, centred):
├── Title: "TIDE RESONANCE" — Playfair Display, 10px, uppercase, letter-spacing 0.15em, text-shadow glow
├── Subtitle: "Live Tidal Phase" — JetBrains Mono, 7px, muted
├── [spacer — isStory ? 16px : 8px]
├── Phase symbol: ↑ or ◆ or ↓ or ◇ — 48px font size, phase colour, text-shadow glow
├── [spacer 4px]
├── Phase badge: "Rising Tide" — 12px, bold, phase colour text, phase colour bg at 30% opacity, 
│   padding 3px 12px, border-radius 20px, border 1px solid {color}40
├── [spacer — isStory ? 12px : 6px]
├── Water height: "-0.83m" — JetBrains Mono, 36px (post) or 42px (story), font-weight 800, 
│   phase colour, text-shadow: 0 0 12px {color}50
├── [spacer 4px]
├── Guidance text: "Energy is building naturally" — 10px, rgba(240,238,248,0.9), max-width 200px
├── [STORY MODE ONLY: stats box]
│   ├── background #0a1628, border 1px solid {color}25, border-radius 8px, padding 8px 14px
│   ├── Rate of change: "+0.32 m/hr" — value in white
│   ├── Tidal range: "3.21m" — value in white
│   └── Next tide: "High Water at 14:32" — value in white
├── [spacer auto]
└── CardFooter
```

Use the actual unicode characters for phase symbols, NOT escape sequences:
- Rising: `↑`
- High Water: `◆`
- Ebbing: `↓`
- Low Water: `◇`

---

## CARD 2: Current Conditions (slug: `conditions`)

Data-rich card showing live measurements.

```
Layout (top to bottom, centred then left-aligned content):
├── Title: "CURRENT CONDITIONS" — Playfair Display, 11px, bold, uppercase, letter-spacing 0.1em, glow
├── Subtitle: "Live Tidal Data" — JetBrains Mono, 9px, muted
├── [spacer — isStory ? 20px : 12px]
├── Water height section (85% width):
│   ├── Label: "Water Height" — JetBrains Mono, 9px, left-aligned
│   ├── Value: "-0.83m" — JetBrains Mono, 28px, bold, phase colour, text-shadow glow
│   ├── Progress bar (8px tall, rounded):
│   │   ├── Track: rgba(200,196,220,0.12)
│   │   └── Fill: phase colour with box-shadow glow, width = percentage between low and high
│   └── Scale labels: "Low" left, "High" right — 7px, muted
├── [spacer — isStory ? 20px : 12px]
├── Stats box (85% width, bg #0a1628, border {color}25, rounded 10px, padding 12px 14px):
│   ├── Rate of change row:
│   │   ├── Arrow: ↑ or ↓ (22px, coloured — green for rising, amber for falling)
│   │   ├── Label: "Rate of Change" — 9px
│   │   └── Value: "+0.32 m/hr" — 14px, bold, coloured
│   ├── [divider: 1px line at 8% opacity]
│   ├── Tidal range row:
│   │   ├── Label: "Tidal Range" — 9px
│   │   └── Value: "3.21m" — 14px, bold, white
│   └── [divider]
│   └── Station row:
│       ├── Label: "Station" — 9px
│       └── Value: "North Shields" — 14px, bold, phase colour
├── [spacer auto]
└── CardFooter
```

---

## CARD 3: Tidal Energy (slug: `energy`)

Shows how the current phase maps to practitioner guidance areas.

```
Layout:
├── Title: "TIDAL ENERGY" — 11px, bold, uppercase, glow
├── Subtitle: "{phase} Phase · {station}" — 9px, muted
├── [spacer — isStory ? 16px : 8px]
├── Four practitioner rows (90% width, left-aligned, gap: isStory ? 12px : 6px):
│   Each row:
│   ├── Header line: emoji + bold label + intensity label (right-aligned, coloured)
│   │   ├── 🧘 Practice   → intensity varies by phase
│   │   ├── 🎵 Sound      → intensity varies by phase
│   │   ├── 💆 Bodywork   → intensity varies by phase
│   │   └── 🧠 Mindset    → intensity varies by phase
│   ├── Progress bar (5px tall):
│   │   ├── Track: rgba(200,196,220,0.12)
│   │   └── Fill: coloured bar with glow, width varies by phase:
│   │       Rising: Practice 70%, Sound 60%, Bodywork 50%, Mindset 80%
│   │       High:   Practice 90%, Sound 90%, Bodywork 70%, Mindset 90%
│   │       Ebbing: Practice 40%, Sound 50%, Bodywork 80%, Mindset 60%
│   │       Low:    Practice 20%, Sound 30%, Bodywork 30%, Mindset 90%
│   └── Description text: 8px, muted, line-height 1.4
├── [spacer auto]
└── CardFooter
```

**Intensity labels by score:**
- 0-30%: "Gentle" (colour: #4fc3f7)
- 31-50%: "Moderate" (colour: #4fc3f7)
- 51-70%: "Active" (colour: #ffab40)
- 71-100%: "Strong" (colour: #e0f7fa)

**Description text per phase per category:**

Rising:
- Practice: "Dynamic flow sequences — build energy"
- Sound: "Ascending scales, frame drums, rhythmic patterns"
- Bodywork: "Deep tissue, joint mobilisation, activation"
- Mindset: "Set intentions, envision growth, plan forward"

High Water:
- Practice: "Peak energy work — expansive, powerful sessions"
- Sound: "Full spectrum, gongs, crystal bowls at volume"
- Bodywork: "Full body integration, energy circulation"
- Mindset: "Celebrate abundance, express gratitude, receive"

Ebbing:
- Practice: "Gentle release sequences — slow and yielding"
- Sound: "Descending tones, ocean drum, soft chimes"
- Bodywork: "Lymphatic drainage, gentle stretching, cooling"
- Mindset: "Let go of attachments, forgive, release tension"

Low Water:
- Practice: "Stillness practices — yin, meditation, savasana"
- Sound: "Silence, minimal drone, soft monochord"
- Bodywork: "Light touch, craniosacral, energy holding"
- Mindset: "Deep reflection, journaling, inner listening"

---

## CARD 4: Practitioner Guide (slug: `advice`)

Four recommendation boxes with clear structure.

```
Layout:
├── Title: "PRACTITIONER GUIDE" — 11px, bold, uppercase, glow
├── Subtitle: "Phase-Aligned Recommendations" — 9px, muted
├── [spacer — isStory ? 16px : 10px]
├── Four recommendation boxes (90% width, vertical stack, gap: isStory ? 10px : 6px):
│   Each box:
│   ├── Container: bg #0a1628, border 1px solid {color}25, border-radius 8px, padding 10px 12px
│   ├── Label: uppercase, 7px, bold, letter-spacing 0.1em, phase colour, margin-bottom 4px
│   │   Labels: "SESSION TYPE", "INSTRUMENTS", "FREQUENCIES", "CLIENT GUIDANCE"
│   └── Value text: 9px, rgba(240,238,248,0.9), line-height 1.5
├── [spacer auto]
└── CardFooter
```

**Content per phase:**

Rising:
- Session type: "Expansive session — build and channel rising energy"
- Instruments: "Frame drums, didgeridoo, rattles, voice"
- Frequencies: "432 Hz base, ascending intervals, perfect fifths"
- Client guidance: "Focus on intention setting, new beginnings, creative projects"

High Water:
- Session type: "Peak energy session — powerful and transformative"
- Instruments: "Gongs, large crystal bowls, full drum kit, voice"
- Frequencies: "528 Hz base, full harmonic spectrum, overtone-rich"
- Client guidance: "Embrace fullness, celebrate achievements, express gratitude"

Ebbing:
- Session type: "Release session — gentle, clearing, cleansing"
- Instruments: "Ocean drum, rain stick, soft chimes, singing bowls"
- Frequencies: "432 Hz base, descending intervals, minor seconds"
- Client guidance: "Release what no longer serves, forgive, let go of tension"

Low Water:
- Session type: "Stillness session — deep rest and integration"
- Instruments: "Monochord, soft singing bowls, tuning forks"
- Frequencies: "432 Hz base, sustained drones, minimal movement"
- Client guidance: "Deep reflection, inner listening, integration of experiences"

---

## CARD 5: Call to Action (slug: `cta`)

App promotion card with mini tidal curve.

```
Layout:
├── Title: "TIDE RESONANCE" — 11px, bold, uppercase, glow
├── Subtitle: "Align with the Ocean's Rhythm" — 9px, muted
├── [spacer — isStory ? 20px : 12px]
├── Mini tidal curve SVG (80% width, height: isStory ? 120px : 80px):
│   ├── Smooth sine-like curve representing a tidal day
│   ├── Gradient fill underneath: phase colour at 15% opacity fading to transparent
│   ├── Stroke: phase colour at 60% opacity, 2px
│   ├── Two high markers (△) and two low markers (▼) with time labels
│   └── "Now" dot: pulsing circle on the curve at current position
├── [spacer 8px]
├── Summary text: "Today: 2 high tides, 2 low tides" — 10px, white, centred
├── [spacer — isStory ? 16px : 8px]
├── CTA box (85% width):
│   ├── Container: bg {color}10, border 1px solid {color}30, border-radius 10px, padding 12px
│   ├── "Track the tide in real time" — 11px, bold, white
│   ├── "tidara.app" — 14px, bold, phase colour, letter-spacing 0.05em
│   └── "Free · No account · Works offline" — 8px, muted
├── [spacer auto]
└── CardFooter
```

The SVG curve should be a simple cosine wave shape:
```
M 0,{mid} C {w*0.12},{low} {w*0.25},{low} {w*0.25},{mid}
C {w*0.25},{high} {w*0.37},{high} {w*0.5},{mid}
C {w*0.5},{low} {w*0.62},{low} {w*0.75},{mid}
C {w*0.75},{high} {w*0.87},{high} {w},{mid}
```

---

## CARD 6: 7-Day Tidal Calendar (slug: `forecast`)

Weekly overview showing tidal patterns.

```
Layout:
├── Title: "7-DAY TIDAL CALENDAR" — 11px, bold, uppercase, glow
├── Subtitle: "{station}" — 9px, muted
├── [spacer — isStory ? 16px : 8px]
├── Calendar grid (90% width, height: isStory ? 260px : 160px):
│   ├── 7 columns, evenly spaced
│   ├── Each column:
│   │   ├── Day label at top: "Today" / "Mon" / "Tue" etc — 7px, JetBrains Mono
│   │   ├── Vertical track: 2px wide line, full height, rgba(200,196,220,0.08)
│   │   ├── High tide dots: ◆ markers at vertical positions representing times
│   │   │   Small label next to each: time (e.g. "03:41") — 5px
│   │   └── Low tide dots: ◇ markers at vertical positions
│   │       Small label next to each: time — 5px
│   ├── Today's column highlighted:
│   │   ├── Background: {color}08
│   │   ├── Day label in phase colour and bold
│   │   └── Track line: {color}40 instead of muted
│   └── Time scale on left: "00:00" top, "12:00" middle, "23:59" bottom — 5px, muted
├── [spacer auto]
└── CardFooter
```

Use actual tide times from the tidal state hook for today. For the other 6 days, use the 7-day forecast data if available, or generate approximate times by shifting today's times by ~50 minutes per day (tides shift ~50 min later each day due to the lunar cycle).

---

## IMPORTANT REMINDERS

1. **ALL styles must be inline** — html2canvas cannot read Tailwind classes, CSS modules, or CSS custom properties. Every style must be in the `style={{}}` prop.

2. **Use actual unicode characters** — Write `↑`, `↓`, `◆`, `◇`, `△`, `▼` directly in the JSX. Do NOT use escape sequences like `\u2193`.

3. **Fonts must be specified as full font-family strings** — e.g. `"'Playfair Display', Georgia, serif"` not just `"Playfair Display"`.

4. **Phase colour should be dynamic** — get the current phase from the tidal state hook and map it to the correct colour using the PHASE_COLORS object.

5. **Cards must fill their space** — Post cards are 320×320 display (1080×1080 output). Story cards are 270×480 display (1080×1920 output). Content should use the full available area with intentional spacing, not be cramped in one corner.

6. **The card number indicator** in the top-right corner should show `1/6`, `2/6`, `3/6`, `4/6`, `5/6`, `6/6`.

7. **Test at both Post and Story sizes** — content should reflow appropriately for both formats. Story mode gets more spacing and can show additional data that post mode omits.

8. **CardFooter always goes at the bottom** — use `marginTop: 'auto'` on the footer wrapper to push it to the bottom of the flex container.

## CARD FILE SLUGS

```tsx
export const CARD_FILE_SLUGS = ['phase', 'conditions', 'energy', 'advice', 'cta', 'forecast'];
```

File naming pattern: `tide-resonance-{cardNum}-{slug}-{YYYY-MM-DD}.png`
