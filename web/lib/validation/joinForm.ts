import { CITIES_BY_STATE, STATE_CODES, type StateCode } from "@/data/brazil-locations";

export function normalizeJoinText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
}

export function normalizeJoinPhone(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\D/g, "");
}

export function normalizeForComparison(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function formatBrazilPhone(phoneDigits: string) {
  if (phoneDigits.length !== 11) {
    return phoneDigits;
  }

  return `(${phoneDigits.slice(0, 2)}) ${phoneDigits.slice(2, 7)}-${phoneDigits.slice(7)}`;
}

export function isValidJoinEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidStateCode(value: string): value is StateCode {
  return STATE_CODES.includes(value as StateCode);
}

export function isValidCityForState(state: StateCode, city: string) {
  const normalizedCity = normalizeForComparison(city);

  return CITIES_BY_STATE[state].some(
    (cityOption) => normalizeForComparison(cityOption.name) === normalizedCity,
  );
}
