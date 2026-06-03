import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

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
        <div className="flex min-h-screen">
          <Sidebar />
          {/* Contenido principal */}
          <div className="flex-1 min-w-0 pb-16 md:pb-0 bg-[#f8fafc]">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
