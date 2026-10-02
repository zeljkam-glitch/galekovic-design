# Airtable newsletter setup

Create a table named `Newsletter` with these fields:

- `Email` — email or single-line text
- `Consent` — checkbox
- `Source` — single-line text
- `Language` — single select with `HR` and `EN`
- `Status` — single select with `Active` (and optionally `Unsubscribed`)
- `Signup Date` — date with time

Add these environment variables to the Vercel project:

- `AIRTABLE_TOKEN` — Airtable personal access token with record write access to this base
- `AIRTABLE_BASE_ID` — the base ID beginning with `app`
- `AIRTABLE_NEWSLETTER_TABLE` — optional; defaults to `Newsletter`

The token is used only in the server-side API route and is never sent to the browser.
