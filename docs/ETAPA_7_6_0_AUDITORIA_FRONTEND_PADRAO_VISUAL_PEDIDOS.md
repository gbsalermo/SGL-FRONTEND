# Etapa 7.6.0 — Contrato visual e auditoria do frontend de Pedidos fracionados

**Data:** 15/10/2026  
**Branch:** `collab/etapa-7-unidades-solucoes-contexto`  
**Estado:** leitura documental e revisão estática realizadas. **Sem mudança funcional de Pedido/Estoque, sem build nesta rodada.**

## 1. Fontes de verdade (ordem oficial)

A ordem não pode ser substituída por estilos copiados de uma View antiga:

1. `docs/PADRAO_VISUAL_PRE_PRODUCAO.md` — escala, proporções, densidade e organização de modais/cards/tabelas;
2. `docs/IDENTIDADE_VISUAL.md` — semântica e paleta institucional;
3. `docs/ETAPA_2_DARK_MODE.md` — modo escuro definitivo **somente nas interfaces autenticadas**; Login/404 preservados;
4. `docs/ETAPA_1_3_COMPONENTES_BASICOS.md` — componentes comuns;
5. `docs/PADROES_PAGINA.md`, `docs/ICONOGRAFIA.md`, `docs/GUIA_EFEITOS_VISUAIS.md` — composição e microinterações;
6. `docs/REGRA_PADRONIZACAO_NOVOS_MODULOS.md` — checklist obrigatório para toda reformulação de View;
7. Implementação: `src/styles/tokens.css`, `src/styles/foundation.css`, `src/components/common`. Comparar com módulos amadurecidos (Resíduos, Pedidos e Cadastros), **sem herdar as exceções legadas**.

### Parâmetros verificados nos tokens

| Componente | Regra |
|---|---|
| Família | Inter |
| Título de página/seção/card | 24/18/16 px; corpo 14 px; label 13 px; auxiliar alvo 12 px ou mais |
| Controle/botão | 40 px de altura base; icon-only 40×40; ícone 20 px; chevron 24 px |
| Raio | 6 px controles; 8 px cards e superfícies |
| Grade | 4 / 8 / 12 / 16 / 24 / 32 px |
| Cards | padding 20 px; superfície/borda neutra; não usar hover em cards sem ação |
| Tabelas | operação repetitiva; linha 48 px; manter boa leitura sem reduzir fontes |
| Cores | azul=ação/info; verde=sucesso; amarelo=atenção; vermelho=erro/crítico; cinza=neutro |
| Modal | overlay com `backdrop-filter: blur(3px)` como referência; fundo desfocado, modal nítido; reutilizar padrão existente |
| Motion | transições discretas; foco visível; hover só em dispositivo com mouse; respeitar `prefers-reduced-motion` |
| Light/Dark | mesmas dimensões/layout; cores e superfícies por `--sgl-* `; sem valores claros fixos no dark |

A seção 17 do padrão de pré-produção registra exceções compactas aprovadas para **drawers/modais** em outubro; não extrapolar essas dimensões para novos controles de Pedido.

## 2. Componentes efetivamente disponíveis

Usar os exports de `src/components/common/index.ts` onde couber:
- `SglButton` para ação primária/secundária/perigo; não criar `pedido-button` visual completo.
- `SglCard` para superfície de informação/resumo; não transformar cada item do Pedido em card gigante.
- `SglStatusChip` para estados reais;
- `SglTextField` (suporta `type='number'`) e `SglSelect`; verificar suporte de `step`/`min` na interface do componente antes de usá-lo como input decimal especializado. Não presumir props não declaradas.
- `SglBreadcrumb`, `SglChevronButton`, `SglIconButton` quando pertinentes.
- Componentes específicos só para lógica de domínio, não para duplicar botão/card/input básico.

## 3. Arquivos-alvo e discrepâncias atuais

