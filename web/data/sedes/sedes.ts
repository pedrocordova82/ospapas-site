import { officialWhatsappNumbers } from "@/data/whatsapp";
import {
  brasiliaOpenHouseEvents,
  type OpenHouseEvent,
} from "@/data/sedes/brasilia/open-house-events";

export type Sede = {
  slug: string
  name: string
  state: string
  type: "Sede" | "Regional" | "Subsede"
  description: string
  instagram?: string
  whatsapp?: string
  image: string
  imageAlt?: string
  latitude: number
  longitude: number
  mapsUrl?: string
  openHouseEvents?: OpenHouseEvent[]
}

export const sedes: Sede[] = [
  {
    slug: "para",
    name: "Belém",
    state: "Pará",
    type: "Sede",
    description: "Localizada na cidade de Ananindeua, Região Metropolitana de Belém, no Estado do Pará, onde em 20 de setembro de 2014, foi fundado o MC OS PAPAS, e por isso é chamada de Nacional, pois deu origem ao Moto Clube.",
    instagram: "@mc_os_papas",
    whatsapp: officialWhatsappNumbers.sedePara,
    image: "/images/para/capa.jpg",
    latitude: -1.365,
    longitude: -48.38759981349188
  },

  {
    slug: "brasilia",
    name: "Brasília",
    state: "Distrito Federal",
    type: "Regional",
    description: "A Regional de Brasília foi criada em 19 de março de 2018, a partir da vontade da Presidência do Moto Clube em se expandir, quando da oportunidade da transferência à trabalho de um dos membros da Regional do Rio de Janeiro para a Capital Federal.",
    instagram: "@mc_os_papas_brasilia",
    whatsapp: officialWhatsappNumbers.brasilia,
    image: "/images/brasilia/capa.jpg",
    latitude: -15.825362906642775,
    longitude: -48.08714023817274,
    mapsUrl: "https://maps.app.goo.gl/6vPTFeUimKh7z2FFA",
    openHouseEvents: brasiliaOpenHouseEvents
  },

  {
    slug: "rio-de-janeiro",
    name: "Rio de Janeiro",
    state: "Rio de Janeiro",
    type: "Regional",
    description: "Localizada na Região Administrativa de Jacarepaguá, na cidade do Rio de Janeiro, foi criada em 19 de maio de 2016, quando o atual Presidente do Moto Clube, Cardeal Caveira, foi transferido à trabalho da cidade de Belém - PA, para a cidade do Rio de Janeiro.",
    instagram: "@mc_os_papas_regional_rj",
    whatsapp: officialWhatsappNumbers.rioDeJaneiro,
    image: "/images/rio-de-janeiro/capa.jpeg",
    latitude: -22.92471083409714,
    longitude: -43.34784851349188
  },

  {
    slug: "sao-miguel-do-oeste",
    name: "São Miguel do Oeste",
    state: "Santa Catarina",
    type: "Regional",
    description: "Foi criada em 21 de novembro de 2020, Sua localização está nas proximidades da Rodovia BR 282, na Linha Gramadinho, S/N.",
    instagram: "@mc_os_papas_sc",
    whatsapp: officialWhatsappNumbers.saoMiguelDoOeste,
    image: "/images/sao-miguel-do-oeste/capa.jpg",
    latitude: -26.695630322051688,
    longitude: -53.554433515344144
  },

  {
    slug: "tome-acu",
    name: "Tomé-Açu",
    state: "Pará",
    type: "Regional",
    description: "Foi criada em 11 de julho de 2023, e está instalada na Associação Agropecuária do Vale do Acará – AAVA, situado na Rodovia PA-140, Nº 6005, Bairro Industrial.",
    instagram: "@mc_os_papas",
    whatsapp: "+5561999999999",
    image: "/images/tome-acu/capa.jpeg",
    latitude: -2.41474,
    longitude: -48.1499,
    mapsUrl: "https://maps.app.goo.gl/MqffHyYujgMVUCzx9"
  },

  {
    slug: "sao-luis",
    name: "São Luís",
    state: "Maranhão",
    type: "Subsede",
    description: "Foi criada em 05 de março de 2022 com apenas um representante no Estado: Cardeal El Loco, motociclista raiz, apaixonado pelo motoclubismo, juntamente com sua família e ajuda de sua Papita Teca, fizeram um espaço destinado aos Papas e também à irmandade motociclista.",
    whatsapp: officialWhatsappNumbers.saoLuis,
    image: "/images/sao-luis/capa.jpg",
    latitude: -2.530806224441873,
    longitude: -44.242222017196426
  }
]
