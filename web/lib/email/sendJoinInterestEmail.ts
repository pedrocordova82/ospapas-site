export type JoinInterestEmailPayload = {
  nome: string;
  estado: string;
  cidade: string;
  celular: string;
  email: string;
};

type ResendErrorResponse = {
  message?: string;
  name?: string;
  statusCode?: number;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendJoinInterestEmail(payload: JoinInterestEmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.JOIN_FORM_TO_EMAIL;
  const from = process.env.JOIN_FORM_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    throw new Error("Configuração de email incompleta.");
  }

  const sentAt = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date());

  const subject = "Novo interesse em fazer parte do MC Os Papas";

  const text = [
    "Novo interesse em fazer parte do MC Os Papas",
    "",
    `Nome: ${payload.nome}`,
    `Estado: ${payload.estado}`,
    `Cidade: ${payload.cidade}`,
    `Celular: ${payload.celular}`,
    `Email: ${payload.email}`,
    `Data/hora do envio: ${sentAt}`,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6;">
      <h2 style="margin-bottom: 16px;">Novo interesse em fazer parte do MC Os Papas</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 640px;">
        <tbody>
          <tr>
            <td style="padding: 8px 0; font-weight: 700;">Nome</td>
            <td style="padding: 8px 0;">${escapeHtml(payload.nome)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 700;">Estado</td>
            <td style="padding: 8px 0;">${escapeHtml(payload.estado)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 700;">Cidade</td>
            <td style="padding: 8px 0;">${escapeHtml(payload.cidade)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 700;">Celular</td>
            <td style="padding: 8px 0;">${escapeHtml(payload.celular)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 700;">Email</td>
            <td style="padding: 8px 0;">${escapeHtml(payload.email)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 700;">Data/hora do envio</td>
            <td style="padding: 8px 0;">${escapeHtml(sentAt)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      reply_to: payload.email,
      text,
      html,
    }),
  });

  if (!response.ok) {
    let errorBody: ResendErrorResponse | string | null = null;

    try {
      errorBody = (await response.json()) as ResendErrorResponse;
    } catch {
      try {
        errorBody = await response.text();
      } catch {
        errorBody = null;
      }
    }

    // Log enxuto para facilitar diagnóstico sem expor segredos.
    console.error("Falha no provedor de email:", {
      status: response.status,
      body: errorBody,
    });

    const providerMessage =
      typeof errorBody === "string" ? errorBody : errorBody?.message;

    throw new Error(providerMessage || "Falha ao enviar email.");
  }

  return response.json();
}
