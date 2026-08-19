import Link from "next/link";
import { ClipboardPlus, FileText } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";

const links = [
  { href: "/cuenta/iniciar-tramite", label: "Iniciar trámite", icon: ClipboardPlus },
  { href: "/cuenta/mis-tramites", label: "Mis trámites", icon: FileText },
];

export function AccountSidebar() {
  return <aside className="border-r border-slate-200 bg-white p-4 md:min-h-screen"><Link href="/" className="mb-8 block text-lg font-extrabold text-navy">Tramitex<span className="text-blue">Federal</span></Link><nav className="grid gap-2">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-blue-pale hover:text-blue"><Icon size={18} />{label}</Link>)}</nav><div className="mt-8 border-t border-slate-100 pt-4"><SignOutButton /></div></aside>;
}
