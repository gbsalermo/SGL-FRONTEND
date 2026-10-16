# Continuidade — SGL Frontend

## Checkpoint de encerramento funcional — Etapa 7 (16/10/2026)

**Estado:** Etapa 7 (7.0–7.7) concluída funcionalmente e validada pelo responsável; código e documentação preparados na branch `collab/etapa-7-unidades-solucoes-contexto` para merge **a ser realizado pelo responsável**. Não afirmar que o merge, publicação ou homologação integral de produção ocorreram.

**Entregas:** unidades de medida e apresentações físicas, conversão e decimais, recipientes individuais, FEFO/FIFO, Soluções, contrato de Pedidos convencionais por embalagem ou medida, aprovação em embalagens com conversão canônica, retirada individual de reações/unidades de kits quando o lote permite abertura, massa DEV/DEMO revisada, resumo físico na listagem de Estoque, mínimo configurável em embalagem ou medida (V39), revisão da nomenclatura e da configuração `fracionavel` por lote, QA e auditoria de integração. O valor mínimo salvo continua canônico; a preferência de apresentação é persistida separadamente.

**Aceites relatados pelo responsável:** suítes Maven/JUnit verdes, API iniciando normalmente, build do frontend verde, solicitações/aprovações e refinamento de estoque validados, correções finais de cadastro/entrada, massa DEMO e documentação testadas e aceitas. Não extrapolar esses aceites para teste exaustivo de todos os perfis ou homologação para produção.

**Regras importantes:** `fracionavel` controla permitir abrir embalagem e consumir parte do conteúdo; não permite dividir uma unidade indivisível como 1 reação. O lote governa a permissão; pedidos por medida não são pedidos de embalagem; pedidos por embalagem são aprovados visualmente em apresentações inteiras, enviados ao backend em quantidade canônica. FEFO/FIFO e baixa única na aprovação continuam no servidor. Kit fracionável admite retirada de uma reação individual; frasco de 500 mL admite pedido por medida, sem inventar “500 unidades”.

**Etapa 8, próximo passo:** integração do contexto de participação do Estagiário (Projeto/SCI/Atividade) aos Pedidos/Soluções, incluindo regras de vínculo, acesso e aprovação. Executar também **roteiro operacional exaustivo ainda não realizado**: cadastro de produto → entrada de lotes → escolha de embalagem ou medida → pedido → liberação/aprovação → entrega → movimentação/rastreabilidade, com casos de abertura, estoque mínimo, validade, FEFO/FIFO e múltiplas unidades. Nenhuma mudança da Etapa 8 deve ser inferida como implementada.

**Infra e migrations:** DEV PostgreSQL com Flyway; DEMO H2 em memória; massa de teste por inicializadores. V39 acrescenta metadados opcionais para exibição do mínimo. Flyway para evolução estrutural/dados de referência necessários, não para atualizar dados fictícios descartáveis. Confirmar ambos os repositórios após o merge e criar branch separada para a Etapa 8.

**Documentação canônica:** backend `docs/PLANO_PRE_PRODUCAO.md`, `docs/CONTINUIDADE_ETAPA_7_2026-10-06.md`, `docs/ETAPA_7_7_AUDITORIA_INTEGRACAO_BACKEND_FRONTEND.md`; frontend `docs/PADRAO_VISUAL_PRE_PRODUCAO.md`, `docs/ETAPA_7_6_0_AUDITORIA_FRONTEND_PADRAO_VISUAL_PEDIDOS.md`. Registros datados anteriores refletem checkpoints históricos, não substituem este encerramento.


**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 16/10/2026 — Etapa 7 encerrada funcionalmente; merge sob responsabilidade do usuário
**Branch estável:** `main` do GitLab institucional  
**Branch histórica da Etapa 4:** `feat/etapa-4-residuos` — referência; não mergear integralmente  
**Branch atual de trabalho:** `collab/etapa-7-unidades-solucoes-contexto`  
**Etapa concluída:** Etapa 7 — Unidades, Soluções, estoque físico e Pedidos ✅  
**Próxima etapa:** Etapa 8 — contexto de participação integrado aos Pedidos/Soluções (não iniciada)

**Ajuste de legibilidade do 6.5:** linhas da tabela de Estagiários foram ampliadas para a densidade das telas maduras de Gestão e o drawer detalhado passou para 860 px por conter vínculo, Formação, segurança, participações e histórico. A massa DEV da Unidade IQ foi ampliada no backend para validar os previews.

**Polimento de informação do 6.5:** a tabela passou a priorizar os campos que o cliente já consulta diretamente: `Status`, `Estagiário`, `Formação`, `Contexto operacional` e `Período`. Bolsa/modalidade saiu da listagem e ficou no drawer. `Não iniciado` é um status visual derivado apenas quando o vínculo existe e ainda nunca teve participação em Atividade; `Prorrogado`, `Em andamento` e `Encerrado` permanecem visíveis na coluna de Status. O nome do Orientador aparece abaixo do Estagiário e Curso abaixo de Formação.  
**Etapa 4:** 4.1–4.4 reconciliados e validados ponta a ponta ✅
**Plano canônico:** `gbsalermo/Sistema-SGL/docs/PLANO_PRE_PRODUCAO.md`  
**Handoff da etapa atual:** `gbsalermo/Sistema-SGL/docs/CONTINUIDADE_ETAPA_7_2026-10-06.md` — 7.4 encerrada por aceite funcional em 14/10; próxima 7.5

Este é o checkpoint principal para retomada do frontend. Contratos HTTP devem ser confirmados no Swagger/OpenAPI do backend.

> **Infraestrutura Git obrigatória:** ler `docs/SINCRONIZACAO_GITLAB_GITHUB.md` antes de alterar branches. GitLab é a fonte canônica de `main`; GitHub espelha `main` e recebe a colaboração em `collab/*`. Não usar `--force` e não editar `GitHub/main` diretamente.

---

# 1. Regra de trabalho

```text
branch própria
→ implementar/revisar
→ validar
→ refinar
→ PR
→ main
→ atualizar documentação
```

Regra especial:

- backend funcional é implementado manualmente pelo responsável do projeto;
- IA pode analisar/modelar/orientar/revisar;
- frontend e documentação podem ser alterados diretamente quando autorizado;
- não antecipar etapas futuras.

As Etapas 1–4 estão fechadas e integradas.

Branch atual:

```text
collab/etapa-5-projetos-atividades
```

Os contratos backend de Projeto → SCI → Atividade, prorrogações e Código SEG estão estabilizados. O frontend está liberado para o bloco 5.5.

---

# 2. Estado consolidado

```text
Bootstrap / identidade visual                         ✅
Login visual / sessão DEV                            ✅
Expiração automática da sessão em 5h                 ✅
Pedidos do Solicitante                               ✅
Pedidos da Gestão                                    ✅
Estoque / lotes                                      ✅
Movimentações                                        ✅
Relatórios / fiscalização                            ✅
PDF/XLSX                                             ✅
Resíduos — Solicitante                               ✅ Etapa 3 refinada
Resíduos — Gestão                                    ✅ Etapa 3 refinada
Classes de Resíduo em Cadastros                      ✅
Segurança/EPI em Produto/Resíduo                     ✅
Prévia antecipada do rótulo                          ✅
Bloqueio de impressão antes da liberação             ✅
Rótulo de Resíduo                                    ✅ base funcional; final na Etapa 10
Rótulo de Produto                                    ✅ base funcional; final na Etapa 10
Estagiários                                          ✅ base atual
Pessoas por laboratório                              ✅
Administração / Cadastros                            ✅
Dashboard Gestão                                     ✅
Dashboard Solicitante                                ✅
Alertas operacionais                                 ✅
Busca global                                         ✅
Dark Mode definitivo                                 ✅
404                                                  ✅
Contexto de Unidade enviado à API                    ✅
Testes unitários/componentes                         ⏳ Etapa 12
Testes E2E                                           ⏳ Etapa 12
Autenticação/autorização definitiva                  ⏳ posterior
```

---

# 3. Rotas principais

```text
/login

SOLICITANTE
/inicio
/meus-pedidos
/meus-residuos
/pedidos/novo
/residuos/novo

GESTÃO / ADMIN
/dashboard
/pedidos
/estoque
/estoque/lotes-vencendo
/estoque/:id
/movimentacoes
/projetos
/estagiarios
/residuos
/relatorios
/relatorios/residuos
/relatorios/pessoas-laboratorio
/administracao/cadastros

RÓTULOS
/residuos/:id/rotulo
/produtos/:id/rotulo
```

Rota inicial:

```text
GESTOR / ADMINISTRADOR → /dashboard
TECNICO / ANALISTA / PESQUISADOR / ESTAGIARIO → /inicio
```

---

# 4. Sessão DEV, perfis e Unidade

Perfis atuais:

```text
ADMINISTRADOR
GESTOR
TECNICO
ANALISTA
PESQUISADOR
ESTAGIARIO
```

A sessão DEV contém atualmente:

```text
unidadeId
unidadeNome
unidadeSigla
laboratorioId
laboratorioNome
```

O interceptor envia:

```text
X-SGL-Unidade-Id: <unidadeId>
```

Esse mecanismo garante contexto funcional de Unidade em desenvolvimento, mas não substitui autenticação/autorização definitiva.

