"use client";

import { useId, useMemo, useState, useSyncExternalStore, type CSSProperties } from "react";
import Link from "next/link";
import {
  dateStages,
  daysBetween,
  formatDay,
  parseIso,
  planIcs,
  planText,
  toIso,
  type PlanLang,
  type PlanStage,
  type StageStatus,
} from "@/content/plan-stages";
import "./blog-interactive.css";

const STORE = "tq_quince_plan_v1";

const COPY = {
  en: {
    kicker: "Planner",
    title: "Her date, her plan.",
    dek: "Pick the party date. Each step below gets its own due date.",
    date: "Party date",
    daysToGo: (n: number) => (n === 0 ? "Today is the day" : n === 1 ? "1 day to go" : `${n.toLocaleString("en-US")} days to go`),
    past: "That date has passed",
    progress: (a: number, b: number) => `${a} of ${b} done`,
    by: "By",
    status: { late: "Catch up", now: "Start here", later: "Later", done: "Done" } as Record<StageStatus, string>,
    lateNote: "Starting later than 12 months out? You still have time. Do the steps marked Catch up first.",
    checkDate: (d: string) => `See if ${d} is open`,
    send: "Send the plan",
    calendar: "Add to calendar",
    calendarHint: "Pick a date first",
    reset: "Start over",
    saved: "Saved on this phone only. No account, and we do not see it.",
    copied: "Plan copied. Paste it in a message.",
    file: "quince-plan.ics",
  },
  es: {
    kicker: "Planeador",
    title: "Su fecha, su plan.",
    dek: "Elija la fecha de la fiesta. Cada paso de abajo recibe su propia fecha límite.",
    date: "Fecha de la fiesta",
    daysToGo: (n: number) => (n === 0 ? "Hoy es el día" : n === 1 ? "Falta 1 día" : `Faltan ${n.toLocaleString("en-US")} días`),
    past: "Esa fecha ya pasó",
    progress: (a: number, b: number) => `${a} de ${b} listos`,
    by: "Antes del",
    status: { late: "Póngase al día", now: "Empiece aquí", later: "Después", done: "Listo" } as Record<StageStatus, string>,
    lateNote: "¿Empieza con menos de 12 meses? Todavía hay tiempo. Haga primero los pasos marcados Póngase al día.",
    checkDate: (d: string) => `Vea si el ${d} está disponible`,
    send: "Enviar el plan",
    calendar: "Agregar al calendario",
    calendarHint: "Primero elija una fecha",
    reset: "Empezar de nuevo",
    saved: "Se guarda solo en este teléfono. Sin cuenta, y nosotros no lo vemos.",
    copied: "Plan copiado. Péguelo en un mensaje.",
    file: "plan-de-quince.ics",
  },
} as const;

