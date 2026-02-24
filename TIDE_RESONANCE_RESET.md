# Tide Resonance — COMPLETE RESET

## Delete everything and start fresh.

The breathing guide concept was wrong. Remove ALL of the following:
- Breath orb
- Inhale/exhale/hold/rest text
- Breath speed controls
- Breath mapper
- useBreathCycle hook
- BreathOrb component
- breathMapper.ts

**Tide Resonance is a PRACTITIONER TOOL, not a meditation app.**

---

## What Tide Resonance Actually Is

It's lunata.app but for tides instead of the moon.

Lunata shows: moon phase, phase energy, frequencies, zodiac influence, moon times, lunar distance, phase countdown, lunar calendar.

Tide Resonance shows: tidal phase, tidal energy, session qualities, current height, tide times, next turn countdown, tidal curve, 7-day calendar.

**Same format. Beautiful data cards. Self-explanatory. No instructions needed.**

---

## Study lunata.app Structure

Lunata.app has this layout:
1. Hero section with the moon visual + phase name + "Live" badge
2. Info cards in a clean stack:
   - Phase Energy
   - Frequencies  
   - Zodiac Influence
   - Moon Times
   - Lunar Distance
   - Phase Countdown
3. Lunar Calendar
4. Footer

**Copy this EXACT pattern but for tidal data.**

---

## Tide Resonance Layout

### Hero Section

A beautiful visual representing the current tidal state. NOT a scientific chart — a visual that FEELS like the tide.

**Option A — Animated water level visual:**
A stylised horizon line with water. The water level position reflects the actual current tide height (high = water near top, low = water near bottom). Subtle wave animation on the surface. Bioluminescent particles below the waterline. The sky/space above has stars. This is NOT a chart — it's an artistic representation.

**Option B — Circular tide gauge:**
A circular visual (like a clock face) where the tide position is shown on a 12-hour arc. A glowing marker shows "now" on the cycle. Simple, elegant, immediately readable. Similar to how lunata shows the moon phase visually.

Pick whichever renders more beautifully. The visual must:
- Immediately communicate whether the tide is high, low, rising, or ebbing
- Look stunning, not scientific
- Animate subtly (gentle wave motion, particle drift)

**Below the visual:**
```
Ebbing Tide
── Live ──
North Shields
```

- Phase name: large, white, 22-24px, medium weight
- "Live" badge: small pill with a pulsing dot, like lunata.app's Live indicator
- Station name: muted, small, tappable to change

---

### Info Cards — Same Style as Lunata

Each card is a frosted glass panel with:
- A clear title label (uppercase, small, muted, with spacing)
- The information content
- Consistent padding, border radius, and glass treatment matching lunata.app

#### Card 1: TIDAL ENERGY
The practitioner value — what does the current phase mean for sessions.

```
TIDAL ENERGY

↓ Ebbing Tide
Release · Letting Go · Cleansing

Descending sound patterns
Singing bowls, ocean drum, rain stick
Gradual softening to guide surrender
```

- Phase arrow + name in phase colour
- Qualities on one line
- 3 short suggestion lines (fragments, not sentences)
- This is the equivalent of lunata's "Phase Energy" card

#### Card 2: CURRENT TIDE
Live tidal data, beautifully presented.

```
CURRENT TIDE

Water Height        3.2m
Rate of Change      ↓ 0.4m/hr
Tidal Range Today   4.8m

━━━━━━━━━━━━●━━━━━━━━━━
Low          ↑         High
           You are here
```

- Clean key-value pairs like lunata's data cards
- A simple horizontal bar showing where the current height sits between today's low and high — this is intuitive and requires zero tidal knowledge to understand
- The bar is the equivalent of a battery indicator: full = high tide, empty = low tide

#### Card 3: TIDE TIMES
Today's high and low times — the equivalent of lunata's "Moon Times."

```
TIDE TIMES · Today

▲ High    7:34 AM     5.2m
▼ Low     1:43 PM     0.4m
▲ High    7:49 PM     5.1m
▼ Low     2:15 AM     0.5m
         (tomorrow)
```

- Simple, clean list
- Heights included
- Next occurrence highlighted or marked
- Past times slightly muted

