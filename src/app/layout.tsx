import type { Metadata } from "next";
import { DM_Sans, Archivo } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/seo";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lobo Entrerriano · Estadísticas de Gimnasia y Esgrima",
    template: "%s | Lobo Entrerriano",
  },
  description:
    "Estadísticas, historia y resultados de Gimnasia y Esgrima de Concepción del Uruguay: todos los partidos, jugadores, goleadores, DTs, árbitros y competencias del Lobo.",
  applicationName: "Lobo Entrerriano",
  keywords: [
    "Gimnasia y Esgrima", "Concepción del Uruguay", "estadísticas",
    "fútbol", "Entre Ríos", "Lobo Entrerriano", "resultados", "historial",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Lobo Entrerriano",
    title: "Lobo Entrerriano · Estadísticas de Gimnasia y Esgrima",
    description:
      "Estadísticas, historia y resultados de Gimnasia y Esgrima de Concepción del Uruguay.",
    url: SITE_URL,
    images: [{ url: "/static/logo.png", alt: "Gimnasia y Esgrima de Concepción del Uruguay" }],
  },
  twitter: {
    card: "summary",
    title: "Lobo Entrerriano · Estadísticas",
    description: "Estadísticas e historia de Gimnasia y Esgrima de Concepción del Uruguay.",
    images: ["/static/logo.png"],
  },
};

const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "SportsTeam",
  name: "Gimnasia y Esgrima de Concepción del Uruguay",
  alternateName: "Lobo Entrerriano",
  sport: "Soccer",
  url: SITE_URL,
  logo: `${SITE_URL}/static/logo.png`,
  location: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Concepción del Uruguay",
      addressRegion: "Entre Ríos",
      addressCountry: "AR",
    },
  },
};

// ISR: las páginas se prerenderizan y se sirven desde la caché de ruta de Next,
// regenerándose cada 60s. Esto hace que cada visita NO re-renderice SSR de cero
// (antes con force-dynamic), y emite `Cache-Control: s-maxage=60` para que
// Cloudflare pueda cachear el HTML en el borde (~50ms desde CDN). El build corre
// EN el VPS con el API local (127.0.0.1:8000), confiable; y si aun así fallara,
// getApiData devuelve datos vacíos en build para no tumbar el deploy (la página
// se auto-regenera al primer revalidate). Dato nuevo del admin: hasta ~1min.
export const revalidate = 60;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${dmSans.variable} ${archivo.variable} h-full antialiased`}>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/css/flag-icons.min.css" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }} />
      </head>
      <body className="font-[family-name:var(--font-dm-sans)] bg-[#f8fafc]">
        <div className="flex flex-col min-h-screen">
          {/* Barra superior full-width */}
          <Topbar />
          {/* Fila: sidebar + contenido */}
          <div className="flex flex-1 min-h-0">
            <Sidebar />
            {/* Contenido principal — el footer va acá adentro: su borde
                izquierdo choca contra el sidebar, no pasa por debajo */}
            <div className="flex-1 min-w-0 flex flex-col bg-[#f8fafc]">
              <div className="flex-1 min-w-0">{children}</div>
              <Footer />
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
