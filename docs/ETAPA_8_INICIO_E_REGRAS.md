# Etapa 8 — Checkpoint de início | Frontend

**Data:** 20/10/2026
**Branch:** `collab/etapa-8-contextos-pedidos`
**Estado:** preparação documental; **nenhuma View, service ou type alterado funcionalmente**.

## Objetivo

Integrar o contexto de participação aos formulários de Pedidos e Soluções depois da validação do contrato backend. O frontend exibe contextos elegíveis, mas não autoriza nem determina o Laboratório operacional do Estagiário.

## O que já existe e deve ser reaproveitado

- `src/modules/operacao/types/contextoOperacional.ts`: seleção 0/1/N, `prepararSelecaoContextoEstagiario` e `resolverContextoEstagiario`.
- `src/modules/operacao/services/contextoOperacionalService.ts`: consulta de participações por usuário, Atividade e Projeto.
- `src/modules/pedidos/views/solicitante/NovoPedidoView.vue` e `src/modules/solucoes/views/NovaSolucaoView.vue`: formulários atuais, **ainda vinculados ao laboratório-base da sessão**.
- `src/modules/pedidos/types/pedido.ts`, `src/modules/pedidos/services/pedidoService.ts` e services/types de Soluções: adaptar somente quando o backend expuser a escrita de `participacaoId`.

## Regras visuais e funcionais

1. Estagiário: zero contextos elegíveis bloqueia envio e apresenta motivo; um admite pré-seleção; vários exigem escolha explícita de participação/Atividade.
2. O contexto escolhido mostra Atividade, SCI, Projeto e Laboratório **derivados**; nunca permite misturar identificadores livremente.
3. Técnico/Analista/Pesquisador: Projeto determina Laboratório; Pedido sem Projeto pode usar laboratório-base conforme contrato; Solução exige Projeto.
4. Gestor/Admin mantém opções de Laboratório da própria Unidade sem seleção incoerente de Projeto.
5. Nenhuma permissão pode depender apenas de filtragem da UI; o backend revalida no submit.
6. Não alterar o motor de Estoque, quantidade física, embalagem, fracionamento, FEFO/FIFO ou preparo de Solução.
7. Padrão visual obrigatório: `docs/PADRAO_VISUAL_PRE_PRODUCAO.md`, `docs/ETAPA_7_6_0_AUDITORIA_FRONTEND_PADRAO_VISUAL_PEDIDOS.md`, `src/styles/tokens.css`, `src/styles/foundation.css` e componentes comuns. Light/Dark, blur de modal, legibilidade no zoom 100%, responsividade e estados de interação.
8. Não redesenhar telas aprovadas nem duplicar famílias de CSS, services ou types; não realizar refatorações amplas.
9. Mostrar corretamente o contexto histórico dos Pedidos nas visões Solicitante/Gestão, conforme os campos que a API realmente oferecer.
10. Testes e validações precisam ser comprovados; não registrar `npm run build` como executado sem evidência.

## Fluxo institucional

`GitLab/main` canônica → `GitHub/main` espelho; commits de trabalho somente `GitHub/collab/*` → GitLab/collab por workflow; MR e merge no GitLab somente pelo responsável.

**Este commit é documental, não executa implementação de UI nem confirma sincronização institucional.**
