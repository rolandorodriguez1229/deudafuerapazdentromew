import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Deuda Fuera Paz Dentro | Método probado para salir de deudas rápido",
  description: "Descubre el GPS Anti-Deuda: un plan claro que combina Oxígeno, Bola de Nieve y Avalancha según tu IPD para resultados rápidos y reales.",
  keywords: "eliminar deudas, finanzas personales, libertad financiera, Rolando Rodríguez, deudas inteligentes",
  authors: [{ name: "Rolando Rodríguez" }],
  openGraph: {
    title: "Deuda Fuera, Paz Dentro",
    description: "El sistema probado para eliminar deudas de forma inteligente",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${poppins.variable} ${playfair.variable}`}>
      <body className={`${poppins.className} antialiased bg-white text-neutral-800`}>
        {children}
      </body>
    </html>
  );
}
