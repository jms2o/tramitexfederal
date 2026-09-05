"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { whatsappUrl } from "@/lib/data/contact";

type WhatsAppSource = "floating-bubble" | "home-hero";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> & {
  source: WhatsAppSource;
  children: ReactNode;
};

export function TrackedWhatsAppLink({ source, children, ...props }: Props) {
  function trackClick() {
    const payload = JSON.stringify({ source, path: window.location.pathname });
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

  return <a {...props} href={whatsappUrl} onClick={trackClick}>{children}</a>;
}
