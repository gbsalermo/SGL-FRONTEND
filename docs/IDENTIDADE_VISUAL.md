# Identidade Visual — SGL Frontend

**Etapa:** 1.3 — Figma e padrões visuais  
**Status:** base visual aprovada; implementação futura  
**Próximo bloco:** componentes reutilizáveis

Este documento registra a identidade visual oficial escolhida para orientar os wireframes e a futura implementação do SGL. Nesta etapa as decisões são conceituais: não devem ser convertidas automaticamente em CSS, Vuetify ou componentes Vue antes do momento técnico correspondente.

---

# 1. Direção visual

A referência institucional principal é o **Publica / Embrapa**.

Objetivo:

```text
clean
+ corporativo
+ administrativo/laboratorial
+ branco predominante
+ contraste com azuis institucionais
+ verde como apoio
+ alta legibilidade
+ baixa carga decorativa
```

O SGL deve parecer parte do mesmo ambiente institucional, sem copiar integralmente a implementação do Publica.

---

# 2. Paleta aprovada

## Azuis

| Papel | Cor |
|---|---|
| Principal | `#1A4DA1` |
| Escuro | `#0D2B5E` |
| Claro | `#2D6BC4` |

Uso conceitual:

```text
#1A4DA1
→ ação principal
→ destaque ativo
→ identidade

#0D2B5E
→ navegação escura
→ elementos institucionais de maior peso

#2D6BC4
→ hover
→ apoio visual
→ estados de interação
```

## Verdes

| Papel | Cor |
|---|---|
| Institucional | `#007A3D` |
| Claro | `#4EA674` |
| Suave | `#A5D6A7` |

O verde não substitui o azul como cor principal. Ele funciona como apoio institucional e, principalmente, em estados semânticos positivos.

## Neutros

| Papel | Cor |
|---|---|
| Fundo | `#F5F7FA` |
| Superfície | `#FFFFFF` |
| Texto principal | `#1A1A2E` |
| Texto secundário | `#64748B` |
| Bordas | `#E2E8F0` |

---

# 3. Cores semânticas

```text
AZUL
→ normal
→ informação
→ identidade

VERDE
→ sucesso
→ confirmação

AMARELO
→ atenção
→ pendência

VERMELHO
→ erro
→ urgência
→ crítico
```

A cor só deve aparecer quando comunica identidade, hierarquia ou estado real. Evitar colorir elementos apenas por decoração.

---

# 4. Tipografia

Tipografia principal:

**Inter**.

Referências iniciais:

```text
Título de página   ~24 px / 700
Título de seção    ~18 px / 600–700
Título de card     ~16 px / 600
Texto normal       ~14 px / 400
Label              ~13 px / 600
Texto auxiliar     ~12–13 px
```

Esses valores são guias de protótipo/Design System e serão convertidos em tokens somente na implementação.

---

# 5. Densidade visual

A densidade oficial do SGL é **média-compacta**.

Objetivo:

```text
mais denso que uma landing page
+ mais respirado que sistemas administrativos antigos
+ bom aproveitamento de área útil
+ adequado a tabelas e formulários frequentes
```

---

# 6. Espaçamento

Grade conceitual baseada em 8 px:

```text
4   → micro ajuste
8   → elementos próximos
12  → controles relacionados
16  → padrão
24  → grupos
32  → seções
48+ → blocos independentes
```

Referências:

| Contexto | Valor aproximado |
|---|---:|
| Padding principal desktop | 24 px |
| Entre cards | 16–24 px |
| Padding interno de card | 20–24 px |
| Label → campo | 8 px |
| Campos relacionados | 16 px |
| Grupos de formulário | 24 px |
| Grandes seções | 32 px |

---

# 7. Bordas, arredondamentos e sombras

## Bordas

- 1 px;
- claras;
- neutras;
- discretas;
- azul apenas para foco/seleção;
- semânticas somente quando o estado exigir.

A interface deve depender primeiro de espaço, fundo e tipografia, não de caixas pesadas.

## Arredondamentos

| Elemento | Referência |
|---|---:|
| Inputs/selects | ~6 px |
| Botões | ~6 px |
| Cards | ~8 px |
| Tabelas/containers | ~8 px |
| Modais/drawers | ~8–10 px |
| Alertas | ~6–8 px |
| Status chips | pill quando adequado |
| Avatar | circular |

## Sombras

```text
Nível 0
→ sem sombra
→ tabelas, formulários, seções internas

Nível 1
→ quase imperceptível
→ cards/containers quando necessário

Nível 2
→ suave e visível
→ modal, dropdown, menu flutuante
```

Hierarquia preferida:

```text
espaço
→ fundo
→ borda
→ tipografia
→ sombra
```

---

# 8. Dimensões-base do shell e controles

