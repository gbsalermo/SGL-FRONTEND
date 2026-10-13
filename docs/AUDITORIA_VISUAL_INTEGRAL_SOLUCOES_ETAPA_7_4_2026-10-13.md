# AUDITORIA VISUAL INTEGRAL — ETAPA 7.4 / SOLUÇÕES
**Data:** 13/10/2026  
**Branch analisada:** `collab/etapa-7-unidades-solucoes-contexto`  
**Tipo de auditoria:** inspeção estática de componentes Vue, CSS, tokens e documentação; comparação estrutural com páginas existentes de Pedidos, Resíduos e Cadastros. **Sem navegador, screenshots capturadas pelo auditor ou execução de build**. A inspeção não substitui QA visual em ambiente local.

## Referências oficiais confrontadas

- `docs/PADRAO_VISUAL_PRE_PRODUCAO.md`, `docs/IDENTIDADE_VISUAL.md`, `docs/ETAPA_2_DARK_MODE.md`, `docs/REGRA_PADRONIZACAO_NOVOS_MODULOS.md`;
- `src/styles/tokens.css`, `src/styles/etapa-1-4-residuos.css`, `src/styles/etapa-2-gestao-residuos.css`;
- telas de comparação: `NovoPedidoView.vue`, `MeusPedidosView.vue`, `ResiduosGestaoCompletoView.vue`, `ModelosResiduoAdminView.vue`.

## Resultado

**NÃO CONFORME ainda.** O esqueleto das três telas operacionais foi aproximado das referências aprovadas, mas há débitos remanescentes de estilos duplicados e estados não cobertos. Não marcar a 7.4 como validada visualmente nem concluir Teste 3.

### Achados comprovados por arquivo (priorizados)

