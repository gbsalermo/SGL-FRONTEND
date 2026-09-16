# Etapa 1.3 — Componentes visuais básicos do SGL

**Etapa:** 1 — Padronização e refinamento visual global  
**Subetapa:** 1.3 — Padronizar componentes básicos  
**Status:** ✅ concluída  
**Data:** 09/09/2026

Este documento registra a camada de componentes compartilhados criada a partir das decisões da Etapa 1.1 e da fundação da Etapa 1.2.

## 1. Regra principal

O SGL possui duas experiências autenticadas principais:

```text
Gestão / Administração
→ GestaoLayout.vue

Solicitante / usuário comum
→ SolicitanteLayout.vue
```

As duas interfaces devem utilizar a **mesma linguagem visual e os mesmos componentes básicos**.

Não criar componentes duplicados como:

```text
BotaoGestao
BotaoSolicitante
CardGestao
CardSolicitante
```

quando a diferença for apenas visual.

O que muda entre as interfaces é o fluxo, a informação e as permissões; a identidade visual permanece comum.

A tela de Login continua fora do refinamento das interfaces autenticadas.

## 2. Componentes compartilhados criados

Em `src/components/common`:

```text
SglButton.vue
→ ação primária, secundária e de perigo

SglIconButton.vue
→ botão icon-only 40 × 40 px

SglChevronButton.vue
→ setas grandes e centralizadas para expandir, recolher, avançar e voltar

SglFilterButton.vue
→ botão de filtro com símbolo de funil e contador opcional

SglCard.vue
→ card de conteúdo, navegável ou KPI

SglStatusChip.vue
→ status semântico neutro, azul, verde, amarelo ou vermelho

SglTextField.vue
→ campo de texto baseado em Vuetify e nos tokens SGL

SglSelect.vue
→ select baseado em Vuetify e nos tokens SGL

SglBreadcrumb.vue
→ breadcrumb comum utilizando separador `/`
```

Os exports estão centralizados em `src/components/common/index.ts`.

## 3. Relação com Vuetify

Os componentes básicos usam Vuetify como base quando isso agrega valor, preservando a decisão de não reconstruir todo o MVP nem migrar todas as Views de uma só vez.

A iconografia operacional deixa de ser desenhada isoladamente em cada tela. Controles de filtro e chevron passam a ter desenho centralizado em componentes compartilhados, permitindo evolução futura da família MDI em um único ponto sem espalhar alterações pela aplicação.

## 4. Regras preservadas

```text
controle comum        40 px
icon-only             40 × 40 px
ícone comum           20 px
chevron               24 px
raio controle         6 px
raio superfície       8 px
```

Filtros usam funil.

Setas de interação devem ser grandes, centralizadas e possuir área de clique própria.

Breadcrumbs permanecem discretos e usam `/`; não precisam utilizar chevrons de interação.

Cores semânticas:

```text
azul      → ação / informação
verde     → sucesso
amarelo   → atenção
vermelho  → erro / crítico / urgência
cinza     → neutro / sem interação
```

## 5. Escopo desta subetapa

A 1.3 cria e estabiliza os componentes básicos.

Ela **não** substitui ainda todos os elementos existentes das Views. Essa migração pertence à Etapa 1.4 e será progressiva para proteger o MVP aprovado.

Nenhuma regra de negócio deve ser alterada por essa migração.

Dark Mode continua fora da Etapa 1 e será tratado somente na Etapa 2.

## 6. Próximo passo — Etapa 1.4

A aplicação tela a tela deve contemplar as duas interfaces desde o início.

Primeiro piloto definido:

```text
Gestão
→ PedidosGestaoView.vue

Solicitante
→ MeusPedidosView.vue
```

Objetivo do piloto:

- aplicar botões comuns;
- substituir setas locais pelo `SglChevronButton`;
- usar funil padronizado onde houver filtros expansíveis;
- aplicar cards/status/campos compartilhados quando compatível;
- comparar ambos os lados antes de expandir a migração para outros módulos.

Depois do piloto validado, seguir progressivamente pelas demais telas autenticadas.
