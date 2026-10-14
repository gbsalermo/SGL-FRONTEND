
# Etapa 7.4 — Validação integrada de Soluções pela interface

**Decisão:** a antiga 7.5 (Frontend) foi antecipada para **7.4**, para testar o ciclo solicitante ↔ gestor ↔ estoque. O antigo contexto operacional da 7.4 será desenvolvido na **7.5**.

**Estado:** implementação frontend publicada na branch `collab/etapa-7-unidades-solucoes-contexto`. Backend da 7.3: suite Maven e inicialização local confirmadas como verdes pelo desenvolvedor. **Build do frontend e smoke funcional não verificados no momento da publicação**.

## Preparar o ambiente

Usar a branch `collab/etapa-7-unidades-solucoes-contexto` tanto no Backend quanto no Frontend. Executar o backend no perfil local DEV, com o banco correspondente e a migration V37. Não repetir `repair` ou reset do banco sem diagnóstico.

No frontend:

```bash
git fetch github
git switch collab/etapa-7-unidades-solucoes-contexto
git pull --ff-only github collab/etapa-7-unidades-solucoes-contexto
npm ci
npm run build
npm run dev
```

A configuração DEV padrão aponta para `http://localhost:8080/api`, salvo variável `VITE_API_BASE_URL`. Utilizar sessão com Unidade definida (`X-SGL-Unidade-Id` é enviado automaticamente pelo frontend).

**Menus e rotas:**

- Solicitante: **Minhas soluções** (`/minhas-solucoes`) e **Solicitar solução** (`/solucoes/solicitar?nova=1`);
- Gestor/Administrador: **Soluções** (`/solucoes`) e **Solicitar solução** (`/solucoes/nova?nova=1`, requer laboratório/Projeto vinculado ao usuário);
- Gestor: aba **Solicitações** (análise/entrega/cancelamento) e aba **Catálogo de soluções** (modelos reutilizáveis).

## Testes manuais de ida e volta

| ID | Ação no sistema | Resultado esperado |
|---|---|---|
| S01 | Entrar como Gestor e abrir Soluções → Catálogo → Cadastrar modelo | Exibir editor de nome, descrição, componentes, quantidade e unidade |
| S02 | Cadastrar modelo de 2 Produtos ativos com unidades compatíveis | Modelo salvo na mesma Unidade e aparece na lista; sem movimentação de estoque |
| S03 | Entrar como solicitante com laboratório e Projeto válidos → Solicitar solução → Catálogo | Modelo padrão cadastrado aparece como opção |
| S04 | Selecionar Projeto, modelo e enviar | Pedido `SOLUCAO` criado `PENDENTE` com itens correspondentes |
| S05 | Criar outra solicitação com composição personalizada | Pedido `PENDENTE`; composição não entra no catálogo automaticamente |
| S06 | Gestor → Soluções → Solicitações → aprovar | Todos os componentes aprovados integralmente; status `EM_PREPARACAO`; movimentações `SAIDA` vinculadas ao Pedido |
| S07 | Comparar estoque antes e após a aprovação | Baixa **uma única vez** por Produto, com saldos coerentes de Lote/Recipiente |
| S08 | Solicitante abre Minhas soluções | Vê o próprio Pedido em `EM_PREPARACAO` sem acesso a pedidos de outras pessoas |
| S09 | Gestor → Confirmar entrega | Pedido `ENTREGUE` e recebimento registrado, **sem nova baixa** dos mesmos Produtos |
| S10 | Nova Solução: aprovar → cancelar marcando **Não preparada** | Pedido `CANCELADO`; saídas revertidas; saldo recomposto quando não houve movimentação concorrente no Recipiente |
| S11 | Outra Solução: aprovar → cancelar marcando **Já preparada** | Pedido `CANCELADO`; consumo definitivo; **ingredientes não voltam** ao estoque |
| S12 | Cancelar uma Solução ainda `PENDENTE` | `CANCELADO`, sem tentativa de devolver saída inexistente |
| S13 | Gestor → Solicitação personalizada → Salvar no catálogo | Novo modelo criado com mesma composição; pedido original não modificado |
| S14 | Inativar modelo, consultar como solicitante | Modelo inativo não aparece na criação de novos Pedidos, sem perder histórico |
| S15 | Enviar unidades incompatíveis ou repetir Produto no cadastro | Erro de negócio claro, sem alteração de saldos |
| S16 | Navegar pelos Pedidos convencionais dos dois perfis | Pedidos comuns continuam visíveis e Soluções ficam nas seções próprias |
| S17 | Trocar Unidade de contexto por sessão autorizada | Modelos e Pedidos de Solução da primeira Unidade não aparecem na outra |

