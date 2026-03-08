"use client";

import { MessageCircle, X } from "@/components/ui/icons/icons";
import { useEffect, useState } from "react";

/**
 * SECTION: Session Key
 * Controls one-session visibility for the contextual hint bubble.
 */
const SESSION_KEY = "ospapas-wa-hint-dismissed";

/**
 * SECTION: Contact List Structure
 * Centralized chapter contact data used to render WhatsApp quick actions.
 */
const contacts = [
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

/**
 * SECTION: Floating WhatsApp Widget
 * Fixed bottom-right contact entry point with expandable list of chapters.
 */
export default function FloatingWhatsApp() {
  /**
   * SECTION: Expandable Menu Logic
   * `isOpen` toggles the contacts panel.
   * `showHint` controls the timed helper message bubble visibility.
   */
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  /**
   * SECTION: SessionStorage Hint Control
   * Shows the hint after 6 seconds only if it was not dismissed in the
   * current browser session.
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(SESSION_KEY) === "true") return;

    const timer = window.setTimeout(() => {
      setShowHint(true);
    }, 6000);

    return () => window.clearTimeout(timer);
  }, []);

  /**
   * SECTION: Toggle Open/Close Behavior
   * Clicking the floating button toggles panel visibility and also dismisses
   * the hint for the current session.
   */
  const handleToggle = () => {
    if (showHint && typeof window !== "undefined") {
      window.sessionStorage.setItem(SESSION_KEY, "true");
      setShowHint(false);
    }

    setIsOpen((current) => !current);
  };

  /**
   * SECTION: Floating Button Behavior
   * Entire widget is fixed to the viewport to remain accessible while scrolling.
   */
  return (
    <div className="fixed bottom-5 right-5 z-50 sm:bottom-6 sm:right-6">
      <div className="relative">
        {/**
         * SECTION: Timed Hint Bubble
         * Animated contextual helper rendered above the button container.
         */}
        <div
          className={`absolute bottom-[calc(100%+12px)] right-0 max-w-[220px] rounded-lg border border-white/10 bg-[color:var(--color-bg-900)] px-3 py-2 text-xs text-white/90 shadow-lg transition-all duration-300 ${
            showHint ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"
          }`}
        >
        </div>

        {/**
         * SECTION: Expandable Contact Panel
         * The chapter list appears/disappears with scale and opacity transitions.
         */}
        <div
          className={`absolute bottom-[calc(100%+14px)] right-0 w-[min(92vw,300px)] origin-bottom-right rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] p-3 shadow-2xl transition-all duration-300 ${
            isOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
          }`}
        >
          <p className="px-2 pb-2 text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">WhatsApp</p>
          <ul className="space-y-3">
            {contacts.map((contact) => (
              <li key={contact.name}>
                <a
                  href={contact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 p-4 text-sm text-white/90 transition hover:border-green-500 hover:bg-green-500/10 hover:text-white"
                >
                  <MessageCircle size={18} className="text-green-500" />
                  <span>{contact.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="group relative">
          <div className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[color:var(--color-bg-900)] px-3 py-1.5 text-xs text-white/85 opacity-0 shadow-md transition group-hover:opacity-100">
            Fale conosco no WhatsApp
          </div>

          <button
            type="button"
            onClick={handleToggle}
            aria-label="Abrir contatos do WhatsApp"
            className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 animate-pulse"
          >
            {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
}
