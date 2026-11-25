# MC Os Papas — Estimativa consolidada de infraestrutura e FinOps

**Etapa 02H · Referência de preços consultada em 25/11/2026**

## Resumo executivo

| Cenário | Estimativa preliminar US$/mês | Estimativa recalculada US$/mês | Estimativa recalculada R$/mês | Margem até R$ 50 |
| --- | ---: | ---: | ---: | ---: |
| Leve | 3,32 | 2,98 | 17,90 | 32,10 |
| Moderado | 4,84 | 3,88 | 23,29 | 26,71 |
| Intenso | 8,94 | 6,16 | 36,95 | 13,05 |

Os totais somam a base histórica do site, DEV local, HML, PRD e a reserva para duas chaves KMS. Supõem franquias elegíveis e disponíveis para Neon Free, Lambda Event Functions, CloudFront sob demanda, Scheduler, CloudWatch e chamadas elegíveis do KMS. A renovação do domínio, custos de DNS ainda não atribuídos, tributos e demais pendências devem ser acrescentados antes de comparar o compromisso com o teto. Os valores em reais usam os totais em dólares antes do arredondamento.

Com o Neon Launch nos dois ambientes, o total parcial sobe para **R$ 25,12, R$ 43,97 e R$ 96,77**, respectivamente. No cenário intenso, o crescimento projetado do S3 leva o custo parcial a **R$ 49,64 no mês 12**, mesmo com Neon Free. A composição das estimativas preliminares de 25/11/2026 não está disponível para reconciliação por item. O quadro substitui esses valores pelo cálculo reproduzível abaixo. As diferenças são estimativas de modelos distintos.

## Princípios e escopo financeiro

- **R$ 50/mês** é o teto total. Buscar o menor custo viável, preservando o site, a segurança, a recuperação e a capacidade administrativa.
- **US$ 0,56/mês** é a base histórica AWS informada para agosto a outubro de 2026. Equivale a **R$ 3,36/mês** no câmbio de planejamento. A distribuição dessa base por serviço, descontos e tributos depende da fatura. Usar o total uma única vez.
- **R$ 6,00/US$** é uma hipótese conservadora de planejamento. Usar o câmbio efetivo e encargos de cobrança para conciliar a fatura.
- **R$ 0** de gasto adicional autorizado. A análise é documental e a homologação externa depende de autorização própria.
- Segurança tem prioridade sobre disponibilidade administrativa em desfechos incertos. Preservar barreiras de autorização, recibos de revogação, isolamento e cópias recuperáveis. Alertas de custo não liberam bloqueios de segurança.

A tabela de preços usa **us-east-1 (Virgínia do Norte)** como premissa regional. O workflow versionado declara essa região para o deploy existente. A região efetiva de cada recurso do site, do portal e do Neon precisa de confirmação no inventário autorizado. CloudFront sob demanda depende da localização do tráfego de borda. As tarifas consultadas são públicas e a elegibilidade da conta continua pendente. [Workflow do site](.github/workflows/deploy-aws.yml) · [Fundação da PoC e base histórica](ADMIN_POC_REPORT.md)

## Arquitetura de referência

| Camada | Uso proposto e impacto financeiro |
| --- | --- |
| Payload CMS e Next.js | Portal administrativo em Lambda Web Functions Arm64. Sem tarifa de licença prevista no modelo para o conjunto usado na PoC. Medir empacotamento, CPU, memória, inicialização, conexões e transferência. |
| Lambda Event Functions | Workers sob demanda para mídia, publicação, evidências, restauração e manutenção. Dimensionar memória, tempo, armazenamento temporário e concorrência por tarefa. |
| Neon PostgreSQL | Projetos e credenciais independentes para HML e PRD. PostgreSQL mantém a fila durável, o estado da mutação de segurança e a auditoria. Afinidade de conexão em workers com locks de sessão exige caminho direto. |
| S3 | Separar mídia privada, site, conteúdo publicado e recuperação. Contabilizar originais, derivados, backups, versões, recibos e dados fictícios de HML. Separar identidade da operação e da recuperação. |
| CloudFront | Manter o site e o conteúdo publicado no plano de entrega atual até validar OAC, revogações e custo. O site público deve continuar disponível durante suspensão administrativa. O mecanismo de leitura segura da origem precisa de homologação. |
| EventBridge Scheduler | Agendar manutenção e reconciliação de baixa frequência. Disparar workers após intenções confirmadas e manter reconciliador para falhas de notificação, evitando consultas ociosas. |
| CloudWatch | Logs estruturados, alarmes essenciais e métricas de CPU, duração, falhas, backlog e invocações. |
| Parameter Store e KMS | Segredos em SecureString com permissões separadas e orçamento inicial para duas chaves gerenciadas pelo cliente. DR pode exigir outras chaves após aprovação de IAM e recuperação. |
| GitHub Actions | CI e artefatos com OIDC por ambiente, medições de minutos, armazenamento e proteção do deploy. |
| DNS e domínio | Manter a configuração existente. Confirmar provedor, fatura recorrente, preço e data da renovação e qualquer custo incremental por subdomínio ou zona. |

