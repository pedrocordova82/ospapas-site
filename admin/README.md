# Portal Administrativo do MC Os Papas

O pacote privado `ospapas-admin` reúne o painel e a API do Payload CMS em Next.js App Router. O portal usa PostgreSQL e empacotamento Node.js standalone. O site institucional em `web/` tem arquivos, dependências e implantação independentes. Esta etapa consolida a fundação reaproveitada da PoC.

[Requisitos](../ADMIN_PROJECT_SPEC.md) · [Arquitetura e bloqueadores de produção](../ADMIN_ARCHITECTURE.md) · [Design System](../ADMIN_DESIGN_SYSTEM.md) · [Custos](../ADMIN_COST_ESTIMATE.md)

## Inventário e estado

| Caminho | O que existe | Classificação |
| --- | --- | --- |
| `src/app/`, `src/payload.config.ts`, `next.config.mjs` | Painel e API do Payload, conexão PostgreSQL, App Router e `/healthz` independente do banco. | Base reutilizável. O painel definitivo e a configuração do runtime hospedado ainda dependem de implementação e homologação. |
| `src/config.ts` | Identidade explícita do ambiente, validação de configuração privada e validações de destinos locais. | Base reutilizável. Segredos são lidos no servidor. |
| `src/access/` | Coleções de usuários, regionais, membros, Diretoria, Agenda e Eventos. Políticas de escopo, autorização por campo, vínculos, versões experimentais e proteção do último Geral. | Estrutura e controles reaproveitáveis. O modelo, as coleções do MVP e as políticas finais ainda exigem adaptação. |
| `src/media/`, `src/publication/` | Coleções de mídia e publicações, armazenamento privado, Sharp/FFmpeg, filas PostgreSQL, workers, projeção, consumidor independente e releases. | Mecanismos validados experimentalmente. Os adaptadores S3 locais, as políticas de cotas e a entrega pública real exigem adaptação e validação. |
| `src/security/` | Auditoria protegida, revalidação de autoridade, barreira de ativação, reconciliação, evidência independente, backup e restauração em quarentena. | Controles e protocolo preservados. As ferramentas de recuperação atuais são experimentais. Privilégios, procedimentos e falhas reais seguem como bloqueadores. |
| `src/experimental.ts`, `src/prepare-db.ts`, `scripts/`, `tests/` | Guarda da preparação descartável, conta fictícia, criação de buckets locais, consumidores e workers de demonstração e cinco suítes de integração. | Preparação, emuladores, fixtures e ferramentas de demonstração restritos a DEV. Suítes e cenários reaproveitáveis. |

Os relatórios registram o que foi ensaiado de fato. O protocolo de consistência e os controles de autoridade permanecem nos módulos existentes. [Fundação](../ADMIN_POC_REPORT.md) · [Acesso](../ADMIN_POC_ACCESS_REPORT.md) · [Mídia](../ADMIN_POC_MEDIA_REPORT.md) · [Publicação](../ADMIN_POC_PUBLICATION_REPORT.md) · [Segurança](../ADMIN_POC_SECURITY_REPORT.md) · [Consistência final](../ADMIN_POC_CONSISTENCY_FINAL_REPORT.md)

## Execução local descartável

Use Node.js **24.22.3 ou superior da série 24**, npm, PostgreSQL local e `psql`. Recuperação usa também `pg_dump` e `pg_restore` da mesma versão principal do servidor. Mídia usa FFmpeg/FFprobe e o Sharp incluído entre as dependências do pacote. Para os ensaios com mídia, publicação e recuperação, disponibilize Moto em loopback e FFmpeg/FFprobe no PATH.

Em `admin/`, execute `npm ci` e copie `.env.example` para `.env.poc`. Preencha somente valores fictícios e locais. Use uma senha fictícia com pelo menos 16 caracteres e e-mail no domínio `example.invalid`. Gere um segredo Payload local e, se ensaiar recuperação, uma chave diferente de 32 bytes codificada como 64 caracteres hexadecimais. Mantenha os valores fora de Git e de logs.

