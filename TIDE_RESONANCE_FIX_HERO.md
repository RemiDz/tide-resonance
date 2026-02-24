# FIX — Enrich the Tide Hero Visual with Data

## The Problem

The hero tide animation takes up 40% of the screen but communicates almost nothing. It's just layered waves on a purple background. A user looks at it and thinks "nice animation" but learns nothing. It's wasted space.

Compare with lunata.app's moon: the moon visual itself communicates phase, illumination, current position, and feels alive with surface detail. Every pixel carries meaning.

**The tide hero must do the same. Every element inside it should communicate something.**

---

## The Enriched Tide Hero — Packed With Meaning

The hero visual stays full-width and edge-to-edge, but now it's layered with meaningful data elements integrated INTO the visual, not bolted on as text.

### Layer 1: Sky Area (Above Waterline)

**Current time context:**
Show a subtle horizon scene that reflects the actual time of day:
- Pre-dawn/night: dark sky with stars
- Dawn: faint warm gradient at horizon
- Day: slightly lighter deep blue
- Dusk: warm tint at horizon
- This uses the user's local time, calculated simply (not an API)

**Moon position (tiny, subtle):**
Since tides are caused by the moon, show a tiny moon icon in the sky area at approximately the right position. This visually connects tides to the moon without needing to explain it. Use the same suncalc library from lunata to get current moon phase/illumination and render a small crescent/full moon.

**Phase direction indicator:**
Subtle arrows or a visual indicator embedded in the sky showing whether the water is rising or falling:
- Rising: a faint upward chevron or arrow near the top, gently pulsing
- Ebbing: a faint downward chevron
- Slack: nothing, stillness

### Layer 2: The Waterline — The Information Core

The waterline is where most of the data lives.

**Water level position = actual tide height.**
This already works (water higher = higher tide). Keep this. But make it MORE obvious by adding:

**Tide range markers on the left edge:**
A very subtle vertical scale on the left side of the hero, showing where High and Low water sit:

```
  ─ H ─  ← thin dashed line, very muted, labelled "H"
  
  
  
  ~~~~~~~~ water surface here ~~~~~~~~
  
  
  ─ L ─  ← thin dashed line, very muted, labelled "L"
```

- "H" = today's predicted high water level
- "L" = today's predicted low water level
- These are barely visible — thin dashed lines at maybe 8-10% white opacity
- The user can instantly see: "water is about 30% of the way between low and high" just by looking
- Current height value shown small at the water surface: "1.3m"

**Time markers along the bottom:**
Inside the hero (not below it), along the very bottom edge, show subtle time markers:

```
  6AM     9AM     12PM     3PM     6PM     9PM
```

- Tiny text (10px), white at 15% opacity
- Below the waterline, barely visible but there if you look
- A subtle "NOW" marker or brighter dot at the current time position

**Next event callout:**
Floating near the water surface, a single subtle data point:

```
  Low water · 2:15 PM
  ↓ in 3h 12m
```

- Small text (12px), positioned near the right side of the hero
- White at 50% opacity
- This is the single most useful piece of information — what happens next and when

### Layer 3: The Water Itself — Alive With Detail

**Multiple wave layers (keep current):**
But improve the colours and opacity to feel more like real ocean water:
- Front wave: phase colour at 40% opacity
- Mid wave: phase colour shifted darker at 25% opacity
- Back wave: very dark at 15% opacity
- The depth between waves should show darker water below

**Underwater particles:**
Below the waterline, 10-15 tiny glowing dots drifting slowly (bioluminescent plankton). These aren't just decorative — they create a sense of depth and life. They should only be visible below the water surface, never above.

**Surface foam/light:**
Along the very top of the water surface line, a thin bright edge (1-2px) that shimmers — like sunlight or moonlight catching the wave crests. This separates the water from the sky visually and adds realism.

**Underwater caustic light patterns:**
Below the waterline, very subtle (3-5% opacity) animated light refraction patterns. Slow-moving, organic. Creates the feeling of actually being in water.

