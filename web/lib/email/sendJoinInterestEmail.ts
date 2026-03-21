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
    "Novo interesse recebido pelo site",
    "",
    `Nome: ${payload.nome}`,
    `Estado: ${payload.estado}`,
    `Cidade: ${payload.cidade}`,
    `Celular: ${payload.celular}`,
    `Email: ${payload.email}`,
    `Data/hora do envio: ${sentAt}`,
    "",
    "Mensagem enviada automaticamente pelo formulário do site.",
  ].join("\n");

  const html = `
    <div style="margin:0; padding:32px 16px; background-color:#0b0b0b;">
      <table role="presentation" style="width:100%; border-collapse:collapse;">
        <tbody>
          <tr>
            <td align="center">
              <table role="presentation" style="width:100%; max-width:680px; border-collapse:collapse; font-family:Arial, sans-serif;">
                <tbody>
                  <tr>
                    <td style="padding:0 0 20px 0;">
                      <div style="border:1px solid rgba(212,175,55,0.22); background-color:#111111; border-radius:20px; overflow:hidden;">
                        <div style="padding:24px 28px; border-bottom:1px solid rgba(212,175,55,0.16); background:linear-gradient(180deg,#171717 0%,#101010 100%);">
                          <p style="margin:0; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#d4af37;">
                            MC Os Papas
                          </p>
                          <h1 style="margin:10px 0 0 0; font-size:28px; line-height:1.2; color:#f8f5ef;">
                            Novo interesse em fazer parte do MC Os Papas
                          </h1>
                          <p style="margin:10px 0 0 0; font-size:14px; line-height:1.7; color:#b9b4aa;">
                            Novo interesse recebido pelo site
                          </p>
                        </div>

                        <div style="padding:28px;">
                          <table role="presentation" style="width:100%; border-collapse:collapse;">
                            <tbody>
                              <tr>
                                <td style="padding:0 0 12px 0; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#d4af37;">
                                  Nome
                                </td>
                                <td style="padding:0 0 12px 24px; font-size:15px; line-height:1.6; color:#f8f5ef;" align="right">
                                  ${escapeHtml(payload.nome)}
                                </td>
                              </tr>
                              <tr>
                                <td colspan="2" style="padding:0 0 14px 0;">
                                  <div style="height:1px; background-color:rgba(255,255,255,0.08);"></div>
                                </td>
                              </tr>

                              <tr>
                                <td style="padding:0 0 12px 0; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#d4af37;">
                                  Estado
                                </td>
                                <td style="padding:0 0 12px 24px; font-size:15px; line-height:1.6; color:#f8f5ef;" align="right">
                                  ${escapeHtml(payload.estado)}
                                </td>
                              </tr>
                              <tr>
                                <td colspan="2" style="padding:0 0 14px 0;">
                                  <div style="height:1px; background-color:rgba(255,255,255,0.08);"></div>
                                </td>
                              </tr>

                              <tr>
                                <td style="padding:0 0 12px 0; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#d4af37;">
                                  Cidade
                                </td>
                                <td style="padding:0 0 12px 24px; font-size:15px; line-height:1.6; color:#f8f5ef;" align="right">
                                  ${escapeHtml(payload.cidade)}
                                </td>
                              </tr>
                              <tr>
                                <td colspan="2" style="padding:0 0 14px 0;">
                                  <div style="height:1px; background-color:rgba(255,255,255,0.08);"></div>
                                </td>
                              </tr>

                              <tr>
                                <td style="padding:0 0 12px 0; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#d4af37;">
                                  Celular
                                </td>
                                <td style="padding:0 0 12px 24px; font-size:15px; line-height:1.6; color:#f8f5ef;" align="right">
                                  ${escapeHtml(payload.celular)}
                                </td>
                              </tr>
                              <tr>
                                <td colspan="2" style="padding:0 0 14px 0;">
                                  <div style="height:1px; background-color:rgba(255,255,255,0.08);"></div>
                                </td>
                              </tr>

                              <tr>
                                <td style="padding:0 0 12px 0; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#d4af37;">
                                  Email
                                </td>
                                <td style="padding:0 0 12px 24px; font-size:15px; line-height:1.6; color:#f8f5ef;" align="right">
                                  ${escapeHtml(payload.email)}
                                </td>
                              </tr>
                              <tr>
                                <td colspan="2" style="padding:0 0 14px 0;">
                                  <div style="height:1px; background-color:rgba(255,255,255,0.08);"></div>
                                </td>
                              </tr>

                              <tr>
                                <td style="padding:0; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#d4af37;">
                                  Data/hora do envio
                                </td>
                                <td style="padding:0 0 0 24px; font-size:15px; line-height:1.6; color:#f8f5ef;" align="right">
                                  ${escapeHtml(sentAt)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div style="padding:18px 28px; border-top:1px solid rgba(212,175,55,0.12); background-color:#0d0d0d;">
                          <p style="margin:0; font-size:12px; line-height:1.7; color:#8f897d;">
                            Esta mensagem foi enviada automaticamente pelo formulário de interesse do site do MC Os Papas.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
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
