import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireInternalUser } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireInternalUser();
  return <main className="min-h-screen bg-surface md:grid md:grid-cols-[15rem_1fr]"><AdminSidebar /><div><header className="border-b border-slate-200 bg-white"><div className="flex h-18 items-center justify-between px-5 sm:px-8"><p className="text-sm text-slate-500">Hola, <span className="font-semibold text-navy">{session.user.name}</span></p><SignOutButton /></div></header><section className="module-enter p-5 sm:p-8">{children}</section></div></main>;
}
