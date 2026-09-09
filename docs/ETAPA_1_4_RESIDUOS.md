# Etapa 1.4 — Aplicação visual em Resíduos

## Status

Validação visual concluída quanto à estrutura, tipografia, responsividade e comportamento. Ajuste final de cor aplicado para conferência antes do merge.

## Escopo

Telas cobertas nesta rodada:

- Gestão/Admin: `/residuos`
- Solicitante: `/meus-residuos`
- Solicitante: `/residuos/novo`

Nenhuma regra de negócio, service, API, rota ou transição de status foi alterada.

## Objetivo visual

Aplicar o padrão fechado na Etapa 1.1 preservando a clareza operacional do SGL.

### Regra final de cor para Resíduos

A diferenciação amarela/creme por domínio permanece no **Dashboard do Solicitante**, onde ajuda a separar visualmente Pedidos e Resíduos.

Nas telas operacionais de Resíduos, a regra é diferente:

```text
estado normal
→ superfícies brancas/neutras

hover de elemento interativo
→ creme/amarelo muito suave
```

O creme não deve permanecer como fundo decorativo estático nessas telas.

As cores semânticas continuam independentes dessa regra:

- azul = ação/informação;
- verde = sucesso;
- amarelo = atenção/status quando aplicável;
- vermelho = erro/crítico;
- neutro = conteúdo sem estado especial.

## Principais ajustes

- títulos de página em 24 px;
- seções em 18 px e cards em 16 px;
- textos operacionais e auxiliares elevados para pelo menos 12 px nos pontos cobertos;
- controles e botões em 40 px;
- raio de controles em 6 px e superfícies em 8 px;
- sombras reduzidas;
- superfícies operacionais brancas/neutras;
- creme suave reservado ao hover de elementos interativos;
- tabela da Gestão com tipografia e espaçamento ampliados;
- ações operacionais da Gestão padronizadas em azul;
- status continuam com cores semânticas próprias;
- `Ver detalhes` do Solicitante utiliza chevron gráfico de 24 px em vez de seta Unicode;
- foco visível e reduced-motion tratados.

## Checklist — Solicitante `/meus-residuos`

- [x] título, breadcrumb e descrição legíveis;
- [x] botão `Informar resíduo` com 40 px;
- [x] cards de resumo equilibrados;
- [x] busca e status alinhados;
- [x] superfícies normais brancas/neutras;
- [x] creme suave apenas no hover dos cards interativos;
- [x] status facilmente identificáveis;
- [x] `Ver detalhes` com chevron grande e claro;
- [x] drawer de detalhes legível;
- [x] composição, risco e andamento sem fontes pequenas;
- [x] responsividade preservada.

## Checklist — Solicitante `/residuos/novo`

- [x] contexto de gerador/laboratório legível;
- [x] blocos e seções sem creme estático decorativo;
- [x] inputs/selects com 40 px;
- [x] labels e textos auxiliares legíveis;
- [x] seleção de risco clara;
- [x] adicionar/remover componente funcionando;
- [x] alternância catálogo/componente livre funcionando;
- [x] componente principal funcionando;
- [x] mensagens de erro/aviso legíveis;
- [x] envio do resíduo funcionando;
- [x] superfície de sucesso legível;
- [x] responsividade preservada.

## Checklist — Gestão `/residuos`

- [x] título e métricas legíveis;
- [x] abas de status com contadores claros;
- [x] busca com 40 px;
- [x] tabela legível em zoom 100%;
- [x] linhas não utilizam textos minúsculos;
- [x] superfícies normais brancas/neutras;
- [x] creme suave preservado no hover das linhas;
- [x] status continuam semanticamente distintos;
- [x] Receber funciona;
- [x] Analisar funciona;
- [x] Armazenar funciona;
- [x] Despachar funciona;
- [x] Visualizar rótulo continua disponível somente quando permitido;
- [x] drawer de detalhes legível;
- [x] histórico/rastreabilidade legível;
- [x] modais operacionais legíveis;
- [x] responsividade preservada.

## Fora do escopo

Não antecipar nesta rodada os refinamentos funcionais da Etapa 3, incluindo mudanças de fluxo, rótulo, impressão Zebra ou regras adicionais de armazenamento. Aqui a intervenção é exclusivamente visual.

Dark Mode permanece reservado para a Etapa 2.
