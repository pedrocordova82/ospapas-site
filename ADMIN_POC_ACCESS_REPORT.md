# MC Os Papas — Prova de conceito de isolamento regional

**Etapa 02D · Ambiente experimental**

## Objetivo e escopo

Validar a autorização do portal administrativo com Payload CMS, dois perfis administrativos e uma unidade por conta Regional. A experiência usa o aplicativo isolado em `admin/`, o painel nativo, Payload **3.94.2**, Next.js **16.4.6**, Node.js **24.22.3** e PostgreSQL **17.12** local. As versões e o lockfile da Etapa 02C foram reutilizados. Os dados e as contas são fictícios. Publicar na PoC altera o estado no CMS. A integração com o site institucional fica para outra etapa. [Requisitos aprovados](ADMIN_PROJECT_SPEC.md) · [Relatório da Etapa 02C](ADMIN_POC_REPORT.md)

## Decisão sobre autorização

Os controles nativos do Payload atendem ao modelo de dois perfis com uma atribuição regional por conta. A política de coleção combina o escopo do operador com o filtro da consulta. Isso limita também a contagem e a paginação. Controles de campo orientam o painel e reforçam a proteção. Os ganchos das operações retornam HTTP 403 quando um Regional tenta alterar valores protegidos, inclusive quando o mesmo corpo contém campos permitidos. O painel nativo pode enviar de volta valores de campos somente leitura. O servidor compara esses valores à versão persistida e rejeita tentativas de alteração. Ganchos calculam a titularidade na criação e validam invariantes antes da gravação. [Acesso por coleção](https://payloadcms.com/docs/access-control/collections) · [Acesso por campo](https://payloadcms.com/docs/access-control/fields)

O plugin oficial Multi-Tenant oferece campos e filtros de unidade, experiência de seleção de unidade e suporte a cenários com usuários em vários locatários. A Etapa 02D manteve a configuração nativa para experimentar o caso de atribuição única e reduzir dependências. A decisão deixa explícita a responsabilidade do aplicativo pela consistência entre coleções, relacionamentos e versões. Vale reavaliar o plugin se a atribuição múltipla se tornar requisito. [Plugin Multi-Tenant](https://payloadcms.com/docs/plugins/multi-tenant)

## Coleções e matriz de permissões

| Coleção ou operação | Geral ativo | Regional ativo |
| --- | --- | --- |
| Usuários | Provisiona contas, consulta, altera perfil e unidade e ativa ou desativa contas, sujeito à proteção do último Geral. | Consulta a própria conta e pode trocar a própria senha. |
| Sedes e Regionais | Cria, consulta, altera todos os campos e ativa ou desativa unidades. | Consulta a unidade atribuída e altera os seis campos de Minha Sede. |
| Membros | Cria, consulta, edita, desativa e reativa. Pode transferir um membro por alteração individual e explícita da unidade. | Mesmas operações de conteúdo na unidade atribuída, com titularidade derivada na criação. |
| Agenda | Gerencia compromissos nacionais e regionais, incluindo rascunhos, publicação e versões autorizadas. | Cria, consulta, edita, lista, conta, desativa, reativa, publica e restaura como rascunho na unidade atribuída. |
| Eventos | Gerencia eventos nacionais e regionais e vínculos válidos com a Agenda. | Gerencia eventos da unidade atribuída e vincula compromissos acessíveis da mesma unidade. |
| Diretoria Nacional | Consulta e mantém os dados próprios da Diretoria. Pode vincular um membro. | Acesso vedado. |
| Exclusão permanente nas seis coleções | Vedada pelas operações comuns. | Vedada pelas operações comuns. |

O escopo nacional de Agenda e Eventos é representado pela ausência de unidade. Na criação regional, o servidor extrai a unidade da conta autenticada. Uma atribuição incompatível recebe HTTP 403. A transferência implementada é individual e restrita a Membros. A titularidade de Agenda e Eventos permanece fixa após a criação. Desativar e reativar conteúdo altera o estado do registro. As contas têm estado próprio, independente do estado do conteúdo. A política para acesso administrativo após desativar uma unidade deve ser confirmada antes da implementação final.

### Campos de Minha Sede

O Regional pode salvar **Sobre a Sede**, **Número do WhatsApp**, **Instagram**, **Endereço**, **Link da localização** e **Imagem de capa**. A capa é uma referência textual fictícia. Nome, tipo, cidade, estado, identificador da URL, ordem e situação ficam protegidos, inclusive em gravações com múltiplos campos. A PoC valida a autorização sobre os valores. A validação final de formatos de contato e arquivos permanece pendente.

### Relacionamentos

Eventos aceitam um identificador de compromisso acessível do mesmo âmbito. O servidor lê esse compromisso pela Local API com as permissões do operador, usando a transação da operação. Gravações de relacionamento usam identificadores. O vínculo da Diretoria aponta para um membro, com população desativada para esse campo, e o nome nacional é um dado próprio que o Geral atualiza expressamente. Assim, alterar o cadastro regional preserva a apresentação nacional. [Campos de relacionamento](https://payloadcms.com/docs/fields/relationship)

### Contas e Local API

A autenticação usa as sessões nativas. O banco fornece o perfil, a situação da conta e a unidade em cada nova solicitação autenticada. Na desativação, o servidor limpa as sessões no mesmo fluxo da atualização. A reativação exige um novo login. Uma conta Regional pode consultar a si e alterar sua senha. Criação de contas, alteração de perfil, atribuição regional, desbloqueio por tentativas de login e reativação exigem Geral. Recuperação por e-mail está desabilitada nesta PoC. Requisições já em processamento no momento da revogação estão fora do teste.

Operações em nome de administradores usam `req` autenticado e `overrideAccess: false`. A verificação de versões e a validação de vínculos seguem essa regra. Os usos explícitos de `overrideAccess: true` estão na preparação local da primeira conta e nas leituras independentes de verificação da suíte. A preparação usa um contexto interno e confere se a coleção está vazia. A trava do último Geral consulta somente os identificadores necessários, na transação da própria gravação, sem expor o resultado ao cliente. [Autenticação](https://payloadcms.com/docs/authentication/overview) · [Autorização na Local API](https://payloadcms.com/docs/local-api/overview)

### Rascunhos e versões

Payload Drafts e Versions estão habilitados na Agenda. A leitura de versões é filtrada pela unidade armazenada na versão. Essa unidade é constante durante a vida do compromisso. A restauração confere a permissão de leitura da versão antes da operação nativa, preserva a unidade atual e exige REST com `draft=true`. A versão publicada continua disponível no CMS até uma publicação explícita. A Local API foi exercitada para leitura de versões com acesso imposto. O método nativo `restoreVersion` da Local API nesta versão não encaminha o modo de rascunho, portanto a restauração autorizada da PoC usa a rota REST. [Rascunhos](https://payloadcms.com/docs/versions/drafts) · [Versões](https://payloadcms.com/docs/versions/overview)

## PostgreSQL e reprodução

O PostgreSQL 17.12 rodou em Debian 13 x86-64, em loopback, com autenticação TCP SCRAM e banco descartável. O pool usa até três conexões por processo e espera até cinco segundos por conexão. O esquema é preparado explicitamente. O runtime mantém a alteração automática de esquema desabilitada.

As gravações usam isolamento `SERIALIZABLE`. Ao desativar ou rebaixar um Geral ativo, a verificação bloqueia as linhas dos Gerais ativos em ordem de ID na transação da gravação. Conflitos relevantes retornam HTTP 409. O bloqueio expõe o conflito durante a operação, pois na primeira rodada a restrição serializável preservou o estado do banco, mas o adaptador informou sucesso para duas chamadas concorrentes. A trava usa a sessão transacional do adaptador PostgreSQL e depende dessa integração. A evolução da arquitetura deve verificar a semântica de retorno do adaptador também para outras operações concorrentes e planejar tratamento de conflito e repetição segura. [Transações no Payload](https://payloadcms.com/docs/database/transactions) · [Isolamento no PostgreSQL](https://www.postgresql.org/docs/17/transaction-iso.html)

1. Crie um banco PostgreSQL descartável e vazio no loopback, com usuário dedicado. A suíte altera dados. Para outra execução, prepare outro banco vazio.
2. Em `admin/`, copie `.env.example` para `.env.poc` e preencha `DATABASE_URL`, `PAYLOAD_SECRET`, `POC_ADMIN_EMAIL` fictício e `POC_ADMIN_PASSWORD` temporária. Use as orientações da Etapa 02C para gerar os valores locais. Guarde o arquivo fora do versionamento.
3. Execute os comandos a seguir. A suíte copia o artefato para um diretório temporário, inicia o standalone em loopback, cria os registros fictícios e encerra o servidor.

   ```sh
   npm ci
   npm run db:prepare
   npm run typecheck
   npm run lint
   NEXT_TELEMETRY_DISABLED=1 npm run build
   npm run test:integration
   ```

## Resultados observados

A suíte nativa do Node.js executou **15 testes** no standalone, com **15 sucessos e 0 falhas**. Cada cenário negativo relevante conferiu o resultado e o estado persistido ou a ausência de dados no escopo.

| Validação | Resultado | Evidência observada |
| --- | --- | --- |
| Instalação, tipagem, lint e build | Validado | `npm ci`, `npm run typecheck`, `npm run lint` e build de produção concluídos. O artefato standalone respondeu no loopback. |
| REST, escopo de consulta e Local API | Validado | Consultas por ID, listagem filtrada, contagem e paginação respeitaram a unidade. Duas contas de Brasília compartilharam o mesmo escopo. Rio, Brasília e o âmbito nacional permaneceram isolados. A Local API repetiu casos de leitura, escrita e população com acesso imposto. |
| Campos, titularidade e operações em lote | Validado | Os seis campos de Minha Sede foram gravados. Alterações protegidas com campos permitidos no mesmo corpo receberam 403 e o estado foi preservado. O servidor derivou a unidade, restringiu a transferência individual ao Geral e limitou a atualização em lote ao escopo. A desativação e a reativação foram reversíveis, e as exclusões comuns foram negadas. |
| Relacionamentos e Diretoria Nacional | Validado | Com profundidade 0 o vínculo trouxe o identificador. Com profundidade 2 trouxe o compromisso e a unidade autorizados. Associações de outro âmbito e dados aninhados foram rejeitados. Editar o membro preservou os dados nacionais, que o Geral pôde alterar explicitamente. |
| Publicação e restauração | Validado | O Regional publicou um rascunho diretamente no CMS. Anônimos e contas de outra unidade ficaram sem acesso. As listas e consultas de versões respeitaram o escopo. A restauração autorizada gerou um rascunho com a unidade original e preservou a versão publicada. |
| Contas e última conta Geral | Validado | A conta Regional consultou a si, alterou a própria senha e teve negados acesso e manutenção de outras contas e mudanças de perfil ou unidade. Uma sessão anterior perdeu acesso após desativação e continuou inválida após reativar a conta. Duas desativações concorrentes retornaram um sucesso e um conflito 409, com um Geral ativo confirmado no banco. |
| PostgreSQL e reinício | Validado | Esquema criado explicitamente, pool configurado com limite de três conexões, dados e autorizações preservados após reinício e verificações independentes realizadas no PostgreSQL. O bloqueio concorrente ocorreu em transações locais. |
| Painel nativo | Validado | Chromium autenticou ambos os perfis. O Geral viu as duas unidades e a Diretoria. O Regional viu somente Brasília, encontrou o nome da unidade somente leitura e salvou Sobre a Sede pelo painel. |
| Concorrência e revogação em produção | Parcialmente validado | Os casos locais cobrem dois operadores concorrentes e novas solicitações após revogação. Permanecem em aberto contenção com carga, semântica de conflitos em outras escritas e solicitações já iniciadas antes da revogação. |
| Mídia, Neon, Linux Arm64 e execução na AWS | Não validado | A etapa usou referências fictícias e um banco local em x86-64. As validações de mídia permanecem para a Etapa 02E. |
| Infraestrutura externa e implantação | Bloqueado | A etapa autorizou validação local e não provisionou serviços externos. |

## Limites e recomendação

A Etapa 02E deve validar acesso a arquivos de rascunho, propriedade de mídia, reutilização entre registros, pôsteres, autorização antes de expor URLs, exclusão de arquivos referenciados e proteção contra substituições indiretas. Continuam pendentes auditoria completa, histórico de transferências de Membros, recuperação por e-mail, concorrência prolongada, migrações controladas, conectividade Neon, validação Linux Arm64 e execução AWS.

O custo adicional de infraestrutura desta validação foi **R$ 0,00**. O teto mensal continua em **R$ 50,00**. O desenho final deve buscar o menor custo operacional viável e preservar segurança, desempenho e disponibilidade.

**Recomendação — prosseguir com ajustes.** Manter os controles nativos e o PostgreSQL como candidatos. Antes de aprovar a arquitetura final, formalizar as regras de revogação em operações em andamento, validar a proteção durante transferências concorrentes, revisar o tratamento de conflitos do adaptador e executar a Etapa 02E para mídias. A prova de conceito oferece evidência local e ainda exige validação no ambiente de produção proposto.
