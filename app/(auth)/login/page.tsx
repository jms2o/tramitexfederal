import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { LockKeyhole } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Iniciar sesión", robots: { index: false, follow: false } };

export default async function LoginPage(props: PageProps<"/login">) {
  const { callbackUrl, created, reset } = await props.searchParams;
  const safeCallback = typeof callbackUrl === "string" && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/cuenta";
  return <main className="grid min-h-screen place-items-center bg-surface p-5"><section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl shadow-blue-950/5 sm:p-10"><Link href="/" aria-label="TramitexFederal, inicio" className="block w-52"><Image src="/assets/tramitexfederal-logo.png" alt="TramitexFederal" width={2172} height={724} priority className="h-auto w-full" /></Link><span className="mt-9 grid size-12 place-items-center rounded-xl bg-blue-pale text-blue"><LockKeyhole /></span><h1 className="mt-5 text-3xl font-bold tracking-tight text-navy">Iniciar sesión</h1><p className="mt-3 text-sm leading-6 text-slate-600">Accede a tu cuenta o al panel administrativo con tus credenciales.</p>{(created || reset) && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800" role="status">Ya puedes iniciar sesión con tu nueva contraseña.</p>}<LoginForm callbackUrl={safeCallback} /><p className="mt-6 text-center text-sm text-slate-600"><Link className="font-semibold text-blue" href="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link></p><p className="mt-3 text-center text-sm text-slate-600">¿Aún no tienes cuenta? <Link className="font-semibold text-blue" href="/registro">Regístrate</Link></p></section></main>;
}
