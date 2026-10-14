"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * A signature box families sign with a finger or mouse. Emits a PNG data URL
 * (transparent background, ink strokes) or null when cleared. Keyboard and
 * screen-reader users can "Use my typed name", which writes their typed name
 * into the box as their signature.
 */
export function SignaturePad({
  value,
  onChange,
  label,
  clearLabel,
  typedName,
  useTypedLabel,
  error,
}: {
  value: string | null;
  onChange: (png: string | null) => void;
  label: string;
  clearLabel: string;
  typedName: string;
  useTypedLabel: string;
  error?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const dirty = useRef(false);

  // Size the backing store to the box (crisp on retina, capped for file size).
  const fit = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(r.width * dpr);
    const h = Math.round(r.height * dpr);
    if (c.width === w && c.height === h) return;
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = "#111110";
    ctx.fillStyle = "#111110";
    // Resizing wipes the canvas; the parent's signature is no longer on screen.
    if (dirty.current) {
      dirty.current = false;
      onChange(null);
    }
  }, [onChange]);

  useEffect(() => {
    fit();
    const ro = new ResizeObserver(fit);
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, [fit]);

  // A cleared value from outside (e.g. "Start over") clears the drawing.
  useEffect(() => {
    if (value === null && dirty.current) {
      const c = canvasRef.current;
      c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
      dirty.current = false;
    }
  }, [value]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const commit = () => {
    const c = canvasRef.current;
    if (c && dirty.current) onChange(c.toDataURL("image/png"));
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
    const ctx = e.currentTarget.getContext("2d")!;
    ctx.beginPath();
    ctx.arc(last.current.x, last.current.y, 1.1, 0, Math.PI * 2);
    ctx.fill();
    dirty.current = true;
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    const p = point(e);
    const ctx = e.currentTarget.getContext("2d")!;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    commit();
  };

  const clear = () => {
    const c = canvasRef.current;
    c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
    dirty.current = false;
    onChange(null);
  };

  const useTyped = () => {
    const c = canvasRef.current;
    const name = typedName.trim();
    if (!c || !name) return;
    const ctx = c.getContext("2d")!;
    const r = c.getBoundingClientRect();
    ctx.clearRect(0, 0, c.width, c.height);
    let size = 44;
    ctx.font = `italic 500 ${size}px "Snell Roundhand", "Brush Script MT", "Segoe Script", cursive`;
    while (ctx.measureText(name).width > r.width - 40 && size > 18) {
      size -= 2;
      ctx.font = `italic 500 ${size}px "Snell Roundhand", "Brush Script MT", "Segoe Script", cursive`;
    }
    ctx.textBaseline = "middle";
    ctx.fillText(name, 20, r.height / 2);
    dirty.current = true;
    commit();
  };

  return (
    <div className="tq-sign">
      <div className="tq-sign__head">
        <span className="tq-mono" id="tq-sign-label">
          {label}
        </span>
        <span className="tq-sign__actions">
          <button type="button" className="tq-sign__btn" onClick={useTyped} disabled={!typedName.trim()}>
            {useTypedLabel}
          </button>
          <button type="button" className="tq-sign__btn" onClick={clear} disabled={!value}>
            {clearLabel}
          </button>
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="tq-sign__pad"
        data-signed={Boolean(value)}
        role="img"
        aria-labelledby="tq-sign-label"
        aria-describedby={error ? "err-signature" : undefined}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={up}
      />
      {error && (
        <p id="err-signature" className="tq-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
