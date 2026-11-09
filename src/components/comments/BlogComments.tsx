import { listApprovedComments } from "@/lib/comments-db";
import { clerkSettings } from "@/lib/clerk-config";
import { SectionHead } from "@/components/BlogContent";
import { CommentBox } from "./CommentBox";
import { QuoteTools } from "./QuoteTools";
import type { PublicComment } from "@/lib/comments";
import "./comments.css";

const COPY = {
  en: {
    index: "Comments",
    title: (n: number) => (n === 0 ? "Questions & notes" : `${n} ${n === 1 ? "comment" : "comments"}`),
    dek: "Ask a question or share what worked for your quince. Every comment is read before it shows.",
    empty: "No comments yet. Be the first.",
    owner: "TX Quince",
    replied: "replied",
    about: "About",
    jump: "Show this passage in the post",
    locale: "en-US",
  },
  es: {
    index: "Comentarios",
    title: (n: number) => (n === 0 ? "Preguntas y notas" : `${n} ${n === 1 ? "comentario" : "comentarios"}`),
    dek: "Haz una pregunta o comparte lo que te funcionó en tu quince. Leemos cada comentario antes de publicarlo.",
    empty: "Todavía no hay comentarios. Sé la primera.",
    owner: "TX Quince",
    replied: "respondió",
    about: "Sobre",
    jump: "Ver este texto en la publicación",
    locale: "es-MX",
  },
} as const;

function day(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric", timeZone: "America/Chicago" });
  } catch {
    return "";
  }
}

/** Approved comments + the box to write one. Server-rendered list (static/ISR, indexable). */
export async function BlogComments({ lang, slug }: { lang: "en" | "es"; slug: string }) {
  const c = COPY[lang];
  const comments = await listApprovedComments(slug, lang);
  const s = clerkSettings();
  return (
    <section className="tq-section tq-cmt" id="comments" aria-labelledby="tq-cmt-title">
      <div className="tq-wrap">
        <SectionHead index={c.index} id="tq-cmt-title" title={c.title(comments.length)} dek={c.dek} />
        <div className="tq-cmt__body">
          <div className="tq-cmt__col">
            {comments.length ? (
              <ol className="tq-cmt__list">
                {comments.map((cm) => (
                  <Comment key={cm.id} cm={cm} lang={lang} />
                ))}
              </ol>
            ) : (
              <p className="tq-cmt__empty">{c.empty}</p>
            )}
            <CommentBox lang={lang} slug={slug} clerk={s} place="bottom" />
          </div>
        </div>
      </div>
      <QuoteTools lang={lang} slug={slug} quotes={comments.map((cm) => cm.quote).filter((q): q is string => Boolean(q))} />
    </section>
  );
}

/** The comment box for the article's left rail (wide screens; it follows the scroll). */
export function BlogCommentRail({ lang, slug }: { lang: "en" | "es"; slug: string }) {
  return <CommentBox lang={lang} slug={slug} clerk={clerkSettings()} place="rail" />;
}

function Comment({ cm, lang }: { cm: PublicComment; lang: "en" | "es" }) {
  const c = COPY[lang];
  return (
    <li className="tq-cmt__item">
      <article aria-label={cm.author_name}>
        <header className="tq-cmt__meta">
          <span className="tq-cmt__avatar" aria-hidden>
            {cm.author_name.slice(0, 1).toUpperCase()}
          </span>
          <span className="tq-cmt__name">{cm.author_name}</span>
          <time className="tq-cmt__date tq-mono" dateTime={cm.created_at}>
            {day(cm.created_at, c.locale)}
          </time>
        </header>
        {cm.quote ? (
          <button type="button" className="tq-cmt__about" data-tq-quote={cm.quote} title={c.jump}>
            <span className="tq-mono tq-muted">{c.about}</span> “{cm.quote}”
          </button>
        ) : null}
        <p className="tq-cmt__body">{cm.body}</p>
        {cm.reply ? (
          <div className="tq-cmt__reply">
            <p className="tq-cmt__meta">
              <span className="tq-cmt__avatar tq-cmt__avatar--owner" aria-hidden>
                TX
              </span>
              <span className="tq-cmt__name">{c.owner}</span>
              <span className="tq-cmt__date tq-mono">{c.replied}</span>
            </p>
            <p className="tq-cmt__body">{cm.reply}</p>
          </div>
        ) : null}
      </article>
    </li>
  );
}