Em um **cluster descartável, separado e ligado apenas ao loopback**, crie uma base vazia com nome `ospapas_poc_*`, um papel local dedicado e credenciais explícitas na URL. Na sessão desse cluster, use a marca abaixo para a base fictícia previamente criada. A preparação verifica endereço, nome e marca no PostgreSQL real antes de escrever. Fora do cluster descartável, mantenha a marca ausente.

```sql
COMMENT ON DATABASE ospapas_poc_dev IS 'ospapas-poc-disposable';
```

Use o mesmo procedimento para os destinos vazios de recuperação, com nomes diferentes e outro papel. Use um prefixo e buckets exclusivos para cada ensaio. A validação de destino complementa a separação de credenciais e recursos. Mantenha bancos protegidos fora do cluster descartável, inclusive por túneis locais.

```sh
npm run db:prepare
npm run media:prepare
npm run publication:prepare
npm run dev
```

Antes de acionar publicação ou uma mutação de autoridade, disponibilize no Moto o bucket de evidências `<POC_BACKUP_PREFIX>-dev-backup`, separado dos buckets operacionais. A suíte de publicação também exercita `<POC_BACKUP_PREFIX>-hml-backup` no emulador. A suíte de consistência testa a inicialização e deve receber um prefixo de publicação novo, sem rodar `publication:prepare` para esse prefixo. [Publicação e ambiente local](../ADMIN_POC_PUBLICATION_REPORT.md) · [Recuperação e consistência](../ADMIN_POC_CONSISTENCY_FINAL_REPORT.md)

## Configuração e ambientes

| Variável | Uso |
| --- | --- |
| `ADMIN_ENV` | Obrigatória, com valores exatos `dev`, `hml` ou `prd`. DEV usa recursos descartáveis locais. HML e PRD têm destinos e credenciais próprios e não executam operações experimentais. O modo `NODE_ENV=production` do Next.js é usado também em builds DEV. |
| `DATABASE_URL`, `PAYLOAD_SECRET` | Privadas e obrigatórias. URL PostgreSQL com banco explícito e segredo com pelo menos 32 caracteres. DEV usa loopback e URL sem opções adicionais. Operações experimentais exigem banco marcado e credenciais explícitas. |
| `NODE_ENV`, `PORT`, `HOSTNAME` | Configuração de runtime definida pelo Node.js/Next.js. Em execução standalone local, use `HOSTNAME=127.0.0.1` e uma porta disponível. |
| `POC_PREPARE_SCHEMA` | A preparação é exclusiva de `db:prepare`, após verificação do destino. Se a variável legada existir, somente o valor inativo `0` é aceito. O backend normal inicia com atualização automática de esquema desativada. |
| `POC_ADMIN_EMAIL`, `POC_ADMIN_PASSWORD` | Conta fictícia inicial, criada por `db:prepare` quando ainda não houver usuários. O bootstrap tem uma autorização interna e fica fora do fluxo normal da API. |
| `POC_S3_ENDPOINT`, `POC_S3_BUCKET`, `POC_S3_ACCESS_KEY`, `POC_S3_SECRET_KEY` | Emulador de mídia e destinos de publicação. Endpoint no loopback e credenciais fictícias explícitas. |
| `POC_PUBLIC_ENV`, `POC_PUBLIC_PREFIX`, `POC_PUBLIC_ID_SECRET`, `POC_PUBLIC_PORT` | Namespace simulado, prefixo dos buckets, chave opcional para IDs públicos e porta do consumidor de demonstração. Em DEV, `hml` e `prd` podem designar namespaces no emulador. Nos ambientes protegidos, um namespace divergente é recusado. |
| `POC_PG_CONNECTION_MODE`, `POC_FFMPEG`, `POC_FFPROBE` | Identificação do modo PostgreSQL e caminhos opcionais das ferramentas de mídia. Os caminhos com trava de sessão exigem conexão direta. |
| `POC_BACKUP_ENDPOINT`, `POC_BACKUP_PREFIX`, `POC_BACKUP_ACCESS_KEY`, `POC_BACKUP_SECRET_KEY`, `POC_BACKUP_KEY` | Armazenamento local de recuperação e evidências. Use credenciais distintas da mídia e chave AES-256 fictícia. |
| `POC_RECOVERY_MAINTENANCE`, `POC_RECOVERY_DB_TOOLS`, `POC_RECOVERY_DATABASE_URL` | Backup exige confirmação `1` após pausar escritores. Caminho opcional das ferramentas PostgreSQL e URL do destino vazio, isolado e marcado para restauração. |
| `POC_RECOVERY_INVALID_TEST_URL`, `POC_RECOVERY_JOURNAL_TEST_URL` | Bancos descartáveis separados para os testes de segurança e consistência. |

