/**
 * SECTION: Chapter Type Definition
 * Defines the canonical chapter schema used by the frontend.
 * These fields feed hero, contact, and map sections in `/sedes/[slug]`.
 */
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

/**
 * SECTION: Chapters Data Source
 * Primary dataset used to render chapter cards and dynamic chapter pages.
 * `slug` values are route keys for the App Router path: `/sedes/[slug]`.
 */
export const chapters: Chapter[] = [
  {
    slug: "para",
    name: "Belém",
    state: "Pará",
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
    name: "Brasília",
    state: "Distrito Federal",
    type: "Regional",
    description: "A regional de Brasília nasceu a partir de um sonho de expandir o Moto Clube, quando ums dos membros da regional do Rio de Janeiro foi trasnferido para trabalhar em Brasília. Naquela época, o presidente viu uma grande oportunidade de expandir o MC para a capital federal.",
    instagram: "@mc_os_papas_brasilia",
    whatsapp: "+5561999999999",
    image: "/images/brasilia/capa.jpg",
    latitude: -15.825362906642775,
    longitude: -48.08714023817274
  },

  {
    slug: "rio-de-janeiro",
    name: "Rio de Janeiro",
    state: "Rio de Janeiro",
    type: "Regional",
    description: "Regional Rio de Janeiro",
    instagram: "@mc_os_papas_regional_rj",
    whatsapp: "+5561999999999",
    image: "/images/rio-de-janeiro/capa.jpeg",
    latitude: -22.92471083409714,
    longitude: -43.34784851349188
  },

  {
    slug: "sao-miguel-do-oeste",
    name: "São Miguel do Oeste",
    state: "Santa Catarina",
    type: "Regional",
    description: "Regional São Miguel do Oeste",
    instagram: "@mc_os_papas_sc",
    whatsapp: "+5561999999999",
    image: "/images/sao-miguel-do-oeste/capa.jpg",
    latitude: -26.695630322051688,
    longitude: -53.554433515344144
  },

  {
    slug: "sao-luis",
    name: "São Luís",
    state: "Maranhão",
    type: "Subsede",
    description: "Subsede São Luís",
    whatsapp: "+5561999999999",
    image: "/images/sao-luis/capa.jpg",
    latitude: -2.530806224441873,
    longitude: -44.242222017196426
  }
]
