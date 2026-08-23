"use client";

import { FormEvent, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, Headphones, LoaderCircle, Mail, Phone, UserRound } from "lucide-react";
import { createAdvisorAssistanceRequest } from "@/app/cuenta/actions";
import { ProcedureWizard } from "@/components/account/procedure-wizard";

type Service = { id: string; slug: string; name: string; description: string };
type Client = { id: string; type: "INDIVIDUAL" | "COMPANY"; firstName: string | null; lastName: string | null; email: string | null; phone: string | null; rfc?: string | null; address: string | null };
type Mode = "SELF" | "ADVISOR" | null;

export function ProcedureStartExperience({ client, services }: { client: Client; services: Service[] }) {
  const [mode, setMode] = useState<Mode>(null);

  if (mode === "SELF") {
    return <div className="motion-safe:animate-[module-enter_.22s_ease-out]"><button type="button" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-blue" onClick={() => setMode(null)}><ArrowLeft size={16} />Cambiar modalidad</button><ProcedureWizard client={client} services={services} /></div>;
  }

  if (mode === "ADVISOR") {
    return <AdvisorRequest client={client} services={services} onBack={() => setMode(null)} />;
  }

  return <div className="mx-auto max-w-6xl motion-safe:animate-[module-enter_.22s_ease-out]">
    <div className="mb-7 text-center sm:text-left">
      <p className="eyebrow">Nuevo trámite</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">¿Cómo quieres realizar tu trámite?</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">Elige la opción que mejor se adapte a ti. Puedes completar el proceso por tu cuenta o pedir acompañamiento de un asesor.</p>
    </div>
    <div className="grid gap-5 md:grid-cols-2">
      <button type="button" onClick={() => setMode("SELF")} className="group rounded-3xl border border-slate-200 bg-white p-7 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue">
        <span className="grid size-14 place-items-center rounded-2xl bg-blue-pale text-blue"><ClipboardCheck size={28} /></span>
        <h2 className="mt-6 text-2xl font-bold text-navy">Quiero hacerlo por mi cuenta</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">Completa tu solicitud paso a paso, carga tus documentos y da seguimiento desde tu cuenta.</p>
        <span className="mt-7 inline-flex items-center gap-2 font-bold text-blue">Continuar por mi cuenta <ArrowRight size={17} className="transition group-hover:translate-x-1" /></span>
      </button>
      <button type="button" onClick={() => setMode("ADVISOR")} className="group rounded-3xl border border-slate-200 bg-white p-7 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue">
        <span className="grid size-14 place-items-center rounded-2xl bg-navy text-white"><Headphones size={28} /></span>
        <h2 className="mt-6 text-2xl font-bold text-navy">Quiero que un asesor me ayude</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">Déjanos tus datos y el trámite que necesitas. Un asesor se pondrá en contacto contigo para acompañarte en el proceso.</p>
        <span className="mt-7 inline-flex items-center gap-2 font-bold text-blue">Solicitar asesoría <ArrowRight size={17} className="transition group-hover:translate-x-1" /></span>
      </button>
    </div>
  </div>;
}

function AdvisorRequest({ client, services, onBack }: { client: Client; services: Service[]; onBack: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ serviceName: string; contactMethod: string } | null>(null);
  const fullName = `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim();

  if (success) {
    return <div className="mx-auto max-w-2xl motion-safe:animate-[module-enter_.22s_ease-out]">
      <div className="card p-8 text-center sm:p-10">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 size={32} /></span>
        <h1 className="mt-5 text-3xl font-bold text-navy">Solicitud enviada correctamente</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">Un asesor de TramitexFederal se pondrá en contacto contigo por el medio indicado. No necesitas subir documentos todavía.</p>
        <div className="mx-auto mt-6 max-w-md rounded-2xl bg-slate-50 p-5 text-left text-sm">
          <p className="text-slate-500">Trámite solicitado</p><p className="mt-1 font-bold text-navy">{success.serviceName}</p>
          <p className="mt-4 text-slate-500">Medio de contacto</p><p className="mt-1 font-bold text-navy">{success.contactMethod}</p>
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/cuenta" className="button">Volver a mi cuenta</Link><button type="button" className="button button-outline" onClick={() => setSuccess(null)}>Enviar otra solicitud</button></div>
      </div>
    </div>;
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createAdvisorAssistanceRequest(data);
      if (!result.ok) return setError(result.message ?? "No fue posible enviar la solicitud.");
      setSuccess({ serviceName: result.serviceName!, contactMethod: result.contactMethod! });
    });
  }

  return <div className="mx-auto max-w-4xl motion-safe:animate-[module-enter_.22s_ease-out]">
    <button type="button" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-blue" onClick={onBack}><ArrowLeft size={16} />Volver</button>
    <div className="card p-6 sm:p-8">
      <div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-pale text-blue"><Headphones size={24} /></span><div><p className="eyebrow">Acompañamiento personalizado</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-navy">Solicita ayuda de un asesor</h1><p className="mt-2 text-sm leading-6 text-slate-600">Déjanos tus datos y cuéntanos qué trámite necesitas. Nuestro equipo se pondrá en contacto contigo.</p></div></div>
      <form className="mt-8 grid gap-5 sm:grid-cols-2" onSubmit={submit}>
        <label className="field">Nombre completo<div className="relative"><UserRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input className="input pl-10" name="fullName" defaultValue={fullName} required /></div></label>
        <label className="field">Correo electrónico<div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input className="input pl-10" type="email" name="email" defaultValue={client.email ?? ""} required /></div></label>
        <label className="field">Teléfono<div className="relative"><Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input className="input pl-10" name="phone" defaultValue={client.phone ?? ""} required /></div></label>
        <label className="field">Trámite que deseas realizar<select className="input" name="serviceId" defaultValue="" required><option value="" disabled>Selecciona un trámite</option>{services.map((service) => <option value={service.id} key={service.id}>{service.name}</option>)}</select></label>
        <label className="field">Medio de contacto preferido<select className="input" name="contactMethod" defaultValue="WHATSAPP" required><option value="WHATSAPP">WhatsApp</option><option value="PHONE">Llamada telefónica</option><option value="EMAIL">Correo electrónico</option></select></label>
        <label className="field">Horario preferido <span className="font-normal text-slate-400">(opcional)</span><input className="input" name="preferredTime" placeholder="Ej. lunes a viernes, 10 a 14 h" /></label>
        <label className="field sm:col-span-2">Comentarios <span className="font-normal text-slate-400">(opcional)</span><textarea className="input min-h-28" name="comments" maxLength={1200} placeholder="Cuéntanos brevemente tu caso o cualquier duda que tengas." /></label>
        <label className="sm:col-span-2 flex items-start gap-3 rounded-2xl bg-blue-pale/60 p-4 text-sm leading-6 text-navy"><input type="checkbox" name="consent" className="mt-1 size-4 accent-blue" required /><span>Acepto que un asesor de TramitexFederal me contacte con relación a esta solicitud.</span></label>
        {error && <p className="sm:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
        <div className="sm:col-span-2 flex flex-wrap gap-3"><button className="button" type="submit" disabled={pending}>{pending ? <><LoaderCircle className="animate-spin" size={16} />Enviando</> : <>Enviar solicitud de asesoría <ArrowRight size={16} /></>}</button><button type="button" className="button button-outline" onClick={onBack} disabled={pending}>Cancelar</button></div>
      </form>
    </div>
  </div>;
}
