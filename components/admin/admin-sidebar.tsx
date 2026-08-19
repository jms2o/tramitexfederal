"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { BarChart3, BriefcaseBusiness, CircleDollarSign, FolderKanban, Settings } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/expedientes", label: "Expedientes", icon: FolderKanban },
  { href: "/admin/vehiculos", label: "Vehículos", icon: BriefcaseBusiness },
  { href: "/admin/cotizaciones", label: "Cotizaciones", icon: CircleDollarSign },
  { label: "Configuración", icon: Settings },
];

export function AdminSidebar() { const pathname = usePathname(); return <aside className="border-r border-white/10 bg-navy px-4 py-6 text-white md:min-h-screen"><Link href="/admin" aria-label="TramitexFederal, dashboard" className="mb-10 block rounded-xl bg-white p-2"><Image src="/assets/tramitexfederal-logo.png" alt="TramitexFederal" width={2172} height={724} className="h-auto w-full" /></Link><nav className="grid gap-3">{links.map((link) => { const Icon = link.icon; const active = link.href === "/admin" ? pathname === "/admin" : Boolean(link.href && pathname.startsWith(link.href)); return link.href ? <Link key={link.label} href={link.href} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-white ${active ? "bg-white text-navy shadow-md" : "text-blue-100 hover:translate-x-0.5 hover:bg-white/10 hover:text-white"}`}><Icon size={18} aria-hidden="true" />{link.label}</Link> : <span key={link.label} className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm text-slate-300"><Icon size={18} />{link.label}<small className="ml-auto text-[10px] uppercase tracking-wide text-slate-400">Pronto</small></span>; })}</nav></aside>; }
