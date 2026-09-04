# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 04/09/2026  
**Branch estável:** `main`  
**Fase atual:** ajustes de pré-produção pós-aprovação funcional.  
**Bloco atual:** limpeza documental → planejamento dos ajustes → refinamentos.  
**Roadmap formal posterior:** matriz de permissões → congelamento → homologação final → segurança/integração corporativa.  
**Handoff:** `docs/DOSSIE_PROJETO_SGL.md`

Este é o checkpoint principal para retomada. Rotas reais: `src/router/index.ts`. Contratos HTTP: Swagger/OpenAPI do backend.

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
Rótulo de Resíduo                                    ✅
Rótulo de Produto                                    ✅
Estagiários                                          ✅
Pessoas por laboratório                              ✅
Administração / Cadastros                            ✅
Dashboard Gestão                                     ✅
Dashboard Solicitante                                ✅
Alertas operacionais                                 ✅
Busca global                                         ✅
Tema claro/escuro + persistência                     ✅
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
4. docs/DOSSIE_PROJETO_SGL.md
5. decisões e documentos específicos
6. documentos de etapas antigas e snapshots
```

Documentos históricos que ainda usem expressões como “próxima etapa” não prevalecem sobre este arquivo.

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

---

# 7. Estoque e Lotes

```text
/estoque
/estoque/:id
/estoque/lotes-vencendo
```

Cobertura:

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

Lote continua contextual a Estoque; não criar item principal independente na sidebar.

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

Fluxo:

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

Modelos de Resíduos pré-determinados permanecem opção futura.

---

# 10. Estagiários

```text
/estagiarios
```

Cobertura:

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

Relatório:

```text
/relatorios/pessoas-laboratorio
```

Com responsável, pessoas vinculadas, perfil, situação e dados de estágio, além de PDF/XLSX.

---

# 11. Administração / Cadastros

```text
/administracao/cadastros
```

Exclusivo de `ADMINISTRADOR`.

Áreas:

```text
Laboratórios
Projetos
Produtos
Permissões
Resíduos — Em breve
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

---

# 12. Relatórios

Central:

```text
/relatorios
```

Cobertura:

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

---

# 15. Shell, busca, alertas e aparência

Concluído e integrado:

```text
Aparência claro/escuro           ✅
persistência do tema             ✅
Alertas operacionais             ✅
Busca global                     ✅
responsividade                   ✅
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

# 17. Documentos/upload

Persistência real de documentos ainda não deve ser inventada no frontend.

Contextos potenciais:

```text
Pedido
Produto
Lote
```

Aguardar contrato backend real antes de criar upload/download definitivo.

---

# 18. Fase atual — pré-produção pós-aprovação

Sequência:

```text
1. limpeza, revisão e atualização documental          ← ATUAL
2. levantamento dos ajustes de pré-produção
3. execução/refinamento
4. validação e estabilização do bloco
```

Durante essa fase podem entrar melhorias justificadas sem confundi-las com a etapa formal de segurança/produção.

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
7. documentos/upload quando houver contrato
8. refactors técnicos planejados
```

Esse roadmap continua válido, mas não representa a tarefa imediata atual.

---

# 20. Documentação para leitura

```text
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

**O SGL está funcionalmente aprovado. A fase atual é pré-produção pós-aprovação. Não tratar a matriz de permissões como tarefa imediata até o encerramento do bloco atual. Conferir `main`, router e Swagger antes de confiar em qualquer documento histórico.**
