# Roadmap Formal — SGL Frontend

**Atualizado em:** 04/09/2026  
**Estado do produto:** primeiro protótipo funcional aprovado.  
**Uso deste documento:** sequência formal a ser retomada **depois** do bloco atual de ajustes de pré-produção.

> Este arquivo não representa a tarefa imediata atual. O projeto está primeiro executando limpeza documental, planejamento e refinamentos de pré-produção.

---

## 1. O que já está concluído

```text
Login visual / sessão DEV                         ✅
Pedidos Solicitante/Gestão                        ✅
Estoque / lotes                                   ✅
Movimentações                                     ✅
Relatórios / fiscalização                         ✅
PDF/XLSX                                          ✅
Resíduos Solicitante/Gestão                       ✅
Rótulos Produto/Resíduo                           ✅
Estagiários                                       ✅
Pessoas por laboratório                           ✅
Administração / Cadastros                         ✅
Dashboard Gestão                                  ✅
Dashboard Solicitante                             ✅
Alertas operacionais                              ✅
Busca global                                      ✅
Tema claro/escuro                                 ✅
404                                               ✅
Isolamento funcional por Unidade                  ✅
```

Esses blocos não devem voltar a aparecer como “próxima etapa”.

---

## 2. Bloco atual — fora deste roadmap formal

Antes da sequência formal abaixo, o projeto passa por:

```text
1. limpeza, revisão e atualização documental
2. levantamento dos ajustes de pré-produção
3. implementação/refinamento dos ajustes
4. validação e estabilização desse bloco
```

Esse trabalho pode introduzir melhorias justificadas sem significar que o produto voltou à fase de protótipo.

---

## 3. Etapa formal 1 — Matriz de Permissões

Depois do encerramento da pré-produção atual, consolidar por perfil:

```text
menus visíveis
rota inicial
registros visíveis por Unidade/Laboratório
ações de criação
edição
transições de Pedido
transições de Resíduo
relatórios disponíveis
exportações disponíveis
acesso a Administração/Cadastros
ações exclusivas de Gestor/Admin
```

A matriz deve primeiro expressar a regra funcional/UX e depois orientar a autorização real no backend.

Perfis atuais:

```text
ADMINISTRADOR
GESTOR
TECNICO
ANALISTA
PESQUISADOR
ESTAGIARIO
```

---

## 4. Etapa formal 2 — Congelamento funcional

Após a matriz:

```text
congelar comportamento funcional
→ evitar novas funcionalidades não essenciais
→ preservar contratos aprovados
→ preparar bateria final de homologação
```

Congelamento não significa impedir correções; significa evitar expansão de escopo durante a validação final.

---

## 5. Etapa formal 3 — Homologação integrada

Usar como base `PLANO_TESTES_PRIMEIRO_PROTOTIPO.md`, adaptando-o ao estado atual.

Cobrir ao menos:

```text
sessão e expiração
perfis/rotas
isolamento por Unidade
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

Falhas encontradas devem ser corrigidas e os cenários afetados repetidos.

---

## 6. Etapa formal 4 — Segurança definitiva

Depois da homologação funcional:

```text
autenticação real
→ autorização no servidor
→ auditoria derivada da identidade autenticada
→ eliminação de confiança em dados de identidade controlados pelo cliente
```

Guardas de rota e sessão DEV não devem ser tratadas como segurança final.

---

## 7. Etapa formal 5 — Integração corporativa

Objetivos:

```text
login/SSO corporativo
sincronização de usuário
resolução confiável de Unidade
uso de identificador institucional estável
contexto multitenant derivado da identidade autenticada
```

O header `X-SGL-Unidade-Id` é adequado para validação funcional atual, mas a produção deve derivar a Unidade de uma fonte confiável.

---

## 8. Etapas posteriores

Quando houver contrato definido:

```text
documentos/upload/download
refactors técnicos planejados
melhorias futuras aprovadas
```

O refactor técnico para inglês, se executado, não altera a interface em português nem deve quebrar contratos públicos sem necessidade.

---

## 9. Regra de leitura

A sequência correta é:

```text
PRÉ-PRODUÇÃO ATUAL
limpeza → planejamento → ajustes → estabilização

DEPOIS
matriz → congelamento → homologação → segurança → integração corporativa
```

**Não interpretar “matriz de permissões” como tarefa imediata enquanto o bloco atual de pré-produção ainda estiver em andamento.**
