"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useShell } from "./SiteShell";
import "./not-found.css";

/**
 * NotFoundScene — the 404. A portfolio portrait rendered as a field of
 * particles under a night sky: the lower frame holds, the upper frame blows
 * away on the wind and re-forms. The frame dims to the film room while it is
 * on screen. Static (fully assembled, no loop) under prefers-reduced-motion.
 */

const PHOTO = "/portfolio/gown-overhead.webp";
const FOCUS_Y = 0.5; // cover-crop anchor (the overhead frame is centered on her)

const COPY = {
  en: {
    code: "404 · Frame not found",
    title: "This page isn’t on the program.",
    dek: "The link may have moved, or this moment was never captured. Every celebration we’ve photographed is still right where we left it.",
    cta: "Check her date",
    back: "Back to the celebration",
    dock: "Elsewhere on TX Quince",
    links: { home: "Home", galleries: "Galleries", films: "Films", journal: "Journal" },
    href: { home: "/", films: "/#cinema", journal: "/blog", date: "/check-your-date" },
  },
  es: {
    code: "404 · Foto no encontrada",
    title: "Esta página no está en el programa.",
    dek: "Es posible que el enlace haya cambiado, o que este momento nunca se haya capturado. Cada celebración que fotografiamos sigue donde la dejamos.",
    cta: "Consultar su fecha",
    back: "Volver a la celebración",
    dock: "Más en TX Quince",
    links: { home: "Inicio", galleries: "Galerías", films: "Cine", journal: "Diario" },
    href: { home: "/es", films: "/es#cinema", journal: "/es/blog", date: "/es/consulta" },
  },
} as const;

