# Etapa 9 — Integração da Central de Relatórios (26/10/2026)

**Branch:** `collab/etapa-9-relatorios-consolidados`  
**Situação em 27/10/2026:** implementado e validado funcionalmente pelo mantenedor na branch, com confirmações locais de suíte/build e verificação de prévias e exportações ao longo da etapa. **Sem merge ou homologação formal de produção.** Os checklists anteriores permanecem como histórico de validação à época dos commits.

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

## Roteiro de regressão (histórico; validações funcionais confirmadas posteriormente pelo mantenedor)

1. `npm run build` na branch.
2. Prévia de Projetos vazia e com dados, incluindo filtros isolados e combinados.
3. Exportação PDF/XLSX e conferência de valores, nomes, quebras e layout com a prévia.
4. Movimentações: alternar Resumo/Detalhamento; confirmar que filtros e exports seguem cada modo.
5. Verificar Resíduos e Pessoas por laboratório, modos claro/escuro, mobile e mensagens de erro.
6. Verificar console/rede e primeiro carregamento.

**Observação:** não foram alterados os endpoints existentes nem realizadas medições de carga. A carga inicial de catálogos da Central permanece pendente de revisão de desempenho local, conforme auditoria 9.1.

## 9.3 — Filtro avançado por embalagem (27/10/2026)

- O Detalhamento de Movimentações expõe `tipoEmbalagem` opcional, combinado aos filtros já existentes por produto, tipo, origem, laboratório, usuário, lote e período.
- Valores compatíveis com `TipoEmbalagem`: `UNITARIO`, `FRASCO`, `AMPOLA`, `GARRAFA`, `GALAO`, `CAIXA`, `KIT`, `PACOTE`, `SACO`, `TUBO`, `POTE`, `PAR`, `OUTRO`.
- A API usa os vínculos reais `MovimentacaoRecipiente` e `RecipienteEstoque` para selecionar IDs distintos de movimentações por Unidade. Não deduz embalagem do Produto.
- Mesmos parâmetros na prévia e no download PDF/XLSX.
- O modo Resumo preserva o contrato antigo, sem filtro por embalagem nesta implementação. O filtro está disponível no modo Detalhamento.
- A seleção exige movimentação rastreada por recipiente; registros legados sem vínculo não são classificados artificialmente em embalagens.
- Testes automatizados adicionados; execução da suíte e validação visual permanecem pendentes do mantenedor.

## Simplificação do Resumo (27/10/2026)

- Removido da interface o filtro **Posições do ranking (Top 5/10/20)**.
- Removidas as seções visuais de ranking de entradas, saídas e lotes.
- Resumo exibe somente **contagem de ocorrências**: movimentações, entradas, saídas, devoluções, ajustes e descartes. Não soma unidades físicas incompatíveis.
- Backend passou a preencher `totalEntradas`, `totalSaidas`, `totalDevolucoes`, `totalAjustes` e `totalDescartes` no DTO; exportação PDF/XLSX usa contagens e tabela simples `Ocorrências por tipo`.
- O endpoint, os campos legados e as consultas de ranking no service foram preservados temporariamente para compatibilidade com consumidores e testes existentes; **o frontend e as exportações novas não exibem rankings**. Remoção técnica definitiva desses contratos somente após auditoria dos demais consumidores.
- Testes de contagens e XLSX adicionados ao backend. Compilação, suíte e homologação visual ainda dependem de validação local.

## Modalidade de consumo por parcela histórica (27/10/2026)

O Detalhamento agora separa explicitamente:
- `tipoEmbalagem`: categoria do **recipiente físico**, filtrada entre tipos que efetivamente constam de movimentações do produto;
- `formaConsumo`: modalidade **inferida de forma conservadora a partir do snapshot histórico de cada parcela**. `COMPLETA` apenas se `quantidadeAnterior == capacidadeInicial` e `quantidadeMovimentada == capacidadeInicial`; `POR_MEDIDA` se a retirada não corresponde a uma apresentação inteira; `MISTA` se há ambos os casos na mesma movimentação; `NAO_DETERMINADA` se faltam dados suficientes;
- `quantidadeMovimentada` + `unidadeMedida`: quantidade física efetivamente consumida, independente de quantos recipientes foram tocados.

