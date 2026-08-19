"use client";

import { Trash2 } from "lucide-react";
import { cancelProcedure } from "@/app/admin/actions";

export function CancelProcedureButton({ procedureId }: { procedureId: string }) {
  return <form action={cancelProcedure} onSubmit={(event) => { if (!window.confirm("¿Cancelar este trámite? Se conservarán el folio, documentos, pagos e historial.")) event.preventDefault(); }}><input type="hidden" name="procedureId" value={procedureId} /><button className="button button-outline border-red-200 text-red-700 hover:bg-red-50" type="submit"><Trash2 size={16} />Eliminar trámite</button></form>;
}
