# Shell visual — SGL Frontend

**Etapa:** 1.3 — Figma e padrões visuais  
**Status:** decisão conceitual aprovada; implementação futura

Este documento registra apenas as decisões conceituais do shell principal do SGL. O mockup visual gerado durante o planejamento é ilustrativo: os símbolos desenhados automaticamente não substituem a logo oficial já aprovada para o projeto.

---

# 1. Princípio geral

O shell deve transmitir continuidade entre as áreas do sistema.

```text
sidebar
+ topbar
+ área principal de conteúdo
```

Sidebar e topbar formam uma estrutura conectada e estável. O conteúdo troca de rota dentro desse shell com a transição suave já aprovada.

---

# 2. Sidebar — estado consolidado

## Aberta

Referência de largura: **240–248 px**.

Estrutura conceitual:

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
Avatar  Nome               Perfil
        email                  ⋮
```

## Recolhida

Referência de largura: **64–72 px**.

- a marca passa para sua versão compacta oficial;
- a logo compacta pode ganhar ligeiramente mais presença visual, já que o texto desaparece;
- a seta muda de sentido para indicar expansão;
- textos de navegação desaparecem;
- ícones permanecem centralizados;
- hover exibe tooltip com o nome do item;
- submenus podem abrir em flyout lateral;
- avatar/iniciais permanece no rodapé;
- a sidebar não expande inteira apenas por hover.

A abertura/recolhimento deve ser contínua e suave, seguindo a linguagem de motion aprovada.

---

# 3. Topbar — decisão visual

A topbar será propositalmente simples e conectada visualmente à sidebar.

Referência conceitual inspirada em barras minimalistas como PrimeVue Toolbar e Mood UI Topbar, adaptada à identidade do SGL.

Estrutura:

```text
[ LOGO SGL ] | [ SETA ] |          espaço livre          | pesquisa | sair
```

## Relação com a sidebar

- utiliza a mesma identidade visual da sidebar;
- a logo exibida é a mesma marca oficial do SGL;
- quando a sidebar está recolhida, a versão compacta da logo pode aparecer um pouco maior;
- a seta faz parte do mesmo controle de abrir/recolher a sidebar;
- sidebar e topbar devem parecer uma única estrutura, não dois componentes visualmente desconectados.

## Pesquisa

Estado normal:

```text
ícone de pesquisa
```

Ao interagir:

```text
ícone
→ pequena microanimação
→ campo de pesquisa se expande suavemente
```

A pesquisa só será implementada quando houver escopo real e utilidade definida. O shell pode reservar o padrão visual sem inventar uma busca global sem contrato funcional.

## Sair

A ação `Sair` fica no extremo direito da topbar, ocupando o lugar que muitos templates reservam para avatar/foto.

Direção visual:

- botão discreto;
- ícone + texto;
- estado normal neutro;
- hover pode assumir destaque vermelho suave por ser ação de encerramento de sessão;
- não competir visualmente com ações operacionais da tela.

O perfil do usuário continua concentrado no rodapé da sidebar, evitando duplicação de avatar/nome na topbar.

---

# 4. Logo oficial

Regra obrigatória:

```text
mockups gerados
→ servem para composição e espaçamento

logo oficial aprovada
→ única marca usada na implementação real
```

Nenhum símbolo alternativo criado automaticamente em mockups deve substituir a identidade oficial do SGL.

---

# 5. Área principal de conteúdo — próximo bloco

Com sidebar e topbar fechadas, o próximo conceito da Etapa 1.3 será definir:

- margem e largura útil do conteúdo;
- títulos de página;
- subtítulos/contexto;
- breadcrumbs;
- posição de ações principais da página;
- organização de filtros, cards, tabelas e formulários dentro do shell;
- comportamento responsivo dessa área.

Esse bloco deve preservar a densidade média-compacta e o espaçamento já aprovados.
