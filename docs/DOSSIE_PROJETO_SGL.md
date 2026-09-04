# Dossiê do Projeto SGL — Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend:** `gbsalermo/Sistema-SGL`  
**Snapshot:** 04/09/2026  
**Estado:** primeiro protótipo funcional aprovado; ajustes de pré-produção em andamento.

Este documento resume o estado real do frontend para retomada humana ou por IA. O objetivo é evitar reconstrução de módulos já aprovados e impedir que roadmaps antigos sejam tratados como tarefa imediata.

---

# 1. Ordem de precedência

```text
1. código da main
2. Swagger/OpenAPI do backend para contratos HTTP
3. ../CONTINUIDADE.md
4. este DOSSIE_PROJETO_SGL.md
5. documentos específicos de decisão/módulo
6. documentos de etapas antigas e snapshots históricos
```

Fonte de rotas: `src/router/index.ts`.

---

# 2. Fase atual

O primeiro protótipo foi funcionalmente aprovado.

Antes do roadmap formal de produção, o projeto passa por um bloco de pré-produção:

```text
1. limpeza, revisão e atualização documental
2. levantamento dos ajustes de pré-produção
3. implementação/refinamento dos ajustes
4. validação e estabilização do bloco
```

Depois:

```text
matriz de permissões
→ congelamento funcional
→ homologação integrada final
→ autenticação/autorização/auditoria definitiva
→ integração corporativa
→ demais etapas formais de produção
```

A matriz de permissões permanece válida, mas não é a tarefa imediata enquanto a pré-produção atual estiver aberta.

---

# 3. Stack

```text
Vue 3.5
Vite 8
TypeScript 5.9
Vue Router 5
Pinia 4
Axios
Vuetify 3
Node >= 20.19
```

Diretrizes:

- interface em português;
- UUID público nas fronteiras com a API;
- Axios concentrado em `services`;
- Pinia para estado compartilhado;
- regras de negócio críticas permanecem no backend;
- eventual refactor técnico para inglês não altera a linguagem da interface.

---

# 4. Estado executivo

```text
Login visual / sessão DEV                         ✅
Expiração de sessão DEV                           ✅
Pedidos Solicitante/Gestão                        ✅
Estoque / lotes                                   ✅
Movimentações                                     ✅
Relatórios / fiscalização                         ✅
PDF/XLSX                                          ✅
Resíduos Solicitante/Gestão                       ✅
Rótulos Produto/Resíduo                           ✅
Estagiários                                       ✅
Pessoas por laboratório                           ✅
Administração/Cadastros                           ✅
Dashboard Gestão                                  ✅
Dashboard Solicitante                             ✅
Alertas operacionais                              ✅
Busca global                                      ✅
Tema claro/escuro + persistência                  ✅
404                                               ✅
Contexto de Unidade enviado à API                 ✅
Autenticação/autorização definitiva               ⏳
Integração corporativa                            ⏳
```

---

# 5. Perfis e experiências

Perfis atuais:

```text
ADMINISTRADOR
GESTOR
TECNICO
ANALISTA
PESQUISADOR
ESTAGIARIO
```

Agrupamento de navegação:

```text
GESTÃO
→ GESTOR + ADMINISTRADOR

ADMINISTRAÇÃO
→ ADMINISTRADOR

SOLICITANTE
→ TECNICO + ANALISTA + PESQUISADOR + ESTAGIARIO
```

Rota inicial:

```text
GESTOR / ADMINISTRADOR → /dashboard
TECNICO / ANALISTA / PESQUISADOR / ESTAGIARIO → /inicio
```

Guardas do router são controle de UX e navegação; não substituem autorização real no backend.

---

# 6. Rotas atuais

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
/solicitacoes/novo
/solicitacoes/meus-pedidos

RÓTULOS
/residuos/:id/rotulo
/produtos/:id/rotulo

