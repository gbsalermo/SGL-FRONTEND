<a id="readme-top"></a>

<div align="center">
  <img src="https://raw.githubusercontent.com/gbsalermo/Sistema-SGL/main/docs/LOGO.png" alt="SGL Logo" width="340" height="auto">

# SGL — Sistema de Gestão de Laboratórios

**Frontend corporativo para pedidos, estoque, lotes, resíduos, movimentações, relatórios, administração e acompanhamento operacional.**

`Vue 3` · `TypeScript` · `Vite` · `Pinia` · `Axios` · `Vuetify`

</div>

---

## 📍 Estado atual — 03/09/2026

O frontend já ultrapassou as etapas que o handoff de 31/08 ainda marcava como futuras. Resíduos, Estagiários, Administração/Cadastros e os dashboards foram integrados à `main`.

```text
Login visual / sessão DEV                         ✅
Expiração automática da sessão DEV em 5h          ✅
Pedidos do Solicitante                            ✅
Pedidos da Gestão                                 ✅
Estoque / lotes                                   ✅
FIFO/FEFO via backend                             ✅
Movimentações                                     ✅
Relatórios / fiscalização                         ✅
PDF/XLSX                                          ✅
Resíduos — Solicitante e Gestão                   ✅
Relatório + PDF/XLSX de Resíduos                  ✅
Rótulo de Resíduo                                 ✅
Rótulo de Produto                                 ✅
Estagiários                                       ✅
Pessoas por laboratório                           ✅
Administração / Cadastros                         ✅
Dashboard Gestão                                  ✅
Dashboard Solicitante                             ✅
Alertas operacionais                              ✅
Busca global                                      ✅
Modo claro/escuro                                 ✅
Persistência do tema                              ✅
404 animada                                       ✅
Autenticação/autorização definitiva               ⏳
Integração corporativa                            ⏳
```

O primeiro protótipo está próximo do congelamento. O próximo bloco oficial é **consolidar diretrizes/matriz de permissões → congelar → executar a homologação completa**.

> Para retomar o projeto, começar por [`CONTINUIDADE.md`](CONTINUIDADE.md), [`docs/DOSSIE_PROJETO_SGL.md`](docs/DOSSIE_PROJETO_SGL.md) e `src/router/index.ts`.

---

## 🎯 Papel do frontend

A aplicação organiza três experiências:

```text
SOLICITANTE
→ acompanhar o próprio contexto
→ pedir materiais
→ informar/acompanhhar resíduos

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
→ permissões de usuários existentes
```

Regras de negócio críticas continuam no backend.

---

## 🧱 Stack

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
- Axios concentrado em services;
- Pinia para estado compartilhado;
- regras oficiais de FIFO/FEFO, estoque e transições no backend;
- interface em português;
- nomenclatura técnica em inglês apenas no futuro refactor pós-protótipo.

---

## 🗺️ Rotas atuais

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
GESTOR / ADMINISTRADOR
→ /dashboard

