# Fluxos e Navegação — SGL Frontend

**Atualizado em:** 17/09/2026  
**Rotas reais:** `src/router/index.ts`  
**Estado/planejamento:** `../CONTINUIDADE.md`

Este documento descreve a navegação vigente no estado funcional aprovado do SGL e registra apenas impactos futuros já definidos pelo roadmap atual.

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
4. Relatórios usam central e rotas específicas apenas quando necessário.
5. Produto tem CRUD em Administração, não módulo operacional duplicado.
6. Unidade não possui CRUD manual normal.
7. Resíduos possui fluxo inverso a Pedidos.
8. Dashboard é rota inicial para Gestão/Admin; `/inicio` para Solicitantes.
9. Rótulos de Produto/Resíduo abrem em rotas próprias imprimíveis.
10. 404 de rota e recurso da API não encontrado são situações diferentes.
11. O contexto de Unidade da sessão DEV é propagado à API.
12. Classes de Resíduo já fazem parte de Administração/Cadastros.
13. Locais de armazenamento entrarão na central de Cadastros e no fluxo de Gestão na Etapa 4.1, sem rota principal nova.

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
GESTOR / ADMINISTRADOR → /dashboard
TECNICO / ANALISTA / PESQUISADOR / ESTAGIARIO → /inicio
```

A senha ainda não é validada pelo backend de autenticação definitivo. A sessão contém contexto de Unidade e o interceptor envia `X-SGL-Unidade-Id`.

---

# 4. Fluxo do Solicitante — Dashboard

```text
/login
→ /inicio
→ visualizar resumo pessoal
→ navegar para Pedido ou Resíduo
```

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
→ acompanhar em /meus-pedidos
```

Backend valida estoque, lote elegível, FIFO/FEFO e regras de domínio.

## Meus pedidos

```text
/meus-pedidos
→ listar solicitações do usuário
→ filtrar/acompanhar status
```

---

# 6. Fluxo da Gestão — Dashboard

```text
/login
→ /dashboard
```

Dashboard reúne pedidos pendentes/urgentes, estoque baixo, lotes vencidos/próximos, resíduos aguardando ação, movimentações recentes e resumo por laboratório.

---

# 7. Fluxo da Gestão — Pedidos

```text
/pedidos
→ fila/filtros
→ selecionar pedido
→ revisar contexto
→ executar ação permitida pelo estado
```

```text
PENDENTE → Aprovar → APROVADO
PENDENTE → Rejeitar → REJEITADO
APROVADO → Registrar entrega → ENTREGUE
APROVADO → Cancelar conforme regra backend → CANCELADO
```

Aprovação baixa estoque; entrega não faz segunda baixa; cancelamento aprovado restaura lotes utilizados.

---

# 8. Fluxo de Estoque

```text
/estoque
→ buscar/filtrar
→ abrir /estoque/:id
→ lotes / entrada / edição segura / descarte / histórico
```

Lotes vencendo:

```text
/estoque/lotes-vencendo
→ listar janela operacional
→ abrir contexto alvo
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

---

# 10. Fluxo de Resíduos — Solicitante

## Informar

```text
/inicio ou menu
→ /residuos/novo
→ contexto laboratório/projeto
→ descrição + Procedência/uso
→ recipiente/quantidade
→ estado físico/tratamento
→ riscos informados
→ composição
→ Classes de Resíduo
→ Segurança/EPI
→ observação
→ enviar
→ Código SGL + QR técnico existem no registro inicial
→ acompanhar em /meus-residuos
```

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
→ comparar informado x aprovado
→ liberar
→ abrir prévia/rótulo
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

Regra:

```text
INFORMADO / EM_ANALISE
→ prévia disponível
→ impressão bloqueada

LIBERADO_PARA_ARMAZENAMENTO ou posterior
→ impressão permitida
```

Código SGL e QR técnico existem desde a criação. O template físico atual pode não desenhar o QR visualmente; isso é diferente de o QR técnico não existir.

---

# 12. Etapa 4.1 — fluxo planejado após contrato backend

A modelagem já aprovada é:

```text
LocalArmazenamentoResiduo
= catálogo por Unidade

Residuo.localArmazenamentoResiduo
= referência opcional

Residuo.complementoLocalArmazenamento
= complemento opcional

Residuo.localArmazenamentoTemporario
= snapshot textual histórico
```

Quando o backend estiver fechado:

```text
ADMINISTRADOR
→ /administracao/cadastros
→ manter locais de armazenamento ativos/inativos
```

Na Gestão:

```text
/residuos
→ análise/liberação
→ escolher local cadastrado + complemento opcional
   OU informar local manualmente
→ backend preserva snapshot textual
→ liberar
```

Na confirmação física:

```text
LIBERADO_PARA_ARMAZENAMENTO
→ abrir confirmação
→ manter local planejado
   OU corrigir local cadastrado/complemento/manual
→ backend registra rastreabilidade
→ ARMAZENADO_TEMPORARIAMENTE
```

O frontend não deve enviar catálogo e texto manual simultaneamente.

A implementação frontend da 4.1 só começa após a revisão backend da 4.1-E.

---

# 13. Fluxo de Estagiários

```text
/estagiarios
→ listar/filtrar
→ Novo estágio ou Editar
→ escolher usuário elegível
→ Unidade orienta laboratórios disponíveis
→ registrar tipo/período
→ salvar
```

Encerramento preserva histórico.

---

# 14. Fluxo de Administração/Cadastros

```text
ADMINISTRADOR
→ /administracao/cadastros
```

Áreas atuais:

```text
Laboratórios
→ criar/editar/ativar/inativar

Projetos
→ criar/editar/ativar/inativar

Produtos
→ catálogo + risco + perecibilidade + fiscalização + rótulo

Classes de Resíduo
→ criar/editar/ativar/inativar por Unidade

Permissões
→ consultar usuários existentes
→ alterar perfil permitido
```

Evolução planejada:

```text
4.1-F → Locais de armazenamento
4.2 → Modelos de Resíduo
```

Não há cadastro manual normal de Unidade nem criação manual de Usuário nessa central.

---

# 15. Fluxo de Relatórios

```text
/relatorios
→ selecionar relatório
→ preencher filtros
→ gerar prévia
→ exportar a mesma consulta em PDF/XLSX
```

Rotas específicas:

```text
/relatorios/residuos
/relatorios/pessoas-laboratorio
```

---

# 16. Alertas, busca, aparência e 404

```text
Alertas operacionais → navegar ao contexto alvo
Busca global → atalho de navegação
Tema claro/escuro → preferência persistida
404 → rota inexistente
```

A tela de login permanece independente do tema das interfaces autenticadas, salvo nova decisão explícita.

---

# 17. Fase atual

```text
Etapa 1 ✅
Etapa 2 ✅
Etapa 3 ✅
Etapa 4 🔧
  4.1 backend em andamento
  frontend aguarda 4.1-E
```

O planejamento vigente está em `../CONTINUIDADE.md` e no handoff da Etapa 4 do backend.
