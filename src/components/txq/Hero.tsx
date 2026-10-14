"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { StatusLabel } from "./Header";
import { pick, workById } from "./data";
import { useSite } from "./state";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const { t, lang } = useSite();
  const a = workById("w01");
  const b = workById("w02");

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
            <Image
              src={a.src}
              alt={pick(lang, a.alt)}
              fill
              priority
              unoptimized
              sizes="(min-width: 640px) 66vw, 100vw"
              style={{ objectPosition: a.focus }}
            />
          </div>
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
            <Image
              src={b.src}
              alt={pick(lang, b.alt)}
              fill
              priority
              unoptimized
              sizes="33vw"
              style={{ objectPosition: b.focus }}
            />
          </div>
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
            <motion.h1
              id="tq-hero-title"
              key={lang}
              className="tq-display"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
            >
              {t.hero.headA} {t.hero.headB} <em>{t.hero.headC}</em>
            </motion.h1>
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
