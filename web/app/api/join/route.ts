import { NextResponse } from "next/server";
import { CITIES_BY_STATE, STATE_CODES, type StateCode } from "@/data/brazil-locations";
import { sendJoinInterestEmail } from "@/lib/email/sendJoinInterestEmail";

type JoinRequestBody = {
  nome?: unknown;
  estado?: unknown;
  cidade?: unknown;
  celular?: unknown;
  email?: unknown;
  website?: unknown;
};

function normalizeText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
}

function normalizePhone(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\D/g, "");
}

function formatBrazilPhone(phoneDigits: string) {
  if (phoneDigits.length !== 11) {
    return phoneDigits;
  }

  return `(${phoneDigits.slice(0, 2)}) ${phoneDigits.slice(2, 7)}-${phoneDigits.slice(7)}`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeForComparison(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isValidStateCode(value: string): value is StateCode {
  return STATE_CODES.includes(value as StateCode);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as JoinRequestBody;
    const honeypot = normalizeText(body.website);

    const nome = normalizeText(body.nome);
    const estado = normalizeText(body.estado);
    const cidade = normalizeText(body.cidade);
    const celularDigits = normalizePhone(body.celular);
    const email = normalizeText(body.email).toLowerCase();

    // Bots costumam preencher campos invisíveis; respondemos silenciosamente.
    if (honeypot) {
      return NextResponse.json(
        { message: "Interesse enviado com sucesso. Em breve entraremos em contato." },
        { status: 200 },
      );
    }

    if (!nome || !estado || !cidade || !celularDigits || !email) {
      return NextResponse.json(
        { message: "Preencha todos os campos obrigatórios." },
        { status: 400 },
      );
    }

    if (celularDigits.length !== 11) {
      return NextResponse.json(
        { message: "Informe um celular válido com 11 dígitos." },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Informe um email válido." },
        { status: 400 },
      );
    }

    if (!isValidStateCode(estado)) {
      return NextResponse.json(
        { message: "Selecione um estado válido." },
        { status: 400 },
      );
    }

    const normalizedCity = normalizeForComparison(cidade);
    const cityExistsInState = CITIES_BY_STATE[estado].some(
      (cityOption) => normalizeForComparison(cityOption.name) === normalizedCity,
    );

    if (!cityExistsInState) {
      return NextResponse.json(
        { message: "Selecione uma cidade válida para o estado informado." },
        { status: 400 },
      );
    }

    await sendJoinInterestEmail({
      nome,
      estado,
      cidade,
      celular: formatBrazilPhone(celularDigits),
      email,
    });

    return NextResponse.json(
      { message: "Interesse enviado com sucesso. Em breve entraremos em contato." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao processar interesse do formulário:", error);

    return NextResponse.json(
      { message: "Não foi possível enviar seu interesse agora. Tente novamente em instantes." },
      { status: 500 },
    );
  }
}

export function GET() {
  return NextResponse.json({ message: "Método não permitido." }, { status: 405 });
}
