# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend:** `gbsalermo/Sistema-SGL`  
**Atualizado em:** 18/09/2026  
**Branch:** `feat/etapa-4-residuos`  
**Estado:** implementação da Etapa 4 concluída ✅  
**Pendente:** build/type-check e validação integrada/manual  
**Roteiro:** backend `docs/VALIDACAO_ETAPA_4.md`  
**Próxima etapa após validação:** Etapa 5 — Projetos e Atividades

O plano canônico permanece no backend em `docs/PLANO_PRE_PRODUCAO.md`.

---

## 1. Estado consolidado

```text
Bootstrap / identidade visual                         ✅
Login visual / sessão DEV                            ✅
Expiração automática da sessão em 5h                 ✅
Pedidos do Solicitante/Gestão                        ✅
Estoque / lotes                                      ✅
Movimentações                                        ✅
Relatórios / fiscalização                            ✅
PDF/XLSX                                             ✅
Resíduos — fluxo Etapa 3                             ✅
Classes de Resíduo                                   ✅
Segurança/EPI                                        ✅
Locais de armazenamento                              ✅ Etapa 4.1
Modelos de Resíduo / Administração                   ✅ Etapa 4.2
Modelo ou preenchimento manual                       ✅ Etapa 4.3
Cancelamento/retorno administrativo                  ✅ Etapa 4.4
Prévia antecipada do rótulo                          ✅
Bloqueio de impressão antes da liberação             ✅
Dashboard Gestão/Solicitante                         ✅
Alertas / busca global                               ✅
Dark Mode definitivo                                 ✅
404                                                  ✅
Contexto de Unidade enviado à API                    ✅
Testes frontend formais                              ⏳ Etapa 12
Autenticação/autorização definitiva                  ⏳ posterior
```

---

## 2. Rotas principais

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

ADMIN
/administracao/cadastros
/administracao/cadastros/modelos-residuo

RÓTULOS
/residuos/:id/rotulo
/produtos/:id/rotulo
```

---

## 3. Etapa 4.1 — armazenamento

A Gestão trabalha com catálogo de locais por Unidade, mantendo o caminho manual.

```text
catálogo + complemento
ou
texto manual

→ snapshot textual em Residuo
```

A confirmação física pode manter ou corrigir o local e a correção fica no histórico.

---

## 4. Etapa 4.2 — Modelos de Resíduo

Nova área administrativa:

```text
/administracao/cadastros/modelos-residuo
```

Permite:

- listar;
- buscar;
- criar;
- editar;
- inativar;
- consultar inativos;
- definir Classes, riscos, EPI, tratamento, recipiente e componentes;
- vincular Produto opcionalmente ao componente.

Regra de domínio:

```text
ModeloResiduo = catálogo reutilizável
Residuo       = ocorrência independente
```

---

## 5. Etapa 4.3 — informar a partir de modelo

Em `/residuos/novo`, o usuário pode:

```text
Preencher manualmente
ou
Selecionar ModeloResiduo ativo
```

O modelo preenche sugestões, mas o usuário pode alterá-las antes do envio.

Não são preenchidos pelo modelo os dados específicos da ocorrência, especialmente quantidade e projeto.

O frontend continua enviando o mesmo request de criação de Resíduo. Nenhum `modeloId` é persistido na ocorrência.

---

## 6. Etapa 4.4 — correções administrativas

`StatusResiduo` inclui:

```text
CANCELADO
```

Na Central de Resíduos, somente `ADMINISTRADOR` recebe ações de:

```text
Retornar etapa
Cancelar resíduo
```

As duas exigem justificativa.

Retorno de uma etapa:

```text
EM_ANALISE                   → INFORMADO
LIBERADO_PARA_ARMAZENAMENTO → EM_ANALISE
ARMAZENADO_TEMPORARIAMENTE  → LIBERADO_PARA_ARMAZENAMENTO
DESPACHADO                   → ARMAZENADO_TEMPORARIAMENTE
```

Cancelados:

- possuem aba própria na Gestão;
- aparecem em Meus Resíduos;
- não contam como ativos nos Dashboards;
- aparecem em relatórios;
- mantêm acesso ao histórico;
- não têm ação operacional normal.

---

## 7. Integrações de API adicionadas

```text
GET    /v1/modelos-residuo
GET    /v1/modelos-residuo/ativos
POST   /v1/modelos-residuo
PUT    /v1/modelos-residuo/{id}
DELETE /v1/modelos-residuo/{id}

PUT    /v1/residuos/{id}/administrar
```

O header de Unidade continua sendo enviado pelo interceptor a partir da sessão DEV.

Os achados de segurança atuais são tratados separadamente pelo supervisor e não fazem parte do fechamento desta etapa.

---

## 8. Validação

Antes do merge:

```bash
npm install
npm run build
npm run dev
```

Depois executar o roteiro completo em:

```text
backend/docs/VALIDACAO_ETAPA_4.md
```

Não há GitHub Actions configurado no repositório; o build e a validação local continuam obrigatórios.

---

## 9. Próximo passo

Se a validação passar:

```text
feat/etapa-4-residuos
→ revisão final
→ merge em main
→ Etapa 5
```

Não iniciar mudanças da Etapa 5 antes do portão de requisitos descrito no plano canônico do backend.
