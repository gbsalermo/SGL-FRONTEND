# Dossiê do Projeto SGL — Frontend / Handoff para IA

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend:** `gbsalermo/Sistema-SGL`  
**Snapshot:** 03/09/2026  
**Objetivo:** permitir que outra IA retome o frontend no ponto correto, respeitando decisões já fechadas e sem reconstruir módulos concluídos.

---

# 1. Ordem de leitura

```text
1. ../CONTINUIDADE.md
2. este DOSSIE_PROJETO_SGL.md
3. src/router/index.ts
4. Swagger/OpenAPI do backend
5. FECHAMENTO_PRIMEIRO_PROTOTIPO.md
6. ROADMAP_INTERFACE_GESTAO.md
7. documento específico do módulo
```

Fonte de verdade:

```text
main → Swagger → CONTINUIDADE → Dossiê → decisões específicas → históricos
```

---

# 2. Stack

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

Padrões:

- Composition API + `<script setup lang="ts">`;
- services para HTTP;
- types explícitos para contratos;
- Pinia para estado compartilhado;
- backend como autoridade das regras de domínio;
- UUID como ID público;
- interface em português.

---

# 3. Estado executivo em 03/09/2026

```text
Login / sessão DEV                              ✅
Sessão DEV expira em 5h                        ✅
Pedidos — Solicitante                          ✅
Pedidos — Gestão                               ✅
Estoque/Lotes                                  ✅
Movimentações                                  ✅
Relatórios/Fiscalização                        ✅
PDF/XLSX                                       ✅
Resíduos — Solicitante                         ✅
Resíduos — Gestão                              ✅
Rótulo Resíduo                                 ✅
Rótulo Produto                                 ✅
Estagiários                                    ✅
Pessoas por laboratório                        ✅
Administração/Cadastros                        ✅
Dashboard Gestão                               ✅
Dashboard Solicitante                          ✅
Alertas operacionais                           ✅
Busca global                                   ✅
Claro/Escuro + persistência                    ✅
404 animada                                    ✅
Matriz final de permissões                     ⏳ próximo
Congelamento                                   ⏳
Homologação                                    ⏳
Autenticação/autorização real                  ⏳ posterior
Integração corporativa                         ⏳ posterior
```

A indicação de 31/08 de que “Administração é a próxima etapa” está obsoleta.

---

# 4. Perfis e experiências

Perfis:

```text
ADMINISTRADOR
GESTOR
TECNICO
ANALISTA
PESQUISADOR
ESTAGIARIO
```

Agrupamento atual no router:

```text
PERFIS_GESTAO       = GESTOR, ADMINISTRADOR
PERFIS_ADMIN        = ADMINISTRADOR
PERFIS_SOLICITANTE  = TECNICO, ANALISTA, PESQUISADOR, ESTAGIARIO
```

Rota inicial:

```text
Gestão/Admin → /dashboard
Solicitante  → /inicio
```

A matriz final ainda deve detalhar ações, menus, escopo de dados e transições para cada perfil.

---

# 5. Rotas reais

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

`/administracao/cadastros` é exclusiva de `ADMINISTRADOR`.

---

# 6. Sessão DEV

Fluxo atual:

```text
/login
→ usuário preenche identificador + senha
→ frontend consulta usuários existentes
→ resolve usuário ativo
→ cria sessão DEV local
→ expira automaticamente em 5h
```

A senha ainda não é validada por autenticação backend definitiva.

Se a sessão estiver expirada, o router redireciona para `/login?motivo=sessao-expirada`.

Não confundir:

```text
guarda de rota no frontend = UX/controle temporário
autorização real = futura regra segura no backend/sessão
```

---

# 7. Pedidos

Solicitante:

```text
/pedidos/novo
/meus-pedidos
```

Gestão:

```text
/pedidos
```

Decisões consolidadas:

```text
aprovação baixa estoque
entrega não baixa novamente
cancelamento aprovado restaura lotes exatos
perecível usa FEFO
não perecível usa FIFO
urgência não altera automaticamente FIFO/FEFO
```

O Dashboard e alertas podem abrir `/pedidos` com query de status/urgência/alvo.

---

# 8. Estoque/Lotes

```text
/estoque
/estoque/:id
/estoque/lotes-vencendo
```

Cobertura atual:

```text
saldo e mínimo
busca/filtros
entrada de lote
validade
Código SGL
embalagem
multiplicador
fracionamento
edição segura
descarte
histórico/rastreabilidade
filtro por embalagem
contexto recebido do dashboard/busca/alertas
```

Código de lote:

```text
LOT-<CODIGO_REFERENCIA_PRODUTO>-<SEQUENCIAL>
```

Lotes permanecem dentro de Estoque; não criar módulo principal separado.

---

# 9. Movimentações

```text
/movimentacoes
```

Papel:

```text
histórico operacional
rastreabilidade
auditoria
```

Semântica visual:

```text
ENTRADA   azul
SAÍDA     vermelho
DESCARTE  amarelo
```

Pedidos entregues são analisados por Movimentações e não por relatório dedicado.

---

# 10. Resíduos

A etapa está integrada à `main`.

Decisão:

```text
Produto != Resíduo
```

## Solicitante

```text
/residuos/novo
/meus-residuos
```

## Gestão

```text
/residuos
```

Fluxo:

```text
INFORMADO
→ EM_ANALISE
→ LIBERADO_PARA_ARMAZENAMENTO
→ ARMAZENADO_TEMPORARIAMENTE
→ DESPACHADO
```

A Gestão recebe, analisa, confirma riscos, libera rótulo, armazena e despacha.

Componente ligado a Produto é rastreabilidade e não movimenta estoque.

Código SGL é exibido desde o registro inicial.

Rótulo:

```text
/residuos/:id/rotulo
```

QR Code não faz parte do visual atual.

Relatório:

```text
/relatorios/residuos
```

Possui filtros e PDF/XLSX.

Modelos pré-determinados aparecem apenas como “Em breve”.

---

# 11. Estagiários

```text
/estagiarios
```

Cobertura:

```text
listagem
cadastro
edição
unidade/laboratório
período
tipo de vínculo
encerramento
indicadores de auditoria
```

Tipos incluem:

```text
BOLSA_CNPQ
BOLSA_CAPES
BOLSA_INSTITUCIONAL
VOLUNTARIO
CONTRATUAL
```

Encerramento grava data efetiva e mantém histórico.

---

# 12. Pessoas por laboratório

```text
/relatorios/pessoas-laboratorio
```

Relatório de auditoria institucional com:

```text
laboratório/unidade
responsável
pessoas vinculadas
perfil
ativo/inativo
estagiário: vínculo e período
PDF/XLSX
```

---

# 13. Administração/Cadastros

```text
/administracao/cadastros
```

Exclusiva de `ADMINISTRADOR`.

Áreas:

```text
Laboratórios
Projetos
Produtos
Permissões
Resíduos — Em breve
```

Decisões:

## Unidade

Sem CRUD manual normal. Origem futura corporativa.

## Usuário

Sem cadastro manual nesta interface. Futuro login institucional deve criar/sincronizar cadastro.

Admin pode alterar perfil de usuário existente.

## Produto

Cadastro = catálogo-base. Saldo/lote fica em Estoque.

## Laboratório

Responsável deve pertencer à mesma unidade.

## Projeto

Usa laboratório, responsável, período e ativo/inativo.

A interface evita auto-rebaixamento do Administrador da sessão e respeita a restrição de perfil de estagiário ativo.

---

# 14. Rótulo de Produto

```text
/produtos/:id/rotulo
```

Rótulo imprimível usando dados do catálogo e identidade SGL. Produtos fiscalizados evidenciam controle externo.

---

# 15. Relatórios

Central:

```text
/relatorios
```