function todayIso(): string {
  const d = new Date();
  return toIso(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

// The saved plan lives in localStorage; this tiny store lets React read it
// after hydration (the server render has no date and nothing ticked).
const listeners = new Set<() => void>();
function subscribe(fn: () => void) {
  listeners.add(fn);
  window.addEventListener("storage", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", fn);
  };
}
function readSaved(): string {
  try {
    return localStorage.getItem(STORE) ?? "";
  } catch {
    return memory;
  }
}
let memory = "";
function writeSaved(value: string) {
  memory = value;
  try {
    if (value) localStorage.setItem(STORE, value);
    else localStorage.removeItem(STORE);
  } catch {
    /* private mode or blocked storage: the plan still works for this visit */
  }
  for (const fn of listeners) fn();
}
const noSubscribe = () => () => undefined;

function parseSaved(raw: string): { party: string | null; done: Set<string> } {
  try {
    const v = JSON.parse(raw || "null") as { date?: unknown; done?: unknown } | null;
    return {
      party: v && typeof v.date === "string" && parseIso(v.date) ? v.date : null,
      done: new Set(v && Array.isArray(v.done) ? v.done.filter((x): x is string => typeof x === "string") : []),
    };
  } catch {
    return { party: null, done: new Set() };
  }
}

/**
 * The planning post's checklist as a personal plan: pick the party date and
 * every stage gets a due date; tick tasks off; send the plan or add it to a
 * calendar. Everything stays in this browser (localStorage).
 */
export function DatePlan({ stages, lang = "en" }: { stages: PlanStage[]; lang?: PlanLang }) {
  const c = COPY[lang];
  const id = useId();
  const raw = useSyncExternalStore(subscribe, readSaved, () => "");
  const today = useSyncExternalStore(noSubscribe, todayIso, () => null);
  const { party, done } = useMemo(() => parseSaved(raw), [raw]);
  const [open, setOpen] = useState<Set<string> | null>(null);
  const [notice, setNotice] = useState("");

  const save = (nextParty: string | null, nextDone: Set<string>) =>
    writeSaved(JSON.stringify({ date: nextParty, done: [...nextDone] }));

  const dated = useMemo(() => dateStages(stages, party, today ?? "1970-01-01", done), [stages, party, today, done]);
  const total = stages.reduce((n, s) => n + s.tasks.length, 0);
  const doneCount = dated.reduce((n, s) => n + s.doneCount, 0);
  const toGo = party && today ? daysBetween(today, party) : null;
  const anyLate = dated.some((s) => s.status === "late");
  // Until the reader opens or closes something, show the stage to work on now.
  const firstOpen = dated.find((s) => s.status === "late") ?? dated.find((s) => s.status === "now");
  const isOpen = (key: string) => (open ? open.has(key) : firstOpen?.key === key);

  function toggleStage(key: string) {
    const next = new Set(open ?? (firstOpen ? [firstOpen.key] : []));
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setOpen(next);
  }

  function toggleTask(taskId: string) {
    const next = new Set(done);
    if (next.has(taskId)) next.delete(taskId);
    else next.add(taskId);
    save(party, next);
  }

  function pickDate(value: string) {
    const next = parseIso(value) ? value : null;
    setOpen(null);
    save(next, done);
  }

  function reset() {
    setOpen(null);
    setNotice("");
    writeSaved("");
  }

  async function send() {
    const url = `${window.location.origin}${window.location.pathname}`;
    const text = planText(dated, party, lang, done, url);
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text });
        return;
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setNotice(c.copied);
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    }
  }

  function calendar() {
    if (!party) return;
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const blob = new Blob([planIcs(dated, party, lang, done, stamp)], { type: "text/calendar;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = c.file;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 2000);
  }

  if (!stages.length) return null;
  const ratio = total ? doneCount / total : 0;

  return (
    <section className="tq-bx tq-plan" aria-labelledby={`${id}-t`}>
      <header className="tq-bx__head">
        <p className="tq-mono tq-bx__kicker">{c.kicker}</p>
        <h3 id={`${id}-t`} className="tq-display tq-bx__title">
          {c.title}
        </h3>
        <p className="tq-plan__dek">{c.dek}</p>
      </header>

      <div className="tq-plan__top">
        <div className="tq-plan__field">
          <label htmlFor={`${id}-d`} className="tq-mono tq-bx__kicker">
            {c.date}
          </label>
          <input
            id={`${id}-d`}
            className="tq-plan__date"
            type="date"
            value={party ?? ""}
            min={today ?? undefined}
            onChange={(e) => pickDate(e.target.value)}
          />
        </div>
        <div className="tq-plan__meter" aria-live="polite">
          <svg className="tq-plan__ring" viewBox="0 0 56 56" aria-hidden style={{ "--ratio": ratio } as CSSProperties}>
            <circle cx="28" cy="28" r="24" pathLength="100" />
            <circle cx="28" cy="28" r="24" pathLength="100" />
          </svg>
          <p>
            <span className="tq-display tq-nums tq-plan__count">
              {toGo === null ? c.progress(doneCount, total) : toGo < 0 ? c.past : c.daysToGo(toGo)}
            </span>
            {toGo === null ? null : <span className="tq-plan__sub tq-nums">{c.progress(doneCount, total)}</span>}
          </p>
        </div>
      </div>

      {party && anyLate ? <p className="tq-plan__late">{c.lateNote}</p> : null}

      <ol className="tq-plan__stages">
        {dated.map((s) => {
          const expanded = isOpen(s.key);
          return (
            <li key={s.key} className="tq-plan__stage" data-status={s.status} data-open={expanded ? "true" : undefined}>
              <button
                type="button"
                className="tq-plan__head"
                aria-expanded={expanded}
                aria-controls={`${id}-${s.key}`}
                onClick={() => toggleStage(s.key)}
              >
                <span className="tq-plan__when">
                  <span className="tq-mono tq-plan__chip">{c.status[s.status]}</span>
                  <span className="tq-plan__due tq-nums">{s.due ? `${c.by} ${formatDay(s.due, lang)}` : s.window}</span>
                  <span className="tq-plan__label">{s.due ? `${s.window}${s.label ? ` · ${s.label}` : ""}` : s.label}</span>
                </span>
                <span className="tq-plan__state">
                  <span className="tq-mono tq-nums tq-plan__n">
                    {s.doneCount}/{s.tasks.length}
                  </span>
                  <span className="tq-plan__chev" aria-hidden />
                </span>
              </button>
              <div className="tq-plan__panel" id={`${id}-${s.key}`} inert={!expanded}>
                <ul className="tq-plan__tasks">
                  {s.tasks.map((t) => (
                    <li key={t.id}>
                      <label className="tq-plan__task">
                        <input type="checkbox" checked={done.has(t.id)} onChange={() => toggleTask(t.id)} />
                        <span className="tq-plan__box" aria-hidden />
                        <span className="tq-plan__text">
                          <span className="tq-plan__title">{t.title}</span>
                          {t.detail ? <span className="tq-plan__detail">{t.detail}</span> : null}
                        </span>
                      </label>
                    </li>
                  ))}
                  {s.key === "m12" && party && toGo !== null && toGo >= 0 ? (
                    <li>
                      <Link className="tq-plan__check" href={`/check-your-date?date=${party}`}>
                        {c.checkDate(formatDay(party, lang))}
                        <span aria-hidden className="tq-plan__arrow">→</span>
                      </Link>
                    </li>
                  ) : null}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="tq-plan__actions">
        <button type="button" className="tq-plan__btn tq-plan__btn--primary" onClick={send}>
          {c.send}
        </button>
        <button type="button" className="tq-plan__btn" onClick={calendar} disabled={!party} title={party ? undefined : c.calendarHint}>
          {c.calendar}
        </button>
        <button type="button" className="tq-plan__reset" onClick={reset}>
          {c.reset}
        </button>
      </div>
      <p className="tq-bx__note" role="status">
        {notice || c.saved}
      </p>
    </section>
  );
}
