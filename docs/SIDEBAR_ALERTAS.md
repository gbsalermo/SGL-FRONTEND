# Sidebar e Alertas Operacionais — SGL Frontend

**Etapa:** 1.3 — Figma e padrões visuais  
**Status:** decisão conceitual aprovada; implementação futura  
**Bloco:** fechado

Este documento registra o comportamento conceitual da sidebar e da central de alertas operacionais do SGL. Não representa implementação Vue/CSS/Vuetify nesta etapa.

---

# 1. Estrutura da sidebar

A sidebar possui quatro regiões estáveis:

```text
1. CABEÇALHO
→ logo oficial SGL
→ controle abrir/recolher

2. UTILIDADES
→ aparência
→ alertas operacionais quando aplicável

3. NAVEGAÇÃO
→ opções conforme responsabilidade

4. RODAPÉ
→ usuário
→ perfil
→ menu de conta
```

A estrutura física é única. O conteúdo muda conforme responsabilidade.

---

# 2. Dimensões

```text
Aberta      → ~240–248 px
Recolhida   → ~64–72 px
```

No mobile, a sidebar vira drawer/overlay em vez de permanecer como mini-sidebar.

---

# 3. Cabeçalho

```text
[ LOGO SGL ]                         [ ‹ / › ]
```

Aberta:

```text
‹ → recolher
```

Recolhida:

```text
› → expandir
```

A marca usada na implementação é sempre a logo oficial do SGL. Mockups gerados servem somente para composição.

---

# 4. Movimento de abrir/recolher

A mudança deve ser contínua e suave.

Referência perceptiva:

```text
~250–350 ms
```

Durante a transição:

```text
largura
→ reduz/aumenta progressivamente

rótulos
→ fade + pequeno deslocamento

ícones
→ reposicionam suavemente

conteúdo principal
→ acompanha a nova largura
```

A sidebar **não expande inteira automaticamente no hover**.

---

# 5. Aparência

Controle conceitual:

```text
Aparência                         [ ☀ | 🌙 ]
```

O tema é da aplicação inteira.

Claro:

- fundo geral claro;
- superfícies brancas;
- sidebar institucional em azul escuro.

Escuro:

- grafites/azuis profundos;
- superfícies um pouco mais claras;
- texto branco suave;
- azul institucional continua como destaque.

Possível evolução futura: `Sistema` como terceira opção.

---

# 6. Navegação por responsabilidade

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

Administração reutiliza Gestão. Não existem três sidebars independentes.

---

# 7. Submenus

Fechado:

```text
▤ Pedidos                         ›
```

Aberto:

```text
▤ Pedidos                         ⌄
│
├─ Novo pedido
└─ Meus pedidos
```

Abertura:

- expansão vertical curta;
- fade discreto;
- seta acompanha o estado;
- evitar mais de dois níveis.

No modo recolhido, filhos podem aparecer em flyout lateral.

---

# 8. Estado visual dos itens

```text
normal
→ outline
→ contraste regular

hover
→ microanimação
→ leve realce

ativo
→ filled quando disponível
→ contraste maior
→ destaque azul
```

Quando uma rota filha estiver ativa, o grupo pai continua marcado.

---

# 9. Central de Alertas Operacionais

Disponível somente para:

```text
GESTÃO
ADMINISTRAÇÃO
```

Ela não é uma central social/genérica de notificações. Seu papel é indicar **pendências operacionais que exigem atenção**.

Posição:

```text
Logo
↓
Aparência
↓
💡 Alertas
↓
Navegação
```

---

# 10. Semântica da lâmpada

A lâmpada assume a cor da maior severidade existente.

```text
AZUL
→ nenhuma pendência
→ estado neutro/desligado
→ badge pode ser omitida se total = 0

AMARELO
→ existem pendências
→ atenção necessária

VERMELHO
→ existe ao menos uma urgência/crítico
```

Prioridade:

```text
vermelho > amarelo > azul
```

O badge mostra a soma das pendências quando > 0.

---

# 11. Categorias iniciais

| Categoria | Severidade | Objetivo |
|---|---|---|
| Pedidos pendentes | amarelo | pedidos aguardando análise |
| Estoque baixo | amarelo | itens abaixo do mínimo |
| Próximos do vencimento | amarelo | lotes perto da validade |
| Vencidos | vermelho | lotes cuja validade já passou |

Outras categorias só entram quando houver necessidade funcional real.

---

# 12. Sidebar aberta — comportamento dos alertas

Exemplo:

```text
💡 Alertas                         [6]
│
├─ Pedidos pendentes               [2]
├─ Estoque baixo                   [2]
├─ Próximos do vencimento          [1]
└─ Vencidos                        [1]
```

