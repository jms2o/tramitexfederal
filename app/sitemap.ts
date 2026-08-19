import type { MetadataRoute } from "next";
import { services } from "@/lib/data/services";

const routes = ["", "/servicios", "/requisitos", "/seguimiento", "/contacto"];
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return [...routes, ...services.map(({ slug }) => `/servicios/${slug}`)].map((route) => ({ url: `${baseUrl}${route}`, lastModified: new Date() }));
}
