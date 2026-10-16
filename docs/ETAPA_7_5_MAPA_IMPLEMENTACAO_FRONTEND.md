# Etapa 7.5 — Mapa de implementação frontend / contexto operacional

## Checkpoint de encerramento funcional — Etapa 7 (16/10/2026)

**Estado:** Etapa 7 (7.0–7.7) concluída funcionalmente e validada pelo responsável; código e documentação preparados na branch `collab/etapa-7-unidades-solucoes-contexto` para merge **a ser realizado pelo responsável**. Não afirmar que o merge, publicação ou homologação integral de produção ocorreram.

**Entregas:** unidades de medida e apresentações físicas, conversão e decimais, recipientes individuais, FEFO/FIFO, Soluções, contrato de Pedidos convencionais por embalagem ou medida, aprovação em embalagens com conversão canônica, retirada individual de reações/unidades de kits quando o lote permite abertura, massa DEV/DEMO revisada, resumo físico na listagem de Estoque, mínimo configurável em embalagem ou medida (V39), revisão da nomenclatura e da configuração `fracionavel` por lote, QA e auditoria de integração. O valor mínimo salvo continua canônico; a preferência de apresentação é persistida separadamente.

**Aceites relatados pelo responsável:** suítes Maven/JUnit verdes, API iniciando normalmente, build do frontend verde, solicitações/aprovações e refinamento de estoque validados, correções finais de cadastro/entrada, massa DEMO e documentação testadas e aceitas. Não extrapolar esses aceites para teste exaustivo de todos os perfis ou homologação para produção.

**Regras importantes:** `fracionavel` controla permitir abrir embalagem e consumir parte do conteúdo; não permite dividir uma unidade indivisível como 1 reação. O lote governa a permissão; pedidos por medida não são pedidos de embalagem; pedidos por embalagem são aprovados visualmente em apresentações inteiras, enviados ao backend em quantidade canônica. FEFO/FIFO e baixa única na aprovação continuam no servidor. Kit fracionável admite retirada de uma reação individual; frasco de 500 mL admite pedido por medida, sem inventar “500 unidades”.

**Etapa 8, próximo passo:** integração do contexto de participação do Estagiário (Projeto/SCI/Atividade) aos Pedidos/Soluções, incluindo regras de vínculo, acesso e aprovação. Executar também **roteiro operacional exaustivo ainda não realizado**: cadastro de produto → entrada de lotes → escolha de embalagem ou medida → pedido → liberação/aprovação → entrega → movimentação/rastreabilidade, com casos de abertura, estoque mínimo, validade, FEFO/FIFO e múltiplas unidades. Nenhuma mudança da Etapa 8 deve ser inferida como implementada.

**Infra e migrations:** DEV PostgreSQL com Flyway; DEMO H2 em memória; massa de teste por inicializadores. V39 acrescenta metadados opcionais para exibição do mínimo. Flyway para evolução estrutural/dados de referência necessários, não para atualizar dados fictícios descartáveis. Confirmar ambos os repositórios após o merge e criar branch separada para a Etapa 8.

**Documentação canônica:** backend `docs/PLANO_PRE_PRODUCAO.md`, `docs/CONTINUIDADE_ETAPA_7_2026-10-06.md`, `docs/ETAPA_7_7_AUDITORIA_INTEGRACAO_BACKEND_FRONTEND.md`; frontend `docs/PADRAO_VISUAL_PRE_PRODUCAO.md`, `docs/ETAPA_7_6_0_AUDITORIA_FRONTEND_PADRAO_VISUAL_PEDIDOS.md`. Registros datados anteriores refletem checkpoints históricos, não substituem este encerramento.


**Início:** 14/10/2026  
**Status:** Auditoria inicial concluída; **nenhuma mudança funcional de UI realizada neste checkpoint**.  
**Branch:** `collab/etapa-7-unidades-solucoes-contexto`

**Fonte de verdade do contrato:** `gbsalermo/Sistema-SGL/docs/ETAPA_7_5_AUDITORIA_E_CONTRATO_CONTEXTO_OPERACIONAL.md`.

## Verificação real do frontend

- `src/modules/estagiarios/views/EstagiariosGestaoView.vue` recebe `vinculos[].participacoesAtividade` com Atividade/SCI/Projeto/Laboratório, diferencia participações abertas e históricas. Preservar esse padrão.
- `src/modules/projetos/views/ProjetosGestaoView.vue` mostra Projeto → SCI → Atividade e responsável; **não** mostra estagiários participantes. Esta é uma necessidade registrada desde a Etapa 6.
- `src/modules/pedidos/views/solicitante/NovoPedidoView.vue` usa `session.usuario.laboratorioId` para não gestores; Projeto é filtrado após laboratório.
- `src/modules/solucoes/views/NovaSolucaoView.vue` usa o mesmo laboratório-base para não gestores; exige selecionar Projeto.
- `src/modules/operacao/services/laboratoriosOperacionais.ts` já resolve laboratórios ativos de Gestor/Admin.

