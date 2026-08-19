import Link from "next/link";
import { CarFront, Plus } from "lucide-react";
import { getVehicles } from "@/lib/db/crm";
import { VehiclesTable } from "@/components/admin/vehicles-table";

export const metadata = { title: "Vehículos" };
export default async function VehiclesPage() { const vehicles = await getVehicles(); return <div><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">CRM</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-navy">Vehículos</h1><p className="mt-2 text-sm text-slate-600">Unidades vinculadas a personas y empresas.</p></div><Link className="button" href="/admin/vehiculos/nuevo"><Plus size={17} />Nuevo vehículo</Link></div><section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{vehicles.length ? <VehiclesTable vehicles={vehicles} /> : <div className="grid min-h-70 place-items-center p-8 text-center"><div><CarFront className="mx-auto text-slate-300" size={34} /><p className="mt-4 font-semibold text-navy">Aún no hay vehículos</p><p className="mt-2 text-sm text-slate-500">Primero registra un cliente y después su unidad.</p><Link className="button mt-5" href="/admin/vehiculos/nuevo">Registrar vehículo</Link></div></div>}</section></div>; }
