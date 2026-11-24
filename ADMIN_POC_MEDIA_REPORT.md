# MC Os Papas — Prova de conceito de mídias

**Etapa 02E · Ambiente experimental**

## Objetivo e escopo

Validar armazenamento de binários, otimização de imagens, transcodificação de vídeos, pôsteres e autorização regional no aplicativo Payload em `admin/`. A PoC usa exclusivamente arquivos sintéticos, PostgreSQL 17.12 local e o emulador S3 Moto 5.2.6 em loopback. Publicar altera o estado da mídia no CMS. A sincronização com o site institucional pertence à Etapa 02F. [Requisitos aprovados](ADMIN_PROJECT_SPEC.md) · [Relatório 02C](ADMIN_POC_REPORT.md) · [Relatório 02D](ADMIN_POC_ACCESS_REPORT.md)

## Armazenamento e escolha do adaptador

O SDK oficial da AWS envia os objetos ao emulador. O banco guarda apenas o UUID criado no servidor, nome original, tipo solicitado, MIME detectado, tamanho, SHA-256, dimensões de saída, duração, unidade ou escopo nacional, operador, texto alternativo, estados, tentativa e expiração, chaves de origem e derivados e seleção de pôster. O nome enviado pelo cliente serve para exibição. Os caminhos e nomes utilizados pelo processador são definidos pelo servidor.

