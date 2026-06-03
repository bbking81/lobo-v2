import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
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
    <html lang="es" className={`${dmSans.variable} h-full antialiased`}>
      <body className="font-[family-name:var(--font-dm-sans)] bg-gray-50">
        <div className="flex flex-col min-h-screen">
          {/* Barra superior full-width */}
          <Topbar />
          {/* Fila: sidebar + contenido */}
          <div className="flex flex-1 min-h-0">
            <Sidebar />
            {/* Contenido principal */}
            <div className="flex-1 min-w-0 pb-16 md:pb-0 bg-[#f8fafc]">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