**Decisão estrutural de 01/10/2026:** `laboratorioId/laboratorioNome` permanecem na sessão DEV apenas por compatibilidade enquanto o fluxo atual existir. Para Estagiários, esses campos não representam um "Laboratório do Estagiário" definitivo. O contexto operacional será derivado de suas participações em Atividades.

---

# 5. Resíduos — estado final da Etapa 3

Rotas:

```text
Solicitante
/residuos/novo
/meus-residuos

Gestão
/residuos

Rótulo
/residuos/:id/rotulo
```

Fluxo:

```text
INFORMADO
→ EM_ANALISE
→ LIBERADO_PARA_ARMAZENAMENTO
→ ARMAZENADO_TEMPORARIAMENTE
→ DESPACHADO
```

## Formulário do Solicitante

A tela `InformarResiduoView.vue` já cobre:

- projeto opcional;
- descrição;
- Procedência / uso do Resíduo (`processoOrigem`);
- recipiente;
- quantidade/unidade;
- estado físico;
- tratamento realizado;
- riscos percebidos;
- composição;
- Classes de Resíduo;
- Segurança/EPI;
- sugestões de EPI a partir dos Produtos associados;
- observação final.

O formulário teve escala visual aumentada para uso natural em **100% de zoom**, incluindo maior largura útil, tipografia, campos e espaçamentos.

Classes e EPI usam grade visual alinhada.

## Gestão

A Gestão confirma:

- riscos;
- Classes de Resíduo;
- Segurança/EPI;
- armazenamento temporário;
- destino previsto;
- observações técnicas.

A visualização dos detalhes foi consolidada em **dois cards comparativos**:

```text
Informado pelo laboratório
→ classes
→ risco
→ segurança/EPI
→ observação original

Aprovado pela Gestão
→ classes confirmadas
→ risco confirmado
→ segurança/EPI confirmada
→ observação técnica
→ Gestor que liberou
→ data/hora da liberação
```

O Gestor que liberou é obtido do histórico pelo evento `RISCO_CONFERIDO_E_RESIDUO_LIBERADO`.

## Responsabilidade

A validação final confirmou que armazenamento e despacho podem ser executados por outro Gestor, mantendo rastreabilidade correta.

---

# 6. Rótulo — regra validada

O Código SGL e o QR técnico existem desde a criação.

```text
INFORMADO / EM_ANALISE
→ visualizar prévia ✅
→ imprimir ❌

LIBERADO_PARA_ARMAZENAMENTO ou posterior
→ visualizar ✅
→ imprimir ✅
```

O texto da análise deixa claro que a confirmação **autoriza a impressão**, e não gera o Código SGL.

A tela bloqueia o botão e também evita impressão operacional pelo navegador antes da liberação.

Template final/Zebra continuam na Etapa 10.

---

# 7. Administração / Cadastros

Rota:

```text
/administracao/cadastros
```

Exclusiva de `ADMINISTRADOR`.

Áreas atuais:

```text
Laboratórios
Projetos
Produtos
Classes de Resíduo
Permissões
```

Produtos possuem recomendações estruturadas de segurança.

Classes de Resíduo possuem código, descrição, Unidade e ativação/inativação.

A Etapa 4 adicionará locais de armazenamento e Modelos de Resíduo.

---

# 8. Etapa 3 — fechamento

Validada em 17/09/2026.

```text
3.1 redundância de análise                       ✅
3.2 dados/classes/segurança/responsabilidade     ✅
3.3 prévia x permissão de impressão              ✅
```

Validações finais incluíram:

- criação;
- análise/liberação;
- armazenamento;
- despacho;
- uso de Gestores diferentes;
- histórico;
- classes e EPI;
- comparação informado/aprovado;
- prévia antes da liberação;
- bloqueio/liberação da impressão;
- Gestor que liberou;
- tamanho/legibilidade da tela.

**Etapa 3 encerrada.**

---

# 9. Etapa 4 — concluída e validada

A Etapa 4 foi reconciliada sobre a base atual e validada ponta a ponta.

```text
4.1 Locais de armazenamento cadastráveis              ✅
4.2 Modelos de Resíduo                                ✅
4.3 Uso de modelo ou preenchimento manual             ✅
4.4 Correções administrativas do ciclo de vida        ✅
```

Estado frontend consolidado:

- Administração → Cadastros expõe Modelos de Resíduo no bloco Resíduos;
- Informar Resíduo permite Manual ou Modelo;
- modelo apenas pré-preenche e não cria vínculo vivo com o Resíduo real;
- validações locais seguem o padrão visual aprovado em light/dark;
- cancelamento e retorno administrativo aparecem no histórico e nos dashboards adequados;
- Dashboard do Solicitante mostra somente eventos dos próprios Resíduos;
- Dashboard da Gestão combina movimentações de estoque e eventos operacionais de Resíduos da Unidade;
- cancelados são tratados em Meus Resíduos, Gestão, relatórios e rótulo.

A **Etapa 5 — Projetos e Atividades está concluída e validada**. A **Etapa 6 — Estagiários e vínculos** está em andamento; o backend dos blocos 6.1–6.4 está concluído e validado e o 6.5 foi implementado no frontend, aguardando validação visual/local.


## Decisões da Etapa 5 que afetam o frontend

```text
Projeto
→ SCI
→ Atividades
```

Projeto é o eixo operacional principal. Laboratório continua contexto/filtro e laboratório responsável, mas a interface não obriga mais o usuário a entrar em Laboratório para acessar Projeto.

## Decisão da Etapa 6 que afeta Estagiários e Pedidos

O Estagiário pode possuir múltiplas participações em Atividades, inclusive em Projetos/Laboratórios diferentes dentro da mesma Unidade.

```text
Estagiario
→ VinculoEstagio
→ participações
   ├── Atividade A → Projeto A → Laboratório A
   └── Atividade B → Projeto B → Laboratório B
```

Consequências para o frontend:

- não tratar `usuario.laboratorioId` como contexto operacional definitivo do Estagiário;
- no bloco 6.5, remover a legenda/atributo visual de um único "Laboratório do Estagiário";
- exibir Atividade/Projeto/Laboratório por participação;
- na evolução de Pedidos, o Estagiário escolherá uma participação/Atividade aberta;
- Projeto/Laboratório serão derivados pelo backend;
- Solicitante e Gestão continuarão exibindo o mesmo Pedido, vindo da mesma API/fonte de verdade.

Para solicitantes não Estagiários:

- TECNICO/ANALISTA/PESQUISADOR com Projeto escolhem o Projeto; o backend deriva o Laboratório;
- sem Projeto, o contexto base continua vindo de `Usuario.laboratorio`;
- a UI não deve oferecer Projeto e Laboratório como escolhas independentes quando o Projeto já determina o Laboratório.

Código SEG será exibido como dado institucional:

```text
Projeto   XX.XX.XX.XXX.XX.00
SCI       XX.XX.XX.XXX.XX.SS
Atividade XX.XX.XX.XXX.XX.SS.AAA
```

Nesta primeira versão, o código será cadastrado e validado pelo backend, não gerado automaticamente.

O CRUD atual de Projeto em Administração permanece funcional até o bloco **5.5 — Interface**, quando a experiência será reorganizada sobre os contratos estabilizados.

---

# 10. Etapas futuras

```text
Etapa 5 — Projetos + Atividades
Etapa 6 — Estagiários + vínculos
Etapa 7 — unidades + Soluções + contexto operacional
Etapa 8 — Pedidos + Soluções + participação do Estagiário
Etapa 9 — relatórios consolidados
Etapa 10 — rótulos + impressão operacional
Etapa 11 — Manual + delete lógico
Etapa 12 — testes automatizados frontend
Etapa 13 — revisão estrutural e legibilidade
```

Etapa 12:

```text
Vitest + Vue Test Utils
Cypress
```

Etapa 13 revisará classes grandes como `Residuo` no backend, Services, DTOs e Controllers, sem alterar comportamento e com reexecução dos testes.

---

# 11. Situação atual

```text
Etapa 1 — refinamento visual global                   ✅
Etapa 2 — Dark Mode definitivo                        ✅
Etapa 3 — refinamentos do fluxo atual de Resíduos     ✅ concluída e validada
Etapa 4 — expansão operacional de Resíduos            ✅ concluída e validada
Etapa 5 — Projetos e Atividades                       ✅ concluída e validada
Etapa 6 — Estagiários e vínculos                      ✅ concluída e validada
Etapa 7 — Unidades + Soluções + contexto operacional 🔧 atual
Etapas 8 a 13                                         ⏳
```

---

# 12. Regra final de retomada

**As Etapas 1–6 estão concluídas e validadas. A etapa atual é a 7 — Unidades + Soluções + contexto operacional. O frontend de Estagiários está estabilizado com Formação/Curso/treinamento por vínculo, Culturas por participação e Atividade/Projeto/Laboratório por contexto, sem um único laboratório como atributo definitivo do Estagiário.**

### Estado frontend do 4.4

Implementado na branch de reconciliação:
- status `CANCELADO` nas telas de Gestão, Solicitante e Relatórios;
- ações `Retornar etapa` e `Cancelar resíduo` visíveis apenas para Administrador;
- modal com justificativa obrigatória e erro local;
- histórico apresenta cancelamento e retorno administrativo;
- cancelados deixam de contar como resíduos ativos;
- dark mode integrado aos novos estados e ações.

