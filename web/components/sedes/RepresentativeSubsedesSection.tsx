import { representativeSubsedes } from "@/data/sedes/representative-subsedes";

function toWaMe(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

export function RepresentativeSubsedesSection() {
  if (representativeSubsedes.length === 0) {
    return null;
  }

  return (
    <section
      id="subsedes-representativas"
      aria-labelledby="representative-subsedes-title"
      className="mx-auto mt-14 w-full max-w-6xl scroll-mt-24 border-t border-white/10 px-4 pt-12 sm:px-6 md:scroll-mt-28 lg:mt-16 lg:px-8 lg:pt-14"
    >
      <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">
        Representações Locais
      </p>
      <h2
        id="representative-subsedes-title"
        className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-[color:var(--color-text-100)] sm:text-5xl"
      >
        Subsedes Representativas
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--color-text-300)]">
        Representações locais do MC Os Papas em diferentes cidades, fortalecendo a presença da irmandade pelo Brasil.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {representativeSubsedes.map(({ id, city, state, representative, whatsapp }) => (
          <article
            key={id}
            className="border border-white/10 bg-[color:var(--color-bg-900)] p-5"
          >
            <h3 className="font-heading text-3xl uppercase tracking-[0.04em] text-[color:var(--color-text-100)]">
              {city}/{state}
            </h3>
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--color-text-300)]">
                Representante
              </p>
              <p className="mt-2 min-w-0 text-sm font-medium text-[color:var(--color-text-100)]">
                {representative}
              </p>
              {whatsapp ? (
                <a
                  href={toWaMe(whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Falar com ${representative} pelo WhatsApp`}
                  className="mt-2 inline-flex min-h-10 items-center text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--color-gold-500)] transition hover:text-[color:var(--color-gold-400)] hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-900)]"
                >
                  Entrar em contato
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
