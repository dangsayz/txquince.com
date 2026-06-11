-- Tag the place each photo was shot (venue, church, park, neighborhood) so the
-- admin can group/recall work by location, Facebook/Instagram check-in style.
-- The /admin/portfolio location field autocompletes from the distinct values
-- already stored here, so a place typed once reappears as a suggestion next
-- session. Nullable: existing rows keep working; untagged photos stay untagged.
alter table public.portfolio_images
  add column if not exists location text;
