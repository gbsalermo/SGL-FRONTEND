# Dossiê técnico do SGL — Frontend

**Revisão técnica:** 12/11/2026  
**Repositório:** `gbsalermo/SGL-FRONTEND` (espelho GitHub do `sgl-web` institucional)  
**Base verificada:** árvore, arquivos de sessão, HTTP, roteador, bootstrap, testes e módulos da `release` espelhada.  
**Finalidade:** referência de manutenção para desenvolvedores e IAs: **onde alterar, o que preservar, quais dependências inspecionar e como testar**.

> **Escopo e limite:** o mapa de arquivos e os trechos explicitamente descritos como verificados foram confrontados com o código. Isto **não** equivale à auditoria completa de regras de negócio, autorização no backend, desempenho ou testes E2E em produção. Para decisões históricas, consultar [o dossiê anterior preservado](HISTORICO_DOSSIE_FRONTEND_ATE_2026-11-12.md). Para autoridade documental, consultar [Governança documental](GOVERNANCA_DOCUMENTAL.md).

## 1. Contexto, arquitetura e ferramentas

O SGL organiza operações laboratoriais de solicitantes, gestores e administradores. O frontend é uma SPA em **Vue 3 + TypeScript**, com **Vite 8**, **Vue Router 5**, **Pinia 4**, **Axios**, **Vuetify 3** e **Vitest**; versões e compatibilidade devem ser confirmadas em `package.json` e no lockfile.

```text
src/main.ts
  ├─ cria app, Pinia, Vue Router e Vuetify
  ├─ importa tokens e estilos globais
  ├─ registra compatibilidade de dashboard e tema por rota
  ├─ instala callbacks de expiração/pendência da sessão
  └─ monta src/App.vue
src/router/index.ts
  ├─ layouts/SolicitanteLayout.vue
  ├─ layouts/GestaoLayout.vue
  ├─ rotas de login, pendência, rótulos, ajuda e 404
  └─ guards de sessão/perfil (navegação; não substituem backend)
src/modules/<domínio>/
  ├─ views/            telas
  ├─ components/       elementos locais
  ├─ services/         contratos HTTP
  ├─ types/            modelos TypeScript
  └─ __tests__/        testes próximos ao domínio, quando presentes
src/services/          infraestrutura compartilhada
src/stores/            sessão e preferências
src/components/common/ componentes reutilizáveis
src/styles/            tokens, fundação, ajustes históricos e responsividade
```

**Regra de camadas:** componente/view orquestra apresentação; service encapsula requisições; types definem payloads; regras de segurança, estoque e autorização são validadas no backend. Não criar chamadas Axios ad hoc em views nem duplicar validações de domínio como fonte de verdade.

## 2. Sessão, autenticação, perfis e Unidade — estado verificado

| Responsabilidade | Código efetivo | Comportamento observado |
|---|---|---|
| Login visual | `src/modules/auth/views/LoginView.vue`, `components/LoginAccessForm.vue` | UI de entrada; conferir formulário para escolha de modo |
| Login HTTP | `src/stores/session.ts` | `POST /v1/auth/login` com login/senha; `POST /v1/auth/dev-login` em ação separada de desenvolvimento |
| Sessão persistida | `src/stores/session.ts` | JWT, usuário, expiração e unidade operacional no `localStorage`, chave `sgl.session`; remove chave antiga `sgl.dev-session` |
| Atualização de identidade | `src/stores/session.ts` | `GET /v1/auth/me`; sessão expira pelo timestamp recebido |
| Cliente HTTP | `src/services/http.ts` | `Authorization: Bearer <token>`; timeout 15 s; `VITE_API_BASE_URL` obrigatória fora de DEV |
| Unidade | `src/services/http.ts`, `src/stores/session.ts` | Header `X-SGL-Unidade-Id` enviado **somente** quando `ADMINISTRADOR_GERAL` seleciona unidade; demais perfis usam unidade do usuário na sessão |
| Erros | `src/services/http.ts`, `src/main.ts` | 401 fora de login encerra sessão; 403 com `USUARIO_PENDENTE` redireciona para pendência |
| Perfis | `src/modules/auth/perfis.ts` | `ADMINISTRADOR_GERAL`, `ADMINISTRADOR`, `GESTOR`, `TECNICO`, `ANALISTA`, `PESQUISADOR`, `ESTAGIARIO` |