| Código | Nível | Evidência | Impacto e ação requerida |
|---|---|---|---|
| AV-01 | ALTO | `src/modules/solucoes/styles/solucoes.css`: ~200 linhas; continuam estilos completos de `.sol-btn`, `.sol-metric`, `.sol-workspace`, `.sol-status-tabs`, `.sol-dialog-overlay` e `.sol-dialog`, mesmo após a Central mudar para classes de Resíduos. | **CSS paralelo** pode disputar precedência, dificultar regressões e o Dark Mode. Inventariar seletor/consumidor, eliminar os sem uso e manter apenas propriedades de domínio efetivamente necessárias, sem alterar estilos globais. |
| AV-02 | ALTO | `src/modules/admin/views/ModelosSolucaoAdminView.vue` possui ~50 ocorrências de cores hex, ~6 declarações `!important`, regras locais de `.backdrop`, `.editor` e campos com 42px/7px; referência visual oficial orienta controles 40px/6px e superfícies 8px. | Cadastro e dois modais ainda fogem da fundação. Refatorar **junto com** `ModelosResiduoAdminView.vue` ou extrair base compartilhada, preservando funcionalidades. Conferir ambos os temas e tamanho mobile. |
| AV-03 | ALTO | `src/modules/solucoes/views/SolucoesSolicitanteView.vue` replica o CSS de `MeusPedidosView.vue` e ainda traz ~48 literais hex e `!important` dentro de `<style scoped>`. | Paridade só estrutural, Dark Mode potencialmente divergente; migrar tokens e/ou extrair o padrão reutilizável do histórico com segurança, mantendo a referência como base funcional. |
| AV-04 | ALTO | `src/modules/solucoes/views/SolucoesGestaoView.vue` tem tabela `sol-table--records` combinada com classes globais de Resíduos e um painel expandido `.sol-details`. A Central de Resíduos usa fluxo de ações e painéis já consolidado. | Revisar contraste/tamanho de status, densidade, responsividade, colunas e comportamento de expandir em Light e Dark; evitar duas fontes CSS de tabela. |
| AV-05 | ALTO | Central de Gestão contém modais para **APROVAR**, **ENTREGAR**, **REJEITAR** e **CANCELAR**, mas estes são montados com `modal-card` de Resíduos + campos `sol-field`/mensagens `sol-note` locais. | Validar cada modal isoladamente: título, foco, backdrop/blur, tamanhos, botões (primário x destrutivo), erros, confirmação, loading, fechamento e scroll interno. A mera reutilização da classe de modal não garante paridade. |
| AV-06 | MÉDIO | `src/modules/solucoes/styles/solucoes.css` mantém cores hex em regras específicas de `body.sgl-dark-active` para badges, estados e botões. | Centralizar cores semânticas nos tokens oficiais, não criar paleta escura de Soluções. Exigir legibilidade dos cinco estados e de textos secundários. |
| AV-07 | MÉDIO | `src/modules/solucoes/views/NovaSolucaoView.vue` imita `NovoPedidoView.vue`, mas ainda tem CSS scoped copiado com `!important` e lógica visual própria para alternância padrão/avulsa e cartilha. | Conferir os três blocos, cartão do Solicitante/Laboratório, escolha da cartilha, composição, instruções longas, orientação de exigências, barra de envio e validações; remover estilos redundantes após comparar. |
| AV-08 | MÉDIO | `src/modules/admin/views/CatalogosResiduosSolucoesView.vue` mantém abas/header próprios, enquanto `CadastrosAdminView.vue` já dispõe de estrutura de navegação e cabeçalho. | Evitar cabeçalhos duplos, títulos duplicados e tabs com densidade diferente ao entrar pelo menu Cadastros versus rota direta. |
| AV-09 | MÉDIO | Diversos controles operacionais são `<button>`, `<input>`, `<select>` nativos com CSS replicado; há componentes comuns `SglButton`, `SglCard`, `SglStatusChip`, `SglTextField` e `SglSelect`. | Reutilizar componentes quando viável **sem forçar refactor geral** das telas de referência. Extração dos estilos compartilhados das referências existentes também é opção; documentar exceções. |
| AV-10 | MÉDIO | Estados de registro `PENDENTE`, `EM_PREPARACAO`, `ENTREGUE`, `REJEITADO`, `CANCELADO` são representados em interfaces distintas e CSS distinto. | Padronizar mapeamento de chip por estado nos dois perfis; conferir cancelar antes do preparo versus depois (devolução x consumo). Nenhum estado deve depender apenas da cor. |
| AV-11 | MÉDIO | A tela de gestão exibe abertura de linha clicável, além de ações aninhadas; a seleção de linha ocorre por `@click` sem mecanismo de foco/teclado equivalente. | Fornecer controle explícito/semântico de expandir, `aria-expanded`, navegação por teclado e evitar propagação de click indesejado. |
| AV-12 | MÉDIO | `ModelosSolucaoAdminView.vue` possui dois diálogos (edição e promoção) e código próprio de `window.confirm` para inativação. | Validar modal de cadastro, importação e confirmação de inativação sob mesma experiência visual, foco, loading e Dark Mode do SGL. Evitar janela nativa quando já há modal institucional. |
| AV-13 | BAIXO | Status, nomes e explicações aparecem em mistura de rótulos: “Soluções”/“preparação”/“receita”, “Analisar”/“Aprovar preparação”, “entrega”/“recebimento”. | Uniformizar microcopy sem alterar regra: solicitado; análise/aprovação; em preparação; entrega confirmada; cancelamentos. |
| AV-14 | BAIXO | Novo Pedido e Minhas Pedidos de referência também contêm hex locais; copiar seu CSS literalmente reproduz débitos legados. | Ao harmonizar Soluções, não redesenhar globalmente outros módulos sem aprovação; considerar dívida de Design System transversal na etapa de polimento. |

## Matriz de cobertura visual obrigatória

| Tela / estado | Light | Dark | Largura desktop | Mobile | Critério |
|---|---|---|---|---|---|
| Solicitante — Minhas Soluções: vazio | PEND. | PEND. | PEND. | PEND. | Mesmo grid/filtros de Meus Pedidos |
| Minhas Soluções: lista, filtro, busca, detalhes | PEND. | PEND. | PEND. | PEND. | Quantidades, textos/cartilha, status legíveis |
| Solicitar Solução: modelo padrão e preview da cartilha | PEND. | PEND. | PEND. | PEND. | Mesmo shell de Novo Pedido |
| Solicitar Solução: excepcional, itens, campos inválidos | PEND. | PEND. | PEND. | PEND. | Mesma densidade e erros de Novo Pedido |
| Central — vazio + KPIs + filtros | PEND. | PEND. | PEND. | PEND. | Exatamente padrão da Central de Resíduos |
| Central — linha pendente e ações | PEND. | PEND. | PEND. | PEND. | Status legível, ação contextual |
| Central — modal de aprovação | PEND. | PEND. | PEND. | PEND. | Contraste, hierarquia, feedback |
| Central — em preparação e modal de entrega | PEND. | PEND. | PEND. | PEND. | Botão primário, nenhuma aparência destrutiva |
| Central — rejeição | PEND. | PEND. | PEND. | PEND. | Justificativa, erro, ação crítica |
| Central — cancelamento antes do preparo | PEND. | PEND. | PEND. | PEND. | Confirmação de reversão, status correto |
| Central — cancelamento após preparo | PEND. | PEND. | PEND. | PEND. | Confirmação do consumo e status |
| Cadastro — catálogo vazio/lista, abas, inativos | PEND. | PEND. | PEND. | PEND. | Mesmo template de Resíduos |
| Cadastro — criar/editar e composições longas | PEND. | PEND. | PEND. | PEND. | Campos e modal institucional |
| Cadastro — importar da solicitação / inativar | PEND. | PEND. | PEND. | PEND. | Diálogos padronizados |

