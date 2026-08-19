import { registerClient } from "@/app/(auth)/actions";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";

export function RegistrationForm() {
  return <form action={registerClient} className="mt-8 grid gap-5"><label className="field">Correo electrónico<input className="input" name="email" type="email" autoComplete="email" required /></label><label className="field">Contraseña<input className="input" name="password" type="password" autoComplete="new-password" minLength={12} required /></label><label className="field">Confirmar contraseña<input className="input" name="confirmPassword" type="password" autoComplete="new-password" minLength={12} required /></label><p className="text-xs leading-5 text-slate-500">Usa al menos 12 caracteres, mayúscula, minúscula, número y símbolo.</p><TurnstileWidget /><button className="button h-12" type="submit">Crear mi cuenta</button></form>;
}
