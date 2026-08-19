"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { SignOutButton } from "@/components/auth/sign-out-button";

export function AccountFrame({ children, email }: { children: ReactNode; email: string }) {
  const isWizard = usePathname() === "/cuenta/iniciar-tramite";
  const [open, setOpen] = useState(false);
  if (isWizard) return <main className="min-h-screen bg-surface"><div className="fixed left-4 top-4 z-50"><button type="button" aria-label="Abrir menú" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white text-navy shadow-sm hover:border-blue hover:text-blue">{open ? <X size={20} /> : <Menu size={20} />}</button>{open && <nav className="mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"><p className="px-3 py-2 text-xs text-slate-500">{email}</p><Link onClick={() => setOpen(false)} href="/cuenta/iniciar-tramite" className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-navy hover:bg-blue-pale hover:text-blue">Iniciar trámite</Link><Link onClick={() => setOpen(false)} href="/cuenta/mis-tramites" className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-navy hover:bg-blue-pale hover:text-blue">Mis trámites</Link><div className="mt-1 border-t border-slate-100 pt-1"><SignOutButton /></div></nav>}</div><section className="module-enter px-5 py-8 sm:px-8 lg:px-12">{children}</section></main>;
  return <main className="min-h-screen bg-surface md:grid md:grid-cols-[15rem_1fr]"><AccountSidebar /><div><header className="border-b border-slate-200 bg-white px-5 py-5 sm:px-8"><p className="text-sm text-slate-500">Mi cuenta · <span className="font-semibold text-navy">{email}</span></p></header><section className="p-5 sm:p-8">{children}</section></div></main>;
}
