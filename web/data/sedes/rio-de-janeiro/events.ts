import type { EventGalleryItem } from "@/components/ui/EventGalleryModal";

const sedeAbertaBasePath = "/images/rio-de-janeiro/events/sede-aberta-10-07-26";
const bvRioMaricaBasePath = "/images/rio-de-janeiro/events/bv-04-07-26";

const sedeAbertaImages = [
  `${sedeAbertaBasePath}/imagem-01.jpeg`,
  `${sedeAbertaBasePath}/imagem-02.jpeg`,
  `${sedeAbertaBasePath}/imagem-03.jpeg`,
  `${sedeAbertaBasePath}/imagem-04.jpeg`,
  `${sedeAbertaBasePath}/imagem-05.jpeg`,
  `${sedeAbertaBasePath}/imagem-06.jpeg`,
  `${sedeAbertaBasePath}/imagem-07.jpeg`,
  `${sedeAbertaBasePath}/imagem-08.jpeg`,
  `${sedeAbertaBasePath}/imagem-09.jpeg`,
  `${sedeAbertaBasePath}/imagem-10.jpeg`,
  `${sedeAbertaBasePath}/imagem-11.jpeg`,
  `${sedeAbertaBasePath}/imagem-12.jpeg`,
  `${sedeAbertaBasePath}/imagem-13.jpeg`,
  `${sedeAbertaBasePath}/imagem-14.jpeg`,
  `${sedeAbertaBasePath}/imagem-15.jpeg`,
  `${sedeAbertaBasePath}/imagem-16.jpeg`,
  `${sedeAbertaBasePath}/imagem-17.jpeg`,
  `${sedeAbertaBasePath}/imagem-18.jpeg`,
  `${sedeAbertaBasePath}/imagem-19.jpeg`,
  `${sedeAbertaBasePath}/imagem-20.jpeg`,
  `${sedeAbertaBasePath}/imagem-21.jpeg`,
  `${sedeAbertaBasePath}/imagem-22.jpeg`,
  `${sedeAbertaBasePath}/imagem-23.jpeg`,
  `${sedeAbertaBasePath}/imagem-24.jpeg`,
  `${sedeAbertaBasePath}/imagem-25.jpeg`,
  `${sedeAbertaBasePath}/imagem-26.jpeg`,
  `${sedeAbertaBasePath}/imagem-27.jpeg`,
  `${sedeAbertaBasePath}/imagem-28.jpeg`,
  `${sedeAbertaBasePath}/imagem-29.jpeg`,
  `${sedeAbertaBasePath}/imagem-30.jpeg`,
  `${sedeAbertaBasePath}/imagem-31.jpeg`,
  `${sedeAbertaBasePath}/imagem-32.jpeg`,
];

const bvRioMaricaImages = [
  `${bvRioMaricaBasePath}/imagem-01.jpeg`,
  `${bvRioMaricaBasePath}/imagem-02.jpeg`,
  `${bvRioMaricaBasePath}/imagem-03.jpeg`,
  `${bvRioMaricaBasePath}/imagem-04.jpeg`,
  `${bvRioMaricaBasePath}/imagem-05.jpeg`,
  `${bvRioMaricaBasePath}/imagem-06.jpeg`,
  `${bvRioMaricaBasePath}/imagem-07.jpeg`,
  `${bvRioMaricaBasePath}/imagem-08.jpeg`,
  `${bvRioMaricaBasePath}/imagem-09.jpeg`,
  `${bvRioMaricaBasePath}/imagem-10.jpeg`,
  `${bvRioMaricaBasePath}/imagem-11.jpeg`,
  `${bvRioMaricaBasePath}/imagem-12.jpeg`,
  `${bvRioMaricaBasePath}/imagem-13.jpeg`,
  `${bvRioMaricaBasePath}/imagem-14.jpeg`,
  `${bvRioMaricaBasePath}/imagem-15.jpeg`,
  `${bvRioMaricaBasePath}/imagem-16.jpeg`,
  `${bvRioMaricaBasePath}/imagem-17.jpeg`,
  `${bvRioMaricaBasePath}/imagem-18.jpeg`,
  `${bvRioMaricaBasePath}/imagem-19.jpeg`,
  `${bvRioMaricaBasePath}/imagem-20.jpeg`,
  `${bvRioMaricaBasePath}/imagem-21.jpeg`,
  `${bvRioMaricaBasePath}/imagem-22.jpeg`,
  `${bvRioMaricaBasePath}/imagem-23.jpeg`,
  `${bvRioMaricaBasePath}/imagem-24.jpeg`,
  `${bvRioMaricaBasePath}/imagem-25.jpeg`,
];

const sedeAbertaImageAlts = sedeAbertaImages.map(
  () => "Integrantes e convidados durante a Sede Aberta da Regional Rio de Janeiro em 10 de julho de 2026",
);

const bvRioMaricaImageAlts = bvRioMaricaImages.map(
  () => "Integrantes do MC Os Papas durante o BV entre Rio de Janeiro e Maricá em 4 de julho de 2026",
);

export const events: EventGalleryItem[] = [
  {
    id: "sede-aberta-10-07-26",
    title: "SEDE ABERTA",
    date: "10 DE JULHO DE 2026",
    coverImage: sedeAbertaImages[0],
    coverImageAlt: "Integrantes e convidados durante a Sede Aberta da Regional Rio de Janeiro em 10 de julho de 2026",
    images: sedeAbertaImages,
    imageAlts: sedeAbertaImageAlts,
  },
  {
    id: "bv-04-07-26",
    title: "BV RIO DE JANEIRO — MARICÁ",
    date: "04 DE JULHO DE 2026",
    coverImage: bvRioMaricaImages[0],
    coverImageAlt: "Integrantes do MC Os Papas durante o BV entre Rio de Janeiro e Maricá em 4 de julho de 2026",
    images: bvRioMaricaImages,
    imageAlts: bvRioMaricaImageAlts,
    videos: [
      {
        src: `${bvRioMaricaBasePath}/video-01.mp4`,
        poster: bvRioMaricaImages[0],
        label: "Vídeo do BV do MC Os Papas entre Rio de Janeiro e Maricá em 4 de julho de 2026",
      },
      {
        src: `${bvRioMaricaBasePath}/video-02.mp4`,
        poster: bvRioMaricaImages[1],
        label: "Vídeo do BV do MC Os Papas entre Rio de Janeiro e Maricá em 4 de julho de 2026",
      },
      {
        src: `${bvRioMaricaBasePath}/video-03.mp4`,
        poster: bvRioMaricaImages[2],
        label: "Vídeo do BV do MC Os Papas entre Rio de Janeiro e Maricá em 4 de julho de 2026",
      },
      {
        src: `${bvRioMaricaBasePath}/video-04.mp4`,
        poster: bvRioMaricaImages[3],
        label: "Vídeo do BV do MC Os Papas entre Rio de Janeiro e Maricá em 4 de julho de 2026",
      },
      {
        src: `${bvRioMaricaBasePath}/video-05.mp4`,
        poster: bvRioMaricaImages[4],
        label: "Vídeo do BV do MC Os Papas entre Rio de Janeiro e Maricá em 4 de julho de 2026",
      },
    ],
  },
];
