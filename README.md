<a id="readme-top"></a>

<div align="center">
  <img src="https://raw.githubusercontent.com/gbsalermo/Sistema-SGL/main/docs/LOGO.png" alt="SGL Logo" width="340" height="auto">

# SGL — Sistema de Gestão de Laboratórios

**Frontend corporativo para pedidos, estoque, lotes, movimentações, relatórios, fiscalização e administração laboratorial.**

`Vue 3` · `TypeScript` · `Vite` · `Pinia` · `Axios` · `Vuetify`

</div>

---

## 📍 Estado atual — 31/08/2026

O frontend já passou da fase inicial de interfaces. Os fluxos operacionais principais estão implementados e a próxima grande etapa é **Administração/Cadastros**.

```text
Login visual / sessão DEV              ✅
Pedidos do solicitante                 ✅
Pedidos da gestão                      ✅
Estoque / lotes                        ✅
Movimentações                          ✅
Relatórios / fiscalização              ✅
Exportação PDF/XLSX                    ✅
Página 404 animada                     ✅
Administração / Cadastros              ⏳ PRÓXIMA
Resíduos                               ⏳ após reconciliação do backend
Documentos / rotulagem                 ⏳
Dashboard final / robustez             ⏳
Autenticação definitiva                ⏳
```

> Para retomar o projeto por outra IA ou pessoa, começar por [`CONTINUIDADE.md`](CONTINUIDADE.md) e [`docs/DOSSIE_PROJETO_SGL.md`](docs/DOSSIE_PROJETO_SGL.md).

---

## ▶️ Próximo passo

```text
Administração
→ Cadastros
→ Produtos
```

O primeiro cadastro deve incluir desde o início:

```text
Fiscalizado?
Órgãos fiscalizadores
Observação de fiscalização
```

Depois seguir:

```text
Laboratórios → Projetos → Usuários → Estagiários
```

**Unidade não terá CRUD manual no frontend.** Sua origem futura será a integração corporativa.

---

## 🛠️ Stack

```text
Vue 3.5
Vite 8
TypeScript 5.9
Vue Router 5
Pinia 4
Axios 1.19
Vuetify 3.13
Node >= 20.19
```

Comandos:

```bash
npm install
npm run type-check
npm run build
npm run dev
```

API:

```text
VITE_API_BASE_URL
```

O Swagger/OpenAPI do backend é a fonte de verdade dos contratos HTTP.

---

## 🏛️ Arquitetura

Direção:

```text
SPA
+ Feature-based Architecture
+ Component-based UI
```

Fluxo preferencial:

```text
View
→ Component
→ Service / Store quando necessário
→ Axios
→ Backend REST
```

Regras:

- não espalhar Axios diretamente em Views/Components;
- não criar Store para todo dado remoto;
- não duplicar módulo por perfil quando o domínio é compartilhado;
- não recriar FIFO/FEFO no frontend;
- usar UUID público nas fronteiras;
- extrair componente compartilhado por responsabilidade/reuso real;
- manter a linguagem exibida ao usuário em português.

---

## 🔐 Login e sessão atual

A interface de login está concluída, mas a autenticação definitiva ainda não existe.

Hoje o frontend usa um modo de desenvolvimento:

```text
usuário + senha preenchidos
→ GET /v1/usuarios
→ procura usuário ativo
→ senha NÃO é validada no backend
→ sessão DEV no localStorage
```

O código explicita isso por meio de `entrarDesenvolvimento(...)` e da chave `sgl.dev-session`.

Portanto:

```text
login visual / navegação DEV          ✅
autenticação segura                   ⏳
autorização definitiva                ⏳
auditoria por sessão autenticada      ⏳
SSO/API corporativa                   ⏳
```

---

## 🧭 Rotas existentes

Em `src/router/index.ts`:

```text
/login

/meus-pedidos
/pedidos/novo

/pedidos
/estoque
/estoque/:id
/movimentacoes
/relatorios
/solicitacoes/novo
/solicitacoes/meus-pedidos

/:pathMatch(.*)*
```

As rotas de Cadastros ainda serão adicionadas na Etapa 8. `/dashboard` também não deve ser tratado como rota pronta apenas porque aparece em documentos históricos de concepção.

---

## 👥 Experiência por responsabilidade

### Solicitante

```text
Novo pedido
Meus pedidos
Acompanhamento de solicitações
```

### Gestão

```text
Pedidos
Estoque
Lotes no contexto do estoque
Movimentações
Relatórios
Solicitações próprias quando necessário
```

### Administração — próxima expansão

Administração reutiliza Gestão e acrescentará:

```text
Cadastros
├── Produtos
├── Laboratórios
├── Projetos
├── Usuários
└── Estagiários
```

Não criar `Cadastros → Unidades`.

---

## 📦 Estoque e lotes

Já implementado:

- visão geral e detalhe de estoque;
- entrada de lote;
- apresentação/embalagem e multiplicador;
- fracionamento;
- Código SGL;
- edição segura;
- descarte por vencimento;
- FIFO/FEFO integrado ao backend;
- busca/filtros/status;
- histórico/rastreabilidade de saídas.

Código SGL atual:

```text
LOT-<CODIGO_REFERENCIA_PRODUTO>-<SEQUENCIAL>
```

Saldo é mostrado na unidade-base; o lote preserva sua apresentação física.

---

## 🔄 Movimentações

Rota:

```text
/movimentacoes
```

A interface funciona como trilha operacional/auditoria.

