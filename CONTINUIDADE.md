# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 04/09/2026  
**Branch estável:** `main`  
**Fase atual:** ajustes de pré-produção pós-aprovação funcional.  
**Bloco atual:** planejamento consolidado → execução sequencial das etapas de pré-produção.  
**Etapa atual:** Etapa 1 — padronização e refinamento visual global.  
**Plano oficial da pré-produção:** `gbsalermo/Sistema-SGL/docs/PLANO_PRE_PRODUCAO.md`  
**Roadmap formal posterior:** matriz de permissões → congelamento → homologação final → segurança/integração corporativa.  
**Handoff:** `docs/DOSSIE_PROJETO_SGL.md`

Este é o checkpoint principal para retomada. O fluxo detalhado da pré-produção é canônico no backend em `docs/PLANO_PRE_PRODUCAO.md`. Rotas reais: `src/router/index.ts`. Contratos HTTP: Swagger/OpenAPI do backend.

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

Não reconstruir módulos aprovados sem necessidade concreta. Mudanças de pré-produção devem preservar o comportamento funcional já aprovado, salvo decisão explícita em contrário.

**Regra especial deste bloco:** alterações funcionais de backend serão implementadas manualmente pelo responsável do projeto. O apoio de IA pode analisar o backend, definir modelagem/contratos, orientar a implementação e revisar o resultado, mas não deve aplicar diretamente código funcional de backend sem nova autorização explícita.

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
Resíduos — Solicitante                               ✅
Resíduos — Gestão                                    ✅
Rótulo de Resíduo                                    ✅ base atual; refinamento planejado
Rótulo de Produto                                    ✅
Estagiários                                          ✅ base atual; evolução planejada
Pessoas por laboratório                              ✅
Administração / Cadastros                            ✅ base atual; expansão planejada
Dashboard Gestão                                     ✅
Dashboard Solicitante                                ✅
Alertas operacionais                                 ✅
Busca global                                         ✅
Tema claro/escuro + persistência                     ✅ base atual; refinamento planejado
404                                                   ✅
Contexto de Unidade enviado à API                    ✅
Matriz formal de permissões                          ⏳ após pré-produção atual
Congelamento funcional                               ⏳ posterior
Homologação final                                    ⏳ posterior
Autenticação/autorização definitiva                  ⏳ posterior
Integração corporativa                               ⏳ posterior
```

O produto foi aprovado funcionalmente. A fase atual é de pré-produção e refinamento, não de fechamento do primeiro protótipo.

---

# 3. Ordem de precedência

```text
1. código da main
2. Swagger/OpenAPI do backend
3. CONTINUIDADE.md do repositório em trabalho
4. plano canônico de pré-produção do backend durante o bloco atual
5. docs/DOSSIE_PROJETO_SGL.md
6. decisões e documentos específicos
7. documentos de etapas antigas e snapshots
```

Documentos históricos que ainda usem expressões como “próxima etapa” não prevalecem sobre este arquivo nem sobre o plano canônico atual.

---

# 4. Rotas atuais

Fonte: `src/router/index.ts`.

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
/administracao/cadastros     ADMINISTRADOR
/solicitacoes/novo
/solicitacoes/meus-pedidos

RÓTULOS
/residuos/:id/rotulo
/produtos/:id/rotulo

SISTEMA
/:pathMatch(.*)*
```

Rota inicial:

```text
GESTOR / ADMINISTRADOR → /dashboard
TECNICO / ANALISTA / PESQUISADOR / ESTAGIARIO → /inicio
```

Novas rotas que vierem das etapas de pré-produção devem ser definidas somente no momento da respectiva implementação e registradas aqui depois de integradas à `main`.

---

# 5. Sessão DEV, perfis e Unidade

Perfis atuais:

```text
ADMINISTRADOR
GESTOR
TECNICO
ANALISTA
PESQUISADOR
ESTAGIARIO
```

