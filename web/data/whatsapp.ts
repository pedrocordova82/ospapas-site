export const officialWhatsappNumbers = {
  sedePara: "5591982287730",
  almeirim: "5593984338079",
  brasilia: "5521999823424",
  curitiba: "5541999122817",
  rioDeJaneiro: "5521987967627",
  saoMiguelDoOeste: "5549991750063",
  saoLuis: "5598982046967",
  macapa: "5596981255293",
  portoDeMoz: "5593984390212",
  recife: "5581991307887",
  salinopolis: "5591981796053",
  saoJoseDosCampos: "5521980926664",
  umuarama: "5544998476721",
} as const;

export function toWhatsappHref(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}
