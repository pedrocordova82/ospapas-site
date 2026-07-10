import type { Metadata } from "next";
import Image from "next/image";
import { PhilanthropyGallery } from "@/components/filantropia/PhilanthropyGallery";
import { PhilanthropyVideoCarousel } from "@/components/filantropia/PhilanthropyVideoCarousel";

type PhilanthropyAction = {
  id: string;
  title: string;
  description: string;
  images: string[];
  videos: {
    src: string;
    poster: string;
  }[];
};

type HistoricalAction = {
  id: string;
  year: string;
  location: string;
  title: string;
  description: string;
  impact: string;
  image: string;
  alt: string;
};

const historicalActions: HistoricalAction[] = [
  {
    id: "capital-moto-week-2017",
    year: "2017",
    location: "Brasília",
    title: "Capital Moto Week",
    description:
      "Em 2017, o MC Os Papas proporcionou a 100 crianças de uma creche a experiência de participar do Capital Moto Week, em Brasília. A ação uniu solidariedade, inclusão e a paixão pelo motociclismo em um dia de convivência e alegria.",
    impact: "100 crianças participantes",
    image: "/images/filantropia/cmw-2017/filantropia-cmw-2017.jpeg",
    alt: "Ação filantrópica do MC Os Papas com crianças no Capital Moto Week em Brasília, em 2017",
  },
];

const philanthropyActions: PhilanthropyAction[] = [
  {
    id: "abrigo-redentor",
    title: "Abrigo Redentor",
    description:
      "Registro da ação filantrópica realizada no Abrigo Redentor, marcada por presença, solidariedade e cuidado.",
    images: [
      "/images/filantropia/abrigo-redentor/imagem-00.jpeg",
      "/images/filantropia/abrigo-redentor/imagem-01.jpeg",
      "/images/filantropia/abrigo-redentor/imagem-02.jpeg",
      "/images/filantropia/abrigo-redentor/imagem-03.jpeg",
      "/images/filantropia/abrigo-redentor/imagem-04.jpeg",
      "/images/filantropia/abrigo-redentor/imagem_05.jpeg",
      "/images/filantropia/abrigo-redentor/imagem-06.jpeg",
      "/images/filantropia/abrigo-redentor/imagem-07.jpeg",
      "/images/filantropia/abrigo-redentor/imagem-08.jpeg",
      "/images/filantropia/abrigo-redentor/imagem-09.jpeg",
      "/images/filantropia/abrigo-redentor/imagem-10.jpeg",
      "/images/filantropia/abrigo-redentor/imagem-11.jpeg",
    ],
    videos: [
      {
        src: "/images/filantropia/abrigo-redentor/video-00.mp4",
        poster: "/images/filantropia/abrigo-redentor/imagem-00.jpeg",
      },
      {
        src: "/images/filantropia/abrigo-redentor/video-01.mp4",
        poster: "/images/filantropia/abrigo-redentor/imagem-01.jpeg",
      },
      {
        src: "/images/filantropia/abrigo-redentor/video-02.mp4",
        poster: "/images/filantropia/abrigo-redentor/imagem-02.jpeg",
      },
      {
        src: "/images/filantropia/abrigo-redentor/video-03.mp4",
        poster: "/images/filantropia/abrigo-redentor/imagem-03.jpeg",
      },
      {
        src: "/images/filantropia/abrigo-redentor/video-05.mp4",
        poster: "/images/filantropia/abrigo-redentor/imagem-04.jpeg",
      },
      {
        src: "/images/filantropia/abrigo-redentor/video-06.mp4",
        poster: "/images/filantropia/abrigo-redentor/imagem_05.jpeg",
      },
    ],
  },
  {
    id: "viver-associacao",
    title: "Viver Associação",
    description:
      "Registro da ação filantrópica realizada na Viver Associação, reforçando o compromisso do MC Os Papas com solidariedade, presença e serviço.",
    images: [
      "/images/filantropia/viver-associacao/capa.jpg",
      "/images/filantropia/viver-associacao/imagem-01.jpg",
      "/images/filantropia/viver-associacao/imagem-02.jpg",
      "/images/filantropia/viver-associacao/imagem-03.jpg",
      "/images/filantropia/viver-associacao/imagem-04.jpg",
      "/images/filantropia/viver-associacao/imagem-05.jpg",
      "/images/filantropia/viver-associacao/imagem-06.jpg",
    ],
    videos: [],
  },
];

