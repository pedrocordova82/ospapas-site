"use client";

import { MessageCircle, X } from "@/components/ui/icons/icons";
import { useEffect, useState } from "react";
import { WhatsAppSelectorPanel } from "@/components/ui/WhatsAppSelectorPanel";

const SESSION_KEY = "ospapas-wa-hint-dismissed";

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Exibe a dica apenas uma vez por sessão para não cansar quem já fechou.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(SESSION_KEY) === "true") return;

    const timer = window.setTimeout(() => {
      setShowHint(true);
    }, 6000);

    return () => window.clearTimeout(timer);
  }, []);

  const handleToggle = () => {
    if (showHint && typeof window !== "undefined") {
      window.sessionStorage.setItem(SESSION_KEY, "true");
      setShowHint(false);
    }

    setIsOpen((current) => !current);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 sm:bottom-6 sm:right-6">
      <div className="relative">
        <div
          className={`absolute bottom-[calc(100%+12px)] right-0 max-w-[220px] rounded-lg border border-white/10 bg-[color:var(--color-bg-900)] px-3 py-2 text-xs text-white/90 shadow-lg transition-all duration-300 ${
            showHint ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"
          }`}
        >
        </div>

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
