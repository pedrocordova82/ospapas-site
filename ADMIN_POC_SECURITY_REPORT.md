# MC Os Papas — Segurança, backup e recuperação

**Etapa 02G · Prova de conceito local**

## Objetivo e escopo

A etapa cobre autenticação e autorização administrativas, auditoria, concorrência, recuperação da publicação e restauração de PostgreSQL e objetos. Os ensaios usam dados fictícios e recursos descartáveis em loopback. O consumidor público lê releases no armazenamento durante a indisponibilidade administrativa. A migração do site, o painel definitivo e a infraestrutura externa ficam fora do escopo. [Especificação](ADMIN_PROJECT_SPEC.md) · [Fundação](ADMIN_POC_REPORT.md) · [Acesso](ADMIN_POC_ACCESS_REPORT.md) · [Mídia](ADMIN_POC_MEDIA_REPORT.md) · [Publicação](ADMIN_POC_PUBLICATION_REPORT.md)

## Avaliação e registro de riscos

Foram revisadas a autenticação, as coleções, os campos, os relacionamentos diretos e indiretos, as versões, os endpoints de mídia e os workers. Operações administrativas na Local API usam o contexto autenticado e overrideAccess: false. Bootstrap e processos internos têm privilégios próprios. Sobretudo em relações populadas, versões e lotes, cada novo chamador precisa exercitar os mesmos controles. [Acesso no Payload](https://payloadcms.com/docs/access-control/overview) · [Local API](https://payloadcms.com/docs/local-api/overview)

| Risco | Severidade | Impacto e probabilidade | Tratamento |
| --- | --- | --- | --- |
| Escrita em trânsito após perda da sessão PostgreSQL | Crítica | Ativação após mudança de autorização. Possível sob falha distribuída. | Barreira por ETag quando há ponteiro seguro. Exigir ordenação durável de autorização, ativação e revogação antes de produção. |
| Recuperação trazer credenciais, privilégios ou conteúdo revogado de volta | Crítica | Acesso indevido ou regressão pública. Provável ao ligar uma cópia antiga diretamente. | Quarentena, exclusão de sessões, fila histórica suspensa e destino isolado. Promoção exige revisão de contas e revogações independentes. |
| Escopo aplicado só à rota principal | Alta | Vazamento por relacionamento, rascunho, versão ou Local API. Possível em novas rotas. | Escopo por perfil, unidade, registro e campo, contexto autenticado e regressões diretas e indiretas. |
| Desativação de unidade, troca de perfil ou lotação com sessão vigente | Alta | Alteração fora da responsabilidade administrativa. Possível no uso normal. | Revogar sessões na alteração da conta e verificar a unidade ativa nas operações. |
| Sobrescrita ou transferência com revisão antiga | Alta | Perda de histórico recente ou mudança de titularidade inesperada. Provável com edições simultâneas. | Transações serializáveis, bloqueio de linha e If-Match experimental em Membros. Estender revisão obrigatória ao fluxo final. |
| Abuso de upload, login e trilha | Alta | Consumo de CPU, banco e espaço. Possível se o serviço estiver exposto. | Validar tipo real e impor cotas de mídia. Agregar recusas. Homologar limite distribuído de requisições e autenticação. |
| Vazamento de segredos, backup ou mídia privada | Alta | Exposição de dados ou credenciais. Possível por configuração ou privilégio excessivo. | Cifrar backup, separar perfis e destinos e homologar IAM e gestão de chaves. |
| Operador privilegiado alterar a trilha | Alta | Perda de evidência investigativa. Possível após comprometimento privilegiado. | Bloquear mutações ordinárias e levar eventos críticos a um destino independente. |
| Pool transacional com lock de sessão | Alta | Falha de exclusão mútua ou lock abandonado. Possível com endpoint errado. | Usar conexão direta nos caminhos de sessão e validar a topologia. |
| Revogação em cache público | Alta | Conteúdo antigo pode permanecer em CDN e clientes. Possível após revogar. | Barreira na origem, política de cache e invalidação homologadas, procedimento para cópias já entregues. |

## Controles administrativos

A desativação de unidade preserva registros e versões. A conta Regional perde login e acesso administrativo de conteúdo, mídia e publicação pendente. O Geral mantém o acesso ao histórico. Essa regra é uma **salvaguarda proposta**, sujeita à aprovação final. Mudanças de perfil, lotação ou desativação da conta removem as sessões gravadas. A proteção do último Geral usa bloqueios transacionais e continua ativa. Uploads mantêm limites de tamanho, duração, resolução, cotas e validação do arquivo. Um upload que já entrou em processamento pode terminar na área privada após mudança de autorização. A aprovação e a ativação pública exigem novas verificações. O Geral pode retirar a aprovação de mídia. A retirada de um derivado já servido exige também revogação pública pela fila.

Membros aceita If-Match com o valor de updatedAt em aspas, obtido na leitura. A comparação ocorre com a linha bloqueada na transação. Revisão antiga ou conflito de serialização retorna 409. O cabeçalho é opcional para compatibilidade. Um cliente que o omite ainda pode sobrescrever uma alteração concluída desde a leitura na interface. A versão final deve exigir revisão também nas operações em lote e na restauração quando aplicável.

A recuperação por e-mail continua desabilitada na PoC. Antes de produção, validar recuperação com resposta uniforme, MFA para Geral, revogação de dispositivos, rotação de sessão, duração absoluta e inatividade, limitação distribuída de login e confiança no proxy. A interface com cookie precisa validar origem e CSRF, com HttpOnly, Secure, SameSite e domínio e caminho restritos. O ensaio REST em loopback não homologa esses controles de navegador. [Autenticação do Payload](https://payloadcms.com/docs/authentication/overview) · [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

## Auditoria

Triggers registram, na mesma transação, criação e alteração de conta e conteúdo, transferência, aprovação de mídia e transições da fila, incluindo repetição, rollback e revogação. A restauração de uma versão gera uma alteração auditável. Cada evento tem UUID, horário, ambiente, conta ou processo, unidade quando aplicável, entidade e registro, operação, resultado e correlação. Uma lista de campos permitidos projeta perfil, unidade, situação e IDs de vínculos. Títulos, texto livre, e-mail, credenciais, tokens, URLs e chaves de objetos ficam fora da trilha.

GET /api/auditoria devolve até 100 eventos com paginação por data. O Geral vê todos os eventos do ambiente. O Regional vê a própria unidade vigente. Eventos sobre contas e transferências entre unidades ficam no escopo Geral. Recusas 401, 403 e 429 tomadas pelo Payload são registradas em transação independente e agregadas por ambiente, categoria de rota e minuto. Isso limita o volume de registros e perde o detalhe das demais recusas na janela. A agregação não limita requisições. A cobertura exclui falhas anteriores ao Payload e rotinas não instrumentadas. Backup e restauração correlacionam os eventos com o ID do conjunto.

A API oferece somente leitura da trilha e um trigger rejeita UPDATE, DELETE e TRUNCATE comuns. Quem controla o esquema ou o superusuário pode desabilitar a proteção. Antes de produção, separar proprietário, papel de aplicação e papel de retenção, com envio de eventos críticos a destino independente. [Triggers PostgreSQL](https://www.postgresql.org/docs/17/trigger-definition.html)

## Falhas distribuídas de publicação

1. Cada pedido persiste sequência, intenção, operador e ambiente. O worker lê o ponteiro e reconcilia o ID e a sequência já ativados antes de revalidar o operador para uma nova ativação.
2. O preparo grava releases imutáveis. Antes de trocar o manifesto, o worker grava no PostgreSQL o ETag de base da tentativa ou registra a ausência inicial de ponteiro. A transação final relê conta, unidade, registros e aprovações de mídia, com bloqueios. A troca usa If-Match ou If-None-Match: * e acrescenta um UUID de geração.
3. Se a escrita ficar incerta, a fila deixa o pedido em processamento. Na retomada, o leitor confirma o resultado pelo ponteiro. Se o ETag anterior continuar ativo, uma escrita condicional troca somente a geração e preserva a release e o horário. Uma escrita atrasada com o ETag antigo falha após essa barreira. Se a escrita atrasada vencer antes, a retomada precisa observar o novo ponteiro.
4. A revogação subsequente só avança depois de confirmar ou bloquear a tentativa anterior. A publicação e a revogação pública tornam-se efetivas ao gravar o ponteiro, que contém a nova sequência, os alvos revogados e o histórico elegível. Sem ponteiro inicial e sem evidência da primeira ativação, a fila permanece bloqueada para investigação e intervenção após confirmação de que a escrita antiga terminou.

A desativação ou a mudança de perfil, unidade ou aprovação passa a valer no commit do banco. PostgreSQL e S3 não compartilham transação. Se a sessão cair com a operação em trânsito, a escrita pode chegar antes da barreira e ativar conteúdo após a mudança no banco. O ensaio valida a ordem em que a barreira vence e demonstra que uma revogação confirmada nessa ordem resiste à escrita atrasada. **A janela anterior à barreira e a primeira ativação incerta continuam bloqueadores de produção.** [Consistência S3](https://aws.amazon.com/s3/consistency/) · [Escritas condicionais S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html)

Homologar um coordenador durável responsável por ordenar autorização, ativação e revogação na mesma autoridade lógica, com gerações monotônicas, trilha independente de revogações e publicação da barreira antes de confirmar sua eficácia. Avaliar um ponteiro inicial explícito ou tombstone. Testar as duas ordens de disputa do CAS no serviço real. O consumidor pode continuar consultando apenas o ponteiro e os objetos no armazenamento.

## PostgreSQL e custos de conexão

| Caminho | Estratégia |
| --- | --- |
| Administração e último Geral | Transações serializáveis e locks de linha ordenados. Conflitos concorrentes podem retornar 409. |
| Outbox | Advisory lock transacional até commit ou rollback. Em princípio pode usar afinidade de backend na transação. |
| Reserva e workers de mídia e publicação | Advisory locks de sessão. Exigem conexão direta dedicada. A configuração rejeita modo transacional declarado e host Neon -pooler. |
| Backup e recuperação | Ensaio em conexão direta local. A captura usa SHARE e recusa trabalhos em andamento. |

Neon direto atende os caminhos com afinidade de sessão, sujeito a homologação. O endpoint PgBouncer transacional deve ficar restrito a caminhos sem lock de sessão. Ensaiar instâncias simultâneas, prepared statements, limites por pool, latência de scale-to-zero e retomada de conexão. Separar a conexão dos workers, limitar o tempo mantido e acionar por evento com reconciliação esparsa, evitando polling contínuo. A PoC testou interrupções no PostgreSQL local. [Advisory locks](https://www.postgresql.org/docs/17/explicit-locking.html#ADVISORY-LOCKS) · [PgBouncer](https://www.pgbouncer.org/features.html) · [Pool Neon](https://neon.com/docs/connect/connection-pooling)

## Backup, criptografia e restauração

O comando usa pg_dump custom comprimido e pg_restore em transação única com parada ao primeiro erro. Exige a mesma versão principal de ferramentas e servidor. O catálogo inclui UUID, ambiente, data, versão do esquema e PostgreSQL, tamanho e SHA-256 do arquivo e inventário. Um PGPASSFILE temporário com modo 0600 fornece a senha ao libpq. Diretórios privados são removidos no encerramento normal e nos erros tratados. Após encerramento forçado, inspecionar temporários em volume protegido.

Banco, catálogo e mídia usam AES-256-GCM com nonce aleatório de 96 bits e dados adicionais autenticados por bucket e chave. A verificação precede a publicação do catálogo. Blobs endereçados por SHA-256 deduplicam bytes no mesmo destino de backup. Um blob preexistente é lido e verificado. O inventário registra hash, tamanho, tipo, ETag e versão quando retornada. Abrange originais, derivados, miniaturas, pôsteres, manifesto e releases elegíveis com suas mídias. A captura exige pausa dos escritores, usa locks nas tabelas e confirma que o manifesto continua na revisão capturada. A limpeza da origem não elimina cópias retidas no destino independente. A PoC não apaga blobs de backup.

O dump exclui sessões e a liberação da origem. O destino nasce bloqueado, com pedidos históricos executáveis em quarentena. A recuperação usa identidade PostgreSQL distinta, confere o inventário contra referências privadas, verifica a sequência do manifesto arquivado na fila e coloca os bytes em bucket isolado. O manifesto fica fora do caminho público. As contas preservam seus dados para revisão. A promoção precisa de novas credenciais, revisão de privilégios e intenção de publicação, sequência superior à ativa e histórico independente de revogações. Se o histórico posterior for perdido, a cópia continua em quarentena. A promoção não faz parte do comando. Enquanto a origem estiver disponível, seu manifesto mantém as revogações após o backup.

O ambiente real precisa de IAM restrito, chaves de criptografia separadas e plano de recuperação da chave, backup privado com versão ou retenção protegida e credencial distinta de operação. Homologar S3 Versioning, criptografia no bucket de quarentena, isolamento de conta e políticas de ciclo de vida que respeitem catálogos retidos. Moto fornece evidência do protocolo de objetos emulado. [pg_dump](https://www.postgresql.org/docs/17/app-pgdump.html) · [pg_restore](https://www.postgresql.org/docs/17/app-pgrestore.html) · [S3 Versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html)

## Roteiro operacional

1. Em admin/, configure .env.poc a partir de .env.example. Use PostgreSQL vazio, Moto, credenciais fictícias distintas e chave de recuperação de 64 dígitos hexadecimais gerada fora do repositório. Execute npm ci, npm run db:prepare, npm run media:prepare e npm run publication:prepare.
2. Pause escritas administrativas e workers, reconcilie ativações e mantenha o consumidor ativo. Execute POC_RECOVERY_MAINTENANCE=1 npm run recovery -- backup. Guarde o ID e verifique a auditoria. Em caso de falha, preserve os conjuntos confirmados anteriores e verifique trabalhos em andamento, cobertura do catálogo e objetos do destino.
3. Prepare outro banco vazio com identidade distinta em POC_RECOVERY_DATABASE_URL. Use a chave de recuperação e execute `npm run recovery -- restore <id-do-backup> dev <rotulo>`. HML local usa hml de ponta a ponta. Deixe CMS e workers desligados no destino. Para nova tentativa após recuperação parcial, use banco vazio e novo rótulo.
4. Verifique no destino a quarentena, zero sessões, contagens, versões, auditoria, fila, sequência e objetos. Compare o manifesto público da origem antes e depois. Mantenha o conteúdo restaurado isolado até revisão apropriada. O ensaio negativo usa um terceiro banco vazio em POC_RECOVERY_INVALID_TEST_URL.
5. Execute npm run typecheck, npm run lint, npm run build e as suítes test:integration, test:media, test:publication e test:security. Separe bancos e prefixos de publicação e segurança. Rode acesso antes de mídia ao compartilhar um banco. A suíte de segurança usa os dois destinos vazios.

## Ambientes, retenção e FinOps

DEV usa recursos descartáveis e fictícios. HML requer banco, destinos e credenciais independentes, dados fictícios ou sanitizados sob aprovação e execução sob demanda onde viável. PRD exige aprovação de implantação, identidade OIDC por ambiente, IAM de menor privilégio, OAC no CloudFront e política de invalidação comprovada. A ferramenta de recuperação local recusa PRD e requer destino vazio e ambiente coincidente. [OIDC na AWS para GitHub Actions](https://docs.github.com/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services) · [OAC CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)

Propostas a aprovar. Retenção do banco de 7 dias para cópias diárias, 4 semanas para semanais e 3 meses para mensais. Até 3 releases anteriores elegíveis. Auditoria por 12 meses. Exercício mensal de restauração e metas administrativas iniciais de RPO de 24 horas e RTO de 4 horas. O ensaio local não demonstra essas metas em produção. A retenção deve preservar todos os blobs alcançáveis por conjuntos retidos. A PoC não automatiza a exclusão histórica.

O teto total é **R$ 50,00/mês** e o custo adicional incorrido foi **R$ 0,00**. A base AWS de aproximadamente US$ 0,56/mês vem do projeto. Projetar consumo usando volume real do banco comprimido, novos blobs por período, recomputação e leitura de verificação, custos de operações e versões S3, volume da auditoria, armazenamento independente, tráfego CDN, chave e segredos, workers e a soma de HML e PRD. Agrupar validações e aproveitar atividade existente no banco. [Preços S3](https://aws.amazon.com/s3/pricing/) · [Preços AWS KMS](https://aws.amazon.com/kms/pricing/)

## Resultados e medições

Ensaio no Codex Cloud, Debian 13 x86-64, Node.js 24.22.3, PostgreSQL e utilitários 17.12, Moto 5.2.6 e FFmpeg local. Os dados incluíram 3 contas, 3 unidades, 2 membros, 1 compromisso com versão em rascunho, 1 evento, 1 imagem PNG de 162 B e 1 MP4 sintético de 13.513 B. Bancos e prefixos descartáveis separaram as suítes. A restauração usou a identidade própria do banco de destino.

| Controle | Situação | Evidência |
| --- | --- | --- |
| Qualidade e regressões | Validado | npm ci, TypeScript, ESLint, build de produção e smoke test do standalone em /healthz. **47 testes preexistentes passaram**, sendo 15 de acesso, 15 de mídia e 17 de publicação. |
| Segurança administrativa e auditoria | Validado | Os novos testes cobriram isolamento e sanitização da trilha, recusa de mutações, unidade inativa, sessões invalidadas por perfil ou lotação, disputa entre transferências e revisão antiga. |
| Publicação em falha distribuída | Parcialmente validado | Encerramento real de conexão PostgreSQL antes e durante a ativação, com resposta perdida e operação atrasada injetadas no cliente S3. O Moto aceitou CAS, a barreira venceu no cenário atrasado e a revogação confirmada permaneceu. A primeira ativação incerta e o caso em que a escrita atrasada vence antes da barreira carecem de garantia de produção. |
| Backup e recuperação | Validado | pg_dump e pg_restore reais, criptografia autenticada, 16 objetos, deduplicação no segundo conjunto e rejeição de catálogo incompatível, mídia ausente ou corrompida e destino divergente. A quarentena ficou com zero sessões e sem ponteiro servido. Em verificação complementar, o worker recusou iniciar contra esse banco. O consumidor com banco inacessível continuou servindo a release mais nova após parar o CMS, inclusive a revogação posterior ao backup. |
| Testes adicionais | Validado | **12 testes novos passaram**, com PostgreSQL e HTTP reais e S3 emulado. |
| Isolamento de recuperação | Parcialmente validado | O ensaio restaurou DEV com identidade de banco separada e rejeitou ambiente divergente. O caminho completo de recuperação em HML e a aplicação das políticas reais de storage ainda precisam de ensaio. |
| Identidade e permissões externas | Não validado | AWS IAM, proteção de chaves, armazenamento independente da trilha, CloudFront, Neon e PgBouncer precisam ser homologados. |
| Implantação e promoção de recuperação | Bloqueado | A atividade ficou restrita ao ambiente local e a promoção automática de uma cópia restaurada permanece bloqueada. |

| Medição local | Backup | Restauração |
| --- | ---: | ---: |
| pg_dump / pg_restore | 67 ms | 79 ms |
| Verificação de integridade | 81 ms | 52 ms |
| Reconciliação e cópia para quarentena | — | 156 ms |
| Tempo total | 313 ms | 331 ms |
| Operações do armazenamento | 63 | 52 |
| Objetos no inventário | 16 | 16 |

O dump custom comprimido ocupou **91.951 B** e o inventário antes da cifragem, **4.419 B**. O RSS máximo observado do processo Node da suíte foi **317.116 KiB**, incluindo o Payload e os fixtures. A PoC materializa objetos individualmente em memória com limite de 224 MiB, e o ensaio usou arquivos pequenos. A escala de mídia real exige validar streaming, memória, tempo de retenção dos bloqueios e vazão. Tempos locais não comprovam RPO, RTO ou custo de produção.

## Recomendação para 02H e 02I

**Prosseguir com ajustes.** Em 02H, validar o protocolo durável de ordenação, o isolamento, a proteção das chaves e a recuperação de revogações posteriores ao backup. Em 02I, integrar MFA, recuperação de conta, revisões obrigatórias de edição, leitura de auditoria e revogação ponta a ponta incluindo CDN.

Antes de liberar produção, comprovar a segurança de ativação inicial e de autorização alterada durante falha distribuída, restauração sem reativar privilégios antigos, trilha de revogações independente, proteção externa de segredos e auditoria e isolamento real de ambientes. Homologar as políticas de cache e a operação dentro do teto.
