import { requestPasswordReset } from "@/app/(auth)/actions";
import { resetPassword } from "@/app/(auth)/reset-password-action";

export function PasswordResetRequestForm() {
  return <form action={requestPasswordReset} className="mt-7 grid gap-5"><label className="field">Correo electrónico<input className="input" name="email" type="email" autoComplete="email" required /></label><button className="button h-12" type="submit">Enviar enlace</button></form>;
}

export function PasswordResetForm({ token }: { token: string }) {
  return <form action={resetPassword} className="mt-7 grid gap-5"><input name="token" type="hidden" value={token} /><label className="field">Nueva contraseña<input className="input" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label><p className="-mt-3 text-xs leading-5 text-slate-500">Usa al menos 12 caracteres e incluye mayúscula, minúscula, número y símbolo.</p><label className="field">Confirmar contraseña<input className="input" name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label><button className="button h-12" type="submit">Guardar contraseña</button></form>;
}
