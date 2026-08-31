# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 31/08/2026  
**Branch estável:** `main`  
**Fase atual:** fluxos operacionais principais concluídos; próxima etapa é Administração/Cadastros.  
**Últimos blocos integrados:** Relatórios/Fiscalização/PDF-XLSX e página 404 animada.  
**Próximo passo exato:** `Administração → Cadastros → Produtos`, incluindo fiscalização na criação/edição.  
**Handoff completo:** `docs/DOSSIE_PROJETO_SGL.md`

Este arquivo é a fonte principal de retomada do frontend. Se algum documento antigo disser que Pedidos, Estoque, Movimentações, Relatórios ou 404 ainda são a “próxima etapa”, considerar esse texto histórico.

---

# 0. Como continuar

```text
1. ler CONTINUIDADE.md
2. ler docs/DOSSIE_PROJETO_SGL.md
3. conferir src/router/index.ts para rotas reais
4. usar Swagger/OpenAPI como fonte de verdade HTTP
5. conferir decisão específica do módulo
6. criar branch própria
7. implementar um bloco funcional
8. validar visual e integração
9. merge
10. atualizar documentação afetada
```

Não duplicar regra de negócio do backend e não reorganizar o roadmap sem registrar uma nova decisão.

---

# 1. Stack oficial

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

Regras técnicas:

- UUID público nas fronteiras;
- Axios concentrado em services;
- Store apenas para estado realmente compartilhado/global;
- Administração reutiliza a experiência da Gestão;
- não duplicar FIFO/FEFO nem regras de estoque no frontend;
- não reescrever dados históricos de lote/apresentação;
- código técnico poderá ser traduzido para inglês no pós-protótipo, mas a interface permanece em português.

---

# 2. Estado geral em 31/08/2026

```text
Login visual                                      ✅
Sessão de desenvolvimento                         ✅
Pedidos do Solicitante                            ✅
Forma de retirada por embalagem                   ✅
Pedidos Gestão                                    ✅
Urgência de pedido                                ✅
Lotes utilizados em pedido entregue               ✅
Shell Gestão/Admin                                ✅
Perfil/configurações da sessão DEV                ✅
Estoque — visão geral                             ✅
Estoque — detalhe                                 ✅
Lotes — entrada                                   ✅
Lotes — Código SGL                                ✅
Lotes — embalagem/multiplicador                   ✅
Lotes — detalhe/edição                            ✅
Lotes — histórico de saídas                      ✅
Lotes — fracionamento irreversível                ✅
Lotes — FIFO/FEFO                                 ✅ integração backend
Lotes — descarte por vencimento                   ✅
Lotes — busca/filtros/status                      ✅
Movimentações                                     ✅
Relatórios — central                              ✅
Relatório de Estagiários                          ✅
Relatório de Produtos                             ✅
Relatório de Movimentações                        ✅
Resumo Operacional                                ✅
Relatório de Estoque e Lotes                      ✅
Relatório de Fiscalização                         ✅
Exportação PDF                                    ✅
Exportação XLSX                                   ✅
Página 404 animada                                ✅
Administração / Cadastros                         ⏳ PRÓXIMA ETAPA
Resíduos operacional                              ⏳ depende de reconciliação backend
Resíduos relatório/exportação                     ⏳
Documentos / upload real                          ⏳
Rotulagem complementar                            ⏳
Dashboard final / alertas / robustez              ⏳
Autenticação/autorização/auditoria definitiva     ⏳
Integração corporativa                            ⏳
Refactor técnico para inglês                      ⏳ pós-protótipo
```

---

# 3. Login — interpretação correta

A interface de login está pronta, mas o fluxo é temporário de desenvolvimento.

Hoje:

```text
LoginAccessForm
→ session.entrarDesenvolvimento(...)
→ GET /v1/usuarios
→ localiza usuário ativo
→ senha é exigida na UI, mas NÃO validada no backend
→ sessão salva em localStorage
```

Chave:

```text
sgl.dev-session
```

Portanto:

```text
login visual                         ✅
sessão DEV                           ✅
autenticação real                    ⏳
autorização real                     ⏳
auditoria por sessão autenticada     ⏳
SSO/API corporativa                  ⏳
```

Não tratar a sessão DEV como segurança definitiva.

---

# 4. Rotas atuais reais

