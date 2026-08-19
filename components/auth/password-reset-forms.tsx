import { requestPasswordReset, resetPassword } from "@/app/(auth)/actions";

export function PasswordResetRequestForm() {
  return <form action={requestPasswordReset} className="mt-7 grid gap-5"><label className="field">Correo electrónico<input className="input" name="email" type="email" autoComplete="email" required /></label><button className="button h-12" type="submit">Enviar enlace</button></form>;
}

export function PasswordResetForm({ token }: { token: string }) {
  return <form action={resetPassword} className="mt-7 grid gap-5"><input name="token" type="hidden" value={token} /><label className="field">Nueva contraseña<input className="input" name="password" type="password" autoComplete="new-password" minLength={12} required /></label><label className="field">Confirmar contraseña<input className="input" name="confirmPassword" type="password" autoComplete="new-password" minLength={12} required /></label><button className="button h-12" type="submit">Guardar contraseña</button></form>;
}
