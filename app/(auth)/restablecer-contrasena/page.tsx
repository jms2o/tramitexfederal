import type { Metadata } from "next";
import Link from "next/link";
import { PasswordResetForm } from "@/components/auth/password-reset-forms";

export const metadata: Metadata = { title: "Restablecer contraseña", robots: { index: false, follow: false } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string | string[]; error?: string | string[] }> }) {
  const { token, error } = await searchParams;
  if (typeof token !== "string") return <main className="grid min-h-screen place-items-center bg-surface p-5"><section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl"><h1 className="text-2xl font-bold text-navy">Enlace inválido</h1><Link className="button mt-6" href="/recuperar-contrasena">Solicitar uno nuevo</Link></section></main>;
  return <main className="grid min-h-screen place-items-center bg-surface p-5"><section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl shadow-blue-950/5 sm:p-10"><h1 className="text-3xl font-bold tracking-tight text-navy">Nueva contraseña</h1>{error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}<PasswordResetForm token={token} /></section></main>;
}