`PEND.` significa **não verificado em navegador**; a matriz não declara falha de execução.

## Sequência segura de correções sugerida

1. **Estrutura e CSS:** remover regras órfãs de `solucoes.css`, esclarecer a propriedade de cada classe, preservar classes oficiais e evitar conflitos por especificidade.
2. **Central:** fechar contrato visual de tabela, chips, painéis e quatro modais antes de retomar Teste 3 (aprovação real).
3. **Solicitante:** normalizar o CSS do histórico e das etapas de solicitação; manter identidade aprovada sem modificar regras de composição.
4. **Administração:** unificar o template de modelos de Resíduos/Soluções, resolver abas e dois modais; evitar regressão nos modelos de Resíduos já validados.
5. **QA:** `npm run build`, inspeção Light/Dark nos estados da matriz e em resoluções 720p/1080p/1440p/mobile; documentar screenshots e evidências.
6. **Só então:** reabrir Teste 3 e validar baixa única, entrega, rejeição e cancelamentos, verificando estoque no backend.

## Regras e limites

- Esta rodada é auditoria: **não altera regras de estoque, migrações ou lógica de Pedido**.
- Testes funcionais 1 e 2 foram confirmados pelo responsável; **Teste 3 continua pausado** para revisão visual.
- Não foi feita validação de runtime, console, acessibilidade automatizada, DOM, navegadores ou testes em dispositivos.
- Não executar merge sem validação e autorização expressa do responsável.


---

## Rodada de correções implementadas após auditoria (13/10/2026)

**Escopo:** apenas frontend, branch de trabalho; nenhum merge e nenhuma alteração nas regras de estoque, migrations ou API.

- **AV-01:** `src/modules/solucoes/styles/solucoes.css` reduzido de aproximadamente 16 kB para 5,5 kB. Eliminadas famílias de CSS que não eram mais utilizadas (`sol-btn`, `sol-card`, `sol-workspace`, `sol-dialog`, KPIs/tabs próprias e cores Dark duplicadas); preservadas somente regras de domínio da Central que se apoiam na base de Resíduos.
- **AV-04/05/10/11:** `SolucoesGestaoView.vue` mantém KPIs/tabela/abas/modais da fundação de Resíduos; botão semântico, navegável por teclado e com `aria-expanded` para abrir os detalhes; modais de aprovação, entrega, rejeição e cancelamento possuem rótulos próprios no botão de confirmação, campos acessíveis e fundo/contraste via tokens. Regras de status em Light/Dark mantidas na folha de domínio.
- **AV-03:** `SolucoesSolicitanteView.vue` mantém layout aprovado de `MeusPedidosView.vue`, substituindo as cores hex locais por tokens de cor; ajuste de título, controles e raios. Preservada a redução de fonte dos componentes pedida no Teste 2.
- **AV-07:** `NovaSolucaoView.vue` mantém composição de `NovoPedidoView.vue`; corrigidos pequenos desvios de dimensão/legibilidade e retirados `!important`.
- **AV-02/06/12:** `ModelosSolucaoAdminView.vue` mantém o template do cadastro de Resíduos, mas corrige dimensões dos controles, títulos, tema dos campos/cards/modais, substitui cores fixas por tokens, remove regras de uma segunda paleta Dark e limpa `!important`. Alterações não atingiram `ModelosResiduoAdminView.vue`.
- **AV-08/09/13/14:** organização de Cadastros segue com aba de Resíduos e Soluções; pendências de extração transversal de componentes e microcopy foram mantidas como polimento futuro para **não refatorar módulos aprovados só por padronização local**.

**Verificação realizada via GitHub:** re-leitura das quatro Views e CSS; verificação estática de abertura/fechamento de elementos de template sem incompatibilidades detectadas. Isto não substitui compilação Vue/TypeScript.

**Não verificado:** `npm run build`, runtime, testes de console e inspeção Light/Dark na interface. Portanto os campos da matriz continuam `PEND.` até confirmação local. As correções estão **publicadas, não homologadas**.

**Próxima validação obrigatória:** build, Central nos cinco estados e quatro modais em Light/Dark; depois as duas Views do solicitante, catálogo administrativo e telas de 720p/1080p/1440p/mobile. Reabrir Teste 3 somente após essa conferência.