Cobertura atual do produto:

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

A exportação usa a mesma consulta/filtros da prévia.

---

# 16. Dashboard Gestão

```text
/dashboard
```

O dashboard atual substitui a ideia antiga de cards genéricos. Ele é operacional e usa dados reais.

Fontes:

```text
Pedidos
Estoque
Lotes
Resíduos
Movimentações
Laboratórios
Usuários
```

Indicadores:

```text
pedidos pendentes
urgentes
estoque baixo
lotes vencidos
lotes vencendo em 7/30 dias
resíduos pendentes de análise
movimentações do dia/recentes
resumo por laboratório
```

`resíduos pendentes de análise` considera:

```text
INFORMADO + EM_ANALISE
```

A seção **Precisa de atenção** ordena situações críticas/altas/médias e navega ao contexto correspondente.

**Últimas movimentações** funciona como timeline visual com pontos/linha e semântica de movimentação.

Há alternância/organização de **Resumo por laboratório** e **Resumo rápido** conforme a composição atual do dashboard.

---

# 17. Dashboard Solicitante

```text
/inicio
```

Serve como página inicial do usuário comum e não deve duplicar ações administrativas.

---

# 18. Alertas operacionais

O conceito de alertas deixou de ser apenas documentação visual e foi implementado no shell da Gestão.

Cobertura coerente com o dashboard:

```text
pedidos urgentes/pendentes
estoque baixo
lotes vencidos/próximos do vencimento
resíduos aguardando ação
```

Os alertas devem abrir telas já contextualizadas quando possível.

---

# 19. Busca global

Implementada no shell.

Função:

```text
buscar contexto relevante
→ navegar para módulo correspondente
→ aplicar query/alvo quando o destino suportar
```

Destinos incluem contextos de Pedidos, Estoque e Administração.

---

# 20. Aparência

Tema claro/escuro foi integrado.

```text
modo claro      ✅
modo escuro     ✅
persistência    ✅
```

A preferência visual não altera regra de negócio nem perfil.

---

# 21. 404

```text
/:pathMatch(.*)*
```

Asset:

```text
public/animations/folder-not-found.lottie
```

Página já concluída. Não voltar a tratá-la como pendência.

---

# 22. Documentos/upload

Ainda não há contrato definitivo de persistência documental. Não criar armazenamento fake/local apenas para preencher a interface.

Possíveis contextos continuam sendo Pedido, Produto e Lote.

---

# 23. Próximo bloco — permissões

Antes do congelamento, consolidar uma matriz por perfil respondendo:

```text
qual rota inicial
quais menus aparecem
quais unidades/laboratórios enxerga
quais registros cria/edita
quais ações de Pedido executa
quais ações de Resíduo executa
quais relatórios consulta/exporta
quem acessa Administração
quais ações exigem Gestor/Admin
```

Essa matriz começa como especificação funcional/UX e depois orienta a autorização definitiva.

---

# 24. Congelamento/homologação

Sequência oficial:

```text
matriz de permissões
→ congelar primeiro protótipo
→ executar PLANO_TESTES_PRIMEIRO_PROTOTIPO.md
→ corrigir falhas
→ revalidar áreas afetadas
```

A homologação precisa cobrir especialmente os blocos incorporados após 31/08:

```text
Resíduos
rótulos
Estagiários
Pessoas por laboratório
Administração
Dashboard Gestão/Solicitante
Alertas
Busca
Claro/Escuro
Sessão expirada
Perfis/rotas
```

---

# 25. Pós-protótipo

```text
autenticação segura
autorização backend
auditoria por identidade autenticada
integração corporativa
upload documental quando definido
refactor técnico para inglês
```

Não misturar o refactor para inglês com o congelamento/homologação.

---

# 26. Regra final

**Não reconstruir módulos concluídos. O próximo trabalho estruturado do frontend é fechar a matriz de permissões, congelar o protótipo e executar a homologação.**
