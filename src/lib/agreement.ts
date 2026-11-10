/**
 * agreement.ts — the booking agreement a family signs on the homepage.
 *
 * Built from exactly what they picked (package, hours, team, extras) and
 * written in plain words, in their language. The rendered text is stored on
 * the booking at signing time (with AGREEMENT_VERSION), so editing this file
 * later never changes an agreement someone already signed.
 *
 * Pure and isomorphic: the intake renders it for review with the price book
 * the page was served, the API re-builds it server-side from its own live
 * book (never trusting client text), and the admin, email and pay pages show
 * the stored snapshot — including the deposit %, balance-due days and hold
 * days it was signed under, so a later price change never touches it.
 */
import { addOnAllowed,
  COORDINATOR_INCLUDED,
  normalizeCrew,
  quoteCommission,
  usd,
  type AddOnId,
  type Crew,
  type PriceBook,
  type TierId,
} from "@/lib/commission";
import { tierNameL, ADD_ONS, matrixFor, type Lang } from "@/components/txq/data";
import { fillDeep } from "@/lib/price-text";
import { tidyName } from "@/lib/person-name";

/** Bump when the wording below changes; stored with every signature. */
export const AGREEMENT_VERSION = "2026-11-10.1";

export type AgreementInput = {
  lang: Lang;
  tier: TierId;
  hours?: number | null;
  crew?: Partial<Crew> | null;
  addOns: AddOnId[];
  eventDate: string; // YYYY-MM-DD
  cityLabel: string;
  venue: string;
  startTime: string;
  honoree: string;
  name: string;
  email: string;
  phone: string;
  sharePermission: boolean;
};

export type AgreementSection = { title: string; lines: string[] };
export type Agreement = {
  version: string;
  lang: Lang;
  title: string;
  intro: string;
  sections: AgreementSection[];
  totalUsd: number;
  depositUsd: number;
  balanceUsd: number;
  /** Terms it was signed under (absent on agreements signed before 2026-10-14.2: 25% / 48 hours / 7 days). */
  depositPercent?: number;
  balanceDueDays?: number;
  holdDays?: number;
};

