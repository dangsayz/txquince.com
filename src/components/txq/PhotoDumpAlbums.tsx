"use client";

import { useCallback, useRef, useState } from "react";
import { pickL, type AlbumBlock, type Lang } from "@/lib/photo-dump-shared";
import { PhotoGrid, PhotoViewer } from "./PhotoDump";
import "./pages/photos.css";

const FIRST = 12;

/** /photos/latest and /es/fotos-recientes: every visible album, newest first. */
export function PhotoDumpAlbums({ albums, lang }: { albums: AlbumBlock[]; lang: Lang }) {
  return (
    <>
      {albums.map((a) => (
        <Album key={a.id} album={a} lang={lang} />
      ))}
    </>
  );
}

function Album({ album, lang }: { album: AlbumBlock; lang: Lang }) {
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const close = useCallback(() => {
    setViewing(null);
    opener.current?.focus();
  }, []);
  const shown = open ? album.photos : album.photos.slice(0, FIRST);
  const title = pickL(lang, album.title) || "Quinceañera";
  const caption = pickL(lang, album.caption);
  const date = new Date(album.createdAt);
  const when =
    date.getTime() > 0
      ? date.toLocaleDateString(lang === "es" ? "es-MX" : "en-US", { month: "long", year: "numeric", timeZone: "UTC" })
      : "";
  const count = album.photos.length;

  return (
    <section className="tq-dump-album" aria-labelledby={`album-${album.id}`}>
      <header className="tq-dump-album__head">
        <p className="tq-mono" style={{ margin: 0 }}>
          [{when ? `${when} · ` : ""}
          {count} {lang === "es" ? (count === 1 ? "foto" : "fotos") : count === 1 ? "photo" : "photos"}]
        </p>
        <h2 id={`album-${album.id}`} className="tq-display tq-dump-album__title">
          {title}
        </h2>
        {caption && <p className="tq-dump-album__cap">{caption}</p>}
      </header>
      <PhotoGrid
        photos={shown}
        lang={lang}
        showAlbum={false}
        openLabel={lang === "es" ? "Abrir foto" : "Open photo"}
        starLabel={lang === "es" ? "Favorita" : "Favorite"}
        onOpen={(i, el) => {
          opener.current = el;
          setViewing(i);
        }}
      />
      {count > FIRST && !open && (
        <div className="tq-dump-foot">
          <button type="button" className="tq-btn tq-btn--ghost tq-btn--lg" onClick={() => setOpen(true)}>
            {lang === "es" ? `Ver las ${count} fotos` : `View all ${count} photos`}
          </button>
        </div>
      )}
      {viewing !== null && shown[viewing] && (
        <PhotoViewer photos={shown} index={viewing} lang={lang} onIndex={setViewing} onClose={close} />
      )}
    </section>
  );
}
