"use client";

/**
 * LeakStory — "Where families leave most", drawn instead of written.
 *
 * Left: a small page. A visitor dot travels down and stops where most visits
 * stop; the part of the page that is seen fills in, the rest stays hatched.
 * Right: the visits split into "leave here" and "go on", then the fix steps,
 * one after the other. Every number and step comes from the page's own data
 * (lib/page-behavior.ts → fixSteps), so it changes as the site changes.
 * The motion plays once; "Play again" restarts it. Reduced motion shows the
 * end state at once.
 */
import { useState } from "react";
import { fixSteps, fmtSeconds, type PageBehavior } from "@/lib/page-behavior";

const num = (n: number) => n.toLocaleString("en-US");

export function LeakStory({ page }: { page: PageBehavior }) {
  const [run, setRun] = useState(0);
  const leavePct = Math.round(page.exitRate * 100);
  const leave = Math.round(page.visits * page.exitRate);
  const stay = page.visits - leave;
  const depth = page.avgDepth;
  const steps = fixSteps(page);
  const style = { "--lk-depth": `${depth ?? 0}%`, "--lk-leave": `${leavePct}%` } as React.CSSProperties;

  return (
    <div key={run} className="lk" style={style}>
      <div className="lk__top">
        <h3 className="lk__title">
          Where families leave most:{" "}
          <a href={page.path} target="_blank" rel="noopener noreferrer">
            {page.label}
          </a>
        </h3>
        <button type="button" className="st-btn-ghost lk__replay" onClick={() => setRun((n) => n + 1)}>
          Play again
        </button>
      </div>

      <div className="lk__grid">
        {depth !== null ? (
          <figure className="lk__fig">
            <div className="lk__page" role="img" aria-label={`Most visits stop ${depth}% of the way down the page${page.medianSeconds !== null ? `, after about ${fmtSeconds(page.medianSeconds)}` : ""}.`}>
              <span className="lk__seen" />
              <span className="lk__dot" />
              <span className="lk__stop" />
            </div>
            <figcaption className="lk__cap">
              <span className="lk__key" data-hue="blue">
                Seen: top {depth}%
              </span>
              <span className="lk__key" data-hue="none">
                Rarely seen: {100 - depth}%
              </span>
              {page.medianSeconds !== null ? <span className="lk__time">Typical visit: {fmtSeconds(page.medianSeconds)}</span> : null}
            </figcaption>
          </figure>
        ) : null}

        <div className="lk__flow">
          <p className="lk__sum">
            <span className="st-num lk__big">{num(page.visits)}</span> visits in this period
          </p>
          <div className="lk__split" role="img" aria-label={`${leavePct}% of visits end on this page, ${100 - leavePct}% go on to another page.`}>
            <span className="lk__leave" />
            <span className="lk__stay" />
          </div>
          <dl className="lk__legend">
            <div data-hue="amber">
              <dt>Leave here</dt>
              <dd className="st-num">
                {num(leave)} <span>({leavePct}%)</span>
              </dd>
            </div>
            <div data-hue="green">
              <dt>Go on to another page</dt>
              <dd className="st-num">
                {num(stay)} <span>({100 - leavePct}%)</span>
              </dd>
            </div>
          </dl>
          {page.topClicks.length ? (
            <p className="lk__taps">
              <span>Most tapped:</span> {page.topClicks.map((c) => `${c.label} (${c.count})`).join(" · ")}
            </p>
          ) : null}
        </div>
      </div>

      {steps.length ? (
        <div className="lk__fix">
          <h4 className="lk__fixtitle">Steps to fix it, from these numbers</h4>
          <ol className="lk__steps">
            {steps.map((s, i) => (
              <li key={s.title} style={{ "--lk-i": i } as React.CSSProperties}>
                <span className="lk__n" aria-hidden="true">
                  {i + 1}
                </span>
                <span>
                  <span className="lk__steptitle">{s.title}</span>
                  <span className="lk__why">{s.why}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
