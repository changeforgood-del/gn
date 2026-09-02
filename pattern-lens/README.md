# Pattern Lens

Pattern Lens is a privacy-first, consent-based recurring behavior prediction app.

## What it does

- Create participant profiles only after consent is recorded.
- Log observable events with date/time, location category, and preceding context.
- Detect repeated weekday + two-hour time-window behavior patterns.
- Start predictions after at least 3 similar observations.
- Show a probability and evidence count instead of claiming certainty.
- Alert during predicted windows when browser notifications are allowed.
- Let the user confirm Yes/No after a prediction.
- Recalibrate future probabilities using confirmed outcomes.
- Export/import all data as JSON.
- Delete one participant or all local data.

## Prediction model

The current lightweight model groups observations by participant, normalized behavior, weekday, and two-hour time bucket. A recurrence score grows with evidence. Once confirmations exist, the score blends recurrence evidence with a smoothed empirical hit rate. This is intentionally interpretable and local-first.

This model estimates recurrence, not intent, fate, causation, or hidden motives. It can be wrong because coincidence, changing routines, missing observations, and confirmation bias can all create apparent patterns.

## Privacy and safety design

Use only with people who know and agree to being included. Do not use this application for covert surveillance, stalking, face recognition, precise continuous location tracking, or inferring sensitive traits such as health, religion, race, sexuality, politics, criminality, or disability.

Data is stored in the current browser using localStorage unless the user exports it. No social-media scraping or external tracking is included.

## Run locally

Open `index.html` in a modern browser, or serve this directory with any static web server.

## GitHub Pages

This folder can be deployed as a static site. If you want it to live at the repository root or as its own repository, move the three app files (`index.html`, `styles.css`, `app.js`) into the desired Pages source directory.