O adaptador oficial `@payloadcms/storage-s3` é candidato para uploads nativos e configuração de downloads assinados. A PoC usa o SDK diretamente para controlar a reserva de cota, o uso único, a escrita condicional e o processamento assíncrono. A coleção do Payload continua aplicando sua política nativa de acesso. Vale experimentar a integração oficial em 02F se ela puder manter essas garantias e reduzir código. [Uploads do Payload](https://payloadcms.com/docs/upload/overview) · [Adaptadores oficiais](https://payloadcms.com/docs/upload/storage-adapters) · [Escritas condicionais do S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html)

O bucket experimental mantém originais e derivados na área privada. A rota de leitura verifica a autorização e o estado em cada pedido, inclusive de miniatura, pôster e faixa HTTP. A entrega continua restrita a usuários autenticados e autorizados após a publicação no CMS. Em produção, separar entrada privada, originais preservados e derivados publicados. OAC é opção para limitar o acesso ao bucket de origem ao CloudFront. A política de acesso dos visualizadores e a separação das rotas privadas exigem configuração própria. [Controle de acesso à origem do CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)

## Ciclo de envio e processamento

1. O servidor autentica o operador e calcula o âmbito. A reserva valida nome, tamanho e cota, associa-se à conta solicitante e expira em cinco minutos. O Geral pode indicar uma unidade existente ou criar uma mídia nacional. A conta Regional recebe a unidade de sua sessão.
2. Um `PUT` autenticado com o UUID usa a reserva uma vez. O banco troca o estado de reservada para recebendo com uma atualização condicional. O corpo tem limite de bytes independente dos cabeçalhos e é gravado em arquivo temporário privado. A aplicação mede o tamanho, verifica a assinatura inicial do formato e calcula SHA-256.
3. A origem é gravada com `If-None-Match: *`. Após a confirmação, a mídia passa a pendente. O worker Linux relê a origem com limite de tamanho e confere tamanho e SHA-256 antes de processar. Ele só marca a mídia como pronta depois de gravar os derivados e concluir a validação.
4. O estado da fila fica no PostgreSQL. Há um worker processando por banco no experimento. A combinação de trava, tentativa, prazo de recuperação e chaves exclusivas evita republicar resultados de tentativas duplicadas. Estados com falha podem ser retomados por rota autorizada quando existe uma origem. A PoC limita a seis tentativas por mídia, incluindo novas seleções de instante para o pôster.
5. O worker libera reservas expiradas, tenta remover objetos de envios inconclusos e limpa temporários antigos da aplicação e sobras de execução do worker. A remoção de objetos interrompidos é de melhor esforço. A arquitetura final precisa de reconciliação periódica entre inventário, referências e armazenamento.

O envio passa pelo servidor no experimento. A reserva é vinculada à conta autenticada e o corpo tem limites por tipo e por reserva. Enviar diretamente ao armazenamento é candidato para reduzir trânsito e uso do disco temporário do painel. Um POST pré-assinado admite política `content-length-range`. Uma URL pré-assinada convencional é um portador de autorização reutilizável até expirar, limitada pela validade das credenciais. A mesma chave pode ser gravada novamente se a política não exigir precondição ou se o fluxo não separar a área de entrada do resultado imutável. Uma revogação no CMS, por si só, não revoga links já assinados. Antes de adotar esse modelo, validar CORS, prazo curto, vinculação de chave e tamanho, snapshots de entrada, verificação final, rejeição de replay, limpeza e revogação. [URLs pré-assinadas do S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html) · [Construção de política POST](https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-HTTPPOSTConstructPolicy.html)

## Autorização e integridade das referências

| Fluxo | Regra |
| --- | --- |
| Listagem, consulta, preview e variantes | Geral ativo consulta todos os âmbitos. Regional ativo consulta a unidade atribuída. A conta solicitante é a única que pode enviar para a reserva. |
| Campos confiáveis e gravação | As operações genéricas do CMS não alteram a mídia. A criação via Local API usa `overrideAccess: false` e contexto interno da reserva. As rotas usam Local API com o operador e autorização explícita; atualizações condicionais no PostgreSQL efetivam transições da mídia já autorizada. |
| Capas e pôsteres personalizados | A associação exige imagem pronta, acessível e do mesmo âmbito, inclusive na Diretoria. As capas de compromissos publicados e da Diretoria exigem mídia publicada. A Diretoria pode manter uma capa nacional e rejeita o compartilhamento indireto com unidades. |
| Publicação e substituição | Imagens prontas exigem texto alternativo não vazio. O texto deve ser descritivo na revisão editorial. A publicação congela os derivados e a escolha de pôster da mídia. Uma substituição cria outra mídia ou muda a referência do rascunho. |
| Versões e remoção | A restauração de Agenda passa novamente pela autorização de mídia. A exclusão administrativa de qualquer mídia está bloqueada nesta etapa, preservando referências ativas, de rascunhos e de versões retidas. A remoção seletiva exige inventário e procedimento aprovados. |

As rotas privadas usam `Cache-Control: private, no-store` e `X-Content-Type-Options: nosniff`. Uma URL da aplicação continua sujeita ao escopo mesmo após ter sido conhecida. Conteúdo já baixado não pode ser recolhido pelo servidor. Em uma publicação futura, definir TTL e invalidação, além de chaves imutáveis por versão. A remoção urgente precisará considerar URLs assinadas ainda válidas e cópias em cache. [Comportamento de cache do CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html)

## Parâmetros de imagem e vídeo

| Aspecto | Implementação experimental |
| --- | --- |
| Imagens | JPEG, PNG e WebP de um quadro, até 20 MiB e 32 milhões de pixels decodificados. Sharp corrige a orientação, preserva proporção e alfa, evita ampliação e grava WebP com lado maior de até 1920 px e miniatura de até 320 px. A saída omite EXIF e GPS. Qualidades de 80 e 76 controlam o tamanho da saída e são ponto de partida para avaliação visual. |
| HEIC | O Sharp 0.35.5 com libvips 8.18.7 anunciou `.avif` como sufixo de entrada do módulo HEIF neste ambiente. A PoC exclui HEIC da lista de entrada. A compatibilidade com um conjunto de HEIC/HEVC permanece por validar. |
| Vídeos | MP4 ou MOV com assinatura de contêiner reconhecida, até 200 MiB, 120 s, 60 quadros/s, dimensão de entrada até 4096 px e área até 4096×2160. A saída preserva a proporção e a orientação tratada pelo FFmpeg, com eixos de até 1920×1080 ou 1080×1920 e sem ampliação. O worker revalida contêiner, dimensões, duração e codecs. |
| Codificação e remultiplexação | H.264/YUV420p com CRF 23, preset `fast`, teto de 5 Mb/s e AAC a 96 kb/s quando há áudio. Fluxos H.264/YUV420p e AAC elegíveis são remultiplexados. Ambos usam `faststart`, seleção de um fluxo de vídeo e áudio opcional e remoção de metadados e capítulos dispensáveis. |
| Pôsteres | O worker extrai um quadro do vídeo a 0 s na primeira geração e gera WebP de até 640 px. Outro instante gera um novo objeto e reutiliza o vídeo otimizado. Um pôster personalizado usa a imagem autorizada sem alterar o vídeo. |
| Contenção | Execução por argumentos separados, nomes locais fixos e lista de protocolos restrita a arquivos locais, com referências externas do contêiner desabilitadas. Cada ferramenta tem timeout de 75 s, FFmpeg/FFprobe limitam alocações individuais a 96 MiB e o worker limita threads e cache do Sharp. Os limites experimentais reduzem consumo. A memória total ainda depende do isolamento do processo. Validar a contenção do decodificador e separar credenciais do worker e do painel antes de aceitar arquivos reais. |

[Sharp — opções de entrada](https://sharp.pixelplumbing.com/api-constructor/) · [Sharp — metadados e saída](https://sharp.pixelplumbing.com/api-output/) · [FFmpeg](https://ffmpeg.org/ffmpeg.html) · [FFprobe](https://ffmpeg.org/ffprobe.html)

## Reprodução e dependências

- Payload, Next.js e PostgreSQL permanecem nas versões da Etapa 02D. Foram declarados diretamente `@aws-sdk/client-s3@3.1176.0` (Apache-2.0) e `sharp@0.35.5` (Apache-2.0), este último já presente na árvore do Next.js.
- O ambiente de validação usou FFmpeg e FFprobe 7.1.5 do Debian, com `libx264` e AAC. A compilação usada habilita GPL e libx264. Revise as licenças aplicáveis antes de distribuir um artefato que inclua binários. O Moto 5.2.6 (Apache-2.0) foi instalado em um ambiente Python temporário fora do projeto. [Licenciamento FFmpeg](https://ffmpeg.org/legal.html) · [Licença Sharp](https://github.com/lovell/sharp/blob/main/LICENSE) · [Moto em modo servidor](https://docs.getmoto.org/en/latest/docs/server_mode.html)
- Prepare PostgreSQL local e `.env.poc` conforme a Etapa 02D. Adicione as quatro variáveis `POC_S3_*` listadas em [admin/.env.example](admin/.env.example). Use endereço de loopback, bucket experimental e credenciais fictícias. Um exemplo de servidor em ambiente Python descartável é `moto_server -H 127.0.0.1 -p 55100` após instalar `moto[server]==5.2.6`.
- Execute em `admin/` com banco novo e bucket local vazio. As suítes usam o standalone fora da árvore do projeto. Os fixtures são gerados em execução. Para repetir, use novo banco e bucket descartáveis.

```sh
npm ci
npm run db:prepare
npm run media:prepare
npm run typecheck
npm run lint
NEXT_TELEMETRY_DISABLED=1 npm run build
npm run test:integration
npm run test:media
```

Para execução manual em outro processo, `npm run media:worker` examina a fila uma vez. `npm run media:worker -- --loop` mantém o worker ativo. O painel nativo exibe metadados no escopo do operador. Reserva, envio, prévia, pôster, repetição e publicação são exercitados nas rotas da PoC.

## Resultados e medições

**Ambiente.** Debian 13 x86-64 no Codex Cloud, 2 vCPUs, 8 GiB de memória de cgroup, Node 24.22.3 e armazenamento Moto em loopback. As duas suítes usam PostgreSQL real e a aplicação standalone. A integração S3 foi exercitada contra o emulador. As credenciais, a mídia e as referências eram fictícias.

| Verificação | Classificação | Evidência |
| --- | --- | --- |
| Instalação, tipagem, lint e build | Validado | `npm ci`, TypeScript, ESLint e build de produção passaram. As suítes iniciaram o standalone e verificaram `/healthz`. |
| Regressão de acesso 02D | Validado | **15 testes passaram, 0 falharam**, com a coleção original ampliada e as mesmas regras de sessão e autorização. |
| Integração de mídias 02E | Validado | **12 testes passaram, 0 falharam**. A suíte verificou armazenamento, SHA-256, imagens, vídeos, pôsteres, estado e permissões. |
| Isolamento e escrita imutável | Validado | REST e Local API negaram acesso de outra unidade e mutação das chaves. Uma segunda conta da mesma unidade pôde ler e teve o uso da reserva de outra conta negado. Replay e tentativa de regravar a mesma chave pelo SDK foram recusados, e os bytes originais permaneceram íntegros. O acesso anônimo à aplicação e uma leitura direta sem assinatura no Moto receberam 403. |
| Rejeição de arquivos e cotas | Validado | Rejeição de tamanhos acima dos tetos, tamanho diferente da reserva, bytes incompatíveis e imagem de 36 MP. A expiração liberou a cota regional, e as prévias de entradas que falharam ficaram indisponíveis. |
| Imagens | Validado | JPEG sintético rotacionado saiu em WebP 1280×1920 e miniatura 213×320, sem EXIF. PNG transparente de 100×80 preservou alfa e dimensão. |
| Vídeo, remultiplexação e pôster | Validado | O MOV sintético com áudio foi convertido para H.264/AAC. A suíte verificou o contêiner, `faststart`, HTTP 206, pôster automático proporcional, troca por outro instante e uso de uma imagem própria. O MP4 compatível manteve o fluxo por remultiplexação. Uma imagem de outra unidade foi recusada. Uma verificação complementar com matriz de rotação de 90° converteu 2560×1440 em 1080×1920. |
| Publicação, referências e versões | Validado | Publicação exigiu estado pronto e texto alternativo de imagem. Rascunho e versão publicada mantiveram referências distintas. Leituras entre unidades, exclusão de objetos com referência ativa, em rascunho ou histórica, restauração de outra unidade e vínculo regional em conteúdo nacional foram negados. |
| Fila, recuperação e limpeza | Validado | Duas execuções do worker produziram um único processamento para a mesma entrada. Falha de ferramenta foi injetada por caminho inexistente, a repetição ocorreu só após autorização e o worker foi encerrado com trabalho em processamento. A suíte antecipou o vencimento da reserva de processamento no PostgreSQL e verificou a retomada e a limpeza do disco temporário. |
| Custo e capacidade de produção | Parcialmente validado | Os limites foram exercitados localmente com arquivos sintéticos e sem chamadas a AWS. O consumo com arquivos grandes e a cota de derivados não foram medidos. |
| HEIC, S3 real, envio assinado, OAC, Lambda e Arm64 | Não validado | Comportamento documentado e arquitetura avaliada. A execução usou o emulador local com upload mediado e binários x86-64. |
| Provisionamento ou implantação externa | Bloqueado | A validação autorizada nesta etapa é exclusivamente local. |

### Medições de processamento

| Amostra ou operação | Entrada | Saída principal | Derivado | Tempo do trabalho | Pico de RSS observado |
| --- | ---: | ---: | ---: | ---: | --- |
| JPEG com orientação EXIF, 2400×1600 | 23.456 B | 4.456 B | 216 B | 229 ms | Worker 304.404 KiB |
| PNG transparente, 100×80 | 132 B | 118 B | 120 B | 53 ms | Worker 283.760 KiB |
| MOV de 4 s, 1920×1080, com áudio | 8.908.845 B | 2.719.867 B | 8.658 B | 2.667 ms | Worker 304.780 KiB e FFmpeg/FFprobe 453.044 KiB |
| MP4 compatível remultiplexado | 2.719.867 B | 2.719.867 B | 8.658 B | 417 ms | Worker 296.448 KiB e FFmpeg/FFprobe 62.916 KiB |
| Extração de pôster a 2 s | 2.719.867 B | Vídeo preservado | 9.140 B | 333 ms | Worker 287.684 KiB e FFmpeg/FFprobe 73.076 KiB |

A saída principal do JPEG foi reduzida em **81,0%**, com razão entrada/saída de **5,26:1**. A do MOV foi reduzida em **69,5%**, com razão de **3,28:1**, sem contar o original preservado e os derivados. Os tempos incluem leitura do emulador, validação, processamento e gravação de derivados, com a inicialização do processo e a espera na fila fora da medição. RSS do Node é o máximo do processo, e RSS de FFmpeg/FFprobe é o máximo amostrado a cada 25 ms. Esses picos são de processos distintos e podem ter ocorrido em momentos diferentes. Os arquivos sintéticos ilustram o fluxo e a relação entre os modos de execução. A capacidade em produção e a qualidade com material de origem variada precisam de medições próprias.

## Custos, limites e viabilidade em AWS

O teto mensal é **R$ 50,00** e a base AWS informada é de aproximadamente **US$ 0,56/mês**. O custo adicional autorizado e utilizado nesta etapa foi **R$ 0,00**. Os principais vetores a medir são armazenamento das origens e derivados, requisições ao armazenamento, CPU e memória do processamento, espaço temporário, backups, saída de dados e taxa de acerto do cache público. Remultiplexar vídeo compatível, limitar derivados e servir publicamente apenas a variante aprovada reduzem trabalho ou tráfego em situações específicas.

| Controle | Proposta para a próxima validação |
| --- | --- |
| Envio e espaço | Manter como ponto de partida os tetos experimentais de 20 MiB para imagens e 200 MiB/120 s para vídeos. A PoC reserva 256 MiB por âmbito e 512 MiB no total para originais e reservas e limita a dez reservas por minuto por conta. Definir cotas de derivados e pico de disco separadamente, considerando originais rejeitados e histórico. |
| Paralelismo e memória | Começar com um worker por ambiente local ou uma concorrência global equivalente. Medir com arquivos próximos dos limites. Usar isolamento de processos, limites do sistema, supervisão, observabilidade e varredura do inventário antes de liberar envios reais. |
| Retenção e backup | Expirar reservas em cinco minutos e limpar temporários órfãos de envio após dez minutos. Manter originais válidos e derivados referenciados até aprovar política de retenção. Definir backup de metadados e binários e testar restauração em conjunto. Separar descarte de entradas inválidas, temporários e derivados órfãos dos acervos históricos. |

Avaliar um worker de **Lambda Event Functions** separado do servidor HTTP, com binários nativos e bibliotecas testados na arquitetura Linux Arm64 escolhida. Revisar limite de duração, memória, tamanho de artefato, dependências de sistema, espaço de `/tmp` e comportamento após falha. O download, a saída e as prévias convivem no disco temporário. Dimensionar esse espaço com margem para o maior arquivo permitido e a concorrência real. O servidor Web Functions e seu disco temporário são avaliados separadamente na Etapa 02C. Se os arquivos maiores excederem o envelope econômico ou técnico de Lambda, avaliar processamento em lote sob demanda ou worker local operado de forma controlada, preservando fila durável e retomada. [Timeout das Lambda Event Functions](https://docs.aws.amazon.com/lambda/latest/dg/configuration-timeout.html) · [Armazenamento efêmero](https://docs.aws.amazon.com/lambda/latest/dg/configuration-ephemeral-storage.html) · [Arquiteturas de instrução](https://docs.aws.amazon.com/lambda/latest/dg/foundation-arch.html)

**Recomendação — prosseguir com ajustes.** Levar a imutabilidade dos objetos, a fila persistida e o isolamento de leitura para a Etapa 02F. Antes de definir a arquitetura final, comparar envio direto em S3 com o proxy, testar a política da origem privada e a expiração de acesso, validar as permissões nativas na AWS e medir o worker com arquivos maiores e formatos variados. Implementar rotinas de reconciliação, revisão de retenção e verificação de restauração com o inventário real antes de aprovar produção.