Grupos de navegação:

```text
Gestão: GESTOR + ADMINISTRADOR
Admin:  ADMINISTRADOR
Solicitante: TECNICO + ANALISTA + PESQUISADOR + ESTAGIARIO
```

Sessão DEV:

```text
frontend consulta usuário existente
→ senha ainda não é validada por autenticação definitiva
→ sessão local
→ expiração em 5h
```

Dados institucionais relevantes na sessão:

```text
unidadeId
unidadeNome
unidadeSigla
laboratorioId
laboratorioNome
```

O interceptor HTTP usa `unidadeId` para enviar:

```text
X-SGL-Unidade-Id: <unidadeId>
```

O backend usa esse contexto para restringir dados por Unidade.

Interpretação correta:

```text
contexto multitenant funcional                  ✅
separação de dados por Unidade                  ✅ desenvolvimento
segurança definitiva baseada em identidade      ❌ ainda não
```

Como o header é controlado pelo cliente, a futura autenticação corporativa deverá fornecer tenant/Unidade de forma confiável.

---

# 6. Pedidos

Solicitante:

```text
/pedidos/novo
/meus-pedidos
```

Gestão:

```text
/pedidos
```

Regras permanecem no backend:

```text
criação → não baixa
aprovação → baixa
entrega → sem segunda baixa
cancelamento aprovado → restaura lotes utilizados
perecível → FEFO
não perecível → FIFO
```

Urgência está integrada e não altera FIFO/FEFO.

A Etapa 7 da pré-produção introduzirá Soluções em Pedidos somente depois da normalização de unidades e da criação do domínio de Soluções. Um Pedido deverá poder conter Produto, Solução ou ambos.

---

# 7. Estoque e Lotes

```text
/estoque
/estoque/:id
/estoque/lotes-vencendo
```

Cobertura atual:

```text
saldo/mínimo
entrada de lote
Código SGL
validade
embalagem
multiplicador
fracionamento
edição segura
descarte
histórico/rastreabilidade
filtros
integração com dashboard/alertas/busca
```

Lote continua contextual a Estoque; não criar item principal independente na sidebar sem nova decisão.

A Etapa 7 revisará a representação de unidades de medida e apresentações físicas antes das Soluções. Até lá, preservar o comportamento atual.

---

# 8. Movimentações

```text
/movimentacoes
```

Função:

```text
histórico
rastreabilidade
auditoria operacional
filtros
```

Pedidos entregues são recorte de Movimentações; não criar relatório dedicado sem nova decisão de produto.

---

# 9. Resíduos

```text
Solicitante
/residuos/novo
/meus-residuos

Gestão
/residuos

Rótulo
/residuos/:id/rotulo

Relatório
/relatorios/residuos
```

Fluxo atual:

```text
INFORMADO
→ EM_ANALISE
→ LIBERADO_PARA_ARMAZENAMENTO
→ ARMAZENADO_TEMPORARIAMENTE
→ DESPACHADO
```

Decisão:

```text
Produto != Resíduo
```

Componente de Resíduo pode referenciar Produto para rastreabilidade sem alterar estoque automaticamente.

O Código SGL existe desde o registro inicial. QR Code não integra o rótulo visual atual.

Pré-produção planejada:

- Etapa 3: remover a sequência visual redundante de pendências/análise, refinar o rótulo e separar geração/visualização da permissão de impressão;
- Etapa 4: cadastrar locais de armazenamento e liberar modelos de Resíduos padrão pela Gestão;
- o Solicitante poderá escolher entre um Resíduo pré-cadastrado e preenchimento manual;
- um modelo é reutilizável, enquanto cada `Residuo` continua sendo uma ocorrência operacional independente.

Alterar um modelo posteriormente não deve alterar ocorrências históricas já criadas a partir dele.

---

# 10. Estagiários e Projetos

Rota atual de Estagiários:

```text
/estagiarios
```

