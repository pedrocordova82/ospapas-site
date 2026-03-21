"use client";

import Image from "next/image";
import { type FormEvent, useState } from "react";
import { BrazilMap } from "@/components/map/BrazilMap";
import { Reveal } from "@/components/ui/Reveal";
import { X } from "@/components/ui/icons/icons";
import { WhatsAppSelectorPanel } from "@/components/ui/WhatsAppSelectorPanel";

const joinText = [
  "Mais do que um Moto Clube, somos uma irmandade.",
  "Unidos pela paixão pelas duas rodas, pelo respeito e pela liberdade da estrada.",
  "No MC Os Papas, homens e mulheres são bem-vindos. Não importa se você pilota uma custom, esportiva, big trail ou baixa cilindrada — o que realmente importa é a sua vontade de fazer parte, somar e viver esse estilo de vida.",
  "Somos um MC familiar. Aqui, filhos, parceiros e familiares também fazem parte da jornada, participando dos nossos encontros, eventos e momentos de confraternização.",
  "Valorizamos a amizade verdadeira, o companheirismo e o respeito dentro e fora da estrada.",
  "Se você sente que a estrada é mais do que um caminho… é o seu lugar.",
  "Venha fazer parte do MC Os Papas.",
];

const estadosBrasil = [
  "AC",
  "AL",
  "AM",
  "AP",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MG",
  "MS",
  "MT",
  "PA",
  "PB",
  "PE",
  "PI",
  "PR",
  "RJ",
  "RN",
  "RO",
  "RR",
  "RS",
  "SC",
  "SE",
  "SP",
  "TO",
] as const;

export default function FacaPartePage() {
  const [isWhatsOpen, setIsWhatsOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    console.log("Interesse recebido:", payload);
    setStatusMessage("Interesse registrado com sucesso. Em breve entraremos em contato.");
    event.currentTarget.reset();
  };

  return (
    <div className="pb-16">
      <section className="relative isolate min-h-[52vh] overflow-hidden border-b border-white/10">
        <Image
          src="/images/geral/ospapas_estrada.png"
          alt="Motociclistas do MC Os Papas na estrada"
          fill
          priority
          className="object-cover object-[80%_center]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.3)_0%,rgba(11,11,11,0.8)_55%,rgba(11,11,11,0.95)_100%)]" />

        <div className="relative mx-auto flex min-h-[52vh] w-full max-w-6xl items-end px-6 py-12">
          <div className="max-w-4xl">
            <p className="text-base uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">Convite</p>
            <h1 className="mt-3 font-heading text-5xl uppercase tracking-[0.04em] text-white sm:text-6xl lg:text-7xl">
              Faça Parte do MC Os Papas
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">
              Mais do que um Moto Clube, somos uma irmandade.
            </p>
          </div>
        </div>
      </section>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-6 py-16 lg:py-20">
          <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[color:var(--color-bg-900)]/80 p-8 sm:p-10">
            <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Irmandade</p>
            <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">
              Viva Esse Estilo de Vida
            </h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-[color:var(--color-text-300)] sm:text-lg">
              {joinText.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-6 pb-16">
          <div className="grid gap-8 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-[color:var(--color-bg-900)] p-8">
              <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Opção 1</p>
              <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white">
                Existe uma sede na sua região?
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-[color:var(--color-text-300)]">
                Entre em contato direto com um dos nossos integrantes.
              </p>
              <button
                type="button"
                onClick={() => setIsWhatsOpen(true)}
                className="mt-8 inline-flex items-center rounded-md border border-[color:var(--color-gold-500)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--color-gold-500)] transition hover:bg-[color:var(--color-gold-500)] hover:text-black"
              >
                Falar no WhatsApp
              </button>
            </article>

            <article className="rounded-2xl border border-white/10 bg-[color:var(--color-bg-900)] p-8">
              <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Opção 2</p>
              <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white">
                Não existe uma sede próxima?
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-[color:var(--color-text-300)]">
                Deixe seus dados e entraremos em contato com você.
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/70">Nome</span>
                    <input
                      name="nome"
                      type="text"
                      required
                      className="w-full rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[color:var(--color-gold-500)]"
                      placeholder="Seu nome"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/70">Estado</span>
                    <select
                      name="estado"
                      required
                      defaultValue=""
                      className="w-full rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[color:var(--color-gold-500)]"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {estadosBrasil.map((uf) => (
                        <option key={uf} value={uf}>
                          {uf}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/70">Cidade</span>
                    <input
                      name="cidade"
                      type="text"
                      required
                      className="w-full rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[color:var(--color-gold-500)]"
                      placeholder="Sua cidade"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/70">Celular</span>
                    <input
                      name="celular"
                      type="tel"
                      required
                      className="w-full rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[color:var(--color-gold-500)]"
                      placeholder="Seu celular"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/70">Email</span>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[color:var(--color-gold-500)]"
                    placeholder="voce@email.com"
                  />
                </label>

                <button
                  type="submit"
                  className="inline-flex items-center rounded-md border border-[color:var(--color-gold-500)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--color-gold-500)] transition hover:bg-[color:var(--color-gold-500)] hover:text-black"
                >
                  Enviar Interesse
                </button>

                {statusMessage ? (
                  <p className="text-sm text-[color:var(--color-gold-500)]">{statusMessage}</p>
                ) : null}
              </form>
            </article>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-6 pb-16">
          <div className="rounded-2xl border border-white/10 bg-[color:var(--color-bg-900)] p-8 sm:p-10">
            <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">
              Presença Nacional
            </p>
            <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white sm:text-5xl">
              Onde Estamos
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--color-text-300)]">
              O MC Os Papas está presente em diferentes regiões do Brasil, conectando estrada, irmandade e
              propósito.
            </p>

            <div className="mt-8 flex items-center justify-center">
              <BrazilMap className="w-full" />
            </div>
          </div>
        </section>
      </Reveal>

      {isWhatsOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
          onClick={() => setIsWhatsOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] p-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsWhatsOpen(false)}
              className="absolute right-3 top-3 text-white transition hover:scale-110"
              aria-label="Fechar seletor de WhatsApp"
            >
              <X size={20} />
            </button>
            <WhatsAppSelectorPanel />
          </div>
        </div>
      ) : null}
    </div>
  );
}
