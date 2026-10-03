import type { Metadata } from "next";
import { ConfirmationPage } from "@/components/ConfirmationPage";

export const metadata: Metadata = {
  title: "Gracias por tu Consulta",
  description: "Recibimos tu consulta sobre su quinceañera.",
  robots: { index: false, follow: false },
};

export default function GraciasPage() {
  return (
    <ConfirmationPage eyebrow="Consulta recibida" title="Gracias. Pronto estaremos en contacto." primaryLabel="Ver portafolio" homeLabel="Volver al inicio" homeHref="/es" contactLabel="¿No llegó el correo? Escríbenos a">
      <p>Revisaremos si la fecha está disponible y responderemos tus preguntas personalmente. Revisa tu correo para ver nuestra respuesta.</p>
    </ConfirmationPage>
  );
}
