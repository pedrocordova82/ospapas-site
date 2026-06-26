import Image from "next/image";
import { leadership } from "@/data/leadership";
import { Reveal } from "@/components/ui/Reveal";

export default function DiretoriaPage() {
  return (
    <div className="pb-16">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <Image
          src="/images/sobre/capa_sobre.png"
          alt="Moto Clube Os Papas"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.5)_0%,rgba(11,11,11,0.95)_100%)]" />

        <div className="relative mx-auto flex min-h-[42vh] w-full max-w-6xl items-end px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-base uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">Institucional</p>
            <h1 className="mt-3 text-balance font-heading text-5xl uppercase tracking-[0.05em] text-white sm:text-6xl lg:text-7xl">
              Conheça a Diretoria
            </h1>
            <p className="mt-5 text-base leading-7 text-[color:var(--color-text-200)] sm:text-lg sm:leading-8">
              Conheça os responsáveis por conduzir o Moto Clube Os Papas, preservando sua história, seus valores e sua irmandade.
            </p>
          </div>
        </div>
      </section>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Membros</p>
          <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">Diretoria</h2>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {leadership.map((leader) => (
              <article key={leader.name} className="group text-center">
                <div className="aspect-[2/3] overflow-hidden rounded-lg shadow-lg shadow-black/40">
                  <div className="relative h-full w-full">
                    <Image
                      src={leader.image}
                      alt={leader.name}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-[1.03]"
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <p className="font-semibold text-white">{leader.name}</p>
                  <p className="text-sm text-[color:var(--color-gold-500)]">{leader.rank}</p>
                  <p className="mt-1 text-sm text-[color:var(--color-text-300)]">{leader.sede}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