Validação funcional integrada concluída; este bloco faz parte do fechamento da Etapa 4.

### Ajustes após validação do 4.4

- nomes internos dos status são humanizados inclusive para eventos históricos já gravados;
- dashboard do Solicitante consulta o histórico real dos seus Resíduos e inclui retorno administrativo/cancelamento em **Últimas atualizações**;
- cancelamento aparece como atualização crítica e retorno como movimentação de reavaliação;
- o Resíduo mais recente também considera a data de eventos do histórico administrativo.

Os ajustes foram revalidados e incorporados ao fechamento definitivo da Etapa 4.


### Fechamento do 5.5 — concluído e validado

Implementado na branch `collab/etapa-5-projetos-atividades`:

- nova rota operacional `/projetos` para Gestão/Administração;
- acesso direto no menu lateral, sem passagem obrigatória por Laboratório;
- listagem, busca e filtro de Projetos da Unidade;
- resumo de Projetos ativos, atrasados, concluídos e total;
- seleção de Projeto com painel de detalhes e hierarquia completa;
- SCI carregados por Projeto e Atividades agrupadas por SCI;
- exibição de Código SEG, status, situação, período, responsável e recurso externo;
- cadastro e edição de SCI diretamente no hub;
- cadastro e edição de Atividades diretamente no SCI;
- Código SEG e data de início bloqueados na edição comum conforme regras backend;
- mensagens orientando que aumento de prazo deve usar prorrogação;
- prorrogação de Projeto, SCI e Atividade integrada ao fluxo específico;
- correção administrativa de Código SEG integrada aos três níveis;
- usuário da sessão usado como operador temporário, compatível com o contrato atual;
- histórico visual de prorrogações e correções de Código SEG;
- formulário administrativo de Projeto atualizado com Código SEG, status, situação de execução e recurso externo;
- acesso rápido ao cadastro administrativo de Projetos para Administrador;
- interface responsiva e baseada nas variáveis visuais já usadas pelo light/dark mode.

O backend DEV ganhou massa idempotente específica da Etapa 5 para que a hierarquia seja visível mesmo em banco já existente. A massa inclui cenários no prazo, atrasado e concluído, com múltiplos SCI e Atividades.

Estado do bloco:

```text
5.5.1 Hub Projeto → SCI → Atividade                 ✅
5.5.2 CRUD operacional SCI/Atividade                 ✅
5.5.3 Cadastro administrativo de Projeto atualizado  ✅
5.5.4 Prorrogação + correção SEG + auditoria          ✅
5.5.5 Validação visual/integrada                      ✅
```

Validação da interface em execução confirmada em 29/09/2026. Etapa 5 encerrada.


### Decisão de interface — primeira definição do Código SEG

Confirmado durante a validação visual do 5.5:

- Projeto ainda sem Código SEG recebe sua **primeira definição** por `Administração > Cadastros > Projetos`;
- depois que o Código SEG existe, ele fica bloqueado na edição comum;
- alterações posteriores devem usar o fluxo administrativo **Corrigir SEG**, com justificativa e auditoria;
- o hub operacional de Projetos não oferece "Corrigir SEG" para Projeto ainda sem código, evitando misturar primeira definição com correção administrativa;
- esse comportamento foi aprovado para permanecer assim.

Também foi ajustada a escala tipográfica do hub `/projetos` para se aproximar das demais telas operacionais da Gestão, eliminando textos auxiliares excessivamente pequenos.


### Refinamentos de validação visual — hub de Projetos

Aplicados durante a validação da 5.5:

- filtro explícito por Laboratório adicionado ao bloco de pesquisa/filtros;
- contador duplicado removido do cabeçalho lateral de Projetos, mantendo o total apenas nos KPIs superiores;
- cards de SCI passaram a exibir identificação visual explícita **SCI**;
- Atividades passaram a ser renderizadas como blocos subordinados e visualmente recuados dentro de seu SCI;
- cada Atividade exibe identificação **ATIVIDADE** e a relação textual **Vinculada ao SCI: ...**;
- quantidade de Atividades permanece visível no bloco do SCI;
- tipografia continua baseada exclusivamente nos tokens canônicos do SGL.


### Sugestão assistida de Código SEG

Refinamento final da validação do 5.5:

- Projeto continua podendo existir sem Código SEG até sua primeira definição em Administração > Cadastros > Projetos;
- sem Código SEG no Projeto, o hub orienta a definir a raiz antes de criar SCI;
- ao abrir **Novo SCI**, o formulário sugere `maior sufixo SCI já utilizado + 1`;
- ao abrir **Nova Atividade**, o formulário sugere `maior sufixo da Atividade já utilizado no SCI + 1`;
- a sugestão considera a lista completa retornada pelo backend, inclusive registros inativos;
- o Código SEG sugerido permanece editável antes do primeiro salvamento, permitindo códigos institucionais avulsos;
- depois da criação, permanece a regra de imutabilidade no CRUD comum e correção somente pelo fluxo auditável;
- o selo visual **SCI** usa o mesmo padrão azul dos badges de status; Atividade permanece identificada em verde.


### Decisão futura — Central de Relatórios na Etapa 9

Após estabilização das Etapas 5 e 6:

- adicionar **Projetos** como relatório consolidado próprio;
- o relatório deve usar dados de Projeto/SCI/Atividade e, quando disponível, dimensões de vínculos/Estagiários da Etapa 6;
- **Movimentações** e **Resumo operacional** deixam de aparecer como opções separadas no seletor;
- a Central exibirá uma única opção **Movimentações**, com modos internos **Resumo** e **Detalhamento**;
- inicialmente, a interface pode continuar consumindo os endpoints atuais separados de movimentações e resumo operacional para evitar quebra de contrato;
- a síntese libera o espaço visual necessário para inserir **Projetos** sem aumentar a quantidade de opções principais.

Estrutura alvo do seletor:

```text
Estagiários
Produtos
Movimentações
Estoque e lotes
Resíduos
Fiscalização
Projetos
```

Estrutura interna de Movimentações:

```text
Movimentações
├── Resumo
└── Detalhamento
```


### Fechamento definitivo da Etapa 5

Confirmado em 29/09/2026 após validação funcional e visual.

Pontos finais aprovados:

- filtro por Laboratório;
- contador redundante removido da lista de Projetos;
- ação redundante de hierarquia removida;
- SCI e Atividades claramente diferenciados;
- SCI usa padrão azul dos badges do sistema;
- Atividades usam verde;
- sugestão assistida e editável de Código SEG;
- Projeto sem SEG continua com primeira definição via Cadastros;
- demais alterações SEG passam pelo fluxo auditável;
- decisões da futura Etapa 9 sobre Projetos e síntese Movimentações/Resumo registradas.

Após merge, a retomada deve ocorrer pela Etapa 6.


**Polimento final da interface principal:** tipografia geral da listagem/filtros/cards foi ampliada para melhorar leitura em zoom 100%. Os quatro cards-resumo ficam neutros por padrão e usam a cor correspondente apenas no hover, preservando as bolinhas como indicador permanente. Não há novas informações planejadas para a interface principal nesta rodada; próximos ajustes ficam restritos à validação visual e ao drawer.


### Ações operacionais iniciadas no drawer — 02/10/2026

- `Associar atividade` abre modal operacional e usa `POST /v1/vinculos-estagio/{vinculoId}/atividades`;
- `Registrar treinamento` usa o endpoint específico de conclusão de treinamento;
- `Gerenciar culturas` fica disponível nas participações ativas e substitui o conjunto de Culturas pelo endpoint específico;
- período da tabela/drawer mostra `início → fim original` e, quando o backend possui histórico de prorrogação, `Prorrogado até <nova data>`;
- vínculo sem qualquer participação continua `Não iniciado`; vínculo com participações históricas, porém nenhuma ativa, permanece no status institucional e informa `Sem atividade ativa`.
- tipografia e espaçamento interno do drawer/modais foram alinhados à referência madura de Resíduos.


### Modelo híbrido do vínculo — 02/10/2026

O drawer de Estagiários passou a permitir edição local de Formação, Curso, Bolsa/modalidade, Orientador e período. A integração institucional continua prioritária por campo: quando enviar um valor, ele prevalece; quando não enviar, o valor mantido no SGL permanece.

A ação `Editar vínculo` usa `PUT /v1/vinculos-estagio/{vinculoId}`. Vínculos finalizados permanecem somente leitura. Início e fim previsto são obrigatórios; a interface não permite salvar estágio sem término predeterminado.


### Projetos ↔ Estagiários após a Etapa 6

Refinamento futuro já decidido: no hub de Projetos, cada Atividade deverá mostrar também os Estagiários associados a ela, além do responsável já exibido. A informação deve vir das participações `VinculoEstagioAtividade`; não criar relação visual ou contratual artificial diretamente entre Projeto e Estagiário. Implementar somente após o fechamento da Etapa 6.


### Drawer consolidado do 6.5 — 02/10/2026

O drawer de Estagiários foi reorganizado para:

1. Ações operacionais;
2. Bolsa / Vínculo + histórico;
3. Formação;
4. Orientador;
5. Participações em Atividades;
6. Observações.

Refinamentos implementados:

