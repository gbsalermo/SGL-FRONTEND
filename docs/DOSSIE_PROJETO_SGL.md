# Dossiê do Projeto SGL — Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend:** `gbsalermo/Sistema-SGL`  
**Atualizado em:** 18/09/2026  
**Estado:** primeiro protótipo funcional aprovado; Etapas 1, 2 e 3 concluídas; Etapa 4 implementada e aguardando validação integrada.  
**Branch atual:** `feat/etapa-4-residuos`.

Este documento resume o estado real do frontend para retomada humana ou por IA.

## Checkpoint atual

```text
Etapa 1 — padrão visual global              ✅ concluída
Etapa 2 — Dark Mode definitivo              ✅ concluída
Etapa 3 — refinamentos do fluxo de Resíduos ✅ concluída e validada
Etapa 4 — expansão operacional de Resíduos  ✅ implementada; validação pendente
  4.1 — locais de armazenamento             ✅
  4.2 — Modelos de Resíduo                  ✅
  4.3 — modelo ou preenchimento manual      ✅
  4.4 — correções administrativas           ✅
```

O plano canônico está no backend em `docs/PLANO_PRE_PRODUCAO.md` e o handoff atual em `docs/CONTINUIDADE_ETAPA_4_2026-09-17.md`.

---

# 1. Ordem de precedência

```text
1. código da main / branch atual validada
2. Swagger/OpenAPI do backend
3. ../CONTINUIDADE.md
4. backend: docs/PLANO_PRE_PRODUCAO.md
5. backend: docs/CONTINUIDADE_ETAPA_4_2026-09-17.md
6. este DOSSIE_PROJETO_SGL.md
7. documentos específicos de decisão/módulo
8. documentos históricos
```

Fonte de rotas: `src/router/index.ts`.

---

# 2. Stack

```text
Vue 3.5
Vite 8
TypeScript 5.9
Vue Router 5
Pinia 4
Axios
Vuetify 3
Node >= 20.19
```

Diretrizes:

- interface em português;
- UUID público nas fronteiras com a API;
- Axios concentrado em `services`;
- Pinia para estado compartilhado;
- regras de negócio críticas permanecem no backend;
- eventual refactor técnico para inglês não altera a linguagem da interface.

---

# 3. Estado executivo

```text
Login visual / sessão DEV                         ✅
Expiração de sessão DEV                           ✅
Pedidos Solicitante/Gestão                        ✅
Estoque / lotes                                   ✅
Movimentações                                     ✅
Relatórios / fiscalização                         ✅
PDF/XLSX                                          ✅
Resíduos Solicitante/Gestão                       ✅ Etapa 4 implementada
Modelos de Resíduo / Administração                ✅
Modelo ou preenchimento manual                    ✅
Cancelamento/retorno administrativo               ✅
Classes de Resíduo                                ✅
Segurança/EPI                                     ✅
Prévia antecipada do rótulo                       ✅
Impressão condicionada à liberação                ✅
Rótulos Produto/Resíduo                           ✅ base funcional
Estagiários                                       ✅ base atual
Pessoas por laboratório                           ✅
Administração/Cadastros                           ✅
Dashboard Gestão                                  ✅
Dashboard Solicitante                             ✅
Alertas operacionais                              ✅
Busca global                                      ✅
Tema claro/escuro + persistência                  ✅
404                                               ✅
Contexto de Unidade enviado à API                 ✅
Autenticação/autorização definitiva               ⏳
Integração corporativa                            ⏳
```

---

# 4. Perfis e experiências

```text
ADMINISTRADOR
GESTOR
TECNICO
ANALISTA
PESQUISADOR
ESTAGIARIO
```

Agrupamento:

```text
GESTÃO → GESTOR + ADMINISTRADOR
ADMINISTRAÇÃO → ADMINISTRADOR
SOLICITANTE → TECNICO + ANALISTA + PESQUISADOR + ESTAGIARIO
```

Rota inicial:

```text
GESTOR / ADMINISTRADOR → /dashboard
TECNICO / ANALISTA / PESQUISADOR / ESTAGIARIO → /inicio
```

Guardas de router são UX/navegação e não substituem autorização real no backend.

---

# 5. Rotas atuais

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
/estagiarios
/residuos
/relatorios
/relatorios/residuos
/relatorios/pessoas-laboratorio
/administracao/cadastros
/solicitacoes/novo
/solicitacoes/meus-pedidos

RÓTULOS
/residuos/:id/rotulo
/produtos/:id/rotulo

SISTEMA
/:pathMatch(.*)*
```

---

# 6. Sessão DEV e multitenancy

A sessão DEV expira em 5h e mantém contexto de Unidade/Laboratório. `src/services/http.ts` envia:

```text
X-SGL-Unidade-Id: <unidadeId>
```

O backend usa o header para `TenantContext` e isolamento funcional. Isso não é fronteira definitiva de segurança.

---

# 7. Pedidos e Estoque

Regras oficiais permanecem no backend:

```text
criação → não baixa estoque
aprovação → baixa estoque
entrega → não baixa novamente
cancelamento aprovado → restaura lotes utilizados
perecível → FEFO
não perecível → FIFO
urgência → não altera FIFO/FEFO
```

Lotes continuam contextuais a Estoque e não viram módulo principal separado.

---

# 8. Resíduos — estado final da Etapa 3

```text
Produto != Resíduo
```

Rotas:

```text
Solicitante
/residuos/novo
/meus-residuos

