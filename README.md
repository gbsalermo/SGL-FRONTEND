<a id="readme-top"></a>

<div align="center">
  <img src="https://raw.githubusercontent.com/gbsalermo/Sistema-SGL/main/docs/LOGO.png" alt="SGL Logo" width="340" height="auto">

# SGL — Sistema de Gestão de Laboratórios

**Frontend corporativo para pedidos, estoque, lotes, resíduos, movimentações, relatórios, administração e acompanhamento operacional.**

`Vue 3` · `TypeScript` · `Vite` · `Pinia` · `Axios` · `Vuetify`

</div>

---

## Estado atual — 18/09/2026

O primeiro protótipo do SGL foi funcionalmente aprovado. As Etapas 1, 2 e 3 da pré-produção foram concluídas e validadas. A **Etapa 4 — Expansão operacional de Resíduos** foi iniciada na branch `feat/etapa-4-residuos`.

Situação atual:

```text
Etapa 1 — padrão visual global                 ✅
Etapa 2 — Dark Mode definitivo                 ✅
Etapa 3 — refinamentos de Resíduos             ✅
Etapa 4 — expansão operacional de Resíduos     🔧 atual
  4.1 — locais de armazenamento                ✅ concluída
  4.2 — Modelos de Resíduo                     🔧 atual
```

A 4.1 foi concluída e validada. O próximo foco é a 4.2 — Modelos de Resíduo.

Estado consolidado:

```text
Login visual / sessão DEV                         ✅
Expiração automática da sessão DEV em 5h          ✅
Pedidos do Solicitante                            ✅
Pedidos da Gestão                                 ✅
Estoque / lotes                                   ✅
Movimentações                                     ✅
Relatórios / fiscalização                         ✅
PDF/XLSX                                          ✅
Resíduos — Solicitante e Gestão                   ✅ Etapa 3
Classes de Resíduo em Cadastros                   ✅
Locais de armazenamento em Cadastros/Gestão       ✅ Etapa 4.1
Segurança/EPI em Produto/Resíduo                  ✅
Prévia antecipada do rótulo                       ✅
Impressão condicionada à liberação                ✅
Rótulos de Resíduo e Produto                      ✅ base funcional
Estagiários                                       ✅ base atual
Pessoas por laboratório                           ✅
Administração / Cadastros                         ✅
Dashboard Gestão                                  ✅
Dashboard Solicitante                             ✅
Alertas operacionais                              ✅
Busca global                                      ✅
Modo claro/escuro definitivo + persistência       ✅
404                                               ✅
Contexto de Unidade enviado à API                 ✅
Autenticação/autorização definitiva               ⏳ etapa formal posterior
Integração corporativa                            ⏳ etapa formal posterior
```

> Para retomar o projeto, começar por [`CONTINUIDADE.md`](CONTINUIDADE.md), pelo plano canônico do backend `docs/PLANO_PRE_PRODUCAO.md`, pelo handoff `docs/CONTINUIDADE_ETAPA_4_2026-09-17.md`, pelo dossiê atual e por `src/router/index.ts`. Contratos HTTP pertencem ao Swagger/OpenAPI do backend.

---

## Papel do frontend

```text
SOLICITANTE
→ acompanhar o próprio contexto
→ solicitar materiais
→ informar e acompanhar resíduos

GESTÃO
→ dashboard operacional
→ pedidos
→ estoque/lotes
→ movimentações
→ resíduos
→ estagiários
→ relatórios

ADMINISTRAÇÃO
→ tudo da Gestão
→ Administração/Cadastros
→ alteração de perfis de usuários existentes
```

Regras críticas de domínio continuam no backend.

---

## Stack

```text
Vue 3.5
Vite 8
TypeScript 5.9
Vue Router 5
Pinia 4
Axios 1.x
Vuetify 3.13
Node >= 20.19
```

Diretrizes:

- UUID público nas fronteiras com a API;
- Axios concentrado em `services`;
- Pinia para estado compartilhado;
- regras oficiais de estoque, FIFO/FEFO e transições no backend;
- interface em português;
- nomenclatura técnica em inglês apenas em eventual refactor futuro planejado.

---

## Rotas atuais

Fonte de verdade: `src/router/index.ts`.

### Comum

```text
/login
/:pathMatch(.*)*
```

### Solicitante

```text
/inicio
/meus-pedidos
/meus-residuos
/pedidos/novo
/residuos/novo
```

### Gestão / Administração

```text
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
/administracao/cadastros       ADMINISTRADOR
/solicitacoes/novo
/solicitacoes/meus-pedidos
```

### Rótulos

```text
/residuos/:id/rotulo
/produtos/:id/rotulo
```

Rota inicial por perfil:

```text
GESTOR / ADMINISTRADOR → /dashboard
TECNICO / ANALISTA / PESQUISADOR / ESTAGIARIO → /inicio
```

---

## Sessão DEV e contexto de Unidade

A sessão atual continua sendo mecanismo de desenvolvimento, não autenticação de produção.