| Arquivo | O que já faz | O que adaptar |
|---|---|---|
| `src/modules/pedidos/views/solicitante/NovoPedidoView.vue` | Produto → lotes → opções UNITARIO ou embalagem; `quantidadeForma` inteira; `Math.floor(saldo/fator)` | Permitir solicitar **quantidade física com unidade compatível** além de apresentação inteira, preservando preferências de retirada do contrato original, sem prometer lacre por saldo agregado |
| `src/modules/pedidos/types/pedido.ts` | Tipos do Pedido e lote; enum restrito a cinco apresentações; `LotePedidoResponse` sem `unidadeBase` | Tipar contratos completos do backend; adaptar request/response de forma retrocompatível depois que contrato backend for estabilizado |
| `src/modules/pedidos/services/pedidoService.ts` | Faz consulta de lotes e submit; aplica enriquecimento/filtragem de produto | Manter cliente HTTP central; não duplicar algoritmo de alocação nem gerar movimentação direta |
| `src/modules/pedidos/views/gestao/PedidosGestaoView.vue` | Aprovação com `Number.isInteger` e input min 1/step de embalagem | Validar decimals e unidades no novo modo; manter integridade de apresentações inteiras; mostrar contexto físico e confirmação da aprovação |
| `src/styles/main.css` | Overrides globais de aprovação de Pedidos, alguns `!important`, larguras fixas e fontes até 6,5 px | **Dívida visual concreta**: refinar/reorganizar seletivamente o CSS de Pedidos na origem. Não somar mais `!important` ou uma quarta família de componentes de quantidade; não afetar rotas não relacionadas |
| `src/styles/etapa-2-gestao-pedidos.css` e CSS scoped das Views | Estilos de fluxo existente de Gestão | Atualizar seletivamente para tokens do tema (sem desconfigurar componentes já homologados); comparar com `foundation.css` |
| `src/modules/solucoes/views/NovaSolucaoView.vue` e Soluções Gestão | Fluxo de Solução já testado | **Não modificar** o cálculo da receita nem aprovação atômica na 7.6.0; somente regressão após atualizar estilos compartilhados |

## 4. Regras de experiência do usuário previstas

**Fonte funcional vinculante:** o contrato de retirada **já foi aprovado**, não depende de nova decisão sobre prioridade dos recipientes. Ver backend `docs/CONTINUIDADE_ETAPA_7_2026-10-06.md`, §9.9 e §9.13, e auditoria corrigida `docs/ETAPA_7_6_0_AUDITORIA_CONTRATO_PEDIDOS_ESTOQUE_FISICO.md`. A implementação de `MovimentacaoEstoqueService.consumirRecipientes` já cobre inteiros fechados antes das frações abertas. Pedido 700 mL com aberto 300 mL + fechados 500 mL → fechado 500 + aberto 200. O frontend **não seleciona nem ordena recipientes**, apenas informa quantidade/unidade/forma solicitada.



- **Duas formas de informar a necessidade**, sem criar política nova: `Apresentação física` (contagem inteira de embalagens) e `Quantidade física` (valor decimal + unidade compatível, inclusive quantidades grandes). Esses são caminhos de entrada do Pedido para a MESMA política FEFO/FIFO/ABERTO/FECHADO já definida na Etapa 7.
- Explicação objetiva no próprio campo; não presumir que `UNITARIO` significa necessariamente contagem de embalagem ou que unidade física é sempre “unit.”.
- O formulário deve obter as unidades compatíveis da unidade canônica do Produto; para uma contagem não divisível, não oferecer fração arbitrária.
- Mostrar o saldo de modo inteligível (ex.: `750 mL` com recipiente aberto), mas deixar claro quando disponibilidade/quantidade de lacrados é apenas aproximada, nunca simular garantia.
- A Gestão vê a forma e a unidade originalmente solicitadas e aprova um total fisicamente consistente, com conversão explícita para a quantidade canônica no backend, limites corretos e mensagens de conflito. Não confundir forma de entrada com escolha manual de recipiente.
- Ao mudar Produto/modo/forma, limpar seleções obsoletas, revalidar dados e evitar envio de payload inconsistente.
- Não exigir seleção manual de lote/recipiente por solicitante ou gestor como solução para FEFO/FIFO. A alocação física é automática e autoritativa pelo servidor.
- Todas as quantidades exibidas de forma consistente, com rótulo de unidade e precisão adequada; não resolver dinheiro/quantidade com arredondamento silencioso para inteiro.

## 5. Riscos de CSS que devem ser corrigidos com prioridade

