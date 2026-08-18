import type { Metadata } from "next";
import Link from "next/link";
import { PhilanthropyGallery } from "@/components/filantropia/PhilanthropyGallery";
import { PhilanthropyVideoCarousel } from "@/components/filantropia/PhilanthropyVideoCarousel";

type EncontroMedia = {
  kind: "image";
  src: string;
  alt: string;
};

type EncontroVideo = {
  src: string;
  poster: string;
  label: string;
};

type EncontroSection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  basePath: string;
  completeGalleryAriaLabel: string;
  media: EncontroMedia[];
  videos?: EncontroVideo[];
};

const encontroNacionalBasePath = "/images/eventos/encontro-nacional-2026/encontro-nacional";
const estradaBasePath = "/images/eventos/encontro-nacional-2026/estrada";

const encontroNacionalImageFiles = [
  "Imagem_01.jpg",
  "Imagem_02.jpg",
  "Imagem_03.jpg",
  "Imagem_04.jpg",
  "Imagem_05.jpg",
  "Imagem_06.jpg",
  "Imagem_07.jpg",
  "Imagem_08.jpg",
  "Imagem_09.jpg",
  "Imagem_10.jpg",
  "Imagem_11.jpg",
  "Imagem_12.jpg",
  "Imagem_13.jpg",
  "Imagem_14.jpg",
  "Imagem_15.jpg",
  "Imagem_16.jpg",
  "Imagem_17.jpg",
  "Imagem_18.jpg",
  "Imagem_19.jpg",
  "Imagem_20.jpg",
  "Imagem_21.jpg",
  "Imagem_22.jpg",
  "Imagem_23.jpg",
  "Imagem_24.jpg",
  "Imagem_25.jpg",
  "Imagem_26.jpg",
  "Imagem_27.jpg",
  "Imagem_28.jpg",
  "Imagem_29.jpg",
  "Imagem_30.jpg",
] as const;

const estradaImageFiles = [
  "Imagem_01.jpg",
  "Imagem_02.jpg",
  "Imagem_03.jpg",
  "Imagem_04.jpg",
  "Imagem_05.jpg",
  "Imagem_06.jpg",
  "Imagem_07.jpg",
  "Imagem_08.jpg",
  "Imagem_09.jpg",
  "Imagem_10.jpg",
  "Imagem_11.jpg",
  "Imagem_12.jpg",
  "Imagem_13.jpg",
  "Imagem_14.jpg",
  "Imagem_15.jpg",
  "Imagem_16.jpg",
  "Imagem_17.jpg",
  "Imagem_18.jpg",
] as const;

const estradaVideoFiles = [
  "Video_01.mp4",
  "Video_02.mp4",
  "Video_03.mp4",
  "Video_04.mp4",
  "Video_05.mp4",
  "Video_06.mp4",
  "Video_07.mp4",
  "Video_08.mp4",
] as const;

// A lista explícita de mídias mantém compatibilidade com a exportação estática, sem leitura de diretórios em tempo de execução.
function createImageMedia(basePath: string, filenames: readonly string[], altBase: string): EncontroMedia[] {
  return filenames.map((filename, index) => ({
    kind: "image",
    src: `${basePath}/${filename}`,
    alt: `${altBase}, registro ${index + 1}.`,
  }));
}

function createRoadVideos(): EncontroVideo[] {
  return estradaVideoFiles.map((filename, index) => ({
    src: `${estradaBasePath}/${filename}`,
    poster: `${estradaBasePath}/${estradaImageFiles[index]}`,
    label: `Vídeo ${String(index + 1).padStart(2, "0")}`,
  }));
}

// A estrutura separa os registros do encontro dos deslocamentos na estrada.
const encontroNacionalSections: EncontroSection[] = [
  {
    id: "encontro-nacional",
    eyebrow: "5º ENCONTRO NACIONAL",
    title: "O 5º Encontro Nacional",
    description:
      "O 5º Encontro Nacional marcou a presença de irmãos de Belém, Rio de Janeiro e Brasília, fortalecendo os laços que unem o MC Os Papas em diferentes regiões do Brasil.",
    basePath: encontroNacionalBasePath,
    completeGalleryAriaLabel: "Abrir galeria completa do 5º Encontro Nacional",
    media: createImageMedia(
      encontroNacionalBasePath,
      encontroNacionalImageFiles,
      "Registro do 5º Encontro Nacional do MC Os Papas em Brasília durante o Capital Moto Week 2026",
    ),
  },
  {
    id: "estrada",
    eyebrow: "NA ESTRADA",
    title: "Rumo a Brasília",
    description:
      "A estrada também fez parte do encontro. Irmãos de outras regiões cruzaram caminhos até Brasília para viver esse momento nacional do MC Os Papas.",
    basePath: estradaBasePath,
    completeGalleryAriaLabel: "Abrir galeria completa da estrada rumo a Brasília",
    media: createImageMedia(
      estradaBasePath,
      estradaImageFiles,
      "Integrantes do MC Os Papas na estrada rumo a Brasília para o 5º Encontro Nacional em 2026",
    ),
    videos: createRoadVideos(),
  },
];

const encontroInfo = [
  { label: "Local", value: "Brasília/DF" },
  { label: "Cenário", value: "Capital Moto Week" },
  { label: "Período", value: "24 a 26 de julho de 2026" },
  { label: "Regionais presentes", value: "Belém, Rio de Janeiro e Brasília" },
];