Conferidas em `src/router/index.ts` em 31/08/2026:

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
/:pathMatch(.*)* → NotFoundView
```

Ainda não existem no router:

```text
/dashboard
/cadastros/produtos
/cadastros/laboratorios
/cadastros/projetos
/cadastros/usuarios
/cadastros/estagiarios
/residuos
/informar-residuo
```

Essas rotas futuras só devem ser adicionadas na respectiva etapa.

---

# 5. Página 404 — concluída

Implementada em 30/08/2026.

```text
/:pathMatch(.*)*
→ src/modules/system/views/NotFoundView.vue
```

Asset:

```text
public/animations/folder-not-found.lottie
```

Título atual:

```text
Page Not Found
```

A 404 não é mais pendência. Ainda permanecem robustez de erros remotos, retry, acessibilidade/motion e dashboard/alertas finais.

HTTP 404 de um recurso da API deve virar estado contextual da tela; não redirecionar automaticamente todo 404 para a página de rota inexistente.

---

# 6. Pedidos ↔ Estoque/Lotes — consolidado

Forma de retirada:

```text
UNITARIO
KIT
CAIXA
GARRAFA
GALAO
```

Compatibilidade e FIFO/FEFO são validados pelo backend.

Fluxo:

```text
solicitante escolhe opção disponível
→ backend valida
→ gestão aprova
→ backend seleciona lotes por FIFO/FEFO
→ movimentações registram lotes usados
→ pedido entregue pode exibir rastreabilidade
→ lote pode exibir histórico de saídas
```

Entrega não significa nova baixa de estoque.

---

# 7. Estoque e Lotes — concluído

Principais entregas:

```text
saldo consolidado em unidade-base
entrada com embalagem/multiplicador
Código SGL automático
modal/detalhe do lote
edição segura
fracionamento false → true sem retorno
FIFO/FEFO
bloqueio/descartar vencidos
busca/filtros/status
histórico de saída por lote
rastreabilidade pedido/solicitante
```

Código SGL vigente:

```text
LOT-<CODIGO_REFERENCIA_PRODUTO>-<SEQUENCIAL>
```

Documentos antigos com formatos experimentais diferentes são históricos.

---

# 8. Movimentações — concluído

Rota:

```text
/movimentacoes
```

Foco:

```text
histórico operacional
auditoria
produto/lote
origem
responsável
pedido/solicitante
laboratório
saldo
```

Cores semânticas aprovadas:

```text
ENTRADA   → azul
SAÍDA     → vermelho
DESCARTE  → amarelo
```

Pedidos entregues não possuem relatório exclusivo; usar Movimentações com recorte de origem `PEDIDO` e tipo `SAIDA` quando aplicável.

---

# 9. Central de Relatórios — concluída

Rota:

```text
/relatorios
```

UX:

```text
escolher relatório
→ filtros específicos
→ prévia
→ PDF ou XLSX
```

Relatórios:

```text
Estagiários             ✅
Produtos                ✅
Movimentações           ✅
Resumo operacional      ✅
Estoque e lotes         ✅
Fiscalização            ✅
Resíduos                ⏳ reservado
```

Exportação usa a última prévia concluída. Alterar/limpar o contexto invalida a exportação até nova consulta.

Ciclo de exportação foi integrado em 28/08/2026 pelo PR #14 do frontend e PR #9 do backend.

---

# 10. Produtos e Fiscalização

Decisão atual:

```text
Gestão operacional
→ Estoque
→ Lotes
→ Movimentações
→ Relatórios

Administração
→ Cadastros
   └── Produtos
