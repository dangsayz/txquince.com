import { describe, expect, it } from "vitest";
import { canArchive, canRemove, isArchived } from "./booking-tidy";

const b = (o: object) => ({ status: "expired", event_date: "2027-01-01", paid_at: null, metadata: {}, ...o });
const today = "2026-11-09";

describe("booking tidy rules", () => {
  it("archive: closed bookings and paid ones already past", () => {
    for (const status of ["expired", "cancelled", "refunded"]) expect(canArchive(b({ status }), today)).toBe(true);
    expect(canArchive(b({ status: "paid", event_date: "2026-10-01" }), today)).toBe(true);
    expect(canArchive(b({ status: "paid", event_date: "2027-01-01" }), today)).toBe(false);
    for (const status of ["requested", "pending_payment", "payment_review"]) expect(canArchive(b({ status }), today)).toBe(false);
  });

  it("remove: only closed bookings that were never paid", () => {
    expect(canRemove(b({}))).toBe(true);
    expect(canRemove(b({ status: "cancelled" }))).toBe(true);
    expect(canRemove(b({ status: "cancelled", paid_at: "2026-01-01T00:00:00Z" }))).toBe(false);
    for (const status of ["refunded", "paid", "requested", "pending_payment", "payment_review"]) expect(canRemove(b({ status }))).toBe(false);
  });

  it("archived is a timestamp in metadata", () => {
    expect(isArchived(b({ metadata: { archived_at: "2026-11-09T00:00:00Z" } }))).toBe(true);
    expect(isArchived(b({}))).toBe(false);
    expect(isArchived({ metadata: null })).toBe(false);
  });
});
