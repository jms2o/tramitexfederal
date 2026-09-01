import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RegistrationVerificationForm } from "@/components/auth/registration-verification-form";

export const metadata: Metadata = { title: "Verificar correo", robots: { index: false, follow: false } };

const errors: Record<string, string> = {
  "code-invalid": "El código no es correcto. Revisa el correo e inténtalo de nuevo.",
  "code-expired": "El código venció. Solicita uno nuevo para continuar.",
  "rate-limit": "Has realizado varios intentos. Espera unos minutos antes de continuar.",
  "email-delivery": "No pudimos reenviar el código. Inténtalo nuevamente en unos minutos.",
};

export default async function VerifyRegistrationPage({ searchParams }: { searchParams: Promise<{ id?: string | string[]; error?: string | string[]; resent?: string | string[] }> }) {
  const params = await searchParams;
  const verificationId = typeof params.id === "string" ? params.id : "";
  const error = typeof params.error === "string" ? errors[params.error] : undefined;
  const resent = params.resent === "1";

  return <main className="grid min-h-screen place-items-center bg-surface p-5"><section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl shadow-blue-950/5 sm:p-10"><Link href="/" className="block w-52"><Image src="/assets/tramitexfederal-logo.png" alt="TramitexFederal" width={2172} height={724} priority className="h-auto w-full" /></Link><h1 className="mt-9 text-3xl font-bold tracking-tight text-navy">Confirma tu correo</h1><p className="mt-3 text-sm leading-6 text-slate-600">Te enviamos un código de 6 dígitos al correo que acabas de registrar. Escríbelo para activar tu cuenta.</p>{resent && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700" role="status">Enviamos un código nuevo a tu correo.</p>}{error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}{verificationId ? <RegistrationVerificationForm verificationId={verificationId} /> : <div className="mt-8"><p className="text-sm text-slate-600">La solicitud de verificación no es válida.</p><Link href="/registro" className="button mt-5 flex h-12 items-center justify-center">Volver al registro</Link></div>}<p className="mt-6 text-center text-sm text-slate-500">¿Escribiste mal tu correo? <Link href="/registro" className="font-semibold text-blue">Comienza de nuevo</Link></p></section></main>;
}
