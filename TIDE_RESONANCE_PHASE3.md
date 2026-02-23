# Phase 3 — Radical Simplification: Breath First, Tide as Context

## The Core Problem

Users don't understand:
1. What the tidal curve chart means (it's a data visualisation — practitioners aren't scientists)
2. What the pulsing circle is for (it looks random without context)
3. How "Inhale..." relates to "Low water in 4h 10m" (they think they need to inhale for 4 hours)

The app is asking users to understand tidal science, then understand breathing entrainment, then connect the two. That's backwards.

## The Solution: Flip Everything

**The breathing guide IS the app.** The tide is invisible infrastructure — flavour, not content.

A practitioner opens the app and sees: **a beautiful breathing guide.** They breathe with it. It feels amazing. Somewhere subtle, they notice: "this rhythm is connected to the real ocean." That's the magic moment — but it comes AFTER they're already using it, not before.

---

## The New Single-Screen Design

No scrolling. No cards. No sections. ONE screen that fits on a phone without scrolling.

```
┌─────────────────────────────────┐
│                                 │
│          ≋ North Shields        │  ← tappable to change station
│                                 │
│     The tide is gently ebbing   │  ← one line of context
│                                 │
│                                 │
│                                 │
│          ╭─────────╮            │
│         ╱           ╲           │
│        │             │          │
│        │   BREATH    │          │  ← THE APP. Big. Central. 
│        │    ORB      │          │     240px on mobile
│        │             │          │
│         ╲           ╱           │
│          ╰─────────╯            │
│                                 │
│         I N H A L E             │  ← clear breath instruction
│                                 │
│        ╌╌╌╌╌●╌╌╌╌╌╌╌╌          │  ← breath progress bar
│        4s        4s             │     shows SECONDS not hours
│                                 │
│                                 │
│     ⚙        ≋        📖       │  ← 3 subtle icon buttons
│                                 │
│                                 │
└─────────────────────────────────┘
```

---

## Component Details

### 1. The Breath Orb — Now the Entire Experience

The orb is no longer one section among many. It IS the app. Make it huge, central, unmissable.

**Size:** 240px diameter on mobile, 300px on desktop. Centred vertically in the available space (between header and bottom buttons).

**How it breathes — MUST SHOW SECONDS:**

This is the critical fix. Users need to see this is a normal breathing exercise measured in seconds, NOT tied to tide hours.

**Breath progress indicator:**
Below the orb, show a simple horizontal progress bar or circular timer:

```
  I N H A L E
  ━━━━━━━●━━━━━━━━━━━
  ↑                  ↑
  0s                 6s
```

The progress dot moves from left to right during inhale, then right to left during exhale. The user can SEE it's a 6-second inhale, a 2-second hold, a 6-second exhale, a 2-second rest. Normal breathing. Not 4 hours.

**Alternatively, show a countdown number inside the orb:**
```
         ╭─────────╮
        ╱           ╲
       │             │
       │      4      │  ← countdown seconds
       │             │
        ╲           ╱
         ╰─────────╯
         INHALE
```

The number counts down: 6, 5, 4, 3, 2, 1 → HOLD → 2, 1 → EXHALE → 6, 5, 4, 3, 2, 1 → REST → 2, 1 → repeat.

**Pick the approach that works best visually — either the progress bar OR the countdown number. Not both.**

**Breath phase text:**
Below the orb, in spaced uppercase, clear and large (18px, letter-spacing 0.2em):
- `I N H A L E` — phase colour (cyan during rising tide)
- `H O L D` — phase colour (bright at high)
- `E X H A L E` — phase colour (indigo during ebb)
- `R E S T` — phase colour (deep navy at low)

These words crossfade smoothly. Never show both at once.

**How the tide secretly influences the breath:**
The tide doesn't change WHAT the user does (it's always inhale/hold/exhale/rest). It changes the TIMING subtly:

```
Rising tide   → inhale slightly longer than exhale (e.g., 7s in, 5s out)
High slack    → balanced, with a longer hold at top (6s in, 3s hold, 6s out)
Ebbing tide   → exhale slightly longer than inhale (e.g., 5s in, 7s out)  
Low slack     → balanced, with a longer rest at bottom (5s in, 5s out, 3s rest)
```

The user doesn't need to know this. They just feel that sometimes the inhale is a bit longer, sometimes the exhale is. It feels organic and oceanic without them understanding why. This is the magic — invisible, felt, not explained.

**If asked (in the Guide bottom sheet), explain:**
"Your breath timing shifts subtly with the tidal phase. During rising tide, inhales naturally lengthen. During ebb, exhales deepen. You don't need to think about this — just follow the guide."

### 2. The Header — Minimal, Warm

```
≋ North Shields
The tide is gently ebbing
```

That's it. Two lines.

- Station name: tappable (opens station picker)
- Tidal status: one short sentence, updates every minute
- No distance, no technical data, no phase labels like "EBBING TIDE"
- The sentence should feel like a friend telling you what's happening, not a data readout