**Correção crítica em relação ao dossiê legado:** não é correto documentar a autenticação atual como “senha não validada, sessão DEV em localStorage, header de unidade enviado para todos”. O código da `release` usa JWT e login HTTP; ainda existe endpoint de desenvolvimento distinto. **A segurança real depende da configuração do backend e do ambiente**, não é certificada por esta inspeção. Não registrar segredo, token ou credenciais nos documentos.

**Guards e perfis:** conferir `src/router/index.ts` e `src/modules/auth/perfis.ts` antes de adicionar uma rota. O router é controle de UX; o backend precisa autorizar cada operação. O perfil `ADMINISTRADOR_GERAL` é relevante para gestão/administração e seleção de unidade.

## 3. Mapa de manutenção por domínio

**Todos os caminhos abaixo são relativos à raiz do frontend.** Os nomes foram conferidos na árvore da `release`; regras internas específicas precisam de leitura do método correspondente.

| Necessidade / mudança | Tela e componentes | Serviço, tipos e verificações |
|---|---|---|
| Login, sessão, permissões | `src/modules/auth/views/LoginView.vue`, `AguardandoAprovacaoView.vue` | `src/stores/session.ts`, `src/services/http.ts`, `src/modules/auth/perfis.ts`; testes de sessão/HTTP |
| Layout, navegação, tema | `src/layouts/GestaoLayout.vue`, `SolicitanteLayout.vue`, `src/App.vue` | `src/router/index.ts`, `src/router/dashboardCompatibility.ts`, `src/services/themeService.ts` |
| Cadastros e pessoas | `src/modules/admin/views/CadastrosAdminView.vue`, `ImportarPessoasView.vue`, `VinculosOperacionaisGestaoView.vue` | `src/modules/admin/services/cadastrosAdminService.ts`, `pessoasCorporativasService.ts`, `vinculosOperacionaisService.ts` |
| Habilitação e catálogos | `src/modules/admin/views/UnidadesHabilitacaoView.vue`, `CatalogosResiduosSolucoesView.vue`, `ModelosResiduoAdminView.vue`, `ModelosSolucaoAdminView.vue` | Serviços administrativos, DTOs e autorização do backend |
| Projetos, SCI e atividades | `src/modules/projetos/views/ProjetosGestaoView.vue` | `src/modules/projetos/services/projetosService.ts`, `types/projetos.ts`; hierarquia, SEG, escopo |
| Estagiários e bolsas/vínculos | `src/modules/estagiarios/views/EstagiariosGestaoView.vue`, `components/CriarVinculoEstagioDialog.vue` | `src/modules/estagiarios/services/estagiarioService.ts`, `types/estagiario.ts`; multilaboratório e orientador exigem validação cruzada |
| Contexto operacional | `src/modules/operacao/components/LaboratoriosSelect.vue`, `SeletorParticipacaoOperacional.vue` | `src/modules/operacao/services/contextoOperacionalService.ts`, `laboratoriosOperacionais.ts`, `vinculoProjetoOperacional.ts`, `laboratorioDoProjeto.ts`, `laboratoriosDaPessoa.ts` |
| Pedidos do solicitante | `src/modules/pedidos/views/solicitante/NovoPedidoView.vue`, `MeusPedidosView.vue`, `PedidosOrientandosView.vue` | `src/modules/pedidos/services/pedidoService.ts`, `types/pedido.ts`; conferir laboratório, projeto, SCI, atividade, aprovação |
| Gestão de pedidos | `src/modules/pedidos/views/gestao/PedidosGestaoView.vue` | Mesmo `pedidoService.ts`; aprovação, correção, rejeição e entrega devem refletir contrato do backend |
| Estoque e lotes | `src/modules/estoque/views/EstoqueGestaoView.vue`, `EstoqueDetalheView.vue`, `LotesVencendoView.vue`, `DocumentoEntradaLoteView.vue` | `src/modules/estoque/services/estoqueService.ts`, `types/estoque.ts`; FEFO/FIFO, recipientes, fracionamento e conversão |
| Movimentações | `src/modules/movimentacoes/views/MovimentacoesGestaoView.vue` | `src/modules/movimentacoes/services/movimentacaoService.ts`, `types/movimentacao.ts` |
| Soluções | `src/modules/solucoes/views/NovaSolucaoView.vue`, `SolucoesSolicitanteView.vue`, `SolucoesGestaoView.vue` | `src/modules/solucoes/services/solucaoService.ts`, `types/solucao.ts`; preparação, fora do catálogo e entrega |
| Resíduos | `src/modules/residuos/views/solicitante/InformarResiduoView.vue`, `MeusResiduosView.vue`, `views/gestao/ResiduosGestaoCompletoView.vue` | `src/modules/residuos/services/residuoService.ts`, `types/residuo.ts`; componente livre/catálogo, classificação e histórico |
| Produtos | `src/modules/produtos/services/produtoService.ts`, `components/ProdutoRotuloAtalho.vue` | `types/produtoRotulo.ts`; catálogo, unidades, informações de risco |
| Relatórios | `src/modules/relatorios/views/RelatoriosGestaoView.vue`, `RelatoriosExportacaoView.vue`, `RelatorioPessoasLaboratorioView.vue`, `RelatorioResiduosView.vue` | `src/modules/relatorios/services/relatorioService.ts`, `types/`; filtros, prévia e exportações |
| Dashboards e alertas | `src/modules/dashboard/views/gestao/DashboardGestaoView.vue`, `solicitante/DashboardSolicitanteView.vue` | `src/services/gestaoShellService.ts`; consultas, estados vazios, carregamento e escopo |
| Central de Ajuda | `src/modules/ajuda/views/HelpCenterView.vue`, `components/HelpTaskContent.vue` | `helpTasks.ts`, `tasks.json`, `helpTexts.ts`, `textos/*.md`; **somente auditoria**, sem editar conteúdo publicado nem mídia |

