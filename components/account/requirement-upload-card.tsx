"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, FileUp, LoaderCircle, Upload } from "lucide-react";
import { uploadClientRequirementDocument } from "@/app/cuenta/actions";

type ExistingDocument = { id: string; originalName: string; status: string; createdAt: Date };

export function RequirementUploadCard({ procedureId, requirement }: { procedureId: string; requirement: { id: string; label: string; isRequired: boolean; documents: { document: ExistingDocument }[] } }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [uploaded, setUploaded] = useState<ExistingDocument | null>(requirement.documents[0]?.document ?? null);
  const current = uploaded ?? requirement.documents[0]?.document;
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h3 className="font-bold text-navy">{requirement.label}</h3><p className="mt-1 text-xs text-slate-500">{requirement.isRequired ? "Obligatorio" : "Opcional"}</p></div>{current ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"><CheckCircle2 size={14} />{current.status === "APPROVED" ? "Aprobado" : "Recibido"}</span> : <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Pendiente</span>}</div>{current && <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700"><FileUp className="mr-2 inline text-blue" size={16} />{current.originalName}</p>}<form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={(event) => { event.preventDefault(); setMessage(""); const form = event.currentTarget; const values = new FormData(form); startTransition(async () => { const result = await uploadClientRequirementDocument(values); if (!result.ok) return setMessage(result.message ?? "No fue posible cargar el archivo."); setUploaded({ id: result.documentId!, originalName: result.originalName!, status: result.status!, createdAt: new Date() }); form.reset(); }); }}><input name="procedureId" type="hidden" value={procedureId} /><input name="requirementId" type="hidden" value={requirement.id} />{current && <input name="replacesDocumentId" type="hidden" value={current.id} />}<label className="field flex-1">{current ? "Reemplazar archivo" : "Archivo"}<input className="input" name="file" type="file" accept="application/pdf,image/jpeg,image/png" required /></label><button className="button" disabled={pending} type="submit">{pending ? <LoaderCircle className="animate-spin" size={16} /> : <Upload size={16} />}{current ? "Reemplazar" : "Subir"}</button></form><p className="mt-3 text-xs text-slate-500">PDF, JPG o PNG; máximo 10 MB.</p>{message && <p className="mt-3 text-sm text-red-700" role="alert">{message}</p>}</article>;
}
