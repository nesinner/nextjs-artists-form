#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${SUPABASE_PROJECT_REF:-}" ]]; then
  echo "SUPABASE_PROJECT_REF is required."
  exit 1
fi

supabase link --project-ref "$SUPABASE_PROJECT_REF"
supabase db push