## Ordem de implementação frontend

### 7.5.1 Componente de contexto e serviço de leitura (após contrato backend)

Criar tipos explícitos `ContextoOperacional` e serviço read-only que consome endpoint com retorno de origem, participação, Atividade, SCI, Projeto, Laboratório e elegibilidade.

Critérios:
- Um contexto elegível: pré-seleção permitida.
- Vários contextos: escolha explícita da participação/Atividade.
- Nenhum: mensagem operacional clara; não cair no laboratório legado do Estagiário.
- Projeto e Laboratório aparecem como dados derivados da escolha, e não selects livres para Estagiário.
- Somente dados da Unidade do usuário.

### 7.5.2 Hub Projetos → SCI → Atividades

Na Atividade, após responsável atual, adicionar **Estagiários vinculados**, separando **participações em andamento** e **histórico** de forma compacta/expansível. Reutilizar os cards, tipografia, status, Light/Dark e espaçamento definidos no padrão visual SGL. Não criar atalho de cadastro que ignore regras de participação nem duplicar cadastro de estagiário em Projeto.

O frontend deve consumir API específica filtrada por tenant/Atividade ou batch de Projeto para evitar varrer dados pessoais de toda a Unidade no navegador.

### 7.5.3 Preparação para Etapa 8

Documentar como o mesmo componente será utilizado em `NovoPedidoView.vue` e `NovaSolucaoView.vue`. **Não mudar ainda o payload persistido nem quebrar os fluxos homologados 7.4**: o contrato e a mudança estrutural do Pedido serão efetivamente aplicados na Etapa 8.

## Checklist de aceite da 7.5

- [ ] Consulta read-only sem tenant cruzado e sem vazamento de participantes de outros usuários
- [ ] Estagiário com 0/1/N participações representado corretamente, incluindo múltiplos Projetos/Laboratórios na mesma Unidade
- [ ] Participação aberta porém fora da vigência/inativa apresentada como inelegível, sem alterar histórico
- [ ] Hub de Projetos mostra estagiários nas respectivas Atividades e mantém responsável original
- [ ] Nenhuma relação direta artificial Projeto ↔ Estagiário
- [ ] Mesmos tokens/tema Light/Dark/responsividade do restante do SGL
- [ ] Builds, suite backend, smoke DEV/DEMO e regressão do 7.4
- [ ] Documentação + continuidade sincronizadas antes do fechamento; sem merge sem autorização

## Riscos conhecidos

A API DEV ainda está em fase de autenticação/autorização temporária. Exibir dados no frontend por filtro não é autorização. O endpoint de leitura definitivo deve validar Unidade, perfil e titularidade em backend e ser reavaliado na etapa de segurança antes de produção.


## Checkpoint de disponibilidade do backend — 14/10/2026 (7.5.2)

A 7.5.1 recebeu confirmação de testes JUnit e boot pelo responsável. A 7.5.2 foi publicada no backend, ainda **pendente de JUnit/boot/HTTP**.

**API disponível após validação:** `GET /api/v1/contextos-operacionais/projetos/{projetoId}/participacoes`; o frontend utiliza o prefixo `/v1` configurado pelo cliente HTTP. Uma chamada por Projeto é suficiente para reunir as participações das Atividades daquele Projeto. Também existem `GET /api/v1/contextos-operacionais/atividades/{atividadeId}/participacoes` e `/usuarios/{usuarioId}`.

**DTO:** `ContextoOperacionalResponseDTO` com `origem`, `participacaoId`, `vinculoEstagioId`, `usuarioId`, `usuarioNome`, `atividadeId`, `atividadeNome`, `atividadeCodigoSeg`, `sciId`, `sciNome`, `projetoId`, `projetoNome`, `laboratorioId`, `laboratorioNome`, `unidadeId`, `dataInicioParticipacao`, `dataFimParticipacao`, `aberta`, `elegivel` e `motivoInelegibilidade`.

**7.5.3 após backend verde:** adicionar `projetosService.listarParticipacoesProjeto(projetoId)`, agrupar `atividadeId`, apresentar participantes atuais e históricos no card da Atividade com deduplicação apenas para visualização atual (preservando todas as ocorrências históricas), e revalidar tema/responsividade. A classificação de **atual/histórico** considera `aberta`, enquanto a habilitação de novas operações utiliza `elegivel`; nunca confundir os dois campos. Não implementar mutações pelo hub. **Nenhuma tela foi modificada nesse checkpoint.**