Um frasco de 500 mL de que saem 30 mL é **por medida** mesmo que o recipiente identificado seja FRASCO. Um kit de reações pode ter retiradas unitárias identificadas do mesmo modo. Não converter mL em frascos, nem assumir apresentação completa baseada apenas em um rótulo de embalagem.

A classificação atual é um **indicador derivado dos snapshots históricos**, não um novo campo de intenção do pedido persistido no momento da operação. Um registro de uma retirada integral de um recipiente cheio não prova por si só a intenção do usuário de solicitar uma apresentação inteira. Para auditoria normativa futura que dependa dessa intenção, a captura explícita da modalidade no fluxo de pedido/entrega precisa de contrato e migration próprios, sem reinterpretar retroativamente registros históricos.

Todos os filtros na prévia são encaminhados também à exportação; o PDF/XLSX exibe a forma de consumo identificada. Testes de serviço e controller foram atualizados; suíte e build ainda requerem execução local.

## Complemento — Consumo por apresentação e por medida

Implementado filtro opcional `formaConsumo` em prévia e exportações:
- `COMPLETA`: parcela de um recipiente cheio cuja retirada abrange exatamente sua capacidade inicial;
- `POR_MEDIDA`: parcela registrada abaixo da capacidade de uma apresentação inteira;
- `MISTA`: na mesma movimentação existem parcelas completas e por medida;
- `NAO_DETERMINADA`: não há dados históricos suficientes.

O tipo de embalagem (`FRASCO`, `KIT` etc.) continua sendo exclusivamente a **categoria física do recipiente**. Uma saída de 30 mL de um frasco de 500 mL pode ser filtrada como **FRASCO + POR_MEDIDA** e não se torna “um frasco completo”.

**Limite de confiabilidade:** são categorias **inferidas do consumo efetivo**, não prova da intenção do solicitante. O sistema ainda não persiste a modalidade originalmente pedida como dado imutável. Para auditoria da modalidade intencional futura, prever captura explícita e migração própria, sem alterar o histórico.

`mostrarQuantidades` é opcional na exportação de movimentações: por padrão os arquivos mostram contagem/ocorrências e colunas operacionais sem saldo/quantidade; quando verdadeiro incluem quantidade física e saldo. O método legado de exportação permanece compatível. Reexecutar testes backend e build frontend antes de homologar.

## Extensão de modelagem — Estoque/Lotes e Fiscalização (27/10/2026)

**Estoque/Lotes**: consulta de leitura passou a expor por lote a apresentação cadastrada, o conteúdo por apresentação e contagens de recipientes por estado físico FECHADO/ABERTO/ESGOTADO, preservando saldo e unidade canônica. A prévia e PDF/XLSX incluem os dados, sem modificar FEFO/FIFO ou operações de estoque.

**Fiscalização**: rastreabilidade das movimentações passou a apresentar número de registros de recipientes envolvidos e os respectivos tipos físicos de embalagem. Não se converte volume em número de frascos entregues, nem se afirma que uma retirada parcial equivale a uma apresentação completa. Prévia e PDF/XLSX foram alinhados.

Os dados vêm de registros existentes e são consultados no contexto de Unidade. Nenhuma alteração de entidades ou migrations foi necessária. Os demais relatórios não foram ampliados.

**Validação pendente**: executar `./mvnw clean verify` no backend e `npm run build` no frontend; comparar prévia, PDF e Excel, em especial lotes com recipientes abertos, kits, lotes sem recipientes rastreados e movimentos fiscalizados.


## Checkpoint de fechamento — 27/10/2026

A validação funcional da Etapa 9 foi confirmada pelo mantenedor. Entregas: Projetos, Movimentações Resumo/Detalhamento sem ranking, apresentação/unidade reutilizando a terminologia do Novo Pedido, quantidades opcionais (seleção automática ao escolher por medida), filtros de contexto, Estoque/Lotes com apresentações/recipientes e Fiscalização com rastreabilidade. Os endpoints e relatórios pré-existentes permanecem acessíveis. A classificação da forma de consumo em movimentações antigas é inferida dos snapshots e não substitui persistência explícita da modalidade solicitada.

Ainda fora deste aceite: carga/concorrência, E2E de toda a aplicação, autenticação institucional real, validação de segurança de produção e merge. Não realizar mudanças funcionais adicionais sem nova demanda; próximo passo é merge pelo responsável após revisão documental.
