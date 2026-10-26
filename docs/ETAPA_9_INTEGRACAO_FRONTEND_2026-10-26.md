# Etapa 9 — Integração da Central de Relatórios (26/10/2026)

**Branch:** `collab/etapa-9-relatorios-consolidados`  
**Situação:** implementado na branch para validação local; build, testes de integração e homologação visual ainda não confirmados. **Sem merge.**

## Entregas

- A Central passou a oferecer **Projetos** com filtros por laboratório, status, situação de execução, ativo, recurso externo e intervalo opcional de execução.
- A prévia usa `GET /v1/relatorios/projetos`, com indicadores consolidados e tabela por Projeto.
- Os downloads reutilizam a barra existente e `GET /v1/relatorios/projetos/exportar`, com PDF ou XLSX e exatamente os filtros registrados na prévia.
- As opções de topo Movimentações e Resumo Operacional foram reunidas visualmente em **Movimentações**, com modos **Resumo** (endpoint `resumo-operacional`) e **Detalhamento** (endpoint `movimentacoes`). Endpoints legados preservados.
- Ao alterar filtros, tipo de relatório ou modo, a prévia e os dados de exportação são invalidados.
- O módulo dedicado de Resíduos e o seletor de Pessoas por laboratório continuam no invólucro `RelatoriosExportacaoView.vue`, sem refatoração de seus fluxos.

## Arquivos

- `src/modules/relatorios/types/projetosRelatorio.ts`
- `src/modules/relatorios/services/relatorioService.ts`
- `src/modules/relatorios/views/RelatoriosGestaoView.vue`
- `src/modules/relatorios/components/RelatorioExportacaoBar.vue`

## Validação pendente pelo mantenedor

1. `npm run build` na branch.
2. Prévia de Projetos vazia e com dados, incluindo filtros isolados e combinados.
3. Exportação PDF/XLSX e conferência de valores, nomes, quebras e layout com a prévia.
4. Movimentações: alternar Resumo/Detalhamento; confirmar que filtros e exports seguem cada modo.
5. Verificar Resíduos e Pessoas por laboratório, modos claro/escuro, mobile e mensagens de erro.
6. Verificar console/rede e primeiro carregamento.

**Observação:** não foram alterados os endpoints existentes nem realizadas medições de carga. A carga inicial de catálogos da Central permanece pendente de revisão de desempenho local, conforme auditoria 9.1.