### Observações operacionais

- **Evitar dados reais** até a verificação funcional. Usar DEV.
- Para os testes S06–S11, conferir a tela de movimentações e o estoque, não apenas a mensagem de sucesso.
- **Concorrência:** a restauração do recipiente é protegida; se o mesmo recipiente sofreu movimentação posterior, a reversão pode ser recusada para evitar sobrescrever o estado físico. Reportar a situação específica para revisão do contrato de standby. Não criar ajustes manuais apenas para forçar o teste a passar.
- A interface de Solicitante permite criar e acompanhar; as decisões de cancelamento são operacionais do Gestor. **Não há workflow independente de "solicitar cancelamento" no backend** neste estágio.
- O cadastro opcional de uma Solução física reaproveitada após cancelamento é feito pelo fluxo de Produto/estoque e **não** é automatizado nesta interface.
- A autenticação atual é temporária em DEV; permissões reais devem ser validadas no backend antes da produção, independente das proteções de rota do Vue.
- Margem de erro: **extra futuro**; nenhum campo ou cálculo de tolerância exigido nestes testes.

## Critérios de conclusão da 7.4

```text
[ ] npm run build verde
[ ] Navegação correta para Solicitante
[ ] Navegação correta para Gestor/Administrador
[ ] S01–S17 validados (ou achados documentados e resolvidos)
[ ] Sem regressão no Pedido comum
[ ] Sem dupla baixa no estoque
[ ] Sem reposição fictícia após preparo
[ ] Documentação sincronizada com resultados
[ ] Merge apenas após autorização expressa
```


### Ajuste no roteiro de validação — separação administrativa

Os cenários **S01, S02, S13 e S14** agora são realizados por usuário **Administrador**, em **Cadastros → Resíduos e Soluções → Modelos de soluções**, não mais pela área operacional da Gestão de Soluções.

A **Central de Soluções** do Gestor contém apenas a operação: listagem de Pedidos, aprovação, rejeição, preparação, entrega, cancelamento e movimentações. Confirme que um perfil `GESTOR` comum **não possui acesso de navegação** aos modelos administrativos, enquanto um `ADMINISTRADOR` pode cadastrar/editar/inativar/importar. Esta é **somente uma conferência de interface**: autorização real de API ainda não existe no DEV.

Verificar também o novo layout: cinco cards de status, filtros em abas com quantidade por status, busca dentro da superfície, tabela de Pedidos; testar tema claro/escuro e os modais. Não marcar como concluído antes de `npm run build` e inspeção visual.


---

## Registro consolidado dos testes funcionais — 13/10/2026

Este registro **prevalece sobre os estados históricos de planejamento** anteriores neste documento. Os resultados abaixo foram informados pelo responsável após execução local pela interface, não executados diretamente pelo assistente.

| Cenário | Resultado confirmado |
|---|---|
| Cadastro de uma Solução padrão com componentes | **VALIDADO** |
| Solicitação de Solução padrão com vínculo a Projeto e cartilha | **VALIDADO** |
| Aprovação integral pela Gestão, saída dos componentes e entrega sem segunda baixa | **VALIDADO** |
| Solicitação personalizada **fora do catálogo** depois de corrigir o contrato HTTP | **VALIDADO** |
| Cancelamento **antes do preparo**, com reversão dos componentes ao estoque | **VALIDADO** |
| Cancelamento **após o preparo**, com consumo mantido e sem devolução ao estoque | **VALIDADO** |

**Resultado funcional:** o ciclo principal pedido → aprovação → estoque → entrega/cancelamento foi testado pela interface. A execução de cada cenário pelo responsável valida o fluxo observado; não equivale a comprovação automática de todos os 17 itens da matriz anterior ou de todas as combinações de lote/concorrência.

