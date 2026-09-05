import Link from "next/link";
import { Activity, CircleDollarSign, Clock3, FileClock, MessageCircle, MousePointerClick, UsersRound, Workflow } from "lucide-react";
import { DashboardCharts } from "@/components/admin/dashboard-charts";

type DashboardData = Awaited<ReturnType<typeof import("@/lib/db/dashboard").getDashboardData>>;
const currency = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

export function DashboardView({ data }: { data: DashboardData }) {
  const cards = [
    { label: "Trámites activos", value: data.metrics.activeProcedures, icon: Workflow, href: "/admin/expedientes?filter=active" },
    { label: "Esperando documentos", value: data.metrics.waitingDocuments, icon: FileClock, href: "/admin/expedientes?status=WAITING_DOCUMENTS" },
    { label: "En revisión", value: data.metrics.underReview, icon: Clock3, href: "/admin/expedientes?status=UNDER_REVIEW" },
    { label: "En proceso", value: data.metrics.inProgress, icon: Activity, href: "/admin/expedientes?status=IN_PROGRESS" },
    { label: "Finalizados", value: data.proceduresByStatus.find((item) => item.name === "Finalizado")?.value ?? 0, icon: Workflow, href: "/admin/expedientes?status=COMPLETED" },
    { label: "Clientes registrados", value: data.metrics.clients, icon: UsersRound, href: "/admin/expedientes" },
    { label: "Ingresos del mes", value: currency.format(data.metrics.monthlyIncome), icon: CircleDollarSign, href: "/admin/cotizaciones" },
  ];

  const whatsappMetrics = [
    { label: "Personas estimadas · 24 h", value: data.whatsapp.visitors24h, icon: UsersRound },
    { label: "Clics en burbuja · 24 h", value: data.whatsapp.bubbleClicks24h, icon: MessageCircle },
    { label: "Clics en botón del home · 24 h", value: data.whatsapp.heroClicks24h, icon: MousePointerClick },
    { label: "Clics acumulados", value: data.whatsapp.totalClicks, icon: Activity },
  ];

  return <div className="space-y-8">
    <div><p className="eyebrow">Vista general</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-navy">Dashboard</h1><p className="mt-2 text-sm text-slate-600">Resumen operativo de TramitexFederal.</p></div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map((card) => { const Icon = card.icon; return <Link href={card.href} className="card card-action p-5" key={card.label}><span className="grid size-10 place-items-center rounded-xl bg-blue-pale text-blue"><Icon size={20} /></span><p className="mt-5 text-2xl font-bold text-navy">{card.value}</p><p className="mt-1 text-sm text-slate-500">{card.label}</p></Link>; })}</div>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e9fbef] text-[#128c4a]"><MessageCircle size={21} /></span>
        <div><h2 className="font-bold text-navy">WhatsApp</h2><p className="mt-1 text-sm text-slate-500">Uso de la burbuja flotante y del botón de asesoría del home.</p></div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{whatsappMetrics.map((metric) => { const Icon = metric.icon; return <div key={metric.label} className="rounded-xl bg-slate-50 p-4"><div className="flex items-center gap-2 text-slate-500"><Icon size={16} /><span className="text-xs font-medium">{metric.label}</span></div><p className="mt-3 text-2xl font-bold text-navy">{metric.value}</p></div>; })}</div>
      <p className="mt-4 text-xs leading-5 text-slate-500">Este contador mide aperturas de WhatsApp desde la página. No confirma que el visitante haya enviado el mensaje dentro de WhatsApp.</p>
    </section>

    <DashboardCharts proceduresByMonth={data.proceduresByMonth} proceduresByStatus={data.proceduresByStatus} />

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-navy">Actividad reciente</h2>{data.activity.length ? <ul className="mt-4 divide-y divide-slate-100">{data.activity.map((activity) => <li key={activity.id} className="flex items-center justify-between gap-4 py-3"><div><p className="text-sm font-medium text-slate-700">{activity.action}</p><p className="mt-1 text-xs text-slate-500">{activity.entityType} · {activity.userName}</p></div><time className="text-xs text-slate-400" dateTime={activity.createdAt}>{new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(activity.createdAt))}</time></li>)}</ul> : <p className="mt-4 text-sm text-slate-500">La actividad del equipo aparecerá aquí.</p>}</section>
  </div>;
}
