# Documentação técnica — SGL Frontend

**Revisão do índice:** 17/11/2026 · **Base de código:** `release` · **Estado:** organização documental e leitura estática de contratos, sem homologação integrada executada nesta revisão.

> **Fonte canônica:** GitLab institucional `release`; GitHub `release` é espelho. `main` é uma linha distinta. A branch `collab/docs-release-estado-2026-11` contém somente documentação destinada a MR. A aparência de módulo “pendente” em arquivo de etapa antigo não invalida o código atual.

O conteúdo **integral** do índice anterior foi preservado em [`HISTORICO_INDICE_DOCUMENTACAO_ATE_2026-11-17.md`](HISTORICO_INDICE_DOCUMENTACAO_ATE_2026-11-17.md). Sua referência a Etapa 6 como próxima, cabeçalho DEV e caminhos de `main` são **históricos**, não orientações correntes.

## Ordem de leitura para manutenção

| Ordem | Documento | O que consultar |
|---|---|---|
| 1 | [`../CONTINUIDADE.md`](../CONTINUIDADE.md) | Checkpoint e regras da branch atual |
| 2 | [`GOVERNANCA_DOCUMENTAL.md`](GOVERNANCA_DOCUMENTAL.md) | Hierarquia e vigência das fontes |
| 3 | [`DOSSIE_PROJETO_SGL.md`](DOSSIE_PROJETO_SGL.md) | Stack, roteamento, stores, serviços, telas, API e impressão |
| 4 | [`AUDITORIA_DOCUMENTAL_FRONTEND_2026-11-12.md`](AUDITORIA_DOCUMENTAL_FRONTEND_2026-11-12.md) | Inventário documental e revisões realizadas |
| 5 | [`PRESERVACAO_CENTRAL_AJUDA_VIDEOS.md`](PRESERVACAO_CENTRAL_AJUDA_VIDEOS.md) | Política obrigatória para **20 tutoriais, 21 artigos contando FAQ e vídeos** |
| 6 | [`SINCRONIZACAO_GITLAB_GITHUB.md`](SINCRONIZACAO_GITLAB_GITHUB.md) | Direções de espelhamento, branches e procedimentos de MR |
| 7 | [`INVENTARIO_TELAS.md`](INVENTARIO_TELAS.md) e [`FLUXOS_NAVEGACAO.md`](FLUXOS_NAVEGACAO.md) | Catálogo de telas e jornadas; confrontar com router atual |
| 8 | [`PADRAO_VISUAL_PRE_PRODUCAO.md`](PADRAO_VISUAL_PRE_PRODUCAO.md), [`IDENTIDADE_VISUAL.md`](IDENTIDADE_VISUAL.md), [`REGRA_PADRONIZACAO_NOVOS_MODULOS.md`](REGRA_PADRONIZACAO_NOVOS_MODULOS.md) | Padrões de componentes, identidade, tokens e responsividade |
| 9 | [`PLANO_TESTES_PRIMEIRO_PROTOTIPO.md`](PLANO_TESTES_PRIMEIRO_PROTOTIPO.md) | Histórico do plano inicial, **não aceitação de E2E atual** |

**Fontes cross-repo:** o backend contém a matriz `docs/MATRIZ_COERENCIA_FRONTEND_BACKEND_2026-11-12.md`, o **registro único** `docs/REGISTRO_PENDENCIAS_REVISAO_SGL_2026-11.md` (SGL-REV-001 a 031), a Etapa 12 de qualidade e o plano `docs/PLANO_HOMOLOGACAO_NUVEM_MOBILE_2026-11-17.md`. Os links de revisão atuais estão no [dossiê deste frontend](DOSSIE_PROJETO_SGL.md), e serão conciliados com o GitLab após os MRs.

**Inventário original:** `AUDITORIA_DOCUMENTAL_FRONTEND_2026-11-12.md` registra **87 arquivos Markdown na `release` original**, incluindo 21 artigos da Ajuda. Documentos criados na branch de revisão aumentam a contagem, não alteram retroativamente o inventário histórico.

## O que está implementado na release

- **Vue 3, Vite, TypeScript, Vue Router, Pinia, Vuetify, Axios e Vitest.** UI/rotas reais em `src/`; dados e autorizações operacionais são decididos pelo backend, não por botões ou filtros ocultos.
- **Sessão:** login corporativo via `/v1/auth/login`, JWT local `sgl.session`, `/v1/auth/me`; login `dev/demo` somente em configuração permitida. Tenant vem da identidade no backend. O cliente só envia `X-SGL-Unidade-Id` para `ADMINISTRADOR_GERAL` quando seleciona outra Unidade.
- **Estagiários:** o solicitante seleciona participação elegível Projeto/SCI/Atividade e laboratório simultaneamente permitido para Projeto e pessoa; funcionários podem escolher laboratório ativo da Unidade, com sinalização de exceção conforme regra atual. Projeto não é genericamente opcional para Estagiário.
- **Pedidos, Soluções, Resíduos e Estoque:** formulários, aprovações, lote/recipiente, rótulos e relatórios integrados. O frontend da `release` possui impressão A4 e exportação/Browser Print Zebra para Produto/Resíduo/Solução/entrada de lote.
- **Central de Ajuda:** 20 vídeos referenciados por `tasks.json`, FAQ separado, posters e PDF versionados; MP4 publicados por **volume externo do Nginx** conforme `docker-compose.yml` e `nginx.conf.template`. **A ausência dos vídeos no Git não comprova falha de publicação.**

## Estado da revisão e limites