Cobertura atual:

```text
listagem
cadastro
edição
Unidade/Laboratório
período
tipo de vínculo
encerramento
auditoria visual
```

Relatório atual:

```text
/relatorios/pessoas-laboratorio
```

Com responsável, pessoas vinculadas, perfil, situação e dados de estágio, além de PDF/XLSX.

A Etapa 5 reestruturará Projetos e o vínculo Projeto–Estagiário. O projeto passará a ter código/número obrigatório, ciclo de vida e vínculos de pessoas. O vínculo de Estagiário com Projeto deverá preservar atividade exercida, período, status, encerramento e renovação, permitindo histórico e múltiplos projetos ao longo do tempo.

A ação atual de encerramento do Estagiário também será revista para distinguir inativação temporária, inativação sem previsão e encerramento definitivo, sempre com motivo detalhado.

---

# 11. Administração / Cadastros

```text
/administracao/cadastros
```

Exclusivo de `ADMINISTRADOR`.

Áreas atuais:

```text
Laboratórios
Projetos
Produtos
Permissões
Resíduos — Em breve na implementação atual
```

Regras consolidadas:

- Unidade é referência institucional; sem CRUD manual normal;
- usuário não é criado manualmente na central;
- Permissões altera perfil de usuário existente;
- Produto é catálogo-base;
- Estoque/lotes não são duplicados em Cadastros;
- responsável de Laboratório deve pertencer à mesma Unidade;
- projetos/cadastros usam ativação/inativação quando a preservação histórica importa;
- auto-rebaixamento do Administrador da sessão é bloqueado na interface;
- `ESTAGIARIO` com estágio ativo não deve perder o perfil antes do encerramento.

Expansões já planejadas no plano de pré-produção:

```text
Etapa 4 → Locais de armazenamento + modelos de Resíduos
Etapa 5 → Projetos com código, status/ciclo e vínculos
Etapa 7 → Soluções padrão
```

Portanto, “Resíduos — Em breve” descreve apenas a interface atual, não uma ideia indefinida/futura.

---

# 12. Relatórios

Central:

```text
/relatorios
```

Cobertura atual:

```text
Estagiários
Produtos
Movimentações
Resumo operacional
Estoque e lotes
Fiscalização
Resíduos
Pessoas por laboratório
```

Exportações PDF/XLSX devem usar os mesmos filtros da prévia.

A Etapa 6 avaliará uma visão consolidada de Laboratórios e Projetos depois que o novo domínio de Projetos/Estagiários estiver estabilizado.

---

# 13. Dashboard Gestão

```text
/dashboard
```

Dados usados:

```text
pedidos
estoques baixos
resíduos
movimentações
lotes
laboratórios
usuários
```

KPIs/atenções:

```text
pedidos pendentes
pedidos urgentes
estoque baixo
lotes vencidos
lotes vencendo em 7/30 dias
resíduos INFORMADO ou EM_ANALISE
movimentações recentes
resumo por laboratório
```

Os itens relevantes navegam para a tela operacional correspondente com contexto/filtro quando possível.

---

# 14. Dashboard Solicitante

```text
/inicio
```

É a rota inicial dos perfis solicitantes e não deve expor controles de Gestão/Administração.

A Etapa 8 adicionará a seção Manual do Usuário inicialmente nesta experiência de Solicitante, após definição do contrato de documentos necessário.

---

# 15. Shell, busca, alertas e aparência

Estado atual:

```text
Aparência claro/escuro           ✅ base funcional
persistência do tema             ✅
Alertas operacionais             ✅
Busca global                     ✅
responsividade                   ✅
```

A aparência atual não é considerada visualmente final. O início da pré-produção será:

```text
Etapa 1 → padronização/refinamento de cards, ícones, botões, setas, filtros e alinhamentos
Etapa 2 → Dark Mode definitivo a partir de esboço, paleta, comportamento e testes
```

