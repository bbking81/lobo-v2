import type { Metadata } from "next";
import { DM_Sans, Archivo } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Footer from "@/components/Footer";

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
  title: "Lobo Entrerriano Estadísticas",
  description: "Estadísticas de Gimnasia y Esgrima de Concepción del Uruguay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${dmSans.variable} ${archivo.variable} h-full antialiased`}>
      <body className="font-[family-name:var(--font-dm-sans)] bg-[#f8fafc]">
        <div className="flex flex-col min-h-screen">
          {/* Barra superior full-width */}
          <Topbar />
          {/* Fila: sidebar + contenido */}
          <div className="flex flex-1 min-h-0">
            <Sidebar />
            {/* Contenido principal — el footer va acá adentro: su borde
                izquierdo choca contra el sidebar, no pasa por debajo */}
            <div className="flex-1 min-w-0 flex flex-col pb-16 md:pb-0 bg-[#f8fafc]">
              <div className="flex-1 min-w-0">{children}</div>
              <Footer />
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