## 4. Rotas e pontos de impressão verificados

O roteador `src/router/index.ts` é a referência para caminhos atuais, perfis e lazy imports. Exemplos confirmados:

- `/login`; `/aguardando-aprovacao`; `/inicio`; `/dashboard`.
- `/pedidos/novo`, `/meus-pedidos`, `/pedidos`; `/pedidos-orientandos` redireciona para `/meus-pedidos?visao=orientandos` para perfis permitidos.
- `/solucoes/solicitar`, `/minhas-solucoes`, `/residuos/novo`, `/meus-residuos`.
- `/residuos/:id/rotulo` → `src/modules/residuos/views/gestao/RotuloResiduoAjustadoView.vue` (**não** `RotuloResiduoView.vue`).
- `/produtos/:id/rotulo` → `src/modules/produtos/views/RotuloProdutoView.vue`.
- `/solucoes/:id/rotulo` → `src/modules/solucoes/views/RotuloSolucaoView.vue`.
- `/lotes/:id/documento-entrada` → `src/modules/estoque/views/DocumentoEntradaLoteView.vue`.
- `/ajuda` e `/ajuda/:taskId` são rotas públicas da Central de Ajuda.

**Impressão Zebra:** `src/modules/rotulos/zebra/ZebraExportPanel.vue`, `zpl.ts`, `browserPrintLocal.ts`, `marcasZpl.ts`, `recorteMarca.ts`, com testes `zpl.test.mjs` e `browserPrintLocal.test.mjs`; estilos em `src/modules/rotulos/styles/rotulosOperacionais.css`. Existência de tela/exportação não comprova impressão física nem gatilho operacional homologado. Não alterar dimensões, logos ou corte sem ensaio na impressora piloto.

