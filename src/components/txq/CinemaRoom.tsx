"use client";

import { forwardRef, useState, type SyntheticEvent } from "react";
import { useReducedMotion } from "motion/react";
import type { CinemaFilm } from "./data";
import { useSite } from "./state";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * YouTube serves a 120×90 grey placeholder (not an error) when a video has no
 * max-res still, so swap to the lower-res poster on a tiny load as well as on
 * an outright error.
 */
function onPoster(fallback: string | null) {
  const swap = (img: HTMLImageElement) => {
    if (fallback && img.dataset.fellBack !== "1") {
      img.dataset.fellBack = "1";
      img.src = fallback;
    }
  };
  return {
    onLoad: (e: SyntheticEvent<HTMLImageElement>) => {
      if (e.currentTarget.naturalWidth <= 120) swap(e.currentTarget);
    },
    onError: (e: SyntheticEvent<HTMLImageElement>) => swap(e.currentTarget),
  };
}

/**
 * The Cinema Room screens the studio's real films (the admin video library).
 * The feature waits as a still with a play mark; the embed only mounts once a
 * viewer presses play, so the page stays light. Every other film sits below
 * in an even grid and loads into the screen when chosen.
 */
export const CinemaRoom = forwardRef<HTMLElement, { films: CinemaFilm[] }>(function CinemaRoom({ films }, ref) {
  const { t, lang } = useSite();
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState(films[0]?.id ?? "");
  const [playing, setPlaying] = useState(false);

  const allHref = lang === "es" ? "/es/videografo-de-quinceaneras" : "/quinceanera-videographer";
  const activeIndex = Math.max(0, films.findIndex((f) => f.id === activeId));
  const active = films[activeIndex];
  const titleOf = (f: CinemaFilm) => f.title || t.cinema.untitled;
  const kindOf = (f: CinemaFilm) => (f.feature ? t.cinema.feature : f.vertical ? t.cinema.vertical : t.cinema.film);

  const screen = (f: CinemaFilm) => {
    setActiveId(f.id);
    setPlaying(true);
    document.getElementById("tq-cinema-screen")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  };

  return (
    <section ref={ref} id="cinema" className="tq-section" aria-labelledby="tq-cinema-title">
      <div className="tq-wrap">
        <header className="tq-head">
          <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
            [{t.cinema.index}]
          </p>
          <h2 id="tq-cinema-title" className="tq-display tq-head__title">
            {t.cinema.title}
          </h2>
          <p className="tq-head__dek">{t.cinema.dek}</p>
        </header>

        <div className="tq-cinema__body">
          {active ? (
            <>
              <div id="tq-cinema-screen" className="tq-player">
                {playing ? (
                  active.provider === "file" ? (
                    <video
                      key={active.id}
                      className="tq-player__embed"
                      src={active.embed}
                      poster={active.poster ?? undefined}
                      controls
                      autoPlay
                      playsInline
                    />
                  ) : (
                    <iframe
                      key={active.id}
                      className="tq-player__embed"
                      src={active.embed}
                      title={titleOf(active)}
                      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                      allowFullScreen
                    />
                  )
                ) : (
                  <>
                    {active.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={active.id}
                        className="tq-player__poster"
                        src={active.poster}
                        alt=""
                        decoding="async"
                        {...onPoster(active.fallbackPoster)}
                      />
                    ) : null}
                    <div className="tq-player__veil" />
                    <div className="tq-player__hud">
                      <div className="tq-mono">
                        <span>
                          {t.cinema.nowShowing} — {kindOf(active)}
                        </span>
                      </div>
                      <div>
                        <p className="tq-display tq-player__title" style={{ margin: 0 }}>
                          {titleOf(active)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="tq-player__big"
                      data-paused="true"
                      onClick={() => setPlaying(true)}
                      aria-label={`${t.cinema.play}: ${titleOf(active)}`}
                    >
                      <span aria-hidden>
                        <PlayIcon />
                      </span>
                    </button>
                  </>
                )}
              </div>

              <p className="tq-player__meta tq-mono">
                <span>
                  [{pad(activeIndex + 1)} / {pad(films.length)}] {kindOf(active)}
                </span>
                <span className="tq-player__meta-title">{titleOf(active)}</span>
              </p>

              {films.length > 1 && (
                <div className="tq-films">
                  <div className="tq-films__intro">
                    <p className="tq-mono" style={{ margin: 0 }}>
                      {t.cinema.reels}
                    </p>
                    <p className="tq-films__dek">{t.cinema.reelsDek}</p>
                    <a className="tq-link tq-mono" href={allHref}>
                      {t.cinema.all} →
                    </a>
                  </div>
                  <ul className="tq-films__grid" style={{ listStyle: "none", margin: 0 }}>
                    {films.map((f, i) => {
                      const on = f.id === active.id;
                      return (
                        <li key={f.id} style={{ minWidth: 0 }}>
                          <button
                            type="button"
                            className="tq-film"
                            aria-pressed={on}
                            aria-label={`${t.cinema.play}: ${titleOf(f)}`}
                            onClick={() => screen(f)}
                          >
                            <span className="tq-film__media">
                              {f.poster ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={f.poster} alt="" loading="lazy" decoding="async" {...onPoster(f.fallbackPoster)} />
                              ) : null}
                              {on && (
                                <span className="tq-film__badge tq-mono">
                                  <span className="tq-dot" aria-hidden /> {playing ? t.cinema.playing : t.cinema.nowShowing}
                                </span>
                              )}
                              <span className="tq-film__play" aria-hidden>
                                <PlayIcon />
                              </span>
                            </span>
                            <span className="tq-cap tq-mono">
                              <span>[{pad(i + 1)}]</span>
                              <span className="tq-cap__mid">{titleOf(f)}</span>
                              <span className="tq-cap__end">{kindOf(f)}</span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="tq-films__empty">
              {t.cinema.empty}{" "}
              <a className="tq-link" href={allHref}>
                {t.cinema.all} →
              </a>
            </p>
          )}
        </div>
      </div>
    </section>
  );
});

function PlayIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden>
      <path d="M1 1.5v13L13 8z" fill="currentColor" />
    </svg>
  );
}
