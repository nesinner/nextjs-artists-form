#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${VERCEL_PROJECT_NAME:-}" ]]; then
  echo "VERCEL_PROJECT_NAME is required."
  exit 1
fi

if [[ -z "${VERCEL_SCOPE:-}" ]]; then
  echo "VERCEL_SCOPE is required."
  exit 1
fi

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "VERCEL_TOKEN is required."
  exit 1
fi

vercel link --project "$VERCEL_PROJECT_NAME" --scope "$VERCEL_SCOPE" --token "$VERCEL_TOKEN"

: "${NEXT_PUBLIC_SUPABASE_URL:?}"
: "${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:?}"
: "${SUPABASE_SERVICE_ROLE_KEY:?}"
: "${ADMIN_EMAILS:?}"

printf "%s" "$NEXT_PUBLIC_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production --token "$VERCEL_TOKEN"
printf "%s" "$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production --token "$VERCEL_TOKEN"
printf "%s" "$SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production --token "$VERCEL_TOKEN"
printf "%s" "$ADMIN_EMAILS" | vercel env add ADMIN_EMAILS production --token "$VERCEL_TOKEN"

vercel deploy --prod --token "$VERCEL_TOKEN"