export const metadata: Metadata = {
  title: "Encontro Nacional | MC Os Papas",
  description:
    "Registros do 5º Encontro Nacional do MC Os Papas, realizado em Brasília durante o Capital Moto Week 2026.",
  alternates: {
    canonical: "https://mcospapas.com.br/eventos/encontro-nacional",
  },
};

function MediaGrid({ section }: { section: EncontroSection }) {
  if (section.media.length === 0) {
    return (
      <div className="mt-8 rounded-lg border border-dashed border-white/15 bg-black/20 px-5 py-6 sm:px-6">
        <p className="text-sm leading-6 text-[color:var(--color-text-300)]">
          As fotos e vídeos desta etapa serão publicados em breve.
        </p>
      </div>
    );
  }

  const images = section.media.map((media) => media.src);
  const imageAlts = section.media.map((media) => media.alt);

  return (
    <PhilanthropyGallery
      actionTitle={section.title}
      images={images}
      imageAlts={imageAlts}
      galleryLabel={`Galeria de ${section.title}`}
      previewLimit={9}
      completeGalleryAriaLabel={section.completeGalleryAriaLabel}
    />
  );
}

function RoadVideos({ videos }: { videos: EncontroVideo[] }) {
  return (
    <PhilanthropyVideoCarousel
      actionTitle="estrada rumo a Brasília para o 5º Encontro Nacional"
      videos={videos}
      previewLimit={4}
      completeGalleryAriaLabel="Abrir todos os vídeos da estrada rumo a Brasília"
    />
  );
}

export default function EncontroNacionalPage() {
  return (
    <div className="pb-20">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(20,20,20,0.98)_0%,rgba(11,11,11,0.96)_52%,rgba(35,27,5,0.82)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[color:var(--color-gold-500)]/30" />

        <div className="relative mx-auto grid min-h-[58vh] w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8 lg:py-20">
          <div className="max-w-4xl">
            <p className="text-base uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">
              Encontro Nacional
            </p>
            <h1 className="mt-3 text-balance font-heading text-5xl uppercase tracking-[0.05em] text-white sm:text-6xl lg:text-7xl">
              Encontro Nacional
            </h1>
            <h2 className="mt-5 text-balance font-heading text-3xl uppercase tracking-[0.05em] text-white/90 sm:text-4xl lg:text-5xl">
              5º Encontro Nacional do MC Os Papas
            </h2>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--color-gold-400)] sm:text-base">
              Capital Moto Week • Brasília/DF • 2026
            </p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.14em] text-white/80 sm:text-base">
              24 a 26 de julho de 2026
            </p>
            <p className="mt-8 max-w-3xl text-base leading-7 text-[color:var(--color-text-300)] sm:text-lg sm:leading-8">
              Em 2026, o MC Os Papas realizou seu 5º Encontro Nacional em Brasília, durante o
              Capital Moto Week, reunindo irmãos de Belém, Rio de Janeiro e Brasília em dias de
              estrada, irmandade e celebração.
            </p>
          </div>

          <div className="flex justify-start lg:justify-end">
            <dl className="w-full rounded-lg border border-white/10 bg-[color:var(--color-bg-900)]/75 p-5 sm:max-w-md sm:p-6 lg:max-w-[20rem]">
              {encontroInfo.map((item) => (
                <div
                  key={item.label}
                  className="border-b border-white/10 py-4 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold leading-6 text-white sm:text-base">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-14 lg:py-16" aria-labelledby="institucional-title">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">
            Marco nacional
          </p>
          <h2
            id="institucional-title"
            className="mt-3 max-w-3xl font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl"
          >
            Brasília como ponto de encontro
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[color:var(--color-text-300)] sm:text-lg sm:leading-8">
            A partir desta edição, Brasília e o Capital Moto Week passam a ser o ponto de
            encontro oficial dos próximos Encontros Nacionais do MC Os Papas.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {encontroNacionalSections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-title`}
            className="border-b border-white/10 py-14 lg:py-16"
          >
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)]">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">
                  {section.eyebrow}
                </p>
                <h2
                  id={`${section.id}-title`}
                  className="mt-3 text-balance font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl"
                >
                  {section.title}
                </h2>
                <p className="mt-5 text-base leading-7 text-[color:var(--color-text-300)]">
                  {section.description}
                </p>
              </div>

              <div>
                {section.id === "estrada" ? (
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
                    Fotos da estrada
                  </h3>
                ) : null}
                {section.media.length === 0 ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
                    Galeria em preparação
                  </p>
                ) : null}
                <MediaGrid section={section} />
                <p className="sr-only">Base pública futura: {section.basePath}</p>

                {section.videos && section.videos.length > 0 ? (
                  <div className="mt-10">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
                      Vídeos da estrada
                    </h3>
                    <RoadVideos videos={section.videos} />
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="mx-auto w-full max-w-6xl px-4 pt-14 sm:px-6 lg:px-8 lg:pt-16">
        <div className="flex flex-col gap-5 border-y border-white/10 py-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">
              Agenda completa
            </p>
            <h2 className="mt-2 font-heading text-3xl uppercase tracking-[0.05em] text-white sm:text-4xl">
              Veja outros eventos do MC Os Papas
            </h2>
          </div>
          <Link
            href="/eventos"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[color:var(--color-gold-500)] px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--color-gold-500)] transition hover:bg-[color:var(--color-gold-500)] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-950)] sm:w-auto"
          >
            Voltar para Eventos
          </Link>
        </div>
      </section>
    </div>
  );
}
