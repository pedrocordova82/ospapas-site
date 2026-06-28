export const officialWhatsappNumbers = {
  sedePara: "5591982287730",
  brasilia: "5521999823424",
  rioDeJaneiro: "5521987967627",
  saoLuis: "5598982046967",
  macapa: "5596981255293",
  recife: "5581991307887",
  saoJoseDosCampos: "5521980926664",
} as const;

export function toWhatsappHref(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}
