"use client";

import { motion } from "motion/react";
import { StatusLabel } from "./Header";
import { HERO_PLATES, pick, type HeroPlate } from "./data";
import { useSite } from "./state";
import { HERO_SLOTS, type HomeOverrides } from "@/lib/photo-dump-shared";
import { SlotPicture } from "@/components/slots/SlotPicture";
import { SlotAdminControl } from "@/components/slots/SlotAdminControl";
import { useSlot } from "@/components/slots/SlotProvider";

const EASE = [0.22, 1, 0.36, 1] as const;

/** A plate's image: the admin's Photo dump swap when set, else the original.
 *  (An image-slot override, resolved by the page, wins over both.) */
function plate(work: HeroPlate, swap: HomeOverrides[string] | undefined) {
  if (!swap) return { src: work.src, alt: work.alt, focus: work.focus, width: work.width, height: work.height };
  return { src: swap.src, alt: { en: swap.alt.en || pick("en", work.alt), es: swap.alt.es || pick("es", work.alt) }, focus: "50% 40%", width: swap.w, height: swap.h };
}

export function Hero({ overrides = {} }: { overrides?: HomeOverrides }) {
  const { t, lang } = useSite();
  const a = useSlot(HERO_SLOTS[0], plate(HERO_PLATES.a, overrides[HERO_SLOTS[0]]));
  const b = useSlot(HERO_SLOTS[1], plate(HERO_PLATES.b, overrides[HERO_SLOTS[1]]));

  return (
    <section className="tq-hero" id="top" aria-labelledby="tq-hero-title">
      {/* Media stage — a diptych: the wide room, then the tight portrait. */}
      <div className="tq-stage">
        <motion.figure
          className="tq-plate tq-plate--a"
          style={{ margin: 0 }}
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 1.4, ease: EASE }}
        >
          <div className="tq-plate__loop">
            <SlotPicture image={a} lang={lang} fill priority sizes="(min-width: 640px) 66vw, 100vw" />
          </div>
          <SlotAdminControl slot={HERO_SLOTS[0]} />
          <figcaption>
            <span className="tq-tag tq-tag--tl tq-mono">
              [{t.hero.plate} 01 / 02]
            </span>
            <span className="tq-tag tq-tag--bl tq-mono">{t.hero.frameA}</span>
          </figcaption>
        </motion.figure>

        <motion.figure
          className="tq-plate tq-plate--b"
          style={{ margin: 0 }}
          initial={{ clipPath: "inset(100% 0 0 0)" }}
          animate={{ clipPath: "inset(0% 0 0 0)" }}
          transition={{ duration: 1.4, delay: 0.18, ease: EASE }}
        >
          <div className="tq-plate__loop">
            <SlotPicture image={b} lang={lang} fill priority sizes="33vw" />
          </div>
          <SlotAdminControl slot={HERO_SLOTS[1]} />
          <figcaption>
            <span className="tq-tag tq-tag--tl tq-mono">[{t.hero.plate} 02 / 02]</span>
            <span className="tq-tag tq-tag--bl tq-mono">{t.hero.frameB}</span>
          </figcaption>
        </motion.figure>
      </div>

      {/* Typographic ledger */}
      <div className="tq-wrap">
        <div className="tq-ledger">
          <div className="tq-ledger__head">
            {/* The H1 says what the page is (the search phrase families type);
                the poetic line below stays the big display type. Not animated,
                so it is in the first paint exactly as served. */}
            <h1 id="tq-hero-title" className="tq-hero__h1">
              {t.hero.h1}
            </h1>
            <motion.p
              key={lang}
              className="tq-display tq-hero__line"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
            >
              {t.hero.headA} {t.hero.headB} <em>{t.hero.headC}</em>
            </motion.p>
            <p className="tq-ledger__dek">{t.hero.dek}</p>
          </div>

          <div className="tq-ledger__meta">
            <dl className="tq-meta">
              <div>
                <dt>{t.hero.season}</dt>
                <dd>{t.hero.seasonValue}</dd>
              </div>
              <div>
                <dt>{t.hero.regions}</dt>
                <dd>{t.hero.regionsValue}</dd>
              </div>
              <div>
                <dt>{t.hero.status}</dt>
                <dd aria-live="polite">
                  <StatusLabel />
                </dd>
              </div>
            </dl>
          </div>

          <div className="tq-action">
            <span className="tq-mono tq-muted">[ {t.hero.loop} ]</span>
            <div style={{ display: "grid", gap: 12 }}>
              <a href="#intake" className="tq-action__link">
                <span>{t.hero.action}</span>
                <span className="tq-arrow" aria-hidden>
                  →
                </span>
              </a>
              <span className="tq-action__note">{t.hero.actionNote}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
