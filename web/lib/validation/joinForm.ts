import { CITIES_BY_STATE, STATE_CODES, type StateCode } from "@/data/brazil-locations";

// Normaliza entradas de texto vindas do formulário antes da validação no servidor.
export function normalizeJoinText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
}

// Mantém apenas dígitos para validar e formatar o celular com consistência.
export function normalizeJoinPhone(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\D/g, "");
}

export function normalizeForComparison(value: string) {
  // Uniformiza acentos, caixa e espaços para validar entradas vindas do formulário.
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Reaplica o formato brasileiro só depois da validação para uso em email e logs.
export function formatBrazilPhone(phoneDigits: string) {
  if (phoneDigits.length !== 11) {
    return phoneDigits;
  }

  return `(${phoneDigits.slice(0, 2)}) ${phoneDigits.slice(2, 7)}-${phoneDigits.slice(7)}`;
}

// Validação simples usada no endpoint antes de enviar ao provedor de email.
export function isValidJoinEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Garante que o estado recebido pertence à lista oficial usada pelo frontend.
export function isValidStateCode(value: string): value is StateCode {
  return STATE_CODES.includes(value as StateCode);
}

// Confere no servidor se a cidade realmente pertence ao estado selecionado.
export function isValidCityForState(state: StateCode, city: string) {
  const normalizedCity = normalizeForComparison(city);

  return CITIES_BY_STATE[state].some(
    (cityOption) => normalizeForComparison(cityOption.name) === normalizedCity,
  );
}
