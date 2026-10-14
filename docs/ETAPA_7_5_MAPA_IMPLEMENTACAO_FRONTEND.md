# Etapa 7.5 — Mapa de implementação frontend / contexto operacional

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
