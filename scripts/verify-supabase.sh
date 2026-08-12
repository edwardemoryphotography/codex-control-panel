#!/bin/bash
# verify-supabase.sh — run the 14 Foundry RLS checks against a live DB
# Usage:
#   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... ./scripts/verify-supabase.sh
#   or for hub's anon checks: SUPABASE_URL + SUPABASE_ANON_KEY
# The SQL itself is in legacy-codex/supabase/verification/routing_control_plane_checks.sql
# (same checks apply to both foundry-console and the hub's supabase-indigo-paddle project
# if it ever adopts the same migrations).
set -euo pipefail
if [ -z "${SUPABASE_URL:-}" ]; then echo "SUPABASE_URL not set" >&2; exit 1; fi
echo "Running routing_control_plane checks — paste this SQL into Supabase SQL Editor:"
echo "  legacy-codex/supabase/verification/routing_control_plane_checks.sql"
echo ""
echo "Expected (after all 3 migrations in order):"
echo "  - RLS true on routed_requests, evidence_items"
echo "  - anon: 0 privileges"
echo "  - authenticated: SELECT only (INSERT/UPDATE revoked)"
echo "  - 2 SELECT policies, owner-email based"
echo "  - subsequent history/work-item checks as documented"
echo ""
if command -v psql >/dev/null 2>&1 && [ -n "${SUPABASE_DB_URL:-}" ]; then
  psql "$SUPABASE_DB_URL" -f "$(dirname "$0")/../../legacy-codex/supabase/verification/routing_control_plane_checks.sql"
else
  echo "(no psql/SUPABASE_DB_URL — copy the SQL into the Supabase dashboard manually)"
fi