```

Não criar módulo operacional duplicado `/produtos`.

No cadastro de Produto incluir:

```text
fiscalizado
orgaosFiscalizadores
observacaoFiscalizacao
```

Órgãos iniciais:

```text
Polícia Federal
Vigilância Sanitária
ANVISA
Exército
Outro
```

Se fiscalizado, ao menos um órgão é obrigatório.

Não inferir fiscalização por risco ou perecibilidade.

---

# 11. Unidade institucional — decisão vigente

`Unidade` não terá CRUD manual no frontend.

Documento:

```text
docs/DECISAO_UNIDADES_CORPORATIVAS.md
```

Portanto, não criar:

```text
/cadastros/unidades
```

A unidade virá futuramente da API corporativa e será resolvida/sincronizada pelo backend no fluxo de autenticação.

O CRUD técnico existente no backend pode permanecer para DEV/testes até essa integração.

---

# 12. Administração / Cadastros — PRÓXIMA ETAPA

Ordem oficial:

```text
1. Produtos
2. Laboratórios
3. Projetos
4. Usuários
5. Estagiários
```

Rotas previstas:

```text
/cadastros/produtos
/cadastros/laboratorios
/cadastros/projetos
/cadastros/usuarios
/cadastros/estagiarios
```

## Produtos

Primeiro bloco a implementar.

Usar o Swagger para definir o formulário real. A criação/edição deve incluir fiscalização.

## Estagiários

Cadastro obrigatório. `Encerrar estágio` deve ser ação própria do domínio, distinta de exclusão genérica.

## Tipos de unidade/embalagem

Não criar cadastro fictício. Só entra quando o backend possuir domínio configurável para isso.

---

# 13. Resíduos — estado real

Há dois fluxos conceituais:

```text
Solicitante → Informar resíduo
Gestão → Resíduos
```

Não renomear a área da Gestão para “Informar resíduos”.

Decisão:

```text
Produto = catálogo/estoque
Resíduo = material gerado pelo laboratório
```

Um resíduo pode citar produtos/reagentes sem afetar automaticamente seus saldos.

Backend:

```text
feat/gestao-residuos
```

Em 31/08/2026 a branch está divergente da `main` e não deve ser tratada como contrato pronto. O backend deve primeiro portar/reconciliar a modelagem e publicar o contrato atual no Swagger.

Depois:

```text
frontend operacional
→ relatório Resíduos
→ PDF/XLSX Resíduos
```

---

# 14. Documentos e Rotulagem

Continuam pendentes.

Não existe ainda contrato definitivo para upload/download de documentos. O frontend não deve simular persistência local como solução final.

Contextos previstos:

```text
Pedido → documentos da solicitação
Produto → ficha técnica
Lote → nota fiscal/certificado/laudo/documento de entrada
```

Rotulagem permanece complementar para Produto/Lote, sem reintroduzir uma área operacional duplicada de Produto.

---

# 15. Dashboard / alertas / robustez

Ainda previstos:

```text
Dashboard final
estoque baixo
lotes próximos do vencimento
lotes vencidos
pedidos pendentes/urgentes
estados loading/empty/error/retry consistentes
acessibilidade
prefers-reduced-motion
refino responsivo final
```

Já concluído neste tema:

```text
404 customizada ✅
```

---

# 16. Roadmap oficial consolidado

```text
Etapa 0 — Handoff backend → frontend                       ✅
Etapa 1 — Fundação visual/técnica                          ✅
Etapa 2 — Bootstrap técnico                                ✅
Etapa 3 — Interfaces iniciais                              ✅
  Login                                                     ✅
  Pedidos Solicitante                                      ✅
  Pedidos Gestão                                           ✅
Etapa 4 — Estoque / Lotes                                  ✅
Etapa 5 — Produtos operacional                             ↪ consolidado em Estoque + Cadastro
  Rotulagem                                                 ⏳
Etapa 6 — Movimentações                                    ✅
Etapa 7 — Relatórios / Fiscalização                        ✅
  PDF/XLSX                                                  ✅
  Documentos                                                ⏳
  Resíduos em Relatórios                                    ⏳
Etapa 8 — Administração / Cadastros                        🟡 PRÓXIMA
  Produtos                                                  ⏳
  Laboratórios                                              ⏳
  Projetos                                                  ⏳
  Usuários                                                  ⏳
  Estagiários                                               ⏳
Etapa complementar — Resíduos operacional                  ⏳ após reconciliação backend
Etapa 9 — Dashboard / alertas / robustez                   ⏳
  404                                                       ✅
Etapa 10 — Autenticação / autorização / auditoria          ⏳
Pós-protótipo — padronização técnica em inglês             ⏳
```

---

# 17. Próximo passo exato

```text
Administração → Cadastros → Produtos
```

Passos:

```text
1. criar branch própria
2. conferir Product/Produto no Swagger
3. definir types/service da feature
4. criar listagem/busca
5. criar Novo/Editar
6. incluir Fiscalização
7. tratar loading/empty/error/success
8. validar integração
9. validar visualmente
10. merge e atualizar continuidade
```

Só depois seguir:

```text
Laboratórios → Projetos → Usuários → Estagiários
```

---

# 18. Pós-protótipo — código em inglês

Registrado no backend em:

```text
docs/PENDENCIAS_POS_PROTOTIPO.md
```

O refactor deverá atingir nomes técnicos de classes/métodos e também types/services/composables/stores quando aplicável.

Não executar junto com Administração, Resíduos ou autenticação. Preservar contratos externos até existir migração coordenada.

---

# 19. Documentos de referência

Começar por:

- `docs/DOSSIE_PROJETO_SGL.md`
- `docs/README.md`
- `docs/ROADMAP_INTERFACE_GESTAO.md`
- `docs/INVENTARIO_TELAS.md`
- `docs/FLUXOS_NAVEGACAO.md`
- `docs/DECISAO_UNIDADES_CORPORATIVAS.md`
- `docs/IDENTIDADE_VISUAL.md`
- `docs/PADROES_PAGINA.md`

Arquivos de etapas anteriores devem ser lidos como histórico, não como checkpoint atual.

---

# 20. Regra central

**O frontend simplifica a operação; o backend continua responsável por integridade, FIFO/FEFO, concorrência, rastreabilidade, fiscalização, relatórios e geração oficial de arquivos. A próxima implementação é Administração/Cadastros, começando por Produtos.**
