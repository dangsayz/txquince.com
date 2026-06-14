-- ============================================================================
-- TX Quince — inquiry "lost reason" tagging (run in Supabase SQL editor)
-- ============================================================================
-- When a lead is marked 'lost', capture WHY so "lost" stops being a black box.
-- Turns dead deals into data: price vs availability vs ghosting vs a competitor,
-- which tells you whether to fix pricing, follow-up speed, or availability.
--
-- Additive + idempotent. Existing 'lost' rows simply carry a null reason until
-- the operator sets one. Service-role only; RLS stays locked (no public access).
-- ============================================================================

alter table public.inquiries
  add column if not exists lost_reason text
    check (
      lost_reason is null
      or lost_reason in ('price', 'availability', 'ghosted', 'booked_competitor', 'other')
    ),
  add column if not exists competitor_name text;
