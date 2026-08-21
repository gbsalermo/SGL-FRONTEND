# Sidebar e Alertas Operacionais — SGL Frontend

**Etapa:** 1.3 — Figma e padrões visuais  
**Status:** decisão conceitual aprovada; implementação futura

Este documento registra o comportamento conceitual da sidebar e da central de alertas operacionais. Não representa implementação Vue, CSS, Vuetify ou integração de API nesta etapa.

---

# 1. Posição da central de alertas

A central de alertas será exibida somente para responsabilidades de **Gestão** e **Administração**.

Posição conceitual na sidebar aberta:

```text
[ LOGO SGL ]                       [ ‹ ]

Aparência                    [ ☀ | 🌙 ]

💡 Alertas                         [N]

PRINCIPAL
Dashboard
Pedidos
Estoque
Movimentações
Relatórios
...
```

A central deve funcionar como indicador de atenção operacional, e não como uma área genérica de notificações sociais.

---

# 2. Estado visual da lâmpada

A lâmpada representa o maior nível de severidade atualmente existente entre os alertas.

```text
AZUL
→ nenhuma pendência
→ lâmpada visualmente "desligada"
→ badge de quantidade pode ser omitida quando total = 0

AMARELO
→ existem pendências que exigem atenção
→ exemplo: pedidos pendentes, estoque baixo, lotes próximos do vencimento

VERMELHO
→ existe ao menos uma pendência urgente/crítica
→ exemplo: produto/lote vencido
```

Regra de prioridade:

```text
se houver alerta vermelho
→ lâmpada vermelha

senão, se houver alerta amarelo
→ lâmpada amarela

senão
→ lâmpada azul
```

O número ao lado da lâmpada representa a quantidade total de pendências consolidadas.

---

# 3. Sidebar aberta — clique e hover

Na sidebar aberta, o comportamento é dividido em duas interações distintas.

## Clique na lâmpada

O clique expande/recolhe a lista de categorias de alerta:

```text
💡 Alertas                         [6]
│
├─ Pedidos pendentes               [2]
├─ Estoque baixo                   [2]
├─ Próximos do vencimento          [1]
└─ Vencidos                        [1]
```

A expansão deve ser suave e curta, seguindo o padrão de motion aprovado para submenus.

## Hover sobre uma categoria

O hover **não abre a central inteira**. Ele mostra apenas uma breve descrição contextual referente à categoria apontada.

Exemplo:

```text
Pedidos pendentes [2]
        ───────────────►
        2 pedidos aguardando análise.
        Laboratórios: Química Orgânica e Biologia.
```

Outro exemplo:

```text
Estoque baixo [2]
        ───────────────►
        2 itens estão abaixo do estoque mínimo.
        Clique para visualizar os itens.
```

Outro exemplo:

```text
Próximos do vencimento [2]
        ───────────────►
        2 lotes estão próximos do vencimento.
        Clique para visualizar os lotes.
```

A descrição deve ser curta. Quando houver informação extra útil, pode incluir um pequeno resumo, como laboratório, unidade ou quantidade crítica, sem transformar o hover em uma tabela completa.

---

# 4. Clique nas categorias

Cada categoria deve levar o usuário ao contexto operacional correto, preferencialmente já filtrado.

```text
Pedidos pendentes
→ Pedidos
→ filtro/status = PENDENTE

Estoque baixo
→ Estoque
→ modo/filtro = Estoque baixo

Próximos do vencimento
→ Estoque / Lotes
→ filtro de validade futura

Vencidos
→ Estoque / Lotes
→ filtro = Vencidos
```

A central de alertas não deve duplicar a tela de operação. Ela serve como ponto de entrada rápido para pendências.

---

# 5. Sidebar recolhida

Quando a sidebar estiver recolhida, permanece apenas o ícone da lâmpada com seu estado semântico.

```text
┌────┐
│ 💡 │
└────┘
```

Ao passar o mouse sobre a lâmpada recolhida, abre um pequeno painel lateral resumido:

```text
       ┌──────────────────────────────┐
💡 ───►│ Alertas                  6   │
       │ Pedidos pendentes        2   │
       │ Estoque baixo            2   │
       │ Próximos do vencimento   1   │
       │ Vencidos                 1   │
       └──────────────────────────────┘
```

