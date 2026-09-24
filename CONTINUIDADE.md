# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 24/09/2026  
**Branch estável:** `main` do GitLab institucional  
**Branch histórica da Etapa 4:** `feat/etapa-4-residuos` — referência; não mergear integralmente  
**Branch atual de reconciliação:** `collab/etapa-4-residuos-reconcile`  
**Etapa concluída:** Etapa 4 — expansão operacional de Resíduos ✅  
**Etapa atual:** Etapa 5 — Projetos e Atividades ⏭ próxima  
**Etapa 4:** 4.1–4.4 reconciliados e validados ponta a ponta ✅
**Plano canônico:** `gbsalermo/Sistema-SGL/docs/PLANO_PRE_PRODUCAO.md`  
**Referência de fechamento da Etapa 4:** `gbsalermo/Sistema-SGL/docs/CONTINUIDADE_ETAPA_4_2026-09-17.md`

Este é o checkpoint principal para retomada do frontend. Contratos HTTP devem ser confirmados no Swagger/OpenAPI do backend.

> **Infraestrutura Git obrigatória:** ler `docs/SINCRONIZACAO_GITLAB_GITHUB.md` antes de alterar branches. GitLab é a fonte canônica de `main`; GitHub espelha `main` e recebe a colaboração em `collab/*`. Não usar `--force` e não editar `GitHub/main` diretamente.

---

# 1. Regra de trabalho

```text
branch própria
→ implementar/revisar
→ validar
→ refinar
→ PR
→ main
→ atualizar documentação
```

Regra especial:

- backend funcional é implementado manualmente pelo responsável do projeto;
- IA pode analisar/modelar/orientar/revisar;
- frontend e documentação podem ser alterados diretamente quando autorizado;
- não antecipar etapas futuras.

A Etapa 4 já possui implementação histórica em `feat/etapa-4-residuos`, porém essa branch é anterior às correções recentes do supervisor. Ela serve apenas como fonte para port seletivo.

Branch atual:

```text
collab/etapa-4-residuos-reconcile
```

Antes de alterações visuais/contratuais, atualizar a branch com `gitlab/main` quando for fast-forward possível e confirmar o contrato reconciliado no backend.

---

# 2. Estado consolidado

```text
Bootstrap / identidade visual                         ✅
Login visual / sessão DEV                            ✅
Expiração automática da sessão em 5h                 ✅
Pedidos do Solicitante                               ✅
Pedidos da Gestão                                    ✅
Estoque / lotes                                      ✅
Movimentações                                        ✅
Relatórios / fiscalização                            ✅
PDF/XLSX                                             ✅
Resíduos — Solicitante                               ✅ Etapa 3 refinada
Resíduos — Gestão                                    ✅ Etapa 3 refinada
Classes de Resíduo em Cadastros                      ✅
Segurança/EPI em Produto/Resíduo                     ✅
Prévia antecipada do rótulo                          ✅
Bloqueio de impressão antes da liberação             ✅
Rótulo de Resíduo                                    ✅ base funcional; final na Etapa 10
Rótulo de Produto                                    ✅ base funcional; final na Etapa 10
Estagiários                                          ✅ base atual
Pessoas por laboratório                              ✅
Administração / Cadastros                            ✅
Dashboard Gestão                                     ✅
Dashboard Solicitante                                ✅
Alertas operacionais                                 ✅
Busca global                                         ✅
Dark Mode definitivo                                 ✅
404                                                  ✅
Contexto de Unidade enviado à API                    ✅
Testes unitários/componentes                         ⏳ Etapa 12
Testes E2E                                           ⏳ Etapa 12
Autenticação/autorização definitiva                  ⏳ posterior
```

---

# 3. Rotas principais

```text
/login

SOLICITANTE
/inicio
/meus-pedidos
/meus-residuos
/pedidos/novo
/residuos/novo

GESTÃO / ADMIN
/dashboard
/pedidos
/estoque
/estoque/lotes-vencendo
/estoque/:id
/movimentacoes
/estagiarios
/residuos
/relatorios
/relatorios/residuos
/relatorios/pessoas-laboratorio
/administracao/cadastros

RÓTULOS
/residuos/:id/rotulo
/produtos/:id/rotulo
```

