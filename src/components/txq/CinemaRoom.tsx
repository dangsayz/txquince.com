"use client";

import Image from "next/image";
import { forwardRef, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { FEATURE, REELS, pick, workById, type Film } from "./data";
import { useSite } from "./state";

const FPS = 24;
/** Seconds each plate holds in the screening preview. */
const SHOT = 6;

/** HH:MM:SS:FF at 24 fps */
function timecode(s: number) {
  const f = Math.floor((s % 1) * FPS);
  const whole = Math.floor(s);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(whole / 3600))}:${p(Math.floor(whole / 60) % 60)}:${p(whole % 60)}:${p(f)}`;
}

/**
 * The Cinema Room. The screening preview sequences stills from the archive
 * with a slow push-in so the player, timecode and scrubber behave like a
 * real film; swap `frames` for a <video> source once 4K masters are hosted.
 */
export const CinemaRoom = forwardRef<HTMLElement>(function CinemaRoom(_, ref) {
  const { t, lang } = useSite();
  const reduce = useReducedMotion();
  const [film, setFilm] = useState<Film>(FEATURE);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(false);
  const userPaused = useRef(false);
  const playerRef = useRef<HTMLDivElement>(null);

  // Playback clock
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setTime((s) => (s + dt) % film.duration);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, film.duration]);

  // Silent autoplay while the player is on screen, unless the viewer paused it.
  useEffect(() => {
    const el = playerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) setPlaying(false);
        else if (!userPaused.current && !reduce) setPlaying(true);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  const toggle = () => {
    userPaused.current = playing;
    setPlaying(!playing);
  };

  const load = (f: Film) => {
    setFilm(f);
    setTime(0);
    userPaused.current = false;
    setPlaying(true);
    playerRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  };

  const shot = Math.floor(time / SHOT) % film.frames.length;
  const progress = (time % SHOT) / SHOT;

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
          <div ref={playerRef} className="tq-player">
            {film.frames.map((id, i) => {
              const w = workById(id);
              const on = i === shot;
              const scale = reduce ? 1 : on ? 1.02 + progress * 0.08 : 1.02;
              return (
                <div key={`${film.id}-${id}`} className="tq-player__frame" data-on={on} aria-hidden={!on}>
                  <div style={{ transform: `scale(${scale})` }}>
                    <Image
                      src={w.src}
                      alt={on ? pick(lang, w.alt) : ""}
                      fill
                      unoptimized
                      sizes="100vw"
                      style={{ objectPosition: w.focus }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="tq-player__veil" />
            <div className="tq-player__hud">
              <div className="tq-mono">
                <span>
                  {t.cinema.nowShowing} — {pick(lang, film.kind)}
                </span>
                <span className="tq-player__spec">{film.spec}</span>
              </div>
              <div style={{ alignItems: "flex-end" }}>
                <p className="tq-display tq-player__title" style={{ margin: 0 }}>
                  {pick(lang, film.title)}
                </p>
                <span className="tq-mono tq-nums">{timecode(time)}</span>
              </div>
            </div>
            <button
              type="button"
              className="tq-player__big"
              data-paused={!playing}
              onClick={toggle}
              aria-label={playing ? t.cinema.pause : t.cinema.play}
            >
              <span aria-hidden>{playing ? <PauseIcon /> : <PlayIcon />}</span>
            </button>
          </div>

          <div className="tq-controls">
            <button
              type="button"
              className="tq-ctl"
              onClick={toggle}
              aria-label={playing ? t.cinema.pause : t.cinema.play}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>
            <span className="tq-mono tq-nums" aria-hidden>
              {timecode(time)}
            </span>
            <input
              type="range"
              className="tq-scrub"
              min={0}
              max={film.duration}
              step={1 / FPS}
              value={time}
              aria-label={t.cinema.scrub}
              aria-valuetext={timecode(time)}
              style={{ ["--p" as string]: `${(time / film.duration) * 100}%` }}
              onChange={(e) => setTime(Number(e.target.value))}
            />
            <span className="tq-controls__dur tq-mono tq-nums">{timecode(film.duration)}</span>
            <button
              type="button"
              className="tq-ctl tq-ctl--sound tq-mono"
              aria-pressed={sound}
              aria-label={sound ? t.cinema.soundOn : t.cinema.soundOff}
              onClick={() => setSound((s) => !s)}
            >
              <SoundIcon on={sound} />
              <span className="tq-ctl__label" aria-hidden>
                {sound ? t.cinema.soundOn : t.cinema.soundOff}
              </span>
            </button>
          </div>

          <div className="tq-reels">
            <div className="tq-reels__intro">
              <p className="tq-mono" style={{ margin: 0 }}>
                {t.cinema.reels}
              </p>
              {film.id !== FEATURE.id && (
                <button
                  type="button"
                  className="tq-btn tq-btn--ghost"
                  style={{ marginTop: 20 }}
                  onClick={() => load(FEATURE)}
                >
                  ← {t.cinema.back}
                </button>
              )}
            </div>
            <ul className="tq-reels__track" style={{ listStyle: "none", margin: 0 }}>
              {REELS.map((r) => {
                const active = r.id === film.id;
                const [a, b] = r.frames.map(workById);
                return (
                  <li key={r.id} style={{ minWidth: 0 }}>
                    <button
                      type="button"
                      className="tq-reel"
                      style={{ width: "100%" }}
                      aria-pressed={active}
                      onClick={() => load(r)}
                    >
                      <span className="tq-reel__media" style={{ display: "block" }}>
                        {active && (
                          <span className="tq-reel__badge tq-mono">
                            <span className="tq-dot" aria-hidden /> {t.cinema.playing}
                          </span>
                        )}
                        <Image src={a.src} alt="" fill unoptimized sizes="(min-width: 960px) 25vw, 70vw" style={{ objectPosition: a.focus }} />
                        {b && <Image src={b.src} alt="" fill unoptimized sizes="(min-width: 960px) 25vw, 70vw" style={{ objectPosition: b.focus }} />}
                      </span>
                      <span className="tq-reel__cap">
                        <span className="tq-display">{pick(lang, r.title)}</span>
                        <span className="tq-mono tq-muted tq-nums" style={{ textAlign: "right" }}>
                          {pick(lang, r.kind)}
                          <br />
                          {timecode(r.duration).slice(3, 8)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
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
function PauseIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden>
      <path d="M2 1h3v14H2zM9 1h3v14H9z" fill="currentColor" />
    </svg>
  );
}
function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg width="18" height="16" viewBox="0 0 18 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M1.5 5.5h3l4-3.5v12l-4-3.5h-3z" fill="currentColor" stroke="none" />
      {on ? (
        <path d="M11.5 5c1 .8 1.5 1.8 1.5 3s-.5 2.2-1.5 3M13.8 2.8C15.5 4.2 16.5 6 16.5 8s-1 3.8-2.7 5.2" />
      ) : (
        <path d="M11.5 5.5l5 5M16.5 5.5l-5 5" />
      )}
    </svg>
  );
}
