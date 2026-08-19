import Link from "next/link";
import Image from "next/image";
import type { Service } from "@/lib/data/services";
import { ArrowUpRight } from "lucide-react";

export function ServiceCard({ service }: { service: Service }) { const Icon = service.icon; return <Link href={`/servicios/${service.slug}`} className="group card overflow-hidden p-0"><div className="relative aspect-[16/10] bg-blue-pale"><Image src={service.image} alt="" fill className="object-contain p-4 transition duration-200 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" /></div><div className="p-6"><span className="grid size-11 place-items-center rounded-xl bg-blue-pale text-blue"><Icon size={22} /></span><h3 className="mt-6 text-lg font-bold text-navy">{service.name}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p><span className="mt-5 flex items-center gap-1 text-sm font-semibold text-blue">Ver detalles <ArrowUpRight size={16} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span></div></Link>; }