- numeração/separadores de seção ampliados;
- treinamento integrado às Ações operacionais;
- conclusão/reversão de treinamento passa por modal de confirmação;
- observação opcional de treinamento aparece no histórico de Observações;
- Gestor/Admin pode adicionar observação operacional;
- observações existentes de vínculo e participação também aparecem no bloco;
- Participações ganharam tipografia maior;
- Gerenciar Culturas permite criar uma Cultura da Unidade sem sair do modal, selecionando-a para associação;
- `BOLSA / VÍNCULO` reúne bolsa vigente/último vínculo e histórico no mesmo card.

Implementação publicada, ainda pendente de validação manual/automática no 6.6.

### Polimento adicional do drawer 6.5 — 02/10/2026

Após a validação visual do drawer de Estagiários:

- corrigido o layout de `Participações em atividades`, que estava distribuindo os pares SCI/Projeto e Laboratório/Culturas em colunas incorretas e provocando sobreposição de textos;
- o `até` dentro do histórico/drawer deixou de usar negrito; o destaque permanece reservado à listagem principal;
- participações ativas agora oferecem `Editar participação`, `Gerenciar culturas` e `Encerrar participação`;
- `Editar participação` permite corrigir Atividade, data de início e observação, preservando as Culturas já associadas;
- `Encerrar participação` usa o fluxo histórico já existente e mantém a regra de não encerrar a última participação ativa enquanto o vínculo institucional estiver em andamento;
- o campo Curso do modal `Editar vínculo` ganhou `Outro / adicionar novo curso`; ao informar um novo nome, o frontend cria o registro no catálogo da Unidade e usa o novo Curso no vínculo;
- nenhuma migration adicional foi necessária para este polimento.

A validação final de build/suíte continua reservada ao bloco 6.6.

### Refinamento 6.5 — atividade e bolsa — 02/10/2026

- Ações operacionais agora incluem `Editar bolsa` e `Encerrar atividade`.
- `Editar vínculo` mostra Bolsa/modalidade somente para leitura.
- `Editar bolsa` recebe nova modalidade, data inicial e data final prevista; a ocorrência anterior permanece no histórico.
- `Encerrar atividade` pode ser acionado no topo do drawer ou no card da participação.
- participações ativas exibem como término previsto a data final da Atividade; quando ausente, usam a data final do Projeto em vez de mostrar apenas `atual`.
- nos selects de associação/edição, o contexto aparece como `Projeto: <nome>`.
- validação formal de build/suíte continua reservada ao 6.6.

### Correção do modal de Bolsa — 02/10/2026

- `Editar bolsa` agora oferece dois modos: `Prorrogar bolsa atual` e `Registrar nova bolsa`.
- prorrogação pede apenas a nova data final prevista e mantém a ocorrência vigente;
- nova bolsa pede modalidade, data inicial e data final prevista; a data inicial local pode ser hoje ou anterior;
- o grid das datas foi alinhado para manter os dois campos no mesmo eixo;
- o separador `até` dentro do card `Bolsa vigente` do drawer deixou de usar negrito, sem alterar o tratamento da interface principal;
- o fluxo de nova bolsa foi ajustado para aceitar corretamente a troca na data atual mesmo quando há participações registradas no ponto de corte.

### Fechamento da Etapa 6 — 02/10/2026

Validação funcional, visual e automatizada confirmada 100%.

Estado final:
- listagem e drawer consolidados;
- ações operacionais aprovadas;
- Bolsa/Vínculo com histórico, prorrogação, nova bolsa, especificação/referência e edição de referência vigente;
- Formação/Curso e Orientador integrados;
- múltiplas participações em Atividades;
- edição/encerramento de participação;
- Culturas por participação;
- observações e treinamento auditáveis;
- frontend pronto para merge da Etapa 6.

**Próxima frente: Etapa 7 — Unidades + Soluções + contexto operacional.**


---

## Etapa 7 — Inversão 7.4 / 7.5 e interface de Soluções (13/10/2026)

**Decisão do responsável:** antecipar a interface de Soluções para permitir validar, dentro do SGL, o fluxo de ida e volta usuário/gestor, sem depender de Postman. A Etapa **7.4 agora é Frontend de Soluções + smoke ponta a ponta**. O **contexto Projeto/SCI/Atividade passa para a 7.5**, após a verificação funcional. Etapas 7.6 e 7.7 permanecem posteriores.

**Backend:** catálogo de Soluções e tipo `Pedido.SOLUCAO` foram implementados na branch homônima; em 13/10 o responsável confirmou suíte verde e inicialização normal. **Teste de fluxo pela interface ainda não confirmado.**

**Frontend — primeira implementação na branch `collab/etapa-7-unidades-solucoes-contexto`:**
- módulo `src/modules/solucoes`: DTOs/tipos, serviço API, estilos e views dedicadas;
- usuário solicitante: `/minhas-solucoes`, `/solucoes/solicitar?nova=1`;
- gestor: `/solucoes` e `/solucoes/nova?nova=1`, com gestão de solicitações e do catálogo;
- menu e rotas integrados, filtros para que Soluções não poluam listagens convencionais de Pedidos;
- catálogo: criar, editar, inativar, ativar via edição, copiar composição de Pedido para modelo;
- fluxo: compor Solução com produtos e medidas; aprovação integral; `EM_PREPARACAO`; confirmar entrega; cancelar com/sem preparo e consulta de movimentações.

**A validar localmente:** `npm run build`, navegação nos dois perfis, chamadas REST com unidade correta, e teste de saldos antes/após aprovação, entrega e cancelamentos. Evitar merge antes da validação. **Margem de erro continua como extra futuro**, fora do escopo atual.

**Limites do MVP:** o solicitante acompanha o Pedido; o cancelamento operacional é confirmado pelo gestor, pois o backend ainda não possui entidade separada de "pedido de cancelamento". Identidade/autorização real permanece pendência de segurança para produção.


### Polimento da 7.4 — padrão visual de Resíduos e Cadastros (13/10/2026)

Após o primeiro teste da tela de Gestor com inicialização local bem-sucedida, o responsável pediu três correções:

- **Central de Soluções:** cards de status iguais em escala/organização aos da Central de Resíduos; filtros em **abas horizontais com contadores**, busca e tabela integrada na mesma superfície, em vez de botões avulsos.
- **Dark Mode:** refatoração de `src/modules/solucoes/styles/solucoes.css` para utilizar variáveis institucionais `--sgl-*`, com contraste e cores de status próprios do tema escuro; aplicação também ao solicitante, tabelas e modais.
- **Permissão e organização do catálogo:** os modelos reutilizáveis de **Resíduos e Soluções** passaram a ficar no mesmo conjunto em **Administração → Cadastros → Resíduos e Soluções**. `CadastrosAdminView.vue` contém a nova seção; `CatalogosResiduosSolucoesView.vue` alterna os dois editores; `ModelosSolucaoAdminView.vue` usa a apresentação dos modelos de Resíduos. A interface operacional de Soluções deixou de oferecer edição de catálogo. O Administrador pode **importar composição de uma solicitação** como modelo reutilizável dentro do módulo administrativo.
- O link de **Cadastros** no menu lateral da gestão foi habilitado para perfil `ADMINISTRADOR`. Compatibilidade de URL: `/administracao/cadastros/modelos-residuo` e `/administracao/cadastros/modelos-solucao` redirecionam ao agrupamento.

**Atenção:** essa alteração limita a navegação e os formulários à área administrativa, **mas NÃO fornece autenticação/autorização real de API**; o backend ainda usa `permitAll` temporário. Os endpoints de modelos deverão passar por verificação de permissões no backend no momento da implementação definitiva de identidade/acesso.

**Pendente:** executar `npm run build`, conferir light/dark na interface e realizar o fluxo de ponta a ponta. Não houve merge.


### Auditoria de identidade SGL — refatoração da 7.4 (13/10/2026)

O responsável apontou perda de identidade institucional nas implementações recentes. Auditoria feita contra:
`docs/IDENTIDADE_VISUAL.md`, `docs/PADRAO_VISUAL_PRE_PRODUCAO.md`, `docs/PADROES_PAGINA.md`, `docs/ETAPA_2_DARK_MODE.md`, `docs/ETAPA_1_3_COMPONENTES_BASICOS.md`, `src/styles/tokens.css`, `src/styles/foundation.css` e `src/components/common`.

**Regra obrigatória de continuidade:** consultar `docs/REGRA_PADRONIZACAO_NOVOS_MODULOS.md` antes de criar ou revisar telas. Novos módulos **não devem duplicar componentes Sgl ou criar linguagem CSS própria** quando o Design System já cobre a necessidade.

**Refatoração aplicada nesta rodada:** Central de Soluções reutiliza `SglBreadcrumb`, `SglButton`, `SglCard` e `SglStatusChip`; a tela do Solicitante passou a reutilizar `SglBreadcrumb`, `SglButton` e `SglStatusChip`; revisão parcial de `solucoes.css` para tokens institucionais, dimensões e contraste light/dark. Conferida estrutura de abertura/fechamento das tags Vue nas duas views.

**Restante ainda necessário:** migrar formulários `input/select` para `SglTextField/SglSelect` quando tecnicamente compatíveis; revisar o editor administrativo `ModelosSolucaoAdminView`, que reutilizou regras CSS locais provenientes da interface legada de modelos de Resíduos; conferir efeitos e modais à luz do guia oficial, revisar responsividade e tema. `npm run build` e inspeção visual **não executados** remotamente; etapa ainda **não** validada nem pronta para merge.


