# Etapa 11 — Estagiários multilaboratório

**Branch:** `collab/etapa-11-estagiarios-multilaboratorio` (base `main` DEV).
**Estado:** auditoria inicial; implementação e homologação pendentes.
**Escopo:** permitir participações simultâneas em atividades/projetos de diferentes laboratórios da mesma unidade, e pedidos separados por laboratório conforme participação elegível. Não modificar autenticação institucional ou a branch `release`.

## Achados verificados no código da main

- O tipo `VinculoEstagioAtividadeResponse` já contém `laboratorioId`, `laboratorioNome`, `projetoId`, `sciId` e `atividadeId`. Um vínculo de estágio contém uma coleção de participações.
- `EstagiariosGestaoView.vue` já calcula quantidade de laboratórios distintos a partir das participações ativas (`contagemContexto`); o laboratório legado de `EstagiarioResponse` não deve ser usado como autorização exclusiva.
- `PedidoService.resolverContextoPedido` exige `participacaoId` para estagiários, busca participação do próprio usuário/unidade, avalia elegibilidade, deriva laboratório do projeto da participação e rejeita `laboratorioId` divergente.
- `PedidoService.validarConsistenciaPedido` explicitamente dispensa a igualdade com laboratório-base para estagiários, mantendo verificação de unidade/tenant.
- Os vínculos operacionais adicionais da Etapa 8 são destinados a outros perfis; para estagiários, usar `VinculoEstagioAtividade`.

## Contrato funcional proposto

1. Um único cadastro de estagiário e vínculo institucional podem conter N participações simultâneas em atividades de laboratórios diferentes da **mesma unidade**, sem duplicar usuário ou estágio.
2. A autorização operacional decorre da **participação elegível**; vínculo encerrado, participação inativa, contexto vencido ou laboratório inativo não autorizam novos pedidos.
3. Cada pedido tem **um único laboratório**, determinado no servidor pela participação escolhida. Um estagiário pode abrir pedidos distintos para laboratórios diferentes, mas não misturar itens de estoques distintos em um pedido.
4. Na interface, exibir laboratório e projeto de cada participação, inclusive quando houver nomes de atividades repetidos. A seleção de participação determina o laboratório do pedido; nunca confiar apenas no laboratório-base ou em um seletor arbitrário.
5. Preservar histórico e snapshots de pedidos; encerramento de participação revoga novos pedidos naquele contexto sem alterar pedidos históricos.
6. Respeitar isolamento por unidade/tenant e regras atuais de estoque, FEFO/FIFO, aprovação, treinamento e permissões.

## Auditoria antes da implementação

- Backend (alterações manuais pelo responsável): conferir validações em `VinculoEstagioAtividadeService`, repositório de participações, `ElegibilidadeContextoOperacional`, consulta de contextos elegíveis, `PedidoService` e `ResiduoService`. Verificar se a associação de atividade impede indevidamente laboratórios distintos e se a listagem por laboratório considera participações, não apenas laboratório legado.
- Frontend: conferir fluxo completo de Pedido de Materiais e Soluções, seleção de participação, atualização de laboratório/projeto e estado de seleção ao trocar de contexto; conferir listagem e drawer de Estagiários.
- Comparar arquivos afetados com `gitlab/release` **sem mesclar autenticação institucional na main**.

## Cenários de aceite

- 0 participações: pedido bloqueado com mensagem clara.
- 1 participação: comportamento atual preservado.
- 2 participações elegíveis no mesmo laboratório: ambas identificáveis por projeto/atividade.
- 2 participações elegíveis em laboratórios diferentes da mesma unidade: criar pedido A para laboratório A e pedido B para laboratório B, sem contaminação de estoque.
- Participação encerrada/inativa/inelegível: pedido rejeitado também pelo backend, inclusive payload forjado.
- Laboratório de outra unidade: rejeição.
- Pedido com `participacaoId` A e `laboratorioId` B: rejeição.
- Pedido histórico preservado após encerramento da participação.
- Testes de regressão: autorização, tenant, estoque, FEFO/FIFO, fluxos, build, responsividade e Light/Dark.

**Não considerar a Etapa 11 implementada ou validada apenas por este documento.**
