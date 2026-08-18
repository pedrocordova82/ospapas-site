import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { brasiliaEvents } from "@/data/sedes/brasilia/events";
import { events as rioDeJaneiroEvents } from "@/data/sedes/rio-de-janeiro/events";

type EventRecord = {
  title: string;
  metadata: string;
  description: string;
  cta: string;
  href: string;
  coverImage?: string;
  coverImageAlt?: string;
};

const brasiliaSedeAberta = brasiliaEvents.find((event) => event.id === "sede-aberta-11-04-26");
const rioSedeAberta = rioDeJaneiroEvents.find((event) => event.id === "sede-aberta-10-07-26");
const bvRioMarica = rioDeJaneiroEvents.find((event) => event.id === "bv-04-07-26");

const featuredEvent: EventRecord = {
  title: "5º Encontro Nacional do MC Os Papas",
  metadata: "Capital Moto Week • Brasília/DF • 2026",
  description:
    "A cobertura do Encontro Nacional reúne a chegada das regionais, a estrada rumo a Brasília e os registros do MC Os Papas no Capital Moto Week.",
  cta: "Ver registros",
  href: "/eventos/encontro-nacional",
  coverImage: "/images/eventos/encontro-nacional-2026/encontro-nacional/Imagem_01.jpg",
  coverImageAlt: "Integrantes do MC Os Papas no 5º Encontro Nacional em Brasília",
};

const recentEvents: EventRecord[] = [
  {
    title: "Sede Aberta — Regional Brasília",
    metadata: "11 de abril de 2026",
    description:
      "Registros da Sede Aberta da Regional Brasília, com irmãos, convidados, motociclistas e amigos reunidos na capital federal.",
    cta: "Ver fotos e vídeos",
    href: "/sedes/brasilia#sede-aberta-11-04-26",
    coverImage: brasiliaSedeAberta?.coverImage,
    coverImageAlt: brasiliaSedeAberta?.coverImageAlt,
  },
  {
    title: "Sede Aberta — Regional Rio de Janeiro",
    metadata: "10 de julho de 2026",
    description:
      "Cobertura da Sede Aberta da Regional Rio de Janeiro, preservando os momentos de convivência e recepção da irmandade.",
    cta: "Ver fotos",
    href: "/sedes/rio-de-janeiro#sede-aberta-10-07-26",
    coverImage: rioSedeAberta?.coverImage,
    coverImageAlt: rioSedeAberta?.coverImageAlt,
  },
  {
    title: "BV Rio de Janeiro — Maricá",
    metadata: "04 de julho de 2026",
    description:
      "Fotos e vídeos do bate e volta entre Rio de Janeiro e Maricá, em mais um registro de estrada da Regional Rio de Janeiro.",
    cta: "Ver registros",
    href: "/sedes/rio-de-janeiro#bv-04-07-26",
    coverImage: bvRioMarica?.coverImage,
    coverImageAlt: bvRioMarica?.coverImageAlt,
  },
];

export const metadata: Metadata = {
  title: "Eventos | MC Os Papas",
  description: "Registros, histórias, fotos e vídeos de eventos realizados pelo MC Os Papas e suas regionais.",
};

function EventRecordCard({ event, featured = false }: { event: EventRecord; featured?: boolean }) {
  return (
    <Link
      href={event.href}
      className={`group block h-full overflow-hidden rounded-lg border border-white/10 bg-[color:var(--color-bg-900)] transition hover:-translate-y-1 hover:border-[color:var(--color-gold-500)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-950)] ${
        featured ? "lg:grid lg:grid-cols-[1.08fr_0.92fr]" : ""
      }`}
      aria-label={`${event.cta}: ${event.title}`}
    >
      {event.coverImage ? (
        <div className={`relative w-full overflow-hidden ${featured ? "min-h-[18rem] lg:min-h-[26rem]" : "h-56"}`}>
          <Image
            src={event.coverImage}
            alt={event.coverImageAlt ?? event.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            sizes={featured ? "(max-width: 1023px) 100vw, 50vw" : "(max-width: 767px) 100vw, 33vw"}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0)_30%,rgba(11,11,11,0.76)_100%)]" />
        </div>
      ) : null}

      <article className={`flex h-full flex-col p-6 sm:p-7 ${featured ? "lg:p-9" : ""}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">
          {event.metadata}
        </p>
        <h2
          className={`mt-4 text-balance font-heading uppercase tracking-[0.04em] text-white ${
            featured ? "text-4xl sm:text-5xl" : "text-3xl"
          }`}
        >
          {event.title}
        </h2>
        <p className="mt-5 text-sm leading-7 text-[color:var(--color-text-300)] sm:text-base sm:leading-8">
          {event.description}
        </p>
        <span className="mt-auto pt-8 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">
          {event.cta}
        </span>
      </article>
    </Link>
  );
}

export default function EventosPage() {
  return (
    <div className="pb-20">
      <section className="relative isolate min-h-[42vh] overflow-hidden border-b border-white/10">
        <Image
          src="/images/geral/moto-estrada.png"
          alt="Integrantes do MC Os Papas viajando de motocicleta"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.38)_0%,rgba(11,11,11,0.94)_100%)]" />

        <div className="relative mx-auto flex min-h-[42vh] w-full max-w-6xl items-end px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-base uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">
              Registros
            </p>
            <h1 className="mt-3 font-heading text-5xl uppercase tracking-[0.05em] text-white sm:text-6xl lg:text-7xl">
              Eventos
            </h1>
            <p className="mt-5 text-base leading-7 text-[color:var(--color-text-200)] sm:text-lg sm:leading-8">
              Reviva os encontros, viagens, sedes abertas, confraternizações e momentos que marcaram a história recente do MC Os Papas e suas regionais.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-14 sm:px-6 lg:px-8 lg:pt-16">
        <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">
          Destaque
        </p>
        <div className="mt-6">
          <EventRecordCard event={featuredEvent} featured />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">
          Registros recentes
        </p>
        <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">
          Histórias em imagens
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {recentEvents.map((event) => (
            <EventRecordCard key={event.href} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
}
