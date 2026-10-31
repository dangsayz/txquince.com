/**
 * plan-timeline.ts — the free "Quince day timeline" for a family's date (pure).
 *
 * Two things that are genuinely specific to THEIR date:
 *   1. Sunset in Dallas–Fort Worth that day, so the portrait block lands in
 *      golden hour: before the reception in fall/winter, a short step outside
 *      during the reception in late spring/summer.
 *   2. A countdown checklist with real calendar dates worked back from the
 *      event ("Choose the court — by Feb 21, 2026").
 *
 * Sunset uses the standard sunrise equation (≈1–2 minutes of accuracy, plenty
 * for planning) at the center of the metroplex.
 */
import { formatPlanDate, type PlanLang } from "@/lib/plan";

type L = { en: string; es: string };

const DFW = { lat: 32.7767, lon: -96.797 };
const RAD = Math.PI / 180;

/** Sunset (UTC instant) for a calendar date at a place. Null in polar edge cases. */
export function sunsetUtc(dateIso: string, lat = DFW.lat, lon = DFW.lon): Date | null {
  const [y, m, d] = dateIso.split("-").map(Number);
  const jd = Date.UTC(y, m - 1, d, 12) / 86_400_000 + 2_440_587.5;
  const n = Math.ceil(jd - 2_451_545.0 + 0.0008);
  const jStar = n - lon / 360;
  const M = (357.5291 + 0.98560028 * jStar) % 360;
  const C = 1.9148 * Math.sin(M * RAD) + 0.02 * Math.sin(2 * M * RAD) + 0.0003 * Math.sin(3 * M * RAD);
  const lambda = (M + C + 180 + 102.9372) % 360;
  const jTransit = 2_451_545.0 + jStar + 0.0053 * Math.sin(M * RAD) - 0.0069 * Math.sin(2 * lambda * RAD);
  const sinDecl = Math.sin(lambda * RAD) * Math.sin(23.4397 * RAD);
  const cosDecl = Math.cos(Math.asin(sinDecl));
  const cosW0 = (Math.sin(-0.833 * RAD) - Math.sin(lat * RAD) * sinDecl) / (Math.cos(lat * RAD) * cosDecl);
  if (cosW0 < -1 || cosW0 > 1) return null;
  const jSet = jTransit + Math.acos(cosW0) / RAD / 360;
  return new Date((jSet - 2_440_587.5) * 86_400_000);
}

/** Minutes after local midnight in Dallas for an instant. */
function dallasMinutes(t: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(t);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const min = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + min;
}

/** 1065 → "5:45 PM" (en) / "5:45 p. m." (es). Rounded to 5 minutes. */
export function clock(minutes: number, lang: PlanLang): string {
  const m = Math.round(minutes / 5) * 5;
  const h24 = Math.floor(m / 60) % 24;
  const mm = String(m % 60).padStart(2, "0");
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const pm = h24 >= 12;
  return lang === "es" ? `${h12}:${mm} ${pm ? "p. m." : "a. m."}` : `${h12}:${mm} ${pm ? "PM" : "AM"}`;
}

export type TimelineRow = { minutes: number; time: string; title: string; note: string };
export type ChecklistRow = { by: string; title: string; note: string; overdue: boolean };

export type QuinceTimeline = {
  dateLabel: string;
  sunset: string | null;
  /** Portraits before the reception (fall/winter) or a step outside during it. */
  portraitsDuringReception: boolean;
  day: TimelineRow[];
  checklist: ChecklistRow[];
};

/** Reception doors open at 7:00 PM in the template below. */
const RECEPTION_START = 19 * 60;

const DAY: { at: number; title: L; note: L }[] = [
  { at: 10 * 60, title: { en: "Hair & makeup", es: "Peinado y maquillaje" }, note: { en: "Leave 3 hours. Wear a button-up shirt so the dress goes on without touching her hair.", es: "Deja 3 horas. Usa una blusa de botones para no tocar el peinado al ponerse el vestido." } },
  { at: 13 * 60, title: { en: "Getting-ready photos", es: "Fotos arreglándose" }, note: { en: "Dress, shoes, jewelry, the last touches with mom. We arrive here.", es: "Vestido, zapatos, joyas, los últimos detalles con mamá. Aquí llegamos nosotros." } },
  { at: 14 * 60, title: { en: "La misa", es: "La misa" }, note: { en: "Most DFW churches allow photos from the aisle and the back; we check with your parish first.", es: "Casi todas las iglesias de DFW permiten fotos desde el pasillo y atrás; lo confirmamos con tu parroquia." } },
  { at: 15 * 60 + 15, title: { en: "Family photos at the church", es: "Fotos familiares en la iglesia" }, note: { en: "Padrinos, abuelos and the court, 20–30 minutes on the steps.", es: "Padrinos, abuelos y la corte, de 20 a 30 minutos en la entrada." } },
  { at: RECEPTION_START, title: { en: "Reception doors open", es: "Abren el salón" }, note: { en: "Guests arrive; detail photos of the decor before the room fills.", es: "Llegan los invitados; fotos de la decoración antes de que se llene el salón." } },
  { at: RECEPTION_START + 30, title: { en: "Grand entrance & presentation", es: "Entrada y presentación" }, note: { en: "The court first, then the quinceañera.", es: "Primero la corte, luego la quinceañera." } },
  { at: RECEPTION_START + 45, title: { en: "El vals", es: "El vals" }, note: { en: "The waltz with her chambelanes, then with her dad.", es: "El vals con sus chambelanes y después con su papá." } },
  { at: RECEPTION_START + 75, title: { en: "Dinner & the brindis", es: "Cena y brindis" }, note: { en: "Toasts right after the meal is served, while everyone is seated.", es: "El brindis justo después de servir la cena, mientras todos están sentados." } },
  { at: RECEPTION_START + 120, title: { en: "Shoes, last doll & crowning", es: "Zapatillas, última muñeca y coronación" }, note: { en: "The traditions, back to back, with the family close.", es: "Las tradiciones, una tras otra, con la familia cerca." } },
  { at: RECEPTION_START + 150, title: { en: "Baile sorpresa", es: "Baile sorpresa" }, note: { en: "Tell us the song ahead of time so we are in position.", es: "Avísanos la canción antes para estar en posición." } },
  { at: RECEPTION_START + 180, title: { en: "Open dance floor", es: "Pista abierta" }, note: { en: "The party. Candid photos of friends and family.", es: "La fiesta. Fotos espontáneas de amigos y familia." } },
  { at: 24 * 60 - 1, title: { en: "Last dance & send-off", es: "Último baile y despedida" }, note: { en: "", es: "" } },
];

