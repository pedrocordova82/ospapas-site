import { officialWhatsappNumbers } from "@/data/whatsapp";

export type RepresentativeSubsede = {
  id: string;
  city: string;
  state: string;
  representative: string;
  whatsapp?: string;
};

// Contato temporário até a confirmação dos números oficiais dos representantes.
const temporaryWhatsapp = "999999999";

export const representativeSubsedes: RepresentativeSubsede[] = [
  {
    id: "almeirim-pa",
    city: "Almeirim",
    state: "PA",
    representative: "Padre Aqueiro",
    whatsapp: officialWhatsappNumbers.almeirim,
  },
  {
    id: "criciuma-sc",
    city: "Criciúma",
    state: "SC",
    representative: "Bispo Rocky",
    whatsapp: temporaryWhatsapp,
  },
  {
    id: "curitiba-pr",
    city: "Curitiba",
    state: "PR",
    representative: "Bispa Miminha e Bispo Cabelo de Freira",
    whatsapp: officialWhatsappNumbers.curitiba,
  },
  {
    id: "macapa-ap",
    city: "Macapá",
    state: "AP",
    representative: "Cardeal Bino",
    whatsapp: officialWhatsappNumbers.macapa,
  },
  {
    id: "porto-de-moz-pa",
    city: "Porto de Moz",
    state: "PA",
    representative: "Bispo Feroz",
    whatsapp: officialWhatsappNumbers.portoDeMoz,
  },
  {
    id: "recife-pe",
    city: "Recife",
    state: "PE",
    representative: "Cardeal Carcará",
    whatsapp: officialWhatsappNumbers.recife,
  },
  {
    id: "rio-grande-rs",
    city: "Rio Grande",
    state: "RS",
    representative: "Cardeal Freedie",
    whatsapp: temporaryWhatsapp,
  },
  {
    id: "salinopolis-pa",
    city: "Salinópolis",
    state: "PA",
    representative: "Bispo Tubarão",
    whatsapp: officialWhatsappNumbers.salinopolis,
  },
  {
    id: "sao-jose-dos-campos-sp",
    city: "São José dos Campos",
    state: "SP",
    representative: "Cardeal Velasco",
    whatsapp: officialWhatsappNumbers.saoJoseDosCampos,
  },
  {
    id: "umuarama-pr",
    city: "Umuarama",
    state: "PR",
    representative: "Cardeal Jota",
    whatsapp: temporaryWhatsapp,
  },
];