## Implementação 7.5.3 — Hub Projetos → SCI → Atividade (14/10/2026)

**Status:** código frontend publicado, **aguardando `npm run build` e aceite visual local**. A 7.5.2 backend foi confirmada verde pelo responsável.

### Funcionamento

1. A seleção do Projeto chama `projetosService.listarParticipacoesProjeto(projetoId)` uma única vez, além das consultas de SCI/Atividades existentes.
2. Cada Atividade possui o botão expansível **Estagiários vinculados**, com contadores de participações **abertas** (atuais) e encerradas (histórico). Contagens de atuais deduplicam usuário na Atividade, sem duplicar o card; a listagem histórica preserva registros distintos.
3. Ao expandir, mostra nomes, início/fim, estado operacional elegível/inelegível com motivo. Se não há participantes, informa vazio; se a API falha, informa indisponibilidade sem zerar falsamente a contagem.
4. Se o usuário alternar rapidamente o Projeto, respostas de Projeto anterior são ignoradas. Falha na consulta de participantes não oculta Projeto/SCI/Atividades.
5. Responsável institucional da Atividade continua visível. Sem cadastrar/editar participantes por essa nova área; o vínculo continua no módulo Estagiários.
6. A camada usa tokens de tema e grid responsivo, com `aria-expanded`/`aria-controls` na área expansível.

### Teste local da 7.5.3

- [ ] Rodar `npm run build` no frontend na branch `collab/etapa-7-unidades-solucoes-contexto`.
- [ ] Entrar no perfil Gestor/Admin em DEV, abrir **Gestão → Projetos** e escolher um Projeto com Estagiários associados em atividades.
- [ ] Expandir Estagiários vinculados na Atividade correta: nomes visíveis, quantidade de atuais coerente e responsável original preservado.
- [ ] Conferir outra Atividade sem participantes: indicador `0 atuais · 0 no histórico`; a seção indica ausência de vínculos.
- [ ] Encerrar uma participação pelo módulo Estagiários (somente se houver massa DEV preparada), atualizar Projetos e conferir registro no histórico, não na lista atual.
- [ ] Conferir caso de participação aberta porém inelegível: UI diferencia estado de vínculo e elegibilidade, sem tratá-la como encerrada.
- [ ] Alternar Projetos rapidamente: dados não se misturam. Simular erro HTTP: hierarquia permanece carregada e seção não disfarça erro como zero participantes.
- [ ] Verificar Light/Dark, escala 100%, desktop/mobile, ausência de regressão em edição, prorrogação e correção SEG de SCI/Atividade.

**Nenhuma migration ou alteração de payload de Pedido/Solução**; isso continua para a Etapa 8. Não marcar como concluída/validada antes do build e do teste visual.


## Validação da 7.5.3 e polimento da data final — 15/10/2026

**7.5.3 validada pelo responsável** (integração de Estagiários por Atividade no hub Projetos). Os checkboxes históricos acima continuam como roteiro técnico detalhado, mas o aceite funcional foi confirmado na conversa.

**Ajuste visual posterior, publicado e ainda não testado localmente:**
- Gestão → Estagiários → Drawer → Participações em atividades: 3 campos independentes de **Início da participação**, **Prazo da Atividade/Projeto**, **Encerramento efetivo**. Se participação sem `dataFimParticipacao`, mostrar **Não registrado**; data prevista do Projeto/Atividade jamais substitui o encerramento efetivo.
- Para `dataInicioParticipacao > hoje` e participação aberta: rótulo **Início programado** (não afirmar que o trabalho já começou). A definição do `ativa` legado não muda, pois representa associação ainda não encerrada.
- Cadastro e edição da participação: campos de data inicial permanecem editáveis e permitem início futuro nas regras existentes; textos auxiliares explicam isso. No encerramento, campo renomeado para **Data de encerramento efetivo**.
- Estilos dos três campos usam tokens existentes (tema e quebra mobile), sem mudar modelo, serviço ou migrações.

**Smoke visual pendente:** `npm run build`, abertura dos cards com datas planejadas/efetivas, registro de início futuro, edição antes de iniciar, alternância Light/Dark e tela estreita. Não marcar esta alteração como validada até retorno. Sem merge.


## Implementação 7.5.4 — serviço compartilhado e passagem para Etapa 8 (15/10/2026)

**Status:** implementação publicada, revisão estática feita, **`npm run build` ainda não executado nesta sessão**. O responsável confirmou o aceite da 7.5.3 e do pequeno polimento do botão **Salvar referência**; não presumir daí a suíte técnica final.

