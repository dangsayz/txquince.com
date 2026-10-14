import Link from "next/link";
import { getPublicManifest } from "@/lib/photo-dump";
import { albumsFromManifest, type Lang } from "@/lib/photo-dump-shared";
import { PhotoDumpAlbums } from "./PhotoDumpAlbums";
import "./pages/pages.css";
import "./pages/photos.css";

const COPY = {
  en: {
    index: "Photos / Latest",
    title: "Latest photos",
    sub: "— straight from recent quinces.",
    dek: "Our newest quinceañera photos from around Dallas–Fort Worth: portraits, church, the party, family and the little details. New albums are added every week.",
    empty: "New photos are on their way. In the meantime, see the portfolio.",
    portfolio: "See the portfolio",
    check: "Check your date",
    home: "/",
    checkHref: "/#intake",
  },
  es: {
    index: "Fotos / Recientes",
    title: "Fotos recientes",
    sub: "— directo de quinces recientes.",
    dek: "Nuestras fotos de quinceañera más nuevas en Dallas–Fort Worth: retratos, la misa, la fiesta, la familia y los detalles. Agregamos álbumes nuevos cada semana.",
    empty: "Pronto habrá fotos nuevas. Mientras tanto, mira el portafolio.",
    portfolio: "Ver el portafolio",
    check: "Consulta tu fecha",
    home: "/es",
    checkHref: "/es#intake",
  },
} as const;

/** Server-rendered album list for /photos/latest and /es/fotos-recientes. */
export async function PhotoDumpPage({ lang }: { lang: Lang }) {
  const c = COPY[lang];
  const manifest = await getPublicManifest();
  const albums = manifest ? albumsFromManifest(manifest) : [];

  return (
    <div className="tq-wrap">
      <header className="tq-pg-mast" aria-labelledby="dump-title">
        <p className="tq-pg-mast__index tq-mono">[{c.index}]</p>
        <div className="tq-pg-mast__body">
          <h1 id="dump-title" className="tq-display tq-pg-mast__title">
            {c.title} <em>{c.sub}</em>
          </h1>
          <p className="tq-pg-mast__dek">{c.dek}</p>
          <div className="tq-pg-actions">
            <Link href={c.checkHref} className="tq-btn tq-btn--lg">
              {c.check} <span className="tq-arrow" aria-hidden>→</span>
            </Link>
            <Link href="/portfolio" className="tq-btn tq-btn--lg tq-btn--ghost">
              {c.portfolio}
            </Link>
          </div>
        </div>
      </header>
      {albums.length ? <PhotoDumpAlbums albums={albums} lang={lang} /> : <p className="tq-dump-empty">{c.empty}</p>}
    </div>
  );
}
