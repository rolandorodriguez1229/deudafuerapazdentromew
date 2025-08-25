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
  title: "Deuda Fuera, Paz Dentro - Elimina tus Deudas de Forma Inteligente",
  description: "Descubre el sistema probado para eliminar deudas que me ayudó a salir de $90,000 en deudas. Por Rolando Rodríguez.",
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