const T = {
  en: {
    title: "TX Quince Booking Agreement",
    intro: (name: string, honoree: string) =>
      `This agreement is between TX Quince ("we") and ${name} ("you")${honoree ? ` for ${honoree}'s quinceañera` : " for the quinceañera"}. Please read it, then sign at the bottom.`,
    event: "Your event",
    date: "Date",
    city: "Area",
    venue: "Venue",
    venueTbd: "To be confirmed",
    start: "Start time",
    startTbd: "To be confirmed",
    pkg: "Your package",
    hours: (h: number, base: number) =>
      h > base ? `${h} hours on the day (${base} included + ${h - base} extra)` : `${h} ${h === 1 ? "hour" : "hours"} on the day`,
    hoursArchive: (h: number) => `${h} hours on the celebration day, plus a second day for portraits`,
    team: (p: number, v: number) =>
      `Your team: ${p} ${p === 1 ? "photographer" : "photographers"}${v ? ` and ${v} ${v === 1 ? "videographer" : "videographers"}` : ""}`,
    coordinator: "A coordinator who runs the day is included",
    includes: "What you get",
    extras: "Extras you added",
    noExtras: "No extras",
    money: "Price and payments",
    pkgPrice: "Package",
    extraHours: (n: number) => `Extra ${n === 1 ? "hour" : "hours"} (${n})`,
    total: "Total",
    deposit: (amt: string, pct: number) =>
      `Deposit: ${amt} (${pct}%). You pay it after we approve this agreement. It locks in your date and goes toward your total.`,
    balance: (amt: string, days: number) => `The rest: ${amt}, due ${days} ${days === 1 ? "day" : "days"} before the event.`,
    tax: "Texas sales tax, and travel outside Dallas–Fort Worth, Houston, Austin and San Antonio, are quoted separately if they apply.",
    how: "How booking works",
    howLines: (days: number) => [
      `When you sign, we hold your date for ${days} days while we review your booking.`,
      "When we approve it, we email you a link to pay your deposit.",
      "Your booking is final once your deposit is paid.",
      "If we can't take your date, we'll let you know and you won't be charged anything.",
    ],
    changes: "Changes and cancellations",
    changesLines: [
      "Want more hours or an extra later? Just ask — if we're available, we'll add it and update your total.",
      "Need a new date? Ask us as early as you can. If we are open on the new date, your deposit moves with it one time. If we are not, the cancellation rule below applies.",
      "If you cancel, your deposit is not refundable, because we save your date and turn other families away.",
      "If you cancel after the rest was due, nothing you paid is refunded.",
      "If you cancel on the day of the event or the day before, for any reason, nothing you paid is refunded. A new date is a new booking.",
      "If the event can't happen because of something outside anyone's control (a storm, a venue closing, an emergency order), we move your booking to a new date we both agree on. The deposit is not refunded.",
      "If we ever have to cancel, we refund everything you've paid.",
    ],
    pay: "Late payments and disputes",
    payLines: [
      "The rest is due on the date in this agreement. If it is not paid by then, we may release your date and keep what you have paid.",
      "If the rest is not paid in full before the event, our crew does not come. What you paid is kept.",
      "If you pay with Klarna, Afterpay or Affirm, your payment plan is between you and that company. It does not change what you owe us.",
      "If you have a problem, tell us first and give us 14 days to fix it.",
      "Disputing a charge with your bank or payment company for a date we held or work we did breaks this agreement. You then owe that amount again, plus any fee the bank charges us.",
      "A refund, when one applies, goes back the same way you paid.",
    ],
    day: "Your part on the day",
    dayLines: [
      "One adult is our contact on the day. Our crew takes direction from that person only.",
      "You are responsible for your guests, including children. If a guest damages or loses our equipment, you pay the full cost to repair or replace it.",
      "Tell us in writing before the event about any other photographer or videographer, hired or a friend. If one works the event without our OK, we may stop coverage and keep what you have paid. Guests using phones is fine.",
      "If we work more than 4 hours, you give each crew member a meal and a 30-minute break. With no meal, the crew takes a 30-minute break away from the event, and that time is not added back.",
      "You make sure we are allowed to work at your venue, church and photo locations. Any fee, permit or parking they charge is yours to pay.",
      "If a guest is drunk, aggressive, or touches our crew or our equipment, we tell your contact adult one time. If it happens again, we pack up and leave. There is no refund.",
      "If a crew member is threatened or in danger, we leave right away. There is no refund.",
    ],
    time: "Time and schedule",
    timeLines: [
      "Coverage starts at the start time we confirm with you and runs for the hours in your package, in one block.",
      "Time lost because the family, a vendor or the venue runs late is not added back.",
      "Extra time on the day only happens if the crew can stay, and it is billed at our extra-hour price.",
      "The date, times and addresses you give us must be right. Problems caused by wrong details are not ours to refund.",
    ],
    limits: "What we can and can't promise",
    limitsLines: [
      "We photograph and film the day as it happens. We can't promise one specific photo, pose, guest or moment.",
      "We are not responsible for moments missed because of venue or church rules, poor light, weather, a late schedule, or people blocking the camera.",
      "The editing style, the music and which photos we deliver are our creative choice. You get the edited photos and films listed in your package. Unedited photos and raw video are not included unless your package lists them.",
      "If you find a mistake in what we deliver, tell us within 14 days of getting it and we will fix it. We do not re-edit for a change of taste.",
      "After we deliver, keeping your files safe and backed up is your job. We do not promise to keep a copy. If we still have your files we may send them again, but we do not have to.",
      "If a crew member is sick or has an emergency, we send another member of our team. If we can't cover your date at all, we refund everything you paid.",
      "If our equipment fails or files are lost, we refund a fair share of what you paid for the missing part. The most we can ever owe you, for any reason, is the total you paid us.",
    ],
    delivery: "When you get your photos and videos",
    deliveryLines: [
      "Your gallery and films arrive between 30 and 90 days after the event. Any day in that window is on time.",
      "We edit in the order the events happened. In busy seasons, expect closer to 90 days.",
      "We email you the day they are ready. You do not need to ask.",
      "There is no rush delivery.",
      "If your package has a printed album, you have 30 days after your gallery arrives to pick the photos. After 30 days, we pick them and print it.",
      "Asking early does not move your place in line. Before day 90, the answer to \"when?\" is this section. If day 90 passes, write to us and we will give you a date.",
      "Be kind to our team, in person and in messages. Threats, insults, or message after message pressing for early delivery are harassment. If that happens we answer by email only, and we still deliver on the schedule above.",
    ],
    fine: "The fine print",
    fineLines: [
      "If you are unhappy with something, both sides agree to talk it through in writing first, before any other step.",
      "You are at least 18, and you are the parent, the legal guardian or the person paying, with the right to sign this.",
      "This agreement is the whole deal. A promise made by text, call or social media only counts once we write it into your booking.",
      "If one part of this agreement can't be enforced, the rest still applies. Texas law applies to this agreement.",
    ],
    teamSolo: "Your team: 1 hybrid shooter taking photos and video at the same time, with a {{cameras.solo}} camera setup",
    crew: "Who covers your day",
    crewLines: [
      "Your day is covered by TX Quince's small in-house crew of photographers and videographers, sometimes with Dang or Yvonne, the owners, behind the camera. The studio puts the crew together for each date.",
      "Every gallery and film is edited by the owners.",
      "We choose the crew. Who comes, the owners or the team, is not a reason to cancel, get a refund or dispute a charge.",
    ],
    media: "Your photos and videos",
    mediaLines: (share: boolean) => [
      "Everything we deliver is yours to keep, print and share with family and friends.",
      "We own the copyright. Your photos and videos are for personal use. You may not sell them or let a business use them without our written OK.",
      share
        ? "You're okay with us sharing some of your photos and videos on our website and social media."
        : "We will not share your photos or videos publicly.",
    ],
  },
  es: {
    title: "Contrato de reservación de TX Quince",
    intro: (name: string, honoree: string) =>
      `Este contrato es entre TX Quince ("nosotros") y ${name} ("tú")${honoree ? ` para la quinceañera de ${honoree}` : " para la quinceañera"}. Léelo y luego firma al final.`,
    event: "Tu evento",
    date: "Fecha",
    city: "Zona",
    venue: "Salón",
    venueTbd: "Por confirmar",
    start: "Hora de inicio",
    startTbd: "Por confirmar",
    pkg: "Tu paquete",
    hours: (h: number, base: number) =>
      h > base ? `${h} horas el día del evento (${base} incluidas + ${h - base} extra)` : `${h} ${h === 1 ? "hora" : "horas"} el día del evento`,
    hoursArchive: (h: number) => `${h} horas el día de la celebración, más un segundo día para retratos`,
    team: (p: number, v: number) =>
      `Tu equipo: ${p} ${p === 1 ? "fotógrafo" : "fotógrafos"}${v ? ` y ${v} ${v === 1 ? "videógrafo" : "videógrafos"}` : ""}`,
    coordinator: "Incluye una coordinadora que lleva el día",
    includes: "Lo que recibes",
    extras: "Extras que añadiste",
    noExtras: "Sin extras",
    money: "Precio y pagos",
    pkgPrice: "Paquete",
    extraHours: (n: number) => `${n === 1 ? "Hora extra" : "Horas extra"} (${n})`,
    total: "Total",
    deposit: (amt: string, pct: number) =>
      `Depósito: ${amt} (${pct}%). Lo pagas después de que aprobemos este contrato. Aparta tu fecha y se abona a tu total.`,
    balance: (amt: string, days: number) => `El resto: ${amt}, se paga ${days} ${days === 1 ? "día" : "días"} antes del evento.`,
    tax: "El impuesto de Texas, y los viajes fuera de Dallas–Fort Worth, Houston, Austin y San Antonio, se cotizan aparte si aplican.",
    how: "Cómo funciona la reservación",
    howLines: (days: number) => [
      `Cuando firmas, apartamos tu fecha por ${days} días mientras revisamos tu reservación.`,
      "Cuando la aprobamos, te enviamos por correo un enlace para pagar tu depósito.",
      "Tu reservación queda confirmada en cuanto pagas el depósito.",
      "Si no podemos tomar tu fecha, te avisamos y no se te cobra nada.",
    ],
    changes: "Cambios y cancelaciones",
    changesLines: [
      "¿Quieres más horas o un extra después? Solo pídelo — si estamos disponibles, lo añadimos y actualizamos tu total.",
      "¿Necesitas otra fecha? Avísanos lo antes posible. Si tenemos libre la nueva fecha, tu depósito se pasa a ella una sola vez. Si no, aplica la regla de cancelación de abajo.",
      "Si cancelas, el depósito no es reembolsable, porque apartamos tu fecha y rechazamos a otras familias.",
      "Si cancelas después de la fecha límite para pagar el resto, no se reembolsa nada de lo que pagaste.",
      "Si cancelas el día del evento o el día anterior, por cualquier motivo, no se reembolsa nada de lo que pagaste. Una nueva fecha es una nueva reservación.",
      "Si el evento no puede hacerse por algo fuera del control de todos (una tormenta, el cierre del salón, una orden de emergencia), pasamos tu reservación a una nueva fecha que acordemos. El depósito no se reembolsa.",
      "Si nosotros tuviéramos que cancelar, te devolvemos todo lo que hayas pagado.",
    ],
    pay: "Pagos atrasados y disputas",
    payLines: [
      "El resto se paga en la fecha de este contrato. Si no está pagado para entonces, podemos liberar tu fecha y quedarnos con lo que hayas pagado.",
      "Si el resto no está pagado por completo antes del evento, nuestro equipo no asiste. Lo que pagaste no se reembolsa.",
      "Si pagas con Klarna, Afterpay o Affirm, tu plan de pagos es entre tú y esa compañía. No cambia lo que nos debes.",
      "Si tienes un problema, dínoslo primero y danos 14 días para resolverlo.",
      "Disputar un cargo con tu banco o compañía de pagos por una fecha que apartamos o por trabajo que hicimos rompe este contrato. En ese caso debes esa cantidad otra vez, más cualquier cargo que el banco nos cobre.",
      "Un reembolso, cuando aplica, regresa por el mismo medio con el que pagaste.",
    ],
    day: "Tu parte el día del evento",
    dayLines: [
      "Un adulto es nuestro contacto ese día. Nuestro equipo recibe indicaciones solo de esa persona.",
      "Tú eres responsable de tus invitados, incluidos los niños. Si un invitado daña o pierde nuestro equipo, tú pagas el costo completo de repararlo o reponerlo.",
      "Avísanos por escrito antes del evento si habrá otro fotógrafo o videógrafo, contratado o amigo. Si alguno trabaja en el evento sin nuestra aprobación, podemos detener la cobertura y quedarnos con lo que hayas pagado. Los invitados pueden usar sus celulares.",
      "Si trabajamos más de 4 horas, le das a cada persona del equipo una comida y un descanso de 30 minutos. Si no hay comida, el equipo toma un descanso de 30 minutos fuera del evento, y ese tiempo no se repone.",
      "Tú te aseguras de que podamos trabajar en tu salón, iglesia y lugares de fotos. Cualquier cuota, permiso o estacionamiento que cobren lo pagas tú.",
      "Si un invitado está borracho, agresivo, o toca a nuestro equipo o nuestras cámaras, se lo decimos una vez a tu adulto de contacto. Si vuelve a pasar, guardamos todo y nos vamos. No hay reembolso.",
      "Si alguien del equipo es amenazado o corre peligro, nos vamos de inmediato. No hay reembolso.",
    ],
    time: "Horario",
    timeLines: [
      "La cobertura empieza a la hora que confirmemos contigo y dura las horas de tu paquete, en un solo bloque.",
      "El tiempo que se pierde porque la familia, un proveedor o el salón se atrasan no se repone.",
      "El tiempo extra ese día solo es posible si el equipo puede quedarse, y se cobra a nuestro precio por hora extra.",
      "La fecha, las horas y las direcciones que nos das deben ser correctas. No reembolsamos problemas causados por datos equivocados.",
    ],
    limits: "Lo que podemos y no podemos prometer",
    limitsLines: [
      "Fotografiamos y grabamos el día tal como sucede. No podemos prometer una foto, pose, invitado o momento en particular.",
      "No somos responsables de momentos que se pierdan por reglas del salón o la iglesia, poca luz, el clima, atrasos en el horario o personas que tapen la cámara.",
      "El estilo de edición, la música y cuáles fotos entregamos son nuestra decisión creativa. Recibes las fotos editadas y los videos de tu paquete. Las fotos sin editar y el video crudo no están incluidos, a menos que tu paquete lo diga.",
      "Si encuentras un error en lo que entregamos, avísanos en los 14 días después de recibirlo y lo corregimos. No volvemos a editar por un cambio de gusto.",
      "Después de la entrega, guardar y respaldar tus archivos es tu responsabilidad. No prometemos conservar una copia. Si todavía tenemos tus archivos podemos enviarlos otra vez, pero no estamos obligados.",
      "Si alguien del equipo se enferma o tiene una emergencia, mandamos a otra persona de nuestro equipo. Si no podemos cubrir tu fecha, te devolvemos todo lo que pagaste.",
      "Si nuestro equipo falla o se pierden archivos, te devolvemos una parte justa de lo que pagaste por lo que falte. Lo máximo que podemos deberte, por cualquier motivo, es el total que nos pagaste.",
    ],
    delivery: "Cuándo recibes tus fotos y videos",
    deliveryLines: [
      "Tu galería y tus videos llegan entre 30 y 90 días después del evento. Cualquier día dentro de ese plazo es a tiempo.",
      "Editamos en el orden en que fueron los eventos. En temporada alta, espera más cerca de los 90 días.",
      "Te escribimos por correo el día que estén listos. No necesitas preguntar.",
      "No hay entrega urgente.",
      "Si tu paquete incluye álbum impreso, tienes 30 días después de recibir tu galería para elegir las fotos. Pasados los 30 días, las elegimos nosotros y lo imprimimos.",
      "Preguntar antes no adelanta tu lugar en la fila. Antes del día 90, la respuesta a \"¿cuándo?\" es esta sección. Si pasa el día 90, escríbenos y te damos una fecha.",
      "Trata bien a nuestro equipo, en persona y por mensaje. Las amenazas, los insultos o mensaje tras mensaje exigiendo una entrega adelantada son acoso. Si eso pasa, contestamos solo por correo, y entregamos en el plazo de arriba.",
    ],
    fine: "La letra chica",
    fineLines: [
      "Si algo no te gusta, las dos partes acordamos hablarlo primero por escrito, antes de cualquier otro paso.",
      "Tienes al menos 18 años y eres la madre, el padre, el tutor legal o la persona que paga, con derecho a firmar esto.",
      "Este contrato es el acuerdo completo. Una promesa hecha por mensaje, llamada o redes sociales solo cuenta cuando la escribimos en tu reservación.",
      "Si una parte de este contrato no se puede hacer valer, el resto sigue vigente. Este contrato se rige por las leyes de Texas.",
    ],
    teamSolo: "Tu equipo: 1 fotógrafo y videógrafo en uno, que toma fotos y graba al mismo tiempo con {{cameras.solo}} cámaras",
    crew: "Quién cubre tu día",
    crewLines: [
      "Tu día lo cubre el pequeño equipo de casa de TX Quince, de fotógrafos y videógrafos, a veces con Dang o Yvonne, los dueños, detrás de la cámara. El estudio arma el equipo para cada fecha.",
      "Cada galería y cada video lo editan los dueños.",
      "Nosotros elegimos al equipo. Quién asista, los dueños o el equipo, no es motivo para cancelar, pedir reembolso o disputar un cargo.",
    ],
    media: "Tus fotos y videos",
    mediaLines: (share: boolean) => [
      "Todo lo que te entregamos es tuyo para guardar, imprimir y compartir con familia y amigos.",
      "Los derechos de autor son nuestros. Tus fotos y videos son para uso personal. No puedes venderlos ni dejar que un negocio los use sin nuestro permiso por escrito.",
      share
        ? "Estás de acuerdo con que compartamos algunas de tus fotos y videos en nuestra página y redes sociales."
        : "No compartiremos tus fotos ni videos públicamente.",
    ],
  },
} as const;

