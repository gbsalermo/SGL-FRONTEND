# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 18/09/2026  
**Branch estável:** `main`  
**Branch atual de trabalho:** `feat/etapa-4-residuos`  
**Etapa concluída:** Etapa 3 — refinamentos do fluxo atual de Resíduos ✅  
**Etapa atual:** Etapa 4 — expansão operacional de Resíduos 🔧  
**Subetapa atual:** 4.2 — Modelos de Resíduo pré-cadastrados  
**Situação do frontend:** 4.1 concluída e validada; 4.2 é o próximo foco  
**Plano canônico:** `gbsalermo/Sistema-SGL/docs/PLANO_PRE_PRODUCAO.md`  
**Handoff atual:** `gbsalermo/Sistema-SGL/docs/CONTINUIDADE_ETAPA_4_2026-09-17.md`

Este é o checkpoint principal para retomada do frontend. Contratos HTTP devem ser confirmados no Swagger/OpenAPI do backend.

**Sincronização documental:** auditada em 18/09/2026 junto ao backend. Documentos vigentes apontam para a 4.2; registros de etapas anteriores permanecem históricos.

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
- frontend da subetapa só deve começar depois do contrato backend correspondente estar definido;
- não antecipar etapas futuras.

A Etapa 3 já foi integrada à `main` nos dois repositórios. A branch `feat/etapa-4-residuos` já foi criada a partir da `main` atualizada.

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

A sessão DEV contém contexto de Unidade/Laboratório e o interceptor envia:

```text
X-SGL-Unidade-Id: <unidadeId>
```

Esse mecanismo garante contexto funcional de Unidade em desenvolvimento, mas não substitui autenticação/autorização definitiva.

---

# 5. Resíduos — estado final da Etapa 3

Fluxo:

```text
INFORMADO
→ EM_ANALISE
→ LIBERADO_PARA_ARMAZENAMENTO
→ ARMAZENADO_TEMPORARIAMENTE
→ DESPACHADO
```

## Solicitante

A tela `InformarResiduoView.vue` cobre:

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

O formulário foi revisado para uso natural em 100% de zoom. Classes e EPI usam grade visual alinhada.

## Gestão

A Gestão confirma riscos, Classes, Segurança/EPI, armazenamento temporário, destino previsto e observações técnicas.

A visualização dos detalhes foi consolidada em dois cards:

```text
Informado pelo laboratório
vs
Aprovado pela Gestão
```

O Gestor que liberou é obtido do histórico pelo evento `RISCO_CONFERIDO_E_RESIDUO_LIBERADO`.

Armazenamento e despacho podem ser executados por outro Gestor, mantendo rastreabilidade correta.

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

Distinção importante:

```text
QR técnico no contrato/identificação
≠
QR obrigatoriamente renderizado no template físico atual
```

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
Locais de armazenamento
Permissões
```

Produtos possuem recomendações estruturadas de segurança.

Classes de Resíduo possuem código, descrição, Unidade e ativação/inativação.

A Etapa 4 já adicionou os locais de armazenamento na 4.1. A subetapa atual adicionará:

```text
4.2 Modelos de Resíduo
```

---

# 8. Etapa 4.1 — concluída ✅

A modelagem implementada e validada é:

```text
LocalArmazenamentoResiduo
= catálogo mutável por Unidade

Residuo.localArmazenamentoResiduo
= referência opcional ao catálogo

Residuo.complementoLocalArmazenamento
= complemento opcional da ocorrência

Residuo.localArmazenamentoTemporario
= snapshot textual histórico completo
```

Regras implementadas e validadas no frontend:

- selecionar local cadastrado;
- complemento opcional;
- modo manual alternativo;
- não enviar simultaneamente modo catálogo e manual;
- listar apenas locais ativos para novas seleções;
- preservar visualização de resíduos antigos mesmo se cadastro for inativado/renomeado;
- análise define local planejado;
- confirmação física pode manter ou corrigir.

Sequência da 4.1:

```text
4.1-A backend: V16 + entidade + repository       ✅
4.1-B backend: CRUD + tenant                     ✅
4.1-C backend: análise/liberação                 ✅
4.1-D backend: confirmação física/correção       ✅
4.1-E revisão backend                            ✅
4.1-F frontend Administração/Cadastros           ✅
4.1-G frontend Gestão                            ✅
4.1-H regressão e fechamento                    ✅
```

**Frontend da 4.1 implementado e validado. A próxima frente é a 4.2 — Modelos de Resíduo.**

---

# 9. Etapas 4.2–4.4 — sequência atual

```text
4.2 Modelos de Resíduo pré-cadastrados
4.3 escolha modelo x preenchimento manual
4.4 correções administrativas do ciclo
```

Na 4.4, avaliar cancelamento/retorno com justificativa e histórico. Delete lógico geral continua na Etapa 11.

---

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

---

# 11. Situação atual

```text
Etapa 1 — refinamento visual global                   ✅
Etapa 2 — Dark Mode definitivo                        ✅
Etapa 3 — refinamentos do fluxo atual de Resíduos     ✅ concluída e validada
Etapa 4 — expansão operacional de Resíduos            🔧 em andamento
  4.1 — locais de armazenamento                       ✅ concluída
  4.2 — Modelos de Resíduo                            🔧 atual
Etapas 5 a 13                                         ⏳
```

---

# 12. Regra final de retomada

**A Etapa 4 segue na branch `feat/etapa-4-residuos`. A 4.1 foi concluída e validada. Próximo passo: 4.2 — Modelos de Resíduo.**