| Elemento | Referência |
|---|---:|
| Topbar | ~64 px |
| Sidebar aberta | ~240–248 px |
| Sidebar recolhida | ~64–72 px |
| Input | ~40–44 px |
| Botão padrão | ~40 px |
| Linha de tabela | ~44–48 px |

A sidebar foi deliberadamente mantida larga o suficiente para rótulos em português como `Movimentações`, `Laboratórios` e `Estagiários`, sem desperdiçar área útil.

---

# 9. Cards x tabelas

Regra oficial:

```text
CARD
→ resumo
→ indicador
→ agrupamento de informação
→ dashboard

TABELA
→ operação
→ consulta repetitiva
→ pedidos
→ estoque
→ movimentações
→ cadastros
```

Não transformar cada registro em um card grande quando uma tabela for mais eficiente.

---

# 10. Motion e continuidade espacial

Referência principal: `PanJiaChen/vue-admin-template`.

Princípio:

> Navegar no SGL deve parecer mover-se dentro do sistema, e não fechar uma página para abrir outra.

Troca de rota:

```text
conteúdo atual
→ perde opacidade
→ desloca-se poucos pixels

novo conteúdo
→ entra suavemente
→ assume a mesma área
```

Referências iniciais:

```text
deslocamento ~20–30 px
duração      ~250–350 ms
```

Durante a troca:

```text
sidebar     permanece
topbar      permanece
shell       permanece
conteúdo    realiza a transição
```

Por contexto:

```text
rota        → fade + deslocamento curto
breadcrumb  → transição mais discreta
modal       → fade + elevação
Drawer      → slide coerente com origem
Dropdown    → entrada curta
```

Futuramente respeitar preferência de movimento reduzido.

---

# 11. Referências administrativas

Além do Publica/Embrapa:

```text
iview/iview-admin
→ organização administrativa
→ navegação
→ tabelas

Armour/vue-typescript-admin-template
→ densidade operacional
→ filtros
→ dashboard

PanJiaChen/vue-admin-template
→ motion entre rotas
→ sensação de continuidade

CoreUI
→ organização visual de sidebar

vue-awesome-sidebar
→ suavidade de abrir/recolher

PrimeVue Toolbar / Mood UI
→ simplicidade de topbar
```

Esses projetos são **referências de UX e composição**, não base de código nem arquitetura do SGL.

---

# 12. Login

A tela de login deve preservar a familiaridade visual do Publica:

- contraste azul × branco;
- composição simples;
- poucos elementos;
- leitura imediata;
- identidade SGL no lugar da marca específica do Publica.

O wireframe completo de Login ainda faz parte dos blocos pendentes da Etapa 1.3.

---

# 13. Iconografia

Padrão aprovado em `ICONOGRAFIA.md`:

```text
normal → outline
ativo  → filled quando disponível
hover  → microanimação
click  → pequeno press
```

Cor operacional padrão:

- preto/grafite em fundo claro;
- branco/claro em fundo escuro.

Cores auxiliares apenas quando comunicam estado.

---

# 14. Shell

Padrões detalhados em:

- `SHELL_VISUAL.md`;
- `SIDEBAR_ALERTAS.md`;
- `PADROES_PAGINA.md`.

Já fechados:

```text
sidebar aberta/recolhida    ✅
alertas operacionais        ✅
topbar                      ✅
área principal              ✅
títulos/breadcrumbs         ✅
busca/filtros               ✅
```

---

# 15. Imagens-exemplo

As imagens de referência visual serão adicionadas manualmente pelo mantenedor ao README.

Devem existir exemplos para:

- identidade/capa;
- iconografia;
- sidebar + topbar;
- busca + filtros.

Regra:

> Mockup demonstra composição. A logo oficial aprovada é a única marca válida para a implementação real.

---

# 16. Estado atual da Etapa 1.3

## Fechado

```text
Identidade                                  ✅
Cores e tipografia                          ✅
Espaçamento/densidade                       ✅
Bordas/arredondamentos/sombras              ✅
Motion                                      ✅
Ícones                                      ✅
Sidebar aberta/recolhida                    ✅
Alertas operacionais                        ✅
Topbar                                      ✅
Área principal                              ✅
Títulos/breadcrumbs                         ✅
Busca/filtros                               ✅
```

## Próximo

```text
1. componentes reutilizáveis
2. estados padrão de interface
3. Login
4. Dashboards
5. fluxos visuais por responsabilidade
6. Estoque/Lotes/Movimentações
7. Relatórios/Cadastros/Documentos
8. 404/responsividade
9. mini Design System + revisão final
```

Depois disso:

```text
1.4 confirmar stack
→ Etapa 2 bootstrap técnico
```

Nenhuma decisão acima deve ser tratada como CSS definitivo antes da implementação correspondente.