### 7.4 — Correção do fluxo de Solicitante, cartilha e separação de páginas (13/10/2026)

**Motivação:** imagens de teste revelaram que `Minhas soluções` e `Solicitar solução` carregavam a mesma View, contrariando o padrão consagrado em Pedidos/Resíduos. Usuário explicitou que o fluxo principal é **pedir uma preparação existente no catálogo/cartilha**, não redigir rotineiramente uma receita a partir de Produtos.

**Mudanças publicadas:**
- `SolucoesSolicitanteView.vue` agora é **apenas consulta/histórico**, com indicadores, tabela, detalhe, status e botão que navega à solicitação.
- Nova `NovaSolucaoView.vue`: tela independente de **Solicitar solução**, padrão de processo de Novo Pedido (contexto → seleção de solução → exigências/confirmação). A escolha de modelo padrão é o caminho principal; composição fora da cartilha é excepcional, com nome, componentes conhecidos e exigências de finalidade/concentração/volume. Produto e quantidade permanecem obrigatórios nessa excepcionalidade segundo contrato atual do backend.
- Rotas `/minhas-solucoes`, `/solucoes/solicitar` (Solicitante) e `/solucoes/nova` (Gestão) agora apontam para páginas corretas e distintas; após envio navega a `/minhas-solucoes?criado=1`.
- O modelo existente mantém `instrucoesPreparo` no cadastro. Ao escolher o modelo, a View apresenta a **cartilha e os componentes**. Ao atender, a Central de Soluções apresenta a mesma cartilha em detalhes do Pedido.
- **Backend correspondente:** migration `V38__snapshot_instrucoes_preparo_pedido_solucao.sql` + `Pedido.instrucoesPreparoSolucao` + resposta API; o `PedidoService` copia as instruções no momento da criação a partir do modelo vigente. Alterações posteriores no catálogo não reescrevem o histórico do Pedido. Solicitações excepcionais não recebem instruções padronizadas automaticamente.

**Limitações e pendências:** a opção excepcional ainda requer Produtos/quantidades, pois é o contrato vigente da 7.3; caso se queira solicitar uma preparação desconhecida sem saber ingredientes, isso exigirá estado/regra de análise antes da baixa de estoque (não criar itens fictícios). **Build frontend e testes Maven/boot com V38 não foram executados pelo assistente**; antes de validar, executar localmente, testar tela, aprovação e preservação da cartilha após editar o modelo.

**Merge:** não realizado.


### Padronização estrutural de "Solicitar solução" — 13/10/2026

O responsável comparou visualmente `NovoPedidoView.vue` (referência aprovada) com `NovaSolucaoView.vue` e confirmou que a simples substituição de cores/controles **não havia reproduzido a identidade SGL**.

**Correção aplicada no frontend:**
- `NovaSolucaoView.vue` foi reestruturada usando **a mesma composição** de `NovoPedidoView.vue`: área central limitada a 1180px, cabeçalho/botão de voltar, cartões de identificação do Solicitante/Laboratório, formulário principal com seções numeradas, superfície de itens, urgência no padrão de Pedidos, rodapé com mensagem e ação de envio.
- Mantidos os elementos específicos do domínio: Solução padrão da cartilha como opção principal; excepcional fora do catálogo; composição e instruções do modelo exibidas no próprio formulário; exigências e Projeto vinculados.
- O CSS scoped parte da estrutura de `NovoPedidoView.vue`, substituindo as cores literais por tokens `--sgl-*` e evitando sombra decorativa; preserva responsividade e tema claro/escuro.
- **Não alterar as regras de negócio por motivo visual**. A cartilha da Solução persiste como snapshot no backend (V38).

**Validação pendente:** executar `npm run build`, conferir visual claro/escuro lado a lado com Novo Pedido e testar envio. Não marcar como concluído ou realizar merge antes da revisão do responsável.


### Padronização "Minhas soluções" com "Meus pedidos" (13/10/2026)

Por solicitação expressa do responsável, a página `src/modules/solucoes/views/SolucoesSolicitanteView.vue` foi **reestruturada a partir da interface consolidada `MeusPedidosView.vue`**, replicando: largura central de 1260px, cabeçalho institucional, ação primária, três indicadores compactos, busca + filtro de status na mesma superfície, tabela administrativa de histórico, detalhe expansível com seta e painel de informações.

Diferenças de domínio mantidas: status `EM_PREPARACAO` (no lugar de `APROVADO`), identificação da preparação/modelo, componentes, **snapshot das instruções da cartilha**, exigências do pedido, rastreabilidade de cancelamento antes/depois do preparo. A busca foi limitada aos pedidos de Soluções do usuário, sem reaproveitar a lista de Pedidos comuns.

**Tema:** preservada a estrutura da tela de referência com ajustes de fundo/bordas pelos tokens do SGL para contraste no tema escuro. A composição foi copiada intencionalmente para manter a identidade, sem introduzir uma terceira linguagem.

**Validação local ainda necessária:** executar `npm run build`, comparar lado a lado com `Meus pedidos` nos temas claro/escuro e testar expansão/filtros/detalhes após gerar solicitação. Nenhum merge.


### 7.4 — Central de Soluções: identidade idêntica à Central de Resíduos (13/10/2026)

**Ajuste solicitado pelo responsável:** a tela operacional de gestão ainda apresentava divergências entre Light/Dark e o padrão de Resíduos. Remover o botão **+ Nova solicitação**: essa criação pertence ao fluxo do solicitante, não ao cabeçalho da Central de Gestão.

**Aplicado no frontend:** `SolucoesGestaoView.vue` passou a usar a **mesma fundação de layout e CSS existente em Resíduos** (`residuos-gestao-page residuos-completo`, `page-heading`, `breadcrumb`, `secondary-action`, `metrics-grid`, `workspace-card`, `status-tabs`, `toolbar`, `state-box`, `table-wrap` e classes de feedback), em vez de tentar emular visualmente os componentes com estilos específicos de Soluções. Isso aproveita as regras institucionais já implementadas em `src/styles/etapa-1-4-residuos.css` e `src/styles/etapa-2-gestao-residuos.css`, inclusive modos claro e escuro.

Os cinco cards são dimensionados com a única variante local `metrics-grid--solucoes`, preservando tamanhos, fontes, contrastes e espaçamentos dos cards de Resíduos. O cabeçalho mostra somente **Atualizar dados**. As ações de aprovar, entregar, rejeitar, cancelar e os detalhes dos pedidos permanecem.

**Pendente:** validação local de `npm run build` e inspeção comparativa tema claro/escuro; não afirmar que já está visualmente validado nem fazer merge.


### Ajuste transversal — solicitações de Gestor/Administrador sem vínculo pessoal ativo com laboratório (13/10/2026)

**Regra:** GESTOR/ADMINISTRADOR não precisa pertencer ao laboratório do Pedido, Solução ou Resíduo. A operação deve estar vinculada a **um laboratório ativo selecionado explicitamente**, na Unidade de contexto. Em Pedidos/Soluções esse é o destino; para Resíduo é a origem. Perfis solicitantes regulares seguem usando seu laboratório habitual. Projeto, quando informado, deve pertencer ao laboratório operacional selecionado.

**Frontend implementado:** helper `src/modules/operacao/services/laboratoriosOperacionais.ts`; seleção em `NovoPedidoView.vue`, `NovaSolucaoView.vue` e `InformarResiduoView.vue`. Ao trocar de laboratório, limpar e recarregar o Projeto; ao enviar, usar o laboratório operacional e não `session.usuario.laboratorioId`. Rota de Gestão `/residuos/informar`, com link no menu. Fluxo de retorno de nova Solução em Gestão ajustado para `/solucoes`.

**Backend implementado:** `PedidoService.validarConsistenciaPedido` e `ResiduoService.validarGeradorNoLaboratorio` dispensam igualdade com o laboratório pessoal para perfis GESTOR/ADMINISTRADOR, preservando validações de Unidade/tenant, laboratório operacional ativo e coerência com Projeto. As mudanças **não** autorizam laboratório inativo e **não** flexibilizam as regras dos solicitantes comuns.

**Validação pendente:** build frontend, Maven/testes backend, login com Gestor sem laboratório/ligado a laboratório inativo, seleção entre múltiplos laboratórios ativos da mesma Unidade, troca de Projeto, operação real dos três fluxos, isolamento cross-Unidade e regressão de solicitante comum. Não fazer merge antes da validação.


### Etapa 7.4 — Testes 1 e 2 validados; Teste 3 suspenso para padronização visual (13/10/2026)

**Confirmado pelo responsável:** Teste 1 (cadastro de modelo padrão) **validado**; Teste 2 (solicitação de Solução) **validado**, com observação visual: fonte da quantidade dos componentes estava grande. Reduzida a tipografia em `SolucoesSolicitanteView.vue`.

**Teste 3 (Gestão de Soluções) ainda NÃO validado.** O responsável identificou nova divergência do padrão do SGL, com ações múltiplas e status de contraste insuficiente na tabela.