- Em `src/styles/main.css` existem regras globais `.gestao-detail__item .quantity-card` que forçam caixas de `132×52 px`, inputs de `20 px`, labels de `6,5–7,5 px` e cores claras fixas com `!important`. Essas regras são **contrárias à escala geral**, dificultam conteúdo decimal e podem escapar do Dark Mode.
- A instrução de `docs/REGRA_PADRONIZACAO_NOVOS_MODULOS.md` proíbe criar famílias visuais paralelas e `!important` corretivos como estratégia.
- `main.ts` importa folhas antigas e modernas em sequência; verificar cascata e especificidade **antes** de editar qualquer seletor compartilhado.
- `docs/AUDITORIA_VISUAL_INTEGRAL_SOLUCOES_ETAPA_7_4_2026-10-13.md` registra regressões anteriores por CSS duplicado. Não reproduzir.
- `docs/GUIA_EFEITOS_VISUAIS.md` contém exemplos CSS independentes; usar os efeitos já implementados no SGL e tokens ativos, não copiar valores de demonstração como uma nova paleta.

## 6. Plano de implementação frontend após contrato backend validado

1. **Tipos/cliente HTTP:** alinhar todos os campos/enum de Lote e Pedido, sem modificar comportamento visual ainda.
2. **Novo Pedido:** apresentar contagem inteira de apresentações ou quantidade física decimal, com unidade e rotulagem compreensíveis. O backend decide **FEFO/FIFO → FECHADOS para parte inteira → ABERTOS para fração → abrir FECHADO só se necessário**. Manter laboratório/Projeto atuais (participação na Etapa 8).
3. **Aprovação Gestão:** adaptar quantitativos físicos e apresentações, mostrar a intenção de retirada e confirmar; atenção aos estados `PENDENTE`, `APROVADO`, `ENTREGUE`, `CANCELADO`.
4. **CSS:** alterar preferencialmente estilos existentes dos mesmos módulos usando `--sgl-*`, `Sgl*`; não mexer no tema global, Login ou shell. Remover overrides pontuais somente com conferência dos consumidores.
5. **Teste incremental:** `npm run build` e smoke DEV com 200 mL, 500 mL, 700 mL, fração grande que preserva os fechados inteiros e minimiza novas aberturas; lote FEFO prioritário; lote não fracionável; conflito e cancelamento. Depois verificar Light/Dark e 720p/1080p/1440p/mobile; não simular execução.

## 7. Checklist de aceite obrigatório

- [ ] Sem regras de negócio de fracionamento duplicadas no navegador.
- [ ] Sem regressão de FEFO/FIFO, saldo físico, cancelamento e reversão.
- [ ] Frontend não permite prometer embalagem lacrada a partir somente de saldo agregado.
- [ ] Sem duplicação de famílias de botões, chips e cards.
- [ ] Tokens válidos para cor, dimensões, tipografia, contraste e estados de UI.
- [ ] Nenhum uso novo de `!important` para ocultar problema estrutural.
- [ ] Legibilidade em Light/Dark e resoluções 720p, 1080p, 1440p e mobile.
- [ ] Hover/foco/loading/disabled/erros consistentes e acessíveis.
- [ ] `npm run build` e smoke real confirmados após mudanças.
- [ ] Documentação sincronizada; **sem merge** sem autorização expressa.

**Esta rodada é somente auditoria.** Não afirmar build/teste ou implantação funcional da 7.6.0 a partir dela.

## Aceite final e preparação de merge — 16/10/2026

O responsável confirmou testes e funcionamento satisfatórios após o último ciclo da Etapa 7; os ajustes da 7.7 (fracionamento por lote e unidade mínima de consumo, massa DEMO, mínimo configurável por apresentação, DTOs, tabela de Estoque e aprovação por embalagem) estão **aceitos funcionalmente**. Testes Maven/JUnit, inicialização da API e build frontend foram relatados verdes, além da validação manual dos cenários exercitados.

**Etapa 7 encerrada funcionalmente.** Manter o teste exaustivo de cadastro → entrada → Pedido → aprovação → entrega → rastreabilidade na Etapa 8. A aprovação funcional não comprova homologação integral para produção. **Nenhum merge foi efetuado pelo assistente**: o responsável fará a integração de ambos os repositórios e verificará o alinhamento com o GitLab/main canônico.

Referências atuais: `CONTINUIDADE.md` em ambos os repositórios, `docs/PLANO_PRE_PRODUCAO.md` no backend e o documento de continuidade da Etapa 7. Trechos anteriores marcados “pendente” refletem o estado na data em que foram redigidos e não são o checkpoint de encerramento.
