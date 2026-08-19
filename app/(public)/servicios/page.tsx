import type { Metadata } from "next";
import { SectionHeading } from "@/components/public/section-heading";
import { ServiceCard } from "@/components/public/service-card";
import { services } from "@/lib/data/services";
export const metadata: Metadata = { title: "Servicios" };
export default function ServicesPage() { return <section className="container py-16 sm:py-22"><SectionHeading eyebrow="Nuestros servicios" title="El apoyo adecuado para cada trámite." copy="Revisamos tu caso, te explicamos los requisitos y te acompañamos durante la gestión." /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{services.map((service) => <ServiceCard key={service.slug} service={service} />)}</div></section>; }
