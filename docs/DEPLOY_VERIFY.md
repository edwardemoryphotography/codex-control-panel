# Deploy verification

`main` auto-deploys via Vercel. After each push:

1. Wait for Vercel to report Ready (dashboard or `vercel --prod --confirm`).
2. Verify build health locally (already in CI):
   ```
   npm run lint && npx tsc --noEmit && npm test && npm run build
   ```

## Live probe (STATE NEXT #2 / PR #8)

Live AI routing needs Vercel env vars: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `APP_ACCESS_TOKEN`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

Without `APP_ACCESS_TOKEN` while AI keys are set, `/api/route` and `/api/actions` correctly 503 (fail-closed). With it, probes require the owner header:

```bash
# Health without probe — public, shows config (no keys) and warnings
curl https://<hub-url>/api/health | jq .

# Health with live provider probe — owner-only, hits real provider APIs
curl -H "x-codex-key: $APP_ACCESS_TOKEN" "https://<hub-url>/api/health?probe=1" | jq .

# Actions list — owner-gated when APP_ACCESS_TOKEN is set
curl -H "x-codex-key: $APP_ACCESS_TOKEN" "https://<hub-url>/api/actions?mode=low" | jq .
```

Expected: `probe=1` returns `probes: [{ok:true}, ...]` when keys are valid, and `401` without the header when `APP_ACCESS_TOKEN` is configured. Record the result in `STATE.md`.

## May 19 trio (codex-system-architecture)

After `main` push, verify:

```
curl -I https://<arch-url>/cognition-final.html
curl -I https://<arch-url>/codex-operations.html
curl -I https://<arch-url>/codex-territory-v36.html
```

All should be `200` with `content-type: text/html`.