**Importante — não confundir rejeição com cancelamento:** o fluxo de gestão revisado disponibiliza **Rejeitar** somente para pedidos `PENDENTE` e **Cancelar preparação** para pedidos aprovados `EM_PREPARACAO`. A linha possui seta de expansão (sem botão “Analisar”); os detalhes exibem componentes e quantidades necessárias, sem coluna redundante de quantidade aprovada.

### Pendências de regressão antes do encerramento formal da 7.4

- [ ] Confirmar rejeição de uma Solução ainda `PENDENTE` (sem qualquer saída de estoque).
- [ ] Confirmar que um Pedido comum de Produtos ainda pode ser solicitado/aprovado com suas regras de embalagem e estoque.
- [ ] Confirmar inativação/edição de modelo e preservação da composição/cartilha de pedidos já existentes; promoção explícita de solução personalizada ao catálogo, se o cenário estiver disponível.
- [ ] Conferir segregação de Unidade/tenant e perfis operacionais, inclusive Gestor sem laboratório pessoal ativo.
- [ ] Registrar execução verde de `npm run build`, `mvn test` e inicialização após as correções mais recentes.
- [ ] Revisar Light/Dark e responsividade nos estados que não foram capturados nos testes.
- [x] Documentar os seis cenários principais validados.
- [ ] Autorizar fechamento/merge **expressamente** após regressões satisfatórias.

**Próxima etapa no roadmap após encerramento:** `7.5 — Contexto operacional Projeto → SCI → Atividade`. **A margem de erro permanece extra futuro, fora da etapa atual.**


### Confirmação complementar — rejeição de Solução pendente

**Validado pelo responsável em teste local:** rejeitar uma solicitação de Solução no status `PENDENTE`, com justificativa, sem saída de componentes do estoque. Este resultado complementa os seis cenários funcionais já confirmados, totalizando **sete cenários principais validados**.

**Próxima regressão:** realizar um Pedido convencional de Produtos (com forma de retirada/embalagem exigida), analisar/aprovar, conferir movimentação e recebimento, garantindo que as mudanças de `ItemPedidoRequestDTO` e `PedidoRequestDTO` não afetaram esse fluxo. Ainda pendentes: inativação/edição de modelo e snapshot da cartilha, segregação de Unidade/perfis, builds/suíte finais e autorização expressa para fechamento/merge.


### Regressão de Pedidos comuns — validada

**Confirmação do responsável:** o teste de regressão do fluxo convencional de Pedido de Produtos foi **VALIDADO** após as correções de contrato de Soluções. A validação solicitada abrangeu criação com forma de retirada/embalagem, aprovação pela Gestão, movimentação de estoque e confirmação de entrega sem segunda baixa.

**Status:** sete cenários de Soluções validados anteriormente **mais regressão de Pedidos comuns validada**. Ainda **não** considerar toda a matriz S01–S17 concluída.

**Próximos testes:** edição de Modelo Padrão e snapshot de composição/cartilha em pedidos antigos; inativação e ocultação do modelo em novas solicitações; eventual promoção explícita de Solução avulsa; isolamento entre Unidades/perfis. Registrar build/suíte verde com a versão atual antes de encerrar e solicitar autorização de merge.


### Validação de catálogo e preservação histórica — 14/10/2026

**VALIDADO pelo responsável por meio de testes locais na interface:** edição de Modelo de Solução padrão (composição e instruções de preparo); consulta a pedidos antigos preservando composição e cartilha originalmente solicitadas; nova solicitação refletindo os dados atualizados do modelo; inativação do modelo com retirada do catálogo de novas solicitações, sem apagar nem modificar o histórico existente.

**Implicação funcional:** snapshots de composição e instruções associados aos Pedidos de Solução estão preservados no cenário testado; alterações no catálogo não modificam pedidos anteriores. Os testes são confirmações do responsável, não execuções automatizadas pelo assistente.

**Restante do fechamento:** testar promoção administrativa de uma Solução avulsa ao catálogo (se disponível no fluxo); isolamento de catálogo/pedidos entre Unidades e permissões por perfil; executar/registrar `mvn test` e `npm run build` nas últimas versões e inspecionar Light/Dark. O teste de rejeição e a regressão de Pedidos comuns já estão validados em registros anteriores. Não realizar merge sem autorização expressa.


