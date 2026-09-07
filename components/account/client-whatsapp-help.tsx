"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { TrackedWhatsAppLink } from "@/components/public/tracked-whatsapp-link";

function messageForPath(pathname: string) {
  if (pathname.startsWith("/cuenta/iniciar-tramite")) return "Hola, necesito ayuda con mi trámite en TramitexFederal. Estoy en el proceso de iniciar un trámite.";
  if (pathname.startsWith("/cuenta/mis-tramites")) return "Hola, necesito ayuda para revisar o continuar uno de mis trámites en TramitexFederal.";
  if (pathname.startsWith("/cuenta/documentos")) return "Hola, necesito ayuda con los documentos de mi trámite en TramitexFederal.";
  if (pathname.startsWith("/cuenta/soporte")) return "Hola, necesito apoyo con mi cuenta o trámite en TramitexFederal.";
  return "Hola, necesito ayuda con mi trámite en TramitexFederal.";
}

export function ClientWhatsAppHelp() {
  const pathname = usePathname();
  return (
    <TrackedWhatsAppLink
      source="client-help"
      message={messageForPath(pathname)}
      context={{ area: "panel-cliente" }}
      target="_blank"
      rel="noreferrer"
      aria-label="Solicitar ayuda por WhatsApp"
      title="Solicitar ayuda por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-[0_12px_32px_rgba(15,23,42,.25)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,.3)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366] sm:bottom-6 sm:right-6"
    >
      <MessageCircle size={20} aria-hidden="true" />
      <span className="hidden sm:inline">¿Necesitas ayuda?</span>
    </TrackedWhatsAppLink>
  );
}
