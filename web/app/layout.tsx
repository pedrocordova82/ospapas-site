import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";
import "./globals.css";

const headingFont = Bebas_Neue({
  weight: "400",
  variable: "--font-heading",
  subsets: ["latin"],
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Os Papas MC",
  description: "Website oficial do motoclube Os Papas MC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${headingFont.variable} ${bodyFont.variable} antialiased`}>
        <div className="relative min-h-screen bg-[color:var(--color-bg-950)] text-[color:var(--color-text-100)]">
          <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_top,_rgba(242,183,5,0.15),_transparent_48%)]" />
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <FloatingWhatsApp />
          </div>
        </div>
      </body>
    </html>
  );
}