**Sentence variations (natural, warm, varied):**

```typescript
const tidalSentences = {
  rising_early:    "The tide is beginning to rise",
  rising_mid:      "The tide is rising steadily",
  rising_late:     "The tide is approaching its peak",
  high_slack:      "The tide rests at high water",
  ebbing_early:    "The tide has begun to ebb",
  ebbing_mid:      "The tide is gently ebbing",
  ebbing_late:     "The tide is settling toward low water",
  low_slack:       "The tide rests in stillness",
};
```

No times. No heights. No rates. Just a gentle sentence.

### 3. Remove the Tidal Curve from the Default View

**Yes, remove it.** The tidal curve chart is the main source of confusion. It's a scientific visualisation that means nothing to 90% of users. It makes the app look like a weather tool instead of a breathing companion.

**Move it to the Calendar/Details bottom sheet** (accessible via the ≋ wave icon button). Users who WANT to see tidal data can find it there. The default screen is for breathing.

### 4. Bottom Icon Buttons — Three Functions

Three small, muted icons at the bottom of the screen:

```
  ⚙           ≋           📖
Settings    Tide Info    Guide
```

**⚙ Settings** (bottom sheet):
- Breath speed slider (0.5x — 2.0x)
- Sound on/off + volume
- Carrier frequency (432 / 440 / 528)
- Change station button

**≋ Tide Info** (bottom sheet):
- THIS is where the tidal curve lives now
- The 24-hour curve with NOW marker
- High/low times
- 7-day mini calendar
- Current height and rate (for those who want data)
- "The tide is connected to your breath rhythm" — one explanatory line

**📖 Guide** (bottom sheet):
- Current phase guidance for practitioners
- 3 bullet points: session suggestions
- Instrument recommendations
- Next phase preview
- "Your breath timing shifts subtly with each tidal phase" — explanation

**Bottom sheet style:**
- Slides up from bottom, 50-60% screen height
- Dark frosted glass background
- Drag handle at top
- Swipe down to dismiss
- Only ONE can be open at a time

### 5. The Ambient Drone — Invisible by Default

The drone audio should NOT have controls on the main screen. Sound is off by default. Enable it via the ⚙ Settings bottom sheet. When enabled, a tiny speaker icon appears in the header:

```
🔊 ≋ North Shields
The tide is gently ebbing
```

That's the only indication sound is active. Tapping the 🔊 icon mutes/unmutes.

### 6. Welcome Flow — 2 Screens, Not 3

Cut to 2 screens. Even shorter text.

**Screen 1:**
```
       ≋

  Breathe with the ocean.

  This app guides your breath
  using the rhythm of the
  real tide near you.

              [Continue →]
```

**Screen 2:**
```
       ◉

  [📍 Find My Coast]

  [Or search for a station]
```

That's it. Two screens. Under 25 words total. The app explains itself through USE, not through onboarding.

---

## What the Experience Feels Like Now

1. Open app → see a big beautiful breathing orb, gently pulsing
2. Read "The tide is gently ebbing" — oh, it's connected to the tide. Cool.
3. See `I N H A L E` with a 6-second countdown — oh, I breathe with this
4. Start breathing along → it feels oceanic, organic, calming
5. Notice the colours shift subtly over time → the app is alive
6. Maybe tap the wave icon → see the actual tidal curve, data, times
7. Maybe tap the guide icon → see what instruments and sessions suit this moment
8. Maybe never tap either → just breathe. That's enough. The app works.

**The app is useful within 3 seconds of opening it.** Everything else is optional depth.

---

## What Gets Removed from Main Screen

- ❌ Tidal curve chart (moved to Tide Info bottom sheet)
- ❌ Session guidance card (moved to Guide bottom sheet)
- ❌ Control panel (moved to Settings bottom sheet)
- ❌ Tidal calendar (moved to Tide Info bottom sheet)
- ❌ About/educational text (deleted entirely)
- ❌ "Breathe with the Tide" title card wrapper
- ❌ Distance from station
- ❌ Phase labels like "EBBING TIDE" or "↓ Ebbing Tide"
- ❌ Technical data (heights, rates, percentages)
- ❌ Multiple text paragraphs

## What Stays on Main Screen

- ✅ Breath orb (huge, central, the hero)
- ✅ Breath phase word (INHALE / HOLD / EXHALE / REST)
- ✅ Breath countdown timer (seconds) or progress bar
- ✅ Station name (one word/line, tappable)
- ✅ One gentle sentence about the tide
- ✅ Three subtle icon buttons at bottom
- ✅ Beautiful ocean background + particles

---

## The Litmus Test

Show the app to someone who has never heard of tidal breathing. Within 3 seconds they should:

1. ✅ See a breathing guide
2. ✅ Start breathing with it
3. ✅ Understand the timing (seconds, not hours)
4. ✅ Notice it's connected to the ocean somehow

If any of those fail, simplify further.
