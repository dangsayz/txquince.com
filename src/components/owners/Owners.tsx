import { site } from "@/content/site";
import type { HomeGallery } from "@/lib/home-galleries";
import { WorkSlider } from "./WorkSlider";
import "./owners.css";

/**
 * "Hi, we're Dang and Yvonne": the owners, links to the films and Instagram,
 * and below it a sideways strip of real venue galleries ("Some of our work").
 * Plain component (no hooks), so the homepage (client) and About (server)
 * both use it; each passes in the real galleries it read from the portfolio.
 */
export const OWNERS_COPY = {
  en: {
    label: "Meet the owners",
    title: "Hi, we're Dang and Yvonne.",
    body: [
      "We own TX Quince. Your day is covered by our small in-house crew of photographers and videographers, sometimes with one of us behind the camera.",
      "Every gallery and every film comes back to the two of us, and we edit it all ourselves. We'll talk with you in English or Spanish from your first message to her last song.",
    ],
    youtube: "Watch our films on YouTube",
    instagram: "@txquince on Instagram",
  },
  es: {
    label: "Conoce a los dueños",
    title: "Hola, somos Dang y Yvonne.",
    body: [
      "Somos los dueños de TX Quince. Tu día lo cubre nuestro pequeño equipo de fotógrafos y videógrafos de casa, a veces con uno de nosotros detrás de la cámara.",
      "Cada galería y cada video regresa a nosotros dos, y lo editamos todo nosotros mismos. Te atendemos en español o inglés desde tu primer mensaje hasta la última canción.",
    ],
    youtube: "Mira nuestros videos en YouTube",
    instagram: "@txquince en Instagram",
  },
} as const;

export function Owners({ lang, galleries }: { lang: "en" | "es"; galleries: HomeGallery[] }) {
  const c = OWNERS_COPY[lang];
  return (
    <section id="owners" className="ow" aria-labelledby="ow-title">
      <div className="ow-in">
        <div className="ow-copy">
          <h2 id="ow-title" className="ow-title">
            {c.title}
          </h2>
          {c.body.map((p) => (
            <p key={p} className="ow-body">
              {p}
            </p>
          ))}
          <ul className="ow-links">
            <li>
              <a href={site.social.youtube} target="_blank" rel="noopener noreferrer">
                <SocialIcon name="youtube" /> {c.youtube}
              </a>
            </li>
            <li>
              <a href={site.social.instagram} target="_blank" rel="noopener noreferrer">
                <SocialIcon name="instagram" /> {c.instagram}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <WorkSlider lang={lang} galleries={galleries} />
    </section>
  );
}

export function SocialIcon({ name }: { name: "youtube" | "instagram" | "whatsapp" }) {
  if (name === "whatsapp")
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden focusable="false">
        <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.6a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" />
      </svg>
    );
  return name === "youtube" ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden focusable="false">
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
