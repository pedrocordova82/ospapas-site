"use client";

import { useCallback, useEffect, useState } from "react";

const COOKIE_CONSENT_STORAGE_KEY = "mc-ospapas-cookie-consent";

// A versão permite solicitar novo consentimento quando a política de privacidade for atualizada.
const COOKIE_CONSENT_VERSION = 1;

type ConsentStatus = "accepted" | "rejected";

type StoredConsent = {
  status: ConsentStatus;
  version: number;
  updatedAt: string;
};

let clarityInitialized = false;

function isStoredConsent(value: unknown): value is StoredConsent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<StoredConsent>;

  return (
    (candidate.status === "accepted" || candidate.status === "rejected") &&
    candidate.version === COOKIE_CONSENT_VERSION &&
    typeof candidate.updatedAt === "string"
  );
}

function readStoredConsent(): StoredConsent | null {
  try {
    const storedValue = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);

    if (!storedValue) {
      return null;
    }

    const parsedValue: unknown = JSON.parse(storedValue);
    return isStoredConsent(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}

function saveStoredConsent(status: ConsentStatus) {
  const consent: StoredConsent = {
    status,
    version: COOKIE_CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // Falhas de armazenamento não podem impedir a escolha explícita do visitante nesta sessão.
  }
}

async function initializeClarity() {
  if (typeof window === "undefined" || clarityInitialized || document.getElementById("clarity-script")) {
    clarityInitialized = true;
    return;
  }

  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();

  if (!projectId) {
    if (process.env.NODE_ENV === "development") {
      console.warn("NEXT_PUBLIC_CLARITY_PROJECT_ID não foi configurado.");
    }

    return;
  }

  try {
    // O Clarity só é importado após o consentimento para impedir rastreamento analítico prematuro.
    const { default: Clarity } = await import("@microsoft/clarity");
    Clarity.init(projectId);
    clarityInitialized = true;
  } catch {
    if (process.env.NODE_ENV === "development") {
      console.warn("Não foi possível inicializar o Microsoft Clarity.");
    }
  }
}

export function ClarityConsent() {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus | "pending" | "checking">("checking");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      // Este componente roda apenas no cliente para preservar a compatibilidade com exportação estática.
      const storedConsent = readStoredConsent();

      if (!storedConsent) {
        setConsentStatus("pending");
        return;
      }

      setConsentStatus(storedConsent.status);

      if (storedConsent.status === "accepted") {
        void initializeClarity();
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleReject = useCallback(() => {
    saveStoredConsent("rejected");
    setConsentStatus("rejected");
  }, []);

  const handleAccept = useCallback(() => {
    saveStoredConsent("accepted");
    setConsentStatus("accepted");
    void initializeClarity();
  }, []);

  if (consentStatus !== "pending") {
    return null;
  }

  return (
    <section
      role="region"
      aria-label="Preferências de cookies"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-5 rounded-lg border border-white/15 bg-[color:var(--color-bg-900)]/95 p-5 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
            PRIVACIDADE E COOKIES
          </h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--color-text-300)]">
            Utilizamos cookies analíticos do Microsoft Clarity para compreender como o site é utilizado e
            melhorar sua experiência. Você pode aceitar ou recusar o uso desses cookies.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
          <button
            type="button"
            onClick={handleReject}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/25 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:border-white/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-900)]"
          >
            RECUSAR
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[color:var(--color-gold-500)] bg-[color:var(--color-gold-500)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-[color:var(--color-gold-400)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-900)]"
          >
            ACEITAR
          </button>
        </div>
      </div>
    </section>
  );
}
