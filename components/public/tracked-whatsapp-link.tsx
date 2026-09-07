"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { whatsappMessage, whatsappNumber } from "@/lib/data/contact";

type WhatsAppSource = "floating-bubble" | "home-hero" | "client-help" | "document-help";
type ContextValue = string | number | boolean | null | undefined;

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> & {
  source: WhatsAppSource;
  children: ReactNode;
  message?: string;
  context?: Record<string, ContextValue>;
};

export function TrackedWhatsAppLink({ source, children, message, context, ...props }: Props) {
  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message ?? whatsappMessage)}`;

  function trackClick() {
    const payload = JSON.stringify({ source, path: window.location.pathname, context });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/whatsapp-click", new Blob([payload], { type: "application/json" }));
      return;
    }
    void fetch("/api/analytics/whatsapp-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
      credentials: "same-origin",
    });
  }

  return <a {...props} href={href} onClick={trackClick}>{children}</a>;
}
