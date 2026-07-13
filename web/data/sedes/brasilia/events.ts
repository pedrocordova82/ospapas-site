import type { EventGalleryItem } from "@/components/ui/EventGalleryModal";

const sedeAberta110426BasePath = "/images/brasilia/events/sede-aberta-11-04-26";
const visitaMcbda210326BasePath = "/images/brasilia/events/visita-mcbda-11-03-26";

const sedeAberta110426Images = [
  `${sedeAberta110426BasePath}/imagem-01.jpeg`,
  `${sedeAberta110426BasePath}/imagem-02.jpeg`,
  `${sedeAberta110426BasePath}/imagem-03.jpeg`,
  `${sedeAberta110426BasePath}/imagem-04.jpeg`,
  `${sedeAberta110426BasePath}/imagem-05.jpeg`,
  `${sedeAberta110426BasePath}/imagem-06.jpeg`,
  `${sedeAberta110426BasePath}/imagem-07.jpeg`,
  `${sedeAberta110426BasePath}/imagem-08.jpeg`,
  `${sedeAberta110426BasePath}/imagem-09.jpeg`,
];

const sedeAberta110426ImageAlts = sedeAberta110426Images.map(
  () => "Integrantes e convidados durante a Sede Aberta da Regional Brasília em 11 de abril de 2026",
);

const visitaMcbda210326Images = [
  `${visitaMcbda210326BasePath}/imagem-01.jpeg`,
  `${visitaMcbda210326BasePath}/imagem-02.jpeg`,
  `${visitaMcbda210326BasePath}/imagem-03.jpeg`,
];

const visitaMcbda210326ImageAlts = visitaMcbda210326Images.map(
  () => "Integrantes do MC Os Papas Regional Brasília durante a visita ao aniversário do MC Bodes do Asfalto — Facção Taguatinga, em 21 de março de 2026",
);

export const brasiliaEvents: EventGalleryItem[] = [
  {
    title: "SEDE ABERTA",
    date: "11 DE ABRIL DE 2026",
    location: "Brasília",
    coverImage: sedeAberta110426Images[0],
    coverImageAlt: "Integrantes e convidados durante a Sede Aberta da Regional Brasília em 11 de abril de 2026",
    images: sedeAberta110426Images,
    imageAlts: sedeAberta110426ImageAlts,
    videos: [
      {
        src: `${sedeAberta110426BasePath}/video-01.mp4`,
        poster: sedeAberta110426Images[0],
        label: "Vídeo da Sede Aberta da Regional Brasília em 11 de abril de 2026",
        type: "video/quicktime",
      },
      {
        src: `${sedeAberta110426BasePath}/video-02.mp4`,
        poster: sedeAberta110426Images[1],
        label: "Vídeo da Sede Aberta da Regional Brasília em 11 de abril de 2026",
        type: "video/quicktime",
      },
      {
        src: `${sedeAberta110426BasePath}/video-03.mp4`,
        poster: sedeAberta110426Images[2],
        label: "Vídeo da Sede Aberta da Regional Brasília em 11 de abril de 2026",
        type: "video/quicktime",
      },
      {
        src: `${sedeAberta110426BasePath}/video-04.mp4`,
        poster: sedeAberta110426Images[3],
        label: "Vídeo da Sede Aberta da Regional Brasília em 11 de abril de 2026",
        type: "video/quicktime",
      },
      {
        src: `${sedeAberta110426BasePath}/video-05.mp4`,
        poster: sedeAberta110426Images[4],
        label: "Vídeo da Sede Aberta da Regional Brasília em 11 de abril de 2026",
        type: "video/quicktime",
      },
      {
        src: `${sedeAberta110426BasePath}/video-06.mp4`,
        poster: sedeAberta110426Images[5],
        label: "Vídeo da Sede Aberta da Regional Brasília em 11 de abril de 2026",
        type: "video/quicktime",
      },
      {
        src: `${sedeAberta110426BasePath}/video-07.mp4`,
        poster: sedeAberta110426Images[6],
        label: "Vídeo da Sede Aberta da Regional Brasília em 11 de abril de 2026",
        type: "video/quicktime",
      },
    ],
  },
  {
    title: "VISITA AO ANIVERSÁRIO DO MC BODES DO ASFALTO — FACÇÃO TAGUATINGA",
    date: "21 DE MARÇO DE 2026",
    coverImage: visitaMcbda210326Images[0],
    coverImageAlt: "Integrantes do MC Os Papas Regional Brasília durante a visita ao aniversário do MC Bodes do Asfalto — Facção Taguatinga, em 21 de março de 2026",
    images: visitaMcbda210326Images,
    imageAlts: visitaMcbda210326ImageAlts,
  },
  {
    title: "Inauguração da Nova Sede de Brasília",
    date: "14/03/2026",
    location: "Brasília",
    coverImage: "/images/brasilia/events/inauguracao-sede-14-03-2026/imagem-01.png",
    images: [
      "/images/brasilia/events/inauguracao-sede-14-03-2026/imagem-01.png",
      "/images/brasilia/events/inauguracao-sede-14-03-2026/imagem-02.png",
      "/images/brasilia/events/inauguracao-sede-14-03-2026/imagem-03.png",
      "/images/brasilia/events/inauguracao-sede-14-03-2026/imagem-04.png",
      "/images/brasilia/events/inauguracao-sede-14-03-2026/imagem-05.png",
      "/images/brasilia/events/inauguracao-sede-14-03-2026/imagem-06.png",
      "/images/brasilia/events/inauguracao-sede-14-03-2026/imagem-07.png",
      "/images/brasilia/events/inauguracao-sede-14-03-2026/imagem-08.png",
      "/images/brasilia/events/inauguracao-sede-14-03-2026/imagem-09.png",
      "/images/brasilia/events/inauguracao-sede-14-03-2026/imagem-10.png",
      "/images/brasilia/events/inauguracao-sede-14-03-2026/imagem-11.png",
      "/images/brasilia/events/inauguracao-sede-14-03-2026/imagem-12.png",
      "/images/brasilia/events/inauguracao-sede-14-03-2026/imagem-13.png",
      "/images/brasilia/events/inauguracao-sede-14-03-2026/imagem-14.png",
      "/images/brasilia/events/inauguracao-sede-14-03-2026/imagem-15.png",
      "/images/brasilia/events/inauguracao-sede-14-03-2026/imagem-16.png",
    ],
  },
  {
    title: "Filantropia",
    date: "15/04/2025",
    location: "Brasília",
    coverImage: "/images/brasilia/events/filantropia-15-04-2025/capa.jpg",
    images: [
      "/images/brasilia/events/filantropia-15-04-2025/imagem-01.jpg",
      "/images/brasilia/events/filantropia-15-04-2025/imagem-02.jpg",
      "/images/brasilia/events/filantropia-15-04-2025/imagem-03.jpg",
      "/images/brasilia/events/filantropia-15-04-2025/imagem-04.jpg",
      "/images/brasilia/events/filantropia-15-04-2025/imagem-05.jpg",
      "/images/brasilia/events/filantropia-15-04-2025/imagem-06.jpg",
    ],
  },
  {
    title: "BV Pad Bier",
    date: "30/03/2025",
    location: "Brasília",
    coverImage: "/images/brasilia/events/pad-bier-2025-03-30.jpg",
    images: [
      "/images/brasilia/events/pad-bier-2025-03-30.jpg",
      "/images/brasilia/events/pad-bier-2025-03-30.jpg",
      "/images/brasilia/events/pad-bier-2025-03-30.jpg",
    ],
  },
];
