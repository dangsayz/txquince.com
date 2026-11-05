-- ============================================================================
-- TX Quince — unique visitors. Run once after 0024.
-- ============================================================================
-- page_views.session_id is one browser TAB's session, so a family that opens
-- the link three times counts as three visits. visitor_id is a stable,
-- anonymous id kept in the browser's localStorage (no cookie, no personal
-- data), so the dashboard can count unique visitors as well as visits.
-- Rows written before this migration have no visitor_id; the dashboard falls
-- back to counting their sessions.
-- ============================================================================

alter table public.page_views
  add column if not exists visitor_id text;

create index if not exists page_views_visitor_id_idx
  on public.page_views (visitor_id);
