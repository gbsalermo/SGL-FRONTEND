# Dossiê do Projeto SGL — Frontend / Handoff para IA

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend:** `gbsalermo/Sistema-SGL`  
**Snapshot:** 31/08/2026  
**Objetivo:** permitir que outra IA retome o frontend no ponto correto sem reconstruir decisões já fechadas.

---

# 1. Ordem de leitura

Quando houver conflito:

```text
1. código da main
2. Swagger/OpenAPI do backend para contratos HTTP
3. CONTINUIDADE.md
4. este DOSSIE_PROJETO_SGL.md
5. decisões específicas em docs/
6. documentos históricos de etapas anteriores
```

Documentos de bootstrap, wireframe ou inventário antigo podem conter frases como “próxima etapa”. Essas frases descrevem o momento em que o documento foi escrito e **não substituem a continuidade atual**.

---

# 2. Stack atual

```text
Vue 3.5
Vite 8
TypeScript 5.9
Vue Router 5
Pinia 4
Axios 1.19
Vuetify 3.13
Node >= 20.19
```

Comandos principais:

```bash
npm install
npm run type-check
npm run build
npm run dev
```

Variável de API:

```text
VITE_API_BASE_URL
```

---

# 3. Estado real em 31/08/2026

```text
Fundação visual/técnica                          ✅
Login visual                                     ✅
Sessão temporária de desenvolvimento             ✅
Pedidos do solicitante                           ✅
Pedidos da gestão                                ✅
Urgência                                         ✅
Estoque / detalhe                                ✅
Lotes / entrada / edição / descarte              ✅
Embalagem / multiplicador / fracionamento        ✅
Código SGL de lote                               ✅
Movimentações                                    ✅
Central de Relatórios                            ✅
Relatório de Estagiários                         ✅
Relatório de Produtos                            ✅
Relatório de Movimentações                       ✅
Resumo Operacional                               ✅
Relatório de Estoque e Lotes                     ✅
Relatório de Fiscalização                        ✅
Exportação PDF/XLSX                              ✅
Página 404 animada                               ✅
Administração / Cadastros                        ⏳ PRÓXIMA ETAPA
Resíduos operacional                             ⏳ depende da reconciliação backend
Relatório/exportação de Resíduos                 ⏳
Documentos/upload                                ⏳
Dashboard final / alertas / robustez             ⏳
Autenticação/autorização definitiva              ⏳
Integração corporativa                           ⏳
Refactor técnico para inglês                     ⏳ pós-protótipo
```

---

# 4. Arquitetura do frontend

Direção:

```text
SPA
+ arquitetura orientada a módulos/feature
+ componentes por responsabilidade
```

Fluxo preferido:

```text
View
→ Component
→ Service / Store quando necessário
→ Axios
→ API REST
```

Regras:

- não espalhar chamadas Axios pelas Views;
- não criar Store para todo dado remoto;
- não duplicar módulo por perfil quando a regra/domínio é o mesmo;
- não duplicar FIFO/FEFO ou outras regras críticas do backend;
- usar UUID público nas fronteiras;
- extrair componentes compartilhados quando houver responsabilidade/reuso real;
- interface permanece em português mesmo que o código técnico venha a ser traduzido para inglês no pós-protótipo.

---

# 5. Sessão e login — estado exato

A tela de login está concluída visualmente, mas a autenticação atual é **somente de desenvolvimento**.

O store `src/stores/session.ts` executa hoje:

```text
usuário informa identificador + senha
→ frontend exige campos preenchidos
→ GET /v1/usuarios
→ procura usuário ativo por email/nome
→ senha NÃO é validada pelo backend
→ usuário é salvo em localStorage como sessão DEV
```

Chave atual:

```text
sgl.dev-session
```

O método se chama:

```text
entrarDesenvolvimento(...)
```

Portanto:

```text
interface de login                        ✅
sessão suficiente para desenvolvimento   ✅
autenticação real                        ⏳
autorização real                         ⏳
auditoria baseada em identidade segura   ⏳
SSO/API corporativa                      ⏳
```

Não “endurecer” esse fluxo isoladamente antes da etapa oficial sem coordenar backend, autorização e auditoria.

---

# 6. Rotas realmente existentes na main

Em 31/08/2026 o router possui:

```text
/login

SOLICITANTE
/meus-pedidos
/pedidos/novo

GESTÃO / ADMIN
/pedidos
/estoque
/estoque/:id
/movimentacoes
/relatorios
/solicitacoes/novo
/solicitacoes/meus-pedidos

SISTEMA
/:pathMatch(.*)*
```

A rota catch-all renderiza:

```text
src/modules/system/views/NotFoundView.vue
```

Não documentar como implementadas rotas que ainda não existem, como `/dashboard` e `/cadastros/*`.

---

# 7. Página 404 — concluída

Implementada em 30/08/2026.

Asset:

```text
public/animations/folder-not-found.lottie
```

A tela utiliza título:

```text
Page Not Found
```

