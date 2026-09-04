# Fluxos e Navegação — SGL Frontend

**Atualizado em:** 03/09/2026  
**Rotas reais:** `src/router/index.ts`  
**Estado/planejamento:** `../CONTINUIDADE.md`

Este documento descreve a navegação vigente no fechamento do primeiro protótipo.

---

# 1. Princípios

```text
fluxo principal → rota própria
recurso contextual → seção/aba/modal
ação de domínio → contexto do recurso
ação destrutiva/relevante → confirmação
retorno após ação → previsível
regra de negócio crítica → backend
```

Decisões:

1. Layout separado por responsabilidade: Solicitante e Gestão/Admin.
2. Lotes permanecem contextuais a Estoque.
3. Movimentações são trilha operacional independente.
4. Relatórios usam uma central e rotas específicas apenas quando necessário.
5. Produto tem CRUD em Administração, não módulo operacional duplicado.
6. Unidade não possui CRUD manual normal.
7. Resíduos possui fluxo inverso a Pedidos.
8. Dashboard é rota inicial para Gestão/Admin; `/inicio` para Solicitantes.
9. Rótulos de Produto/Resíduo abrem em rotas próprias imprimíveis.
10. 404 de rota e recurso da API não encontrado são situações diferentes.

---

# 2. Rotas atuais

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

# 3. Entrada no sistema

## Sessão DEV atual

```text
/login
→ preencher identificador + senha
→ frontend consulta usuários existentes
→ resolve usuário ativo
→ sessão DEV
→ expiração automática em 5h
→ perfil define rota inicial
```

Rota inicial:

```text
GESTOR / ADMINISTRADOR
→ /dashboard

TECNICO / ANALISTA / PESQUISADOR / ESTAGIARIO
→ /inicio
```

Sessão expirada:

```text
qualquer rota protegida
→ expirarSeNecessario()
→ /login?motivo=sessao-expirada
```

Senha ainda não é validada por autenticação backend definitiva.

---

# 4. Fluxo do Solicitante — Dashboard

```text
/login
→ /inicio
→ visualizar resumo pessoal
→ navegar para Pedido ou Resíduo conforme necessidade
```

O dashboard do Solicitante não expõe ações de Gestão/Administração.

---

# 5. Fluxo do Solicitante — Pedido

## Novo pedido

```text
/inicio ou menu
→ /pedidos/novo
→ selecionar contexto laboratório/projeto
→ adicionar materiais
→ quantidade + forma de retirada
→ urgência quando aplicável
→ revisar
→ enviar
→ feedback
→ acompanhar em /meus-pedidos
```

Backend valida estoque, lote elegível, FIFO/FEFO e regras de domínio.

## Meus pedidos

```text
/meus-pedidos
→ listar solicitações do usuário
→ filtrar/acompanhar status
→ abrir informações relevantes
```

---

# 6. Fluxo da Gestão — Dashboard

Entrada principal:

```text
/login
→ /dashboard
```

Dashboard reúne:

```text
pedidos pendentes/urgentes
estoque baixo
lotes vencidos/próximos
resíduos aguardando ação
movimentações recentes
resumo por laboratório
```

Navegação contextual:

```text
pedido urgente
→ /pedidos?status=PENDENTE&urgencia=URGENTE&pedido=<id>

estoque baixo
→ /estoque ou /estoque/:id

lote vencido/próximo
→ /estoque/:id?lote=<id>&situacao=...

resíduo pendente
→ /residuos?filtro=pendentes-analise&residuo=<id>
```

O dashboard não substitui as telas operacionais; ele aponta para elas.

---

# 7. Fluxo da Gestão — Pedidos

```text
/pedidos
→ fila/filtros
→ selecionar pedido
→ revisar solicitante/laboratório/projeto/itens
→ executar ação permitida pelo estado
```

Aprovação:

```text
PENDENTE
→ Aprovar
→ backend baixa estoque usando FIFO/FEFO
→ APROVADO
```

Rejeição:

```text
PENDENTE
→ Rejeitar
→ REJEITADO
```

Entrega:

```text
APROVADO
→ Registrar entrega
→ ENTREGUE
```

Entrega não faz segunda baixa.

Cancelamento após aprovação restaura os lotes exatos conforme regra backend.

---

# 8. Fluxo de Estoque

## Visão geral

```text
/estoque
→ buscar/filtrar
→ visualizar saldo/situação
→ abrir produto/unidade
→ /estoque/:id
```

## Detalhe

```text
/estoque/:id
→ saldo + mínimo
→ lotes
→ entrada
→ edição segura
→ descarte
→ histórico/rastreabilidade
→ rótulo de Produto quando aplicável
```

## Lotes vencendo

```text
/estoque/lotes-vencendo
→ listar lotes na janela operacional de vencimento
→ abrir estoque/lote alvo
```

## Entrada de lote

