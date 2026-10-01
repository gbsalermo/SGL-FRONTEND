# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 24/09/2026  
**Branch estável:** `main` do GitLab institucional  
**Branch histórica da Etapa 4:** `feat/etapa-4-residuos` — referência; não mergear integralmente  
**Branch atual de trabalho:** `collab/etapa-5-projetos-atividades`  
**Etapa concluída:** Etapa 5 — Projetos e Atividades ✅  
**Próxima etapa:** Etapa 6 — Estagiários e vínculos ⏳  
**Etapa 4:** 4.1–4.4 reconciliados e validados ponta a ponta ✅
**Plano canônico:** `gbsalermo/Sistema-SGL/docs/PLANO_PRE_PRODUCAO.md`  
**Handoff da etapa atual:** `gbsalermo/Sistema-SGL/docs/CONTINUIDADE_ETAPA_5_2026-09-24.md`

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

A **Etapa 5 — Projetos e Atividades está concluída e validada**. A próxima etapa é **Etapa 6 — Estagiários e vínculos**.


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
Etapa 7 — relatórios consolidados
Etapa 8 — unidades + Soluções + contexto operacional
Etapa 9 — Pedidos + Soluções + participação do Estagiário
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
Etapa 6 — Estagiários e vínculos                      🔧 em andamento
Etapas 7 a 13                                         ⏳
```

---

# 12. Regra final de retomada

**As Etapas 1–5 estão concluídas e validadas. A Etapa 6 está em andamento na branch `collab/etapa-6-estagiarios-vinculos`. O frontend integrado do 6.5 deve refletir participações/Atividades como contexto operacional do Estagiário, sem apresentar um único laboratório como atributo definitivo.**

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


### Decisão futura — Central de Relatórios na Etapa 7

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
- decisões da Etapa 7 sobre Projetos e síntese Movimentações/Resumo registradas.

Após merge, a retomada deve ocorrer pela Etapa 6.
