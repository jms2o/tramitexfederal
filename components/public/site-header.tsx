"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/servicios", label: "Servicios" },
  { href: "/requisitos", label: "Requisitos" },
  { href: "/seguimiento", label: "Seguimiento" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur">
    <div className="container flex h-18 items-center justify-between">
      <Link href="/" aria-label="TramitexFederal, inicio" className="flex items-center" onClick={() => setOpen(false)}><Image src="/assets/tramitexfederal-logo.png" alt="TramitexFederal - Soluciones federales sin fronteras" width={2172} height={724} priority className="h-auto w-44 sm:w-52" /></Link>
      <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">{links.map((link) => <Link key={link.href} className="transition hover:text-blue" href={link.href}>{link.label}</Link>)}<Link className="transition hover:text-blue" href="/cuenta">Mi cuenta</Link><Link className="button button-sm" href="/cuenta/iniciar-tramite">Iniciar trámite</Link></nav>
      <button aria-label={open ? "Cerrar menú" : "Abrir menú"} className="rounded-lg p-2 text-navy md:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      {open && <nav className="absolute inset-x-0 top-[72px] border-b border-slate-200 bg-white p-5 shadow-lg md:hidden">{links.map((link) => <Link key={link.href} className="block border-b border-slate-100 py-3 text-sm font-medium text-navy" href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}<Link className="block border-b border-slate-100 py-3 text-sm font-medium text-navy" href="/cuenta" onClick={() => setOpen(false)}>Mi cuenta</Link><Link className="button mt-4 w-full" href="/cuenta/iniciar-tramite" onClick={() => setOpen(false)}>Iniciar trámite</Link></nav>}
    </div>
  </header>;
}
