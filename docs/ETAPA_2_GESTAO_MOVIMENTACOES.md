# Etapa 2 — Movimentações da Gestão

## Status

Em validação — 10/09/2026.

## Escopo

Aplicação do Dark Mode definitivo em:

- `/movimentacoes`;
- `MovimentacoesGestaoView.vue`.

## Regra de paridade com o Light Mode

A adaptação preserva:

- título de página em 24px;
- corpo em 14px;
- labels em 13px;
- helpers em 12px;
- controles em 40px;
- chevrons em alvo 40 × 40px;
- mesma organização, espaçamento e densidade;
- mesma legibilidade do detalhe expandido;
- mesma intensidade relativa dos destaques.

## Diferenciação estática por tipo

Mantida a decisão visual aprovada na Etapa 1:

- Entrada / Devolução → verde;
- Saída → azul;
- Ajuste → âmbar;
- Descarte → vermelho.

A cor aparece de forma suave já em repouso para ajudar a leitura da tabela densa e é intensificada no hover.

O destaque vindo de rota/query continua azul institucional e tem prioridade sobre a semântica da linha.

## Ajustes aplicados

- cards superiores em navy com semântica;
- busca e filtros em superfícies escuras;
- tabela em camadas;
- chips adaptados ao Dark;
- linhas com tonalidade estática por tipo;
- hover coerente com a ação;
- chevron gráfico preservado;
- detalhe expandido com labels e valores na mesma escala do Light;
- estados vazio/erro;
- foco visível e reduced motion.

## Restrições

- nenhuma regra de movimentação alterada;
- nenhum cálculo de saldo alterado;
- nenhum vínculo com pedido/lote alterado;
- nenhum service, rota ou payload alterado;
- Light Mode permanece intacto.

## Próximo passo

Validar `/movimentacoes` em Light e Dark antes do merge.
