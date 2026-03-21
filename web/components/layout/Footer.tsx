import { Instagram, MessageCircle } from "@/components/ui/icons/icons";

/**
 * SECTION: Footer
 * Global footer with brand summary, social entry point, and legal text.
 * The layout is intentionally compact to keep focus on sede content.
 */
export function Footer() {
  return (
    <footer
      id="contato"
      className="border-t border-white/10 bg-[linear-gradient(180deg,var(--color-bg-900),var(--color-bg-950))]"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="font-heading text-3xl tracking-[0.08em] text-[color:var(--color-text-100)]">OS PAPAS MC</p>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-[color:var(--color-gold-500)]">Fratres in Via</p>
          <p className="mt-4 max-w-lg text-sm text-[color:var(--color-text-300)]">
            Irmandade, estrada e compromisso com a comunidade.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-center">
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.25em] text-white/60">
            <Instagram size={20} />
            <span>Instagram</span>
          </div>
          <a
            href="https://instagram.com/mc_os_papas"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md border border-white/15 px-4 py-2 text-sm text-[color:var(--color-gold-500)] transition-all duration-200 hover:scale-105 hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-400"
          >
            @mc_os_papas
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 py-4">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 text-xs uppercase tracking-[0.08em] text-[color:var(--color-text-500)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-white/60 normal-case tracking-normal">
            <span>Desenvolvido por:</span>

            <img
            src="/images/geral/logo-ux.svg"
            alt="UX Consultancy"
             className="h-4 w-auto"
            />

            <a
              href="https://wa.me/5561981508989"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:scale-110"
            >
              <MessageCircle size={16} className="text-green-500" />
            </a>
        </div>

          <div className="text-left sm:text-right">
            {new Date().getFullYear()} Os Papas MC. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}
