"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { createClientProcedure } from "@/app/cuenta/actions";

type Service = { id: string; name: string; description: string };

export function StartProcedureForm({ services }: { services: Service[] }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const router = useRouter();
  return <form className="mt-8 grid gap-4" onSubmit={(event) => { event.preventDefault(); setMessage(""); const values = new FormData(event.currentTarget); startTransition(async () => { const result = await createClientProcedure(values); if (!result.ok) return setMessage(result.message ?? "No fue posible crear el trámite."); router.push(`/cuenta/mis-tramites/${result.procedureId}`); }); }}><label className="field">Selecciona el trámite<select className="input" name="serviceId" defaultValue="" required><option value="" disabled>Elige un servicio</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label><p className="text-sm leading-6 text-slate-600">Al continuar crearemos tu expediente y te mostraremos los requisitos para cargar cada documento de forma independiente.</p>{message && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{message}</p>}<button className="button w-fit" disabled={pending} type="submit">{pending ? <><LoaderCircle className="animate-spin" size={16} />Creando</> : <>Continuar <ArrowRight size={16} /></>}</button></form>;
}
