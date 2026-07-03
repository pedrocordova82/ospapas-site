export type OpenHouseEvent = {
  id: string;
  date: string;
  month: "agosto" | "setembro" | "outubro" | "novembro" | "dezembro";
  dateLabel: string;
  dayLabel: string;
  title: string;
  location: string;
  time: string;
};

export const brasiliaOpenHouseEvents: OpenHouseEvent[] = [
  {
    id: "brasilia-sede-aberta-2026-08-08",
    date: "2026-08-08",
    month: "agosto",
    dateLabel: "08 de agosto",
    dayLabel: "08",
    title: "Sede Aberta",
    location: "Ruta 40",
    time: "18h",
  },
  {
    id: "brasilia-sede-aberta-2026-09-19",
    date: "2026-09-19",
    month: "setembro",
    dateLabel: "19 de setembro",
    dayLabel: "19",
    title: "Sede Aberta",
    location: "Ruta 40",
    time: "18h",
  },
  {
    id: "brasilia-sede-aberta-2026-10-24",
    date: "2026-10-24",
    month: "outubro",
    dateLabel: "24 de outubro",
    dayLabel: "24",
    title: "Sede Aberta",
    location: "Ruta 40",
    time: "18h",
  },
  {
    id: "brasilia-sede-aberta-2026-11-14",
    date: "2026-11-14",
    month: "novembro",
    dateLabel: "14 de novembro",
    dayLabel: "14",
    title: "Sede Aberta",
    location: "Ruta 40",
    time: "18h",
  },
  {
    id: "brasilia-sede-aberta-2026-12-12",
    date: "2026-12-12",
    month: "dezembro",
    dateLabel: "12 de dezembro",
    dayLabel: "12",
    title: "Sede Aberta",
    location: "Ruta 40",
    time: "18h",
  },
];