TECNICO / ANALISTA / PESQUISADOR / ESTAGIARIO
→ /inicio
```

---

## 🔐 Sessão DEV — interpretação correta

O login é funcional para desenvolvimento, mas ainda não é autenticação de produção.

```text
usuário informa identificador + senha
→ frontend consulta usuários existentes
→ resolve usuário ativo
→ senha ainda NÃO é validada por autenticação backend definitiva
→ sessão salva localmente
→ sessão expira automaticamente após 5 horas
```

A navegação bloqueia sessão expirada e aplica guardas por perfil, mas isso é **UX/controle temporário**, não substitui autorização real no servidor.

---

## 📦 Pedidos

### Solicitante

```text
/pedidos/novo
/meus-pedidos
```

### Gestão

```text
/pedidos
```

Suporta urgência, revisão, aprovação, rejeição, entrega e demais ações conforme o contrato atual.

Regras que não devem ser duplicadas no frontend:

```text
aprovação → baixa estoque
entrega → sem segunda baixa
cancelamento aprovado → restaura lotes exatos
perecível → FEFO
não perecível → FIFO
```

---

## 🧪 Estoque e lotes

```text
/estoque
/estoque/:id
/estoque/lotes-vencendo
```

Cobertura:

- saldo consolidado;
- estoque mínimo;
- busca/filtros;
- entrada de lote;
- Código SGL;
- embalagem e multiplicador;
- fracionamento irreversível `false → true`;
- validade;
- descarte por vencimento;
- histórico/rastreabilidade;
- filtros recebidos de dashboard, alertas e busca global;
- visão específica de lotes vencendo em até 30 dias.

Código de lote:

```text
LOT-<CODIGO_REFERENCIA_PRODUTO>-<SEQUENCIAL>
```

---

## ♻️ Resíduos — integrado

Decisão de domínio:

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

A tela de Gestão cobre recebimento, análise/classificação, rótulo, armazenamento, despacho e histórico.

O Código SGL já é exibido no registro inicial do Resíduo.

### Rótulo

```text
/residuos/:id/rotulo
```

O primeiro protótipo não exibe QR Code no rótulo visual.

### Relatório

```text
/relatorios/residuos
```

Com prévia e exportação PDF/XLSX.

Modelos de **Resíduos pré-determinados** aparecem apenas como ideia futura “Em breve”; não alteram o fluxo atual.

---

## 👥 Estagiários

```text
/estagiarios
```

Cobertura:

```text
listagem
cadastro
edição
unidade/laboratório
período
tipo de vínculo
encerramento com data efetiva
indicadores de término/vencimento
```

Tipos incluem `CONTRATUAL`, além de bolsas e voluntariado.

Relatório complementar:

```text
/relatorios/pessoas-laboratorio
```

Permite auditar responsáveis e demais pessoas vinculadas por laboratório, com PDF/XLSX.

---

## 🧑‍💼 Administração / Cadastros

```text
/administracao/cadastros
```

Rota exclusiva de `ADMINISTRADOR`.

Áreas:

```text
Laboratórios
Projetos
Produtos
Permissões
Resíduos — Em breve
```

Decisões:

- Unidade não tem CRUD manual normal;
- usuário não é criado manualmente nessa central;
- Permissões altera perfil de usuários já existentes;
- Produto representa catálogo-base, não estoque;
- Laboratório respeita Unidade e responsável;
- Projetos preservam histórico por ativação/inativação.

---

## 🏷️ Rótulo de Produto

```text
/produtos/:id/rotulo
```

Há atalho contextual na experiência de Produto/Cadastros, visualização imprimível e identidade SGL. Produtos fiscalizados destacam a informação de controle externo.

---

## 📊 Relatórios

Central:

```text
/relatorios
```

Relatórios cobertos pelo produto:

```text
Estagiários
Produtos
Movimentações
Resumo operacional
Estoque e lotes
Fiscalização
Resíduos
Pessoas por laboratório
```

Pedidos entregues continuam sendo recorte de Movimentações, não relatório separado.

Exportação deve sempre corresponder à última prévia válida e aos mesmos filtros.

---

## 📈 Dashboard da Gestão

```text
/dashboard
```

É um dashboard **operacional**, não decorativo.

Indicadores e blocos usam dados reais e incluem:

```text
pedidos pendentes
pedidos urgentes
estoque baixo
lotes vencidos
lotes próximos do vencimento
resíduos aguardando ação / em análise
movimentações recentes
resumo por laboratório
resumo rápido
```

Itens de atenção e KPIs relevantes direcionam para a tela operacional já filtrada ou para o registro alvo quando aplicável.

A linha do tempo de últimas movimentações é visual e preserva a semântica das cores das movimentações.

---

## 🏠 Dashboard do Solicitante

```text
/inicio
```

É a rota inicial de perfis solicitantes e resume informações úteis sem expor controles de Gestão/Administração.

---

## 🔔 Shell: alertas, busca e aparência

Integrado à `main`:

```text
Alertas operacionais            ✅
Busca global                    ✅
Tema claro/escuro               ✅
Persistência de preferência     ✅
Responsividade do shell         ✅
```

A busca global direciona o usuário para contextos como Pedidos, Estoque e Cadastros. Alertas operacionais abrem o contexto correto sem obrigar o usuário a refazer filtros manualmente.

---

## 🚫 404

```text
/:pathMatch(.*)*
→ NotFoundView
```

Asset:

```text
public/animations/folder-not-found.lottie
```

A página de rota inexistente não deve ser usada para qualquer `404` de recurso da API; nesses casos a tela deve tratar o estado contextual.

---

## 🧭 Planejamento atual

Sem criar novo roadmap, o fechamento do primeiro protótipo segue:

```text
1. consolidar diretrizes/matriz funcional de permissões
2. congelar o primeiro protótipo
3. executar docs/PLANO_TESTES_PRIMEIRO_PROTOTIPO.md
4. corrigir falhas encontradas na homologação
5. autenticação + autorização + auditoria definitiva
6. integração corporativa
7. documentos/upload quando houver contrato real
8. refactor técnico para inglês no pós-protótipo
```

Não voltar a listar Administração, Resíduos ou Dashboard como “próxima etapa”: eles já estão na `main`.

---

## 📚 Documentação

| Documento | Uso |
|---|---|
| [`CONTINUIDADE.md`](CONTINUIDADE.md) | checkpoint e próximo passo |
| [`docs/DOSSIE_PROJETO_SGL.md`](docs/DOSSIE_PROJETO_SGL.md) | handoff completo |
| [`docs/README.md`](docs/README.md) | índice documental |
| [`docs/ROADMAP_INTERFACE_GESTAO.md`](docs/ROADMAP_INTERFACE_GESTAO.md) | sequência oficial consolidada |
| [`docs/INVENTARIO_TELAS.md`](docs/INVENTARIO_TELAS.md) | rotas/telas atuais |
| [`docs/FLUXOS_NAVEGACAO.md`](docs/FLUXOS_NAVEGACAO.md) | jornadas atuais |
| [`docs/FECHAMENTO_PRIMEIRO_PROTOTIPO.md`](docs/FECHAMENTO_PRIMEIRO_PROTOTIPO.md) | critérios para congelamento/homologação |
| [`docs/ETAPA_CADASTROS_ADMIN.md`](docs/ETAPA_CADASTROS_ADMIN.md) | decisões de Administração |
| [`docs/ETAPA_ESTAGIARIOS.md`](docs/ETAPA_ESTAGIARIOS.md) | decisões de Estagiários |

---

## ▶️ Execução

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
  Primeiro protótipo funcional próximo do congelamento e da homologação completa.
</div>
