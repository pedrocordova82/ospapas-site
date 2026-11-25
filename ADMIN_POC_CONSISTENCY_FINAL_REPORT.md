# MC Os Papas — Correção final de consistência distribuída

**Etapa 02G.1 · Prova de conceito**

## Decisão aprovada

O projeto prioriza segurança sobre disponibilidade administrativa. Uma mudança de autorização pode permanecer pendente. Enquanto houver desfecho incerto, o ambiente suspende novas operações administrativas afetadas e novas ativações. O consumidor continua servindo a release confirmada pelo manifesto quando ela está disponível. Nenhum comando desta etapa promove uma restauração. [Especificação](ADMIN_PROJECT_SPEC.md) · [Segurança](ADMIN_POC_SECURITY_REPORT.md) · [Consistência anterior](ADMIN_POC_CONSISTENCY_REPORT.md)

| Bloqueador | Classificação | Propriedade |
| --- | --- | --- |
| Corrida entre autorização no PostgreSQL e ativação no S3 | Resolvido no escopo experimental | Uma mutação protegida somente confirma depois do CAS da barreira. Um PUT antigo ou vence antes da mudança ou perde a precondição. Nem perda da sessão nem ausência de resposta libera a barreira por tempo. |
| Regressão ou perda de revogações confirmadas | Resolvido no escopo experimental | Reservas e recibos imutáveis no destino de recuperação, com índice autenticado, são verificados sem confiar só no manifesto operacional. Uma versão antiga, uma cadeia válida truncada ou evidência indisponível impede concluir a reconciliação. A proteção contra alteração coordenada das duas áreas depende da fronteira de privilégios de produção. |

## Protocolo e pontos de linearização

1. A aplicação registra UUID da operação, UUID reservado para a saída, ambiente, entidade e ID da linha em uma transação independente. Um índice parcial permite só uma intenção pendente por ambiente. A intenção ativa suspende novos pedidos via aplicação. A transação da mutação tem um lock transacional pelo UUID, usado na recuperação para comprovar que já terminou.
2. O coordenador lê o manifesto e o substitui com If-Match, preservando as releases, o horário e as revogações. Em vez de criar uma release, incrementa a revisão e instala a geração da barreira. Se uma ativação anterior vencer, o coordenador relê e preserva o resultado já público. A instalação é confirmada por leitura. Sem essa confirmação, a mutação não prossegue.
3. A geração cercada determina a release que venceu antes da mudança. A intenção registra a linhagem, a revisão e a release observadas. Se o vencedor foi uma revogação pública, o coordenador exige seu recibo independente. Escritas antigas contra o ETag anterior perdem a precondição. A fila ainda pode reconciliar o estado operacional do job em passagem posterior.
4. A transação de mutação registra a autorização do escopo para sua própria transação. Um trigger confere entidade, linha, UUID e identificador da transação PostgreSQL. Registra o efeito na mesma transação que altera conta, unidade, membro ou aprovação. A autorização nova torna-se efetiva no commit do PostgreSQL. O ACK do cliente não comprova o efeito.
5. O coordenador de conclusão obtém o lock transacional do UUID e consulta o efeito. Registra o recibo cifrado da decisão, usa CAS para liberar somente a barreira com o UUID esperado e confirma por leitura o UUID de saída. Só então confirma a conclusão no banco e retorna sucesso. Uma liberação antiga mantém o ETag capturado e não pode liberar uma barreira nova.
6. A revogação pública lineariza no CAS que troca o manifesto, avança a geração e instala o conjunto de alvos revogados. Seu efeito é no armazenamento. A fila bloqueia sucessores enquanto há uma escrita anterior incerta. A confirmação operacional da revogação exige o recibo independente. Assim, a revogação não depende de confirmar primeiro uma nova autorização de conteúdo no PostgreSQL.

A ordem vale para inativação de conta ou unidade, mudança de perfil ou lotação, transferência regional de membro e retirada de aprovação. As coleções usam o mesmo coordenador no gancho transacional do Payload, inclusive Local API. O endpoint de retirada de aprovação usa a mesma intenção, barreira, efeito e reconciliação. Os caminhos em lote de titularidade já são recusados. Um segundo efeito conflitante na mesma transação é recusado. A proteção SQL recusa escritas conflitantes sem efeito vinculado e impede remoção direta de registros de autoridade. A configuração de produção precisa de papéis separados, proibir a aplicação ordinária de criar provas ou desabilitar triggers, e restringir funções, tabelas de coordenação, credenciais S3 e manutenção a identidades controladas. O ensaio local usa um papel de fixture com privilégios maiores para encerrar sessões e manter alguns casos legados de injeção de estado.

