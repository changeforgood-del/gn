# Fresno LifeLine Spot Tracker

Mobile-friendly field app for tracking Fresno-area LifeLine/free-phone enrollment locations.

## What it does
- Maps known verified and community-reported phone enrollment spots.
- Uses device GPS to show the field team's current position.
- Lets staff record both **seen** and **not seen** checks with date/time, provider, staff initials, and notes.
- Calculates the most successful observed day/time window per location from field checks.
- Produces a rolling 7-day report that can be printed/saved as PDF.
- Exports all observations to CSV.

## Important current storage limitation
Observations are stored in browser localStorage in this first deployment. That means each phone/tablet builds its own dataset. Export the CSV regularly. For a true multi-team shared dataset and automatic weekly reporting, connect a shared backend such as Supabase/Firebase or an authorized organizational database.

## GitHub Pages
Expected public path when Pages is enabled for the repository:
`https://changeforgood-del.github.io/gn/free-phone-tracker/`

## Data practice
Do not enter client names, DOBs, SSNs, phone numbers, medical information, or other client PII into the location-observation notes. This app is intended to track vendor/location presence and schedules, not client records.
