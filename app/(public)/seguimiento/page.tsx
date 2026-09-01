import type { Metadata } from "next";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { TrackingLookup } from "@/components/public/tracking-lookup";

export const metadata: Metadata = { title: "Seguimiento" };

export default function TrackingPage() { return <section className="container grid gap-12 py-16 sm:py-22 lg:grid-cols-[1.05fr_.95fr] lg:items-center"><div><p className="eyebrow">Consulta tu avance</p><h1 className="mt-3 text-4xl font-bold tracking-tight text-navy sm:text-5xl">Seguimiento simple y seguro.</h1><p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">Ingresa el folio de tu trámite y el correo asociado al expediente.</p><TrackingLookup /></div><aside className="rounded-3xl bg-surface p-8 sm:p-10"><span className="grid size-12 place-items-center rounded-xl bg-blue-pale text-blue"><LockKeyhole /></span><h2 className="mt-6 text-2xl font-bold text-navy">Tu información se mantiene privada.</h2><p className="mt-3 leading-7 text-slate-600">La consulta pública solo muestra el estado del trámite, fechas seguras y mensajes autorizados cuando el folio y el correo coinciden.</p><div className="mt-7 flex gap-3 rounded-xl bg-white p-4 text-sm text-slate-600 shadow-sm"><ShieldCheck className="shrink-0 text-blue" size={19} />Nunca mostramos documentos, datos personales, pagos ni notas internas.</div></aside></section>; }