DEV usa PostgreSQL local e Moto com dados fictícios e **US$ 0 incremental de nuvem** na rodada. Medir consumo compartilhado de runner se aplicável. HML liga sob demanda com dados fictícios ou sanitizados. PRD tem banco, destino, credenciais e filas segregados. A base AWS inteira do site existente entra como custo comum. Não há justificativa nesta etapa para outra fila ou outro serviço. [Especificação](ADMIN_PROJECT_SPEC.md) · [Acesso e bloqueios](ADMIN_POC_ACCESS_REPORT.md) · [Publicação](ADMIN_POC_PUBLICATION_REPORT.md) · [Segurança e ambientes](ADMIN_POC_SECURITY_REPORT.md) · [Consistência final](ADMIN_POC_CONSISTENCY_FINAL_REPORT.md)

## Tarifas e franquias

| Componente | Unidade, tarifa em US$ e tratamento |
| --- | --- |
| Lambda Web Functions Arm64 | **0,30/milhão de requisições + 0,0000276944/vCPU-s ativa + 0,0000036667/GB-s de memória** nos exemplos oficiais de Virgínia do Norte. Cobra memória durante a vida de cada ambiente, inclusive intervalos, e agrega ambientes simultâneos. Compute em incrementos de 1 ms. O cálculo usa tarifas brutas e nenhum abatimento Web. Franquia específica para este modelo na conta não verificada. Transferência e integração VPC são linhas separadas. [AWS Lambda](https://aws.amazon.com/lambda/pricing/) |
| Lambda Event Functions Arm64 | Primeira faixa **0,20/milhão de requisições + 0,0000133334/GB-s** sob demanda. A página publica **1 milhão de requisições e 400.000 GB-s/mês** para Event, sujeitos à elegibilidade e ao consumo conjunto da conta. O modelo não usa concorrência provisionada, Managed Instances ou Durable Functions. Orçar armazenamento temporário acima de 512 MB, entregas assíncronas adicionais e transferência quando aplicáveis. [AWS Lambda](https://aws.amazon.com/lambda/pricing/) |
| Neon Free | **100 CU-h/mês, 1 GB PostgreSQL e 5 GB de saída por projeto**, além do limite agregado de **20 GB** em até 100 projetos. Scale-to-zero após 5 minutos de inatividade. A cota esgotada de compute ou saída pode suspender compute até o próximo período. A janela Free de restauração vai até 6 h ou 1 GB de alterações, o menor. Backups independentes continuam previstos. [Neon](https://neon.com/pricing) |
| Neon Launch e Scale | Launch **0,106/CU-h**, Scale **0,222/CU-h**, ambos **0,35/GB-mês** de dados e **0,20/GB-mês** de alterações retidas na janela do histórico pago. Saída paga inclui 500 GB/projeto e cobra **0,10/GB** excedente. Snapshots opcionais aparecem a **0,09/GB-mês**. O cenário Launch usa consumo integral à tarifa paga, sem descontar franquia Free. Validar adicionais por branches, plano e cobrança na organização. [Neon](https://neon.com/pricing) · [Neon sem mínimo mensal](https://neon.com/blog/why-we-no-longer-lock-premium-features) |
| S3 Standard | Primeira faixa **0,023/GB-mês**, **0,005/mil PUT/COPY/POST/LIST**, **0,0004/mil GET/HEAD**, assumindo us-east-1. Cobrar toda a capacidade incremental. Versões não atuais e cópias protegidas ocupam capacidade. Outras classes podem cobrar duração mínima, recuperação, metadados e transições. Réplica em outra região soma armazenamento, requisições e transferência. [S3](https://aws.amazon.com/s3/pricing/) · [Premissas da calculadora AWS](https://aws.amazon.com/calculator/calculator-assumptions/) · [Operações S3 Standard](https://aws.amazon.com/blogs/storage/run-spark-31-faster-and-optimize-compute-costs-with-amazon-s3-express-one-zone/) |
| CloudFront | Sob demanda, **1 TB de saída e 10 milhões de requisições HTTP/HTTPS por mês** na conta. Até **1.000 caminhos de invalidação por mês** sem cobrança, considerando o uso existente. Tráfego S3 → CloudFront fica isento quando elegível. Fórmula de excedente usa a tarifa da região de borda por GB e por lote de requisições, mais invalidações excedentes. Tarifa efetiva para a distribuição do site e a composição geográfica ainda não verificadas. Plano fixo Free anuncia 100 GB e 1 milhão de requisições por distribuição. Pro custa **15/mês**, suficiente para exceder o teto total ao câmbio de planejamento. Verificar recursos, adequação de franquia e tratamento de uso sustentado antes de comparar planos. [CloudFront preços](https://aws.amazon.com/cloudfront/pricing/) · [FAQ CloudFront](https://aws.amazon.com/cloudfront/faqs/) · [Invalidação](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/PayingForInvalidation.html) |
| Scheduler | **14 milhões de invocações/mês** na franquia e **1/milhão** excedente. O destino Lambda cobra separadamente. Repetições de entrega contam e precisam de limites e idempotência. [EventBridge](https://aws.amazon.com/eventbridge/pricing/) |
| CloudWatch | Ingestão padrão de logs **0,50/GB** e arquivo **0,03/GB-mês** em exemplos de us-east-1. A franquia de referência de logs é **5 GB de dados para ingestão, arquivo e consulta**, sujeita à elegibilidade e regras da conta. Dados de vended logs, métricas personalizadas, exportação, alarmes avançados e consultas têm tarifas próprias. Base supõe franquia residual suficiente e sem adicionais. [CloudWatch](https://aws.amazon.com/cloudwatch/pricing/) |
| Parameter Store | Parâmetros Standard com throughput padrão sem cobrança adicional. Advanced **0,05/parâmetro-mês** e interações Advanced ou throughput elevado **0,05/10 mil interações**, conforme modalidade. Chamadas KMS são separadas. [Systems Manager](https://aws.amazon.com/systems-manager/pricing/) |
| KMS | **1/chave-mês** para cada chave gerenciada pelo cliente. **0,03/10 mil chamadas simétricas típicas** e franquia de **20 mil chamadas elegíveis/mês** na conta, compartilhada entre regiões conforme a AWS. Primeira e segunda rotações tarifáveis adicionam **1/chave-mês por rotação**. Réplicas, chaves extras e operações fora da franquia têm custo próprio. Base assume duas chaves sem rotações faturáveis no mês modelado. [KMS](https://aws.amazon.com/kms/pricing/) |
| GitHub Actions | Runner standard em repositório público é gratuito. Para privado, verificar minutos, cache e artefatos do plano. Referência oficial **0,006/minuto Linux x64 de dois núcleos** excedente, com arredondamento por job. Armazenamento e runners de outros tipos podem ter outras tarifas. Base assume sem excedentes. [GitHub faturamento](https://docs.github.com/en/billing/concepts/product-billing/github-actions) · [Tarifas de runners](https://docs.github.com/en/billing/reference/actions-runner-pricing) |
| DNS e domínio | Preservar a zona e o registro atuais. Se necessário, uma nova zona pública Route 53 Standard custa **0,50/zona-mês** nas primeiras 25, além das consultas tarifáveis. Alias elegível para CloudFront não cobra consulta. Domínio é anual e varia por registrador, extensão e renovação. Valor atual não verificado. Confirmar se DNS e renovação já constam nos US$ 0,56 antes de provisionar verba adicional. [Route 53](https://aws.amazon.com/route53/pricing/) · [Registro e renovação](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/getting-started.html) |

O cálculo não abate créditos promocionais AWS nem franquia S3 temporária. A AWS descreve regras distintas por data de abertura e tipo de conta. O uso preexistente pode consumir as franquias, inclusive entre ambientes da mesma conta ou organização quando aplicável. Para cada medidor, confirmar escopo da franquia, uso do site e folga restante em Cost and Usage e no painel do fornecedor. Franquia, nível gratuito, promoção, cota técnica e orçamento são controles distintos. [AWS Free Tier](https://aws.amazon.com/free/free-tier-faqs/) · [Acompanhamento AWS](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/tracking-free-tier-usage.html)

## Premissas de carga

As colunas são cenários mensais provisórios para **HML e PRD combinados**, além do histórico do site. Assume-se que os GB públicos são incrementais e entregues pelo CloudFront de PRD. DEV não usa nuvem no modelo.

| Medidor | Leve | Moderado | Intenso |
| --- | ---: | ---: | ---: |
| Administradores ativos | 5 | 15 | 30 |
| Requisições administrativas | 5.000 | 20.000 | 60.000 |
| Imagens | 50 | 200 | 500 |
| Vídeos | 5 | 20 | 50 |
| Publicações | 30 | 100 | 300 |
| S3 adicional médio, GB | 10 | 30 | 80 |
| Transferência pública incremental, GB | 20 | 80 | 300 |
| Horas somadas dos ambientes Web | 20 | 60 | 160 |
| vCPU-s ativas Web | 1.800 | 7.200 | 21.600 |
| Event Functions em GB-s | 6.000 | 30.000 | 120.000 |

**Hipóteses complementares de cálculo.** Memória Web média de 0,5 GB por ambiente. Para itens de mídia `M = imagens + vídeos`, publicações `P` e transferência pública `T` em GB, usar `PUT/COPY/POST/LIST = 6M + 20P + 600`, `GET/HEAD = 8M + 35P + 600 + 250T` e `invocações Event = M + P + 60`. Os termos fixos representam manutenção agregada, backups e verificações. Assumir 60 disparos Scheduler no total, 30 por ambiente, e 5.000 requisições CDN/GB, com 5% alcançando a origem. Isso gera 100 mil, 400 mil e 1,5 milhão de requisições CDN, além do site atual. Assumir 200 caminhos de invalidação adicionais por mês, como reserva de planejamento, com folga na franquia compartilhada. O número real de invalidações de segurança será medido e não deve ser limitado de modo a atrasar revogações.

| Premissa complementar | Leve | Moderado | Intenso |
| --- | ---: | ---: | ---: |
| S3 PUT/COPY/POST/LIST | 1.530 | 3.920 | 9.900 |
| S3 GET/HEAD | 7.090 | 25.860 | 90.500 |
| Invocações Event | 145 | 380 | 910 |
| Neon CU-h PRD / HML | 8 / 2 | 24 / 6 | 72 / 18 |
| Neon dados GB PRD / HML | 0,25 / 0,10 | 0,50 / 0,15 | 0,80 / 0,20 |
| Neon alterações retidas para Launch, GB-mês total | 0,10 | 0,20 | 0,40 |
| CloudWatch logs ingeridos, GB | 0,10 | 0,40 | 1,20 |
| Chamadas KMS típicas | 1.000 | 4.000 | 12.000 |

Neon CU-h soma `CU média × horas em execução` dos endpoints, incluindo espera até o scale-to-zero. As premissas equivalem a 40, 120 e 360 horas somadas se cada endpoint ativo gastar 0,25 CU. Supõe-se saída de banco abaixo de 5 GB por projeto. O vídeo passa por S3 e CloudFront. Não usar tráfego do vídeo como saída do banco. Logs arquivados no teste de estresse usam um mês equivalente ao volume ingerido. O modelo base pressupõe retenção compatível com franquia para logs operacionais e preserva evidências de segurança separadamente.

A capacidade adicional S3 é a **soma física faturável**, incluindo originais, derivados privados e públicos, cópias independentes, versões antigas, artefatos de segurança e dados fictícios de HML. Para inventário preliminar, distribuir em 45% originais, 20% derivados, 25% backups e versões retidas, 1% evidência e 9% fixtures e derivados de HML. Essa divisão de inventário não exclui custos compartilhados de HML. Os valores podem mudar com retenção e deduplicação. Não somar essas categorias novamente ao total de 10, 30 ou 80 GB.

### Evidência já medida

As etapas anteriores mediram **450 ms** até a primeira resposta de saúde standalone e **146,4 MiB de RSS** após operações administrativas em ambiente local. Um MOV sintético de 4 s levou **2,667 s** para processamento. O ensaio final registrou **482 ms**, 15 operações operacionais e 20 no diário e evidência para uma revogação, e **569 ms** para a restauração de 16 objetos. São amostras locais em x86-64 com PostgreSQL e Moto, sem medição de memória Lambda, CU-h de Neon ou tarifa AWS. Os coeficientes de operações acima são hipóteses para mistura mensal e não limites para operações críticas. [Fundação](ADMIN_POC_REPORT.md) · [Mídias](ADMIN_POC_MEDIA_REPORT.md) · [Publicação](ADMIN_POC_PUBLICATION_REPORT.md) · [Consistência final](ADMIN_POC_CONSISTENCY_FINAL_REPORT.md)

## Cálculo mensal

- **Web** = `requisições × 0,30 ÷ 1.000.000 + vCPU-s ativas × 0,0000276944 + horas de ambiente × 3.600 × 0,5 × 0,0000036667`.
- **S3** = `GB médios × 0,023 + PUT/COPY/POST/LIST × 0,005 ÷ 1.000 + GET/HEAD × 0,0004 ÷ 1.000`. Esta linha exclui transferências não elegíveis e transições.
- **Event, Scheduler, CloudWatch e KMS por chamada** = `max(consumo incremental − franquia restante, 0) × tarifa da unidade` para cada medidor, com requisições e GB-s separadas. Incluir franquia residual, limites independentes e operações fora da franquia. CloudFront segue a mesma lógica por origem/destino, requisições e invalidação. As hipóteses dão zero de excedente no caso base.
- **Neon pago** = `Σ(CU-h × preço por CU-h + GB-mês × 0,35 + GB-mês de alterações × 0,20 + GB excedentes de saída × 0,10)`, mais opcionais. O caso base usa projetos Free dentro dos limites.
- **Total conhecido** = `US$ 0,56 + valor das chaves + Web + S3 + excedentes aplicáveis + Neon pago quando adotado`. **Total comparável ao teto** = `total conhecido × câmbio efetivo + renovação anual fora da base ÷ 12 + DNS não incluído + impostos/encargos e outras tarifas confirmadas em reais`.

| Linha em US$/mês | Leve | Moderado | Intenso |
| --- | ---: | ---: | ---: |
| Site existente, base histórica | 0,5600 | 0,5600 | 0,5600 |
| 2 chaves KMS | 2,0000 | 2,0000 | 2,0000 |
| Web requisições | 0,0015 | 0,0060 | 0,0180 |
| Web vCPU ativa | 0,0498 | 0,1994 | 0,5982 |
| Web memória | 0,1320 | 0,3960 | 1,0560 |
| S3 armazenamento | 0,2300 | 0,6900 | 1,8400 |
| S3 PUT/COPY/POST/LIST | 0,0077 | 0,0196 | 0,0495 |
| S3 GET/HEAD | 0,0028 | 0,0103 | 0,0362 |
| DEV, Event, CloudFront incremental, Scheduler, CloudWatch, Parameter Store, KMS chamadas, Neon e GitHub | 0,0000 | 0,0000 | 0,0000 |
| **Total parcial antes de pendências** | **2,9838** | **3,8813** | **6,1579** |

Para rateio indicativo, alocar uma chave por ambiente e aplicar 20% a HML e 80% a PRD sobre Web, S3 (fora das leituras da CDN) e demais linhas variáveis compartilhadas. Leituras da origem da CDN são de PRD. A base AWS do site permanece comum. Usar tags e medição real para substituir esse rateio, inclusive armazenamento que continua ativo com HML desligado.

| Ambiente, US$/mês no caso base | Leve | Moderado | Intenso |
| --- | ---: | ---: | ---: |
| DEV local | 0,0000 | 0,0000 | 0,0000 |
| HML | 1,0844 | 1,2627 | 1,7136 |
| PRD incremental | 1,3395 | 2,0587 | 3,8843 |
| Site existente e base comum | 0,5600 | 0,5600 | 0,5600 |

## Crescimento de armazenamento em doze meses

Usar os volumes dos cenários como ponto de partida `S0` e acrescentar `g = 1 / 3 / 8 GB` líquidos por mês, após eventual deduplicação e expiração aprovada. É um estresse paramétrico de 10% da capacidade inicial por mês em termos absolutos, com incremento fixo. A capacidade de fechamento no mês `n` é `S0 + n × g`. Para custo mensal, assumir crescimento uniforme e usar volume médio `S0 + (n − 0,5) × g`. Custo anual de S3 apenas = `(12 × S0 + 72 × g) × 0,023 × 6`.

| Marco | Leve GB | Moderado GB | Intenso GB |
| --- | ---: | ---: | ---: |
| Inicial | 10 | 30 | 80 |
| Fechamento mês 1 | 11 | 33 | 88 |
| Fechamento mês 2 | 12 | 36 | 96 |
| Fechamento mês 3 | 13 | 39 | 104 |
| Fechamento mês 4 | 14 | 42 | 112 |
| Fechamento mês 5 | 15 | 45 | 120 |
| Fechamento mês 6 | 16 | 48 | 128 |
| Fechamento mês 7 | 17 | 51 | 136 |
| Fechamento mês 8 | 18 | 54 | 144 |
| Fechamento mês 9 | 19 | 57 | 152 |
| Fechamento mês 10 | 20 | 60 | 160 |
| Fechamento mês 11 | 21 | 63 | 168 |
| Fechamento mês 12 | 22 | 66 | 176 |
| **S3 apenas, acumulado dos 12 meses em R$** | **26,50** | **79,49** | **211,97** |
| **Total parcial mensal no mês 12, demais premissas constantes em R$** | **19,49** | **28,05** | **49,64** |

A projeção de retenção deve medir dados ainda acessíveis por catálogo, versões não atuais e períodos mínimos protegidos. Para uma janela adicional, usar `GB de cópias físicas adicionais dada a janela × preço GB-mês`, incluindo duplicação ou deduplicação real, requisições de restauração e retenção da evidência. Estender a janela em 30 dias a uma geração líquida de 1/3/8 GB de backups novos por mês acrescentaria **R$ 0,14 / 0,41 / 1,10 por mês** em S3 Standard, antes das operações, em um modelo uniforme. A retenção de 7 diárias, 4 semanais, 3 mensais, até 3 releases anteriores elegíveis e auditoria por 12 meses continua sujeita a aprovação. Preservar todos os objetos alcançáveis dos catálogos protegidos e testar restauração e quarentena antes de expirar uma versão. [Política de retenção da PoC](ADMIN_POC_SECURITY_REPORT.md)

## Sensibilidade e alternativas pagas

| Variação independente, R$/mês total parcial | Leve | Moderado | Intenso |
| --- | ---: | ---: | ---: |
| Câmbio R$ 5,00/US$ | 14,92 | 19,41 | 30,79 |
| Câmbio R$ 7,00/US$ | 20,89 | 27,17 | 43,11 |
| Neon Launch em HML e PRD | 25,12 | 43,97 | 96,77 |
| Franquias de Event, Scheduler, CloudWatch e KMS chamadas já consumidas | 18,72 | 27,03 | 50,58 |

O acréscimo do Launch é **US$ 1,2025 / 3,4475 / 9,9700**, calculado com 10/30/90 CU-h, 0,35/0,65/1,00 GB de dados e 0,10/0,20/0,40 GB-mês de alterações retidas. Mesmo a 0,25 CU, 30 dias ligados continuamente representam **180 CU-h por projeto** e **US$ 19,08 apenas em compute Launch**. Em Free, esse padrão ultrapassaria 100 CU-h. No estresse de franquias AWS, cobrar integralmente os medidores selecionados, incluindo logs a US$ 0,53 por GB com um mês de arquivo e as 60 invocações Scheduler. CloudFront e Neon mantêm as premissas base nessa linha.

- **Banco e versões.** Mais 10 CU-h em Launch adicionam **R$ 6,36**. Mais 1 GB-mês de dados de banco adiciona **R$ 2,10** e 1 GB-mês de alterações retidas adiciona **R$ 1,20**. Planejar alerta antes de atingir limites por projeto, para evitar suspensão de PRD. Backup S3 e histórico Neon medem recursos diferentes.
- **Mídia, retenção e disco.** Mais 10 GB médios em S3 custam **R$ 1,38/mês** antes de chamadas. Mais 100.000 GB-s de Event custariam **R$ 8,00** se integralmente faturáveis, mais invocações, disco temporário acima da franquia, tentativas e saída. Medir vídeo por duração, codec, resolução, memória e armazenamento temporário, evitando estimar a partir de contagem de vídeos. Revisar multipart, retries e volumes órfãos sem apagar backups e evidências.
- **Tráfego.** O custo do excedente CloudFront depende da região dos espectadores e do tipo de requisição. Como ilustração de tarifa de referência, 100 GB cobrados à tarifa de **US$ 0,085/GB** do tutorial AWS custariam **R$ 51,00**, antes de requisições. Essa tarifa não foi verificada para a composição do site brasileiro. A fonte de preço deve ser a tabela da classe e borda efetivas. Medir cache miss, invalidações, variações por Range e transferências do painel e recuperação separadamente. [Tutorial AWS CloudFront](https://docs.aws.amazon.com/pdfs/hands-on/latest/deliver-content-faster/deliver-content-faster.pdf) · [FAQ CloudFront](https://aws.amazon.com/cloudfront/faqs/)
- **Tempo de vida Web.** Cada 100 horas-ambiente extras a 0,5 GB custam **R$ 3,96** em memória à tarifa bruta. Um só ambiente permanente durante 720 h custa **R$ 28,51** somente em memória. Monitorar concorrência e janelas de HML sem limitar operações de segurança essenciais.
- **Evidências e criptografia.** O índice, os slots de reserva e recibo, versões, verificações e retenção protegida geram armazenamento, PUT/GET/LIST e chamadas KMS. Medir crescimento separado da mídia, inclusive leituras de cadeia após retenção. Mais uma chave ou rotação faturável acrescenta **R$ 6,00/mês**, além de uso. Duas chaves extras acrescentariam **R$ 12,00/mês**. Usar deduplicação e revisar cache ou chaves de bucket quando compatíveis com isolamento e recuperação. [Custos do KMS](https://docs.aws.amazon.com/prescriptive-guidance/latest/aws-kms-best-practices/cost.html)
- **Tributos, DNS e domínio.** Uma hipótese ilustrativa de renovação de **R$ 60/ano** fora da base acrescenta **R$ 5,00/mês**, com desembolso integral no mês de renovação. Uma zona adicional a US$ 0,50 custa **R$ 3,00/mês**, mais consultas aplicáveis. Um fator hipotético de 10% sobre as linhas em dólares acrescentaria cerca de **R$ 1,79 / 2,33 / 3,69** no caso base. Apurar tributos, spread/câmbio, forma de pagamento e registrador na fatura real. Esses valores são testes de sensibilidade, sem afirmar alíquotas ou custos vigentes do projeto.

## Política FinOps

| Gasto consolidado previsto ou realizado | Ação proposta |
| --- | --- |
| R$ 15 · monitoramento preventivo | Conferir projeção semanal e saldos de franquias. |
| R$ 25 · atenção | Revisar CU-h, memória Web, arquivos e execução de HML. Identificar os maiores desvios. |
| R$ 35 · alerta | Revisar com responsável pelo projeto. Priorizar limites de uso não essencial e recalcular cenários de estresse. |
| R$ 45 · crítico | Suspender ativações de HML e cargas não essenciais conforme procedimento aprovado, e avaliar causa e capacidade de manter os controles essenciais. |
| R$ 50 · teto | Escalar ao responsável e impedir novos compromissos de gasto sem aprovação. Preservar segurança, backups e disponibilidade pública. |

- Configurar AWS Budgets para gastos realizados e previstos. Manter alertas por conta e por custo atribuível às aplicações. Conciliar separadamente Neon, GitHub, registrador e impostos para medir o total. Alertas têm latência e **não são limites automáticos de gasto**. AWS Cost Anomaly Detection ajuda no desvio de tendência da AWS. Manter um comparativo próprio de cupons, serviços e ambientes. [AWS Budgets](https://aws.amazon.com/aws-cost-management/aws-budgets/pricing/) · [Cost Anomaly Detection](https://aws.amazon.com/aws-cost-management/aws-cost-anomaly-detection/)
- Ativar tags de alocação quando autorizado, por exemplo `Projeto`, `Ambiente`, `Componente` e `Responsável`. Conferir suporte por serviço e custo sem tags, como parte da CDN ou conta comum. Monitorar cada projeto Neon por CU-h, armazenamento e saída, com folga antes da suspensão ou falha de escrita. [Tags de alocação AWS](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html) · [Limites Neon](https://neon.com/pricing)
- Limitar concorrência e tentativas por tipo de worker, tamanho e duração dos uploads e taxa de operações caras. Usar execução por evento, limite de backlog, reconciliação curta sob demanda, scale-to-zero verificado e janela de HML sob demanda. Evitar acordar banco com cron frequente, probes ou conexões ociosas. Preservar provas e trilhas obrigatórias com retenção definida, e manter logs operacionais estruturados sem segredos e com expiração.
- Deduplicar blobs com integridade conferida, medir partes de multipart abandonadas e aplicar lifecycle somente a destinos e categorias aprovados. Testar recuperação de evidências e catálogo após políticas de retenção. Evitar cortar verificação, backups, controles de concorrência ou revogações para reduzir custos.
- Confirmar as cobranças ainda fora dos totais, incluindo rede inter-regional/VPC, NAT ou conectores quando exigidos, transferência administrativa e de restauração, KMS, logs e data events de auditoria, invalidações, licenças/serviços opcionais, DNS, renovação, tributos e cobrança do GitHub. Para exemplo de fallback, 500 minutos Linux x64 faturáveis acrescentariam **R$ 18,00** à tarifa de referência. Qualquer adicional requer nova avaliação e aprovação.

## Homologação e critérios de decisão

1. **Inventário e conta.** Obter as três faturas históricas do site por SKU, região, tags, descontos, imposto e moeda. Confirmar plano e escopo das franquias em AWS, Neon e GitHub, domínio, zona e data de renovação. Levantar S3 por classes, versões, cópias e evidências. Consolidar DEV, HML e PRD em uma única projeção.
2. **Janela HML sob aprovação separada.** Usar dados fictícios ou sanitizados. Medir cold start, vCPU-s, memória integrada na vida dos ambientes, requisições e conexões, duração e memória de workers por codec, GB-s, picos e ociosidade, número de tentativas, CU-h, GB-mês, egress e latência de retomada. Aferir carga e concorrência representativas nas três faixas, com os controles de segurança ligados.
3. **Custo e segurança ponta a ponta.** Medir PUT, GET, LIST, CAS, leituras do índice, KMS, tamanho dos recibos e crescimento de backup com retenção real. Medir cache miss, transferência por borda, volume de logs, convergência da revogação e minutos/artefatos CI. Gerar relatório por HML e PRD e conciliar com as linhas de faturamento ao longo de um ciclo. Sem acesso à fatura, manter números como projeções.
4. **Bloqueadores de produção.** Preservar as pendências de homologação documentadas. Verificar Node gerenciado e empacotamento Linux Arm64, limites de upload/worker, conexões diretas e pooler, segregação regional, migração e revisões de rascunhos, gestão de credenciais, MFA e recuperação de conta. Validar IAM/OAC e separação SQL, proteção de manifesto e recibos com versionamento ou retenção imutável, CAS e falhas reais em AWS e Neon, migração de manifestos, revogação na borda, backup e restauração em quarentena com revisão independente de privilégios e evidências. Validar disponibilidade pública, RPO/RTO e preservação de URLs e SEO. A PoC local não encerra esses bloqueadores. [Fundação e runtimes](ADMIN_POC_REPORT.md) · [Acesso](ADMIN_POC_ACCESS_REPORT.md) · [Mídias](ADMIN_POC_MEDIA_REPORT.md) · [Publicação](ADMIN_POC_PUBLICATION_REPORT.md) · [Segurança](ADMIN_POC_SECURITY_REPORT.md) · [Consistência](ADMIN_POC_CONSISTENCY_REPORT.md) · [Consistência final](ADMIN_POC_CONSISTENCY_FINAL_REPORT.md)
5. **Critério financeiro.** Prosseguir para homologação somente após aprovar a janela e o gasto incremental. Submeter produção a decisão separada com total completo, plano de reação aos alertas e cenário pago plausível dentro do teto. Se a perda de franquia ou a retenção segura exceder o teto, reduzir carga não essencial, frequência de HML ou dispersão de artefatos. Se a margem continuar insuficiente, revisar a arquitetura ou solicitar novo orçamento, preservando os controles aprovados.

**Recomendação.** Consolidar a medição no cenário leve e tratar o moderado como candidato condicionado à folga para custos pendentes. O cenário intenso ultrapassa o teto no fallback Launch e no estresse de franquias AWS selecionadas. Manter bloqueada a aprovação de produção.
