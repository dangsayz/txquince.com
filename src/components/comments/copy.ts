export type CommentLang = "en" | "es";

export const COPY = {
  en: {
    soon: "Comments open soon.",
    gate: "Log in to leave a comment. It's free.",
    logIn: "Log in to comment",
    signUp: "Create account",
    shared: "We send a 6-digit code to your email. No password to remember.",
    label: "What would you like to ask or add?",
    startWith: "Start with",
    starters: {
      cost: { label: "A question about cost", text: "A question about cost: " },
      planning: { label: "A question about planning", text: "A question about planning: " },
      traditions: { label: "A question about this tradition", text: "A question about this tradition: " },
      film: { label: "A question about photos or video", text: "A question about photos and video: " },
      locations: { label: "A question about this location", text: "A question about this location: " },
      date: { label: "A question about my date", text: "A question about my date: " },
      tip: { label: "What worked for us", text: "What worked for us: " },
    },
    placeholder: "Ask a question…",
    postingAs: (n: string) => `Commenting as ${n}`,
    submit: "Post comment",
    sending: "Sending…",
    review: "Your comment goes to our team first. It shows on this page after we approve it.",
    thanks: "Thank you! Your comment will show here once we approve it.",
    another: "Write another",
    expired: "Your login timed out. Please log in again.",
    error: "Could not send. Please try again.",
    loading: "Loading…",
    pick: "Comment on this",
    railTitle: "Ask about this post",
    about: "About",
    removeQuote: "Remove the highlighted passage",
    tip: "Tip: highlight any sentence in the post to ask about it.",
  },
  es: {
    soon: "Los comentarios abren pronto.",
    gate: "Entra para dejar un comentario. Es gratis.",
    logIn: "Entra para comentar",
    signUp: "Crear cuenta",
    shared: "Te enviamos un código de 6 dígitos a tu correo. Sin contraseña que recordar.",
    label: "¿Qué quieres preguntar o agregar?",
    startWith: "Empieza con",
    starters: {
      cost: { label: "Una pregunta sobre el costo", text: "Una pregunta sobre el costo: " },
      planning: { label: "Una pregunta sobre la planeación", text: "Una pregunta sobre la planeación: " },
      traditions: { label: "Una pregunta sobre esta tradición", text: "Una pregunta sobre esta tradición: " },
      film: { label: "Una pregunta sobre fotos o video", text: "Una pregunta sobre fotos y video: " },
      locations: { label: "Una pregunta sobre este lugar", text: "Una pregunta sobre este lugar: " },
      date: { label: "Una pregunta sobre mi fecha", text: "Una pregunta sobre mi fecha: " },
      tip: { label: "Lo que nos funcionó", text: "Lo que nos funcionó: " },
    },
    placeholder: "Haz una pregunta…",
    postingAs: (n: string) => `Comentas como ${n}`,
    submit: "Publicar comentario",
    sending: "Enviando…",
    review: "Tu comentario llega primero a nuestro equipo. Aparece en esta página cuando lo aprobamos.",
    thanks: "¡Gracias! Tu comentario aparecerá aquí cuando lo aprobemos.",
    another: "Escribir otro",
    expired: "Tu sesión expiró. Vuelve a entrar.",
    error: "No se pudo enviar. Intenta de nuevo.",
    loading: "Cargando…",
    pick: "Comentar esto",
    railTitle: "Pregunta sobre esta publicación",
    about: "Sobre",
    removeQuote: "Quitar el texto resaltado",
    tip: "Consejo: resalta cualquier frase de la publicación para preguntar sobre ella.",
  },
} as const;

export type CommentTopic = "cost" | "planning" | "traditions" | "film" | "locations";

/** Three ways to begin a comment: one about this post's topic, then two that fit any post. */
export function startersFor(lang: CommentLang, topic?: CommentTopic | null) {
  const s = COPY[lang].starters;
  return [...(topic ? [s[topic]] : []), s.date, s.tip];
}