O wrapper do Next carrega `.env.poc` em DEV e recusa os arquivos que o Next carregaria e poderia copiar ao standalone, como `.env` e `.env.production`. Em HML e PRD, a configuração virá das variáveis do processo. Mantenha banco, chaves e credenciais em configuração privada. A superfície pública usa somente o contrato de publicação e seus campos permitidos. Atualização automática de esquema e emuladores permanecem bloqueados fora dos ensaios autorizados. A fundação atual ainda depende de migrações definitivas e adaptadores homologados.

## Comandos e testes

| Comando `npm run` | Finalidade |
| --- | --- |
| `dev`, `build` | Servidor administrativo local e build standalone. |
| `db:prepare`, `media:prepare`, `publication:prepare` | Preparar banco marcado e conta fictícia, mídia local e manifesto de publicação do namespace de teste. |
| `media:worker`, `publication:worker`, `publication:demo` | Processamento local de mídia, publicação e consumidor experimental. `media:worker -- --loop` inicia o consumidor de mídia contínuo para o ensaio. |
| `security:reconcile -- <uuid>` | Inspecionar e reconciliar uma mutação de segurança pendente no ensaio. |
| `recovery -- backup`, `recovery -- restore <id> <namespace> <rotulo>` | Backup cifrado e restauração experimental em quarentena. Consultar o relatório antes de operar. |
| `typecheck`, `lint`, `test:config` | Tipagem, lint e validações específicas de configuração e bloqueio dos caminhos experimentais. |
| `test:integration`, `test:media`, `test:publication`, `test:security`, `test:consistency` | Regressão de acesso, mídia, publicação, segurança e consistência. Execute após `build`, com bases descartáveis, prefixos novos e destinos de recuperação preparados conforme cada suíte. |

Para iniciar o standalone, disponibilize `.next/static` em `.next/standalone/.next/static` e execute `node .next/standalone/server.js`, passando a configuração DEV pelo processo. Antes de distribuir um artefato, verifique a ausência de arquivos `.env*` e dos valores de configuração privada nele. `/healthz` indica que o processo responde. Valide também a rota administrativa com a conexão configurada. [Empacotamento e ensaios](../ADMIN_POC_REPORT.md)

## Próximas atividades da fundação

Permanecem pendentes as migrações definitivas, a modelagem completa do MVP, a configuração final de autenticação e credenciais e a homologação de runtime Linux Arm64, AWS, Neon e separação de privilégios. A entrega pública, a revogação na borda, a recuperação sob falhas reais e o custo total ainda precisam das evidências e aprovações definidas na arquitetura. A fundação local usa recursos já previstos e tem custo incremental de infraestrutura previsto de R$ 0,00. [Critérios de produção](../ADMIN_ARCHITECTURE.md) · [FinOps](../ADMIN_COST_ESTIMATE.md)
