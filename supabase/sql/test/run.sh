#!/usr/bin/env bash
# Rehearse supabase/sql/lockdown-anon.sql on a THROWAWAY local Postgres.
# Never point this at a real database: it creates and deletes its own cluster.
#
#   bash supabase/sql/test/run.sh            # from the repo root
#   PG_BIN=/usr/local/opt/postgresql@16/bin bash supabase/sql/test/run.sh
#
# Steps: fresh cluster → Supabase-like roles/defaults (00-supabase-shim.sql) →
# every migration → drift (10-drift.sql) → snapshot + role probe → lockdown →
# probe → refused second run → future-table check → rollback → compare.
set -euo pipefail
PG_BIN="${PG_BIN:-/usr/lib/postgresql/16/bin}"
PORT="${PORT:-54329}"
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"
OUT="$(mktemp -d)"

# initdb refuses to run as root; borrow the postgres OS user when we are root.
if [ "$(id -u)" = 0 ]; then
  DATA="$(getent passwd postgres | cut -d: -f6)/txq-lockdown-test"
  AS=(runuser -u postgres --)
else
  DATA="$OUT/data"
  AS=()
fi

"${AS[@]}" "$PG_BIN/pg_ctl" -D "$DATA" -m immediate stop >/dev/null 2>&1 || true
rm -rf "$DATA"
"${AS[@]}" "$PG_BIN/initdb" -D "$DATA" -U postgres --auth=trust >/dev/null
"${AS[@]}" "$PG_BIN/pg_ctl" -D "$DATA" -l "$DATA/log" -w \
  -o "-p $PORT -k $DATA -c listen_addresses=127.0.0.1" start >/dev/null
cleanup() { "${AS[@]}" "$PG_BIN/pg_ctl" -D "$DATA" -m fast stop >/dev/null 2>&1 || true; rm -rf "$DATA"; }
trap cleanup EXIT

PSQL=("$PG_BIN/psql" -h 127.0.0.1 -p "$PORT" -U postgres -d postgres -v ON_ERROR_STOP=1 -X -q)

"${PSQL[@]}" < "$HERE/00-supabase-shim.sql"
for f in "$REPO"/supabase/migrations/*.sql; do
  # pg_cron isn't installed locally; the shim provides cron.schedule/unschedule.
  sed 's/^create extension if not exists pg_cron;$/-- (pg_cron shimmed)/' "$f" | "${PSQL[@]}" 2>/dev/null
done
"${PSQL[@]}" < "$HERE/10-drift.sql"
echo "migrations applied: $(ls "$REPO"/supabase/migrations/*.sql | wc -l)"

"${PSQL[@]}" -At < "$HERE/snapshot.sql" > "$OUT/before.txt"
"${PSQL[@]}" -At < "$HERE/probe.sql" > "$OUT/probe-before.txt"

echo "--- apply lockdown"
"${PSQL[@]}" -f "$REPO/supabase/sql/lockdown-anon.sql" 2>&1 | sed 's/^psql:[^ ]* /  /'
"${PSQL[@]}" -At < "$HERE/snapshot.sql" > "$OUT/after.txt"
"${PSQL[@]}" -At < "$HERE/probe.sql" > "$OUT/probe-after.txt"
echo "probe before → after (anon/authenticated lines that changed):"
diff "$OUT/probe-before.txt" "$OUT/probe-after.txt" | grep '^[<>] \(anon\|authenticated\)' | sed 's/^/  /' || true
if grep -E '^(anon|authenticated) .*( ok|EXECUTE ok)' "$OUT/probe-after.txt"; then
  echo "FAIL: an API role can still read or execute something"; exit 1
fi
if grep -E '^service_role .*denied' "$OUT/probe-after.txt"; then
  echo "FAIL: service_role lost access"; exit 1
fi
echo "OK: anon/authenticated denied everywhere; service_role unaffected"

echo "--- second apply must refuse and change nothing"
if "${PSQL[@]}" -f "$REPO/supabase/sql/lockdown-anon.sql" > "$OUT/second.txt" 2>&1; then
  echo "FAIL: second apply succeeded"; exit 1
fi
grep -o 'schema "security_lockdown" already exists' "$OUT/second.txt" | head -1
"${PSQL[@]}" -At < "$HERE/snapshot.sql" | diff -q "$OUT/after.txt" - >/dev/null && echo "OK: unchanged after refused re-run"

echo "--- table created after the lockdown (anon SELECT? | service_role SELECT?)"
"${PSQL[@]}" -At -c "create table public.future_t (id int); select has_table_privilege('anon','public.future_t','SELECT'), has_table_privilege('service_role','public.future_t','SELECT'); drop table public.future_t;"

echo "--- rollback"
"${PSQL[@]}" -f "$REPO/supabase/sql/lockdown-anon-rollback.sql" 2>&1 | sed 's/^psql:[^ ]* /  /'
"${PSQL[@]}" -At < "$HERE/snapshot.sql" > "$OUT/rolled-back.txt"
"${PSQL[@]}" -At < "$HERE/probe.sql" > "$OUT/probe-rolled-back.txt"

# ACL item order can differ after re-granting; compare as sorted sets.
norm() { python3 -c '
import sys
for line in open(sys.argv[1]):
    k, obj, acl, rls = line.rstrip("\n").split("|")
    items = ",".join(sorted(acl.strip("{}").split(","))) if acl.startswith("{") else acl
    print(k, obj, items, rls, sep="|")' "$1"; }
diff <(norm "$OUT/before.txt") <(norm "$OUT/rolled-back.txt") && echo "OK: rollback restored every ACL, default ACL and RLS flag"
diff "$OUT/probe-before.txt" "$OUT/probe-rolled-back.txt" >/dev/null && echo "OK: role behaviour after rollback == before"
rm -rf "$OUT"
echo "PASS"
