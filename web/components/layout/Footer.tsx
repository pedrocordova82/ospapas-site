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

        <div className="lg:text-right">
          <p className="text-sm uppercase tracking-[0.12em] text-[color:var(--color-text-300)]">Contato</p>
          <p className="mt-3 text-sm text-[color:var(--color-text-100)]">WhatsApp: +55 11 99999-9999</p>
          <p className="mt-1 text-sm text-[color:var(--color-text-100)]">Instagram: @ospapas.mc</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs uppercase tracking-[0.08em] text-[color:var(--color-text-500)]">
        {new Date().getFullYear()} Os Papas MC. Todos os direitos reservados.
      </div>
    </footer>
  );
}
