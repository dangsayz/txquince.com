/**
 * esign-consent.ts — the consent to sign electronically, shown to the family
 * on the sign step and printed on the contract PDF's signature record page.
 * Kept apart from contract-pdf.ts so the browser can show it without loading
 * the PDF library. Bump `version` whenever the wording changes.
 */
export const ESIGN_CONSENT: { version: string; en: string; es: string } = {
  version: "2026-10-14",
  en: [
    "You can sign this agreement on your phone or computer instead of on paper. Here is what that means:",
    "• The name you type and the signature you draw count the same as signing with a pen.",
    "• We will send your agreement and other booking papers to your email. If your email changes, just tell us.",
    "• Want a paper copy? Just ask and we will mail you one. It's free.",
    "• You can change your mind any time before you sign. Just don't sign, and let us know by email or text. We'll find another way, like signing on paper.",
    "• To open your agreement, you need a phone, tablet or computer that can open PDF files (most can). To keep a copy, save it or print it.",
    "Saying yes here means you agree to sign electronically and to get your papers by email.",
  ].join("\n"),
  es: [
    "Puedes firmar este contrato en tu celular o computadora en lugar de en papel. Esto es lo que significa:",
    "• El nombre que escribes y la firma que dibujas valen igual que firmar con pluma.",
    "• Te enviaremos tu contrato y otros papeles de tu reservación a tu correo electrónico. Si cambias de correo, solo avísanos.",
    "• ¿Quieres una copia en papel? Solo pídela y te la enviamos por correo. Es gratis.",
    "• Puedes cambiar de opinión en cualquier momento antes de firmar. Solo no firmes y avísanos por correo o mensaje de texto. Buscaremos otra forma, como firmar en papel.",
    "• Para abrir tu contrato necesitas un celular, tableta o computadora que abra archivos PDF (casi todos lo hacen). Para quedarte con una copia, guárdala o imprímela.",
    "Al decir que sí aquí, aceptas firmar electrónicamente y recibir tus papeles por correo electrónico.",
  ].join("\n"),
};
