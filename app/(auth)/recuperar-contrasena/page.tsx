import type { Metadata } from "next";
import Link from "next/link";
import { PasswordResetRequestForm } from "@/components/auth/password-reset-forms";

export const metadata: Metadata = { title: "Recuperar contraseña", robots: { index: false, follow: false } };

export default async function PasswordRecoveryPage({ searchParams }: { searchParams: Promise<{ sent?: string | string[]; error?: string | string[] }> }) {
  const { sent, error } = await searchParams;
  return <main className="grid min-h-screen place-items-center bg-surface p-5"><section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl shadow-blue-950/5 sm:p-10"><Link className="text-sm font-semibold text-blue" href="/login">← Volver a iniciar sesión</Link><h1 className="mt-7 text-3xl font-bold tracking-tight text-navy">Recupera tu contraseña</h1><p className="mt-3 text-sm leading-6 text-slate-600">Si existe una cuenta con ese correo, recibirás un enlace para restablecerla.</p>{sent && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800" role="status">Revisa tu correo y sigue el enlace si recibes uno.</p>}{error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">El enlace ya no es válido. Solicita uno nuevo.</p>}<PasswordResetRequestForm /></section></main>;
}