**Invariantes.** Só um UUID pendente coordena cada ambiente. A geração pública muda em cada escrita do protocolo. O worker guarda o ETag e revalida permissões e mídias antes de emitir o PUT. Se adquirir uma geração nova, faz as verificações novamente. O commit de autorização exige a barreira comprovada. Toda liberação exige a identidade da operação e seu ETag. PostgreSQL e S3 mantêm commits distintos. [Escritas condicionais S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html) · [Locks PostgreSQL](https://www.postgresql.org/docs/17/explicit-locking.html)

### Estados administrativos

| Estado | Evidência durável | Resposta |
| --- | --- | --- |
| Solicitada | Intenção registrada | Ainda sem mudança na autorização |
| Pendente | Intenção aberta, com ou sem barreira observada | Ativação suspensa. Resultado ambíguo exige reconciliação |
| Efetiva | Efeito confirmado junto com a mutação SQL | Nova autorização vale. A aplicação permanece suspensa até confirmar saída |
| Concluída | Efeito, recibo, geração de saída observada e intenção encerrada | Sucesso |
| Abortada | Transação encerrada sem efeito, recibo de aborto e saída confirmada | A autorização anterior continua vigente |

Em caso de erro, consultar poc_security_intents para identificar a operação pendente e inspecionar o manifesto. No ambiente local, executar npm run security:reconcile -- UUID. O comando usa o efeito transacional e a exclusão por UUID. Não reaplica a mutação. Se o resultado de armazenamento continuar ambíguo, mantém a operação pendente. Manifesto ausente ou inválido exige investigação de recuperação. A duração da suspensão é uma consequência aprovada.

## Evidência independente e recuperação

O diário guarda eventos cifrados de conteúdo e mídia no destino de recuperação, sem copiar dados de conta para o manifesto. A evidência usa slots numerados por linhagem, com reserva e desfecho imutáveis. Um índice autenticado de maior número avança por CAS. Cada reserva contém UUID da release, revisão candidata, ETag base e digest do evento. O recibo relaciona o SHA-256 da reserva ao resultado observado. AES-256-GCM vincula os objetos à chave e ao destino. Uma reserva divergente, lacuna, recibo ausente ou slot posterior a um índice regredido suspende a conclusão.

A ordem é evento do diário → reserva imutável → avanço do índice → CAS operacional → leitura do manifesto → recibo imutável → conclusão do job. Uma reserva sem recibo continua ambígua. Se o worker reinicia, somente a observação da release e do digest confirma a revogação. Quando uma geração posterior impede definitivamente a escrita antiga e o manifesto continua sem aquela revogação, o worker pode registrar aborto. Antes de outra ativação ou mudança de autoridade, o protocolo confere o índice, a cauda e a última revogação confirmada. O procedimento de recuperação lê todos os slots e vincula cada recibo confirmado ao diário do manifesto. Uma cadeia truncada que é válida isoladamente falha ao comparar com os recibos. A recuperação usa o backup anterior como limite adicional e mantém em quarentena uma cópia que não possa provar o histórico.

As mudanças administrativas concluídas ou abortadas deixam recibos cifrados no destino de recuperação. As contas históricas e as atribuições restauradas ainda exigem revisão humana. A cópia não contém sessões, não reativa usuários, não inicia workers, mantém trabalhos antigos suspensos e não sobrescreve o manifesto da origem. A promoção não está implementada e deve exigir reconciliação atual de privilégios. Os recibos de autorização registram decisão e escopo, sem conter credenciais. A origem pública continua a servir seu manifesto confirmado durante a recuperação.

S3 Versioning, Object Lock e IAM precisam preservar evidências contra exclusão, substituição e regressão conjunta do índice e dos slots. A integração pública deve impedir restores diretos de versões antigas do manifesto sem passar pelo protocolo. O consumidor atual confia na origem operacional durante a leitura pública. Um administrador de armazenamento com poder de repor livremente bytes operacionais pode quebrar essa premissa até a detecção. A homologação precisa demonstrar a política de gravação condicional, negação de exclusão e proteção dos recibos e do índice. Planejar migração controlada de linhagens anteriores sem recibos, antes de permitir recuperação ou novas revogações sobre elas. [Versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html) · [Object Lock](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html) · [Controle de escritas condicionais](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes-enforce.html)

## Falhas e validação

| Cenário | Comportamento esperado |
| --- | --- |
| PUT aceito antes da barreira, resposta perdida | A barreira preserva o vencedor. A alteração de autoridade é posterior |
| Barreira vence PUT atrasado com sessão encerrada | A escrita antiga perde o ETag; a intenção pode confirmar sem tornar pública a release antiga |
| ACK do PUT de barreira perdido | Intenção e possível barreira permanecem. A operação precisa de inspeção |
| Commit incerto ou rollback | A presença do efeito, consultada só após obter o lock do UUID, distingue commit de ausência. O comando libera apenas após reconciliação |
| Resolução atrasada ou concorrente | Outra operação não pode assumir o UUID ativo, nem liberar a geração sucessora |
| Manifesto ausente, regredido ou diário truncado | A instalação não recria manifesto perdido. A recuperação recusa regressão ou lacuna e conserva a quarentena |

O ensaio executou em Debian 13, Node.js 24.22.3, PostgreSQL 17.12 e Moto 5.2.6 em loopback. TypeScript, ESLint, build de produção e inicialização standalone em /healthz passaram. Foram aprovados **65 testes preexistentes e 3 novos**. A rodada final teve 15 testes de acesso, 15 de mídia, 17 de publicação, 12 de segurança e 9 de consistência, sem falhas. A sessão do worker foi encerrada no PostgreSQL real. O atraso de PUT e a perda de respostas foram injetados no cliente. O commit incerto foi ensaiado encerrando o fluxo de coordenação após o COMMIT, antes de sua verificação. Não houve testes em AWS ou Neon.

As suítes preexistentes foram preservadas, incluindo as verificações de release imutável e revogação de sessões. Os testes que antes esperavam o mesmo ETag passaram a verificar a mesma release ativa, pois o protocolo avança a geração sem trocar o conteúdo. A rotina de encerramento do standalone na suíte de acesso foi corrigida para o temporizador atuar somente sobre o processo anterior.

| Medição local | Resultado |
| --- | --- |
| Caminho com PUT atrasado, perda da sessão e barreira vencedora | 1.298 ms no trecho medido |
| Revogação com histórico anterior | 482 ms, 15 operações operacionais e 20 operações no diário e evidência |
| Backup de 16 objetos | 692 ms, dump comprimido de 100.073 B |
| Restauração de 16 objetos após duas revogações públicas e desativação posterior ao backup | 569 ms no total, 107 ms de pg_restore, 339 ms para conciliação e cópia, 65 operações de armazenamento |
| Pico de RSS do processo Node durante a restauração | 317.960 KiB, incluindo Payload e fixtures |

Para repetir localmente, prepare PostgreSQL em branco, manifesto inicial e bucket de recuperação Moto conforme a Etapa 02G, com prefixos separados por suíte. A suíte de consistência usa um prefixo de publicação novo para testar a inicialização e um banco vazio em POC_RECOVERY_JOURNAL_TEST_URL. Execute os cinco comandos test:integration, test:media, test:publication, test:security e test:consistency após preparar o standalone.

## Operação, custo e homologação

O teto total permanece em **R$ 50,00/mês**, com **R$ 0,00** adicionais nesta etapa. A publicação comum acrescenta duas verificações PostgreSQL de intenção pendente e duas operações de leitura de evidência, mais a leitura da reserva e do recibo por slot consultado até a última confirmação. Uma mutação típica exige duas escritas condicionais no manifesto, leituras de confirmação, verificação da evidência, uma escrita de recibo e consultas curtas para intenção, lock, efeito e resultado. Uma revogação acrescenta a reserva, o CAS do índice, as leituras da evidência e o recibo. O verificador completo é linear no número de slots. Em produção, avaliar intervalos de retenção, checkpoints autenticados e custo de leitura antes de aumentar volumes. A reconciliação é pontual e usa os recursos existentes. Nenhum serviço externo foi provisionado.

Antes de produção, homologar IAM e proteção de versões, falhas com S3 e Neon reais, a migração de manifestos existentes, a retenção de evidências, as fronteiras do papel SQL e um procedimento independente de recuperação e revisão de privilégios. O ensaio local não valida o tratamento de uma perda simultânea das duas áreas nem reproduz políticas reais de IAM. Validar também a invalidação na CDN. Essas condições continuam bloqueando produção. [Neon e conexões](https://neon.com/docs/connect/connection-pooling) · [Invalidação CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html)

**Recomendação.** Prosseguir com homologação controlada e manter o bloqueio de produção.
