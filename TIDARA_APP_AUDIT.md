# Tidara App — Full Audit for Promo Page Creation

## Instructions for Claude Code

I need you to thoroughly analyse the tidara.app codebase and produce a comprehensive summary document that will be used to create a promotional landing page. Output everything into a single file called `TIDARA_AUDIT_RESULTS.md`.

## What to Extract

### 1. App Identity
- App name, tagline, and any subtitle/description in metadata or headers
- Domain: tidara.app
- Favicon, OG image, meta description
- Any branding copy already in the codebase (about sections, footers, headers)

### 2. Core Purpose
- What does this app do in one sentence?
- What problem does it solve for the user?
- Who is the target audience? (practitioners, clients, general public?)

### 3. Features List
- Every distinct feature or tool the app offers
- For each feature: what it does, how the user interacts with it, and why it matters
- Any premium/paid features vs free features

### 4. Tech & Data Sources
- Does it connect to any external APIs? (weather, space, audio, etc.)
- Does it use real-time data? If so, what kind?
- Any audio/visual/interactive elements worth highlighting?

### 5. User Experience Flow
- What does a first-time visitor see?
- What's the main interaction loop? (e.g. "select → generate → listen → save")
- Any onboarding, tutorials, or guided flows?

### 6. Visual Design
- Colour palette (extract hex values from CSS/Tailwind config)
- Typography (fonts used)
- Overall aesthetic (dark/light, glassmorphism, cosmic, minimal, etc.)
- Any animations or visual effects worth mentioning

### 7. Unique Selling Points
- What makes this different from similar tools?
- Any connection to sound healing, frequency work, or wellness practices?
- How does it fit within the Harmonic Waves ecosystem?

### 8. Existing Promo Content
- Any social media copy, descriptions, or marketing text already in the codebase
- Any existing `/promo` route or shareable content generator
- README or docs that describe the app

### 9. Monetisation
- Is there a paid tier? What does it unlock?
- Payment provider (LemonSqueezy, Stripe, etc.)
- Pricing

### 10. Screenshots
- Take note of the key screens/states that would look best on a promo page
- List them as: "Screenshot 1: [description of what to capture]"

## Output Format

Write everything into `TIDARA_AUDIT_RESULTS.md` in the project root. Use clear headings matching the sections above. Be specific — include actual copy from the app, actual hex values, actual feature names. Don't summarise vaguely; quote what's there.
