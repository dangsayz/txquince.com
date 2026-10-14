/**
 * price-text.ts — prices inside written copy (client + server).
 *
 * Blog posts, city pages, FAQs and the guide are plain strings built when
 * their module loads, long before anyone knows what the live price book says.
 * So they never contain a number: they contain a token such as
 * `{{price.production}}` (via `PT.price.production`), and the renderer fills
 * every token from the live book at request time with `fillPrices` /
 * `fillDeep`. Change a price at /admin/prices and every page, FAQ, meta
 * description and JSON-LD block reads the new number — no deploy.
 *
 * Tokens (all values are already formatted for prose):
 *   price.<tier>       "$4,900"          price.floor / price.ceiling
 *   addon.<addOn>      "$300"
 *   extra.<tier>       "$400"            extra.from (cheapest added hour)
 *   hours.<tier>       "6"               hours.max, hours.typicalLow (max − 2)
 *   deposit.percent    "25%"             deposit.<tier> ("$1,225": that package's deposit)
 *   balance.days       "14"              hold.days "7"
 */
import {
  ADD_ON_IDS,
  TIER_IDS,
  depositFor,
  extraHourFrom,
  priceCeiling,
  priceFloor,
  usd,
  type AddOnId,
  type PriceBook,
  type TierId,
} from "./commission";

const tok = (key: string) => `{{${key}}}`;
const perTier = (prefix: string) =>
  Object.fromEntries(TIER_IDS.map((id) => [id, tok(`${prefix}.${id}`)])) as Record<TierId, string>;
const perAddOn = (prefix: string) =>
  Object.fromEntries(ADD_ON_IDS.map((id) => [id, tok(`${prefix}.${id}`)])) as Record<AddOnId, string>;

/** Price tokens for copy. Interpolate these into strings; never a number. */
export const PT = {
  price: { ...perTier("price"), floor: tok("price.floor"), ceiling: tok("price.ceiling") },
  addon: perAddOn("addon"),
  extra: { ...perTier("extra"), from: tok("extra.from") },
  hours: { ...perTier("hours"), max: tok("hours.max"), typicalLow: tok("hours.typicalLow") },
  deposit: { ...perTier("deposit"), percent: tok("deposit.percent") },
  balanceDays: tok("balance.days"),
  holdDays: tok("hold.days"),
} as const;

/** Every token's current text for this book. */
export function priceTokenValues(book: PriceBook): Record<string, string> {
  const v: Record<string, string> = {};
  for (const id of TIER_IDS) {
    const p = book.packages[id];
    v[`price.${id}`] = usd(p.price);
    v[`extra.${id}`] = usd(p.extraHour);
    v[`hours.${id}`] = String(p.hours);
    v[`deposit.${id}`] = usd(depositFor(book, p.price));
  }
  for (const id of ADD_ON_IDS) v[`addon.${id}`] = usd(book.addOns[id]);
  v["price.floor"] = usd(priceFloor(book));
  v["price.ceiling"] = usd(priceCeiling(book));
  const from = extraHourFrom(book);
  v["extra.from"] = usd(from ?? 0);
  v["hours.max"] = String(book.maxHours);
  v["hours.typicalLow"] = String(Math.max(1, book.maxHours - 2));
  v["deposit.percent"] = `${book.depositPercent}%`;
  v["balance.days"] = String(book.balanceDueDays);
  v["hold.days"] = String(book.holdDays);
  return v;
}

const TOKEN_RE = /\{\{([a-zA-Z0-9.]+)\}\}/g;

/** Values are memoized per book object (books are immutable once loaded). */
const memo = new WeakMap<PriceBook, Record<string, string>>();
function valuesFor(book: PriceBook) {
  let v = memo.get(book);
  if (!v) {
    v = priceTokenValues(book);
    memo.set(book, v);
  }
  return v;
}

/** Replace every price token in `text` with the live value. Unknown tokens stay visible (and fail the token audit). */
export function fillPrices(text: string, book: PriceBook): string {
  if (!text.includes("{{")) return text;
  const v = valuesFor(book);
  return text.replace(TOKEN_RE, (m, key: string) => v[key] ?? m);
}

const isPlainObject = (o: unknown): o is Record<string, unknown> => {
  if (!o || typeof o !== "object") return false;
  const proto = Object.getPrototypeOf(o);
  return proto === Object.prototype || proto === null;
};

/**
 * Fill every string inside a value — plain objects and arrays are walked,
 * functions, class instances (URL, Date) and primitives pass through. Use at
 * the boundary where content leaves its module (a post, a city, the FAQ).
 */
export function fillDeep<T>(value: T, book: PriceBook): T {
  if (typeof value === "string") return fillPrices(value, book) as T;
  if (Array.isArray(value)) return value.map((x) => fillDeep(x, book)) as T;
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(value)) out[k] = fillDeep(x, book);
    return out as T;
  }
  return value;
}

/** True when a string still carries an unfilled price token (for tests / audits). */
export const hasPriceToken = (text: string) => /\{\{[a-zA-Z0-9.]+\}\}/.test(text);
