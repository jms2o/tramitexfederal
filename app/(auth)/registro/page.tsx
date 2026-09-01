import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { RegistrationForm } from "@/components/auth/registration-form";

export const metadata: Metadata = { title: "Crear cuenta", robots: { index: false, follow: false } };

const errors: Record<string, string> = {
  "rate-limit": "Intenta nuevamente más tarde.",
  turnstile: "No fue posible validar la verificación de seguridad.",
  "account-unavailable": "No fue posible crear la cuenta con esos datos.",
  "email-delivery": "No pudimos enviar el código de verificación. Inténtalo nuevamente en unos minutos.",
  "verification-invalid": "La solicitud de verificación ya no es válida. Comienza el registro nuevamente.",
};

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string | string[] }> }) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? errors[error] : undefined;
  return <main className="grid min-h-screen place-items-center bg-surface p-5"><section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl shadow-blue-950/5 sm:p-10"><Link href="/" className="block w-52"><Image src="/assets/tramitexfederal-logo.png" alt="TramitexFederal" width={2172} height={724} priority className="h-auto w-full" /></Link><h1 className="mt-9 text-3xl font-bold tracking-tight text-navy">Crea tu cuenta</h1><p className="mt-3 text-sm leading-6 text-slate-600">Inicia y consulta tus trámites desde un solo lugar. Confirmaremos tu correo antes de activar la cuenta.</p>{message && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{message}</p>}<RegistrationForm /><p className="mt-6 text-center text-sm text-slate-600">¿Ya tienes cuenta? <Link className="font-semibold text-blue" href="/login?callbackUrl=/cuenta">Inicia sesión</Link></p></section></main>;
}
