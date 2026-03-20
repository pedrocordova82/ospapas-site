"use client";

import { MessageCircle, X } from "@/components/ui/icons/icons";
import { useEffect, useState } from "react";
import { WhatsAppSelectorPanel } from "@/components/ui/WhatsAppSelectorPanel";

/**
 * SECTION: Session Key
 * Controls one-session visibility for the contextual hint bubble.
 */
const SESSION_KEY = "ospapas-wa-hint-dismissed";

/**
 * SECTION: Floating WhatsApp Widget
 * Fixed bottom-right contact entry point with expandable list of sedes.
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
         * The sede list appears/disappears with scale and opacity transitions.
         */}
        <div
          className={`absolute bottom-[calc(100%+14px)] right-0 w-[min(92vw,300px)] origin-bottom-right rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] p-3 shadow-2xl transition-all duration-300 ${
            isOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
          }`}
        >
          <WhatsAppSelectorPanel />
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