function longDate(iso: string, lang: Lang) {
  const d = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat(lang === "es" ? "es-MX" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function buildAgreement(input: AgreementInput, book: PriceBook): Agreement {
  // Wording carries live tokens (the Solo's camera count): fill from the same book.
  const t = fillDeep(T[input.lang], book);
  const q = quoteCommission(book, input.tier, input.addOns, input.hours);
  const crew = normalizeCrew(input.tier, input.crew);
  const base = q.baseHours;
  const extraHours = q.hours - base;
  // Same rule as the quote: an extra the package doesn't offer is never listed (or charged).
  const extras = ADD_ONS.filter((a) => input.addOns.includes(a.id) && addOnAllowed(input.tier, a.id));

  const includes = matrixFor(book).flatMap((g) =>
    g.rows
      .filter((r) => r.values[input.tier] && !/hours|horas|team|equipo|coordinat/i.test(r.label.en))
      // "Add … for $X" cells (the Solo's highlight film) are offers, not inclusions; a chosen one is listed under extras.
      .filter((r) => !/^add\b/i.test(r.values[input.tier]!.en))
      .map((r) => `${r.label[input.lang]}: ${r.values[input.tier]![input.lang]}`),
  );

  const sections: AgreementSection[] = [
    {
      title: t.event,
      lines: [
        `${t.date}: ${longDate(input.eventDate, input.lang)}`,
        `${t.city}: ${input.cityLabel}`,
        `${t.venue}: ${input.venue || t.venueTbd}`,
        `${t.start}: ${input.startTime || t.startTbd}`,
      ],
    },
    {
      title: `${t.pkg}: ${tierNameL(book, input.tier)[input.lang]}`,
      lines: [
        input.tier === "archive" ? t.hoursArchive(q.hours) : t.hours(q.hours, base),
        input.tier === "solo" ? t.teamSolo : t.team(crew.photo, crew.motion),
        ...(COORDINATOR_INCLUDED[input.tier] ? [t.coordinator] : []),
      ],
    },
    { title: t.includes, lines: includes },
    {
      title: t.extras,
      lines: extras.length ? extras.map((a) => `${a.name[input.lang]} — ${usd(book.addOns[a.id])}`) : [t.noExtras],
    },
    {
      title: t.money,
      lines: [
        `${t.pkgPrice}: ${usd(q.tierUsd)}`,
        ...(extraHours > 0 ? [`${t.extraHours(extraHours)}: ${usd(q.extraHoursUsd)}`] : []),
        ...(extras.length ? [`${t.extras}: ${usd(q.addOnsUsd)}`] : []),
        `${t.total}: ${usd(q.totalUsd)}`,
        t.deposit(usd(q.retainerUsd), q.depositPercent),
        t.balance(usd(q.balanceUsd), book.balanceDueDays),
        t.tax,
      ],
    },
    { title: t.how, lines: [...t.howLines(book.holdDays)] },
    { title: t.crew, lines: [...t.crewLines] },
    { title: t.day, lines: [...t.dayLines] },
    { title: t.time, lines: [...t.timeLines] },
    { title: t.delivery, lines: [...t.deliveryLines] },
    { title: t.limits, lines: [...t.limitsLines] },
    { title: t.changes, lines: [...t.changesLines] },
    { title: t.pay, lines: [...t.payLines] },
    { title: t.media, lines: [...t.mediaLines(input.sharePermission)] },
    { title: t.fine, lines: [...t.fineLines] },
  ];

  return {
    version: AGREEMENT_VERSION,
    lang: input.lang,
    title: t.title,
    intro: t.intro(tidyName(input.name), tidyName(input.honoree)),
    sections,
    totalUsd: q.totalUsd,
    depositUsd: q.retainerUsd,
    balanceUsd: q.balanceUsd,
    depositPercent: q.depositPercent,
    balanceDueDays: book.balanceDueDays,
    holdDays: book.holdDays,
  };
}

/**
 * When the rest is due, in the words of the agreement the family SIGNED —
 * never the current book. Older agreements predate the days rule and said 48 hours.
 */
export function signedBalanceDue(a: Pick<Agreement, "balanceDueDays">, lang: Lang): string {
  if (typeof a.balanceDueDays === "number") {
    const d = a.balanceDueDays;
    return lang === "es" ? `${d} ${d === 1 ? "día" : "días"}` : `${d} ${d === 1 ? "day" : "days"}`;
  }
  return lang === "es" ? "48 horas" : "48 hours";
}

/** Deposit percent the family signed for (older agreements: 25%). */
export function signedDepositPercent(a: Pick<Agreement, "depositPercent">): number {
  return typeof a.depositPercent === "number" ? a.depositPercent : 25;
}

/** Plain-text rendering for emails and the stored snapshot. */
export function agreementToText(a: Pick<Agreement, "title" | "intro" | "sections">): string {
  return [
    a.title,
    "",
    a.intro,
    ...a.sections.flatMap((s) => ["", s.title.toUpperCase(), ...s.lines.map((l) => `• ${l}`)]),
  ].join("\n");
}

/** What gets saved on the booking (metadata.agreement) when a family signs. */
export type SignedAgreement = Agreement & {
  signedName: string;
  /** PNG data URL of the drawn signature. */
  signature: string;
  signedAt: string;
  ip: string;
  userAgent: string;
  sharePermission: boolean;
  /** Set when the studio approves; the token unlocks the family's pay page. */
  approvedAt?: string;
  payToken?: string;
};

export function isSignedAgreement(v: unknown): v is SignedAgreement {
  return Boolean(
    v &&
      typeof v === "object" &&
      typeof (v as SignedAgreement).signedName === "string" &&
      Array.isArray((v as SignedAgreement).sections),
  );
}

/** Constant-time check of the pay-link token from the approval email. */
export function tokenMatches(expected: string | undefined, given: string | undefined | null): boolean {
  if (!expected || !given || expected.length !== given.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}