#### Card 4: NEXT TURN
Countdown to the next tidal change — equivalent of lunata's "Phase Countdown."

```
NEXT TURN

Low Water in
3h 12m

Then rising to High Water at 7:49 PM
```

- Large countdown numbers (the 3h 12m)
- What comes after: one line preview
- Updates every minute

#### Card 5: TIDAL CURVE
NOW we show the tidal curve — but in context, as one card among several. Not as a confusing hero element.

```
TIDAL CURVE · 24 Hours

[Beautiful smooth bezier curve showing
 past 12h and next 12h with NOW marker,
 high/low points labelled with times]
```

- This is data for those who want it
- It's card 5, not card 1 — by the time users reach it, they already understand the tide from the previous cards
- Keep it beautiful: smooth bezier, phase-coloured, NOW marker with glow

#### Card 6: STATION INFO
Where you're connected — equivalent of lunata's "Lunar Distance" card.

```
STATION INFO

Station          North Shields
Distance         18 km from you
Coordinates      55.00°N, 1.44°W
Data Source       Harmonic prediction
Tidal Type       Semi-diurnal
```

- Clean key-value pairs
- "Change Station" button at the bottom of this card

---

### 7-Day Tidal Calendar

Below the cards, same as lunata's lunar calendar section.

```
TIDAL CALENDAR

[7 rows, each showing:]
Mon 23  ▲ 7:34  ▼ 1:43  ▲ 7:49  ▼ 2:15
Tue 24  ▲ 8:21  ▼ 2:28  ▲ 8:35  ▼ 3:01
...

Each row has a mini tidal curve thumbnail on the left.
Today is highlighted.
```

---

### Footer

```
Tide Resonance
Part of the Harmonic Waves ecosystem

Crafted by Remigijus Dzingelevičius
2026
```

---

## The Ambient Drone — Optional, Non-Intrusive

If the audio drone feature is kept, it should be:
- A small 🔊 icon in the top-right header area
- Tap to enable (starts muted, browser autoplay policy)
- Volume slider in a tiny popover
- The drone shifts with tidal phase (as previously specced)
- This is a bonus feature, NOT a core feature
- It can be added in a later phase if needed — not essential for launch

---

## Design Matching Lunata

- Same card glass treatment (backdrop-blur, subtle border, low-opacity white background)
- Same typography scale and weights
- Same spacing rhythm between cards
- Same "Live" badge style with pulsing green dot
- Same footer style
- Same overall premium dark aesthetic

**BUT with the ocean colour palette and bioluminescent atmosphere from the Tide Resonance spec.** The background, particles, and colour accents should be deep ocean — NOT lunar silver/purple.

---

## What the App Looks Like to a User

A practitioner opens Tide Resonance and sees:

1. **A beautiful tidal visual** showing the current state — they instantly see "the tide is low/high/rising/falling"
2. **"Ebbing Tide · Live"** — clear, immediate
3. **Tidal Energy card** — "Release, Letting Go" + instrument suggestions — they know what kind of session to run
4. **Current Tide card** — water height, rate, a simple bar showing where they are between low and high
5. **Tide Times** — today's highs and lows with times
6. **Next Turn** — countdown to the next change
7. **Tidal Curve** — for those who want the visual data
8. **Station Info** — where they're connected
9. **7-Day Calendar** — for planning ahead

**Every card is self-explanatory. No card requires explanation. No onboarding needed.** Just like lunata.app — open it, see the data, use it.

---

## Build Priority

1. Delete all breathing components
2. Build the hero visual (tidal state + phase name + Live badge)
3. Build Card 1: Tidal Energy (session guidance)
4. Build Card 2: Current Tide (height, rate, bar indicator)
5. Build Card 3: Tide Times (today's highs and lows)
6. Build Card 4: Next Turn (countdown)
7. Build Card 5: Tidal Curve (24-hour bezier curve)
8. Build Card 6: Station Info
9. Build the 7-Day Calendar
10. Polish pass — match lunata.app card quality

---

## Summary

Tide Resonance = lunata.app format applied to tidal data. Beautiful practitioner tool. Self-explanatory cards. No breathing exercises. No meditation instructions. No onboarding essays. Just real, useful, beautifully presented tidal intelligence for sound healers.
