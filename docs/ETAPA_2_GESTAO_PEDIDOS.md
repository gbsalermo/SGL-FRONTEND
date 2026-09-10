# Etapa 2 — Pedidos da Gestão

## Status

Concluída e validada — 10/09/2026.

## Escopo

Aplicação do Dark Mode definitivo em:

- `/pedidos`;
- `PedidosGestaoView.vue`.

## Regra de paridade com o Light Mode

Esta tela foi adaptada usando diretamente o padrão aprovado na Etapa 1 como referência.

O Dark Mode preserva:

- título de página em 24px;
- corpo em 14px;
- labels em 13px;
- helpers em 12px;
- controles de 40px;
- espaçamento, densidade e organização;
- presença visual dos cards;
- hierarquia dos detalhes expandidos;
- ícones de filtro e chevron.

A diferença entre Light e Dark fica concentrada em paleta, contraste, bordas, hover, foco e cores semânticas.

## Semântica aplicada

### Resumo

- Pendentes: âmbar;
- Urgentes: vermelho;
- Aprovados: verde;
- Entregues: azul.

### Status da tabela

- Pendente: âmbar;
- Aprovado: verde;
- Rejeitado: vermelho;
- Cancelado: neutro;
- Entregue: azul;
- Urgente: vermelho.

### Detalhes

- quantidade solicitada: azul;
- quantidade aprovada: verde;
- contexto: superfície elevada;
- observação: bloco de leitura com destaque azul;
- ações de aprovação/entrega/rejeição/cancelamento preservam a semântica já aprovada.

## Restrições

- nenhuma regra de negócio alterada;
- nenhum service, store, rota ou payload alterado;
- Light Mode permanece intacto;
- Login/404 permanecem claros.

## Validação final

A interface foi validada em Light e Dark.

Ajustes finais aprovados:

- escala interna dos cards de quantidade ampliada;
- rótulo `SOLICITADA` preservado;
- estado pendente mantém `QUANTIDADE A APROVAR`;
- estados concluídos usam `APROVADA` ou `ENTREGUE`, conforme o status do pedido;
- paridade visual entre Light e Dark mantida.

## Próximo passo

Seguir para Gestão → `/estoque`.
