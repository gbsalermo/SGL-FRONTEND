# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 03/09/2026  
**Branch estável:** `main`  
**Fase atual:** fechamento do primeiro protótipo.  
**Próximo passo oficial:** consolidar diretrizes/matriz de permissões → congelar protótipo → homologação completa.  
**Handoff:** `docs/DOSSIE_PROJETO_SGL.md`

Este é o checkpoint principal para retomada. Rotas reais: `src/router/index.ts`. Contratos HTTP: Swagger/OpenAPI do backend.

---

# 1. Regra de trabalho

```text
branch própria
→ implementar
→ validar
→ refinar
→ PR
→ main
→ atualizar documentação
```

Não criar roadmap alternativo nem reabrir etapas já concluídas sem necessidade concreta.

---

# 2. Estado geral em 03/09/2026

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
404 animada                                          ✅
Diretrizes/matriz final de permissões                ⏳ PRÓXIMO
Congelamento do protótipo                            ⏳
Homologação completa                                 ⏳
Autenticação/autorização definitiva                  ⏳ posterior
Integração corporativa                               ⏳ posterior
```

A antiga indicação “Administração/Cadastros é a próxima etapa” está superada.

---

# 3. Rotas atuais

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

# 4. Sessão DEV e permissões atuais

Perfis conhecidos:

```text
ADMINISTRADOR
GESTOR
TECNICO
ANALISTA
PESQUISADOR
ESTAGIARIO
```

Grupos do router:

```text
Gestão: GESTOR + ADMINISTRADOR
Admin:  ADMINISTRADOR
Solicitante: TECNICO + ANALISTA + PESQUISADOR + ESTAGIARIO
```

A rota `/administracao/cadastros` usa a permissão mais específica e não herda acesso de Gestor apenas por estar dentro do `GestaoLayout`.

O login atual continua DEV:

```text
frontend consulta usuário existente
→ senha não é validada por autenticação backend definitiva
→ sessão local
→ expiração em 5h
```

Guardas e menus por perfil são úteis para UX, mas não são segurança final. O próximo bloco deve consolidar **o que cada perfil pode ver/fazer** antes do congelamento.

---

# 5. Pedidos

## Solicitante

```text
/pedidos/novo
/meus-pedidos
```

## Gestão

```text
/pedidos
```

Regras de negócio permanecem no backend:

```text
aprovação → baixa
entrega → sem segunda baixa
cancelamento aprovado → restaura lotes exatos
perecível → FEFO
não perecível → FIFO
```

Urgência está integrada e o Dashboard/alertas conseguem abrir pedidos pendentes/urgentes já filtrados.

---

# 6. Estoque e Lotes

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
filtros de situação
filtro de embalagem
integração com dashboard/alertas/busca
```

A visão `/estoque/lotes-vencendo` reúne lotes próximos do vencimento, com foco na janela operacional de até 30 dias.

Lote continua contextual a Estoque; não criar item principal independente na sidebar.

---

# 7. Movimentações

```text
/movimentacoes
```

Função:

```text
histórico
rastreabilidade
auditoria
filtros
```

Cores aprovadas:

```text
ENTRADA   azul
SAÍDA     vermelho
DESCARTE  amarelo
```

Pedidos entregues são recorte de Movimentações; não criar relatório dedicado.

---

# 8. Resíduos

A etapa foi concluída e mergeada. Não tratar mais a antiga branch backend divergente como estado atual.

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

Componente de Resíduo pode referenciar Produto apenas para rastreabilidade e não altera estoque automaticamente.

O Código SGL aparece desde o registro inicial. QR Code não integra o rótulo visual atual.

Modelos de Resíduos pré-determinados são apenas opção futura “Em breve”.

---

# 9. Rótulos

## Resíduo

```text
/residuos/:id/rotulo
```

## Produto

```text
/produtos/:id/rotulo
```

O rótulo de Produto possui visualização/impressão e atalho contextual. Quando fiscalizado, evidencia o controle externo.

Existe controle visual de tamanho/escala para impressão em A4 no fluxo implementado.

---

# 10. Estagiários

```text
/estagiarios
```

Estado:

```text
listagem                         ✅
cadastro                         ✅
edição                           ✅
unidade/laboratório              ✅
período                          ✅
tipo de vínculo                  ✅
encerramento                     ✅
auditoria visual                 ✅
```

