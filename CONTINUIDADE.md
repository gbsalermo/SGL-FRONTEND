# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 17/09/2026  
**Branch estável:** `main`  
**Branch recém-concluída:** `feat/etapa-3-residuos`  
**Etapa concluída:** Etapa 3 — refinamentos do fluxo atual de Resíduos ✅  
**Próxima etapa:** Etapa 4 — expansão operacional de Resíduos  
**Plano canônico:** `gbsalermo/Sistema-SGL/docs/PLANO_PRE_PRODUCAO.md`  
**Handoff da próxima etapa:** `gbsalermo/Sistema-SGL/docs/CONTINUIDADE_ETAPA_4_2026-09-17.md`

Este é o checkpoint principal para retomada do frontend. Contratos HTTP devem ser confirmados no Swagger/OpenAPI do backend.

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

Antes da Etapa 4, confirmar que a Etapa 3 foi integrada à `main` nos dois repositórios e criar branch nova a partir da `main` atualizada.

Branch sugerida:

```text
feat/etapa-4-residuos
```

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

# 9. Etapa 4 — próxima etapa

Ordem prevista:

```text
4.1 Locais de armazenamento cadastráveis
→ 4.2 Modelos de Resíduo pré-cadastrados
→ 4.3 Escolha modelo x preenchimento manual
→ 4.4 Correções administrativas do ciclo
```

Frontend só deve ser fechado depois das regras de backend/domínio de cada subetapa estarem definidas.

## 4.1

Esperado no frontend:

- escolher local cadastrado;
- permitir complemento livre;
- manter caminho manual quando permitido;
- não perder histórico se o cadastro do local mudar.

## 4.2 / 4.3

Na Administração, Gestão poderá manter modelos reutilizáveis.

Na criação:

```text
usar modelo
ou
preencher manualmente
```

Selecionar modelo deve preencher sugestões, sem transformar o Resíduo real em referência viva ao modelo.

## 4.4

Avaliar ações de Administrador:

```text
Cancelar Resíduo
Retornar para análise/liberação
```

Sempre com justificativa e histórico. Regras de status precisam ser fechadas antes da implementação.

Delete lógico geral continua na Etapa 11.

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
Etapa 4 — expansão operacional de Resíduos            ⏭ próxima
Etapas 5 a 13                                         ⏳
```

---

# 12. Regra final de retomada

**A Etapa 3 está concluída e validada. A próxima janela deve confirmar que a branch `feat/etapa-3-residuos` foi integrada à `main` nos dois repositórios. Depois, criar `feat/etapa-4-residuos` a partir da `main` atualizada e começar pela 4.1 — locais de armazenamento cadastráveis. Antes de alterar o frontend, fechar a modelagem e os contratos necessários no backend. Ler o handoff `gbsalermo/Sistema-SGL/docs/CONTINUIDADE_ETAPA_4_2026-09-17.md`.**
