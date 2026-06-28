import type { Metadata } from "next";
import { RepresentativeSubsedesSection } from "@/components/sedes/RepresentativeSubsedesSection";
import { SedeCard } from "@/components/sedes/SedeCard";
import { sedes } from "@/data/sedes/sedes";

export const metadata: Metadata = {
  title: "Sedes | MC Os Papas",
  description: "Conheça as sedes, regionais e representações locais do Moto Clube Os Papas.",
};

export default function SedesPage() {
  return (
    <div className="pb-20">
      <section className="mx-auto w-full max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">
          Onde Estamos
        </p>
        <h1 className="mt-3 font-heading text-5xl uppercase tracking-[0.05em] text-[color:var(--color-text-100)] sm:text-6xl">
          Sedes / Subsedes
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--color-text-300)]">
          O Moto Clube está presente em diferentes regiões do Brasil, preservando sempre nossos valores.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sedes.map((sede) => (
            <SedeCard
              key={sede.slug}
              name={sede.name}
              href={`/sedes/${sede.slug}`}
              imageUrl={sede.image}
              type={sede.type === "Sede" ? "Sede Nacional" : sede.type}
            />
          ))}
        </div>
      </section>

      <RepresentativeSubsedesSection />
    </div>
  );
}
