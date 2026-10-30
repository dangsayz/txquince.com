"use client";

import Link from "next/link";
import { useSite } from "./state";
import type { HomeCity } from "@/content/home-places";

/**
 * "Where we work" — a compact row of real links to every city page and the
 * service pages, in the page's language (Spanish routes on /es). Rendered on
 * the server like the rest of the homepage, so every link is a plain
 * <a href> in the HTML.
 */
export function WhereWeWork({ cities }: { cities: HomeCity[] }) {
  const { t } = useSite();
  const p = t.places;
  return (
    <section id="where-we-work" className="tq-section tq-where" aria-labelledby="tq-where-title">
      <div className="tq-wrap">
        <div className="tq-where__inner">
          <div className="tq-where__head">
            <h2 id="tq-where-title" className="tq-display tq-where__title">
              {p.title}
            </h2>
            <p className="tq-where__dek">{p.dek}</p>
          </div>
          <nav className="tq-where__nav" aria-label={p.title}>
            <h3 className="tq-where__label">{p.citiesLabel}</h3>
            <ul className="tq-where__links">
              {cities.map((c) => (
                <li key={c.slug}>
                  <Link href={`${p.cityBase}/${c.slug}`} className="tq-where__link">
                    {c.city}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="tq-where__label">{p.servicesLabel}</h3>
            <ul className="tq-where__links">
              {p.services.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="tq-where__link tq-where__link--service">
                    {s.label} <span className="tq-arrow" aria-hidden>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
