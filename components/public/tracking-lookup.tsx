"use client";

import { FormEvent, useState, useTransition } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { lookupPublicTracking } from "@/app/(public)/actions";

type Tracking = { folio: string; service: string; status: string; updatedAt: string; message: string };

export function TrackingLookup() {
  const [pending, startTransition] = useTransition();
  const [tracking, setTracking] = useState<Tracking | null>(null);
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setMessage("");
    setTracking(null);
    startTransition(async () => {
      const result = await lookupPublicTracking(formData);
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      setTracking(result.tracking);
    });
  }

  return <><form onSubmit={submit} className="mt-8 grid gap-3 sm:grid-cols-2"><label className="field">Folio<input className="input h-13 uppercase" name="folio" pattern="TRM-[0-9]{4}-[0-9]{5}" placeholder="Ej. TRM-2026-00001" autoComplete="off" required /></label><label className="field">Correo del expediente<input className="input h-13" name="email" type="email" autoComplete="email" required /></label><button className="button h-13 sm:col-span-2 sm:justify-self-start" disabled={pending} type="submit">{pending ? <LoaderCircle className="animate-spin" size={17} /> : <ArrowRight size={17} />}{pending ? "Consultando" : "Consultar"}</button></form>{message && <section className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600"><p className="font-semibold text-navy">No fue posible mostrar el seguimiento.</p><p className="mt-1">{message}</p></section>}{tracking && <section className="mt-7 rounded-2xl border border-blue-100 bg-blue-pale p-5"><div className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-blue" /><div className="flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-navy">{tracking.folio}</p><span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-blue">{tracking.status}</span></div><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">Servicio</dt><dd className="mt-1 font-medium text-navy">{tracking.service}</dd></div><div><dt className="text-slate-500">Última actualización</dt><dd className="mt-1 font-medium text-navy">{new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(new Date(tracking.updatedAt))}</dd></div></dl><p className="mt-4 border-t border-blue-100 pt-4 text-sm leading-6 text-slate-700">{tracking.message}</p></div></div></section>}</>;
}