Rota inicial:

```text
GESTOR / ADMINISTRADOR → /dashboard
TECNICO / ANALISTA / PESQUISADOR / ESTAGIARIO → /inicio
```

---

# 4. Sessão DEV, perfis e Unidade

Perfis atuais:

```text
ADMINISTRADOR
GESTOR
TECNICO
ANALISTA
PESQUISADOR
ESTAGIARIO
```

A sessão DEV contém:

```text
unidadeId
unidadeNome
unidadeSigla
laboratorioId
laboratorioNome
```

O interceptor envia:

```text
X-SGL-Unidade-Id: <unidadeId>
```

Esse mecanismo garante contexto funcional de Unidade em desenvolvimento, mas não substitui autenticação/autorização definitiva.

---

# 5. Resíduos — estado final da Etapa 3

Rotas:

```text
Solicitante
/residuos/novo
/meus-residuos

Gestão
/residuos

Rótulo
/residuos/:id/rotulo
```

Fluxo:

```text
INFORMADO
→ EM_ANALISE
→ LIBERADO_PARA_ARMAZENAMENTO
→ ARMAZENADO_TEMPORARIAMENTE
→ DESPACHADO
```

## Formulário do Solicitante

A tela `InformarResiduoView.vue` já cobre:

- projeto opcional;
- descrição;
- Procedência / uso do Resíduo (`processoOrigem`);
- recipiente;
- quantidade/unidade;
- estado físico;
- tratamento realizado;
- riscos percebidos;
- composição;
- Classes de Resíduo;
- Segurança/EPI;
- sugestões de EPI a partir dos Produtos associados;
- observação final.

O formulário teve escala visual aumentada para uso natural em **100% de zoom**, incluindo maior largura útil, tipografia, campos e espaçamentos.

Classes e EPI usam grade visual alinhada.

## Gestão

A Gestão confirma:

- riscos;
- Classes de Resíduo;
- Segurança/EPI;
- armazenamento temporário;
- destino previsto;
- observações técnicas.

A visualização dos detalhes foi consolidada em **dois cards comparativos**:

```text
Informado pelo laboratório
→ classes
→ risco
→ segurança/EPI
→ observação original

Aprovado pela Gestão
→ classes confirmadas
→ risco confirmado
→ segurança/EPI confirmada
→ observação técnica
→ Gestor que liberou
→ data/hora da liberação
```

O Gestor que liberou é obtido do histórico pelo evento `RISCO_CONFERIDO_E_RESIDUO_LIBERADO`.

## Responsabilidade

A validação final confirmou que armazenamento e despacho podem ser executados por outro Gestor, mantendo rastreabilidade correta.

---

# 6. Rótulo — regra validada

O Código SGL e o QR técnico existem desde a criação.

```text
INFORMADO / EM_ANALISE
→ visualizar prévia ✅
→ imprimir ❌

LIBERADO_PARA_ARMAZENAMENTO ou posterior
→ visualizar ✅
→ imprimir ✅
```

O texto da análise deixa claro que a confirmação **autoriza a impressão**, e não gera o Código SGL.

A tela bloqueia o botão e também evita impressão operacional pelo navegador antes da liberação.

Template final/Zebra continuam na Etapa 10.

---

# 7. Administração / Cadastros

Rota:

```text
/administracao/cadastros
```

Exclusiva de `ADMINISTRADOR`.

Áreas atuais:

```text
Laboratórios
Projetos
Produtos
Classes de Resíduo
Permissões
```

Produtos possuem recomendações estruturadas de segurança.

Classes de Resíduo possuem código, descrição, Unidade e ativação/inativação.

A Etapa 4 adicionará locais de armazenamento e Modelos de Resíduo.

---

# 8. Etapa 3 — fechamento

Validada em 17/09/2026.

```text
3.1 redundância de análise                       ✅
3.2 dados/classes/segurança/responsabilidade     ✅
3.3 prévia x permissão de impressão              ✅
```

