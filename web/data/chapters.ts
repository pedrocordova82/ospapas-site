export type Chapter = {
  slug: string
  name: string
  city: string
  state: string
  type: "Sede" | "Regional" | "Subsede"
  description: string
  instagram?: string
  whatsapp: string
  image: string
  latitude: number
  longitude: number
}

export const chapters: Chapter[] = [
  {
    slug: "para",
    name: "Sede Pará",
    city: "Ananindeua",
    state: "PA",
    type: "Sede",
    description: "Sede Nacional Pará",
    instagram: "@mc_os_papas",
    whatsapp: "+5561999999999",
    image: "/images/para/capa.jpg",
    latitude: -1.365,
    longitude: -48.38759981349188
  },

  {
    slug: "brasilia",
    name: "Regional Brasília",
    city: "Brasília",
    state: "DF",
    type: "Regional",
    description: "Regional Brasília",
    instagram: "@mc_os_papas_brasilia",
    whatsapp: "+5561999999999",
    image: "/images/brasilia/capa.jpg",
    latitude: -15.847456763175366,
    longitude: -47.964497171163956
  },

  {
    slug: "rio-de-janeiro",
    name: "Regional Rio de Janeiro",
    city: "Rio de Janeiro",
    state: "RJ",
    type: "Regional",
    description: "Regional Rio de Janeiro",
    instagram: "@mc_os_papas_regional_rj",
    whatsapp: "+5561999999999",
    image: "/images/rio_de_janeiro/capa.jpeg",
    latitude: -22.92471083409714,
    longitude: -43.34784851349188
  },

  {
    slug: "sao-miguel-do-oeste",
    name: "Regional São Miguel do Oeste",
    city: "São Miguel do Oeste",
    state: "SC",
    type: "Regional",
    description: "Regional São Miguel do Oeste",
    instagram: "@mc_os_papas_sc",
    whatsapp: "+5561999999999",
    image: "/images/sao_miguel_do_oeste/capa.jpg",
    latitude: -26.695630322051688,
    longitude: -53.554433515344144
  },

  {
    slug: "sao-luis",
    name: "Subsede São Luís",
    city: "São Luís",
    state: "MA",
    type: "Subsede",
    description: "Subsede São Luís",
    whatsapp: "+5561999999999",
    image: "/images/sao_luis/capa.jpg",
    latitude: -2.530806224441873,
    longitude: -44.242222017196426
  }
]