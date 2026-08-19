import type { ProcedureStatus } from "@/app/generated/prisma/client";
import { procedureStatusLabels } from "@/lib/db/procedures";

const colors: Record<ProcedureStatus, string> = { NEW: "bg-slate-100 text-slate-700", WAITING_DOCUMENTS: "bg-amber-50 text-amber-700", UNDER_REVIEW: "bg-violet-50 text-violet-700", DOCUMENTS_COMPLETE: "bg-sky-50 text-sky-700", STARTED: "bg-blue-50 text-blue-700", IN_PROGRESS: "bg-blue-50 text-blue-700", READY_FOR_DELIVERY: "bg-emerald-50 text-emerald-700", COMPLETED: "bg-emerald-50 text-emerald-700", ON_HOLD: "bg-orange-50 text-orange-700", REJECTED: "bg-red-50 text-red-700", CANCELLED: "bg-slate-100 text-slate-600" };
export function StatusBadge({ status }: { status: ProcedureStatus }) { return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status]}`}>{procedureStatusLabels[status]}</span>; }
