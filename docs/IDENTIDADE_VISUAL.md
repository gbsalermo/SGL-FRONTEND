# Identidade visual — SGL Frontend

**Etapa:** 1.3 — Figma e padrões visuais  
**Status:** referência conceitual aprovada; implementação futura

Este documento registra somente as decisões de design escolhidas para orientar os wireframes e a implementação posterior. Nesta etapa não devem ser criados componentes, tema Vuetify, CSS definitivo ou código de interface a partir destas decisões.

---

# 1. Referência institucional principal

A referência visual principal do SGL será a interface do sistema **Publica / Embrapa**, especialmente a tela de login apresentada durante o planejamento e o padrão global de cores/tipografia do projeto de referência.

Objetivo:

```text
manter familiaridade institucional
+ aparência corporativa e limpa
+ forte contraste entre branco e azuis institucionais
+ uso comedido do verde Embrapa
+ bastante espaço visual e hierarquia simples
```

A intenção é manter a linguagem institucional, sem copiar integralmente a implementação ou o CSS do sistema de referência.

---

# 2. Direção visual aprovada

O SGL deverá transmitir:

- ambiente administrativo/laboratorial;
- aparência clean;
- leitura rápida;
- predominância de branco e superfícies claras;
- azul como identidade principal;
- verde como identidade secundária/semântica;
- baixa carga decorativa;
- contraste e legibilidade acima de efeitos visuais.

Regra conceitual:

```text
branco e neutros claros
→ base da interface

azul institucional
→ navegação, ações principais, títulos e identidade

verde institucional
→ apoio visual, sucesso e situações semanticamente adequadas
```

Evitar uma interface inteiramente azul ou inteiramente colorida. As cores institucionais devem marcar hierarquia e estado, não preencher todas as superfícies.

---

# 3. Paleta institucional escolhida

A paleta de referência vem do projeto modelo da empresa.

## Azuis

| Papel conceitual | Cor |
|---|---|
| Azul principal | `#1A4DA1` |
| Azul escuro | `#0D2B5E` |
| Azul claro | `#2D6BC4` |

Uso esperado:

```text
#1A4DA1
→ ação principal
→ elemento institucional
→ destaque ativo

#0D2B5E
→ navegação escura
→ áreas institucionais de maior peso visual

#2D6BC4
→ hover, seleção e destaques mais leves
```

## Verdes

| Papel conceitual | Cor |
|---|---|
| Verde institucional | `#007A3D` |
| Verde claro | `#4EA674` |
| Verde suave | `#A5D6A7` |

O verde não deve competir com o azul como cor principal do sistema. Seu uso deve ser secundário e, quando adequado, semântico.

## Neutros

| Papel conceitual | Cor |
|---|---|
| Fundo da aplicação | `#F5F7FA` |
| Superfície / cards | `#FFFFFF` |
| Texto principal | `#1A1A2E` |
| Texto secundário | `#64748B` |
| Bordas | `#E2E8F0` |

Direção de proporção visual:

```text
predominância de superfícies brancas e neutras
+ azul institucional em pontos de atenção
+ verde apenas como apoio
```

---

# 4. Tipografia escolhida

Fonte principal: **Inter**.

Fallback conceitual: Roboto / sans-serif.

Motivos:

- boa legibilidade em aplicações administrativas;
- bom desempenho em tabelas, filtros, formulários e dashboards;
- leitura clara de números e textos pequenos;
- aparência moderna sem perder formalidade institucional.

A hierarquia exata de tamanhos e pesos será fechada posteriormente no mini Design System. Nesta etapa fica aprovada apenas a família tipográfica e a direção de uso.

---

# 5. Uso conceitual das cores em ações

Regra inicial:

```text
ação primária
→ azul principal

ação secundária
→ superfície branca / neutra com destaque azul

sucesso ou confirmação semanticamente positiva
→ verde

ação destrutiva
→ cor semântica de erro a definir no Design System
```

O verde do projeto de referência não será automaticamente usado como cor de todo botão principal do SGL. O azul será a cor de ação primária por coerência com a identidade do login e com a navegação institucional.

---

# 6. Login — referência estrutural aprovada

A tela de login do Publica será a principal referência estrutural para o login do SGL.

Estrutura conceitual:

```text
DESKTOP

metade esquerda
→ área institucional azul
→ identidade Embrapa/SGL
→ nome do sistema
→ mensagem institucional curta
→ elementos decorativos discretos

metade direita
→ superfície branca
→ marca SGL
→ mensagem de boas-vindas
→ usuário
→ senha
→ ação Entrar
```