## 5. Padrão visual e risco de regressão

**Fonte documental de estilo:** `docs/PADRAO_VISUAL_PRE_PRODUCAO.md`; complementos em `IDENTIDADE_VISUAL.md`, `PADROES_PAGINA.md`, `SHELL_VISUAL.md` e `REGRA_PADRONIZACAO_NOVOS_MODULOS.md`.

**Fonte executável:** `src/styles/tokens.css`, `base.css`, `foundation.css`, `main.css`; `src/components/common/` contém `SglButton.vue`, `SglCard.vue`, `SglSelect.vue`, `SglTextField.vue`, `SglStatusChip.vue`, `SglFilterButton.vue`, `SglIconButton.vue` e outros. `src/services/themeService.ts` trata o tema. `src/main.ts` ainda importa muitos CSS de etapas 1, 2 e 8: **não removê-los em massa** sem verificar cascata e regressão visual. `src/modules/admin/styles/cadastros-scale.css` é específico de cadastros.

Antes de editar UI: identificar componente existente, conferir token, conferir densidade/spacing e estados (carregando, vazio, erro, pendente, desabilitado), testar tema claro/escuro, responsividade, impressão quando aplicável e consistência entre gestão/solicitante.

## 6. Central de Ajuda e vídeos — preservação obrigatória

`src/modules/ajuda/tasks.json` contém **20 tutoriais com identificadores de vídeo**, além do FAQ separado. `helpTasks.ts` constrói URLs `/ajuda/videos/<id>.mp4` e posters `/ajuda/posters/<id>.jpg`. O player em `HelpTaskContent.vue` mantém texto legível quando o vídeo falha. Os arquivos MP4 não estão na árvore Git da `release` consultada, podendo ser fornecidos pela infraestrutura de deploy; **não presumir ausência em produção**.

**Não modificar** `src/modules/ajuda/`, `public/ajuda/`, arquivos de mídia, identificadores, URLs, player, associação de vídeos ou PDF nesta auditoria. Os 21 textos publicados foram lidos, mas divergências de negócio continuam registradas em `AUDITORIA_DOCUMENTAL_FRONTEND_2026-11-12.md`; não atualizar instruções sem validação e alinhamento com os vídeos. Ver [proteção formal](PRESERVACAO_CENTRAL_AJUDA_VIDEOS.md).

## 7. Contratos cruzados e riscos prioritários

| Fluxo | Dependência no backend | O que ainda precisa ser validado |
|---|---|---|
| Sessão/Unidade | `AuthController`, `AuthService`, `ApiSecurityConfig` | Permissões reais, sessão institucional, tratamento de JWT e seleção de Unidade |
| Estagiários multilaboratório | `EstagiarioController`, `VinculoEstagioService`, migrations V47/V48 | Elegibilidade por vínculo, orientador, laboratório e atividade |
| Pedidos e orientandos | `PedidoController`, `PedidoService`, `ContextoOperacionalController` | Projeto opcional conforme perfil, autorização entre laboratórios, correção/rejeição/aprovação |
| Estoque | `EstoqueCentralController`, `LoteController`, serviços correspondentes | FEFO/FIFO, saldo, unidades, fracionamento, lotes e recipientes |
| Soluções | `SolucoesController` utiliza `PedidoService` | Fluxo pendente → preparação → entrega; rótulo no preparo |
| Resíduos | `ResiduoController`, `ResiduoService` | Composição livre/catálogo, histórico, descarte e rótulo |
| Relatórios | `Relatorio*Controller`, `Relatorio*Service` | Filtros, escopo, dados e PDF/XLSX |

