"use client";

import Image from "next/image";
import { type ChangeEvent, type FormEvent, type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { BrazilMap } from "@/components/map/BrazilMap";
import { CITIES_BY_STATE, STATE_CODES, type CityOption, type StateCode } from "@/data/brazil-locations";
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

// A busca da cidade ignora acentos e caixa para ficar mais tolerante ao digitar.
function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Prioriza cidades que começam com o termo e limita a lista para manter a navegação leve.
function filterCities(cities: CityOption[], query: string, limit = 10) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return cities.slice(0, limit);
  }

  const startsWithMatches: CityOption[] = [];
  const includesMatches: CityOption[] = [];

  for (const city of cities) {
    const normalizedCity = normalizeText(city.name);

    if (normalizedCity.startsWith(normalizedQuery)) {
      startsWithMatches.push(city);
      continue;
    }

    if (normalizedCity.includes(normalizedQuery)) {
      includesMatches.push(city);
    }
  }

  return [...startsWithMatches, ...includesMatches].slice(0, limit);
}

// Formata o valor visível do campo sem armazenar símbolos no payload do formulário.
function formatBrazilPhone(phoneDigits: string) {
  const digits = phoneDigits.replace(/\D/g, "").slice(0, 11);

  if (!digits) {
    return "";
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function FacaPartePage() {
  const [isWhatsOpen, setIsWhatsOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [statusType, setStatusType] = useState<"success" | "error" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedState, setSelectedState] = useState<StateCode | "">("");
  const [cityQuery, setCityQuery] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [isCityListOpen, setIsCityListOpen] = useState(false);
  const [highlightedCityIndex, setHighlightedCityIndex] = useState(-1);
  const cityComboboxRef = useRef<HTMLDivElement>(null);
  const cityListboxId = "cidade-sugestoes";

  const availableCities = useMemo(() => {
    return selectedState ? CITIES_BY_STATE[selectedState] : [];
  }, [selectedState]);

  const filteredCities = useMemo(() => {
    return filterCities(availableCities, cityQuery);
  }, [availableCities, cityQuery]);

  const activeCityOptionId =
    highlightedCityIndex >= 0 && highlightedCityIndex < filteredCities.length
      ? `${cityListboxId}-option-${highlightedCityIndex}`
      : undefined;
  const formattedPhone = useMemo(() => formatBrazilPhone(phoneDigits), [phoneDigits]);

  useEffect(() => {
    // Fecha a lista de sugestões ao clicar fora do combobox.
    function handlePointerDown(event: PointerEvent) {
      if (!cityComboboxRef.current?.contains(event.target as Node)) {
        setIsCityListOpen(false);
        setHighlightedCityIndex(-1);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const resetCityField = () => {
    setCityQuery("");
    setIsCityListOpen(false);
    setHighlightedCityIndex(-1);
  };

  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    // Trocar o estado invalida qualquer cidade já digitada ou selecionada.
    setSelectedState(event.target.value as StateCode | "");
    resetCityField();
  };

  const selectCity = (cityName: string) => {
    setCityQuery(cityName);
    setIsCityListOpen(false);
    setHighlightedCityIndex(-1);
  };

  const handleCityKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!selectedState) {
      return;
    }

    // Mantém a combobox acessível com teclado, inclusive quando há muitas cidades.
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsCityListOpen(true);
      setHighlightedCityIndex((currentIndex) => {
        if (!filteredCities.length) {
          return -1;
        }

        return currentIndex >= filteredCities.length - 1 ? 0 : currentIndex + 1;
      });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsCityListOpen(true);
      setHighlightedCityIndex((currentIndex) => {
        if (!filteredCities.length) {
          return -1;
        }

        return currentIndex <= 0 ? filteredCities.length - 1 : currentIndex - 1;
      });
      return;
    }

    if (event.key === "Enter" && isCityListOpen && highlightedCityIndex >= 0) {
      event.preventDefault();
      selectCity(filteredCities[highlightedCityIndex].name);
      return;
    }

    if (event.key === "Escape") {
      setIsCityListOpen(false);
      setHighlightedCityIndex(-1);
      return;
    }

    if (event.key === "Tab") {
      setIsCityListOpen(false);
      setHighlightedCityIndex(-1);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Evita envio duplicado enquanto a requisição ainda está em andamento.
    if (isSubmitting) {
      return;
    }

    if (phoneDigits.length !== 11) {
      setStatusType("error");
      setStatusMessage("Informe um celular válido no formato (99) 99999-9999.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    setIsSubmitting(true);
    setStatusMessage("");
    setStatusType(null);

    // O envio acontece via API interna para manter credenciais e validações fora do cliente.
    void (async () => {
      try {
        const response = await fetch("/api/join", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = (await response.json()) as { message?: string };

        if (!response.ok) {
          throw new Error(result.message || "Não foi possível enviar seu interesse agora.");
        }

        setStatusType("success");
        setStatusMessage(result.message || "Interesse enviado com sucesso. Em breve entraremos em contato.");
        form.reset();
        setSelectedState("");
        resetCityField();
        setPhoneDigits("");
      } catch (error) {
        setStatusType("error");
        setStatusMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível enviar seu interesse agora. Tente novamente em instantes.",
        );
      } finally {
        setIsSubmitting(false);
      }
    })();
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

        <div className="relative mx-auto flex min-h-[52vh] w-full max-w-6xl items-end px-4 py-9 sm:px-6 sm:py-12">
          <div className="max-w-4xl">
            <p className="text-base uppercase tracking-[0.16em] text-[color:var(--color-gold-500)]">Convite</p>
            <h1 className="mt-3 text-balance font-heading text-4xl uppercase tracking-[0.04em] text-white sm:text-6xl lg:text-7xl">
              Faça Parte do MC Os Papas
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
              Mais do que um Moto Clube, somos uma irmandade.
            </p>
          </div>
        </div>
      </section>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
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
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-[color:var(--color-bg-900)] p-8">
              <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold-500)]">Opção 1</p>
              <h2 className="mt-3 font-heading text-4xl uppercase tracking-[0.05em] text-white">
                Existe uma sede na sua região?
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-[color:var(--color-text-300)]">
                Veja abaixo se existe uma sede perto de você e entre em contato direto com um dos nossos integrantes.
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
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[-9999px] top-auto h-px w-px overflow-hidden opacity-0"
                >
                  <label htmlFor="website">
                    Website
                    <input
                      id="website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      defaultValue=""
                    />
                  </label>
                </div>

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
                      value={selectedState}
                      onChange={handleStateChange}
                      className="w-full rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[color:var(--color-gold-500)]"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {STATE_CODES.map((uf) => (
                        <option key={uf} value={uf}>
                          {uf}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/70">Cidade</span>
                    <div ref={cityComboboxRef} className="relative">
                      <input
                        name="cidade"
                        type="text"
                        role="combobox"
                        required
                        disabled={!selectedState}
                        autoComplete="off"
                        value={cityQuery}
                        aria-autocomplete="list"
                        aria-expanded={selectedState ? isCityListOpen : false}
                        aria-controls={selectedState ? cityListboxId : undefined}
                        aria-activedescendant={activeCityOptionId}
                        className="w-full rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[color:var(--color-gold-500)] disabled:cursor-not-allowed disabled:opacity-60"
                        placeholder={selectedState ? "Digite sua cidade" : "Selecione um estado primeiro"}
                        onFocus={() => {
                          if (selectedState) {
                            setIsCityListOpen(true);
                          }
                        }}
                        onChange={(event) => {
                          setCityQuery(event.target.value);
                          setIsCityListOpen(true);
                          setHighlightedCityIndex(-1);
                        }}
                        onKeyDown={handleCityKeyDown}
                      />

                      {selectedState && isCityListOpen ? (
                        <div
                          id={cityListboxId}
                          role="listbox"
                          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 max-h-48 overflow-y-auto rounded-md border border-white/10 bg-[color:var(--color-bg-900)]/95 p-2 shadow-2xl backdrop-blur-sm sm:max-h-64"
                        >
                          {filteredCities.length ? (
                            filteredCities.map((city, index) => {
                              const isHighlighted = index === highlightedCityIndex;
                              const isSelected = city.name === cityQuery;

                              return (
                                <button
                                  key={city.ibgeCode ?? city.name}
                                  id={`${cityListboxId}-option-${index}`}
                                  type="button"
                                  role="option"
                                  aria-selected={isHighlighted || isSelected}
                                  className={`flex w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm transition ${
                                    isHighlighted || isSelected
                                      ? "bg-[color:var(--color-gold-500)]/12 text-white"
                                      : "text-white/80 hover:bg-white/5"
                                  }`}
                                  onMouseEnter={() => setHighlightedCityIndex(index)}
                                  onMouseDown={(event) => {
                                    event.preventDefault();
                                    selectCity(city.name);
                                  }}
                                >
                                  {city.name}
                                </button>
                              );
                            })
                          ) : (
                            <p className="px-3 py-2 text-sm text-white/50">Nenhuma cidade encontrada</p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/70">Celular</span>
                    <input name="celular" type="hidden" value={phoneDigits} />
                    <input
                      id="celular"
                      type="tel"
                      required
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength={15}
                      value={formattedPhone}
                      aria-invalid={phoneDigits.length > 0 && phoneDigits.length !== 11}
                      className="w-full rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[color:var(--color-gold-500)]"
                      placeholder="(99) 99999-9999"
                      onChange={(event) => {
                        setPhoneDigits(event.target.value.replace(/\D/g, "").slice(0, 11));
                      }}
                    />
                    <p className="mt-2 pr-2 text-xs leading-5 text-white/45">Digite apenas números</p>
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
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-md border border-[color:var(--color-gold-500)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--color-gold-500)] transition hover:bg-[color:var(--color-gold-500)] hover:text-black sm:w-auto"
                >
                  {isSubmitting ? "Enviando..." : "Enviar Interesse"}
                </button>

                {statusMessage ? (
                  <p
                    className={`break-words pr-2 text-sm leading-6 ${
                      statusType === "error" ? "text-red-300" : "text-[color:var(--color-gold-500)]"
                    }`}
                  >
                    {statusMessage}
                  </p>
                ) : null}
              </form>
            </article>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
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

            <div className="mt-8 flex items-center justify-center overflow-visible">
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
            className="relative w-full max-w-sm rounded-xl border border-white/10 bg-[color:var(--color-bg-900)] p-3 shadow-2xl max-h-[min(85vh,32rem)] overflow-y-auto"
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
