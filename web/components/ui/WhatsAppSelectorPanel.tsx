"use client";

import { MessageCircle } from "@/components/ui/icons/icons";
import { officialWhatsappNumbers, toWhatsappHref } from "@/data/whatsapp";

type WhatsAppGroup = {
  id: string;
  title: string;
  ariaPrefix: string;
  items: Array<{
    id: string;
    label: string;
    href: string;
  }>;
};

// As representações usam contato temporário até a confirmação dos números oficiais.
const temporaryRepresentativeHref = "https://wa.me/999999999";

export const whatsappGroups: WhatsAppGroup[] = [
  {
    id: "sedes",
    title: "Sedes",
    ariaPrefix: "Sede Nacional",
    items: [
      {
        id: "sede-nacional-para",
        label: "Belém",
        href: toWhatsappHref(officialWhatsappNumbers.sedePara),
      },
    ],
  },
  {
    id: "regionais",
    title: "Regionais",
    ariaPrefix: "Regional",
    items: [
      {
        id: "regional-brasilia",
        label: "Brasília",
        href: toWhatsappHref(officialWhatsappNumbers.brasilia),
      },
      {
        id: "regional-rio-de-janeiro",
        label: "Rio de Janeiro",
        href: toWhatsappHref(officialWhatsappNumbers.rioDeJaneiro),
      },
      {
        id: "regional-sao-miguel-do-oeste",
        label: "São Miguel do Oeste",
        href: toWhatsappHref(officialWhatsappNumbers.saoMiguelDoOeste),
      },
      {
        id: "regional-tome-acu",
        label: "Tomé-Açu",
        href: "https://wa.me/5561999999999",
      },
    ],
  },
  {
    id: "subsedes",
    title: "Subsedes",
    ariaPrefix: "Subsede",
    items: [
      {
        id: "subsede-almeirim",
        label: "Almeirim",
        href: toWhatsappHref(officialWhatsappNumbers.almeirim),
      },
      {
        id: "subsede-criciuma",
        label: "Criciúma",
        href: temporaryRepresentativeHref,
      },
      {
        id: "subsede-curitiba",
        label: "Curitiba",
        href: toWhatsappHref(officialWhatsappNumbers.curitiba),
      },
      {
        id: "subsede-macapa",
        label: "Macapá",
        href: toWhatsappHref(officialWhatsappNumbers.macapa),
      },
      {
        id: "subsede-porto-de-moz",
        label: "Porto de Moz",
        href: toWhatsappHref(officialWhatsappNumbers.portoDeMoz),
      },
      {
        id: "subsede-recife",
        label: "Recife",
        href: toWhatsappHref(officialWhatsappNumbers.recife),
      },
      {
        id: "subsede-rio-grande",
        label: "Rio Grande",
        href: temporaryRepresentativeHref,
      },
      {
        id: "subsede-salinopolis",
        label: "Salinópolis",
        href: toWhatsappHref(officialWhatsappNumbers.salinopolis),
      },
      {
        id: "subsede-sao-jose-dos-campos",
        label: "São José dos Campos",
        href: toWhatsappHref(officialWhatsappNumbers.saoJoseDosCampos),
      },
      {
        id: "subsede-sao-luis",
        label: "São Luís",
        href: toWhatsappHref(officialWhatsappNumbers.saoLuis),
      },
      {
        id: "subsede-umuarama",
        label: "Umuarama",
        href: toWhatsappHref(officialWhatsappNumbers.umuarama),
      },
    ],
  },
];

type WhatsAppSelectorPanelProps = {
  title?: string;
};

export function WhatsAppSelectorPanel({
  title = "WhatsApp",
}: WhatsAppSelectorPanelProps) {
  return (
    <>
      <p className="px-2 pb-2 text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">
        {title}
      </p>
      <div className="space-y-4">
        {whatsappGroups.map((group) => (
          <section key={group.id} aria-labelledby={`whatsapp-group-${group.id}`}>
            <h3
              id={`whatsapp-group-${group.id}`}
              className="px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]"
            >
              {group.title}
            </h3>
            <ul className="mt-2 space-y-1.5">
              {group.items.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Abrir WhatsApp da ${group.ariaPrefix} ${item.label}`}
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-white/10 px-3 py-2.5 text-sm text-white/90 transition hover:border-green-500 hover:bg-green-500/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/70"
                  >
                    <MessageCircle size={18} className="shrink-0 text-green-500" />
                    <span className="leading-5">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
