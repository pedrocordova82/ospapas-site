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
    whatsapp: temporaryWhatsapp,
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
    whatsapp: temporaryWhatsapp,
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
    whatsapp: temporaryWhatsapp,
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
    id: "sao-jose-dos-campos-sp",
    city: "São José dos Campos",
    state: "SP",
    representative: "Cardeal Velasco",
    whatsapp: officialWhatsappNumbers.saoJoseDosCampos,
  },
  {
    id: "umuarama-pa",
    city: "Umuarama",
    state: "PA",
    representative: "Cardeal Jota",
    whatsapp: temporaryWhatsapp,
  },
];
