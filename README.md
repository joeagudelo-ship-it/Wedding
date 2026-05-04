# Wedding Tracker (Vercel)

This is a Next.js App Router project scaffolded to fetch data from Google Sheets via a private service-account API and expose a multipage dashboard you can host on Vercel.

How to use (quick start)
- Copy .env.example to .env and fill in:
  - GOOGLE_SHEETS_CREDENTIALS (as JSON string)
  - SPREADSHEET_ID
  - Optional REVALIDATE_SECONDS
- Install and run locally:
  - npm install
  - npm run dev
- Deploy to Vercel: connect this repo to Vercel and set the environment variables (GOOGLE_SHEETS_CREDENTIALS, SPREADSHEET_ID, REVALIDATE_SECONDS).

Notes
- The app is designed for a private Sheets API setup. If you prefer public CSV exports, we can swap the data layer to read CSV endpoints with minimal changes.
- Tabs mapped: Tasks, Guests, Timeline, Budget, Vendors.

Folder overview
- app/layout.tsx: global layout with header and nav
- app/globals.css: theme tokens and base styles (Cherry Blossom Aura)
- app/dashboard/: dashboard and sub-pages (tasks, guests, timeline, budget, vendors)
- app/lib/sheetsClient.ts: data fetch layer for Google Sheets
- app/lib/types.ts: domain types
- app/dashboard/components/Card.tsx: simple KPI card component
- .env.example: env template for private Sheets access
