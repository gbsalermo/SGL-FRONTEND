# Fechamento do Primeiro Protótipo — SGL

**Atualizado em:** 04/09/2026  
**Estado:** **APROVADO FUNCIONALMENTE**  
**Uso atual deste documento:** registro de fechamento do protótipo e referência para futuras homologações.

> Este arquivo deixou de representar um gate pendente. O primeiro protótipo foi aprovado e o projeto está em ajustes de pré-produção pós-aprovação.

---

## 1. Escopo funcional aprovado

O protótipo aprovado reúne:

```text
Login visual / sessão DEV
Pedidos do Solicitante
Pedidos da Gestão
Estoque e Lotes
FIFO / FEFO via backend
Movimentações e rastreabilidade
Relatórios e fiscalização
Exportações PDF/XLSX
Resíduos — Solicitante e Gestão
Rótulos de Produto e Resíduo
Estagiários
Pessoas por laboratório
Administração / Cadastros
Dashboard Gestão
Dashboard Solicitante
Alertas operacionais
Busca global
Tema claro/escuro com persistência
404
Isolamento funcional por Unidade
```

A aprovação funcional não significa que autenticação/autorização de produção já esteja concluída.

---

## 2. Decisões consolidadas

### Estoque e Pedidos

```text
criação de Pedido → não baixa estoque
aprovação → baixa estoque
entrega → não baixa novamente
cancelamento aprovado → restaura lotes utilizados
perecível → FEFO
não perecível → FIFO
```

### Resíduos

```text
Produto != Resíduo
```

Referenciar Produto na composição de Resíduo não movimenta estoque automaticamente.

Fluxo:

```text
INFORMADO
→ EM_ANALISE
→ LIBERADO_PARA_ARMAZENAMENTO
→ ARMAZENADO_TEMPORARIAMENTE
→ DESPACHADO
```

### Unidade

Unidade é referência institucional. Não deve possuir CRUD manual normal no frontend.

O isolamento atual usa o contexto da sessão DEV e `X-SGL-Unidade-Id`, suficiente para validação funcional, mas não como autorização final de produção.

### Usuários

Usuários não são cadastrados manualmente pela central administrativa. A futura integração corporativa deverá criar/sincronizar a identidade institucional.

---

## 3. O que a aprovação não encerra

Itens planejados para o ciclo formal de produção:

```text
matriz detalhada de permissões
autenticação definitiva
autorização no backend
auditoria por identidade autenticada
integração corporativa / SSO
resolução confiável de tenant/Unidade
documentos/upload quando houver contrato definitivo
refactors técnicos planejados
```

Esses itens são evolução para produção, não evidência de que o protótipo funcional esteja incompleto.

---

## 4. Fase atual — pré-produção pós-aprovação

Antes do roadmap formal acima, o projeto executa:

```text
1. limpeza, revisão e atualização documental
2. planejamento dos ajustes de pré-produção
3. implementação/refinamento
4. validação e estabilização do bloco
```

Essa fase existe para aproximar o produto do estado ideal antes do ciclo formal de preparação para produção.

---

## 5. Homologação futura

`PLANO_TESTES_PRIMEIRO_PROTOTIPO.md` continua útil como base para a homologação integrada posterior.

Quando usado novamente, deve ser adaptado para incluir o estado atual da aplicação, principalmente:

```text
isolamento por Unidade
sessão DEV e expiração
rotas/perfis
Pedidos
Estoque/Lotes
Movimentações
Resíduos
Estagiários
Administração
Relatórios/PDF/XLSX
Dashboards
Alertas
Busca global
Tema claro/escuro
Rótulos
404
```

---

## 6. Roadmap formal posterior

Após a pré-produção atual:

```text
matriz de permissões
→ congelamento funcional
→ homologação integrada final
→ correções
→ autenticação/autorização/auditoria
→ integração corporativa
→ demais etapas de produção
```

Detalhes: `ROADMAP_INTERFACE_GESTAO.md`.

---

## 7. Regra final

**Não voltar a tratar o primeiro protótipo como “aguardando fechamento”. Ele está funcionalmente aprovado. Este documento passa a registrar essa aprovação e a servir como referência para o ciclo formal posterior.**
