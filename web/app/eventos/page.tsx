import type { Metadata } from "next";
import Image from "next/image";

const months = [
  { id: "julho", label: "Julho", shortLabel: "JUL" },
  { id: "agosto", label: "Agosto", shortLabel: "AGO" },
  { id: "setembro", label: "Setembro", shortLabel: "SET" },
  { id: "outubro", label: "Outubro", shortLabel: "OUT" },
  { id: "novembro", label: "Novembro", shortLabel: "NOV" },
  { id: "dezembro", label: "Dezembro", shortLabel: "DEZ" },
] as const;

type MonthId = (typeof months)[number]["id"];

type Event = {
  id: string;
  month: MonthId;
  dateLabel: string;
  title: string;
  organizer: string;
  location?: string;
  type: string;
  status?: string;
  featured?: boolean;
};

const events: Event[] = [
  {
    id: "petropolis-motofest-2026",
    month: "julho",
    dateLabel: "11",
    title: "Petrópolis Motofest",
    organizer: "Regional Rio de Janeiro",
    location: "Petrópolis-RJ",
    type: "Encontro",
    featured: true,
  },
  {
    id: "cmw-2026",
    month: "julho",
    dateLabel: "23 JUL a 01 AGO",
    title: "CMW2026",
    organizer: "MC Os Papas",
    type: "Evento motociclístico",
    featured: true,
  },
  {
    id: "5-encontro-nacional-mc-os-papas-2026",
    month: "julho",
    dateLabel: "24 a 26",
    title: "5º Encontro Nacional do MC Os Papas",
    organizer: "Regional Brasília",
    location: "CMW",
    type: "Encontro Nacional",
  },
  {
    id: "rio-das-flores-motofest-2026",
    month: "agosto",
    dateLabel: "01 a 02",
    title: "Rio das Flores Motofest",
    organizer: "Regional Rio de Janeiro",
    type: "Encontro",
  },
  {
    id: "custom-bike-riders-10-anos",
    month: "agosto",
    dateLabel: "15",
    title: "Custom Bike Riders 10 anos",
    organizer: "Regional São Miguel do Oeste",
    location: "Chapecó-SC",
    type: "Encontro",
  },
  {
    id: "anjos-da-ilha-2026",
    month: "agosto",
    dateLabel: "21 a 23",
    title: "Evento “Anjos da Ilha”",
    organizer: "Nacional",
    type: "Evento",
    featured: true,
  },
  {
    id: "aniversario-cem-milhas-mc-2026",
    month: "agosto",
    dateLabel: "23",
    title: "Aniversário do Cem Milhas MC",
    organizer: "Regional Rio de Janeiro",
    type: "Aniversário",
  },
  {
    id: "moto-amigo-2026",
    month: "setembro",
    dateLabel: "18 a 19",
    title: "Moto Amigo",
    organizer: "Regional São Miguel do Oeste",
    location: "Mondaí-SC",
    type: "Encontro",
  },
  {
    id: "acao-social-escola-dois-irmaos-2026",
    month: "outubro",
    dateLabel: "10",
    title: "Ação Social com as crianças da Escola da Comunidade Dois Irmãos",
    organizer: "Regional São Miguel do Oeste",
    type: "Ação Social",
  },
  {
    id: "aniversario-regional-smo-2026",
    month: "novembro",
    dateLabel: "21",
    title: "6º Aniversário da Regional SMO",
    organizer: "Regional São Miguel do Oeste",
    type: "Aniversário",
  },
  {
    id: "confraternizacao-nacional-2026",
    month: "dezembro",
    dateLabel: "A definir",
    title: "Confraternização Interna de Fim de Ano da Nacional",
    organizer: "Nacional",
    type: "Confraternização",
    status: "A confirmar",
  },
  {
    id: "confraternizacao-regional-rj-2026",
    month: "dezembro",
    dateLabel: "12",
    title: "Confraternização Interna de Fim de Ano da Regional RJ",
    organizer: "Regional Rio de Janeiro",
    type: "Confraternização",
  },
  {
    id: "confraternizacao-regional-smo-2026",
    month: "dezembro",
    dateLabel: "A definir",
    title: "Confraternização Interna de Fim de Ano da Regional SMO",
    organizer: "Regional São Miguel do Oeste",
    type: "Confraternização",
    status: "A confirmar",
  },
];

export const metadata: Metadata = {
  title: "Eventos | MC Os Papas",
  description: "Agenda 2026 de encontros, aniversários, ações sociais e eventos do MC Os Papas.",
};

function EventCard({ event, featured = false }: { event: Event; featured?: boolean }) {
  const month = months.find((item) => item.id === event.month);

  return (
    <article
      className={`flex h-full flex-col border bg-[color:var(--color-bg-900)] ${
        featured
          ? "rounded-lg border-[color:var(--color-gold-500)]/35 p-6"
          : "rounded-lg border-white/10 p-5"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">
            {month?.shortLabel}
          </p>
          <p className={`mt-1 font-heading uppercase leading-none text-white ${featured ? "text-4xl" : "text-3xl"}`}>
            {event.dateLabel}
          </p>
        </div>
        <span className="max-w-[11rem] rounded-sm border border-white/10 px-2.5 py-1 text-right text-[10px] font-semibold uppercase leading-4 tracking-[0.1em] text-[color:var(--color-text-300)]">
          {event.type}
        </span>
      </div>

      <h3 className={`mt-6 font-heading uppercase tracking-[0.04em] text-white ${featured ? "text-3xl" : "text-2xl"}`}>
        {event.title}
      </h3>
      <div className="mt-auto pt-5 text-sm leading-6 text-[color:var(--color-text-300)]">
        <p>{event.organizer}</p>
        {event.location ? <p className="text-white/75">{event.location}</p> : null}
        {event.status ? (
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-gold-500)]">
            {event.status}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export default function EventosPage() {
  const featuredEvents = events.filter((event) => event.featured);

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
              Agenda
            </p>
            <h1 className="mt-3 font-heading text-5xl uppercase tracking-[0.05em] text-white sm:text-6xl lg:text-7xl">
              Eventos
            </h1>
            <p className="mt-5 text-base leading-7 text-[color:var(--color-text-200)] sm:text-lg sm:leading-8">
              Acompanhe os principais encontros, aniversários, ações sociais e eventos motociclísticos com participação do MC Os Papas e suas regionais.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-14 sm:px-6 lg:px-8 lg:pt-16">
        <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">
          Agenda 2026
        </p>
        <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">
              Destaques
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredEvents.map((event) => (
            <EventCard key={event.id} event={event} featured />
          ))}
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">
          Calendário anual
        </p>

        <div className="mt-4 space-y-14">
          {months.map((month) => {
            const monthEvents = events.filter((event) => event.month === month.id);

            return (
              <section key={month.id} aria-labelledby={`month-${month.id}`} className="border-t border-white/10 pt-8">
                <h2
                  id={`month-${month.id}`}
                  className="font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl"
                >
                  {month.label}
                </h2>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {monthEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
