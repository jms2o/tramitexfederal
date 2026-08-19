"use client";

import Script from "next/script";
import { useEffect, useId, useState } from "react";

type TurnstileApi = { render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "expired-callback": () => void }) => string; remove: (widgetId: string) => void };

declare global { interface Window { turnstile?: TurnstileApi } }

export function TurnstileWidget() {
  const elementId = useId().replace(/:/g, "");
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState("");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    const element = document.getElementById(elementId);
    if (!ready || !siteKey || !element || !window.turnstile) return;
    const widgetId = window.turnstile.render(element, { sitekey: siteKey, callback: setToken, "expired-callback": () => setToken("") });
    return () => window.turnstile?.remove(widgetId);
  }, [elementId, ready, siteKey]);

  if (!siteKey) return <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">El registro estará disponible cuando se configure la verificación de seguridad.</p>;
  return <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={() => setReady(true)} /><input name="turnstileToken" type="hidden" value={token} readOnly /><div id={elementId} /></>;
}