Esse painel deve ser leve, temporário e permitir acesso rápido às mesmas categorias.

O clique continua podendo abrir a central completa/contextual conforme o padrão definitivo do shell.

---

# 6. Categorias iniciais

Categorias previstas para Gestão/Administração:

| Categoria | Severidade padrão | Objetivo |
|---|---|---|
| Pedidos pendentes | Amarelo | pedidos aguardando análise |
| Estoque baixo | Amarelo | itens abaixo do mínimo configurado |
| Próximos do vencimento | Amarelo | lotes que se aproximam da validade |
| Vencidos | Vermelho | lotes cuja validade já foi ultrapassada |

Outras categorias poderão ser adicionadas somente quando houver necessidade funcional real.

---

# 7. Validade — situação atual do backend

O backend já possui suporte para consultar **lotes vencidos**.

Contrato atual:

```text
GET /api/v1/lotes/vencidos
```

Por outro lado, **lotes próximos do vencimento** já fazem parte do planejamento funcional do frontend, mas ainda não possuem endpoint específico por janela de dias no backend.

Portanto:

```text
Vencidos
→ suportado atualmente pelo backend

Próximos do vencimento
→ manter no design e na UX
→ implementar quando existir regra/consulta oficial de janela de validade
→ não inventar cálculo definitivo no frontend como regra de domínio
```

A futura regra deverá definir, por exemplo, o que significa "próximo do vencimento" (7, 15, 30 dias ou configuração própria) antes da implementação.

---

# 8. Regra de informação no hover

O hover deve responder rapidamente à pergunta:

> "Por que este alerta está aparecendo?"

Estrutura preferida:

```text
quantidade + situação
+ uma informação contextual útil, quando disponível
+ indicação de que o clique leva ao detalhe
```

Evitar:

- listas longas dentro do hover;
- excesso de dados;
- operações destrutivas dentro do tooltip;
- informações que exijam rolagem;
- duplicação completa da tela de destino.

---

# 9. Integração com a linguagem visual dos ícones

A lâmpada segue o padrão de ícones aprovado:

```text
estado neutro
→ ícone visível, monocromático

hover
→ microanimação curta

click
→ pequeno efeito de pressão

estado semântico
→ cor comunica severidade
```

As categorias internas também seguem a paleta semântica do SGL.

Regra principal:

```text
azul = normal / sem pendência
amarelo = atenção / pendência
vermelho = crítico / urgente
```

O verde permanece reservado a sucesso/confirmação, e não deve ser usado para indicar ausência de alertas na lâmpada.

---

# 10. Resumo aprovado dos alertas

```text
Gestor/Admin
→ possuem central de alertas na sidebar

Lâmpada azul
→ nada pendente

Lâmpada amarela
→ existem pendências

Lâmpada vermelha
→ existe pendência urgente

Sidebar aberta
→ clique expande categorias
→ hover na categoria mostra breve descrição contextual

Sidebar recolhida
→ hover na lâmpada abre painel lateral resumido

Clique em categoria
→ leva ao contexto/tela correta já filtrada

Categorias iniciais
→ pedidos pendentes
→ estoque baixo
→ próximos do vencimento
→ vencidos
```

---

# 11. Estrutura definitiva da sidebar

A sidebar será uma estrutura fixa do shell após o login e terá quatro regiões conceituais:

```text
1. CABEÇALHO
→ marca SGL
→ controle abrir/recolher

2. UTILIDADES
→ aparência
→ alertas operacionais quando aplicável

3. NAVEGAÇÃO
→ opções do sistema conforme responsabilidade

4. RODAPÉ
→ identidade do usuário
→ perfil/responsabilidade
→ menu de conta
```

A ordem visual deve ser estável em todas as responsabilidades. O que muda é somente o conteúdo disponível na navegação e a presença de alertas operacionais.

---

# 12. Sidebar aberta

Largura conceitual: **240–248 px**.

Composição:

```text
┌──────────────────────────────┐
│ [LOGO SGL]               [‹] │
│                              │
│ Aparência          [☀ | 🌙] │
│ 💡 Alertas              [N]  │
│                              │
│ PRINCIPAL                    │
│ ▦ Dashboard                  │
│ ▤ Pedidos                  › │
│ ▣ Estoque                    │
│ ⇄ Movimentações              │
│ ▥ Relatórios                 │
│                              │
│ ADMINISTRAÇÃO                │
│ ◇ Cadastros                › │
│                              │
│              conteúdo        │
│              rolável         │
│                              │
│ ───────────────────────────  │
│ (avatar) Nome       [GESTOR] │
│          email            ⋮  │
└──────────────────────────────┘
```

A navegação pode rolar quando necessário, mas cabeçalho e rodapé devem permanecer previsíveis. O usuário não deve precisar procurar seu perfil ou o controle de recolhimento depois de navegar em listas longas.

---

# 13. Sidebar recolhida

Largura conceitual: **64–72 px**.

Regras:

- usar marca compacta do SGL;
- ocultar textos de navegação;
- manter ícones centralizados;
- ocultar títulos de grupos;
- manter aparência por ícone;
- manter alertas por lâmpada quando aplicável;
- manter avatar do usuário;
- tooltips identificam funções no hover;
- o conteúdo principal ganha espaço de forma progressiva, sem salto visual.

Representação:

```text
┌────────┐
│  SGL › │
│        │
│   ◐    │
│   💡   │
│        │
│   ▦    │
│   ▤    │
│   ▣    │
│   ⇄    │
│   ▥    │
│        │
│   ◇    │
│        │
│        │
│  avatar│
└────────┘
```

A sidebar **não deve expandir inteira automaticamente no hover**. O hover serve para tooltip e painéis contextuais. Abrir/recolher a estrutura inteira exige ação explícita no controle de seta.

---

# 14. Controle de abrir/recolher

O controle fica no cabeçalho, ao lado da marca.

```text
sidebar aberta
→ ‹
→ ação: recolher para a esquerda

sidebar recolhida
→ ›
→ ação: expandir para a direita
```

A mudança deve ser contínua e suave, seguindo o padrão de motion já aprovado.

Durante a transição:

```text
largura
→ reduz/aumenta progressivamente

rótulos
→ perdem/ganham opacidade
→ pequeno deslocamento horizontal

ícones
→ reposicionam suavemente

área principal
→ acompanha a nova largura
```

A referência perceptiva permanece na faixa de **250–350 ms**, sujeita a validação no protótipo.

---

# 15. Aparência claro/escuro

A sidebar terá controle de aparência, mas o tema será da **aplicação inteira**, não apenas do menu lateral.

Estados conceituais:

```text
Claro
→ fundo principal claro
→ superfícies brancas
→ sidebar institucional azul escuro

Escuro
→ fundo grafite azulado
→ superfícies elevadas em grafite mais claro
→ sidebar em azul/preto profundo
→ texto em branco suave
→ azul institucional continua como destaque
```

Na sidebar aberta, usar controle compacto semelhante a:

```text
Aparência                 [☀ | 🌙]
```

Na recolhida, permanecer somente o ícone correspondente.

A possibilidade futura de acompanhar automaticamente o tema do sistema operacional pode ser considerada na implementação, sem ser requisito obrigatório do primeiro protótipo.

---

# 16. Navegação por responsabilidade

A estrutura da sidebar é única. Os itens exibidos variam conforme a responsabilidade do usuário.

## Solicitante

```text
PRINCIPAL
Dashboard

PEDIDOS
Novo pedido
Meus pedidos
```

## Gestão

```text
PRINCIPAL
Dashboard

OPERAÇÃO
Pedidos
Estoque
Movimentações
Relatórios
```

## Administração

```text
PRINCIPAL
Dashboard

OPERAÇÃO
Pedidos
Estoque
Movimentações
Relatórios

ADMINISTRAÇÃO
Cadastros
  Produtos
  Unidades
  Laboratórios
  Projetos
  Usuários
  Estagiários
```

Administração reutiliza a navegação de Gestão e acrescenta o agrupamento administrativo. Não existem três componentes de sidebar distintos.

---

# 17. Submenus

Submenus devem ser usados somente quando o agrupamento melhora a leitura.

Comportamento aberto:

```text
▤ Pedidos                         ⌄
│
├─ Novo pedido
└─ Meus pedidos
```