**Ajustes frontend desta revisão:**
- Lista da Central de Soluções passa a seguir o padrão de **Central de Resíduos**: status com `status-pill` e contraste claro/escuro, apenas **uma ação primária por estado** na linha e clique no registro para expandir detalhes.
- Ações de rejeitar, cancelar e aprovação/entrega ficam agrupadas no painel expandido; redução da poluição visual na tabela.
- Modal de operações passa a usar `modal-backdrop`, `modal-card`, `modal-content` e rodapé com botões do padrão de Resíduos.
- Botão de confirmação deixa de ficar vermelho em aprovações/entregas e passa a usar aparência destrutiva apenas para rejeição/cancelamento.
- Estoque, regras de aprovação, cancelamento e API **não alterados** nesta revisão.

**Ainda não foram executados `npm run build` nem smoke visual/funcional local nesta rodada.** Revalidar Teste 3 com conferência da aprovação, modo claro/escuro, abertura do detalhe/modal e movimentações. Não fazer merge antes de validação.


### 7.4 — Auditoria integral corrigida no código, QA local pendente (13/10/2026)

O responsável autorizou solucionar os desvios da auditoria visual integral, conforme `docs/AUDITORIA_VISUAL_INTEGRAL_SOLUCOES_ETAPA_7_4_2026-10-13.md`.

**Correções publicadas:** CSS de Soluções reduzido para regras somente de domínio; Central baseada no template de Resíduos com ações acessíveis e modais padronizados; histórico alinhado a Meus Pedidos com cores/tamanhos institucionais; solicitação alinhada a Novo Pedido; catálogo de modelos com cores, raios, controles e modais vinculados aos tokens Light/Dark. Regras de Pedido/Estoque não alteradas nesta rodada.

**Validação:** testes funcionais 1 e 2 confirmados anteriormente pelo responsável. Teste 3 permanece pendente. O build e a verificação visual completa em Light/Dark/responsividade **não foram executados pelo assistente**. Sem merge.


### Teste 3 validado — simplificação da Central de Soluções (13/10/2026)

**Teste funcional 3 validado pelo responsável:** Pedido de Solução aprovado, componentes com movimentações de saída e entrega confirmada; observações de UX pendentes.

**Correções aplicadas:**
- Retirado botão **Analisar**. A tabela mostra apenas o botão de expansão por seta como em `Meus Pedidos`; o painel expandido contém ações pertinentes ao status.
- Eliminada a coluna redundante **Quantidade aprovada (canônica)** dos detalhes: Solução é aprovada como preparação integral. Exibir somente Produto e Quantidade necessária, mais cartilha e exigências do solicitante.
- No status `PENDENTE`, as opções são **Aprovar preparação** ou **Rejeitar**. Cancelamento não é apresentado ao gestor antes da aprovação.
- No status `EM_PREPARACAO`, as opções são **Confirmar entrega** ou **Cancelar preparação**. Este último pergunta se já houve preparo, determinando se devolve componentes ao estoque ou conserva consumo.
- Em `ENTREGUE`, `REJEITADO`, `CANCELADO` ficam só dados e rastreabilidade; sem ações operacionais adicionais.
- Novo chip `sol-status` e botão `sol-expand-button` seguindo tipografia, bordas, raios e tokens do SGL em Light/Dark.
- Sem alteração de API/serviços/estoque. A regra de cancelamento de pedido `PENDENTE` continua existindo no backend para demais fluxos; a gestão de Soluções simplesmente não a expõe.

**Regra terminológica:** *Rejeitar* = decisão da gestão sobre solicitação pendente, sem estoque retirado; *Cancelar* = interromper Solução anteriormente aprovada, verificando preparo físico e reversão possível. Não confundir rejeição com cancelamento.

**QA pendente:** build, rechecagem das ações e aparência dos detalhes/chip Light/Dark; não fazer merge.


### 7.4 — Solução avulsa rejeitada por contrato API (13/10/2026)

**Achado:** o formulário Fora do catálogo apresentava erro genérico "Um ou mais campos estão inválidos" mesmo com campos preenchidos. Causa: componentes com DTO de **Modelo** (`produtoId, quantidade, unidadeMedida`) eram enviados diretamente para endpoint de **Pedido**; API exige `produtoId, quantidadeSolicitada, unidadeMedidaSolicitada`. Além disso, backend requeria embalagem de Pedido comum, corrigido separadamente.

**Correção frontend:** `solucaoService.solicitar` converte os itens para o contrato de Pedido exclusivamente na requisição. Contratos de cadastro/edição dos Modelos permanecem inalterados. `erroSolucao` lê corretamente `ApiError.fieldErrors` (lista de objetos `{field, message}`) e prioriza mensagens específicas em vez do texto genérico.

**Testes necessários:** atualizar backend e frontend na branch; `mvn test`, `npm run build`, criar Solução excepcional com Produto unidade `REACAO` ou `ML` sem campos de embalagem, conferir PENDENTE e listagem; validar catálogo padrão e novo Pedido de Produtos como regressões. Nenhum merge.


### 7.4 — Status consolidado após os dois cancelamentos validados (13/10/2026)

**Registro mais recente, que substitui indicações anteriores de “Teste 3 pendente”:** o responsável confirmou seis cenários funcionais pela interface: cadastro de Solução padrão, solicitação padrão, aprovação/baixa/entrega sem segunda baixa, solicitação fora do catálogo, cancelamento antes do preparo com reversão e cancelamento após preparo mantendo consumo. **Fluxo operacional principal validado.**

A etapa **7.4 ainda não está formalmente encerrada**: resta confirmar os testes de regressão de Rejeição pendente, Pedidos comuns, edição/inativação de modelos e snapshots históricos, isolamento de Unidade e o build/testes automatizados na versão final. A matriz atualizada está em `docs/ETAPA_7_4_TESTE_FLUXO_SOLUCOES.md`.

**Roadmap:** 7.5 é contexto operacional (Projeto → SCI → Atividade); não iniciar merge sem autorização. Margem de erro segue adiada.


### 7.4 — Regressão funcional de Pedido comum confirmada

Após validar os sete cenários principais de Soluções (incluindo rejeição pendente), o responsável confirmou **VALIDADO** o teste de regressão do fluxo convencional de Pedido de Produtos: solicitação com forma de retirada, aprovação e recebimento sem dupla baixa de estoque.

Continuam pendentes antes do encerramento formal: edição/inativação de catálogo com preservação dos snapshots históricos, promoção de avulsa quando pertinente, isolamento entre Unidades/perfis e comprovação atualizada de builds e suíte. Não houve merge nesta confirmação.


### 7.4 — Histórico e inativação dos modelos validados (14/10/2026)

O responsável confirmou **VALIDADO** o teste do catálogo: editar nome/quantidades/instruções de um Modelo padrão, preservar composição e cartilha de solicitações antigas, refletir a receita editada em nova solicitação e inativar o modelo ocultando-o de novos pedidos sem alterar histórico. O ciclo principal, rejeição, os dois cancelamentos e regressão dos Pedidos comuns já haviam sido validados.

**Pendências antes de declarar a 7.4 encerrada:** promoção explícita de Pedido avulso ao catálogo, isolamento entre Unidades/perfis, testes/build finais e inspeção Light/Dark. Não houve merge.


### 7.4 — Importação administrativa de Solução avulsa validada (14/10/2026)

O responsável confirmou **VALIDADO** o cenário de importar uma solicitação personalizada para novo Modelo no catálogo administrativo, com composição reutilizável e preservação do Pedido original e suas movimentações. Os testes anteriores incluem pedido/entrega, rejeição, cancelamentos antes/depois do preparo, regressão de Pedido comum, edição e inativação com snapshots preservados.

**Últimas conferências da 7.4:** isolamento entre Unidades e perfis (separar verificação de navegação no frontend de autorização real na API), suíte e build finais e QA de interface. Não houve merge.


### 7.4 — Visão unificada de Pedidos e Soluções na Gestão (14/10/2026)

**Achado pelo responsável na validação multitenant do IB:** o painel mostrava 1 Pedido pendente e a listagem de Pedidos também 1, enquanto os alertas do menu mostravam 2 pendentes (Pedido de Produtos + Pedido de Solução). **Causa confirmada no código:** `pedidoService.listarTodos()` filtra `tipo !== 'SOLUCAO'`, mas `gestaoShellService.listarPedidosPendentes()` consulta diretamente `/v1/pedidos/por-status` sem filtrar tipo. O backend já representa Solução como subtipo de Pedido.

**Decisão aplicada no frontend:** unificar **consulta/visibilidade**, não misturar **operações**.
- `pedidoService.listarTodosComSolucoes()`: consulta todos os pedidos; enriquece apenas Pedidos convencionais com metadados de embalagem e risco, sem aplicar regras de embalagem a Soluções.
- `DashboardGestaoView`: contadores pendentes/urgentes e resumo por laboratório incluem Produtos + Soluções. Links de atenção urgente direcionam Soluções à Central especializada.
- `PedidosGestaoView`: lista completa, filtro Tipo (Todos/Produtos/Soluções), status `EM_PREPARACAO`, chip de tipo e painel de leitura de componentes/cartilha da Solução; botão **Abrir na Central de Soluções**. Operações convencionais de aprovar/rejeitar/cancelar/entregar continuam exclusivas de Pedidos de Produtos; três handlers têm guard adicional para Soluções.
- `SolucoesGestaoView`: aceita query `pedido=id` e expande/posiciona a Solução para navegação direta.
- `GestaoLayout`: alertas especificam quantos Pedidos de Produtos e quantas Soluções estão pendentes; clique leva à lista unificada. Busca global diferencia rótulo Solução; subnavegação inclui Em preparação.
- `StatusPedido`: enum de exibição compartilhado recebe `EM_PREPARACAO`; mapas de rótulo dos dois componentes de solicitante atualizados para manter tipagem íntegra. O frontend do solicitante continua com **Meus pedidos** e **Minhas soluções** separados, preservando seus fluxos anteriores.

