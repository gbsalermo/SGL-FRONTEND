# Etapa 1.4 — Aplicação visual em Movimentações

## Status

Em validação visual e funcional.

## Escopo

Tela coberta:

- Gestão/Admin: `/movimentacoes`

Nenhuma regra de negócio, service, API, rota, cálculo de saldo ou vínculo com lote/pedido foi alterado.

## Objetivo visual

Aplicar o padrão visual consolidado na Etapa 1.1 à tela de Movimentações, preservando a semântica operacional do histórico de estoque.

## Regras visuais aplicadas

- superfícies normais brancas/neutras;
- verde reservado a entrada/devolução;
- amarelo reservado a ajuste/atenção;
- vermelho reservado a descarte/crítico;
- saída permanece azul/neutra;
- título de página em 24 px;
- corpo em 14 px;
- labels em 13 px;
- auxiliares em 12 px;
- botões e campos em 40 px;
- raio 6 px em controles e 8 px em superfícies;
- sombras reduzidas;
- tabela e chips com legibilidade ampliada;
- caracteres `⌃/⌄` substituídos visualmente por chevron gráfico de 24 px em alvo 40 × 40 px;
- detalhe expandido com maior espaçamento e tipografia mais legível;
- foco visível e reduced-motion preservados.

## Checklist `/movimentacoes`

- [ ] título e descrição legíveis;
- [ ] botão Atualizar em 40 px;
- [ ] cards de resumo equilibrados;
- [ ] cores de Entrada/Saída/Ajuste/Descarte semanticamente coerentes;
- [ ] busca funcionando;
- [ ] abrir/recolher filtros funcionando;
- [ ] filtro por tipo funcionando;
- [ ] filtro por origem funcionando;
- [ ] filtros de data funcionando;
- [ ] ordenação funcionando;
- [ ] limpar filtros funcionando;
- [ ] tabela legível em zoom 100%;
- [ ] produto, lote, responsável e saldo legíveis;
- [ ] chips de tipo legíveis;
- [ ] chevron de detalhe grande e claro;
- [ ] abrir/recolher detalhe funcionando;
- [ ] laboratório, solicitante, pedido, lote e observação legíveis no detalhe;
- [ ] destaque vindo por query/highlight continua funcionando;
- [ ] responsividade preservada.

## Fora do escopo

- nenhuma alteração em estoque ou movimentação backend;
- nenhuma mudança em FIFO/FEFO;
- nenhuma mudança de origem/tipo de movimentação;
- Dark Mode permanece para a Etapa 2;
- relatórios e exportações permanecem em suas etapas próprias.

## Regra de merge

Não mergear antes da validação visual e funcional pelo responsável do projeto.