A tela de login não deve herdar mudanças visuais do tema das interfaces autenticadas sem uma decisão explícita.

---

# 16. Segurança — interpretação correta

```text
guardas de rota                                ✅ UX
sessão DEV                                     ✅ temporária
contexto de Unidade via header                 ✅ desenvolvimento
autenticação definitiva                        ⏳
autorização real no backend                    ⏳
auditoria por identidade autenticada           ⏳
integração corporativa                          ⏳
```

Menus e rotas por perfil não equivalem a segurança de produção.

---

# 17. Documentos / Manual do Usuário

A Etapa 8 prevê uma seção **Manual do Usuário**, inicialmente para perfis Solicitantes, para disponibilizar materiais como:

```text
como usar o SGL
padrões de Soluções
regras da Embrapa
segurança em laboratório
manuseio de produtos
outros procedimentos institucionais
```

Não inventar persistência real de arquivos apenas no frontend. Antes de criar upload/download definitivo, definir o contrato backend e a estratégia de armazenamento. A decisão deve evitar binários grandes diretamente no PostgreSQL sem justificativa técnica.

---

# 18. Fase atual — pré-produção pós-aprovação

O planejamento foi consolidado no documento canônico `gbsalermo/Sistema-SGL/docs/PLANO_PRE_PRODUCAO.md`.

Situação:

```text
limpeza/revisão documental                            ✅ concluída
planejamento dos ajustes                              ✅ consolidado
Etapa 1 — refinamento visual global                   ⏭ ATUAL / próxima implementação
Etapa 2 — Dark Mode definitivo                        ⏳
Etapa 3 — refinamentos do fluxo atual de Resíduos     ⏳
Etapa 4 — expansão operacional de Resíduos            ⏳
Etapa 5 — Projetos + vínculos de Estagiários          ⏳
Etapa 6 — relatórios de Projetos/Laboratórios         ⏳
Etapa 7 — unidades + Soluções + Pedidos               ⏳
Etapa 8 — Manual do Usuário + decisão delete lógico  ⏳
```

Dependências centrais:

```text
padrão visual → Dark Mode
Resíduos atuais → expansão/modelos de Resíduos
Projetos/Estagiários → relatório de Projetos
unidades → Soluções → Pedidos com Soluções
```

---

# 19. Roadmap formal posterior

Depois do bloco atual:

```text
1. matriz/diretrizes de permissões
2. congelamento funcional
3. homologação integrada final
4. correção de falhas encontradas
5. autenticação + autorização + auditoria definitiva
6. integração corporativa / tenant confiável
7. demais contratos/documentos de produção necessários
8. refactors técnicos planejados
```

Esse roadmap continua válido, mas não representa a tarefa imediata atual.

---

# 20. Documentação para leitura

```text
CONTINUIDADE.md
Backend: docs/PLANO_PRE_PRODUCAO.md   ← plano atual canônico
docs/DOSSIE_PROJETO_SGL.md
docs/README.md
docs/INVENTARIO_TELAS.md
docs/FLUXOS_NAVEGACAO.md
docs/ROADMAP_INTERFACE_GESTAO.md
docs/FECHAMENTO_PRIMEIRO_PROTOTIPO.md
docs/ETAPA_CADASTROS_ADMIN.md
docs/ETAPA_ESTAGIARIOS.md
docs/DECISAO_UNIDADES_CORPORATIVAS.md
```

---

# 21. Regra final de retomada

**O SGL está funcionalmente aprovado. A fase atual é a execução do plano de pré-produção registrado no backend em `docs/PLANO_PRE_PRODUCAO.md`, começando pela Etapa 1 — padronização/refinamento visual. Não tratar a matriz de permissões como tarefa imediata até o encerramento desse bloco. Conferir `main`, router e Swagger antes de confiar em documentos históricos, e lembrar que alterações funcionais de backend serão implementadas manualmente pelo responsável do projeto.**
