export type Leader = {
  name: string;
  role: string;
  rank?: string;
  sede?: string;
  image: string;
};

export const leadership: Leader[] = [
  {
    name: "Papa",
    role: "Fundador",
    rank: "Nômade",
    sede: "Belém-PA",
    image: "/images/diretoria/nomade-fundador.jpeg",
  },
  {
    name: "Caveira",
    role: "Presidente",
    rank: "Cardeal",
    sede: "Rio de janeiro-RJ",
    image: "/images/diretoria/caveira-presidente.png",
  },
  {
    name: "Netanf",
    role: "Vice Presidente",
    rank: "Cardeal",
    sede: "Rio de Janeiro-RJ",
    image: "/images/diretoria/netanf-vp.jpeg",
  },
  {
    name: "Khaos",
    role: "Diretor de Marketing",
    rank: "Cardeal",
    image: "/images/diretoria/khaos-diretor-marketing.jpeg",
  },
  {
    name: "Nasa",
    role: "Diretor Financeiro",
    rank: "Cardeal",
    image: "/images/diretoria/nasa_diretor-financeiro.jpeg",
  },
  {
    name: "Sniper",
    role: "Diretor Social",
    rank: "Cardeal",
    image: "/images/diretoria/sniper-diretor-social.png",
  },
  {
    name: "Poodle",
    role: "Diretor Regional Brasília",
    rank: "Cardeal",
    sede: "Brasília-DF",
    image: "/images/diretoria/podle-diretor-brasilia.png",
  },
  {
    name: "Verme",
    role: "Diretor Regional Rio de Janeiro",
    rank: "Cardeal",
    sede: "Rio de Janeiro-RJ",
    image: "/images/diretoria/verme-diretor-rj.jpeg",
  },
];