Ver `docs/MATRIZ_COERENCIA_FRONTEND_BACKEND_2026-11-12.md` **no repositório backend** para os pontos de confronto. Os arquivos de ajuda `pedido-em-qualquer-laboratorio.md` e `pedido-do-estagiario.md` possuem afirmações cuja compatibilidade depende das regras de contexto; não concluir permissões apenas pela linguagem dos tutoriais.

## 8. Testes, builds e aceite de mudanças

Comandos definidos em `package.json`:

```bash
npm ci
npm run type-check
npm run test
npm run build
```

Testes existentes cobrem, entre outros: `src/stores/__tests__/session.spec.ts`, `src/services/__tests__/http.spec.ts`, `src/modules/auth/__tests__/`, `src/modules/operacao/__tests__/`, `src/modules/pedidos/views/**/__tests__/`, `src/modules/estagiarios/**/__tests__/`, `src/modules/ajuda/__tests__/` e testes de ZPL/BrowserPrint. Os testes de ZPL em `.mjs` podem exigir execução específica; **não afirmar que `npm run test` os executa** sem verificar configuração.

**Checklist mínimo para cada mudança:** (1) ler rota, view, service, DTO e testes; (2) confirmar contrato no backend; (3) alterar sem duplicar regra; (4) executar type-check, testes e build; (5) testar fluxo real e permissões por perfil; (6) verificar acessibilidade, responsividade e visual; (7) conferir diff e documentação; (8) obter aprovação de MR.

**Qualidade ainda não demonstrada nesta auditoria:** E2E completo, carga, testes de segurança, compatibilidade Zebra física, todos os perfis e integração institucional. Build verde não substitui esses aceites.

## 9. Fluxo de colaboração e documentação

**GitLab `release` é a branch canônica operacional**, GitHub `release` é espelho; `main` segue trilha independente. Criar `collab/*` baseada na `release` atual, publicar no GitHub, aguardar sincronização ao GitLab e solicitar **MR manual para `release`**. Não usar `--force`, não mesclar `main` e `release` para “sincronizar”. Procedimento completo em `docs/SINCRONIZACAO_GITLAB_GITHUB.md`.

**Autoridade documental:** este dossiê mantém **mapa de manutenção**; `CONTINUIDADE.md` mantém estado/pendências; `ESTRUTURA_FRONTEND.md` convenções; `PADRAO_VISUAL_PRE_PRODUCAO.md` visual; `GOVERNANCA_DOCUMENTAL.md` precedência; `docs/README.md` é índice, a ser revisado no fechamento. Histórico preservado em [`HISTORICO_DOSSIE_FRONTEND_ATE_2026-11-12.md`](HISTORICO_DOSSIE_FRONTEND_ATE_2026-11-12.md).

## 10. Pendências objetivas para homologação do dossiê

- [x] Mapear pastas, rotas principais, services, testes e ferramentas existentes na `release`.
- [x] Corrigir descrição antiga de autenticação e Unidade conforme `session.ts` e `http.ts`.
- [x] Preservar integralmente o dossiê anterior como histórico consultável.
- [x] Formalizar proteção dos vídeos e demais recursos da Central de Ajuda.
- [ ] Verificar integralmente contratos de pedidos, vínculos multilaboratório, soluções e estoque contra services e backend.
- [ ] Conferir todas as rotas, referências cruzadas e caminhos de teste de maneira automatizada.
- [ ] Executar type-check, testes, build e fluxos integrados; registrar evidências.
- [ ] Confirmar segurança, autorização, impressão física e condições reais de deploy.
- [ ] Validar com o mantenedor e integrar via MR manual.

**Estado:** dossiê técnico **consolidado e alinhado aos pontos verificados da release**, com pendências de homologação explicitadas. Não confundir consolidação documental com aceite funcional de produção.