**Sem alterações de API, banco ou regra de estoque.** Correção ainda exige `npm run build` e smoke local: IB (1 Pedido comum + 1 Solução pendente) deve mostrar **2** no Dashboard, **2** no Alerta e **2** em Pedidos/Todos; filtros por tipo devem retornar 1 cada no exemplo. Expandir Solução não deve apresentar campos de embalagem ou controles de aprovação de Produto; CTA deve abrir registro específico na Central. Verificar status EM_PREPARACAO, Urgentes, tema Light/Dark e ausência de regressão em aprovação comum. **Sem merge.**


### 7.4 — Validação da visão unificada confirmada (14/10/2026)

**Confirmação do responsável:** após atualizar e testar localmente, a integração de **Pedidos convencionais e Soluções** em `Pedidos`, `Dashboard` e `Alertas operacionais` foi considerada **VALIDADA**; a experiência integrada foi aprovada. Registra-se também o comportamento de **Solução urgente em Precisa de atenção**, que, pelo código atual, inclui Soluções pendentes e urgentes e as direciona à Central de Soluções.

**Delimitação essencial:** o quadro `Últimas movimentações` **ainda não apresenta o histórico administrativo completo de transições** de Pedidos/Soluções. Ele atualmente combina movimentações físicas de estoque e histórico de Resíduos. Aprovação de Solução com saída física e reversões podem aparecer como movimentações de estoque; rejeição, entrega e cancelamento após preparo não geram necessariamente movimentação física e não devem ser tratados como eventos já exibidos. Foi **proposta**, mas NÃO implementada nem validada, a evolução desse quadro para `Últimas atividades operacionais` com histórico datado e auditável das decisões. Preservar as transições com datas reais, sem inventar eventos retrospectivos.

**Status de fechamento 7.4:** fluxos principais de Soluções e regressão convencional previamente validados; visão unificada confirmada. **Ainda falta** teste específico de isolamento entre Unidades/perfis e comprovação final de build/suíte/QA técnico. Não fazer merge sem autorização expressa.


### Fechamento da 7.4 por aceite funcional e passagem à 7.5 — 14/10/2026

**Autorizado pelo responsável:** encerrar a implementação/validação funcional da **7.4 — Soluções**, confirmar o roadmap antes de começar a 7.5. O encerramento decorre das confirmações de todos os fluxos principais de Soluções, cadastro/edição/inativação/importação de modelos e snapshots, solicitação padrão/fora catálogo, aprovação/rejeição/entrega/cancelamentos, regressão de Pedidos comuns e visão unificada com Dashboard/Alertas. **Status: 7.4 encerrada por aceite funcional.**

**Conferências técnicas não atestadas no aceite, repassadas para 7.6/7.7:** `npm run build` e `mvn test` finais na versão consolidada, QA completo de Light/Dark/responsividade, isolamento entre Unidades/perfis e testes de regressão complementares. O teste anterior de usuário IB foi interrompido por uma divergência de contagem, resolvida e validada na interface; isso **não** comprova isolamento entre IB/IQ nem autorização real na API. A ausência de principal autenticado/backend `permitAll` é risco de segurança de pré-produção, não pode ser considerada resolvida na 7.4.

**Histórico operacional:** o quadro `Últimas movimentações` permanece baseado em movimentações físicas do estoque e histórico de Resíduos; a ideia de exibir decisões administrativas (incluindo rejeição, confirmação de entrega e cancelamento após preparo) em `Últimas atividades operacionais` **não foi implementada**. Registrar como refinamento futuro com eventos reais/auditáveis, sem inventar dados históricos.

**Próximo escopo:** `7.5 — Contrato de contexto operacional Projeto/SCI/Atividade`, com participações ativas de Estagiários e derivação coerente de Projeto/Laboratório/Unidade, sem antecipar todas as mudanças em Pedidos da Etapa 8. Depois: 7.6 massa DEV/DEMO + testes; 7.7 consolidação/QA/documentação. Sem merge; aguardar confirmação do roadmap antes da implementação.


### Início técnico da 7.5 — auditoria das telas e contrato de contexto (14/10/2026)

**Roadmap confirmado e 7.5 iniciada.** Auditoria das telas `NovoPedidoView.vue`, `NovaSolucaoView.vue`, `ProjetosGestaoView.vue`, `EstagiariosGestaoView.vue` realizada. O desenho frontend e seu checklist de aceite estão em **`docs/ETAPA_7_5_MAPA_IMPLEMENTACAO_FRONTEND.md`**; o contrato técnico do backend em `gbsalermo/Sistema-SGL/docs/ETAPA_7_5_AUDITORIA_E_CONTRATO_CONTEXTO_OPERACIONAL.md`.

**Achados:** Estagiários já exibem a origem por participação Atividade/SCI/Projeto/Laboratório na gestão. Novo Pedido/Nova Solução ainda tomam laboratório da sessão para não Gestores, em vez de contexto por participação ou Projeto; a correção efetiva de Payload de Pedido é Etapa 8. O hub de Projetos ainda não exibe participantes da Atividade. **Próximo:** preparar camada read-only de contexto elegível e adicionar participantes no hub quando a consulta tenant-safe estiver disponível; preservar tema visual e os fluxos aprovados 7.4. Nenhum código funcional alterado nesta primeira auditoria; nenhum merge.


### 7.5.1 — Contrato backend preparado; integração frontend aguarda 7.5.2 (14/10/2026)

O backend adicionou uma política pura de **elegibilidade do contexto operacional de Estagiário**, separando “participação aberta/histórica” de “elegível para nova solicitação”. A assinatura preparada é `ElegibilidadeContextoOperacional.avaliar(participacao, dataReferencia, unidadeSolicitante)`, com resultado booleano e motivo determinístico; não depende do `Usuario.laboratorio` legado. Foram acrescentados testes unitários de períodos, Unidade/tenant, hierarquia e múltiplas participações em diferentes Laboratórios.

**Ainda não existe API de consulta de contextos na branch nem campos novos em Pedido/Solução**; frontend permanece inalterado. Próxima integração após 7.5.2: consumir DTO read-only e mostrar participantes por Atividade no hub Projetos (7.5.3), mantendo visual SGL, sem quebrar Pedidos/Soluções homologados na 7.4. Não criar UI que infira elegibilidade apenas de `dataFimParticipacao == null`. Sem merge.


### 7.5.2 — Backend da consulta de participantes publicado (14/10/2026)

O backend agora possui três endpoints read-only preparados para o frontend: `GET /v1/contextos-operacionais/usuarios/{usuarioId}`, `/atividades/{atividadeId}/participacoes` e `/projetos/{projetoId}/participacoes` (relativos ao prefixo HTTP `/api`). O retorno `ContextoOperacionalResponseDTO` distingue participação `aberta` de `elegivel`, informa motivo e deriva Atividade, SCI, Projeto, Laboratório e Unidade. Consulta de Projeto é em lote e permite exibir várias Atividades sem uma requisição por card.

**Etapa 7.5.2 publicada, não validada ainda em JUnit/boot/HTTP.** A 7.5.1 teve JUnit e boot confirmados pelo responsável. **Nenhuma interface foi alterada nesta 7.5.2.** A 7.5.3 será o hub Projetos com estagiários por Atividade (atuais e históricos), após backend verde. Não usar apenas `aberta` como sinal de elegibilidade. Endpoint DEV ainda não tem autorização real; uso em produção depende da fase de segurança. Sem merge.


### 7.5.3 — Estagiários vinculados ao hub de Projetos (14/10/2026)

O responsável confirmou **"subiu verde"** após os testes/boot da 7.5.2. Com base nesse aceite, publicada a implementação frontend da **7.5.3**, ainda **não validada em build e smoke visual**.

Alterações:
- `src/modules/projetos/types/projetos.ts`: tipo `ContextoParticipacaoOperacional` espelhando o DTO backend;
- `src/modules/projetos/services/projetosService.ts`: `listarParticipacoesProjeto(projetoId)`, chamada única à API `/v1/contextos-operacionais/projetos/{projetoId}/participacoes`;
- `src/modules/projetos/views/ProjetosGestaoView.vue`: cada Atividade possui seção expansível **Estagiários vinculados** com contadores de **participações abertas (atuais)** e **histórico de participações encerradas**; lista participantes, início/fim, elegibilidade e motivo de inelegibilidade. Contagem de abertos deduplica por usuário na mesma Atividade; histórico mantém registros distintos. Busca por Projeto com proteção contra seleção assíncrona defasada. Se a consulta de participantes falhar, a hierarquia Projeto/SCI/Atividade permanece disponível e a seção exibe erro real, sem fabricar contagem 0. Layout com tokens SGL e ajuste mobile.