Cores semânticas aprovadas:

```text
ENTRADA   → azul
SAÍDA     → vermelho
DESCARTE  → amarelo
```

Pedidos entregues são representados como recorte de Movimentações, não como relatório separado.

---

## 📊 Relatórios

Rota:

```text
/relatorios
```

Fluxo:

```text
selecionar relatório
→ aplicar filtros
→ gerar prévia
→ exportar PDF ou XLSX
```

Relatórios ativos:

```text
Estagiários
Produtos
Movimentações
Resumo operacional
Estoque e lotes
Fiscalização
```

Resíduos está reservado para depois da integração do módulo.

A geração oficial de PDF/XLSX acontece no backend e usa os mesmos filtros da prévia.

---

## ♻️ Resíduos

Decisão:

```text
Produto ≠ Resíduo
```

Há dois fluxos planejados:

```text
Solicitante → Informar resíduo
Gestão → receber/analisar/rotular/armazenar/despachar
```

O backend possui uma implementação antiga em `feat/gestao-residuos`, porém a branch está divergente da `main` e precisa ser reconciliada antes de o frontend assumir seu contrato.

Sequência correta:

```text
backend reconciliado + Swagger
→ frontend operacional
→ relatório de Resíduos
→ PDF/XLSX de Resíduos
```

---

## 🚫 Unidade não é cadastro manual

Decisão vigente em [`docs/DECISAO_UNIDADES_CORPORATIVAS.md`](docs/DECISAO_UNIDADES_CORPORATIVAS.md):

```text
Unidade vem futuramente da API corporativa
→ backend resolve/cria de forma idempotente
→ sessão chega ao frontend já vinculada
```

Não implementar:

```text
/cadastros/unidades
```

---

## 🖼️ 404

A página 404 customizada/animada já está implementada.

```text
/:pathMatch(.*)*
→ NotFoundView.vue
```

Asset:

```text
public/animations/folder-not-found.lottie
```

Um HTTP 404 retornado pela API deve ser tratado como estado contextual da tela, não automaticamente como rota inexistente.

---

## 🎨 Identidade visual

Referência institucional principal:

```text
Publica / Embrapa
```

Paleta base:

| Papel | Cor |
|---|---|
| Azul principal | `#1A4DA1` |
| Azul escuro | `#0D2B5E` |
| Azul claro | `#2D6BC4` |
| Verde institucional | `#007A3D` |
| Verde claro | `#4EA674` |
| Verde suave | `#A5D6A7` |
| Fundo | `#F5F7FA` |
| Superfície | `#FFFFFF` |
| Texto | `#1A1A2E` |
| Texto secundário | `#64748B` |
| Bordas | `#E2E8F0` |

Tipografia principal: **Inter**.

Direção:

```text
clean
+ institucional
+ administrativa/laboratorial
+ média-compacta
+ baixa carga decorativa
+ alta legibilidade
```

---

## 🗺️ Roadmap atual

```text
Etapa 0 — Handoff backend → frontend                    ✅
Etapa 1 — Fundação visual/técnica                       ✅
Etapa 2 — Bootstrap técnico                             ✅
Etapa 3 — Interfaces iniciais                           ✅
Etapa 4 — Estoque / Lotes                               ✅
Etapa 5 — Produto operacional                           ↪ consolidado em Estoque + Cadastro
Etapa 6 — Movimentações                                 ✅
Etapa 7 — Relatórios / Fiscalização / PDF-XLSX          ✅
Etapa 8 — Administração / Cadastros                     🟡 PRÓXIMA
Etapa complementar — Resíduos                           ⏳
Etapa 9 — Dashboard / alertas / robustez                ⏳ (404 ✅)
Etapa 10 — Autenticação / autorização / auditoria       ⏳
Pós-protótipo — refactor técnico para inglês            ⏳
```

---

## 📚 Documentação

| Documento | Finalidade |
|---|---|
| [`CONTINUIDADE.md`](CONTINUIDADE.md) | checkpoint e próximo passo |
| [`docs/DOSSIE_PROJETO_SGL.md`](docs/DOSSIE_PROJETO_SGL.md) | handoff completo para humano/IA |
| [`docs/README.md`](docs/README.md) | índice e hierarquia documental |
| [`docs/ROADMAP_INTERFACE_GESTAO.md`](docs/ROADMAP_INTERFACE_GESTAO.md) | sequência funcional atual |
| [`docs/INVENTARIO_TELAS.md`](docs/INVENTARIO_TELAS.md) | rotas/telas atuais e futuras |
| [`docs/FLUXOS_NAVEGACAO.md`](docs/FLUXOS_NAVEGACAO.md) | jornadas e regras de navegação |
| [`docs/DECISAO_UNIDADES_CORPORATIVAS.md`](docs/DECISAO_UNIDADES_CORPORATIVAS.md) | governança de Unidade |
| [`docs/IDENTIDADE_VISUAL.md`](docs/IDENTIDADE_VISUAL.md) | identidade e paleta |
| [`docs/PADROES_PAGINA.md`](docs/PADROES_PAGINA.md) | composição das páginas |

Documentos de bootstrap/etapas antigas são preservados como histórico; suas frases de “próxima etapa” não prevalecem sobre a continuidade atual.

---

<div align="center">
  <strong>SGL — Sistema de Gestão de Laboratórios</strong><br/>
  Fluxos operacionais principais concluídos; Administração/Cadastros é o próximo bloco funcional.
</div>
