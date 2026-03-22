"use client";

import { MessageCircle } from "@/components/ui/icons/icons";

export const whatsappContacts = [
  {
    name: "Sede Pará",
    href: "https://wa.me/5591999999999",
  },
  {
    name: "Regional Brasília",
    href: "https://wa.me/5561999999999",
  },
  {
    name: "Regional Rio de Janeiro",
    href: "https://wa.me/5521999999999",
  },
  {
    name: "Regional São Miguel do Oeste",
    href: "https://wa.me/5549999999999",
  },
  {
    name: "Subsede São Luís",
    href: "https://wa.me/5598999999999",
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
      <ul className="space-y-3">
        {whatsappContacts.map((contact) => (
          <li key={contact.name}>
            <a
              href={contact.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-white/10 p-4 text-sm text-white/90 transition hover:border-green-500 hover:bg-green-500/10 hover:text-white"
            >
              <MessageCircle size={18} className="text-green-500" />
              <span className="leading-5">{contact.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
