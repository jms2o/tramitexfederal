import { TrackedWhatsAppLink } from "@/components/public/tracked-whatsapp-link";

export function WhatsAppBubble() {
  return (
    <TrackedWhatsAppLink
      source="floating-bubble"
      target="_blank"
      rel="noreferrer"
      aria-label="Hablar con un asesor por WhatsApp"
      title="Hablar con un asesor por WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(15,23,42,.24)] transition duration-200 hover:-translate-y-1 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366] sm:bottom-6 sm:right-6 sm:size-16"
    >
      <svg aria-hidden="true" viewBox="0 0 32 32" className="size-8 sm:size-9" fill="none">
        <path d="M16 4.5a11.5 11.5 0 0 0-9.96 17.25L4.5 27.5l5.88-1.5A11.5 11.5 0 1 0 16 4.5Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M11.1 10.35c.28-.62.57-.64.84-.65h.72c.23 0 .52.05.72.51.2.47.75 1.82.82 1.95.07.14.11.3.02.47-.09.16-.14.26-.28.42-.14.16-.29.35-.42.47-.14.14-.28.29-.12.56.16.28.72 1.19 1.55 1.93 1.07.95 1.97 1.25 2.25 1.39.28.14.44.12.61-.07.16-.19.7-.82.89-1.1.19-.28.37-.23.63-.14.26.09 1.62.77 1.9.91.28.14.47.21.54.33.07.12.07.7-.16 1.38-.23.68-1.34 1.3-1.84 1.39-.49.09-1.12.13-1.81-.1-.42-.14-.96-.31-1.65-.61-.73-.32-3.2-1.18-5.44-4.12-.63-.82-1.07-1.75-1.19-2.03-.12-.28-.02-1.31.19-1.68.21-.37.46-.79.74-1.41Z" fill="currentColor" />
      </svg>
    </TrackedWhatsAppLink>
  );
}
