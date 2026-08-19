"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { ArrowRight, LoaderCircle } from "lucide-react";

export function LoginForm({ callbackUrl = "/cuenta" }: { callbackUrl?: string }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (!result?.ok) {
      setError("No fue posible iniciar sesión. Verifica tus datos e inténtalo de nuevo.");
      return;
    }
    window.location.assign(result.url ?? "/admin");
  }

  return <form className="mt-8 grid gap-5" onSubmit={submit}>
    <label className="field">Correo<input className="input" name="email" type="email" autoComplete="email" required /></label>
    <label className="field">Contraseña<input className="input" name="password" type="password" autoComplete="current-password" minLength={12} required /></label>
    {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
    <button className="button h-12" disabled={loading} type="submit">{loading ? <><LoaderCircle className="animate-spin" size={17} />Verificando</> : <>Iniciar sesión <ArrowRight size={17} /></>}</button>
  </form>;
}
