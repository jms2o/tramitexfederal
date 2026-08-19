import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "TramitexFederal | Trámites federales sin complicaciones", template: "%s | TramitexFederal" },
  description: "Gestión y asesoría especializada en trámites ante la SICT para particulares, transportistas y empresas.",
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "TramitexFederal",
    description: "Soluciones federales sin fronteras.",
    type: "website",
    locale: "es_MX",
    url: "/",
    siteName: "TramitexFederal",
    images: [{ url: "/assets/tramitexfederal-logo.png", width: 2172, height: 724, alt: "TramitexFederal" }],
  },
  twitter: { card: "summary_large_image", title: "TramitexFederal", description: "Soluciones federales sin fronteras.", images: ["/assets/tramitexfederal-logo.png"] },
};

export default function RootLayout({ children }: LayoutProps<"/">) { return <html lang="es" className={`${geist.variable} scroll-smooth`}><body>{children}</body></html>; }
