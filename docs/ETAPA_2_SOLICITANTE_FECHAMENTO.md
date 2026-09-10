# Etapa 2 — fechamento visual do Solicitante

## Status

Concluída e validada — 10/09/2026.

## Escopo desta rodada

Aplicação do Dark Mode aprovado às três interfaces restantes do Solicitante:

- `/meus-residuos`;
- `/pedidos/novo`;
- `/residuos/novo`.

Com Dashboard e Meus pedidos já aprovados anteriormente, esta rodada tem como objetivo encerrar visualmente todo o lado do Solicitante antes de avançar para Gestão.

## Regras preservadas

- nenhuma regra de negócio foi alterada;
- nenhuma chamada de serviço foi modificada;
- Login e 404 continuam claros;
- o tema Light permanece como já aprovado na Etapa 1;
- Resíduos operacionais permanecem neutros em repouso;
- creme/âmbar em Resíduos aparece apenas em estado, seleção, foco ou hover coerente;
- Pedido mantém azul como ação/identidade principal;
- cores semânticas continuam representando estado real;
- formulários, drawers, estados vazios e mensagens foram cobertos no Dark Mode.

## Meus resíduos

Ajustes:

- cards de resumo em navy com diferenciação por situação;
- busca/filtro escuros;
- lista de resíduos em superfície navy;
- status pills adaptados;
- hover âmbar discreto nos itens interativos;
- drawer de detalhes integralmente escuro;
- origem, composição, riscos e andamento com hierarquia legível.

## Novo pedido

Ajustes:

- contexto do solicitante/laboratório;
- formulário principal;
- campos, selects e textarea;
- urgência;
- linhas de materiais;
- remoção de item;
- mensagens de erro;
- rodapé e ação de envio.

## Informar resíduo

Ajustes:

- contexto;
- formulário principal;
- campos;
- seleção de riscos;
- cards de componentes;
- origem catálogo/livre;
- componente principal;
- avisos;
- rodapé;
- estado de sucesso.

## Próximo passo

Validar as três telas em Light e Dark.

Se aprovadas:

```text
Solicitante concluído
→ merge desta rodada
→ iniciar interfaces da Gestão
```


## Ajustes após primeira validação

Com base na conferência visual das três telas:

- Novo pedido: alinhamento dos campos, textos auxiliares e botão de remoção refinado;
- Informar resíduo: bloco futuro de Resíduo pré-cadastrado integrado à paleta Dark mesmo enquanto permanece bloqueado;
- Meus resíduos: drawer de detalhes ganhou maior contraste, tipografia e separação de informações;
- observações do laboratório e da Gestão passaram a usar blocos próprios de leitura, seguindo a hierarquia adotada em Meus pedidos.

Esses ajustes são exclusivamente visuais e não alteram a regra de negócio.


## Validação final

O conjunto completo de interfaces do Solicitante foi validado em Dark Mode.

Interfaces fechadas:

- `/inicio`;
- `/meus-pedidos`;
- `/meus-residuos`;
- `/pedidos/novo`;
- `/residuos/novo`.

A última correção ajustou o espaçamento interno dos cards de resíduos para impedir que a barra lateral de interação invadisse o conteúdo textual.

Próximo passo: iniciar a aplicação tela a tela do Dark Mode nas interfaces da Gestão.