A tela deve preservar:

- contraste forte azul × branco;
- composição simples;
- poucos elementos;
- familiaridade com os sistemas internos da empresa;
- formulário centralizado e de leitura imediata.

A identidade do SGL substituirá a identidade específica do Publica, mantendo a linguagem visual institucional.

---

# 7. Relação com o projeto modelo

O CSS e a tela do projeto modelo são **referências de design**, não código-base para copiar.

Devem ser reaproveitados conceitualmente:

- paleta;
- tipografia;
- contraste;
- leveza visual;
- linguagem de login;
- uso institucional de azul e verde.

Devem ser redefinidos posteriormente de acordo com a arquitetura do SGL:

- tema do framework visual;
- botões;
- tabelas;
- modais;
- fieldsets;
- scrollbars;
- estilos globais;
- componentes e estados.

Código específico do projeto antigo, seletores de versão anterior do framework e nomes ligados ao domínio do Publica não devem ser transportados automaticamente.

---

# 8. Decisão de processo

Durante a Etapa 1.3 trabalharemos primeiro os **conceitos e padrões visuais**.

Fluxo aprovado:

```text
referência institucional
→ decisão conceitual
→ wireframes
→ padrões visuais
→ mini Design System
→ confirmação da stack
→ implementação seguindo a arquitetura do frontend
```

Portanto, enquanto estivermos nesta etapa:

```text
não transformar decisão visual em CSS definitivo
não criar componentes apenas para experimentar a ideia
não configurar tema Vuetify antes da etapa técnica
não misturar exploração visual com implementação
```

---

# 9. Referências de interface administrativa

Além do Publica / Embrapa, ficam adotados como referências conceituais de organização administrativa:

- `iview/iview-admin` — branch/template;
- `Armour/vue-typescript-admin-template`;
- `PanJiaChen/vue-admin-template`.

Papel de cada grupo de referência:

```text
PUBLICA / EMBRAPA
→ identidade institucional
→ cores
→ leveza visual
→ contraste branco × azul
→ login

IVIEW ADMIN
→ organização administrativa
→ sidebar
→ navegação
→ tabelas
→ hierarquia operacional

VUE TYPESCRIPT ADMIN TEMPLATE
→ densidade de dashboard
→ filtros
→ organização de conteúdo
→ comportamento de aplicações administrativas

VUE ADMIN TEMPLATE
→ continuidade visual entre rotas
→ transições suaves
→ shell estável durante a navegação
```

Esses projetos são referências de UX e composição. Não determinam a arquitetura técnica do SGL e não devem ser copiados como base de código.

---

# 10. Espaçamento, bordas, arredondamentos, sombras e densidade

## Densidade visual

A densidade aprovada para o SGL é **média-compacta**.

Objetivo:

```text
mais denso que uma landing page
+ mais respirado que sistemas administrativos antigos
+ adequado a tabelas, filtros e formulários frequentes
+ sem desperdício de área útil
```

## Grade de espaçamento

A referência conceitual será uma grade baseada em múltiplos de 8, permitindo valores intermediários menores quando necessários.

```text
4  → micro ajuste
8  → elementos muito próximos
12 → controles relacionados
16 → espaçamento padrão
24 → separação de grupos
32 → separação de seções
48+ → blocos independentes
```

Referências de composição:

| Contexto | Referência |
|---|---:|
| margem interna principal da página | 24 px |
| distância entre cards | 16–24 px |
| padding interno de card | 20–24 px |
| label → campo | 8 px |
| campos relacionados | 16 px |
| grupos de formulário | 24 px |
| grandes seções | 32 px |

Os valores são referências de Figma/Design System, não CSS definitivo nesta etapa.

## Bordas

As bordas devem ser finas, claras e discretas.

```text
borda neutra
→ separação funcional
→ baixa presença visual

borda azul
→ foco
→ seleção
→ estado ativo

borda semântica
→ somente quando o estado exigir
```

A interface não deve depender de bordas fortes para separar cada elemento. Fundo, espaçamento e tipografia devem resolver a maior parte da hierarquia.

## Arredondamentos

Direção aprovada: **moderada**, evitando tanto o aspecto completamente quadrado quanto cards excessivamente arredondados.

| Elemento | Referência |
|---|---:|
| Inputs / selects | 6 px |
| Botões | 6 px |
| Cards | 8 px |
| Tabelas / containers | 8 px |
| Modais / drawers | 8–10 px |
| Alertas | 6–8 px |
| Status chips | pill |
| Avatar | circular |

## Sombras

