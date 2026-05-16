import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: '--font-jakarta', weight: ['400','500','600','700','800'] });

export const metadata: Metadata = {
  title: "Serra Privacy — Adequação à LGPD",
  description: "Plataforma SaaS completa para adequação à Lei Geral de Proteção de Dados",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.variable} ${jakarta.variable} font-sans min-h-full bg-gray-50`}>{children}</body>
    </html>
  );
}
