import type { Metadata } from "next";
import { AlertCircle } from "lucide-react";
import { RequirementsExplorer } from "@/components/public/requirements-explorer";
export const metadata: Metadata = { title: "Requisitos" };
export default function RequirementsPage() { return <section className="container py-16 sm:py-22"><div className="max-w-2xl"><p className="eyebrow">Consulta rápida</p><h1 className="mt-3 text-4xl font-bold tracking-tight text-navy sm:text-5xl">Requisitos por trámite.</h1><p className="mt-5 text-lg leading-8 text-slate-600">Elige tu tipo de cliente y encuentra la documentación inicial para preparar tu solicitud.</p></div><div className="mt-10 rounded-2xl border border-blue-100 bg-blue-pale p-4 text-sm leading-6 text-slate-700"><AlertCircle className="mr-2 inline text-blue" size={18} />Los requisitos pueden variar según el caso. Un asesor confirmará la lista final contigo.</div><div className="mt-8"><RequirementsExplorer /></div></section>; }
