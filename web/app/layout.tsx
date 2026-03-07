import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";
import "./globals.css";

/**
 * SECTION: Font Configuration
 * Heading and body fonts are configured once at the layout level and exposed
 * as CSS variables for consistent typography across the full application.
 */
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

/**
 * SECTION: Global Layout Structure
 * App Router renders every page inside this shared shell:
 * Header (top navigation), main content slot, Footer, and floating WhatsApp.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${headingFont.variable} ${bodyFont.variable} antialiased`}>
        {/**
         * SECTION: Global Background Styling
         * A dark base color plus a subtle radial gradient reinforces the visual
         * identity and keeps contrast consistent throughout all routes.
         */}
        <div className="relative min-h-screen bg-[color:var(--color-bg-950)] text-[color:var(--color-text-100)]">
          <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_top,_rgba(242,183,5,0.15),_transparent_48%)]" />
          {/**
           * SECTION: Shared Frame
           * `children` is the current route content injected by the App Router.
           */}
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            {/**
             * SECTION: Floating Contact Entry Point
             * The WhatsApp widget is globally mounted so visitors can contact
             * chapters from any page in the site.
             */}
            <FloatingWhatsApp />
          </div>
        </div>
      </body>
    </html>
  );
}
