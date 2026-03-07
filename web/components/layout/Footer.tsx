import { Instagram } from "lucide-react";

/**
 * SECTION: Footer
 * Global footer with brand summary, social entry point, and legal text.
 * The layout is intentionally compact to keep focus on chapter content.
 */
export function Footer() {
  return (
    <footer
      id="contato"
      className="border-t border-white/10 bg-[linear-gradient(180deg,var(--color-bg-900),var(--color-bg-950))]"
    >
      {/**
       * SECTION: Footer Content Grid
       * Left side: institutional identity.
       * Right side: Instagram section centered for clear social CTA.
       */}
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="font-heading text-3xl tracking-[0.08em] text-[color:var(--color-text-100)]">OS PAPAS MC</p>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-[color:var(--color-gold-500)]">Fratres in Via</p>
          <p className="mt-4 max-w-lg text-sm text-[color:var(--color-text-300)]">
            Irmandade, estrada e compromisso com a comunidade.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          {/**
           * SECTION: Instagram Title
           * Icon + label communicates the social channel in a subtle style.
           */}
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.25em] text-white/60">
            <Instagram size={20} />
            <span>Instagram</span>
          </div>
          {/**
           * SECTION: Social Link Styling
           * Minimal button with hover highlights that match the brand palette.
           */}
          <a
            href="https://instagram.com/mc_os_papas"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md border border-white/15 px-4 py-2 text-sm text-white/90 transition-all duration-200 hover:scale-105 hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-400"
          >
            @mc_os_papas
          </a>
        </div>
      </div>
      {/**
       * SECTION: Copyright
       * Uses current year dynamically to avoid manual yearly maintenance.
       */}
      <div className="border-t border-white/10 py-4 text-center text-xs uppercase tracking-[0.08em] text-[color:var(--color-text-500)]">
        {new Date().getFullYear()} Os Papas MC. Todos os direitos reservados.
      </div>
    </footer>
  );
}
