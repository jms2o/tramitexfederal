"use client";

import { useFormStatus } from "react-dom";
import { CircleHelp, Upload } from "lucide-react";
import { uploadProcedureDocument } from "@/app/admin/actions";

type Requirement = { id: string; label: string; isRequired: boolean; isComplete: boolean; notes: string | null; documents: { document: { id: string; originalName: string; status: string } }[] };

export function RequirementDocumentCard({ procedureId, requirement }: { procedureId: string; requirement: Requirement }) {
  const needsHelp = !requirement.isComplete && (requirement.notes?.startsWith("[REQUIERE_ASESORIA]") ?? false);
  const state = requirement.isComplete ? "Completado" : needsHelp ? "Requiere ayuda" : "Pendiente";

  return <li className={`rounded-xl border bg-white p-4 shadow-sm ${needsHelp ? "border-blue/30 ring-1 ring-blue/10" : "border-slate-200"}`}><div><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-navy">{requirement.label}</p><p className="mt-1 text-xs text-slate-500">{requirement.isRequired ? "Obligatorio" : "Opcional"} · Estado: <span className={needsHelp ? "font-bold text-blue" : undefined}>{state}</span></p></div>{needsHelp && <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-pale px-2.5 py-1 text-[11px] font-bold text-blue"><CircleHelp size={13} />Ayuda solicitada</span>}</div>{needsHelp && <p className="mt-3 rounded-xl bg-blue-pale/60 p-3 text-xs leading-5 text-navy">El cliente indicó que todavía no cuenta con este documento. Ya se generó una solicitud de soporte para darle seguimiento.</p>}{requirement.documents.map(({ document }) => <p key={document.id} className="mt-2 text-xs"><a className="font-semibold text-blue hover:text-navy" href={`/api/documents/${document.id}/download`}>{document.originalName}</a> · {document.status}</p>)}</div><form action={uploadProcedureDocument} className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row"><input type="hidden" name="procedureId" value={procedureId} /><input type="hidden" name="requirementId" value={requirement.id} /><input className="input h-10 text-xs" accept="application/pdf,image/jpeg,image/png" name="file" type="file" required /><UploadButton /></form></li>;
}

function UploadButton() { const { pending } = useFormStatus(); return <button className="button h-10 shrink-0" type="submit" disabled={pending}><Upload size={15} />{pending ? "Subiendo..." : "Subir archivo"}</button>; }
