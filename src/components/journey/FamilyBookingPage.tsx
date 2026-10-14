import Link from "next/link";
import { ADD_ONS, TIERS } from "@/components/txq/data";
import { ESIGN_CONSENT } from "@/lib/contract-pdf";
import { CANCELLATION_POLICY } from "@/lib/journey/policy";
import type { FamilyView } from "@/lib/journey/view";
import { ALBUM_STATUSES } from "@/lib/journey/types";
import { site } from "@/content/site";
import { JOURNEY_COPY } from "./copy";
import { SignPanel } from "./SignPanel";
import { JourneyPayButton } from "./JourneyPayButton";
import { MessageForm } from "./MessageForm";
import "@/components/txq/pages/pages.css";
import "./journey.css";

const money = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;

function longDate(iso: string, lang: "en" | "es") {
  return new Intl.DateTimeFormat(lang === "es" ? "es-MX" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso.slice(0, 10)}T12:00:00Z`));
}
function shortDate(iso: string, lang: "en" | "es") {
  return new Intl.DateTimeFormat(lang === "es" ? "es-MX" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  }).format(new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso));
}

/**
 * The family's private page, in every state of the journey. Renders ONLY the
 * FamilyView projection (src/lib/journey/view.ts).
 */
export function FamilyBookingPage({
  view: v,
  token,
  lang,
  paidReturn,
}: {
  view: FamilyView;
  token: string;
  lang: "en" | "es";
  paidReturn: boolean;
}) {
  const c = JOURNEY_COPY[lang];
  const stage = c.stage[v.stage];
  const tier = TIERS.find((t) => t.id === v.pkg.tier);
  const extras = ADD_ONS.filter((a) => v.pkg.addOns.includes(a.id)).map((a) => a.name[lang]);
  const otherLang = lang === "es" ? `/my/booking/${token}` : `/es/mi-reserva/${token}`;
  const contractHref = `/my/booking/${token}/contract`;
  const m = v.money;
  const waitingOnStripe = paidReturn && (v.stage === "pay_deposit" || (v.canPayBalance && m.remainingCents > 0));
  const albumIndex = v.delivery ? ALBUM_STATUSES.indexOf(v.delivery.albumStatus) : -1;

  return (
    <div className="tq-wrap tq-jr" lang={lang}>
      <header className="tq-pg-mast">
        <p className="tq-pg-mast__index tq-mono tq-jr-index">
          <span>[{c.index}]</span>
          <span>{v.ref}</span>
        </p>
        <div className="tq-pg-mast__body">
          <h1 className="tq-display tq-pg-mast__title tq-pg-mast__title--sm">{stage.title}</h1>
          <p className="tq-pg-mast__dek">{stage.dek}</p>
          {waitingOnStripe && (
            <p className="tq-jr-note" role="status">
              {c.confirming}
            </p>
          )}
          {(v.stage === "sign" || v.stage === "pay_deposit") && (
            <ol className="tq-jr-steps" aria-label={lang === "es" ? "Pasos" : "Steps"}>
              <li data-done={Boolean(v.signed)} data-current={v.stage === "sign"}>
                <span className="tq-mono">{c.stepSign}</span>
                <span>{v.signed ? c.done : ""}</span>
              </li>
              <li data-done={m.depositPaid} data-current={v.stage === "pay_deposit"}>
                <span className="tq-mono">{c.stepPay}</span>
                <span>{m.depositPaid ? c.done : money(m.depositDueCents)}</span>
              </li>
            </ol>
          )}
          {/* The amount sits above the button, which also keeps the main
              action out of the top third on phones (design law, gate 2). */}
          {(v.canPayDeposit || v.canPayBalance) && !waitingOnStripe && (
            <dl className="tq-pay__lines tq-nums">
              {v.canPayDeposit ? (
                <>
                  <div>
                    <dt>{c.total}</dt>
                    <dd>{money(m.totalCents)}</dd>
                  </div>
                  <div>
                    <dt>{c.deposit(m.depositPercent)}</dt>
                    <dd>{money(m.depositDueCents)}</dd>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <dt>{c.paid}</dt>
                    <dd>{money(m.paidCents)}</dd>
                  </div>
                  <div>
                    <dt>{m.balanceDueDate ? `${c.left} · ${c.dueBy(longDate(m.balanceDueDate, lang))}` : c.left}</dt>
                    <dd>{money(m.remainingCents)}</dd>
                  </div>
                </>
              )}
            </dl>
          )}
          {v.canPayDeposit && !waitingOnStripe && (
            <div className="tq-pay__cta">
              <JourneyPayButton token={token} kind="deposit" label={c.payDeposit(money(m.depositDueCents))} busyLabel={c.opening} errorLabel={c.payError} />
              <p className="tq-jr-fine">{c.secure}</p>
            </div>
          )}
          {v.canPayBalance && !waitingOnStripe && (
            <div className="tq-pay__cta">
              <JourneyPayButton token={token} kind="balance" label={c.payBalance(money(m.remainingCents))} busyLabel={c.opening} errorLabel={c.payError} />
              <p className="tq-jr-fine">{c.balanceNote(m.balanceDueDate ? longDate(m.balanceDueDate, lang) : null)}</p>
            </div>
          )}
          <Link href={otherLang} className="tq-pg-link" hrefLang={lang === "es" ? "en" : "es"}>
            <span>{c.langSwitch}</span>
          </Link>
        </div>
      </header>

      {v.delivery && (
        <section className="tq-pg-row" aria-labelledby="jr-delivery">
          <h2 id="jr-delivery" className="tq-pg-row__index tq-mono">
            [{c.deliveryTitle}]
          </h2>
          <div className="tq-pg-row__body">
            <dl className="tq-pg-dl">
              <div>
                <dt>{c.gallery}</dt>
                <dd>
                  {v.delivery.galleryUrl ? (
                    <a href={v.delivery.galleryUrl} target="_blank" rel="noopener noreferrer">
                      {c.openGallery} ↗
                    </a>
                  ) : (
                    c.notReady
                  )}
                </dd>
              </div>
              <div>
                <dt>{c.video}</dt>
                <dd>
                  {v.delivery.videoUrl ? (
                    <a href={v.delivery.videoUrl} target="_blank" rel="noopener noreferrer">
                      {c.watchVideo} ↗
                    </a>
                  ) : (
                    c.notReady
                  )}
                </dd>
              </div>
              <div>
                <dt>{c.album}</dt>
                <dd>{c.albumSteps[v.delivery.albumStatus]}</dd>
              </div>
            </dl>
            <ol className="tq-jr-track" aria-label={c.album}>
              {ALBUM_STATUSES.map((s, i) => (
                <li key={s} data-done={i <= albumIndex} aria-current={i === albumIndex ? "step" : undefined}>
                  {c.albumSteps[s]}
                </li>
              ))}
            </ol>
            {v.delivery.note && <p className="tq-pg-prose">{v.delivery.note}</p>}
            {v.delivery.reviewUrl && (
              <div className="tq-jr-review">
                <h3 className="tq-jr-h3">{c.reviewTitle}</h3>
                <p>{c.reviewBody}</p>
                <div className="tq-pg-actions">
                  <a className="tq-btn tq-btn--lg" href={v.delivery.reviewUrl} target="_blank" rel="noopener noreferrer">
                    {c.reviewBtn} <span className="tq-arrow" aria-hidden>↗</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {v.stage === "sign" && v.agreement && (
        <section className="tq-pg-row" aria-labelledby="jr-sign">
          <h2 id="jr-sign" className="tq-pg-row__index tq-mono">
            [{c.stepSign}]
          </h2>
          <div className="tq-pg-row__body">
            <p className="tq-jr-lead">{c.readFirst}</p>
            <Agreement view={v} />
            {v.canSign && (
              <SignPanel
                token={token}
                lang={lang}
                consentText={ESIGN_CONSENT[lang]}
                consentVersion={ESIGN_CONSENT.version}
                defaultName={v.name}
              />
            )}
          </div>
        </section>
      )}

      <section className="tq-pg-row" aria-labelledby="jr-details">
        <h2 id="jr-details" className="tq-pg-row__index tq-mono">
          [{c.ref} {v.ref}]
        </h2>
        <div className="tq-pg-row__body">
          <dl className="tq-pg-dl">
            <div>
              <dt>{c.date}</dt>
              <dd>{longDate(v.eventDate, lang)}</dd>
            </div>
            {v.holdUntil && (
              <div>
                <dt>{c.heldUntil}</dt>
                <dd>{shortDate(v.holdUntil, lang)}</dd>
              </div>
            )}
            {tier && (
              <div>
                <dt>{c.pkg}</dt>
                <dd>
                  {tier.name[lang]}
                  {v.pkg.hours ? ` · ${c.hours(v.pkg.hours)}` : ""}
                </dd>
              </div>
            )}
            {extras.length > 0 && (
              <div>
                <dt>{c.extras}</dt>
                <dd>{extras.join(", ")}</dd>
              </div>
            )}
            {v.pkg.honoree && (
              <div>
                <dt>{c.honoree}</dt>
                <dd>{v.pkg.honoree}</dd>
              </div>
            )}
            <div>
              <dt>{c.venue}</dt>
              <dd>{v.pkg.venue || c.tbd}</dd>
            </div>
            {v.pkg.cityLabel && (
              <div>
                <dt>{c.area}</dt>
                <dd>{v.pkg.cityLabel}</dd>
              </div>
            )}
            <div>
              <dt>{c.starts}</dt>
              <dd>{v.pkg.startTime || c.tbd}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="tq-pg-row" aria-labelledby="jr-money">
        <h2 id="jr-money" className="tq-pg-row__index tq-mono">
          [{c.moneyTitle}]
        </h2>
        <div className="tq-pg-row__body">
          <dl className="tq-pay__lines tq-nums tq-jr-money">
            <div>
              <dt>{c.total}</dt>
              <dd>{money(m.totalCents)}</dd>
            </div>
            <div>
              <dt>{c.deposit(m.depositPercent)}</dt>
              <dd>{m.depositPaid ? `${money(m.depositCents)} · ${c.depositPaid}` : money(m.depositCents)}</dd>
            </div>
            <div>
              <dt>
                {c.balance}
                {m.balanceDueDate ? ` · ${c.dueBy(longDate(m.balanceDueDate, lang))}` : ""}
              </dt>
              <dd>{money(Math.max(0, m.totalCents - m.depositCents))}</dd>
            </div>
            <div>
              <dt>{c.paid}</dt>
              <dd>{money(m.paidCents)}</dd>
            </div>
            {m.refundedCents > 0 && (
              <div>
                <dt>{c.refunded}</dt>
                <dd>{money(m.refundedCents)}</dd>
              </div>
            )}
            <div className="tq-jr-strong">
              <dt>{c.left}</dt>
              <dd>{money(m.remainingCents)}</dd>
            </div>
          </dl>
          {v.payments.length > 0 && (
            <div>
              <h3 className="tq-jr-h3">{c.paymentsTitle}</h3>
              <ul className="tq-jr-list tq-nums">
                {v.payments.map((p, i) => (
                  <li key={i}>
                    <span>
                      {c.pKind[p.kind]} · {c.pMethod[p.method]}
                    </span>
                    <span>{shortDate(p.at, lang)}</span>
                    <span>{p.kind === "refund" ? `−${money(p.amountCents)}` : money(p.amountCents)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {v.signed && v.agreement && (
        <section className="tq-pg-row" aria-labelledby="jr-agreement">
          <h2 id="jr-agreement" className="tq-pg-row__index tq-mono">
            [{c.agreementTitle}]
          </h2>
          <div className="tq-pg-row__body">
            <Agreement view={v} />
            <a className="tq-btn tq-btn--ghost tq-btn--lg tq-jr-pdf" href={contractHref} target="_blank" rel="noopener noreferrer">
              {c.downloadPdf}
            </a>
          </div>
        </section>
      )}

      <section className="tq-pg-row" aria-labelledby="jr-messages">
        <h2 id="jr-messages" className="tq-pg-row__index tq-mono">
          [{c.messagesTitle}]
        </h2>
        <div className="tq-pg-row__body">
          <p className="tq-jr-lead">{c.messagesDek}</p>
          {v.messages.length > 0 && (
            <ol className="tq-jr-thread">
              {v.messages.map((msg, i) => (
                <li key={i} data-author={msg.author}>
                  <p className="tq-mono">
                    {msg.author === "family" ? c.you : c.us} · {shortDate(msg.at, lang)}
                    {msg.kind !== "message" ? ` · ${c.kinds[msg.kind]}` : ""}
                  </p>
                  <p className="tq-jr-body">{msg.body}</p>
                </li>
              ))}
            </ol>
          )}
          <MessageForm token={token} lang={lang} />
        </div>
      </section>

      <section className="tq-pg-row" aria-labelledby="jr-policy">
        <h2 id="jr-policy" className="tq-pg-row__index tq-mono">
          [{c.policyTitle}]
        </h2>
        <div className="tq-pg-row__body">
          <h3 className="tq-jr-h3">{CANCELLATION_POLICY[lang].title}</h3>
          <ul className="tq-jr-bullets">
            {CANCELLATION_POLICY[lang].lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <p>
            {c.help}{" "}
            <a href={`mailto:${site.contact.email}`} className="tq-pg-inline">
              {site.contact.email}
            </a>
            .
          </p>
          <p className="tq-jr-fine">{c.keepPrivate}</p>
        </div>
      </section>
    </div>
  );
}

function Agreement({ view }: { view: FamilyView }) {
  const a = view.agreement!;
  const lang = view.lang;
  const c = JOURNEY_COPY[lang];
  return (
    <article className="tq-agreement" aria-label={a.title} tabIndex={0}>
      <h3 className="tq-agreement__title">{a.title}</h3>
      <p>{a.intro}</p>
      {a.sections.map((sec) => (
        <section key={sec.title}>
          <h4 className="tq-mono">{sec.title}</h4>
          <ul>
            {sec.lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </section>
      ))}
      {view.signed && (
        <div className="tq-agreement__sig">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={view.signed.signature} alt="" width={300} height={100} />
          <p className="tq-mono">{c.signedBy(view.signed.name, shortDate(view.signed.at, lang))}</p>
        </div>
      )}
    </article>
  );
}
