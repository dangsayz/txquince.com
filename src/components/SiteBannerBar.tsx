"use client";

import { useEffect, useState } from "react";
import { useSite } from "@/components/txq/state";
import { trackEvent } from "@/components/Tracker";
import type { SiteBanner } from "@/lib/site-banner-shared";
import "./site-banner.css";

/**
 * The thin line under the header on public pages. It always says we accept
 * payment plans, with each company's own logo (public/pay). When the owner has
 * written a sale line in Studio, the two take turns; hovering or focusing the
 * bar holds the one on screen. The whole bar is one link to the budget page.
 */
const COPY = {
  en: { plans: "We accept payment plans", short: "Payment plans", see: "See what your budget covers" },
  es: { plans: "Aceptamos planes de pago", short: "Planes de pago", see: "Mira qué alcanza con tu presupuesto" },
} as const;

const LOGOS = [
  { name: "Klarna", src: "/pay/klarna.svg", w: 38, h: 16 },
  { name: "Afterpay", src: "/pay/afterpay.svg", w: 83, h: 16 },
  { name: "Affirm", src: "/pay/affirm.svg", w: 45, h: 18, plate: true },
] as const;

const TURN_MS = 6000;

export function SiteBannerBar({ banner, overHero }: { banner: SiteBanner; overHero: boolean }) {
  const { lang } = useSite();
  const c = COPY[lang];
  const sale = banner.sale?.[lang] ?? "";
  const [showSale, setShowSale] = useState(false);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (!sale || held) return;
    const id = window.setInterval(() => setShowSale((v) => !v), TURN_MS);
    return () => window.clearInterval(id);
  }, [sale, held]);

  const saleOn = Boolean(sale) && showSale;
  return (
    <a
      className="tq-banner"
      href={lang === "es" ? "/es/presupuesto" : "/budget"}
      data-over-hero={overHero || undefined}
      aria-label={`${c.plans}: Klarna, Afterpay, Affirm.${sale ? ` ${sale}.` : ""} ${c.see}`}
      onClick={() => trackEvent("banner_click", saleOn ? "sale" : "plans")}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <span className="tq-banner__line" data-on={!saleOn || undefined} aria-hidden>
        <span className="tq-banner__text" data-size="full">{c.plans}</span>
        {/* A phone has no room for the full sentence beside three names. */}
        <span className="tq-banner__text" data-size="short">{c.short}</span>
        <span className="tq-banner__logos">
          {LOGOS.map((l) => (
            // eslint-disable-next-line @next/next/no-img-element -- official logo files, served as they are
            <img key={l.name} src={l.src} alt="" width={l.w} height={l.h} decoding="async" data-plate={"plate" in l || undefined} />
          ))}
        </span>
      </span>
      {sale ? (
        <span className="tq-banner__line" data-on={saleOn || undefined} aria-hidden>
          <span className="tq-banner__text" data-wrap>{sale}</span>
        </span>
      ) : null}
      <span className="tq-banner__arrow" aria-hidden>
        →
      </span>
    </a>
  );
}