### Layer 4: Data Overlay — Subtle but Present

**The mini tidal curve — embedded IN the hero:**
Instead of showing the tidal curve as a separate card later, embed a small, subtle version of the 24-hour curve INSIDE the hero visual. Position it in the lower portion of the underwater area:

```
┌─────────────────────────────────────┐
│  sky + moon                         │
│                        Low · 2:15PM │
│  ─ H ─ ─ ─ ─ ─ ─ ─ ─ ↓ 3h 12m ─  │
│                                     │
│  ≋≋≋≋≋≋≋ water surface ≋≋≋≋≋≋≋≋≋≋  │ ← 1.3m
│                                     │
│  ─ L ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│  ┈┈┈╱╲┈┈┈┈┈┈╱╲┈┈┈┈●┈┈╲┈┈┈┈╱╲┈┈┈  │ ← mini tidal curve
│  6AM    12PM   NOW   6PM    12AM    │
│                                     │
└─────────────────────────────────────┘
```

- The mini curve is drawn as a thin line (1.5px) in white at 15-20% opacity
- It shows the full 24-hour tidal shape
- A bright dot marks "NOW" on the curve — matching the water surface position above
- High and low peaks are subtly labelled with times
- This curve sits in the deep water area, like you're looking down through the water and seeing the tidal pattern on the ocean floor
- It does NOT dominate — it's a subtle underwater detail

**This is the key innovation: the hero visual CONTAINS the tidal curve as an embedded element, so the separate Tidal Curve card (Card 5) can potentially be removed, saving scroll space.**

### Layer 5: Phase Name + Status (Below Water)

Positioned at the bottom of the hero, overlapping slightly:

```
        Ebbing Tide
         ● LIVE
      North Shields
```

Keep this as-is but ensure it reads clearly against the water background. May need a subtle dark gradient/scrim behind the text to ensure legibility.

---

## The Hero Height

Keep it at 35-40% of viewport height on mobile. But now it EARNS that space because every part of it communicates useful information:

- Sky tells you time of day + moon position
- Water level tells you current tide height at a glance
- H/L markers show where you are in the tidal range
- Wave animation shows the ocean is alive
- Next event callout tells you what's coming
- Embedded mini curve shows the full day's pattern
- Phase direction indicator shows rising/falling

**A user glances at the hero for 2 seconds and knows:**
1. The tide is about 30% between low and high (water position)
2. It's falling (downward chevron + wave direction)
3. Low water is at 2:15 PM, about 3 hours away (next event callout)
4. The pattern for the rest of the day (embedded mini curve)

That's everything. Without reading a single card.

---

## What This Means for the Cards Below

If the hero now contains the mini tidal curve, consider **removing Card 5 (Tidal Curve)** entirely since the data is already in the hero. This shortens the page and reduces redundancy.

The remaining cards become:
1. Tidal Energy (universal qualities)
2. Current Tide (height, rate, range bar)
3. Tide Times (today's highs and lows)
4. Next Turn (countdown)
5. Station Info

---

## Animation Performance

The hero has multiple animated layers. Ensure performance:
- Use `transform` and `opacity` only for animations (GPU accelerated)
- Use `will-change: transform` on animated wave paths
- Particles: CSS animation, not JS
- Caustics: CSS background animation, not JS
- Wave paths: requestAnimationFrame with throttle to 30fps (waves don't need 60fps)
- Moon position: calculate once on load and every 10 minutes
- Time of day: calculate once on load
- Test on a real phone — if it drops below 50fps, reduce particle count first, then caustic complexity

---

## Summary

Transform the hero from an empty animation into a rich, information-dense visual where every element means something. Sky context, moon position, tide range markers, water level, surface detail, underwater particles, embedded mini tidal curve, next event callout, phase direction. A user should be able to look at the hero alone and understand everything about the current tidal state — just like looking at lunata's moon tells you everything about the lunar phase.
