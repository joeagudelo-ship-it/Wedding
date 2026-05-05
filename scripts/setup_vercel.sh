#!/usr/bin/env bash
set -euo pipefail

echo "Setting up deployment on Vercel for Wedding Tracker."

# Non-interactive path using environment variables (safe for automation)
VERCEL_TOKEN="${VERCEL_TOKEN:-}"
VERCEL_PROJECT="${VERCEL_PROJECT:-}"
if [ -n "$VERCEL_TOKEN" ] && [ -n "$VERCEL_PROJECT" ]; then
  echo "Running non-interactive Vercel deployment."
  if ! command -v vercel >/dev/null 2>&1; then
    echo "Vercel CLI not found. Installing..."
    npm i -g vercel
  fi
  vercel login --token "$VERCEL_TOKEN" || true
  vercel link --project "$VERCEL_PROJECT" --confirm || true
  vercel --prod --confirm
  if [ -n "${VERCEL_GS_CREDS:-}" ] || [ -n "${VERCEL_SPREADSHEET_ID:-}" ]; then
    echo "Configuring environment variables on Vercel..."
    if [ -n "${VERCEL_GS_CREDS:-}" ]; then
      vercel secrets add gsheet-creds "$VERCEL_GS_CREDS" || true
      vercel env add GOOGLE_SHEETS_CREDENTIALS development --secret gsheet-creds || true
      vercel env add GOOGLE_SHEETS_CREDENTIALS production --secret gsheet-creds || true
      vercel env add GOOGLE_SHEETS_CREDENTIALS preview --secret gsheet-creds || true
    fi
    if [ -n "${VERCEL_SPREADSHEET_ID:-}" ]; then
      vercel env add SPREADSHEET_ID development "${VERCEL_SPREADSHEET_ID}" || true
      vercel env add SPREADSHEET_ID production "${VERCEL_SPREADSHEET_ID}" || true
      vercel env add SPREADSHEET_ID preview "${VERCEL_SPREADSHEET_ID}" || true
    fi
    if [ -n "${VERCEL_REVALIDATE_SECONDS:-}" ]; then
      vercel env add REVALIDATE_SECONDS development "${VERCEL_REVALIDATE_SECONDS}" || true
      vercel env add REVALIDATE_SECONDS production "${VERCEL_REVALIDATE_SECONDS}" || true
      vercel env add REVALIDATE_SECONDS preview "${VERCEL_REVALIDATE_SECONDS}" || true
    fi
  fi
  echo "Deployment complete. Exiting."
  exit 0
fi

# Ensure vercel CLI is installed
if ! command -v vercel >/dev/null 2>&1; then
  echo "VerceL CLI not found. Installing..."
  npm i -g vercel
fi

echo "Please login to Vercel in the browser when prompted."
vercel login

# Link local project to existing Vercel project (adjust project slug if needed)
echo "Linking to Vercel project (ensure the project slug matches your Vercel project)."
read -r -p "Enter Vercel project slug (as shown in Vercel dashboard) or press Enter to use default: " VERCEL_PROJECT
if [ -n "${VERCEL_PROJECT}" ]; then
  vercel link --project "${VERCEL_PROJECT}" --confirm
else
  vercel link --confirm
fi

echo "Deploying production to Vercel."
vercel --prod --confirm

echo "Configuring environment variables on Vercel."
echo "Choose env var handling:"
echo "  1) Use Secrets for credentials (recommended)"
echo "  2) Direct env vars (paste values at prompts)"
read -r -p "Method (1/2): " method

if [ "${method}" = "1" ]; then
  echo "Creating secret to store Google Sheets credentials... (paste JSON then Ctrl-D)"
  vercel secrets add gsheet-creds
  echo "Linking secret to env vars (development/production/preview)."
  vercel env add GOOGLE_SHEETS_CREDENTIALS development --secret gsheet-creds
  vercel env add GOOGLE_SHEETS_CREDENTIALS production --secret gsheet-creds
  vercel env add GOOGLE_SHEETS_CREDENTIALS preview --secret gsheet-creds
else
  echo "Direct env vars: paste values when prompted."
  echo "GOOGLE_SHEETS_CREDENTIALS (paste JSON string, do not include quotes):"
  vercel env add GOOGLE_SHEETS_CREDENTIALS development
  echo "Paste production value for GOOGLE_SHEETS_CREDENTIALS (or leave empty if not changing):"
  vercel env add GOOGLE_SHEETS_CREDENTIALS production
  echo "Paste preview value for GOOGLE_SHEETS_CREDENTIALS (or leave empty if not changing):"
  vercel env add GOOGLE_SHEETS_CREDENTIALS preview

  echo "SPREADSHEET_ID (development):"
  vercel env add SPREADSHEET_ID development
  echo "SPREADSHEET_ID (production):"
  vercel env add SPREADSHEET_ID production
  echo "SPREADSHEET_ID (preview):"
  vercel env add SPREADSHEET_ID preview

  echo "REVALIDATE_SECONDS (development):"
  vercel env add REVALIDATE_SECONDS development
  echo "REVALIDATE_SECONDS (production):"
  vercel env add REVALIDATE_SECONDS production
  echo "REVALIDATE_SECONDS (preview):"
  vercel env add REVALIDATE_SECONDS preview
fi

echo "Done. Please verify the deployment in the Vercel dashboard and test all routes."
