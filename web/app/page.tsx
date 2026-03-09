import { ChapterCard } from "@/components/sedes/ChapterCard";
import { Reveal } from "@/components/ui/Reveal";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  /**
   * SECTION: Chapter Cards Data
   * This collection feeds the Sedes grid and maps each card to a chapter route.
   * Slugs are aligned with `/sedes/[slug]` dynamic pages.
   */
  const chapterCards = [
    {
      name: "Pará",
      href: "/sedes/para",
      imageUrl: "/images/para/capa.jpg",
      type: "Sede Nacional"
    },
    {
      name: "São Luís",
      href: "/sedes/sao-luis",
      imageUrl: "/images/sao-luis/capa.jpg",
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

  /**
   * SECTION: Base Content Sections
   * These sections represent the homepage institutional blocks.
   * Each `id` is used as an anchor target for header navigation links.
   */
  const baseSections = [
    {
    id: "sobre",
    label: "Institucional",
    title: "Sobre o Moto Clube",
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
      {/**
       * SECTION: Hero
       * Primary introduction area with cinematic background, branding,
       * and CTA anchors guiding users to events and contact sections.
       */}
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0 bg-cover bg-center brightness-90"
          style={{
            backgroundImage: "url('/images/geral/capa-inicial-page.png')",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(11,11,11,0.80),rgba(11,11,11,0.94)),radial-gradient(circle_at_20%_25%,rgba(242,183,5,0.16),transparent_38%)]" />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-28 sm:px-6 lg:px-8 lg:py-40">
          <img src="/images/geral/logo-ospapas.png" alt="Logo do MC Os Papas" className="mb-8 w-40 h-40" />
          <h1 className="mt-2 max-w-3xl font-heading text-6xl uppercase leading-[0.9] tracking-[0.05em] text-white sm:text-7xl lg:text-8xl">
            MC OS PAPAS
          </h1>
          <p className="mt-6 text-base uppercase tracking-[0.24em] text-white/80">FRATRES IN VIA</p>
          <p className="mt-10 max-w-2xl text-lg leading-8 text-white/80">
            A irmandade em movimento, com presença nacional, história de estrada e compromisso com a comunidade.
          </p>
          <div className="mt-12 flex flex-wrap gap-4">
            <a
              href="#eventos"
              className="rounded-md bg-[color:var(--color-gold-500)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[color:var(--color-gold-400)]"
            >
              Ver Eventos
            </a>
            <a
              id="entrar"
              href="#contato"
              className="rounded-md border border-white/70 bg-black/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:border-white hover:bg-white/10"
            >
              Como Entrar
            </a>
          </div>
        </div>
      </section>

      {/**
       * SECTION: Quem Somos
       * Short institutional summary describing club identity and purpose.
       */}
      <section id="quem-somos" className="border-b border-white/10 bg-[color:var(--color-bg-900)]/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">Quem Somos</p>
          <h2 className="mt-4 max-w-4xl font-heading text-5xl uppercase leading-[0.95] tracking-[0.05em] text-[color:var(--color-text-100)] sm:text-6xl lg:text-7xl">
            Estrada, Irmandade e Tradição
          </h2>
          <p className="mt-6 max-w-[73ch] whitespace-pre-line text-justify text-base leading-6 text-[color:var(--color-text-300)] sm:text-lg">
          {`Cinco amigos motociclistas...

            Unidos por laços de afinidade...

            No intervalo de um almoço, no restaurante Yamaga, em Ananindeua-PA, conversavam como fariam para fazer seus passeios de moto, se carregariam algum Brasão em seus coletes ou usariam coletes lisos. Foi assim que surgiu a ideia de montar um grupo, um moto clube. E por que OS PAPAS? O nome seria uma forma de homenagem ao amigo Papa XXIII, devido sua experiência no motociclismo, e a palavra Papas, do grego Pappas, era utilizada carinhosamente para designar a figura do Pai, e como todos são filhos do pai, assim, nos tornaríamos IRMÃOS NA ESTRADA, cuja frase em Latim “ FRATRES IN VIA” escolhida por nosso vice, Da Pop, está representada em nosso Brasão.`}
          </p>
        </div>
      </section>

      {/**
       * SECTION: Chapter Cards (Sedes)
       * Reusable `ChapterCard` components render chapter previews and
       * navigate visitors to each chapter detail page.
       */}
      {/**
       * SECTION: Reveal Animation Usage
       * Homepage anchor blocks are wrapped in `Reveal` so they fade/slide in
       * when entering the viewport, improving scanability and perceived polish.
       */}
      <Reveal>
        <section id="sedes" className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6 lg:px-8 lg:pt-24">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">Capítulos</p>
          <h2 className="mt-3 font-heading text-5xl uppercase tracking-[0.05em] text-[color:var(--color-text-100)] sm:text-6xl">
            Sedes
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--color-text-300)]">
            Presença em diferentes cidades do Brasil, mantendo o mesmo espírito de estrada e irmandade.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {chapterCards.map((chapter) => (
              <ChapterCard key={chapter.name} {...chapter} />
            ))}
          </div>
        </section>
      </Reveal>

      {/**
       * SECTION: Base Sections Grid
       * Additional homepage anchors (Sobre, Eventos, Filantropia, etc.)
       * are rendered from data to keep structure easy to expand.
       */}
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
