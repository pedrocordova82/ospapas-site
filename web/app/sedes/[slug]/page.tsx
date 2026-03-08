import Image from "next/image";
import { notFound } from "next/navigation";
import { Instagram } from "lucide-react";
import { chapters } from "@/data/chapters/chapters";
import { brasiliaEvents } from "@/data/chapters/brasilia/events";
import { brasiliaGallery } from "@/data/chapters/brasilia/gallery";
import { brasiliaMembers } from "@/data/chapters/brasilia/members";
import { ChapterGallery } from "@/components/sedes/ChapterGallery";

/**
 * SECTION: Dynamic Route Props
 * App Router provides `params` with the current chapter slug from `/sedes/[slug]`.
 */
type ChapterPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/**
 * SECTION: WhatsApp Link Builder
 * Normalizes any phone format into digits-only to build a valid wa.me URL.
 */
function toWaMe(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

/**
 * SECTION: Dynamic Chapter Page
 * Resolves chapter content based on route slug and renders:
 * hero, institutional info, contact actions, and map embed.
 */
export default async function ChapterPage({ params }: ChapterPageProps) {
  /**
   * SECTION: Slug Resolution
   * Reads the dynamic segment and searches for a chapter with matching slug.
   */
  const { slug } = await params;
  const chapter = chapters.find((item) => item.slug === slug);

  /**
   * SECTION: Not Found Handling
   * If no chapter matches the slug, delegate to Next.js 404 via `notFound()`.
   */
  if (!chapter) {
    notFound();
  }

  /**
   * SECTION: Map Embed URL
   * Uses chapter latitude/longitude to build a Google Maps iframe source.
   */
  const mapSrc = `https://www.google.com/maps?q=${chapter.latitude},${chapter.longitude}&output=embed`;
  const mapsLink = `https://www.google.com/maps?q=${chapter.latitude},${chapter.longitude}`;
  const chapterEvents = slug === "brasilia" ? brasiliaEvents : [];
  const chapterGallery = slug === "brasilia" ? brasiliaGallery : [];
  const chapterMembers = slug === "brasilia" ? brasiliaMembers : [];

  return (
    <div className="pb-16">
      {/**
       * SECTION: Hero
       * Displays chapter-specific cover image, overlay, and identity metadata.
       */}
      <section className="relative isolate min-h-[48vh] overflow-hidden border-b border-white/10">
        <Image
          src={chapter.image}
          alt={`Capa da ${chapter.name}`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.42)_0%,rgba(11,11,11,0.92)_100%)]" />

        <div className="relative mx-auto flex min-h-[48vh] w-full max-w-6xl items-end px-4 py-10 sm:px-6 lg:px-8">
          <div>
            <p className="text-base uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">{chapter.type}</p>
            <h1 className="mt-3 font-heading text-5xl uppercase tracking-[0.04em] text-white sm:text-6xl lg:text-7xl">
              {chapter.name}
            </h1>
            <p className="mt-4 text-sm uppercase tracking-[0.14em] text-white/80">
              {chapter.state}
            </p>
          </div>
        </div>
      </section>

      {/**
       * SECTION: Information + Contact
       * Left column contains description, optional Instagram, and WhatsApp CTA.
       * Right column contains the embedded map for physical location context.
       */}
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 pt-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <article className="rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Informações</p>
          <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white">Sobre a Sede</h2>
          <p className="mt-5 text-sm leading-7 text-white/80 text-justify">{chapter.description}</p>

          <div className="mt- space-y-1 text-sm">
            {chapter.instagram ? (
              <div className="mt-4 flex items-center gap-2 text-base text-[color:var(--color-text-300)]">
                <Instagram size={20} className="text-gray-400" />
                <span className="text-[color:var(--color-text-300)]">Instagram:</span>
                <a
                  href={`https://instagram.com/${chapter.instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[color:var(--color-gold-500)] hover:underline"
                >
                  {chapter.instagram}
                </a>
              </div>
            ) : null}

            <a
              href={toWaMe(chapter.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
            >
              Falar no WhatsApp
            </a>
          </div>
        </article>

        <article className="overflow-hidden rounded-xl border border-white/10 bg-[color:var(--color-bg-900)]">
          <p className="px-6 pt-6 text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)] sm:px-8">Mapa</p>
          <h2 className="px-6 pb-4 pt-2 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:px-8">Localização</h2>
          <div className="aspect-[16/11] w-full border-t border-white/10">
            <iframe
              title={`Mapa da ${chapter.name}`}
              src={mapSrc}
              className="h-full w-full pointer-events-none"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          {/**
           * SECTION: Full Google Maps Access
           * The iframe provides a quick in-page preview, while this link opens
           * the exact coordinates in Google Maps with full interaction.
           */}
          <div className="px-6 pb-6 pt-4 sm:px-8">
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-[color:var(--color-gold-500)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-gold-500)] transition hover:bg-[color:var(--color-gold-500)] hover:text-black"
            >
              Abrir no Google Maps
            </a>
          </div>
        </article>
      </section>

      {/**
       * SECTION: Chapter Extra Content
       * Brasília is the first chapter with modular Events, Gallery, and Members
       * datasets. These blocks are rendered after the map using the chapter slug.
       */}
      {chapterMembers.length > 0 ? (
        <section className="mx-auto w-full max-w-6xl px-4 pt-14 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Irmandade</p>
          <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">Membros</h2>
          <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
            {chapterMembers.map((member) => (
              <article key={member.name} className="group">
                <div className="overflow-hidden rounded-lg aspect-[2/3] shadow-lg shadow-black/40">
                  <div className="relative h-full w-full">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                </div>
                <div className="mt-1 text-center">
                  <h3 className="font-semibold text-white">{member.name}</h3>
                  <p className="text-sm font-medium tracking-[0.08em] text-[color:var(--color-gold-500)]">{member.role}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      
      {chapterEvents.length > 0 ? (
        <section className="mx-auto w-full max-w-6xl px-4 pt-14 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Agenda</p>
          <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">Eventos</h2>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {chapterEvents.map((event) => (
              <article key={event.title} className="overflow-hidden rounded-xl border border-white/10 bg-[color:var(--color-bg-900)]">
                <div className="relative h-52 w-full">
                  <Image src={event.image} alt={event.title} fill className="object-cover" />
                </div>
                <div className="p-5">
                  <h3 className="font-heading text-3xl uppercase tracking-[0.04em] text-white">{event.title}</h3>
                  <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[color:var(--color-gold-500)]">{event.date}</p>
                  <p className="mt-1 text-sm text-white/80">{event.location}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {chapterGallery.length > 0 ? (
        <section className="mx-auto w-full max-w-6xl px-4 pt-14 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Momentos</p>
          <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">Galeria</h2>
          <ChapterGallery images={chapterGallery} chapterName={chapter.name} />
        </section>
      ) : null}
    </div>
  );
}
