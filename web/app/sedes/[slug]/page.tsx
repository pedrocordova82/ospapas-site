import Image from "next/image";
import { notFound } from "next/navigation";
import { chapters } from "@/data/chapters/chapters";

type ChapterPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function toWaMe(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug } = await params;
  const chapter = chapters.find((item) => item.slug === slug);

  if (!chapter) {
    notFound();
  }

  const mapSrc = `https://www.google.com/maps?q=${chapter.latitude},${chapter.longitude}&output=embed`;

  return (
    <div className="pb-16">
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
            <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">{chapter.type}</p>
            <h1 className="mt-3 font-heading text-5xl uppercase tracking-[0.04em] text-white sm:text-6xl lg:text-7xl">
              {chapter.name}
            </h1>
            <p className="mt-4 text-sm uppercase tracking-[0.14em] text-white/80">
              {chapter.city} - {chapter.state}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 pt-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <article className="rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Informações</p>
          <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white">Sobre a Sede</h2>
          <p className="mt-5 text-sm leading-7 text-white/80">{chapter.description}</p>

          <div className="mt-8 space-y-3 text-sm">
            {chapter.instagram ? (
              <p className="text-white/85">
                Instagram:{" "}
                <a
                  href={`https://instagram.com/${chapter.instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[color:var(--color-gold-500)] transition hover:text-[color:var(--color-gold-400)]"
                >
                  {chapter.instagram}
                </a>
              </p>
            ) : null}

            <a
              href={toWaMe(chapter.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-md bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
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
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </article>
      </section>
    </div>
  );
}
