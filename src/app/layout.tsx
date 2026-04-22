import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import Analytics from "@/components/Analytics";
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.deudafuerapazdentro.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Deuda Fuera, Paz Dentro | Método probado para salir de deudas",
    template: "%s | Deuda Fuera, Paz Dentro",
  },
  description:
    "Descubre el GPS Anti-Deuda: un plan claro que combina Oxígeno, Bola de Nieve y Avalancha según tu IPD para resultados rápidos y reales.",
  authors: [{ name: "Rolando Rodríguez" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Deuda Fuera, Paz Dentro",
    description: "El sistema probado para eliminar deudas de forma inteligente.",
    url: SITE_URL,
    siteName: "Deuda Fuera, Paz Dentro",
    type: "website",
    locale: "es_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Deuda Fuera, Paz Dentro — Método para salir de deudas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Deuda Fuera, Paz Dentro",
    description: "El sistema probado para eliminar deudas de forma inteligente.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${poppins.variable} ${playfair.variable}`}>
      <body className={`${poppins.className} antialiased bg-white text-neutral-800`}>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
