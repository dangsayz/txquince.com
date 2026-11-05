"use client";

/**
 * WhatsAppChatButton — "Chat on WhatsApp" / "Escríbenos por WhatsApp".
 * Opens WhatsApp to the studio's WhatsApp number (site.contact.whatsapp) with
 * a first message in the page's language. Each tap is tracked as
 * `contact_whatsapp` with where it sat, and the dashboard counts those taps
 * as their own "whatsapp" source.
 */
import { CONTACT_EVENT, whatsappHref, type ContactLang } from "@/lib/contact";
import { trackEvent } from "@/components/Tracker";
import "./whatsapp-chat.css";

export const WHATSAPP_CHAT_LABEL = { en: "Chat on WhatsApp", es: "Escríbenos por WhatsApp" } as const;

export function WhatsAppChatButton({ lang, placement, className }: { lang: ContactLang; placement: string; className?: string }) {
  return (
    <a
      href={whatsappHref(lang)}
      target="_blank"
      rel="noopener noreferrer"
      className={["tq-wa", className].filter(Boolean).join(" ")}
      onClick={() => trackEvent(CONTACT_EVENT.whatsapp, placement)}
    >
      <svg className="tq-wa__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.6a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"
        />
      </svg>
      <span>{WHATSAPP_CHAT_LABEL[lang]}</span>
    </a>
  );
}