### Validação de promoção administrativa de Solução avulsa — 14/10/2026

**VALIDADO pelo responsável em teste local:** em `Administração → Cadastros → Resíduos e Soluções → Modelos de soluções → Importar de solicitação`, foi selecionada uma Solução personalizada anteriormente solicitada e cadastrada como Modelo reutilizável. Foi confirmado que a composição passou a integrar o catálogo e que o Pedido de origem e suas movimentações permaneceram inalterados.

Este resultado conclui o cenário S13 da matriz funcional. Permanecem **não confirmados nesta validação**: isolamento de modelos e pedidos entre Unidades, permissões por perfil no frontend (não confundir com proteção real de API, ainda pendente), execução final de `mvn test`, `npm run build` e QA Light/Dark. Não realizar merge sem autorização expressa do responsável.


### Ajuste de coerência operacional — Pedidos e Soluções juntos na visão geral

**Observado em teste IB (14/10/2026):** painel e Pedidos mostravam 1 pendente, mas os alertas 2. Raiz: `pedidoService.listarTodos` excluía Soluções, enquanto os alertas consultavam todos os Pedidos na API.

**Implementação publicada na branch, aguardando validação:** `Dashboard` agrega Pedidos de Produtos e Soluções; `Pedidos` geral lista os dois com filtro por tipo, status `EM_PREPARACAO` e detalhe de leitura para Soluções; CTA específico navega à Central de Soluções. A aprovação, rejeição, entrega e cancelamento de Soluções permanecem **somente na Central de Soluções**, evitando executar indevidamente os controles de quantidades/embalagem de Pedidos comuns. Alertas mostram composição numérica Produtos/Soluções.

**Roteiro de smoke adicional:**
- [ ] IB Administrador: a situação das capturas (1 Pedido comum e 1 Solução pendente) resulta em **2** no Dashboard, **2** no painel de Alertas e **2** em Pedidos/Todos.
- [ ] Filtro `Produtos` mostra o Pedido comum e `Soluções` mostra a Solução.
- [ ] Expandir Solução só informa composição/cartilha/observações; nenhum controle de embalagem ou aprovação convencional.
- [ ] `Abrir na Central de Soluções` abre a Solução correta e ações originais permanecem disponíveis.
- [ ] Pedidos convencionais seguem permitindo aprovação/rejeição/entrega com regras de embalagem.
- [ ] Pedidos urgentes dos dois tipos são contados e encaminhados adequadamente; `EM_PREPARACAO` tem rótulo adequado.
- [ ] Build `npm run build`, tema claro/escuro e navegação do menu.

**Resultado:** alteração de frontend registrada, ainda **não homologada localmente**. Não confundir esta pendência com os cenários funcionais de Soluções já validados anteriormente. Não fazer merge sem confirmação expressa.


### Confirmação do responsável — integração Pedidos/Soluções (14/10/2026)

O responsável confirmou que a atualização da **visão integrada de Pedidos, Soluções, Dashboard e Alertas operacionais** funcionou conforme esperado, considerando o implementado até agora **VALIDADO**. Esta confirmação **substitui a observação histórica anterior** que dizia que a integração ainda não estava homologada visual/funcionalmente. Sem inventar resultados numéricos de build: o comando `npm run build` não teve log final anexado à conversa.

**Precisa de atenção:** o código já inclui Soluções urgentes `PENDENTE`, com rota para o pedido correspondente em `/solucoes?pedido=...`. Confirmado como parte do comportamento existente.

**Últimas movimentações — melhoria ainda NÃO feita:** o painel registra eventos de estoque e histórico de Resíduos. Não exibe, por si só, rejeição, entrega nem cancelamento de Solução após preparo quando não há movimentação de estoque. A proposta de ampliar para **Últimas atividades operacionais** depende de histórico confiável de transições e segue pendente de implementação e testes; não marcar como concluída.

**Pendências de fechamento:** isolamento entre Unidades e perfis; conferência técnica final da versão atual e eventual evolução de histórico operacional, mediante decisão do responsável. Sem merge.
