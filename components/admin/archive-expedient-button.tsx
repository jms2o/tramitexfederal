"use client";

import { Trash2 } from "lucide-react";
import { archiveClientExpedient } from "@/app/admin/actions";

export function ArchiveExpedientButton({ clientId }: { clientId: string }) {
  return <form action={archiveClientExpedient} onSubmit={(event) => { if (!window.confirm("¿Archivar este expediente? Se ocultará del listado, pero sus trámites, documentos y pagos se conservarán.")) event.preventDefault(); }}><input type="hidden" name="clientId" value={clientId} /><button className="button button-outline border-red-200 text-red-700 hover:bg-red-50" type="submit"><Trash2 size={17} />Eliminar expediente</button></form>;
}