### Arquivos de código

- `src/modules/operacao/types/contextoOperacional.ts` — fonte única do tipo `ContextoParticipacaoOperacional`. Funções puras de **preparação de opções** e **resolução de uma participação explicitamente escolhida**.
- `src/modules/operacao/services/contextoOperacionalService.ts` — serviço read-only para os três endpoints da 7.5.2; **não** faz escrita nem seleciona contexto pela conta do usuário.
- `src/modules/projetos/types/projetos.ts` — reexportação de compatibilidade do tipo, sem duplicá-lo.
- `src/modules/projetos/services/projetosService.ts` — usa `contextoOperacionalService.listarParticipacoesProjeto`; a interface do hub mantém o método existente, sem mudança de comportamento.

### Contrato preparado para os formulários da Etapa 8

`prepararSelecaoContextoEstagiario(contextos, unidadeId)` aceita participações retornadas pelo backend, inclui somente registros **elegíveis**, com participação/Atividade/SCI/Projeto/Laboratório/Unidade preenchidos e Unidade compatível, e gera:
- `SEM_CONTEXTO_ELEGIVEL` — lista vazia, sem fallback para Laboratório legado;
- `PRE_SELECIONAVEL` — uma participação elegível, ID sugerido;
- `ESCOLHA_OBRIGATORIA` — múltiplas participações, ID sugerido **nulo** (usuário precisa escolher).

`resolverContextoEstagiario(opcoes, participacaoId, unidadeId)` retorna o conjunto derivado de IDs para exibição/revisão do contexto escolhido, ou `null` se inválido. **Esses IDs não são autorização; o backend deve recalcular e persistir a derivação ao criar o Pedido, na Etapa 8.**

**Limite de versão:** a API atual de `GET .../usuarios/{usuarioId}` aceita somente o perfil Estagiário. Técnico/Analista/Pesquisador e Gestor/Admin exigem contrato de resolução por Projeto/Laboratório na Etapa 8, descrito no documento de passagem do backend `docs/CONTRATO_CONTEXTOS_PEDIDOS_ETAPA_8.md`. **Nenhum trecho de `NovoPedidoView.vue` ou `NovaSolucaoView.vue` foi alterado nesta 7.5.4**, porque a validação persistente da participação e as permissões ainda não existem no Pedido atual.

### Validação local pendente (uma coisa de cada vez)

1. Executar `npm run build` no SGL-FRONTEND, branch `collab/etapa-7-unidades-solucoes-contexto`; comprovar `vue-tsc` + Vite sem erro.
2. Verificar rápida regressão: hub de Projetos consulta Estagiários por Atividade, sem interferência; Pedidos convencionais e Soluções continuam abrindo como antes.
3. QA abrangente, DEV/DEMO, IB/IQ, Light/Dark, responsividade e suíte final seguem **7.6/7.7**. Não confundir build verde com autorização API real.

**Não fazer merge sem autorização expressa.**


## Fechamento da implementação da 7.5 — 15/10/2026

**Situação:** `7.5.1–7.5.4` concluídas em implementação; **build frontend da 7.5.4 verde segundo confirmação expressa do responsável** após correção de TS2339 no cadastro administrativo. A 7.5.3 já havia recebido aceite funcional (hub de Estagiários por Atividade); o polimento de datas e o botão Salvar referência foram aplicados, sem regra de backend nova.

**Correção de build:** `src/modules/admin/views/CadastrosAdminView.vue` tinha `codigoSeg` e `status` acessados dentro de `laboratoriosFiltrados` (linha 881), quando ambos pertencem a `ProjetoCadastro`. Agora Laboratórios exibem nome/descrição e Projetos exibem Código SEG/status/descrição. Commit corretivo final: `f7dfc79`.

**Escopo preservado:** os dois formulários de solicitação, payload do Pedido e seu armazenamento permanecem inalterados. `src/modules/operacao/types/contextoOperacional.ts` e `src/modules/operacao/services/contextoOperacionalService.ts` foram preparados para aplicação efetiva na **Etapa 8**, com revalidação no backend. Sem migration nem merge.

**Testes ainda devidos:** `7.6` massa DEV/DEMO, regressão de casos 0/1/N, testes finais `mvn test`, boot, `npm run build` no HEAD consolidado; `7.7` QA de perfis, Unidade/tenant, Light/Dark e responsividade. O build verde não prova autorização em endpoints DEV; autenticação definitiva permanece obrigatória antes de produção. A integração efetiva das seleções 0/1/N ao Pedido será testada na Etapa 8.
