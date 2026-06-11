-- ============================================================================
-- TX Quince — record the COLLECTION a client reserves (Essential/Signature/Legacy)
-- ============================================================================
-- The /investment page sells three fixed-price collections, but bookings only
-- captured service type (photo/video/both). This adds the collection tier so the
-- photographer knows exactly what each client is paying toward, and so the
-- deposit can scale by tier. Nullable: pre-existing rows (and the legacy
-- service-only path) stay valid.
-- ============================================================================

alter table public.bookings
  add column if not exists collection text
  check (collection is null or collection in ('essential', 'signature', 'legacy'));
