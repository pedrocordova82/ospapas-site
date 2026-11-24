# MC Os Papas — Relatório da prova de conceito do Payload CMS

**Etapa 02C · 24 de novembro de 2026 · Ambiente experimental**

## Objetivo e escopo

Avaliar se o Payload CMS funciona em um aplicativo Next.js isolado, com painel nativo, autenticação, persistência em PostgreSQL e empacotamento como servidor HTTP Node.js. A PoC implementa uma coleção de registros experimentais com um campo de título e acesso autenticado. A coleção técnica de usuários sustenta a autenticação. O endpoint `GET /healthz` devolve `{"status":"ok"}` para indicar que o processo atende requisições. Ele pode responder mesmo quando o banco está indisponível.

A implementação adapta o template oficial **Blank** do Payload, usando o App Router e o adaptador PostgreSQL. O código, as dependências e o lockfile experimental ficam em `admin/`. O painel utiliza as telas nativas. A API GraphQL foi desativada, pois o teste usa o painel e a API REST. O esquema é preparado explicitamente em um banco local descartável. Permissões regionais, módulos do MVP, processamento de mídia e integração com o site institucional continuam fora do escopo da PoC. [Template oficial do Payload](https://github.com/payloadcms/payload/tree/main/templates/blank) · [Especificação do portal](ADMIN_PROJECT_SPEC.md)

## Versões e compatibilidade

| Componente | Versão selecionada |
| --- | --- |
| Node.js e npm no ambiente de teste | 24.22.3 e 11.19.1 |
| Payload CMS, integração Next.js e adaptador PostgreSQL | 3.94.2 |
| Next.js | 16.4.6 |
| React e React DOM | 19.3.1 |
| GraphQL, dependência par da integração | 16.15.0 |
| TypeScript | 6.0.3 |
| ESLint e typescript-eslint | 10.15.0 e 8.74.0 |
| PostgreSQL local | 17.12 |

Os metadados publicados de `@payloadcms/next@3.94.2` aceitam Next.js entre 16.4.5 e o início da série 17 e aceitam a série Node 24 a partir de 24.22.3. O projeto restringe o runtime de teste à série 24. O instalador apontou dois pacotes descontinuados da família `@esbuild-kit`, transitivos do `drizzle-kit` fixado pelo adaptador oficial. Eles foram mantidos para preservar a árvore suportada pelo adaptador. A PoC não depende diretamente deles. [Instalação do Payload](https://payloadcms.com/docs/getting-started/installation) · [Metadados da integração 3.94.2](https://www.npmjs.com/package/@payloadcms/next/v/3.94.2) · [Adaptador PostgreSQL](https://payloadcms.com/docs/database/postgres)

## Reprodução local

1. Disponibilize um PostgreSQL 17 local com escuta no loopback e um banco vazio descartável, por exemplo `ospapas_poc`. Crie um usuário dedicado, com permissão para preparar o esquema desse banco. O teste usou pacotes Debian extraídos em um diretório temporário e iniciou o PostgreSQL com o usuário comum da sessão. [Inicialização do PostgreSQL](https://www.postgresql.org/docs/17/app-initdb.html)
2. Na raiz do repositório, execute os comandos abaixo. Os exemplos de configuração ficam em [admin/.env.example](admin/.env.example).

   ```sh
   cd admin
   npm ci
   cp .env.example .env.poc
   chmod 600 .env.poc
   ```

3. Preencha `.env.poc` com a conexão local e valores temporários. Use exclusivamente uma conta fictícia. Um comando como `openssl rand -hex 32` gera um segredo para uso local.

   | Variável | Uso |
   | --- | --- |
   | `DATABASE_URL` | Conexão do PostgreSQL descartável. Codifique caracteres reservados da senha na URL. |
   | `PAYLOAD_SECRET` | Segredo local de pelo menos 32 caracteres. Mantenha o mesmo valor entre reinícios do teste. |
   | `POC_ADMIN_EMAIL` | E-mail fictício da primeira conta, por exemplo `operador@example.invalid`. |
   | `POC_ADMIN_PASSWORD` | Senha temporária de pelo menos 16 caracteres, usada na preparação da primeira conta. |

4. Prepare o banco e execute a aplicação. O comando de preparação cria a primeira conta apenas quando a coleção está vazia. Execute-o antes de iniciar o servidor. Depois da preparação, a conexão e o segredo do Payload são as únicas variáveis da PoC exigidas pelo servidor. Fora da preparação, o aplicativo mantém desabilitada a atualização automática de esquema.

   ```sh
   npm run db:prepare
   npm run typecheck
   npm run lint
   NEXT_TELEMETRY_DISABLED=1 npm run build
   ```

5. Inicie o pacote standalone. Copie o artefato e os arquivos estáticos para um diretório fora da árvore do projeto. O Next.js não inclui `.next/static` na cópia standalone por padrão. Antes de arquivar, confira a ausência de arquivos de configuração com segredos. Na primeira rodada, o Next.js copiou `.env` para o artefato. Os scripts passaram a carregar `.env.poc` pelo Node.js para evitar essa cópia. [Empacotamento standalone do Next.js](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)

   ```sh
   bundle=$(mktemp -d)
   cp -a .next/standalone/. "$bundle/"
   cp -a .next/static "$bundle/.next/"
   HOSTNAME=127.0.0.1 PORT=3001 node --env-file="$PWD/.env.poc" "$bundle/server.js"
   ```

6. Abra `http://127.0.0.1:3001/admin`. Confirme o encaminhamento ao login sem sessão. Entre com a conta fictícia, crie um registro experimental, consulte-o e edite seu título. Encerre e reinicie o servidor HTTP, entre novamente e confira o título atualizado antes de excluir o registro. Encerre o servidor ao terminar.

## Validação executada

**Ambiente de referência.** Codex Cloud, Debian 13 x86-64, limite de 2 vCPUs e 8 GiB de memória no cgroup. O PostgreSQL rodou na mesma máquina, via TCP no loopback. Os tempos foram medidos em uma sessão de validação com cache local do npm disponível.

| Verificação | Classificação | Evidência |
| --- | --- | --- |
| Instalação reproduzível | Validado | `npm ci` instalou 367 pacotes do lockfile e `npm ls --all` encerrou sem erro de resolução. |
| PostgreSQL e conta inicial | Validado | PostgreSQL 17.12 inicializado sem privilégios de sistema. `npm run db:prepare` preparou o esquema e criou a conta fictícia. A repetição preservou a conta existente. |
| Tipagem e lint | Validado | `npm run typecheck` e `npm run lint` encerraram com código 0. |
| Build de produção | Validado | `npm run build` gerou as rotas do painel, da API REST e de saúde e criou `.next/standalone/server.js`. |
| Painel, autenticação e acesso anônimo | Validado | Chromium abriu a tela de login, autenticou a conta fictícia e acessou a coleção pelo painel. A API rejeitou leitura, criação de conteúdo e cadastro comum de usuário sem sessão. O logout encerrou o acesso autenticado no teste. |
| CRUD e persistência | Validado | A API REST criou, consultou, editou e excluiu registros fictícios. O título editado persistiu após o reinício do processo HTTP. Um registro criado no standalone também persistiu após reiniciar a partir do mesmo pacote. |
| Servidor HTTP e empacotamento standalone | Validado | Processo em produção respondeu em uma cópia fora do repositório, com os arquivos estáticos incluídos. A inspeção do pacote final confirmou a ausência de arquivos de ambiente e dos valores locais. `next start` também respondeu no ensaio comparativo e emitiu o aviso do Next.js para usar `server.js` com esse modo de build. |
| Diretório somente leitura e concorrência | Parcialmente validado | O pacote sem permissões de escrita serviu painel, arquivos estáticos e operações REST. Três leituras simultâneas autenticadas retornaram HTTP 200. O teste local cobre esse fluxo com permissões de arquivo, sem emular o ambiente gerenciado ou testar carga sustentada. |
| Compatibilidade com Lambda Web Functions | Parcialmente validado | O formato HTTP e as cotas foram confrontados com a documentação oficial. Um ponto de entrada temporário converteu `AWS_LAMBDA_HTTP_ENDPOINT` e iniciou o servidor localmente. A arquitetura e o ambiente gerenciado ainda exigem validação. |
| Build Arm64, banco remoto e cold start AWS | Não validado | Artefato, conexões e tempos medidos somente em Debian x86-64 com PostgreSQL local. |
| Implantação e operação na AWS | Bloqueado | O escopo autoriza validação local e documental. Nenhum recurso externo foi provisionado ou publicado. |

### Medições locais

| Medida | Resultado |
| --- | --- |
| Instalação com `npm ci`, cache npm populado | 10,48 s |
| Build após remoção de `.next` | 24,92 s |
| Pico de RSS de um processo na árvore do build | 1,32 GiB (1.387.276 KiB, `wait4`) |
| Início de `next start` até a primeira resposta de saúde | 678 ms |
| Início do standalone até a primeira resposta de saúde | 450 ms, com 502 ms no reinício com o adaptador local de endereço |
| RSS do standalone | 90,4 MiB na primeira resposta de saúde e 146,4 MiB após painel, autenticação e operações REST |
| RSS de `next start` após autenticação e CRUD parcial | 148,4 MiB |
| Artefato standalone, incluindo arquivos estáticos | 51.150.573 bytes na árvore (48,8 MiB) e 16.708.656 bytes em ZIP (15,9 MiB) |
| HTTP no standalone, três consultas de saúde após aquecimento | 2,0 ms, 1,8 ms e 1,5 ms |
| HTTP em `next start`, uma amostra autenticada por operação | Login 94,4 ms, criação 9,8 ms, leitura 6,0 ms, edição 11,6 ms e exclusão 14,9 ms após o reinício |

O tempo de inicialização vai do lançamento do processo à primeira resposta bem-sucedida de `/healthz`. O RSS em execução foi lido em `/proc/<pid>/status` apenas para o processo HTTP, sem somar PostgreSQL ou Chromium. Os tempos de HTTP incluem o loopback e o processamento local. As amostras servem como referência para a próxima rodada de testes. A inicialização gerenciada, a latência de rede e a concorrência sustentada permanecem sem medição.

## Avaliação de AWS Lambda Web Functions

A documentação atual inclui Next.js como framework compatível com o modelo HTTP das Web Functions. A aplicação precisa escutar o endereço e a porta de `AWS_LAMBDA_HTTP_ENDPOINT` em até 10 segundos. O ponto de entrada padrão é `index.js`, configurável por `AWS_LAMBDA_NODEJS_ENTRYPOINT`. Para standalone, a integração proposta é um ponto de entrada que converta o endereço fornecido pela AWS em `HOSTNAME` e `PORT` antes de carregar `server.js`. [Runtime Node.js para Web Functions](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-nodejs.html)

| Aspecto | Avaliação |
| --- | --- |
| Runtime e dependências nativas | O runtime documentado é Node.js 24 em Arm64. Confirmar se o patch gerenciado satisfaz o requisito do Payload e gerar e testar o pacote para Linux Arm64. Componentes nativos empacotados para x86-64 exigem um novo build para o alvo. [Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-runtimes.html) · [Boas práticas da AWS](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-best-practices.html) |
| Pacote e recursos | A AWS documenta empacotamento em ZIP, com opção por bucket S3 versionado, limite de 512 MB descompactados e 2 GB de memória e 2 vCPUs por ambiente. O pacote x86-64 local de 48,8 MiB fica abaixo do limite de tamanho. Comparar as medidas locais com esses limites serve para triagem. A medição decisiva deve usar o pacote Arm64 e a carga representativa. [Cotas das Web Functions](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html#web-functions) · [Pacote de implantação](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-configuration-deployment-package.html) |
| Sistema de arquivos e persistência | O aplicativo deve operar com o artefato somente leitura. O diretório temporário documentado é `/tmp`, com 512 MB compartilhados por ambiente e vida limitada. Persistir dados em PostgreSQL externo e mídias em armazenamento de objetos quando houver integração. Avaliar separadamente caches graváveis do Next.js e qualquer processamento futuro de mídia. [Ciclo de vida](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-env-lifecycle.html) · [Boas práticas da AWS](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-best-practices.html) |
| Banco, rede e segredos | O pool local tem até três conexões. Num desenho elasticamente escalável, limitar conexões por ambiente e dimensionar ou usar pooler para respeitar a capacidade total do banco. Avaliar alcance de DNS, TLS com verificação, região, latência e regras de rede. O acesso a recursos privados exige um conector de saída VPC. A saída IPv4 pública padrão não tem IP de origem fixo. Fornecer segredo e URL do banco no runtime, mantendo valores fora do ZIP. A cota de variáveis é de 32 KB por revisão. [Rede](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-networking.html) · [Configuração](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-configuration.html) |
| Concorrência e inicialização | Ambientes podem receber requisições simultâneas no mesmo processo e escalar a zero. Manter estado de requisição isolado, reutilizar clientes e validar limites sob concorrência com banco remoto. O primeiro acesso ao Payload pode inicializar conexões depois de o HTTP estar pronto. Medir separadamente escuta inicial, primeira resposta do painel e cold start na AWS. [Escalonamento](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-scaling.html) · [Ciclo de vida](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-env-lifecycle.html) |
| Processamento em segundo plano | O encerramento pode interromper trabalho e o ambiente pode desaparecer. Tarefas duráveis futuras, como processamento de mídia, precisam de fila ou mecanismo equivalente, persistência e operações idempotentes. A PoC não executa tarefas em segundo plano. [Ciclo de vida](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-env-lifecycle.html) |

## Custos e recomendação

> O orçamento mensal de R$ 50,00 é um teto, e não uma meta de consumo. A arquitetura deve buscar sempre o menor custo operacional viável, preservando segurança, qualidade, desempenho e disponibilidade.

A referência informada para a infraestrutura AWS atual é de aproximadamente **US$ 0,56 por mês**, com base em agosto a outubro de 2026. Esse valor é o ponto de partida para comparar o custo total do site e do portal. Os vetores de custo incluem requisições, CPU ativa, memória e transferência das Web Functions, banco, backups, armazenamento, logs e conectividade. Um conector VPC pode introduzir custos de saída, dependendo da configuração escolhida. A PoC utilizou apenas recursos locais. [Preços do AWS Lambda](https://aws.amazon.com/lambda/pricing/) · [Rede das Web Functions](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-networking.html)

**Recomendação — prosseguir com ajustes.** A PoC demonstrou a viabilidade local do Payload com PostgreSQL. Manter Web Functions como candidata e adiar a aprovação da arquitetura de produção até confirmar a versão gerenciada do Node, gerar e validar em Linux Arm64 o pacote com dependências nativas, medir a inicialização e a concorrência com banco externo e comparar o custo total com o orçamento. Em caso de bloqueio de runtime ou de empacotamento, comparar um serviço Node.js gerenciado ou uma instância pequena com os custos de operação, TLS, backup e manutenção. E-mail, recuperação de conta, dados reais, perfis regionais e mídia persistente precisam de validação em etapas futuras.