```text
usuário informa identificador + senha
→ frontend consulta usuários existentes
→ resolve usuário ativo
→ sessão DEV em localStorage
→ expiração em 5 horas
→ interceptor envia X-SGL-Unidade-Id
```

O backend usa esse contexto para restringir dados por Unidade. Como o header ainda é controlado pelo cliente, isso não substitui autorização baseada em identidade autenticada.

---

## Pedidos

```text
criação → não baixa estoque
aprovação → baixa estoque
entrega → sem segunda baixa
cancelamento aprovado → restaura lotes utilizados
perecível → FEFO
não perecível → FIFO
```

Urgência não muda FIFO/FEFO.

---

## Estoque e lotes

```text
/estoque
/estoque/:id
/estoque/lotes-vencendo
```

Cobertura: saldo consolidado, estoque mínimo, lotes, validade, entrada, Código SGL, embalagem/multiplicador, fracionamento, descarte e rastreabilidade.

---

## Resíduos

```text
Produto != Resíduo
```

### Solicitante

```text
/residuos/novo
/meus-residuos
```

### Gestão

```text
/residuos
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

- Procedência/uso (`processoOrigem`);
- estado físico e tratamento;
- Classes de Resíduo;
- Segurança/EPI;
- sugestões de EPI vindas de Produtos;
- análise comparativa em dois cards;
- Gestor que liberou identificado pelo histórico;
- armazenamento/despacho por Gestores diferentes;
- Código SGL e QR técnico desde a criação;
- prévia antes da liberação;
- impressão bloqueada até liberação;
- revisão de escala visual para 100% de zoom.

### QR e rótulo

```text
Código SGL + QR técnico
→ existem desde a criação

Template físico atual
→ pode não renderizar o QR visualmente

Etapa 10
→ padrão final/Zebra/ZPL/testes físicos
```

Não confundir existência do QR técnico no contrato com sua renderização no template visual atual.

---

## Administração / Cadastros

```text
/administracao/cadastros
```

Rota exclusiva de `ADMINISTRADOR`.

Áreas atuais:

```text
Laboratórios
Projetos
Produtos
Classes de Resíduo
Locais de armazenamento
Permissões
```

Produtos possuem recomendações estruturadas de segurança. Classes de Resíduo possuem código, descrição, Unidade e ativação/inativação.

A Etapa 4 já entregou os locais de armazenamento na 4.1. A implementação atual é:

```text
4.2 Modelo de Resíduo
```

---

## Etapa 4.1 — implementação concluída no frontend

A modelagem backend implementada é:

```text
LocalArmazenamentoResiduo
= catálogo por Unidade

Residuo.localArmazenamentoResiduo
= referência opcional

Residuo.complementoLocalArmazenamento
= complemento opcional

Residuo.localArmazenamentoTemporario
= snapshot textual histórico
```

O frontend implementado possui:

```text
Administração/Cadastros
→ CRUD de locais de armazenamento

Gestão / análise
→ selecionar local cadastrado
→ complemento opcional
→ ou modo manual

Gestão / armazenamento
→ manter ou corrigir local
```

O contrato backend foi fechado na 4.1-E, o frontend foi integrado nas 4.1-F/G e a regressão funcional foi aprovada na 4.1-H.

---

## Segurança — interpretação correta

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

## Sequência de trabalho

```text
Etapa 1 — padrão visual global                 ✅
Etapa 2 — Dark Mode definitivo                 ✅
Etapa 3 — refinamentos do fluxo de Resíduos    ✅
Etapa 4 — expansão operacional de Resíduos     🔧 atual
Etapa 5 — Projetos + Atividades                ⏳
Etapa 6 — Estagiários + vínculos               ⏳
Etapa 7 — relatórios consolidados              ⏳
Etapa 8 — unidades + Soluções                  ⏳
Etapa 9 — Pedidos + Soluções                   ⏳
Etapa 10 — rótulos + impressão operacional     ⏳
Etapa 11 — Manual + delete lógico              ⏳
Etapa 12 — testes automatizados frontend       ⏳
Etapa 13 — revisão estrutural/legibilidade     ⏳
```

---

## Documentação

| Documento | Uso |
|---|---|
| [`CONTINUIDADE.md`](CONTINUIDADE.md) | checkpoint e fase atual |
| [`docs/README.md`](docs/README.md) | índice e classificação documental |
| [`docs/DOSSIE_PROJETO_SGL.md`](docs/DOSSIE_PROJETO_SGL.md) | handoff consolidado |
| [`docs/INVENTARIO_TELAS.md`](docs/INVENTARIO_TELAS.md) | rotas/telas atuais |
| [`docs/FLUXOS_NAVEGACAO.md`](docs/FLUXOS_NAVEGACAO.md) | jornadas atuais |

Documentos de etapas anteriores permanecem como histórico e não definem o checkpoint atual.

---

## Execução

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

---

<div align="center">
  <strong>SGL Frontend</strong><br/>
  Etapa 4 em andamento — 4.1 concluída; 4.2 é a próxima implementação.
</div>
