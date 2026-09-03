import type { Metadata } from "next";
import Image from "next/image";
import { HistoricalActionCard } from "@/components/filantropia/HistoricalActionCard";
import { PhilanthropyGallery } from "@/components/filantropia/PhilanthropyGallery";
import { PhilanthropyVideoCarousel } from "@/components/filantropia/PhilanthropyVideoCarousel";

type PhilanthropyAction = {
  id: string;
  eyebrow?: string;
  title: string;
  description: string;
  impact?: string;
  images: string[];
  imageAlts?: string[];
  photoPreviewLimit?: number;
  videos: {
    src: string;
    poster?: string;
    label?: string;
  }[];
  videoPreviewLimit?: number;
  videoGridVariant?: "default" | "compact";
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

const institutoDoCarinhoBasePath = "/images/filantropia/instituto-do-carinho";
const institutoDoCarinhoImages = [
  `${institutoDoCarinhoBasePath}/Imagem_01.jpg`,
  `${institutoDoCarinhoBasePath}/Imagem_02.jpg`,
  `${institutoDoCarinhoBasePath}/Imagem_03.jpg`,
  `${institutoDoCarinhoBasePath}/Imagem_04.jpg`,
  `${institutoDoCarinhoBasePath}/Imagem_05.jpg`,
  `${institutoDoCarinhoBasePath}/Imagem_06.jpg`,
  `${institutoDoCarinhoBasePath}/Imagem_07.jpg`,
  `${institutoDoCarinhoBasePath}/Imagem_08.jpg`,
  `${institutoDoCarinhoBasePath}/Imagem_09.jpg`,
  `${institutoDoCarinhoBasePath}/Imagem_10.jpg`,
  `${institutoDoCarinhoBasePath}/Imagem_11.jpg`,
  `${institutoDoCarinhoBasePath}/Imagem_12.jpg`,
  `${institutoDoCarinhoBasePath}/Imagem_13.jpg`,
  `${institutoDoCarinhoBasePath}/Imagem_14.jpg`,
  `${institutoDoCarinhoBasePath}/Imagem_15.jpg`,
  `${institutoDoCarinhoBasePath}/Imagem_16.jpg`,
  `${institutoDoCarinhoBasePath}/Imagem_17.jpg`,
  `${institutoDoCarinhoBasePath}/Imagem_18.jpg`,
  `${institutoDoCarinhoBasePath}/Imagem_19.jpg`,
  `${institutoDoCarinhoBasePath}/Imagem_20.jpg`,
  `${institutoDoCarinhoBasePath}/Imagem_21.jpg`,
] as const;

const institutoDoCarinhoImageAlts = institutoDoCarinhoImages.map(
  () => "Ação filantrópica do MC Os Papas no Instituto do Carinho, em Ceilândia/DF",
);

const paroquiaRainhaDaPazBasePath = "/images/filantropia/paroquia-ns-rainha-da-paz";
const paroquiaRainhaDaPazImages = [
  `${paroquiaRainhaDaPazBasePath}/imagem_01.jpg`,
  `${paroquiaRainhaDaPazBasePath}/imagem_02.jpg`,
  `${paroquiaRainhaDaPazBasePath}/imagem_03.jpg`,
  `${paroquiaRainhaDaPazBasePath}/imagem_04.jpg`,
  `${paroquiaRainhaDaPazBasePath}/imagem_05.jpg`,
  `${paroquiaRainhaDaPazBasePath}/imagem_06.jpeg`,
  `${paroquiaRainhaDaPazBasePath}/imagem_07.jpg`,
] as const;

const paroquiaRainhaDaPazImageAlts = paroquiaRainhaDaPazImages.map(
  () => "Ação filantrópica de Natal do MC Os Papas na Paróquia Nossa Senhora Rainha da Paz, em Belém/PA",
);

const casaraoDosIdososBasePath = "/images/filantropia/casarao-dos-idosos";

const philanthropyActions: PhilanthropyAction[] = [
  {
    id: "casarao-dos-idosos-irma-benigna",
    eyebrow: "Santa Maria do Pará/PA",
    title: "Casarão dos Idosos Irmã Benigna",
    description:
      "Em 30 de agosto de 2026, o MC Os Papas realizou uma ação filantrópica no Casarão dos Idosos Irmã Benigna, em Santa Maria do Pará/PA, município localizado a aproximadamente 100 km de Belém. A instituição atende atualmente 98 idosos, e a ação contou com a doação de materiais de higiene.",
    impact: "98 idosos atendidos • Doação de materiais de higiene",
    images: [],
    videos: [
      {
        src: `${casaraoDosIdososBasePath}/video-01.mp4`,
        poster: `${casaraoDosIdososBasePath}/poster-video-01.jpg`,
        label: "Vídeo 01 da ação filantrópica do MC Os Papas no Casarão dos Idosos Irmã Benigna",
      },
      {
        src: `${casaraoDosIdososBasePath}/video_02.mp4`,
        poster: `${casaraoDosIdososBasePath}/poster-video-01.jpg`,
        label: "Vídeo 02 da ação filantrópica do MC Os Papas no Casarão dos Idosos Irmã Benigna",
      },
    ],
    videoPreviewLimit: 2,
    videoGridVariant: "compact",
  },
  {
    id: "instituto-do-carinho",
    eyebrow: "Ceilândia/DF",
    title: "Instituto do Carinho",
    description:
      "Durante o 5º Encontro Nacional do MC Os Papas, realizado em Brasília, membros de diferentes regionais participaram de uma ação filantrópica no Instituto do Carinho, em Ceilândia/DF. O momento reforçou o compromisso do motoclube com a solidariedade, a presença fraterna e o cuidado com quem mais precisa.",
    impact: "Ação realizada durante o 5º Encontro Nacional",
    images: [...institutoDoCarinhoImages],
    imageAlts: institutoDoCarinhoImageAlts,
    photoPreviewLimit: 6,
    videos: [
      {
        src: `${institutoDoCarinhoBasePath}/Video_01.mp4`,
        poster: institutoDoCarinhoImages[0],
        label: "Vídeo da ação filantrópica do MC Os Papas no Instituto do Carinho",
      },
      {
        src: `${institutoDoCarinhoBasePath}/Video_02.mp4`,
        poster: institutoDoCarinhoImages[1],
        label: "Vídeo da ação filantrópica do MC Os Papas no Instituto do Carinho",
      },
    ],
    videoPreviewLimit: 2,
    videoGridVariant: "compact",
  },
  {
    id: "paroquia-nossa-senhora-rainha-da-paz",
    eyebrow: "Belém/PA",
    title: "Paróquia Nossa Senhora Rainha da Paz",
    description:
      "No Natal de 2025, o MC Os Papas realizou uma ação filantrópica na Paróquia Nossa Senhora Rainha da Paz, em Belém/PA. A iniciativa reforçou o compromisso do motoclube com a solidariedade, a presença fraterna e o cuidado com a comunidade.",
    impact: "Natal 2025",
    images: [...paroquiaRainhaDaPazImages],
    imageAlts: paroquiaRainhaDaPazImageAlts,
    photoPreviewLimit: 6,
    videos: [
      {
        src: `${paroquiaRainhaDaPazBasePath}/video_01.mp4`,
        poster: paroquiaRainhaDaPazImages[0],
        label: "Vídeo da ação filantrópica de Natal do MC Os Papas na Paróquia Nossa Senhora Rainha da Paz",
      },
      {
        src: `${paroquiaRainhaDaPazBasePath}/video_02.mp4`,
        poster: paroquiaRainhaDaPazImages[1],
        label: "Vídeo da ação filantrópica de Natal do MC Os Papas na Paróquia Nossa Senhora Rainha da Paz",
      },
    ],
    videoPreviewLimit: 2,
    videoGridVariant: "compact",
  },
  {
    id: "abrigo-redentor",
    eyebrow: "Rio de Janeiro/RJ",
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
    eyebrow: "Cidade Estrutural/DF",
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
          src="/images/geral/filantropia.jpg"
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
              <HistoricalActionCard key={action.id} action={action} />
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
                {action.eyebrow ?? "Ação filantrópica"}
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
              {action.impact ? (
                <p className="mt-6 border-l-2 border-[color:var(--color-gold-500)] pl-4 text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--color-gold-400)]">
                  {action.impact}
                </p>
              ) : null}
            </div>

            {action.images.length > 0 ? (
              <div className="mt-10">
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
                  Registros da ação
                </h3>
                <PhilanthropyGallery
                  actionTitle={action.title}
                  images={action.images}
                  imageAlts={action.imageAlts}
                  previewLimit={action.photoPreviewLimit}
                  completeGalleryAriaLabel={`Abrir galeria completa da ação no ${action.title}`}
                />
              </div>
            ) : null}

            {action.videos.length > 0 ? (
              <div className="mt-12">
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
                  {action.videos.length === 1 ? "Vídeo da ação" : "Vídeos da ação"}
                </h3>
                <PhilanthropyVideoCarousel
                  actionTitle={action.title}
                  videos={action.videos}
                  previewLimit={action.videoPreviewLimit}
                  previewGridVariant={action.videoGridVariant}
                  completeGalleryAriaLabel={`Abrir todos os vídeos da ação no ${action.title}`}
                />
              </div>
            ) : null}
          </div>
        </section>
      ))}

    </div>
  );
}
