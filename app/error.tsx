"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6"><div className="max-w-lg text-center"><p className="eyebrow">Error inesperado</p><h1 className="mt-4 text-4xl font-bold tracking-tight text-navy">No pudimos completar la operación</h1><p className="mt-4 text-slate-600">Intenta nuevamente. Si el problema continúa, contacta al administrador.</p><button className="button mt-8" onClick={reset} type="button">Intentar de nuevo</button></div></main>;
}