SISTEMA
/:pathMatch(.*)*
```

---

# 7. Sessão DEV

Fluxo atual:

```text
identificador + senha preenchida
→ frontend consulta usuários existentes
→ resolve usuário ativo
→ senha ainda não é validada por autenticação definitiva
→ sessão é persistida em localStorage
→ expiração automática em 5 horas
```

A sessão possui dados como:

```text
id
nome
email
perfil
unidadeId
unidadeNome
unidadeSigla
laboratorioId
laboratorioNome
ativo
```

Essa sessão existe para desenvolvimento e validação funcional.

---

# 8. Multitenancy por Unidade

`src/services/http.ts` lê `unidadeId` da sessão e envia:

```text
X-SGL-Unidade-Id: <unidadeId>
```

O backend usa esse header para montar o `TenantContext` e restringir consultas/serviços à Unidade corrente.

Interpretação correta:

```text
isolamento funcional por Unidade              ✅
validação de cenários multitenant              ✅
fronteira definitiva de segurança              ❌
```

O cliente ainda controla o header. Na produção, Unidade/tenant deverá ser derivado de identidade autenticada confiável.

A interface exibe a sigla da Unidade no perfil da Gestão/Administração.

---

# 9. Pedidos

Solicitante:

```text
/pedidos/novo
/meus-pedidos
```

Gestão:

```text
/pedidos
```

Regras oficiais permanecem no backend:

```text
criação → não baixa estoque
aprovação → baixa estoque
entrega → não baixa novamente
cancelamento aprovado → restaura lotes utilizados
perecível → FEFO
não perecível → FIFO
urgência → não altera FIFO/FEFO
```

O frontend deve refletir estados e ações permitidas sem recriar a regra de estoque.

---

# 10. Estoque e Lotes

Rotas:

```text
/estoque
/estoque/:id
/estoque/lotes-vencendo
```

Cobertura:

- saldo consolidado e estoque mínimo;
- entrada de lote;
- validade;
- Código SGL;
- embalagem e multiplicador;
- fracionamento;
- descarte;
- rastreabilidade/histórico;
- filtros;
- integração com dashboard, busca e alertas.

Lote continua contextual a Estoque e não deve virar item principal separado sem nova decisão de produto.

---

# 11. Movimentações

```text
/movimentacoes
```

Funções:

```text
histórico
rastreabilidade
auditoria operacional
filtros
```

Pedidos entregues continuam sendo um recorte de Movimentações, não relatório independente.

---

# 12. Resíduos

Decisão:

```text
Produto != Resíduo
```

Rotas:

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

Composição pode referenciar Produto para rastreabilidade sem movimentar estoque automaticamente.

O Código SGL existe desde o registro inicial. QR Code não integra o rótulo visual atual.

Modelos de Resíduos pré-determinados permanecem ideia futura.

---

# 13. Estagiários

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
encerramento com data efetiva
indicadores de término/vencimento
```

Relatório complementar:

```text
/relatorios/pessoas-laboratorio
```

---

# 14. Administração / Cadastros

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
Resíduos — indicação futura/Em breve
```

Decisões:

- Unidade não possui CRUD manual normal;
- usuário não é criado manualmente pela central;
- Administração altera perfil de usuários existentes;
- Produto representa catálogo, não estoque;
- responsável de Laboratório deve pertencer à mesma Unidade;
- histórico relevante é preservado por ativação/inativação quando aplicável;
- `ESTAGIARIO` com vínculo ativo não deve perder o perfil antes do encerramento.

---

# 15. Relatórios

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

Prévia, PDF e XLSX devem usar a mesma consulta e os mesmos filtros.

---

# 16. Dashboard Gestão

```text
/dashboard
```

Indicadores operacionais atuais:

```text
pedidos pendentes
pedidos urgentes
estoque baixo
lotes vencidos
lotes vencendo em 7/30 dias
resíduos INFORMADO/EM_ANALISE
movimentações recentes
resumo por laboratório
```

Cards e alertas direcionam para o contexto operacional correspondente quando possível.

---

# 17. Dashboard Solicitante

```text
/inicio
```

Apresenta contexto útil ao solicitante sem expor controles de Gestão/Administração.

---

# 18. Shell, busca, alertas e tema

Integrado:

```text
Alertas operacionais            ✅
Busca global                    ✅
Tema claro/escuro               ✅
Persistência de preferência     ✅
Responsividade                  ✅
```

Decisão visual importante: o tema das interfaces autenticadas não deve modificar automaticamente a tela de login. A tela de login permanece independente salvo nova decisão explícita.

---

# 19. Segurança

```text
guardas de rota por perfil                    ✅ UX
sessão DEV                                     ✅ temporária
contexto de Unidade via header                 ✅ desenvolvimento
autenticação definitiva                        ⏳
autorização real no servidor                   ⏳
auditoria por identidade autenticada           ⏳
integração corporativa                          ⏳
```

Não tratar menu oculto, rota protegida no client ou Unidade em localStorage como mecanismo de segurança de produção.

---

# 20. Unidade corporativa

A decisão futura é que Unidade seja institucional, não um cadastro livre do usuário.

Fluxo esperado:

```text
login/integração corporativa
→ identidade institucional
→ Unidade resolvida de forma confiável
→ sessão/token recebe contexto institucional
→ frontend apenas consome o contexto
```

Detalhes: `DECISAO_UNIDADES_CORPORATIVAS.md`.

---

# 21. Documentos/upload

Upload/download real ainda depende de contrato backend definitivo.

Contextos potenciais:

```text
Pedido
Produto
Lote
```

Não inventar persistência documental apenas no frontend.

---

# 22. Roadmap formal posterior

Depois da pré-produção atual:

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

O documento `ROADMAP_INTERFACE_GESTAO.md` registra esse bloco posterior. O primeiro protótipo já foi aprovado e `FECHAMENTO_PRIMEIRO_PROTOTIPO.md` deve ser lido como registro de fechamento, não como gate atual.

---

# 23. Regra de retomada

```text
1. ler ../CONTINUIDADE.md
2. conferir a main
3. conferir src/router/index.ts
4. validar contratos no Swagger
5. consultar este dossiê
6. abrir o documento específico da área
7. distinguir decisão atual de histórico
```

**O SGL está funcionalmente aprovado e em pré-produção pós-aprovação. Não tratar afirmações antigas de “matriz de permissões = próximo passo” como estado atual; essa etapa pertence ao roadmap formal posterior.**
