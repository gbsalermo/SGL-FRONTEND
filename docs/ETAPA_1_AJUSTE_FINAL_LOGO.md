# Etapa 1 — Ajuste final da logo e sidebar

## Status

Concluído e validado em 10/09/2026.

## Contexto

Após o fechamento visual da Etapa 1, foi solicitado um último acabamento na posição da marca SGL nas duas interfaces autenticadas. Durante a validação também foi identificado um erro no recolhimento da sidebar da Gestão, com falha de atualização do DOM no Vue (`insertBefore`).

## Solução final

A solução definitiva foi aplicada diretamente nos layouts, sem manter a camada CSS externa usada nas primeiras tentativas.

### Gestão

- elementos de apresentação ligados ao estado `recolhida` passaram de `v-if` para `v-show`, evitando destruição e recriação desnecessária de nós durante o recolhimento;
- o perfil permanece montado e tem apenas as informações secundárias ocultadas visualmente no modo recolhido;
- a navegação permanece funcional com a sidebar aberta e recolhida;
- a logo foi ajustada diretamente no `GestaoLayout.vue`, com compensação óptica para cima e para a esquerda;
- no modo recolhido, a marca volta a exibir somente o símbolo do frasco do SGL, preservando o comportamento visual aprovado.

### Solicitante

- a logo foi ajustada diretamente no `SolicitanteLayout.vue`;
- foi aplicada compensação própria para a diferença de dimensões/padding da sidebar do Solicitante, mantendo o mesmo alinhamento percebido da Gestão;
- navegação e demais elementos do layout não foram alterados.

## Validação realizada

Foram validados:

- Gestão com sidebar expandida;
- recolhimento e expansão da sidebar sem erro de `insertBefore`;
- navegação entre os principais endpoints no modo recolhido;
- botão de tema no modo recolhido;
- perfil no modo recolhido;
- logo da Gestão aberta e recolhida;
- logo do Solicitante;
- ausência de regressão funcional nas interfaces testadas.

## Resultado

Com este ajuste aprovado, a Etapa 1 — Padronização e refinamento visual global — está concluída. O próximo trabalho do roadmap é a Etapa 2 — Dark Mode definitivo.