```text
Detalhe de estoque
→ Registrar entrada
→ lote/apresentação/quantidade/multiplicador/fracionamento/validade
→ confirmar total em unidade-base
→ backend registra entrada
→ saldo/lotes atualizam
```

Fracionamento:

```text
false → true  permitido
true  → false proibido
```

---

# 9. Fluxo de Movimentações

```text
/movimentacoes
→ filtros
→ histórico operacional
→ rastrear produto/lote/origem/responsável
```

Semântica:

```text
ENTRADA   azul
SAÍDA     vermelho
DESCARTE  amarelo
```

Pedidos entregues são analisados aqui, não em relatório separado.

---

# 10. Fluxo de Resíduos — Solicitante

## Informar

```text
/inicio ou menu
→ /residuos/novo
→ contexto laboratório/projeto
→ descrição/processo/recipiente/quantidade
→ riscos informados
→ composição
→ enviar
→ Código SGL disponível no registro inicial
→ acompanhar em /meus-residuos
```

Regra:

```text
Produto != Resíduo
```

Produto referenciado na composição não movimenta estoque automaticamente.

## Meus Resíduos

```text
/meus-residuos
→ listar resíduos gerados pelo usuário
→ acompanhar status/ciclo
```

---

# 11. Fluxo de Resíduos — Gestão

```text
/residuos
→ localizar resíduo
→ receber
→ analisar/classificar
→ liberar
→ abrir/imprimir rótulo
→ armazenar temporariamente
→ despachar
→ consultar histórico
```

Status:

```text
INFORMADO
→ EM_ANALISE
→ LIBERADO_PARA_ARMAZENAMENTO
→ ARMAZENADO_TEMPORARIAMENTE
→ DESPACHADO
```

Rótulo:

```text
/residuos/:id/rotulo
```

Sem QR Code visual no protótipo atual.

---

# 12. Fluxo de Estagiários

```text
/estagiarios
→ listar/filtrar
→ Novo estágio ou Editar
→ escolher usuário ESTAGIARIO elegível
→ unidade do usuário orienta laboratórios disponíveis
→ registrar tipo/período
→ salvar
```

Encerramento:

```text
estágio ativo
→ Encerrar estágio
→ confirmação
→ backend grava inativo + data efetiva
→ histórico permanece visível
```

---

# 13. Fluxo de Administração/Cadastros

Acesso:

```text
ADMINISTRADOR
→ /administracao/cadastros
```

GESTOR tentando acessar a rota específica é redirecionado para sua rota inicial permitida.

Áreas:

```text
Laboratórios
→ criar/editar/ativar/inativar

Projetos
→ criar/editar/ativar/inativar

Produtos
→ catálogo + risco + perecibilidade + fiscalização + rótulo

Permissões
→ consultar usuários existentes
→ alterar perfil permitido

Resíduos — Em breve
→ sem ação operacional atual
```

Não há cadastro manual de Unidade ou Usuário nessa central.

---

# 14. Fluxo de Relatórios

Central:

```text
/relatorios
→ selecionar relatório
→ preencher filtros
→ gerar prévia
→ exportar a mesma prévia em PDF/XLSX
```

Relatórios especiais com rota:

```text
/relatorios/residuos
/relatorios/pessoas-laboratorio
```

Regra de exportação:

```text
mesma consulta
+ mesmos filtros
= prévia / PDF / XLSX coerentes
```

---

# 15. Rótulos

## Resíduo

```text
contexto do resíduo
→ /residuos/:id/rotulo
→ revisar dados
→ ajustar impressão quando disponível
→ imprimir
```

## Produto

```text
contexto de Produto/Cadastros
→ /produtos/:id/rotulo
→ revisar dados/fiscalização
→ imprimir
```

---

# 16. Alertas operacionais

```text
shell Gestão
→ botão Alertas operacionais
→ visualizar itens relevantes
→ clicar
→ navegar ao contexto filtrado
```

Cobertura alinhada ao dashboard:

```text
Pedidos
Estoque
Lotes
Resíduos
```

---

# 17. Busca global

```text
shell
→ pesquisa
→ selecionar resultado
→ navegar para módulo/alvo
```

A busca atua como atalho de navegação, não como fonte paralela de regra de negócio.

---

# 18. Aparência

```text
shell
→ alternar claro/escuro
→ preferência persiste
```

Tema não altera dados ou permissões.

---

# 19. 404

```text
rota inexistente
→ NotFoundView
```

Recurso da API inexistente deve ser tratado dentro da tela relevante, não necessariamente redirecionado à 404 global.

---

# 20. Próximo fluxo de desenvolvimento

```text
consolidar matriz de permissões
→ validar menus/rotas/ações por perfil
→ congelar o primeiro protótipo
→ executar PLANO_TESTES_PRIMEIRO_PROTOTIPO.md
→ corrigir apenas falhas de homologação
```

Não adicionar novas rotas por conveniência antes do congelamento.
