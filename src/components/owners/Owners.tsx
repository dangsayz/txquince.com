import type { ReactNode } from "react";
import { site } from "@/content/site";
import "./owners.css";

/**
 * "Hi, we're Dang and Yvonne": the owners, with their photo (the home.owners
 * image slot, replaceable from the site) and links to the films and Instagram.
 * Plain component (no hooks), so the homepage (client) and About (server)
 * both use it and pass in their own photo element.
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

export function Owners({ lang, photo, admin }: { lang: "en" | "es"; photo: ReactNode; admin?: ReactNode }) {
  const c = OWNERS_COPY[lang];
  return (
    <section id="owners" className="ow" aria-labelledby="ow-title">
      <div className="ow-in">
        <figure className="ow-photo">
          {photo}
          {admin}
        </figure>
        <div className="ow-copy">
          <p className="ow-label">{c.label}</p>
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
    </section>
  );
}

export function SocialIcon({ name }: { name: "youtube" | "instagram" }) {
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