Tipos incluem `CONTRATUAL`.

Relatório adicional:

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
- projetos e cadastros usam ativação/inativação quando a preservação histórica importa;
- auto-rebaixamento do Administrador da sessão é bloqueado na interface;
- `ESTAGIARIO` com estágio ativo não deve perder esse perfil antes do encerramento.

Detalhes: `docs/ETAPA_CADASTROS_ADMIN.md`.

---

# 12. Relatórios

Central:

```text
/relatorios
```

Cobertura do produto:

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

Objetivo: interface operacional da Gestão, não painel decorativo.

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
resumo rápido
```

Navegação contextual já implementada:

```text
pedido urgente → /pedidos com filtro/alvo
estoque baixo → /estoque ou detalhe
lote vencido/próximo → estoque/lote alvo
resíduo pendente → /residuos com filtro/alvo
```

Não voltar a contar “todos os resíduos” como “em análise”: o indicador operacional considera `INFORMADO` + `EM_ANALISE`.

---

# 14. Dashboard Solicitante

```text
/inicio
```

É a rota inicial de perfis solicitantes e deve mostrar apenas contexto útil ao usuário comum, sem controles de Gestão/Administração.

---

# 15. Shell — alertas, busca e aparência

Concluído e integrado:

```text
Aparência claro/escuro           ✅
persistência do tema             ✅
Alertas operacionais             ✅
Busca global                     ✅
responsividade do layout         ✅
```

A busca global aplica contexto ao destino quando possível, inclusive Pedidos, Estoque e Cadastros.

Alertas operacionais ficam acessíveis fora do conteúdo da sidebar e direcionam ao contexto operacional correspondente.

---

# 16. 404

```text
/:pathMatch(.*)*
```

Asset:

```text
public/animations/folder-not-found.lottie
```

A animação está concluída. Não recolocar 404 como pendência.

---

# 17. Documentos/upload

Persistência real de documentos ainda não deve ser inventada no frontend.

Contextos possíveis continuam sendo:

```text
Pedido
Produto
Lote
```

Aguardar contrato backend real antes de criar upload/download definitivo. Isso não impede o congelamento do primeiro protótipo operacional atual, salvo decisão explícita do produto.

---

# 18. Próximo bloco — matriz de permissões

Antes de congelar, registrar para cada perfil:

```text
menus visíveis
rota inicial
unidade/laboratório visíveis
registros que pode criar
registros que pode editar
transições de Pedido permitidas
transições de Resíduo permitidas
relatórios disponíveis
exportações disponíveis
acesso a Administração/Cadastros
ações exclusivas de Gestor/Admin
```

A matriz é primeiro uma especificação de UX/negócio. Depois deve orientar a autorização real no backend.

---

# 19. Congelamento e homologação

Depois da matriz:

```text
congelar primeiro protótipo
→ não adicionar funcionalidades novas
→ executar docs/PLANO_TESTES_PRIMEIRO_PROTOTIPO.md
→ corrigir falhas
→ repetir testes afetados
```

A homologação deve incluir os blocos adicionados após 31/08:

```text
Resíduos completo
Código SGL inicial
rótulos
Estagiários
Pessoas por laboratório
Administração
Dashboard Gestão
Dashboard Solicitante
alertas
busca global
claro/escuro
sessão expirada
rotas/perfis
```

---

# 20. Pós-protótipo

```text
autenticação/autorização/auditoria definitiva
integração corporativa
upload documental quando contrato existir
refactor técnico para inglês
```

A interface permanece em português.

---

# 21. Documentação para leitura

```text
docs/DOSSIE_PROJETO_SGL.md
docs/README.md
docs/ROADMAP_INTERFACE_GESTAO.md
docs/INVENTARIO_TELAS.md
docs/FLUXOS_NAVEGACAO.md
docs/FECHAMENTO_PRIMEIRO_PROTOTIPO.md
docs/ETAPA_CADASTROS_ADMIN.md
docs/ETAPA_ESTAGIARIOS.md
docs/DECISAO_UNIDADES_CORPORATIVAS.md
```

---

# 22. Regra final de retomada

**Não refazer módulos concluídos. O estado atual é fechamento do primeiro protótipo: consolidar permissões, congelar, homologar e estabilizar.**
