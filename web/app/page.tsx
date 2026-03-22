// TESTE DEPLOY VERCEL - confirmar push
import { SedeCard } from "@/components/sedes/SedeCard";
import { Reveal } from "@/components/ui/Reveal";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const sedeCards = [
    {
      name: "Pará",
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

  // Traz os blocos de identidade para a home para fortalecer a narrativa
  // logo após a apresentação institucional do Moto Clube.
  const identityCards = [
    {
      label: "Nome",
      title: "OS PAPAS",
      text: "O nome surgiu como uma forma de homenagear o amigo Papa XXIII, devido sua experiência no motociclismo, e a palavra Papas, do grego Pappas, era utilizada carinhosamente para designar a figura do Pai.",
    },
    {
      label: "Irmandade",
      title: "FRATRES IN VIA",
      text: "Como todos são filhos do Pai, assim, nos tornaríamos IRMÃOS NA ESTRADA, cuja frase em latim “FRATRES IN VIA” escolhida por nosso vice, Da Pop, está representada em nosso Brasão.",
    },
  ];

  return (
    <div className="pb-20">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[url('/images/geral/capa-inicial-page.png')] bg-cover bg-center brightness-75" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.15),transparent_60%)]" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-40">
          <img src="/images/geral/logo-ospapas.png" alt="Logo do MC Os Papas" className="mb-6 h-28 w-28 sm:mb-8 sm:h-40 sm:w-40" />
          <h1 className="mt-2 max-w-3xl text-balance font-heading text-5xl uppercase leading-[0.9] tracking-[0.05em] text-white sm:text-7xl lg:text-8xl">
            MC OS PAPAS
          </h1>
          <p className="mt-6 text-sm uppercase tracking-[0.2em] text-white/80 sm:text-base sm:tracking-[0.24em]">FRATRES IN VIA</p>
          <p className="mt-8 max-w-2xl text-base leading-7 text-white/80 sm:mt-10 sm:text-lg sm:leading-8">
            A irmandade em movimento, com presença nacional, história de estrada e compromisso com a comunidade.
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

      <section id="quem-somos" className="border-b border-white/10 bg-[color:var(--color-bg-900)]/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">Quem Somos</p>
          <h2 className="mt-4 max-w-4xl font-heading text-5xl uppercase leading-[0.95] tracking-[0.05em] text-[color:var(--color-text-100)] sm:text-6xl lg:text-7xl">
            Estrada, Irmandade e Tradição
          </h2>
          {/* Ajusta a largura do texto para alinhar com os cards abaixo,
              garantindo consistência visual e melhor ritmo de leitura. */}
          <p className="mt-6 max-w-6xl whitespace-pre-line text-justify text-base leading-6 text-[color:var(--color-text-300)] sm:text-lg">
          {`Cinco amigos motociclistas...

            Unidos por laços de afinidade...

            No intervalo de um almoço, no restaurante Yamaga, em Ananindeua-PA, conversavam como fariam para fazer seus passeios de moto, se carregariam algum Brasão em seus coletes ou usariam coletes lisos. Foi assim que surgiu a ideia de montar um grupo, um moto clube. Dessa forma, em 20 de setembro de 2014 nasceu o MC OS PAPAS, entidade sem funs lucrativos, construída sob a forma de assosiação.`}
          </p>
          <div className="mt-8 grid gap-6 sm:mt-10 lg:grid-cols-2">
            {identityCards.map((card) => (
              <article key={card.title} className="rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] p-6 sm:p-8">
                <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">{card.label}</p>
                <h3 className="mt-3 font-heading text-3xl uppercase tracking-[0.05em] text-white sm:text-4xl">{card.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-300)]">{card.text}</p>
              </article>
            ))}
          </div>

          {/* Fecha o bloco institucional com a navegação para aprofundamento,
              depois que a identidade principal já foi apresentada. */}
          <Link
            href="/sobre"
            className="group mt-8 inline-flex items-center gap-2 rounded-md border border-[color:var(--color-gold-500)] px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--color-gold-500)] transition-all duration-200 hover:scale-105 hover:bg-[color:var(--color-gold-500)] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-900)]"
          >
            <span className="text-lg leading-none transition-transform duration-200 group-hover:rotate-90">
              +
            </span>
            Saiba mais
          </Link>
        </div>
      </section>

      <Reveal>
        <section id="sedes" className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6 lg:px-8 lg:pt-24">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">Onde Estamos</p>
          <h2 className="mt-3 font-heading text-5xl uppercase tracking-[0.05em] text-[color:var(--color-text-100)] sm:text-6xl">
            Sedes
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--color-text-300)]">
            Presença em diferentes cidades do Brasil, mantendo o mesmo espírito de estrada e irmandade.
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