**Limites:** participação aberta `aberta=true` não significa contexto elegível; a UI não permite associar/encerrar participantes nem cria novas relações. Nenhuma alteração em Pedido/Solução. O serviço é read-only e a API DEV depende de filtro por tenant temporário, não equivalendo à autorização real. Pedir `npm run build` e smoke local, depois concluir 7.5.3; nenhum merge.


### Aceite funcional da 7.5.3 e polimento das datas de participação — 15/10/2026

O responsável confirmou expressamente **a 7.5.3 como validada** ao solicitar o refinamento da data final na Gestão de Estagiários. A confirmação refere-se à visualização de Estagiários por Atividade no hub de Projetos; os testes técnicos transversais não foram presumidos.

**Polimento implementado nesta mesma branch e aguardando validação local:** `src/modules/estagiarios/views/EstagiariosGestaoView.vue` deixou de concatenar `dataInicioParticipacao até (dataFimParticipacao || atividadeDataFim || projetoDataFim)`, apresentação que confundia encerramento real com prazo institucional. Cada card agora mostra três campos distintos: **Início da participação** (ou **Início programado**, se futura), **Prazo da Atividade/Projeto** (referência planejada, sem inferir encerramento) e **Encerramento efetivo** (`dataFimParticipacao`, ou **Não registrado** quando aberta). Em participação futura, o estado visual indica **Início programado** sem alterar o campo de persistência `ativa`. Os modais Associar/Editar explicam que datas futuras são permitidas, respeitando as validações existentes; modal de encerramento diferencia a data efetiva do prazo previsto. Grid responsivo e tokens existentes para os novos cards. Sem alteração de backend, regras do estágio ou payload de Pedidos/Soluções.

**Regra conferida em código:** o cadastro e a edição permitem escolher `dataInicioParticipacao` futura, desde que início >= início do vínculo/Atividade, e não ultrapasse fim previsto do vínculo nem limite fim Atividade/Projeto. A elegibilidade 7.5.1 bloqueia nova solicitação enquanto a participação não começa.

**Validação solicitada:** `npm run build`; tela Gestão → Estagiários → Participações, conferir 1) atividade com fim, 2) somente projeto com fim, 3) sem prazo, 4) encerramento efetivo, 5) início futuro e edição, 6) temas Light/Dark e responsividade. **A validação da 7.5.3 prévia não implica aceite automático deste polimento.** Sem merge; próxima 7.5.4 após smoke.


### 7.5.4 — Biblioteca comum de contexto operacional e handoff para Etapa 8 (15/10/2026)

**Confirmação do responsável:** etapa 7.5.3 (Estagiários no hub de Projetos) foi validada; após ajuste direto no botão **Salvar referência**, o usuário confirmou **"feito... vamos voltar ao fluxo"**. Aceitar o polimento pontual, sem presumir build final ou QA completa de Light/Dark.

**Entregue na 7.5.4:**
- `src/modules/operacao/types/contextoOperacional.ts`: fonte compartilhada de `ContextoParticipacaoOperacional` e funções puras `prepararSelecaoContextoEstagiario` e `resolverContextoEstagiario`; retorno 0 `SEM_CONTEXTO_ELEGIVEL`, 1 `PRE_SELECIONAVEL`, N `ESCOLHA_OBRIGATORIA`.
- `src/modules/operacao/services/contextoOperacionalService.ts`: 3 consultas read-only ao backend (por usuário, Atividade ou Projeto); atenção à autorização por titularidade, ainda não implementada em DEV.
- `src/modules/projetos/types/projetos.ts`: reexporta o tipo do módulo Operação para compatibilidade.
- `src/modules/projetos/services/projetosService.ts`: mantém `listarParticipacoesProjeto`, mas delega ao serviço compartilhado; hub Projetos continua com contrato de chamada inalterado.
- Detalhes e próximo checklist em `docs/ETAPA_7_5_MAPA_IMPLEMENTACAO_FRONTEND.md`. Contrato canônico de backend para Etapa 8 em `gbsalermo/Sistema-SGL/docs/CONTRATO_CONTEXTOS_PEDIDOS_ETAPA_8.md`.

**Não alterados:** `NovoPedidoView.vue`, `NovaSolucaoView.vue`, DTOs/migrations de Pedido, ações de estoque. **Não ligar seleção a Pedido até o backend revalidar/persistir participação na Etapa 8.**

**Próxima verificação (um passo por vez):** `npm run build` no frontend atualizado. Após build verde + regressão mínima no hub, registrar aceite da 7.5.4 e avançar à 7.6. QA transversal ainda devida em 7.7, autorização definitiva antes de produção, nenhum merge sem autorização expressa.


### Fechamento funcional da 7.5 após build verde — 15/10/2026

O responsável executou `npm run build` após atualizar a branch e confirmou **"agora foi"**, validando o build frontend da **7.5.4**. O primeiro build falhou com TS2339 em `CadastrosAdminView.vue:881` por `codigoSeg` e `status` serem usados na linha de **Laboratório** (que não define esses campos). Correção final: linha de Laboratórios voltou a exibir nome/descrição; linha de Projetos exibe SEG/status/descrição, commit frontend `f7dfc79`. **Build verde confirmado pelo responsável**, não executado nesta sessão.

**7.5 concluída em implementação e aceita funcionalmente:** 7.5.1 elegibilidade; 7.5.2 consultas; 7.5.3 hub de Estagiários vinculados por Atividade (aceite expresso); 7.5.4 cliente/tipos e seleção preparada no módulo `operacao`, sem modificar Pedidos/Soluções existentes. A integração do `participacaoId` ao Pedido permanece **Etapa 8**, após validação backend da escolha da participação. Detalhes em `docs/ETAPA_7_5_MAPA_IMPLEMENTACAO_FRONTEND.md` e `gbsalermo/Sistema-SGL/docs/CONTRATO_CONTEXTOS_PEDIDOS_ETAPA_8.md`.

**Próximo bloco:** 7.6 massa DEV/DEMO e regressões de Produtos/Soluções/Estagiários/Projetos, suíte e boot final. QA cross-tenant/perfis, responsividade Light/Dark e segurança real ainda não foram considerados homologados. **Sem merge.**


### Início da 7.6.0 — auditoria de Pedidos fracionados e padrão SGL (15/10/2026)

Por decisão do responsável, a **7.6.0 vem antes de 7.6.1/7.7** para alinhar o Pedido convencional ao estoque físico 7.1/7.2. Antes de tocar na interface, foi feita revisão das decisões e do backend (unidade canônica, decimais, lote, recipiente, FEFO/FIFO, rastreio, concorrência, devolução) e das regras visuais atuais (fonte Inter, tokens, componentes Sgl*, dimensões, light/dark, modais, microinterações). Resultados em `docs/ETAPA_7_6_0_AUDITORIA_FRONTEND_PADRAO_VISUAL_PEDIDOS.md` e no backend `docs/ETAPA_7_6_0_AUDITORIA_CONTRATO_PEDIDOS_ESTOQUE_FISICO.md`.

**Lacunas confirmadas:** NovoPedido usa inteiro de embalagens (`quantidadeForma` min=1), estimativa de embalagens pela quantidade agregada do Lote, enum de apresentação desatualizado e falta unidade física; PedidosGestao exige `Number.isInteger`/input min=1. A mudança precisa de contrato backend para diferenciar embalagem completa/lacrada e volume/massa fracionado, sem confiar na UI. **Evitar replicar FEFO/FIFO no navegador.**

**Risco visual existente:** `src/styles/main.css` possui overrides globais de Pedidos com cores claras e `!important`, textos operacionais de 6,5–7,5px, além de CSS locais. Preferir adaptar os arquivos de origem e tokens oficiais; usar `src/components/common` em vez de classes paralelas. Dark não atinge Login. Efeitos devem continuar discretos, com blur no backdrop e modal nítido.

**Estado:** auditoria e documentação publicadas, **sem alterações funcionais de Vue/CSS/DTO/Backend nesta rodada**, `npm run build` não executado. Próximo passo de implementação após contrato backend mínimo e testes do modo de retirada. Sem merge.


### Retificação contratual da 7.6.0 — priorização física já definida (15/10/2026)

Após a leitura do contrato original de Estoque §9.9/§9.13 (`Sistema-SGL/docs/CONTINUIDADE_ETAPA_7_2026-10-06.md`), o responsável apontou corretamente que não há motivo para decidir novamente a seleção física: **FEFO/FIFO entre lotes, FECHADOS para apresentações completas, ABERTOS para frações, novas aberturas apenas na falta de saldo apropriado e minimização de recipientes parcialmente abertos em pedidos grandes**. Exemplos já aprovados: 500 mL → 1 FECHADO; 200 mL → ABERTO; 700 mL → 500 FECHADO + 200 ABERTO, sempre no lote de precedência superior.

`docs/ETAPA_7_6_0_AUDITORIA_FRONTEND_PADRAO_VISUAL_PEDIDOS.md` corrigido: apresentação física e quantidade decimal são **formas de informar a solicitação**; não significam criação de nova política física ou promessa automática de recipiente lacrado. O frontend só exibe e transmite a intenção e a unidade; `MovimentacaoEstoqueService` decide recipientes de forma transacional. Próximo trabalho é adequação mínima do request e UI de Pedidos, com regressão de FEFO/FIFO e tema visual SGL. **Sem modificação funcional nesta retificação, sem merge.**
