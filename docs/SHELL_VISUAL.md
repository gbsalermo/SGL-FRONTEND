# Shell Visual — SGL Frontend

**Etapa:** 1.3 — Figma e padrões visuais  
**Status:** decisão conceitual aprovada; implementação futura  
**Próximo bloco:** componentes reutilizáveis

Este documento registra o shell principal do SGL. Mockups gerados durante o planejamento servem apenas como referência de composição; símbolos aproximados nunca substituem a logo oficial do projeto.

---

# 1. Estrutura geral

```text
sidebar
+ topbar
+ área principal de conteúdo
```

O shell deve parecer uma única estrutura contínua.

Durante a navegação:

```text
sidebar     permanece
topbar      permanece
conteúdo    troca de rota suavemente
```

---

# 2. Sidebar aberta

Largura de referência:

**240–248 px**.

Estrutura:

```text
[ LOGO SGL ]                         [ ‹ ]

Aparência                    [ ☀ | 🌙 ]
Alertas operacionais              [N]   ← Gestão/Admin

PRINCIPAL
Dashboard

OPERAÇÃO
Pedidos
Estoque
Movimentações
Relatórios

ADMINISTRAÇÃO                         ← Admin
Cadastros

[ área central rolável ]

────────────────────────────
Avatar  Nome               [PERFIL]
        e-mail                 ⋮
```

A região central da navegação pode rolar quando faltar altura. Cabeçalho e usuário permanecem estáveis.

---

# 3. Sidebar recolhida

Largura:

**64–72 px**.

Mantém:

- marca compacta oficial;
- seta de expansão;
- ícones;
- lâmpada de alertas quando aplicável;
- avatar/iniciais;
- tooltips;
- flyout lateral para submenu/contexto quando necessário.

A sidebar **não expande inteira ao hover**.

```text
clique na seta
→ expansão completa

hover em ícone
→ tooltip/flyout contextual
```

Abertura/recolhimento devem ser suaves e contínuos, aproximadamente dentro da linguagem de motion de 250–350 ms.

---

# 4. Controle de abrir/recolher

Aberta:

```text
‹
→ recolher
```

Recolhida:

```text
›
→ expandir
```

A seta pode rotacionar/reposicionar suavemente durante a mudança de estado.

---

# 5. Navegação por responsabilidade

A estrutura física da sidebar é única. O conteúdo varia conforme responsabilidade.

## Solicitante

```text
Dashboard
Pedidos
  Novo pedido
  Meus pedidos
```

## Gestão

```text
Dashboard
Pedidos
Estoque
Movimentações
Relatórios
```

## Administração

```text
Tudo da Gestão
+ Cadastros
  Produtos
  Unidades
  Laboratórios
  Projetos
  Usuários
  Estagiários
```

Administração reutiliza Gestão; não duplicar módulos.

---

# 6. Submenus

Padrão:

```text
item fechado
→ seta lateral

click
→ expansão vertical curta
→ fade
```

Evitar mais de dois níveis de navegação sem necessidade real.

Na sidebar recolhida, submenu pode aparecer como flyout lateral.

---

# 7. Aparência claro/escuro

O seletor de aparência fica próximo do topo da sidebar.

Ele controla o tema **da aplicação inteira**, não somente da sidebar.

Conceito inicial:

```text
Claro
Escuro
```

Possível evolução futura:

```text
Claro
Escuro
Sistema
```

Tema escuro deve usar grafites/azuis muito profundos, evitando preto absoluto como base universal.

---

# 8. Alertas operacionais

Detalhes completos em `SIDEBAR_ALERTAS.md`.

Disponíveis para Gestão/Administração.

```text
AZUL     → sem pendência
AMARELO  → atenção
VERMELHO → urgência/crítico
```

Categorias iniciais:

- pedidos pendentes;
- estoque baixo;
- próximos do vencimento;
- vencidos.

Na sidebar recolhida, hover na lâmpada abre painel lateral resumido.

---

# 9. Área de usuário

Rodapé aberto:

```text
Avatar/iniciais
Nome                  [PERFIL]
e-mail                    ⋮
```

Menu `⋮` conceitual:

```text
Minha conta
Preferências
Aparência
Sair
```

Não assumir que o usuário pode alterar:

- login;
- e-mail institucional;
- perfil;
- unidade;
- laboratório;
- senha;
- outros dados controlados administrativamente.

Essas permissões serão confirmadas na etapa de autenticação/autorização.

Sidebar recolhida:

- avatar permanece;
- hover mostra identificação;
- clique abre menu de conta.

---

# 10. Topbar

Objetivo:

**simplicidade máxima**.

Referências conceituais:

- PrimeVue Toolbar;
- Mood UI topbar.

Composição aprovada:

```text
LOGO | SETA |                         PESQUISA | SAIR
```

A topbar deve parecer conectada à sidebar.

A logo é a marca oficial do SGL. Quando a sidebar estiver recolhida, a marca compacta pode ganhar um pouco mais de presença visual.

Não usar a topbar como segunda navegação principal.

---

# 11. Pesquisa global

Estado normal:

```text
ícone de pesquisa
```

Ao clicar:

```text
ícone
→ microanimação
→ campo/painel se expande
```

O shell reserva esse padrão, mas a busca global só deve ser implementada quando o escopo real justificar.

---

# 12. Sair

A ação `Sair` fica no extremo direito.

Direção:

- discreta;
- ícone + texto;
- neutra em estado normal;
- hover pode usar vermelho suave;
- não competir com ações operacionais da página.

Perfil/conta continua concentrado no rodapé da sidebar.

---

# 13. Área principal

A área principal já foi fechada conceitualmente e é detalhada em `PADROES_PAGINA.md`.

Referências:

```text
desktop  ~24 px de margem/padding
Tablet   ~16 px
Mobile   ~12–16 px
```

Hierarquia:

```text
breadcrumb quando necessário
↓
título + descrição opcional              ação principal
↓
busca/filtros contextuais
↓
conteúdo
```

A área é fluida para aproveitar tabelas e monitores grandes.

---

# 14. Busca e filtros

Decisão aprovada:

```text
Topbar
→ busca global

Página
→ busca local + botão Filtros

Widget/relatório
→ filtros próprios quando necessário
```

Não manter faixas enormes de filtros abertas permanentemente sem necessidade.

---

# 15. Responsividade

Desktop:

```text
sidebar fixa + topbar + conteúdo
```

Mobile/tablet estreito:

```text
sidebar
→ drawer/overlay
```

Não reutilizar automaticamente a mini-sidebar desktop como solução mobile.

Tabelas devem preservar informação crítica e usar estratégias responsivas específicas quando chegarmos aos wireframes finais.

---

# 16. Logo oficial

Regra obrigatória:

```text
mockup
→ composição

logo oficial
→ implementação
```

A imagem de exemplo da sidebar/topbar será adicionada manualmente ao README pelo mantenedor.

---

# 17. Estado do bloco Shell

```text
Sidebar aberta/recolhida      ✅
Submenus                      ✅
Aparência                     ✅
Alertas                       ✅
Usuário/footer                ✅
Topbar                        ✅
Pesquisa global conceitual    ✅
Área principal                ✅
Títulos/breadcrumbs           ✅
Busca/filtros                 ✅
```

O shell está **conceitualmente fechado**.

Próximo passo da Etapa 1.3:

```text
componentes reutilizáveis
→ botões
→ campos
→ cards
→ tabelas
→ chips
→ dialogs/modais/drawers
→ paginação
→ tooltips
→ feedback
```