Comportamento fechado:

```text
▤ Pedidos                         ›
```

Abertura/recolhimento:

- expansão vertical curta;
- fade discreto;
- seta acompanha o estado;
- não abrir múltiplas árvores profundas sem necessidade;
- evitar mais de dois níveis de navegação na sidebar.

No modo recolhido, itens com filhos podem abrir um **flyout lateral contextual**, sem expandir toda a sidebar.

---

# 18. Estado ativo

A sidebar segue o padrão de ícones já aprovado:

```text
normal
→ ícone outline
→ texto de contraste regular

hover
→ microanimação
→ realce leve de fundo/cor

ativo
→ ícone filled quando disponível
→ maior contraste
→ fundo azul de destaque
→ texto claramente legível
```

O estado ativo deve ser percebido imediatamente, mas sem brilho, gradientes fortes ou animação contínua.

Quando uma rota filha estiver ativa, o grupo pai permanece visualmente marcado para preservar contexto.

---

# 19. Rodapé do usuário

O usuário fica sempre no rodapé da sidebar aberta.

Formato preferido:

```text
(avatar) Nome do usuário     [GESTOR]
         email institucional       ⋮
```

Exibir:

- avatar ou iniciais;
- nome;
- email institucional;
- responsabilidade/perfil em badge discreta;
- menu de três pontos.

A badge de perfil deve informar, não competir visualmente com os alertas e estados do sistema.

---

# 20. Menu da conta

O menu de três pontos pode oferecer conceitualmente:

```text
Minha conta
Preferências
Aparência
────────────
Sair
```

A tela de Minha conta só permitirá alteração dos campos autorizados pelo contrato futuro.

Não assumir que o próprio usuário poderá alterar:

- login/usuário;
- email institucional;
- perfil;
- unidade;
- laboratório;
- senha;
- demais dados administrados externamente ou por autorização administrativa.

A UX pode reservar esses campos como informação somente leitura, mas a permissão real será definida com autenticação/autorização.

Na sidebar recolhida, permanece apenas o avatar. Hover identifica nome/perfil; clique abre o menu completo da conta.

---

# 21. Scroll e permanência visual

A sidebar deve preservar três pontos fixos de referência:

```text
cabeçalho
→ logo + toggler

navegação
→ região flexível/rolável

rodapé
→ usuário
```

Aparência e alertas ficam acima da navegação e devem permanecer facilmente acessíveis. Se a altura da viewport exigir, a região central absorve a rolagem em vez de empurrar o usuário para fora da tela.

---

# 22. Mobile e telas pequenas

Em telas pequenas, a sidebar deixa de disputar largura com o conteúdo e passa a funcionar como **drawer/overlay**.

Conceito:

```text
fechada
→ conteúdo ocupa a tela

abrir menu
→ sidebar desliza da esquerda
→ overlay discreto cobre o conteúdo

selecionar rota
→ drawer fecha
→ conteúdo assume a nova tela
```

No mobile, não existe utilidade em manter permanentemente o modo mini de 64–72 px. O padrão é drawer fechado/aberto.

Alertas continuam acessíveis dentro do drawer e podem posteriormente ganhar atalho adicional na topbar, caso os testes de uso indiquem necessidade.

---

# 23. Resumo final da sidebar

```text
Estrutura
→ uma sidebar única para todo o SGL

Aberta
→ 240–248 px

Recolhida
→ 64–72 px

Cabeçalho
→ logo + seta ‹/›

Utilidades
→ aparência
→ alertas para Gestão/Admin

Navegação
→ varia conforme responsabilidade

Submenus
→ expansão vertical suave
→ flyout no modo recolhido

Estado ativo
→ outline → filled
→ destaque azul

Rodapé
→ avatar + nome + email + perfil + menu ⋮

Tema
→ claro/escuro da aplicação inteira

Movimento
→ 250–350 ms como referência
→ sem expansão automática da sidebar no hover

Mobile
→ drawer/overlay
```

Com estas decisões, o bloco **Sidebar aberta/recolhida** fica conceitualmente fechado para a Etapa 1.3. A próxima definição do shell é a **Topbar + área principal de conteúdo + títulos/breadcrumbs**.