A 404 já não é pendência de robustez. Permanecem pendentes outros estados de erro, acessibilidade/motion e dashboard/alertas finais.

Importante:

```text
rota inexistente
→ 404 do router

recurso inexistente retornado pela API
→ estado contextual da tela
```

Não transformar automaticamente todo HTTP 404 em página de rota inexistente.

---

# 8. Pedidos

Experiências já implementadas:

```text
Solicitante
→ novo pedido
→ meus pedidos

Gestão
→ fila/listagem
→ análise
→ aprovação/rejeição
→ entrega/cancelamento conforme estado
```

Forma de retirada atual:

```text
UNITARIO
KIT
CAIXA
GARRAFA
GALAO
```

O frontend apresenta opções e feedback, mas o backend continua sendo autoridade para compatibilidade, saldo, FIFO/FEFO e transições de domínio.

Urgência já está integrada à experiência de pedidos.

---

# 9. Estoque e lotes

Concluído:

```text
visão geral de estoque
saldo consolidado
estoque mínimo
busca/filtros
status
abertura de detalhe
lista de lotes
entrada de lote
embalagem/multiplicador
Código SGL
detalhe/edição segura
fracionamento irreversível
descarte por vencimento
histórico de saídas/rastreabilidade
```

Regra visual/conceitual:

```text
Produto
→ unidade-base

Lote
→ apresentação física real
→ multiplicador
→ fracionamento
→ validade

Estoque
→ saldo consolidado na unidade-base
```

Código SGL atual do lote:

```text
LOT-<CODIGO_REFERENCIA_PRODUTO>-<SEQUENCIAL>
```

Documentos antigos que mostrem formatos experimentais diferentes não devem prevalecer.

---

# 10. Movimentações

Rota:

```text
/movimentacoes
```

A interface funciona como histórico operacional/auditoria.

Campos/contextos principais:

```text
Data
Produto
Tipo
Quantidade
Lote
Origem
Responsável
Saldo
Laboratório
Pedido
Solicitante
Observação
```

Cores semânticas aprovadas:

```text
ENTRADA   → azul
SAÍDA     → vermelho
DESCARTE  → amarelo
```

Pedidos entregues são consultados como recorte de Movimentações, não em relatório exclusivo.

---

# 11. Relatórios — concluídos

Rota:

```text
/relatorios
```

UX aprovada:

```text
escolher relatório
→ aplicar filtros
→ gerar prévia
→ exportar PDF ou XLSX
```

Relatórios atuais:

```text
Estagiários             ✅
Produtos                ✅
Movimentações           ✅
Resumo operacional      ✅
Estoque e lotes         ✅
Fiscalização            ✅
Resíduos                ⏳ reservado
```

Decisão:

```text
Pedidos entregues como relatório próprio → removido
```

A exportação é oficial no backend e reutiliza a mesma consulta da prévia.

A interface guarda a última consulta válida para que o arquivo corresponda ao resultado visualizado. Trocar/limpar o relatório invalida a exportação anterior.

---

# 12. Fiscalização

A classificação pertence ao Produto.

Campos esperados no futuro cadastro:

```text
Fiscalizado?              toggle
Órgãos fiscalizadores     seleção múltipla
Observação fiscalização   opcional
```

Órgãos iniciais:

```text
Polícia Federal
Vigilância Sanitária
ANVISA
Exército
Outro
```

Se Fiscalizado = Sim, ao menos um órgão deve ser informado.

Não inferir fiscalização por risco/perecibilidade.

---

# 13. Administração / Cadastros — próxima etapa oficial

Essa é a próxima grande etapa funcional.

Ordem:

```text
1. Produtos
2. Laboratórios
3. Projetos
4. Usuários
5. Estagiários
```

## Produtos

Começar por:

```text
/cadastros/produtos
```

O CRUD deve contemplar dados reais do contrato backend e incluir fiscalização desde criação/edição.

Não recriar uma segunda área operacional `/produtos`: a decisão atual consolidou Produto como cadastro em Administração, enquanto consulta operacional de saldo/lote continua em Estoque e a visão analítica fica em Relatórios.

## Estagiários

Cadastro obrigatório, com tratamento próprio para encerramento/inativação de vínculo; não tratar “encerrar estágio” como simples exclusão visual.

---

# 14. Unidade — decisão corporativa

**Não criar CRUD manual de Unidade no frontend.**

Decisão registrada em:

```text
docs/DECISAO_UNIDADES_CORPORATIVAS.md
```

Futuro:

```text
login/autenticação corporativa
→ recebe identificador institucional da Unidade
→ backend resolve ou cria de forma idempotente
→ associa usuário
→ frontend recebe sessão já resolvida
```

O backend ainda pode manter CRUD técnico de Unidade durante DEV/testes, mas não criar:

```text
/cadastros/unidades
```

como fluxo administrativo normal.

---

# 15. Resíduos — estado e dependência

Decisão de domínio:

```text
Produto ≠ Resíduo
```

Resíduo pode conter um ou vários produtos/reagentes sem alterar automaticamente o estoque desses produtos.

Fluxos planejados:

```text
Solicitante
→ Informar resíduo

Gestão
→ receber/fichar
→ analisar riscos
→ rotular/liberar
→ armazenar temporariamente
→ despachar/destinar
```

O frontend ainda não possui a integração operacional concluída.

O backend tem código em `feat/gestao-residuos`, mas a branch está divergente da `main` e precisa ser portada/reconciliada primeiro. Portanto, não criar interfaces assumindo que o contrato dessa branch antiga será mantido integralmente.

Sequência:

```text
reconciliar backend
→ validar Swagger do módulo
→ implementar frontend operacional
→ ativar relatório Resíduos
→ ativar PDF/XLSX Resíduos
```

---

# 16. Documentos/upload e rotulagem

Continuam pendentes porque o fluxo real de arquivos ainda precisa ser fechado no backend.

Não criar upload local/falso apenas para preencher a interface.

Contextos previstos:

```text
Pedido → documento da solicitação
Produto → ficha técnica/documentação geral
Lote → nota fiscal/certificado/laudo/documento de entrada
```

Rotulagem de Produto/Lote também permanece como necessidade posterior, sem voltar a transformar Produto em módulo operacional duplicado.

---

# 17. Dashboard, alertas e robustez

Ainda pendentes:

```text
Dashboard final
alertas operacionais consolidados
estoque baixo
lotes próximos do vencimento
lotes vencidos
pedidos pendentes/urgentes
estados de erro/retry mais robustos
acessibilidade e prefers-reduced-motion
refino responsivo final
```

Já concluído dentro desse bloco:

```text
404 customizada/animada ✅
```

---

# 18. Roadmap consolidado

Não criar novo roadmap. Estado atual:

```text
Etapa 0 — Handoff backend → frontend                    ✅
Etapa 1 — Fundação visual/técnica                       ✅
Etapa 2 — Bootstrap técnico                             ✅
Etapa 3 — Interfaces iniciais                           ✅
  Login                                                  ✅
  Pedidos Solicitante                                   ✅
  Pedidos Gestão                                        ✅
Etapa 4 — Estoque / Lotes                               ✅
Etapa 5 — Produto operacional                           ↪ consolidado em Estoque + Cadastro de Produtos
  Rotulagem                                              ⏳ complementar
Etapa 6 — Movimentações                                 ✅
Etapa 7 — Relatórios / Fiscalização                     ✅
  Exportação PDF/XLSX                                   ✅
  Documentos/upload                                     ⏳
  Resíduos em Relatórios                                ⏳
Etapa 8 — Administração / Cadastros                     🟡 PRÓXIMA
  Produtos                                               ⏳
  Laboratórios                                           ⏳
  Projetos                                               ⏳
  Usuários                                               ⏳
  Estagiários                                            ⏳
Etapa complementar — Resíduos operacional               ⏳ após reconciliação backend
Etapa 9 — Dashboard / alertas / robustez                ⏳
  404                                                    ✅
Etapa 10 — Autenticação / autorização / auditoria       ⏳
Pós-protótipo — refactor técnico para inglês            ⏳
```

---

# 19. Próximos passos exatos

```text
1. criar branch da Administração
2. implementar Cadastros → Produtos
3. incluir fiscalização no formulário
4. validar contrato real no Swagger
5. validar visualmente e funcionalmente
6. merge
7. seguir para Laboratórios
8. depois Projetos → Usuários → Estagiários
```

Depois:

```text
Resíduos
→ documentos/rotulagem
→ dashboard/robustez
→ autenticação/auditoria
→ integração corporativa
→ refactor inglês pós-protótipo
```

---

# 20. Guardrails para outra IA

Não fazer sem decisão explícita:

- não voltar para Pedidos/Estoque/Movimentações/Relatórios como se estivessem pendentes;
- não criar `/cadastros/unidades`;
- não criar `/produtos` duplicando Administração;
- não implementar FIFO/FEFO no Vue;
- não tratar login DEV como segurança real;
- não supor contrato atual de Resíduos a partir da branch antiga;
- não criar relatório próprio de pedidos entregues;
- não inferir fiscalização por risco;
- não renomear contratos públicos durante o futuro refactor interno;
- não alterar o roadmap sem registrar a nova decisão.

---

# 21. Checklist de retomada

```text
[ ] ler CONTINUIDADE.md
[ ] ler este dossiê
[ ] conferir src/router/index.ts
[ ] conferir commits recentes da main
[ ] conferir Swagger antes de implementar integração
[ ] identificar se a tarefa pertence à etapa 8 ou a um bloco complementar
[ ] criar branch própria
[ ] validar UI + integração
[ ] atualizar continuidade após merge
```

---

# 22. Resumo em uma frase

**O frontend já concluiu os fluxos operacionais de pedidos, estoque/lotes, movimentações, relatórios, fiscalização, exportações e 404; a próxima etapa é Administração/Cadastros começando por Produtos, enquanto Resíduos depende primeiro da reconciliação do backend e autenticação definitiva continua para o final do ciclo funcional.**