A auditoria registrou uma matriz de riscos **sem corrigir funcionalidades**: autorização horizontal de GETs, conteúdo do FAQ/tutoriais por perfil, carga do Dashboard e de Relatórios, quantidade física heterogênea e limites da cobertura de testes.

- `npm run test` chama Vitest e abrange os arquivos `src/**/__tests__/*.spec.ts`, mas **não** os testes Zebra `src/modules/rotulos/zebra/*.test.mjs` baseados em `node:test`.
- Há CSS responsivo nos formulários de Pedido/Solução/Resíduo e menu móvel na Ajuda, porém ainda **não há evidência de jornada em Android Chrome e iOS Safari reais**.
- **Plano de homologação não executado:** staging efêmero em nuvem com frontend, API, PostgreSQL/Flyway e JWT/test doubles corporativos autorizados; CL-01 a CL-11 para endpoints e MB-01 a MB-12 para Estagiário em celular. O uso de dados institucionais ou produção exige autorização específica.
- **Central de Ajuda permanece intocada:** não modificar `src/modules/ajuda/`, `public/ajuda/`, vídeos, posters e PDFs durante revisão documental. Divergências editoriais ficaram no backlog, sem publicação.

## Guias por área e registros históricos

| Área | Guias |
|---|---|
| Interface e tema | [`SHELL_VISUAL.md`](SHELL_VISUAL.md), [`PADROES_PAGINA.md`](PADROES_PAGINA.md), [`GUIA_EFEITOS_VISUAIS.md`](GUIA_EFEITOS_VISUAIS.md), [`ICONOGRAFIA.md`](ICONOGRAFIA.md) |
| Solicitante | [`ETAPA_2_MEUS_PEDIDOS.md`](ETAPA_2_MEUS_PEDIDOS.md), [`ETAPA_7_4_TESTE_FLUXO_SOLUCOES.md`](ETAPA_7_4_TESTE_FLUXO_SOLUCOES.md), [`ETAPA_8_INICIO_E_REGRAS.md`](ETAPA_8_INICIO_E_REGRAS.md) |
| Estoque e Gestão | [`ETAPA_7_5_MAPA_IMPLEMENTACAO_FRONTEND.md`](ETAPA_7_5_MAPA_IMPLEMENTACAO_FRONTEND.md), [`ETAPA_2_GESTAO_ESTOQUE.md`](ETAPA_2_GESTAO_ESTOQUE.md) |
| Relatórios | [`ETAPA_9_INTEGRACAO_FRONTEND_2026-10-26.md`](ETAPA_9_INTEGRACAO_FRONTEND_2026-10-26.md), [`ETAPA_9_1_AUDITORIA_CONTRATOS_RELATORIOS_2026-10-26.md`](ETAPA_9_1_AUDITORIA_CONTRATOS_RELATORIOS_2026-10-26.md) |
| Impressão e Zebra | [`ETAPA_10_PREPARACAO_ROTULOS_IMPRESSAO_2026-10-27.md`](ETAPA_10_PREPARACAO_ROTULOS_IMPRESSAO_2026-10-27.md), [`ETAPA_10_ZEBRA_PILOTO_ZPL_2026-10-29.md`](ETAPA_10_ZEBRA_PILOTO_ZPL_2026-10-29.md), [`ROTULO_PRODUTOS.md`](ROTULO_PRODUTOS.md) e [`ROTULO_RESIDUOS.md`](ROTULO_RESIDUOS.md) |
| Protótipo | [`FECHAMENTO_PRIMEIRO_PROTOTIPO.md`](FECHAMENTO_PRIMEIRO_PROTOTIPO.md) e demais Etapas 1–2: **registro histórico**, não o estado corrente da release |

## Execução e implantação

**DEMO local e autenticação (24/11/2026):** o frontend exibe **Entrar como desenvolvedor** quando a API `dev/demo` informa `devLoginAtivo: true` em `GET /v1/auth/config`. O usuário informa o login curto (ex.: `ricardo.almeida`) **sem senha**; `POST /v1/auth/dev-login` é separado do login corporativo. Configurar `VITE_API_BASE_URL=http://localhost:8080/api` no desenvolvimento local e reiniciar o Vite. Contas, execução H2 e diagnóstico no [guia DEMO do backend](https://github.com/gbsalermo/Sistema-SGL/blob/collab/docs-release-estado-2026-11/docs/DEMO_APRESENTACAO_EMBRAPA.md).

**Desenvolvimento:** `npm ci`, `npm run dev`, `npm run type-check`, `npm run test`, `npm run build`. Usar `.env.example` e ambiente autorizado. **Não executar scripts antigos de checkout** descritos nas Etapas 7–10 como se fossem da release.

**Deploy fiel à topologia real:** `Dockerfile` compila Vite com `VITE_API_BASE_URL=/api`; `nginx.conf.template` faz proxy na mesma origem `/api` para o backend; `docker-compose.yml` conecta à rede autorizada e ao volume externo **somente leitura** dos vídeos. Staging deve usar redes, volumes, segredos e banco **isolados**, nunca copiar credenciais institucionais.

**Política de integração:** GitHub `collab/*` → GitLab `collab/*` → MR → GitLab `release`; GitHub `release` é espelho. Antes do merge, conferir SHAs, diff de assets/ajuda e regressão documental. Para próximos testes usar os planos do backend; não declarar testes executados pela presença de scripts.

**Estado deste índice:** referência atual de manutenção, preservando todo o histórico em arquivos de etapas e no índice arquivado.