export function NotFoundScene() {
  // Read the language from the URL, not useSite(): /admin 404s render outside the site shell.
  const pathname = usePathname() || "/";
  const c = COPY[pathname === "/es" || pathname.startsWith("/es/") ? "es" : "en"];
  const { setCinema } = useShell();

  useEffect(() => {
    setCinema(true);
    return () => setCinema(false);
  }, [setCinema]);

  const dock = [
    { href: c.href.home, label: c.links.home, icon: <IconHome /> },
    { href: "/portfolio", label: c.links.galleries, icon: <IconFrames /> },
    { href: c.href.films, label: c.links.films, icon: <IconFilm /> },
    { href: c.href.journal, label: c.links.journal, icon: <IconJournal /> },
  ];

  return (
    <section className="tq-404" aria-labelledby="tq-404-title">
      <div className="tq-404__wash" aria-hidden style={{ backgroundImage: `url(${PHOTO})` }} />
      <ParticleField />
      <div className="tq-404__shade" aria-hidden />

      <div className="tq-404__body">
        <p className="tq-mono tq-404__code">{c.code}</p>
        <h1 id="tq-404-title" className="tq-404__title">
          {c.title}
        </h1>
        <p className="tq-404__dek">{c.dek}</p>

        <div className="tq-404__actions">
          <Link href={c.href.date} className="tq-btn tq-btn--lg tq-404__cta">
            {c.cta} <span className="tq-arrow" aria-hidden>→</span>
          </Link>
          <Link href={c.href.home} className="tq-404__back">
            {c.back}
          </Link>
        </div>

        <nav className="tq-404__dock" aria-label={c.dock}>
          <ul>
            {dock.map((d) => (
              <li key={d.label}>
                <Link href={d.href} className="tq-404__tile">
                  {d.icon}
                  <span className="tq-mono">{d.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}

/* ---------- Particle field ---------- */

type Field = {
  n: number;
  hx: Float32Array; // home position (device px)
  hy: Float32Array;
  sx: Float32Array; // intro start position
  sy: Float32Array;
  col: Uint32Array; // packed ABGR, alpha left at 0 — written per frame
  erode: Float32Array; // 0 = holds, 1 = carried off by the wind
  fade: Float32Array; // resting opacity: the top of the frame gives way to sky
  phase: Float32Array;
  speed: Float32Array;
  delay: Float32Array;
  size: Uint8Array; // square dot, device px
};

type Star = { x: number; y: number; p: number; s: number; cross: boolean };

function hash(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (v: number) => 1 - Math.pow(1 - v, 3);

function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const img = new Image();
    img.decoding = "async";
    img.src = PHOTO;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let field: Field | null = null;
    let stars: Star[] = [];
    let frame: ImageData | null = null;
    let buf: Uint32Array | null = null;
    let raf = 0;
    let start = 0;
    let visible = true;
    const pointer = { x: -1e5, y: -1e5 };

    function build() {
      const rect = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = Math.max(1, Math.round(rect.width * dpr));
      H = Math.max(1, Math.round(rect.height * dpr));
      canvas!.width = W;
      canvas!.height = H;
      frame = ctx!.createImageData(W, H);
      buf = new Uint32Array(frame.data.buffer);

      // One sample per particle: draw the photo cover-fit onto a small grid.
      const target = rect.width < 640 ? 34000 : 90000;
      const step = Math.max(2, Math.sqrt((W * H) / target));
      const gw = Math.ceil(W / step);
      const gh = Math.ceil(H / step);
      const off = document.createElement("canvas");
      off.width = gw;
      off.height = gh;
      const octx = off.getContext("2d", { willReadFrequently: true })!;
      const scale = Math.max(gw / img.naturalWidth, gh / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      octx.drawImage(img, (gw - dw) / 2, (gh - dh) * FOCUS_Y, dw, dh);
      const px = octx.getImageData(0, 0, gw, gh).data;

      const n = gw * gh;
      const f: Field = {
        n,
        hx: new Float32Array(n),
        hy: new Float32Array(n),
        sx: new Float32Array(n),
        sy: new Float32Array(n),
        col: new Uint32Array(n),
        erode: new Float32Array(n),
        fade: new Float32Array(n),
        phase: new Float32Array(n),
        speed: new Float32Array(n),
        delay: new Float32Array(n),
        size: new Uint8Array(n),
      };
      for (let i = 0; i < n; i++) {
        const gx = i % gw;
        const gy = (i / gw) | 0;
        const h1 = hash(i);
        const h2 = hash(i + 7919);
        const h3 = hash(i + 104729);
        const x = (gx + h1 - 0.5) * step;
        const y = (gy + h2 - 0.5) * step;
        f.hx[i] = x;
        f.hy[i] = y;

        // Dusk grade: lift toward lavender, pull the darks down.
        const k = i * 4;
        let r = px[k];
        let g = px[k + 1];
        let b = px[k + 2];
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        r = Math.min(255, r * 0.9 + 22 * lum + 10);
        g = Math.min(255, g * 0.86 + 16 * lum + 8);
        b = Math.min(255, b * 0.95 + 44 * lum + 22);
        f.col[i] = ((b & 255) << 16) | ((g & 255) << 8) | (r & 255);

        // The wind takes the top-left of the frame and the brightest highlights.
        const nx = x / W;
        const ny = y / H;
        const band = 0.62 - ny - (nx - 0.5) * 0.35;
        f.erode[i] = clamp01(band * 1.9 + (h3 - 0.5) * 0.7 + (lum - 0.5) * 0.3);

        const sky = clamp01((ny + (h1 - 0.5) * 0.14 - 0.06) / 0.52);
        f.fade[i] = 0.1 + 0.9 * sky * sky * (3 - 2 * sky);

        f.phase[i] = h1;
        f.speed[i] = 0.035 + h2 * 0.07;
        f.delay[i] = h3 * 0.5 + (1 - ny) * 0.35;
        f.size[i] = Math.max(1, Math.round(step * (0.5 + h3 * 0.45)));

        // Intro: everything arrives on the wind, from down-left.
        const spread = 0.25 + h2 * 0.5;
        f.sx[i] = x - W * spread * 0.8 - h1 * 60 * dpr;
        f.sy[i] = y + H * spread * 0.45;
      }
      field = f;

      const count = Math.round((W * H) / (rect.width < 640 ? 2600 : 5200) / (dpr * dpr));
      stars = Array.from({ length: count }, (_, i) => {
        const a = hash(i + 31);
        const b = hash(i + 977);
        return {
          x: a * W,
          y: Math.pow(b, 1.6) * H * 0.7,
          p: hash(i + 5003),
          s: hash(i + 6007) > 0.9 ? 2 : 1,
          cross: hash(i + 8009) > 0.95,
        };
      });
    }

    function plot(x: number, y: number, rgb: number, a: number, size: number) {
      const b = buf!;
      const ix = x | 0;
      const iy = y | 0;
      if (ix < 0 || iy < 0 || ix >= W || iy >= H || a <= 0.01) return;
      const alpha = ((a > 1 ? 1 : a) * 255) | 0;
      const v = (alpha << 24) | rgb;
      const sw = ix + size > W ? W - ix : size;
      const sh = iy + size > H ? H - iy : size;
      for (let yy = 0; yy < sh; yy++) {
        let o = (iy + yy) * W + ix;
        for (let xx = 0; xx < sw; xx++, o++) if (b[o] >>> 24 < alpha) b[o] = v;
      }
    }

    const WHITE = 0xf2eefa;
    const windX = 0.86;
    const windY = -0.5;

    function draw(now: number) {
      if (!field || !buf || !frame) return;
      const t = reduce ? 10 : (now - start) / 1000;
      buf.fill(0);

      // Stars (Overmind's sky): slow twinkle, the odd four-point sparkle.
      for (const s of stars) {
        const tw = reduce ? 0.7 : 0.45 + 0.55 * Math.abs(Math.sin(t * (0.6 + s.p) + s.p * 40));
        const a = tw * clamp01((t - s.p * 1.2) / 1.2);
        plot(s.x, s.y, WHITE, a, s.s);
        if (s.cross && a > 0.3) {
          const r = 3 * dpr;
          for (let d = 1; d <= r; d++) {
            const fa = a * (1 - d / (r + 1));
            plot(s.x + d, s.y, WHITE, fa, 1);
            plot(s.x - d, s.y, WHITE, fa, 1);
            plot(s.x, s.y + d, WHITE, fa, 1);
            plot(s.x, s.y - d, WHITE, fa, 1);
          }
        }
      }

      // Particles (Shopify's spray).
      const f = field;
      const L = Math.max(W, H) * 0.42;
      const R = 110 * dpr;
      const R2 = R * R;
      const px = pointer.x;
      const py = pointer.y;
      for (let i = 0; i < f.n; i++) {
        const intro = reduce ? 1 : easeOut(clamp01((t - f.delay[i]) / 1.8));
        let x = f.hx[i];
        let y = f.hy[i];
        let a = 1;
        const e = f.erode[i];
        const rest = f.fade[i];

        if (e > 0.22) {
          // Carried off: drift along the wind with a slow curl, fade, re-form.
          const ph = reduce ? f.phase[i] * 0.6 : (t * f.speed[i] + f.phase[i]) % 1;
          const k = e * e;
          const curl = Math.sin(y * 0.004 / dpr + t * 0.35 + f.phase[i] * 2) * 40 * dpr;
          x += (windX * L * ph + curl * ph) * k;
          y += (windY * L * ph + Math.cos(x * 0.003 / dpr + t * 0.3) * 30 * dpr * ph) * k;
          a = ph < 0.06 ? ph / 0.06 : Math.pow(1 - ph, 1.4);
          a = 1 - k + k * a;
        } else if (!reduce) {
          a = 0.82 + 0.18 * Math.sin(t * 1.6 + f.phase[i] * 30);
        }

        if (intro < 1) {
          x = f.sx[i] + (x - f.sx[i]) * intro;
          y = f.sy[i] + (y - f.sy[i]) * intro;
          a *= intro;
        }

        // The cursor parts the field.
        const dx = x - px;
        const dy = y - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const d = Math.sqrt(d2) || 1;
          const push = (1 - d / R) * (1 - d / R) * 46 * dpr;
          x += (dx / d) * push;
          y += (dy / d) * push;
        }

        plot(x, y, f.col[i], a * rest, f.size[i]);
      }

      ctx!.putImageData(frame, 0, 0);
    }

    function loop(now: number) {
      draw(now);
      if (!reduce && visible) raf = requestAnimationFrame(loop);
    }

    function restart() {
      cancelAnimationFrame(raf);
      if (reduce) draw(0);
      else raf = requestAnimationFrame(loop);
    }

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = (e.clientX - r.left) * dpr;
      pointer.y = (e.clientY - r.top) * dpr;
    };
    const onLeave = () => {
      pointer.x = pointer.y = -1e5;
    };

    let resizeTimer = 0;
    let lastW = 0;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (!img.complete || !img.naturalWidth) return;
      // Mobile browsers resize the height as the URL bar slides; only rebuild on width.
      if (Math.abs(w - lastW) < 1 && field) return;
      lastW = w;
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        build();
        restart();
      }, 120);
    });

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && field) restart();
    });

    img.onload = () => {
      lastW = canvas.getBoundingClientRect().width;
      build();
      start = performance.now();
      canvas.dataset.ready = "true";
      restart();
    };

    ro.observe(canvas);
    io.observe(canvas);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
      img.onload = null;
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className="tq-404__field" aria-hidden />;
}

/* ---------- Dock icons (24px grid, 1.5 stroke) ---------- */

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}
const IconHome = () => (
  <Icon>
    <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />
  </Icon>
);
const IconFrames = () => (
  <Icon>
    <rect x="3" y="5" width="14" height="14" rx="1" />
    <path d="M7 2.5h13.5V16" />
    <path d="m3.5 16 4-4 3 3 2-2 4 4" />
  </Icon>
);
const IconFilm = () => (
  <Icon>
    <rect x="3" y="5" width="18" height="14" rx="1" />
    <path d="M7 5v14M17 5v14M3 9.5h4M3 14.5h4M17 9.5h4M17 14.5h4" />
  </Icon>
);
const IconJournal = () => (
  <Icon>
    <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" />
    <path d="M5 17a3 3 0 0 1 3-3h11M9 8h6" />
  </Icon>
);