Sombras devem ser usadas com parcimônia.

```text
NÍVEL 0
→ sem sombra
→ tabelas
→ formulários
→ seções internas

NÍVEL 1
→ sombra muito discreta
→ cards de dashboard
→ containers principais quando necessário

NÍVEL 2
→ sombra mais perceptível, ainda suave
→ modais
→ menus flutuantes
→ dropdowns
→ elementos sobrepostos
```

Regra de hierarquia:

```text
espaço
→ fundo
→ borda
→ tipografia
→ sombra
```

## Dimensões de referência

| Elemento | Referência |
|---|---:|
| Topbar | ~64 px |
| Sidebar aberta | ~240–248 px |
| Sidebar recolhida | ~64–72 px |
| Input | ~40–44 px |
| Botão padrão | ~40 px |
| Linha de tabela | ~44–48 px |

A sidebar fica deliberadamente entre templates administrativos mais estreitos e o projeto institucional mais largo, preservando espaço para rótulos em português como `Movimentações`, `Laboratórios` e `Estagiários`.

## Cards e tabelas

Regra de uso:

```text
card
→ resumo
→ indicador
→ agrupamento de informação
→ dashboard

tabela
→ operação
→ consulta repetitiva
→ pedidos
→ estoque
→ movimentações
→ cadastros
```

Não transformar cada registro operacional em um card grande quando uma tabela for mais eficiente.

---

# 11. Motion e continuidade espacial

O SGL deve transmitir a sensação de **aplicação contínua**, e não de várias páginas independentes abrindo e fechando.

A referência principal para este comportamento é o `PanJiaChen/vue-admin-template`, especialmente a ideia de transição entre rotas com combinação de fade e pequeno deslocamento horizontal.

Princípio aprovado:

> Navegar no SGL deve parecer mover-se dentro do sistema, e não fechar uma página para abrir outra.

## Troca entre páginas

Conceito:

```text
página atual
→ perde opacidade
→ desloca-se suavemente alguns pixels

nova página
→ entra do sentido complementar
→ ganha opacidade
→ assume a mesma área de conteúdo
```

A transição deve ser curta e discreta. A referência de movimento fica em aproximadamente **20–30 px**, com duração percebida na faixa de **250–350 ms**.

Esses valores serão validados no protótipo antes da implementação definitiva.

## Shell estável

Durante a troca de rota:

```text
sidebar
→ permanece

topbar
→ permanece

estrutura global
→ permanece

área central de conteúdo
→ realiza a transição
```

Esse comportamento reforça a noção de continuidade espacial.

## Transições por contexto

```text
rota principal
→ fade + pequeno deslocamento horizontal

breadcrumb / título
→ transição ainda mais discreta

modal
→ fade + elevação suave
→ não usar o mesmo slide lateral das páginas

drawer
→ deslize lateral coerente com sua origem física

dropdown / menu flutuante
→ aparição curta e discreta
```

## Regras de motion

- animação não deve atrasar a operação;
- evitar movimentos longos ou decorativos;
- preservar posição e estrutura do shell;
- evitar saltos de layout durante loading;
- feedback de ação deve ser mais rápido que transição de página;
- futuramente respeitar preferência do usuário por movimento reduzido (`prefers-reduced-motion` ou equivalente da stack escolhida).

Motion é parte da experiência visual, mas não deve esconder lentidão real nem substituir estados de loading.

---

# 12. Estado atual da identidade

## Fechado

- referência institucional: Publica / Embrapa;
- referências administrativas: iView Admin, Vue TypeScript Admin Template e Vue Admin Template;
- direção visual clean e corporativa;
- predominância branco + azul;
- azul como cor principal;
- verde como apoio institucional/semântico;
- paleta base aprovada;
- Inter como tipografia principal;
- login do Publica como referência estrutural do login SGL;
- densidade média-compacta;
- grade conceitual de espaçamento;
- bordas discretas;
- arredondamento moderado;
- sombras mínimas e hierárquicas;
- dimensões-base de shell e controles;
- cards para resumo e tabelas para operação;
- continuidade espacial entre rotas;
- transição de página com fade + pequeno deslocamento horizontal;
- sidebar/topbar estáveis durante navegação.

## Próximos conceitos a definir

- estilo de ícones;
- shell principal: sidebar + topbar + conteúdo;
- comportamento visual da sidebar aberta/recolhida;
- hierarquia de títulos e breadcrumbs dentro do shell;
- padrões de tabelas, formulários e estados.

Nenhum desses itens deve ser tratado como código até o momento de implementação correspondente.
