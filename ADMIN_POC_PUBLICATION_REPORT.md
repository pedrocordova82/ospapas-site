# MC Os Papas — Prova de conceito de publicação automatizada

**Etapa 02F · Ambiente experimental**

## Objetivo

Validar a publicação versionada de conteúdo do Payload com PostgreSQL e armazenamento S3 local emulado. O consumidor acessa somente a release disponibilizada pelo armazenamento e funciona sem consultar a administração ou o banco. A PoC fica em `admin/`, usa dados fictícios e prepara um contrato para a integração futura com o site estático. [Especificação aprovada](ADMIN_PROJECT_SPEC.md) · [PoC da fundação](ADMIN_POC_REPORT.md) · [PoC de acesso](ADMIN_POC_ACCESS_REPORT.md) · [PoC de mídia](ADMIN_POC_MEDIA_REPORT.md)

## Site atual e arquitetura recomendada

O site usa a exportação estática do Next.js em `web/next.config.ts`. Diretoria e Sedes leem módulos de `web/data/`. Agenda e Eventos combinam dados locais, galerias, links e âncoras. A Filantropia mantém ações e mídias históricas na própria página. As páginas regionais usam `generateStaticParams` e `dynamicParams = false` em `/sedes/[slug]`. O layout e páginas como Agenda, Eventos e Filantropia definem metadados estáticos. A navegação pública já usa rotas como `/diretoria`, `/sedes`, `/agenda`, `/eventos`, `/eventos/encontro-nacional` e `/filantropia`. O inventário foi feito por leitura do repositório. [Exportação estática no Next.js](https://nextjs.org/docs/app/guides/static-exports) · [Geração de parâmetros estáticos](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)

| Alternativa | Efeito sobre o site |
| --- | --- |
| JSON consumido no navegador | Atualiza listas, contatos, cartões, descrições, capas e galerias de páginas existentes sem build. Exige estado de carregamento acessível, tratamento de falhas e uma release fixa por visualização. |
| Snapshot no build | Gera HTML e metadados com os dados publicados e melhora a disponibilidade sem JavaScript e a previsibilidade da indexação. Cada atualização incorporada ao HTML demanda outro build. |
| Híbrida, recomendada | Manter o HTML e a navegação estáticos. Usar JSON versionado nas regiões de conteúdo que mudam com frequência. Gerar HTML novamente para novas rotas e alterações em metadados, conteúdo indexável, sitemap e estrutura. |

Títulos, descrições, canônicos, metadados Open Graph e sitemap exigem integração explícita com o build estático. A PoC não altera essas saídas. Na integração, gerar o sitemap a partir dos slugs aprovados e preservar URLs e âncoras existentes. Para novas sedes, registrar o slug aprovado e acionar um build estrutural que leia a release fixa, valide rota, sitemap e metadados e entregue HTML correspondente. O fluxo é disparado pelo sistema e pode passar por aprovação operacional quando altera a aplicação. O administrador de conteúdo usa o portal. [Metadados no Next.js](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) · [Convenção de sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)

O HTML inicial deve conservar identidade institucional, navegação sem JavaScript e informação estável. A integração deve preservar ordem de leitura, foco e áreas de clique, reservar espaço contra deslocamento de layout e sinalizar carregamento e falhas de forma acessível. Para campos sujeitos a revogação ou alteração frequente, evitar cópias permanentes no HTML inicial. A integração com o layout responsivo e a experiência pública existente requer homologação.

## Colisão com deploy e fronteiras de armazenamento

O deploy atual sincroniza a saída estática em todo o bucket com `aws s3 sync out/ s3://${S3_BUCKET} --delete`. Um objeto publicado pelo CMS nesse destino e ausente de `out/` pode ser removido pelo deploy de código. A invalidação atual usa `/*`. A integração deve dar ao workflow direito de escrever e excluir exclusivamente artefatos da aplicação. Arquivos do CMS, mídias e backups precisam de destinos e políticas próprios. [Workflow atual](.github/workflows/deploy-aws.yml) · [AWS CLI sync](https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html)

| Área | Fronteira proposta |
| --- | --- |
| Aplicação institucional | Bucket estático com escopo IAM para sincronização de código e seus artefatos. |
| Mídia privada e rascunhos | Bucket privado da administração, sem acesso pelo consumidor. |
| Releases | Bucket próprio por ambiente. O worker grava os arquivos versionados e o manifesto ativo. |
| Mídia publicada | Bucket próprio por ambiente. O worker grava derivados aprovados em chaves por SHA-256. |
| Backups | Área privada com política independente, retenção aprovada e leitura restrita ao processo de restauração. |

O Moto simula buckets separados de releases e mídias por ambiente, além do bucket de mídia privada. O servidor de demonstração limita a leitura aos objetos listados em manifests ativados. Os acessos entre ambientes são validados pela aplicação. Permissões AWS e OAC exigem ensaios separados.

## Contrato, aprovação e projeção

A API aceita seleções explícitas de até 30 registros. A seleção regional opera somente nos registros da unidade autenticada. O Geral seleciona conteúdo nacional ou de unidades e autoriza restauração e revogação. Os corpos têm formato fechado e o destino deve coincidir com a configuração do processo. Os documentos da fila ocultam a cópia privada da intenção no acesso ordinário.

Para repetir um pedido, o endpoint verifica o acesso à fila e, na mesma transação que recoloca o pedido como pendente, consulta a intenção original e as contas atuais no PostgreSQL. O solicitante precisa estar ativo e ser Geral ou dono do pedido. O operador original também precisa estar ativo e ter o perfil e o escopo exigidos pela operação, mesmo quando um Geral solicita a repetição. A publicação verifica os registros selecionados e sua titularidade atual. Uma mudança de perfil permite repetir uma publicação somente se o perfil atual ainda autorizar toda a seleção. Restauração e revogação exigem perfil Geral do operador original e do solicitante. Os bloqueios de linha sobre as contas e os registros mantêm essas condições até o commit. Campos enviados pelo cliente não conferem autoridade.

A aplicação usa a Local API com `overrideAccess: false` para verificar registros e mídias e para registrar a intenção a partir do contexto autenticado. Os registros de mídia continuam sujeitos aos controles da Etapa 02E. Agenda usa a versão publicada do CMS e recusa rascunhos inéditos. Nas coleções experimentais sem estados de versão, a seleção explícita aprova apenas a cópia dos registros escolhidos. Mudanças não selecionadas ficam no CMS. Um registro inativo selecionado sai da projeção. A retirada de uma sede remove os vínculos ativos correspondentes.

Cada grupo tem um tipo e uma lista de campos públicos. Sedes preservam slug, contatos permitidos, descrição e ordem explícita. Diretoria exporta nome público e capa opcional. Membros exportam nome, patente e vínculo público. Agenda e Eventos exportam os títulos disponíveis no modelo experimental, a unidade e mídias autorizadas. Eventos podem apontar para vídeo e pôster validados. As relações usam identificadores públicos estáveis derivados por HMAC. A chave deve ser independente e estável por ambiente. Em produção, preferir identificadores públicos persistidos para que a rotação de segredos não altere identidades já sujeitas à revogação. Contas, credenciais, rascunhos, dados de auditoria, documentos populados e chaves privadas ficam fora da projeção.

O contrato é `versao: 1`. `manifest.json` aponta para a release ativa, inclui horário de ativação, referências anteriores e uma lista de identificadores ou mídias revogados. Cada release tem ID gerado no servidor, sequência PostgreSQL, data da solicitação, checksums e tamanhos dos cinco documentos, e as chaves públicas das mídias. Cada JSON inclui versão e ID da release. A Filantropia pode seguir o mesmo contrato quando sua coleção existir, com allowlist e autorização próprias. Novos tipos de dados ou contratos incompatíveis exigem evolução coordenada do manifesto e dos consumidores.

## Fila durável, ativação e recuperação

A seleção e a captura do conteúdo ocorrem sob `REPEATABLE READ` na mesma transação que insere a intenção. Trata-se de uma outbox da ação explícita de publicar. As edições anteriores do CMS podem ser salvas sem gerar publicação automática. Um advisory lock serializa a inscrição na sequência. A chave de idempotência é vinculada ao operador, ambiente e corpo aprovado. A resposta só confirma a intenção depois de uma leitura da fila após o commit. [Isolamento de transações PostgreSQL](https://www.postgresql.org/docs/17/transaction-iso.html)

O worker interno opera uma solicitação por vez, com exclusão mútua por ambiente. A fila mantém `pendente`, `processando`, `publicado` e `falhou`. Um trabalho em processamento impede que os próximos avancem até o vencimento da reserva para retomada. O worker usa SQL interno para reivindicar, reconciliar ou atualizar estados e revalidar a conta do operador original e os registros selecionados. A leitura das aprovações de mídia usa um snapshot consistente. O conteúdo aceito para a release vem da cópia aprovada e do último snapshot válido. Preparação do banco e criação dos buckets locais são operações administrativas isoladas.

1. Ler o manifesto ativo e reconciliar um pedido cuja sequência e ID já estejam ativos. Para uma nova ativação, conferir a autorização do operador original e ler o snapshot verificado. Aplicar somente as alterações aprovadas e rejeitar alterações de titularidade, inativação posterior, relações órfãs e mídia inválida nos registros selecionados.
2. Produzir os cinco JSONs e o manifesto da release. Conferir versões, campos, referências, tamanho e SHA-256. Verificar os objetos de mídia publicados.
3. Gravar os arquivos da release com condição de criação. Uma tentativa repetida aceita somente arquivos de conteúdo idêntico. O worker copia apenas derivados aprovados e evita regravar uma mídia cujo conteúdo já existe. Um arquivo incompleto de uma tentativa fica fora do conjunto servido.
4. Revalidar a autorização e os registros imediatamente antes de atualizar `manifest.json`, com `FOR SHARE` em transação `READ COMMITTED`. A leitura aguarda alterações concorrentes nas linhas bloqueadas e usa o estado confirmado. Manter os bloqueios durante a escrita condicional com `If-Match` no ETag observado ou `If-None-Match: *` na primeira ativação. Uma recusa preserva a release pública anterior. Uma sequência inferior à ativa é recusada. O ETag é usado para concorrência e o SHA-256 para integridade.
5. Registrar a confirmação no banco. Se a resposta da ativação ou a gravação de estado ficar incerta, a retomada lê o manifesto. Se o manifesto confirma o trabalho, o worker reconcilia o estado sem regravar a release, inclusive após alteração das permissões do operador.

O armazenamento contém arquivos independentes. A atomicidade lógica vem do ponteiro atualizado como última operação, com arquivos completos e verificados. O teste valida o protocolo no Moto. O S3 oferece consistência forte para operações de objetos, e a integração real ainda precisa homologar as condições e permissões do bucket. [Escritas condicionais S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html) · [Consistência do S3](https://aws.amazon.com/s3/consistency/)

PostgreSQL e S3 não compartilham uma transação. Uma edição de conta ou registro pode aguardar o fim da escrita do manifesto. Se a sessão do banco cair ou a resposta da escrita expirar, os bloqueios podem ser liberados antes de o armazenamento concluir a operação. A retomada verifica o manifesto para determinar se a ativação ocorreu. Uma mudança de permissão posterior a uma ativação bem-sucedida vale para operações futuras. A retirada de conteúdo já ativo usa a revogação.

A PoC executa o worker sob demanda, uma vez por comando. A proposta de produção é sinalizar a ativação do worker após a confirmação da intenção e drenar a fila com repetição controlada. Um mecanismo de entrega persistente, como um relay da outbox com acionamento sob demanda, deve recuperar sinalizações perdidas e leases vencidas. Medir o custo de reconciliação espaçada e a possibilidade de o banco dormir antes de escolher o disparador. O processo de publicação rotineira dispensa builds e operações manuais no GitHub.

## Mídia, rollback e revogação

Só derivados prontos e aprovados entram no bucket de mídia publicada. Capas e pôsteres próprios exigem imagem aprovada, texto alternativo válido e o mesmo âmbito. Originais, prévias privadas e chaves de origem permanecem na área privada. Derivados com conteúdo idêntico reutilizam a chave SHA-256. As releases armazenam caminhos públicos, sem depender da URL privada do Payload.

O rollback ordinário cria uma **nova sequência** com dados de uma release anterior elegível. A revogação urgente é uma operação distinta, reservada ao Geral. Ela remove o alvo da projeção, bloqueia seu reaparecimento e encerra a disponibilidade pública das releases históricas que poderiam reintroduzi-lo. A PoC elimina todo o histórico elegível no instante de uma revogação, uma política conservadora. Objetos permanecem fisicamente no armazenamento privado para permitir procedimento controlado de retenção. O gateway recusa acesso ao histórico retirado e às mídias revogadas. Cópias já entregues exigem tratamento separado.

## Consumo, cache e CloudFront

A demonstração Node usa apenas o armazenamento, verifica o manifesto, fixa o ID da release e valida os cinco documentos antes de renderizar Diretoria, Sedes, membros, contatos e Agenda. Durante uma ativação ordinária, o gateway aceita leituras da release anterior por uma janela de cinco minutos para concluir visualizações em andamento. O consumidor recusa manifestos inválidos, schemas incompatíveis e arquivos que não correspondam à release selecionada. O fallback é uma mensagem de indisponibilidade. Durante queda do CMS, o manifesto válido continua no armazenamento.

Para o CloudFront, usar OAC nos buckets privados de origem e definir comportamentos separados para manifesto e arquivos versionados. O manifesto ativo deve usar TTL curto ou revalidação com ETag e tipos de conteúdo corretos. JSONs e mídias versionados podem usar cache imutável de longa duração quando a política de remoção permitir. Para dados revogáveis, definir janela menor e controle que não dependa somente de chave imutável. Uma retirada urgente deve bloquear acesso na origem, invalidar os caminhos afetados e registrar a convergência observada. A PoC usa `no-store` na demonstração para testar recusa imediata no caminho local. Cache de borda e cópias em clientes não mudam de forma instantânea. A publicação termina quando o manifesto de origem é atualizado e verificado. A visibilidade global é um indicador separado. [Políticas de expiração CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html) · [Invalidação](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html) · [OAC](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)

## DEV, HML e PRD

| Ambiente | Proposta |
| --- | --- |
| DEV | Codex Cloud, PostgreSQL e armazenamento descartáveis. Dados fictícios. |
| HML | Banco, armazenamento e credenciais separados. Acesso restrito e dados fictícios ou sanitizados. Ambiente acionado sob demanda sempre que viável. |
| PRD | Banco e armazenamento independentes. Deploy de aplicação com aprovação manual. Depois da aprovação, publicação direta por administradores autorizados. |

No Moto, destinos incluem prefixo e nome de ambiente, e cada worker valida o ambiente de execução antes de abrir seus destinos. A simulação verifica o isolamento dos objetos e da fila por ambiente. O teste usa fixtures num PostgreSQL local compartilhado e credenciais fictícias do emulador. A configuração final deve usar contas ou papéis IAM separados e políticas de bucket que impeçam escrita de HML em PRD, mesmo com erro de aplicação. Propor workflows de GitHub Actions separados para deploy experimental de homologação a partir de `desenvolvimento` e deploy de PRD a partir de `main` com ambiente protegido e aprovação. Cada workflow deve usar OIDC e permissões limitadas à sua origem e ao seu ambiente. O processo dispensa uma branch permanente de homologação.

## Reprodução local

Prepare um PostgreSQL vazio e o emulador Moto conforme as etapas anteriores. Em `admin/.env.poc`, configure `POC_PUBLIC_ENV=dev`, um `POC_PUBLIC_PREFIX` exclusivo e, preferencialmente, um `POC_PUBLIC_ID_SECRET` local estável com ao menos 32 caracteres. Na ausência desse valor, a PoC usa `PAYLOAD_SECRET`. Mantenha os destinos privados e públicos separados. Os testes antigos precedem o novo quando compartilham banco. Para rodadas independentes, use bancos e prefixos descartáveis separados.

```sh
npm ci
npm run db:prepare
npm run media:prepare
npm run publication:prepare
npm run typecheck
npm run lint
NEXT_TELEMETRY_DISABLED=1 npm run build
npm run test:integration
npm run test:media
npm run test:publication
```

Para a demonstração manual, `npm run publication:worker` processa um pedido e `npm run publication:demo` serve a leitura local em `127.0.0.1:3190`. A suíte nova cria fixtures e envia solicitações autenticadas à API, sem incluir artefatos no repositório.

## Resultados e medições

**Ambiente de teste.** Codex Cloud, Debian 13 x86-64, Node.js 24.22.3, PostgreSQL 17.12 e Moto 5.2.6 em loopback. As três suítes usaram o build standalone. A suíte de publicação usou um segundo banco descartável para manter seus fixtures separados da regressão 02D/02E.

| Validação | Classificação | Evidência |
| --- | --- | --- |
| Qualidade e regressões | Validado | `npm run typecheck`, `npm run lint` e `npm run build` passaram em `admin/`. `npm run test:integration` e `npm run test:media` tiveram **15 sucessos e 0 falhas cada**. O standalone respondeu a `/healthz`. |
| Integração de publicação | Validado | **17 sucessos e 0 falhas** em `npm run test:publication`. Os casos usam HTTP real, PostgreSQL e objetos gravados no Moto. |
| Autorização e confidencialidade | Validado | Publicação regional autorizada e rejeição de solicitações anônimas, nacionais indevidas, entre unidades e com papel ou titularidade enviados no corpo. A release excluiu o membro inativo, a alteração posterior de outra unidade, a edição não selecionada de outro Regional de Brasília e a revisão em rascunho da Agenda. |
| Autorização de repetição e ativação | Validado | Mudança de perfil, desativação de conta, troca de unidade e transferência de registro impediram repetição e ativação, com o manifesto ativo preservado. O Geral também recebeu recusa ao repetir pedidos cujo operador perdeu a autorização. O Regional voltou a repetir e publicar após recuperar seu escopo. A perda do perfil Geral bloqueou rollback, revogação e publicação de conteúdo nacional. |
| Projeção e mídia | Validado | O consumidor verificou versões, checksums e referências da release. O teste buscou derivados por SHA-256, recusou caminhos privados e bloqueou a ativação após retirada da aprovação de pôster ou remoção do derivado privado. Os objetos públicos da release anterior continuaram disponíveis. |
| Ativação concorrente e falhas | Validado | A leitura final aguardou uma desativação concorrente no PostgreSQL, verificou o estado confirmado e preservou o manifesto. Duas solicitações com a mesma chave convergiram para uma intenção. Dois workers concorrentes produziram uma ativação por vez. O Moto rejeitou ETag divergente, uma release obsoleta foi recusada e uma falha antes da ativação preservou o manifesto. O consumidor leu a release fixada durante troca do manifesto. |
| Retomada e integridade | Validado | Um worker foi encerrado após gravar os objetos. A suíte antecipou o vencimento da reserva no PostgreSQL, recuperou a execução e reutilizou os objetos idênticos. Após uma interrupção depois da ativação, a retomada reconciliou o estado do pedido com a conta do operador desativada e preservou o ponteiro. |
| Rollback e revogação | Validado | O Geral restaurou a partir de um snapshot antigo em uma nova sequência. Após revogar mídia, a API pública recusou a release histórica e a mídia. A fila rejeitou a restauração e a republicação com o derivado revogado. |
| DEV, HML e PRD | Parcialmente validado | Os destinos independentes no Moto e os controles da aplicação impediram HML de escrever em DEV ou PRD. HML publicou apenas no destino próprio. O ensaio compartilhou fixtures em PostgreSQL local. IAM, bancos independentes de HML/PRD e CloudFront permanecem por homologar. |
| Disponibilidade do consumidor | Validado | A demonstração mostrou uma nova release sem build adicional e retornou indisponibilidade para manifesto malformado ou incompatível. A suíte confirmou a disponibilidade após encerrar o CMS. Na validação inicial da Etapa 02F, manifesto e HTML também permaneceram acessíveis, com HTTP 200 e bytes idênticos, após o PostgreSQL deixar de aceitar conexões. |
| Integração e custos reais | Não validado | SEO de produção, revogação via CDN, tamanho máximo de vídeo, limpeza física, latência AWS e acionamento durável externo exigem homologação. |
| Deploy externo | Bloqueado | A atividade autorizada ficou restrita ao ambiente local. |

### Amostras medidas

| Cenário | Preparo do snapshot | Processamento até confirmação | JSONs da release | Operações de armazenamento |
| --- | ---: | ---: | ---: | ---: |
| Primeira release, sem mídia | 12 ms | 69 ms | 1.613 B | 8 |
| Primeira release com vídeo e imagem compartilhada com o pôster | 56 ms | 95 ms | 3.037 B | 22 |
| Atualização de membro com mídia existente | 21 ms | 60 ms | 3.054 B | 16 |
| Repetição após falha antes do manifesto | 80 ms | 134 ms | 3.054 B | 26 |

Na release com mídia, os cinco JSONs tinham 189 B de Diretoria, 664 B de Sedes, 471 B de Membros, 260 B de Agenda e 624 B de Eventos. O total inclui o manifesto da release. A repetição reutilizou seis arquivos JSON e dois objetos de mídia. A listagem do bucket confirmou as mesmas chaves e metadados antes e depois da repetição. O maior pico registrado pelo worker foi **333.436 KiB de RSS** no processo Node da suíte, incluindo os fixtures. Os tempos excluem o startup do processo e a espera na fila. As amostras usam poucos registros e arquivos pequenos. A PoC limita cada JSON a 4 MiB e lê derivados em buffer para copiar ou servir. Validar consumo com objetos maiores e considerar streaming no desenho final.

## FinOps e recomendação

O teto mensal é **R$ 50,00**. O custo adicional nesta validação local foi **R$ 0,00**. Em HML e PRD, medir o custo combinado de PostgreSQL, armazenamento e requisições S3, transferência por CDN, execução do worker, builds estruturais, backups, retenção e invalidações. Começar com snapshots completos de metadados, poucos releases retidos e mídia deduplicada por conteúdo. Snapshots completos simplificam validação, consumo e rollback. Deltas podem reduzir escritas com acervos grandes e introduzem dependências entre versões. Um modelo totalmente endereçado por conteúdo pode eliminar duplicação de JSON com escala comprovada. Medir o volume antes de ampliar essa complexidade.

**Recomendação — prosseguir com ajustes.** Homologar o protocolo de ativação e as políticas IAM/OAC em destinos separados antes de integrar o site. Validar a limpeza de objetos órfãos e retenção, pipeline de revogação, orçamento de HML/PRD e acionamento durável do worker. Depois, migrar consumo por rota existente, preservar o HTML público e usar builds estruturais explícitos para SEO e novos slugs. Manter o processamento de mídias separado do deploy da aplicação.
