# Etapa 1 — Ajuste final da logo e sidebar

## Status

Em validação.

## Contexto

Após o fechamento visual da Etapa 1, foi solicitado um último acabamento na posição da marca SGL nas duas interfaces autenticadas.

A primeira tentativa de compensação visual não produziu diferença perceptível suficiente e, durante a validação, a sidebar recolhida da Gestão também apresentou comportamento inadequado para navegação entre rotas.

## Correção atual

A revisão atual trata os dois pontos em conjunto:

- reforça a centralização óptica da marca nas interfaces de Gestão e Solicitante;
- aumenta levemente a presença visual da logo sem alterar o asset original;
- usa seletores com prioridade suficiente para vencer os estilos `scoped` dos layouts;
- isola completamente o comportamento da marca quando a sidebar da Gestão está recolhida;
- amplia a sidebar recolhida para 80 px, preservando espaço seguro para os ícones;
- garante alvos de navegação centralizados e clicáveis no modo recolhido;
- mantém a largura do workspace sincronizada com a largura efetiva da sidebar;
- preserva o comportamento responsivo em telas menores.

## Validação obrigatória antes do merge

1. Gestão com sidebar expandida: conferir centralização da logo.
2. Gestão com sidebar recolhida: navegar por Dashboard, Estoque, Movimentações, Relatórios, Estagiários, Resíduos e Pedidos.
3. Expandir novamente e confirmar que layout e navegação permanecem estáveis.
4. Solicitante: conferir centralização da logo e navegação normal.
5. Confirmar ausência de regressão em conteúdo, rotas e responsividade.

Somente após essa validação a Etapa 1 deve ser marcada como definitivamente concluída e a Etapa 2 — Dark Mode definitivo — pode ser iniciada.
