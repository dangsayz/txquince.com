"use client";

import { useEffect, useId, useState, type CSSProperties } from "react";
import { getPoll, type PollResults } from "@/content/polls";
import "./blog-interactive.css";

type Lang = "en" | "es";
type State = PollResults & { voted: string | null };

const COPY = {
  en: {
    kicker: "Quick poll",
    hint: "One tap. No name, no email.",
    thanks: "Thank you. Your answer is counted.",
    soon: "Results show here after more families answer.",
    answers: (n: number) => `${n.toLocaleString("en-US")} answers`,
    yours: "Your answer",
    error: "We could not save your answer. Please try again.",
  },
  es: {
    kicker: "Encuesta rápida",
    hint: "Un toque. Sin nombre ni correo.",
    thanks: "Gracias. Su respuesta ya cuenta.",
    soon: "Los resultados aparecen aquí cuando respondan más familias.",
    answers: (n: number) => `${n.toLocaleString("en-US")} respuestas`,
    yours: "Su respuesta",
    error: "No pudimos guardar su respuesta. Intente de nuevo.",
  },
} as const;

/**
 * One question, one tap. The server keeps a counter per answer and nothing
 * about the person; percents show only after enough answers are in.
 */
export function QuickPoll({ pollId, lang = "en" }: { pollId: string; lang?: Lang }) {
  const poll = getPoll(pollId);
  const c = COPY[lang];
  const id = useId();
  const [state, setState] = useState<State | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    fetch(`/api/polls/${pollId}`, { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: (State & { ok: boolean }) | null) => {
        if (live && d?.ok) setState({ total: d.total, results: d.results, voted: d.voted });
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [pollId]);

  if (!poll) return null;
  const voted = state?.voted ?? null;
  const results = voted ? (state?.results ?? null) : null;

  async function vote(option: string) {
    if (sending || voted) return;
    setSending(option);
    setFailed(false);
    try {
      const r = await fetch(`/api/polls/${pollId}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ option }),
      });
      const d = (await r.json().catch(() => null)) as (State & { ok: boolean }) | null;
      if (!r.ok || !d?.ok) throw new Error("vote failed");
      setState({ total: d.total, results: d.results, voted: d.voted });
    } catch {
      setFailed(true);
    } finally {
      setSending(null);
    }
  }

  return (
    <section className="tq-bx tq-poll" aria-labelledby={`${id}-q`} data-voted={voted ? "true" : undefined}>
      <header className="tq-bx__head">
        <p className="tq-mono tq-bx__kicker">{c.kicker}</p>
        <h3 id={`${id}-q`} className="tq-display tq-bx__title">
          {poll.question[lang]}
        </h3>
      </header>

      <ul className="tq-poll__list">
        {poll.options.map((o) => {
          const pct = results?.find((r) => r.id === o.id)?.pct;
          const mine = voted === o.id;
          return (
            <li key={o.id}>
              <button
                type="button"
                className="tq-poll__opt"
                onClick={() => vote(o.id)}
                disabled={Boolean(voted) || Boolean(sending)}
                aria-pressed={mine}
                data-mine={mine ? "true" : undefined}
                data-busy={sending === o.id ? "true" : undefined}
                data-result={pct === undefined ? undefined : "true"}
                style={pct === undefined ? undefined : ({ "--pct": `${pct}%` } as CSSProperties)}
              >
                <span className="tq-poll__fill" aria-hidden />
                <span className="tq-poll__label">
                  {o[lang]}
                  {mine ? <span className="tq-mono tq-poll__mine">{c.yours}</span> : null}
                </span>
                {pct === undefined ? null : <span className="tq-nums tq-poll__pct">{pct}%</span>}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="tq-bx__note" role="status">
        {failed
          ? c.error
          : voted
            ? results
              ? `${c.thanks} ${c.answers(state?.total ?? 0)}.`
              : `${c.thanks} ${c.soon}`
            : c.hint}
      </p>
    </section>
  );
}
