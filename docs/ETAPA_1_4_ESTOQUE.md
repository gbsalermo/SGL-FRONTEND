# Etapa 1.4 — Aplicação visual em Estoque

## Status

Em validação visual.

## Escopo

Telas cobertas nesta rodada:

- Gestão/Admin: `/estoque`
- Gestão/Admin: `/estoque/lotes-vencendo`
- Gestão/Admin: `/estoque/:id`

Nenhuma regra de negócio, service, API, rota, regra FIFO/FEFO, cálculo de saldo, entrada, descarte ou edição de lote foi alterada.

## Regra visual

Estoque utiliza o padrão branco/neutro do SGL em superfícies normais.

Cores fortes ficam reservadas a significado operacional:

- azul = ação e informação;
- verde = situação válida/sucesso;
- amarelo/laranja = atenção e proximidade de vencimento;
- vermelho = vencido, zerado, descarte ou estado crítico;
- cinza = neutro, esgotado ou sem interação conforme contexto.

Não há coloração de domínio estática nas superfícies comuns.

## Principais ajustes

- título de página em 24 px;
- textos operacionais em 14 px e auxiliares em 12 px;
- labels em 13 px;
- botões e campos em 40 px;
- controles com raio 6 px;
- cards/tabelas com raio 8 px;
- sombras reduzidas;
- funil de filtro em área 40 × 40 px;
- chevrons da listagem em área 40 × 40 px com desenho gráfico;
- tabelas com maior legibilidade em zoom 100%;
- chips de situação com tamanho mínimo legível;
- detalhe de lote, filtros, modais e formulários padronizados;
- foco visível e reduced-motion preservados.

## Checklist — `/estoque`

- [ ] título, breadcrumb e descrição legíveis;
- [ ] botão `Atualizar` com tamanho coerente;
- [ ] cards de resumo claros;
- [ ] baixo estoque e zerado continuam semanticamente destacados;
- [ ] busca com 40 px;
- [ ] botão de filtros usa funil claro e área 40 × 40 px;
- [ ] abrir/recolher filtros funciona;
- [ ] selects de filtros alinhados;
- [ ] limpar filtros funciona;
- [ ] tabela legível em zoom 100%;
- [ ] chips de situação claros;
- [ ] chevron de detalhe grande e centralizado;
- [ ] clicar linha ou chevron abre o detalhe correto;
- [ ] responsividade preservada.

## Checklist — `/estoque/lotes-vencendo`

- [ ] título e contexto de validade legíveis;
- [ ] Voltar ao estoque funciona;
- [ ] Atualizar funciona;
- [ ] cards de 30 dias / 7 dias / hoje preservam significado semântico;
- [ ] busca funciona;
- [ ] limpar busca funciona;
- [ ] tabela legível;
- [ ] prazo crítico/atenção/próximo continua distinguível;
- [ ] chevron abre o lote correto;
- [ ] responsividade preservada.

## Checklist — `/estoque/:id`

- [ ] contexto do produto legível;
- [ ] quantidade disponível e forma de visualização legíveis;
- [ ] seletor de visualização por embalagem funciona;
- [ ] cards de vencimento/vencidos preservam cores semânticas;
- [ ] busca e situação dos lotes funcionam;
- [ ] tabela de lotes legível;
- [ ] `Ver detalhes` possui chevron claro;
- [ ] destaque de lote vindo da rota usa azul institucional;
- [ ] Nova entrada de lote abre e fecha corretamente;
- [ ] inputs/selects do modal estão alinhados;
- [ ] entrada continua sendo registrada normalmente;
- [ ] detalhes do lote abrem corretamente;
- [ ] edição do lote continua funcionando;
- [ ] histórico de saídas continua legível;
- [ ] descarte de vencidos mantém tratamento vermelho/crítico;
- [ ] modal de descarte continua funcionando;
- [ ] mensagens de sucesso/erro permanecem visíveis;
- [ ] responsividade preservada.

## Fora do escopo

Esta rodada não altera unidades, apresentações, estoque, lotes ou Pedidos em nível de domínio. A normalização de unidades e a evolução estrutural de Pedidos permanecem na Etapa 7 do plano canônico.

Dark Mode permanece reservado para a Etapa 2.