Gestão
/residuos

Rótulo
/residuos/:id/rotulo

Relatório
/relatorios/residuos
```

Fluxo:

```text
INFORMADO
→ EM_ANALISE
→ LIBERADO_PARA_ARMAZENAMENTO
→ ARMAZENADO_TEMPORARIAMENTE
→ DESPACHADO
```

A Etapa 3 consolidou:

- `processoOrigem` como Procedência/uso;
- estado físico;
- tratamento;
- Classes de Resíduo informadas/confirmadas;
- Segurança/EPI informada/confirmada;
- sugestões vindas de Produto;
- comparação informado x aprovado;
- Gestor que liberou via histórico;
- armazenamento/despacho por Gestores diferentes;
- Código SGL e QR técnico desde a criação;
- prévia disponível em `INFORMADO` e `EM_ANALISE`;
- impressão bloqueada até `LIBERADO_PARA_ARMAZENAMENTO`;
- ajuste de escala para uso em 100% de zoom.

### QR técnico x template visual

```text
QR técnico
→ existe no contrato/identificação

Template físico atual
→ pode não renderizar o QR visualmente

Etapa 10
→ template final/Zebra/ZPL/testes físicos
```

---

# 9. Administração / Cadastros

Rota:

```text
/administracao/cadastros
```

Áreas atuais:

```text
Laboratórios
Projetos
Produtos
Classes de Resíduo
Permissões
```

Não há CRUD manual normal de Unidade nem criação manual de Usuário.

Classes de Resíduo já são cadastro funcional por Unidade com ativação/inativação.

---

# 10. Etapa 4.1 — implementação concluída no frontend

A modelagem backend foi fechada:

```text
LocalArmazenamentoResiduo
= catálogo mutável por Unidade

Residuo.localArmazenamentoResiduo
= referência opcional ao catálogo

Residuo.complementoLocalArmazenamento
= complemento opcional

Residuo.localArmazenamentoTemporario
= snapshot textual histórico
```

Sequência:

```text
4.1-A backend: V16 + entidade + repository ✅
4.1-B backend: CRUD + tenant ✅
4.1-C backend: análise/liberação ✅
4.1-D backend: confirmação física/correção ✅
4.1-E revisão backend ✅
4.1-F frontend Administração/Cadastros ✅
4.1-G frontend Gestão ✅
4.1-H regressão integrada ✅
```

O frontend da 4.1 foi implementado após a estabilização do contrato backend e validado funcionalmente.

### 4.1-F — Administração/Cadastros ✅

Manutenção de locais de armazenamento por Unidade implementada, com criação, edição e ativação/inativação.

### 4.1-G — Gestão ✅

Na análise e confirmação física:

```text
selecionar local cadastrado
+ complemento opcional
OU
usar modo manual
```

O frontend não deve permitir payload ambíguo com catálogo + manual simultaneamente.

---

# 11. Etapas 4.2–4.4

```text
4.2 Modelos de Resíduo
4.3 modelo x preenchimento manual
4.4 correções administrativas do ciclo
```

A 4.1 foi concluída; a sequência atual inicia pela 4.2.

---

# 12. Estagiários, Projetos e Relatórios futuros

Etapa 5 estabiliza Projetos/Atividades e Código SEG.

Etapa 6 evolui Estagiários com Orientador, Projeto/Atividade, Bolsa separada de Curso/Formação, Cultura/área temática, treinamento de segurança e histórico de prorrogações.

Etapa 7 consome Etapas 5/6 em relatórios consolidados.

---

# 13. Unidades, Soluções e Pedidos

Etapa 8:

- separar unidade de medida de apresentação física;
- `1 L = 1000 mL`;
- `1 kg = 1000 g`;
- não converter massa/volume sem densidade;
- estabilizar domínio de Soluções.

Etapa 9 integra Soluções aos Pedidos com aprovação atômica dos componentes.

---

# 14. Rótulos, Manual, testes e refactor

```text
Etapa 10 — padrão-base de rótulos + Zebra/ZPL
Etapa 11 — Manual + avaliação de delete lógico
Etapa 12 — Vitest + Vue Test Utils + Cypress
Etapa 13 — revisão estrutural/legibilidade
```

---

# 15. Segurança

```text
guardas de rota por perfil                    ✅ UX
sessão DEV                                     ✅ temporária
contexto de Unidade via header                 ✅ desenvolvimento
autenticação definitiva                        ⏳
autorização real no servidor                   ⏳
auditoria por identidade autenticada           ⏳
integração corporativa                          ⏳
```

---

# 16. Regra de retomada

**A Etapa 4 está em andamento. A 4.1 foi concluída e validada. O próximo passo é a 4.2 — Modelos de Resíduo, preservando as decisões visuais já aprovadas.**