export const metadata: Metadata = {
  title: "Filantropia | MC Os Papas",
  description:
    "Conheça as ações sociais do MC Os Papas e seu compromisso com solidariedade, presença e serviço.",
};

export default function FilantropiaPage() {
  return (
    <div>
      <section className="relative isolate h-[420px] overflow-hidden sm:h-[460px] lg:h-[500px]">
        <Image
          src="/images/geral/maos.jpg"
          alt="Mãos unidas representando solidariedade e cuidado"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,11,11,0.88)_0%,rgba(11,11,11,0.64)_55%,rgba(11,11,11,0.38)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.12)_0%,rgba(11,11,11,0.84)_100%)]" />

        <div className="relative mx-auto flex h-full w-full max-w-6xl items-end px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <div className="max-w-4xl">
            <p className="text-base uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">
              Filantropia
            </p>
            <h1 className="mt-3 text-balance font-heading text-4xl uppercase tracking-[0.04em] text-white sm:text-6xl lg:text-7xl">
              A estrada também nos leva ao encontro de quem precisa
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
              Ações sociais realizadas pelo MC Os Papas, fortalecendo a solidariedade, a irmandade e o
              compromisso de servir.
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="historical-actions-title"
        className="border-t border-white/10 py-16 lg:py-20"
      >
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">
              Memória filantrópica
            </p>
            <h2
              id="historical-actions-title"
              className="mt-3 font-heading text-3xl uppercase tracking-[0.05em] text-white sm:text-5xl"
            >
              Ações que marcaram nossa história
            </h2>
            <p className="mt-5 text-base leading-7 text-[color:var(--color-text-300)]">
              Iniciativas que registram o compromisso do MC Os Papas com presença, cuidado e
              impacto social ao longo da nossa caminhada.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            {historicalActions.map((action) => (
              <article
                key={action.id}
                className="overflow-hidden rounded-lg border border-white/10 bg-[color:var(--color-bg-900)]"
              >
                <div className="grid gap-0 lg:grid-cols-[minmax(0,0.43fr)_minmax(0,0.57fr)]">
                  <div className="bg-black/45 p-3 sm:p-4 lg:p-5">
                    <div className="relative mx-auto aspect-[9/16] w-full max-w-sm overflow-hidden rounded-md bg-black lg:max-w-none">
                      <Image
                        src={action.image}
                        alt={action.alt}
                        fill
                        className="object-contain"
                        sizes="(max-width: 1023px) calc(100vw - 2rem), 470px"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-gold-500)]">
                      {action.location} • {action.year}
                    </p>
                    <h3 className="mt-4 font-heading text-3xl uppercase tracking-[0.05em] text-white sm:text-4xl">
                      {action.title}
                    </h3>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--color-text-300)] sm:text-lg sm:leading-8">
                      {action.description}
                    </p>
                    <p className="mt-8 border-l-2 border-[color:var(--color-gold-500)] pl-4 text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--color-gold-400)] sm:text-base">
                      {action.impact}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {philanthropyActions.map((action) => (
        <section
          key={action.id}
          id={action.id}
          aria-labelledby={`${action.id}-title`}
          className="border-t border-white/10 py-16 lg:py-20"
        >
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">
                Ação filantrópica
              </p>
              <h2
                id={`${action.id}-title`}
                className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl"
              >
                {action.title}
              </h2>
              <p className="mt-5 text-base leading-7 text-[color:var(--color-text-300)]">
                {action.description}
              </p>
            </div>

            <div className="mt-10">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
                Registros da ação
              </h3>
              <PhilanthropyGallery actionTitle={action.title} images={action.images} />
            </div>

            {action.videos.length > 0 ? (
              <div className="mt-12">
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
                  Vídeos da ação
                </h3>
                <PhilanthropyVideoCarousel actionTitle={action.title} videos={action.videos} />
              </div>
            ) : null}
          </div>
        </section>
      ))}

    </div>
  );
}
