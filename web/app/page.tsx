// TESTE DEPLOY VERCEL - confirmar push
import { SedeCard } from "@/components/sedes/SedeCard";
import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";

export default function Home() {
  const sedeCards = [
    {
      name: "Belém",
      href: "/sedes/para",
      imageUrl: "/images/para/capa.jpg",
      type: "Sede Nacional"
    },
    {
      name: "São Luís",
      href: "/sedes/sao-luis",
      imageUrl: "/images/sao-luis/capa.jpg?v=2",
      type: "Subsede"
    },    
    {
      name: "Brasília",
      href: "/sedes/brasilia",
      imageUrl: "/images/brasilia/capa.jpg",
    },
    {
      name: "Rio de Janeiro",
      href: "/sedes/rio-de-janeiro",
      imageUrl: "/images/rio-de-janeiro/capa.jpeg",
    },
    {
      name: "São Miguel do Oeste",
      href: "/sedes/sao-miguel-do-oeste",
      imageUrl: "/images/sao-miguel-do-oeste/capa.jpg",
    },
  ];

  const baseSections = [
    {
    id: "sobre",
    label: "Institucional",
    title: "Quem Somos",
    text: "Irmandade que vive a estrada com respeito, liberdade e lealdade."
  },
  {
    id: "eventos",
    label: "Agenda",
    title: "Eventos",
    text: "Calendário de rides, encontros e ações beneficentes."
  },
  {
    id: "filantropia",
    label: "Ação Social",
    title: "Filantropia",
    text: "Ações sociais e apoio a comunidades parceiras."
  },
  {
    id: "na-estrada",
    label: "Viagens",
    title: "Na Estrada",
    text: "Histórias de viagem, rotas e momentos da irmandade."
  },
  {
    id: "galeria",
    label: "Momentos",
    title: "Galeria",
    text: "Fotografias de eventos, rides e encontros do clube."
  }
  ];

  return (
    <div className="pb-20">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 scale-105 bg-[url('/images/geral/capa-inicial-page.png')] bg-cover bg-center brightness-75 lg:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.15),transparent_60%)]" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 xl:py-20">
          <img src="/images/geral/logo-ospapas.png" alt="Logo do MC Os Papas" className="mb-6 h-36 w-36 sm:mb-8 sm:h-44 sm:w-44 md:h-48 md:w-48 lg:h-52 lg:w-52" />
          <h1 className="mt-2 max-w-3xl text-balance font-heading text-5xl uppercase leading-[0.9] tracking-[0.05em] text-white sm:text-7xl lg:text-8xl">
            MC OS PAPAS
          </h1>
          <p className="mt-6 text-sm uppercase tracking-[0.2em] text-white/80 sm:text-base sm:tracking-[0.24em]">FRATRES IN VIA</p>
          <p className="mt-8 max-w-2xl text-base leading-7 text-white/80 sm:mt-10 sm:text-lg sm:leading-8">
            Estar em um Moto Clube é muito mais do que &quot;andar de moto em grupo&quot;, é pertencer a algo muito maior. É ter códigos, histórias, símbolos e identidade que constroem uma irmandade capaz de cruzar quilômetros de asfalto e décadas de convivência. Esse é o Moto Clube OS PAPAS!
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:flex-wrap">
            <a
              href="#eventos"
              className="rounded-md bg-[color:var(--color-gold-500)] px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[color:var(--color-gold-400)]"
            >
              Ver Eventos
            </a>
            <Link
              id="entrar"
              href="/#sedes"
              className="rounded-md border border-white/70 bg-black/20 px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:border-white hover:bg-white/10"
            >
              Onde Estamos
            </Link>
          </div>
        </div>
      </section>

      <Reveal>
        <section id="sedes" className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6 lg:px-8 lg:pt-24">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">Onde Estamos</p>
          <h2 className="mt-3 font-heading text-5xl uppercase tracking-[0.05em] text-[color:var(--color-text-100)] sm:text-6xl">
            Sedes / SUBSEDES
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--color-text-300)]">
            O Moto Clube está presente em nove (09) estados e no Distrito Federal, preservando sempre nossos valores.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sedeCards.map((sede) => (
              <SedeCard key={sede.name} {...sede} />
            ))}
          </div>
        </section>
      </Reveal>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 pt-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-24">
        {baseSections.map((section) => (
          section.id === "sobre" ? (
            <Reveal key={section.id}>
              <Link href="/sobre" className="group block cursor-pointer">
                <article id={section.id} className="rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] p-8">
                 <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">{section.label}</p>
                  <h2 className="mt-4 font-heading text-4xl uppercase tracking-[0.05em] text-[color:var(--color-text-100)] sm:text-5xl">
                    {section.title}
                  </h2>
                  <p className="mt-5 text-sm leading-7 text-[color:var(--color-text-300)]">{section.text}</p>
                </article>
              </Link>
            </Reveal>
          ) : section.id === "eventos" || section.id === "filantropia" ? (
            <Reveal key={section.id}>
              <article id={section.id} className="rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] p-8">
                <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">{section.label}</p>
                <h2 className="mt-4 font-heading text-4xl uppercase tracking-[0.05em] text-[color:var(--color-text-100)] sm:text-5xl">
                  {section.title}
                </h2>
                <p className="mt-5 text-sm leading-7 text-[color:var(--color-text-300)]">{section.text}</p>
              </article>
            </Reveal>
          ) : (
            <article
              key={section.id}
              id={section.id}
              className="rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] p-8"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">{section.label}</p>
              <h2 className="mt-4 font-heading text-4xl uppercase tracking-[0.05em] text-[color:var(--color-text-100)] sm:text-5xl">
                {section.title}
              </h2>
              <p className="mt-5 text-sm leading-7 text-[color:var(--color-text-300)]">{section.text}</p>
            </article>
          )
        ))}
      </section>
    </div>
  );
}
