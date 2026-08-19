"use client";

import { useFormStatus } from "react-dom";
import { Upload } from "lucide-react";
import { uploadProcedureDocument } from "@/app/admin/actions";

type Requirement = { id: string; label: string; isRequired: boolean; isComplete: boolean; documents: { document: { id: string; originalName: string; status: string } }[] };
export function RequirementDocumentCard({ procedureId, requirement }: { procedureId: string; requirement: Requirement }) { return <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div><p className="font-semibold text-navy">{requirement.label}</p><p className="mt-1 text-xs text-slate-500">{requirement.isRequired ? "Obligatorio" : "Opcional"} · Estado: {requirement.isComplete ? "Completado" : "Pendiente"}</p>{requirement.documents.map(({ document }) => <p key={document.id} className="mt-2 text-xs"><a className="font-semibold text-blue hover:text-navy" href={`/api/documents/${document.id}/download`}>{document.originalName}</a> · {document.status}</p>)}</div><form action={uploadProcedureDocument} className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row"><input type="hidden" name="procedureId" value={procedureId} /><input type="hidden" name="requirementId" value={requirement.id} /><input className="input h-10 text-xs" accept="application/pdf,image/jpeg,image/png" name="file" type="file" required /><UploadButton /></form></li>; }
function UploadButton() { const { pending } = useFormStatus(); return <button className="button h-10 shrink-0" type="submit" disabled={pending}><Upload size={15} />{pending ? "Subiendo..." : "Subir archivo"}</button>; }
