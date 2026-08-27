# Valley Reentry Housing Navigator

A mobile-friendly case-management and housing navigation MVP for people returning from jail or prison across California's San Joaquin Valley.

## What it does

- Client intake and reusable client profiles
- Tracks parole, PRCS/county probation, release date, housing status, income, household size, voucher status, documents, accessibility, veteran status, housing barriers, and other needs
- Automatically generates a case-management task list
- Ranks relevant reentry and affordable-housing pathways
- Includes official resource launchers for CDCR, Fresno Housing, Kern housing, HUD, 211, and affordable-housing search
- Saves case notes and client records locally in the browser
- AI-assisted note rewriting through `/api/rewrite`
- Basic note cleanup fallback if the secure AI backend is unavailable
- JSON backup/export

## Privacy

Do not commit client information to GitHub. The MVP stores client data in browser local storage. For production agency use, replace local storage with authenticated, encrypted database storage and apply the organization's privacy, retention, access-control, and breach-response requirements.

## AI setup

The browser never receives the OpenAI API key. Deploy the repository to a serverless host that supports the included `api/rewrite.js` endpoint and configure `OPENAI_API_KEY` as a protected server-side environment variable. Optional: set `OPENAI_MODEL`; otherwise the endpoint uses `gpt-5.4-mini`.

## Main app

Open `reentry-housing/index.html`.

## Next production upgrades

1. Authenticated staff accounts and role-based access
2. Encrypted database and audit trail
3. Property/landlord inventory with application status and denial reasons
4. Automated current vacancy feeds where permitted
5. County-specific probation/reentry referral directories
6. Appointment calendar and reminders
7. Document checklist and upload workflow
8. Case-plan reporting and supervisor dashboard
9. Consent/ROI tracking
10. Import/export to agency-approved systems