/** Months/weeks before the event, worked back from their date. */
const CHECKLIST: { months?: number; days?: number; title: L; note: L }[] = [
  { months: 12, title: { en: "Book the venue, photo & video", es: "Reserva salón, foto y video" }, note: { en: "The Saturdays in DFW go first.", es: "Los sábados en DFW se llenan primero." } },
  { months: 9, title: { en: "Choose the court & the dress", es: "Elige la corte y el vestido" }, note: { en: "Dresses can take 4–6 months to arrive.", es: "Los vestidos tardan de 4 a 6 meses en llegar." } },
  { months: 6, title: { en: "Start vals & surprise-dance practice", es: "Empiecen a ensayar el vals y el baile sorpresa" }, note: { en: "Book the choreographer; pick the songs.", es: "Reserva al coreógrafo y escojan las canciones." } },
  { months: 3, title: { en: "Portrait session & invitations", es: "Sesión de retratos e invitaciones" }, note: { en: "A pre-quince session gives you photos for the invitations and the welcome sign.", es: "Una sesión antes de la fiesta te da fotos para las invitaciones y el letrero de bienvenida." } },
  { days: 42, title: { en: "Send the invitations", es: "Manda las invitaciones" }, note: { en: "Six weeks out; RSVPs two weeks before.", es: "Seis semanas antes; confirmaciones dos semanas antes." } },
  { days: 28, title: { en: "Final dress fitting & song list", es: "Última prueba del vestido y lista de canciones" }, note: { en: "Send the DJ the songs for each tradition.", es: "Mándale al DJ las canciones de cada tradición." } },
  { days: 14, title: { en: "Final timeline to every vendor", es: "Cronograma final a todos los proveedores" }, note: { en: "One shared schedule: church, venue, DJ, photo & video.", es: "Un solo horario para todos: iglesia, salón, DJ, foto y video." } },
  { days: 7, title: { en: "Confirm everyone", es: "Confirma con todos" }, note: { en: "Arrival times, addresses, the family photo list.", es: "Horas de llegada, direcciones y la lista de fotos familiares." } },
];

function shiftIso(dateIso: string, { months = 0, days = 0 }: { months?: number; days?: number }): string {
  const [y, m, d] = dateIso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1 - months, 1));
  const lastDay = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
  t.setUTCDate(Math.min(d, lastDay) - days);
  return t.toISOString().slice(0, 10);
}

/** The whole timeline for a date, in one language. `today` is "YYYY-MM-DD". */
export function buildQuinceTimeline(dateIso: string, lang: PlanLang, today: string): QuinceTimeline {
  const set = sunsetUtc(dateIso);
  const sunsetMin = set ? dallasMinutes(set) : null;
  // Golden hour falls before the reception from fall to early spring in DFW.
  const duringReception = sunsetMin !== null && sunsetMin > RECEPTION_START - 30;

  const rows: { at: number; title: string; note: string }[] = DAY.map((r) => ({ at: r.at, title: r.title[lang], note: r.note[lang] }));
  if (sunsetMin !== null) {
    if (duringReception) {
      rows.push({
        at: sunsetMin - 30,
        title: lang === "es" ? "Retratos al atardecer (15 min afuera)" : "Sunset portraits (15 min outside)",
        note:
          lang === "es"
            ? `El sol se pone a las ${clock(sunsetMin, lang)}. Salimos un momento con ella durante la cena; nadie se pierde nada.`
            : `Sunset is ${clock(sunsetMin, lang)}. We step out with her for a few minutes during dinner; nobody misses a thing.`,
      });
    } else {
      rows.push({
        at: Math.max(15 * 60 + 45, sunsetMin - 60),
        title: lang === "es" ? "Retratos en la hora dorada" : "Golden-hour portraits",
        note:
          lang === "es"
            ? `El sol se pone a las ${clock(sunsetMin, lang)}. La mejor luz es la hora antes; buen momento para un parque o el salón antes de abrir.`
            : `Sunset is ${clock(sunsetMin, lang)}. The best light is the hour before, a good time for a park or the venue before doors open.`,
      });
    }
  }
  rows.sort((a, b) => a.at - b.at);

  return {
    dateLabel: formatPlanDate(dateIso, lang),
    sunset: sunsetMin !== null ? clock(sunsetMin, lang) : null,
    portraitsDuringReception: duringReception,
    day: rows.map((r) => ({ minutes: r.at, time: clock(r.at, lang), title: r.title, note: r.note })),
    checklist: CHECKLIST.map((c) => {
      const by = shiftIso(dateIso, c);
      const overdue = by < today;
      return {
        by: overdue ? (lang === "es" ? "Lo antes posible" : "As soon as you can") : formatPlanDate(by, lang, { weekday: false }),
        title: c.title[lang],
        note: c.note[lang],
        overdue,
      };
    }),
  };
}
