# Tidara

A coastal tide companion with station-local forecasts, an interactive tide curve, seven-day outlook, optional reminders and an ocean-inspired soundscape.

## Run locally

Use Node.js 20.19+ and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Production: `npm run build`, then `npm start`.
The app needs a Next.js Node runtime for `/api/stations`; static export is not supported.

## Checks

```sh
npm test
npm run lint
npm run typecheck
npm run build
npm audit
```

All 24 tests passed on 11 September 2026, along with lint, type checking, the production build and a zero-vulnerability npm audit. The test suite includes independent NOAA reference predictions, daylight-saving transitions, settings/storage failures, asynchronous station switching, forecast interaction, audio muting/cleanup, notification timing and the station API.

## Predictions and accuracy

Harmonics come from [Neaps tide database](https://github.com/openwatersio/tide-database), using the installed 0.6.20260220 catalogue and tide-predictor 0.7.0.

Reference station predictions use the station's harmonics. The vertical offset is `MSL - chart datum`, since both datum values share the station's reference zero. Without usable datum values, readings are labelled MSL. See [NOAA datum definitions](https://tidesandcurrents.noaa.gov/datum_options.html) and the [database station schema](https://github.com/openwatersio/tide-database/blob/main/schemas/station.schema.json).

Secondary stations apply their own high/low time offsets and fixed or proportional height offsets to the parent station's chart-datum predictions. Their continuous curve is a cosine interpolation between corrected turns, explicitly labelled as an estimate. “Near high/low water” describes proximity to a water-level turn, not a measured slack current.

All dates, day boundaries and clock labels follow the station's IANA time zone, including 23- and 25-hour days. Units are converted only for display. Current predictions refresh every minute while visible and when the page returns to the foreground.

The committed [NOAA fixtures](tests/noaa-reference.json) contain 48 high/low turns for 11–13 September 2026, at New York (8518750), San Francisco (9414290), Seattle (9447130) and Nonopapa (1610367). Compared with the [official NOAA prediction API](https://api.tidesandcurrents.noaa.gov/api/prod/), the largest differences measured were 3.733 minutes and 0.0534 m. Tests allow 5 minutes / 0.06 m. This sample does not establish accuracy at every station or date.

Predictions do not incorporate weather, surge, waves or local changes. Use official local information for navigation and coastal safety. Reflective prompts and audio are relaxation features.

## Data and performance

The server-only station catalogue contains 6,386 stations. The browser requests nearby station metadata and only the selected station's harmonics, instead of downloading the entire 15.2 MB catalogue bundle. A local production check returned the Whitby model in 3,929 bytes; the largest remaining browser JavaScript chunk was 240,795 bytes. The bounded client cache retains loaded stations; predictions for those models continue without further requests. Loading a new coast requires connectivity. There is no service worker or guaranteed offline reload.

`GET /api/stations` accepts one of:
- `id`: exact station identity, with reference harmonics for secondary stations.
- `q`: 2–120 character search, with an optional limit of 1–50.
- `lat` and `lon`: nearby stations; optional distance 1–200 km and limit 1–50.

Public metadata responses cache for one hour, with a stale-while-revalidate window. No geolocation is requested until the user chooses “Use my location”. Saved preferences and the chosen station stay in the browser; blocked storage falls back to in-memory state.

Audio starts only from a play gesture. Its modulation bus precedes the volume control, so zero volume mutes every layer. Browser reminders require an explicit permission action and an open page; background delivery is not guaranteed.

## Design

The interface uses a photographic ocean graded in slate blue, midnight glass and warm ivory display type, translucent panels, clear SVG controls and a responsive layout. Mobile safe areas, reduced motion, keyboard chart access, dialog focus restoration and station-local times are supported.

[Artwork source and final prompt](docs/tidara-artwork.md).
The seascape does not represent current conditions. Source attribution for the selected station appears under “About these tides”.

## Routes

- `/`: tide companion.
- `/promo`: content studio; follows the saved station and uses station-local forecast dates.
- `/api/stations`: bounded station metadata/harmonics endpoint.

## Verification limits

Automated DOM tests exercise controls but do not replace browser layout or device testing. Browser automation was unavailable in this editing session, so a final visual pass in Safari on an iPhone remains outstanding.
