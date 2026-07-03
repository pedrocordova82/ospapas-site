import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quem Somos | MC Os Papas",
  alternates: {
    canonical: "https://mcospapas.com.br/quem-somos",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LegacySobrePage() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <meta httpEquiv="refresh" content="0;url=/quem-somos" />
      <script
        dangerouslySetInnerHTML={{
          __html: 'window.location.replace("/quem-somos");',
        }}
      />
      <p className="text-base text-[color:var(--color-text-300)]">
        Esta página mudou para{" "}
        <Link
          href="/quem-somos"
          className="font-semibold text-[color:var(--color-gold-500)] hover:underline"
        >
          Quem Somos
        </Link>
        .
      </p>
    </main>
  );
}
