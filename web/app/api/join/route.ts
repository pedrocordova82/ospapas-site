import { NextResponse } from "next/server";
import { sendJoinInterestEmail } from "@/lib/email/sendJoinInterestEmail";
import {
  formatBrazilPhone,
  isValidCityForState,
  isValidJoinEmail,
  isValidStateCode,
  normalizeJoinPhone,
  normalizeJoinText,
} from "@/lib/validation/joinForm";

type JoinRequestBody = {
  nome?: unknown;
  estado?: unknown;
  cidade?: unknown;
  celular?: unknown;
  email?: unknown;
  website?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as JoinRequestBody;
    const honeypot = normalizeJoinText(body.website);

    const nome = normalizeJoinText(body.nome);
    const estado = normalizeJoinText(body.estado);
    const cidade = normalizeJoinText(body.cidade);
    const celularDigits = normalizeJoinPhone(body.celular);
    const email = normalizeJoinText(body.email).toLowerCase();

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

    if (!isValidJoinEmail(email)) {
      return NextResponse.json(
        { message: "Informe um email válido." },
        { status: 400 },
      );
    }

    if (!isValidStateCode(estado)) {
      return NextResponse.json(
        { message: "Estado inválido." },
        { status: 400 },
      );
    }

    if (!isValidCityForState(estado, cidade)) {
      return NextResponse.json(
        { message: "Cidade inválida para o estado selecionado." },
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