## Clique na lâmpada

```text
expande/recolhe categorias
```

A expansão usa motion curto e suave.

## Hover em uma categoria

O hover **não abre a central inteira**. Ele mostra uma breve descrição apenas da categoria apontada.

Exemplo:

```text
Pedidos pendentes [2]
→ 2 pedidos aguardando análise
→ Laboratórios: Química Orgânica e Biologia
```

Outro:

```text
Estoque baixo [2]
→ 2 itens estão abaixo do estoque mínimo
```

Outro:

```text
Próximos do vencimento [2]
→ 2 lotes estão próximos do vencimento
```

A descrição deve responder rapidamente:

> Por que este alerta está aparecendo?

Pode incluir uma informação contextual pequena, como laboratório/unidade, sem virar lista extensa.

---

# 13. Clique nas categorias

Cada categoria leva à operação correspondente, preferencialmente já filtrada.

```text
Pedidos pendentes
→ Pedidos
→ Status = PENDENTE

Estoque baixo
→ Estoque
→ modo/filtro = Estoque baixo

Próximos do vencimento
→ Estoque/Lotes
→ filtro de validade futura

Vencidos
→ Estoque/Lotes
→ filtro = Vencidos
```

A central não duplica a tela operacional; ela é um atalho contextual.

---

# 14. Sidebar recolhida — alertas

Quando recolhida, permanece apenas a lâmpada.

Hover:

```text
       ┌──────────────────────────────┐
💡 ───►│ Alertas                  6   │
       │ Pedidos pendentes        2   │
       │ Estoque baixo            2   │
       │ Próximos do vencimento   1   │
       │ Vencidos                 1   │
       └──────────────────────────────┘
```

O painel é leve, temporário e permite acesso às categorias.

---

# 15. Situação de validade no backend

Já existe:

```text
GET /api/v1/lotes/vencidos
```

Portanto:

```text
Vencidos
→ suportado pelo backend
```

Ainda falta contrato específico para:

```text
Próximos do vencimento
```

Regra:

- manter no design;
- não inventar cálculo definitivo no frontend;
- backend deverá definir a janela oficial;
- pode futuramente ser 7/15/30 dias ou configurável, mas nada disso está congelado.

---

# 16. Relação com iconografia

A lâmpada segue o padrão oficial de ícones:

```text
normal
→ visível e monocromática

hover
→ microanimação curta

click
→ pequeno press

estado
→ cor comunica severidade
```

O verde não significa “sem alerta”; permanece reservado a sucesso/confirmação.

---

# 17. Rodapé do usuário

Formato aberto:

```text
(avatar) Nome do usuário     [GESTOR]
         e-mail                   ⋮
```

Exibir:

- avatar ou iniciais;
- nome;
- e-mail institucional;
- perfil/responsabilidade em badge discreta;
- menu de três pontos.

Menu conceitual:

```text
Minha conta
Preferências
Aparência
────────────
Sair
```

Não assumir que o próprio usuário poderá alterar:

- login;
- e-mail institucional;
- perfil;
- unidade;
- laboratório;
- senha;
- dados controlados administrativamente.

Isso será confirmado na etapa de autenticação/autorização.

No modo recolhido, avatar permanece; hover identifica e clique abre menu.

---

# 18. Scroll

Pontos estáveis:

```text
cabeçalho
→ logo + toggler

utilidades
→ aparência + alertas

navegação
→ região flexível/rolável

rodapé
→ usuário
```

A rolagem deve acontecer preferencialmente na região central.

---

# 19. Mobile

```text
fechada
→ conteúdo ocupa a tela

abrir menu
→ drawer desliza da esquerda
→ overlay cobre conteúdo

selecionar rota
→ drawer fecha
→ conteúdo troca de página
```

Alertas permanecem dentro do drawer. Um atalho adicional na topbar só deve ser adicionado se testes de uso mostrarem necessidade.

---

# 20. Resumo final

```text
sidebar única                       ✅
240–248 px aberta                   ✅
64–72 px recolhida                  ✅
logo + seta                         ✅
aparência                           ✅
alertas Gestão/Admin                ✅
navegação por responsabilidade      ✅
submenus suaves                     ✅
outline → filled                    ✅
usuário no rodapé                   ✅
claro/escuro                        ✅
mobile como drawer                  ✅
sem expansão inteira no hover       ✅
```

Este bloco está **conceitualmente fechado**.

O shell e a área principal também já foram fechados. O próximo passo geral da Etapa 1.3 é:

```text
COMPONENTES REUTILIZÁVEIS
```
