import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BadgeCheck, Building2, CheckCircle2, ClipboardCheck, FileText, Headphones, MessageCircle, ShieldCheck, Truck, UsersRound } from "lucide-react";
import { services } from "@/lib/data/services";
import { whatsappUrl } from "@/lib/data/contact";

const process: [LucideIcon, string, string][] = [[UsersRound, "Solicita asesoría", "Nos compartes qué trámite necesitas realizar."], [FileText, "Revisamos tus documentos", "Validamos que tengas la documentación necesaria."], [ClipboardCheck, "Integramos tu expediente", "Resolvemos cualquier documento faltante."], [Truck, "Gestionamos el trámite", "Iniciamos y damos seguimiento ante la SICT."], [CheckCircle2, "Entrega", "Recibes tu documentación cuando esté lista."]];
const benefits: [LucideIcon, string][] = [[Headphones, "Atención personalizada"], [BadgeCheck, "Seguimiento de tu trámite"], [Building2, "Personas y empresas"]];
const stats: [string, string][] = [["+5,000", "Trámites realizados"], ["98%", "Clientes satisfechos"], ["+12 años", "De experiencia"], ["Cobertura", "Nacional"]];

export default function Home() {
  return <>
    <section className="container py-3 sm:py-5">
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_36px_rgba(15,44,98,.11)]">
        <div className="grid min-h-[31rem] lg:grid-cols-[.95fr_1.05fr]">
          <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-14">
            <p className="eyebrow inline-flex w-fit rounded-full border border-blue/30 bg-blue-pale px-3 py-1">Trámites ante la SICT</p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.04] tracking-[-.045em] text-navy sm:text-5xl">Trámites federales <span className="text-blue">sin complicaciones</span></h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-slate-600 sm:text-base">Elige cómo quieres avanzar: realiza tu trámite en línea o recibe atención directa de un asesor.</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Link href="/cuenta/iniciar-tramite" className="group rounded-2xl bg-blue p-5 text-white shadow-[0_10px_24px_rgba(11,87,208,.2)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(11,87,208,.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue">
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-blue-100">Quiero hacerlo en línea</p>
                <span className="mt-3 flex items-center justify-between gap-3 text-base font-bold">Iniciar mi trámite <ArrowRight className="shrink-0 transition-transform group-hover:translate-x-1" size={18} /></span>
                <p className="mt-2 text-xs leading-5 text-blue-100">Captura tus datos y documentos desde tu cuenta.</p>
              </Link>

              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="group rounded-2xl border border-blue/20 bg-blue-pale/60 p-5 text-navy transition duration-200 hover:-translate-y-0.5 hover:border-blue/40 hover:bg-blue-pale focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue">
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-blue">Prefiero que me atiendan</p>
                <span className="mt-3 flex items-center justify-between gap-3 text-base font-bold">Hablar con un asesor <MessageCircle className="shrink-0 text-blue" size={18} /></span>
                <p className="mt-2 text-xs leading-5 text-slate-600">Abre WhatsApp con un mensaje listo para enviarnos.</p>
              </a>
            </div>

            <div className="mt-9 grid grid-cols-3 gap-3">{benefits.map(([Icon, label]) => <div className="flex items-center gap-2 text-[11px] font-medium leading-4 text-slate-600" key={label}><span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-pale text-blue"><Icon size={15} /></span>{label}</div>)}</div>
          </div>
          <div className="relative min-h-[18rem] bg-gradient-to-br from-[#eff6ff] via-[#dcecff] to-[#86b8f7]">
            <Image src="/assets/hero-federal-truck.png" alt="Camión de transporte federal en carretera" fill priority className="object-cover object-center" sizes="(max-width: 1024px) 100vw, 55vw" />
            <div className="absolute bottom-5 left-5 rounded-xl border border-white/80 bg-white/90 p-3 shadow-lg backdrop-blur"><p className="text-[10px] font-bold uppercase tracking-wider text-blue">Expediente digital</p><p className="mt-1 text-xs font-semibold text-navy">Listo para gestionar</p></div>
          </div>
        </div>
        <div className="grid gap-px bg-white/20 text-white sm:grid-cols-4">{stats.map(([number, label]) => <div key={label} className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#053a91] to-[#0b57d0] px-4 py-5"><ShieldCheck size={20} className="text-sky-200" /><div><p className="font-bold">{number}</p><p className="text-[10px] text-blue-100">{label}</p></div></div>)}</div>
      </div>
    </section>

    <section className="container py-12 sm:py-16">
      <p className="eyebrow">Soluciones integrales</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy">Nuestros servicios</h2>
      <p className="mt-2 text-sm text-slate-600">Soluciones claras para tus trámites federales.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => <Link key={service.slug} href={`/servicios/${service.slug}`} className="reference-service-card group">
          <div className="relative h-40 overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-blue-pale/50">
            <Image
              src={service.image}
              alt={`Ilustración de ${service.name}`}
              fill
              className="object-contain p-2 transition-transform duration-200 group-hover:scale-[1.035]"
              sizes="(max-width: 640px) calc(100vw - 4rem), (max-width: 1024px) 45vw, 16rem"
            />
          </div>
          <h3>{service.name}</h3>
          <p>{service.description}</p>
          <span>Ver requisitos <ArrowRight size={14} /></span>
        </Link>)}
      </div>
    </section>

    <section className="container pb-14">
      <div className="rounded-2xl bg-gradient-to-br from-[#062f70] to-[#001b49] px-7 py-10 text-white sm:px-11">
        <p className="text-sm text-sky-200">Te acompañamos en cada paso</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">Así es nuestro proceso</h2>
        <div className="mt-10 grid gap-7 md:grid-cols-5">{process.map(([Icon, title, copy], index) => <div className="relative text-center" key={title}>{index < process.length - 1 && <span className="absolute left-[61%] top-6 hidden h-px w-[78%] border-t border-dashed border-sky-300/70 md:block" />}<span className="relative z-10 mx-auto grid size-12 place-items-center rounded-full border-4 border-blue-200 bg-white text-blue shadow-lg"><Icon size={21} /></span><h3 className="mt-4 text-sm font-bold">{title}</h3><p className="mt-2 text-xs leading-5 text-blue-100">{copy}</p></div>)}</div>
      </div>
    </section>
  </>;
}