Validações finais incluíram:

- criação;
- análise/liberação;
- armazenamento;
- despacho;
- uso de Gestores diferentes;
- histórico;
- classes e EPI;
- comparação informado/aprovado;
- prévia antes da liberação;
- bloqueio/liberação da impressão;
- Gestor que liberou;
- tamanho/legibilidade da tela.

**Etapa 3 encerrada.**

---

# 9. Etapa 4 — concluída e validada

A Etapa 4 foi reconciliada sobre a base atual e validada ponta a ponta.

```text
4.1 Locais de armazenamento cadastráveis              ✅
4.2 Modelos de Resíduo                                ✅
4.3 Uso de modelo ou preenchimento manual             ✅
4.4 Correções administrativas do ciclo de vida        ✅
```

Estado frontend consolidado:

- Administração → Cadastros expõe Modelos de Resíduo no bloco Resíduos;
- Informar Resíduo permite Manual ou Modelo;
- modelo apenas pré-preenche e não cria vínculo vivo com o Resíduo real;
- validações locais seguem o padrão visual aprovado em light/dark;
- cancelamento e retorno administrativo aparecem no histórico e nos dashboards adequados;
- Dashboard do Solicitante mostra somente eventos dos próprios Resíduos;
- Dashboard da Gestão combina movimentações de estoque e eventos operacionais de Resíduos da Unidade;
- cancelados são tratados em Meus Resíduos, Gestão, relatórios e rótulo.

A próxima etapa é **Etapa 5 — Projetos e Atividades**.


# 10. Etapas futuras

```text
Etapa 5 — Projetos + Atividades
Etapa 6 — Estagiários + vínculos
Etapa 7 — relatórios consolidados
Etapa 8 — unidades + Soluções
Etapa 9 — Pedidos + Soluções
Etapa 10 — rótulos + impressão operacional
Etapa 11 — Manual + delete lógico
Etapa 12 — testes automatizados frontend
Etapa 13 — revisão estrutural e legibilidade
```

Etapa 12:

```text
Vitest + Vue Test Utils
Cypress
```

Etapa 13 revisará classes grandes como `Residuo` no backend, Services, DTOs e Controllers, sem alterar comportamento e com reexecução dos testes.

---

# 11. Situação atual

```text
Etapa 1 — refinamento visual global                   ✅
Etapa 2 — Dark Mode definitivo                        ✅
Etapa 3 — refinamentos do fluxo atual de Resíduos     ✅ concluída e validada
Etapa 4 — expansão operacional de Resíduos            ✅ concluída e validada
Etapa 5 — Projetos e Atividades                       ⏭ próxima
Etapas 6 a 13                                         ⏳
```

---

# 12. Regra final de retomada

**As Etapas 1–4 estão concluídas e validadas. Após o merge da branch `collab/etapa-4-residuos-reconcile` no GitLab, iniciar a Etapa 5 a partir da `gitlab/main` atualizada. A antiga `feat/etapa-4-residuos` permanece somente como referência histórica.**

### Estado frontend do 4.4

Implementado na branch de reconciliação:
- status `CANCELADO` nas telas de Gestão, Solicitante e Relatórios;
- ações `Retornar etapa` e `Cancelar resíduo` visíveis apenas para Administrador;
- modal com justificativa obrigatória e erro local;
- histórico apresenta cancelamento e retorno administrativo;
- cancelados deixam de contar como resíduos ativos;
- dark mode integrado aos novos estados e ações.

Validação funcional integrada concluída; este bloco faz parte do fechamento da Etapa 4.

### Ajustes após validação do 4.4

- nomes internos dos status são humanizados inclusive para eventos históricos já gravados;
- dashboard do Solicitante consulta o histórico real dos seus Resíduos e inclui retorno administrativo/cancelamento em **Últimas atualizações**;
- cancelamento aparece como atualização crítica e retorno como movimentação de reavaliação;
- o Resíduo mais recente também considera a data de eventos do histórico administrativo.

Os ajustes foram revalidados e incorporados ao fechamento definitivo da Etapa 4.
