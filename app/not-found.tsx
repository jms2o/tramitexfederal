import Link from "next/link";

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6"><div className="max-w-lg text-center"><p className="eyebrow">Error 404</p><h1 className="mt-4 text-4xl font-bold tracking-tight text-navy">La página no existe</h1><p className="mt-4 text-slate-600">La dirección puede haber cambiado o el contenido ya no está disponible.</p><Link className="button mt-8 inline-flex" href="/">Volver al inicio</Link></div></main>;
}
