# Fechamento do Primeiro Protótipo — SGL

**Atualizado em:** 03/09/2026  
**Status:** planejamento oficial de fechamento  
**Base atual:** `main` após Resíduos, Estagiários, Administração/Cadastros, dashboards e recursos do shell.  
**Objetivo:** congelar e homologar o primeiro protótipo funcional antes de iniciar autenticação/autorização definitiva e novas expansões.

---

## 1. Etapas concluídas

```text
1. Resíduos                                                   ✅
2. Estagiários + Pessoas por laboratório                      ✅
3. Administração → Cadastros                                  ✅
4. Dashboard Gestão                                           ✅
5. Dashboard Solicitante                                      ✅
6. Alertas operacionais                                       ✅
7. Busca global                                               ✅
8. Aparência claro/escuro + persistência                      ✅
9. Rótulos Produto/Resíduo                                    ✅
10. 404                                                       ✅
```

A antiga indicação “Administração → Cadastros ← ATUAL” está encerrada.

---

## 2. Decisões fechadas

### Rótulos

QR Code foi retirado da experiência visual do primeiro protótipo. O backend pode manter campo técnico por compatibilidade sem que ele seja exibido/impresso.

Resíduo usa:

```text
Código SGL
pictogramas conforme riscos confirmados
composição
nível de risco confirmado
laboratório e gerador
processo/recipiente
armazenamento/destino
quantidade
identidade SGL/Embrapa
```

Produto usa dados do catálogo e destaca fiscalização quando aplicável.

### Unidade

Não terá CRUD manual normal. Deve ser sincronizada pela integração corporativa futura.

### Usuário

Não é criado manualmente em Administração. A central atual altera permissões/perfis de usuários existentes.

### Produto

Cadastro é catálogo-base; estoque/lotes continuam nas telas operacionais.

### Resíduo

```text
Produto != Resíduo
```

Referência a Produto em composição é rastreabilidade e não movimenta estoque automaticamente.

### Resíduos pré-determinados

São ideia futura “Em breve”, não requisito do primeiro protótipo.

---

## 3. Estado das áreas operacionais

```text
SOLICITANTE
/inicio                  ✅ Dashboard
/pedidos/novo            ✅
/meus-pedidos            ✅
/residuos/novo           ✅
/meus-residuos           ✅

GESTÃO
/dashboard               ✅
/pedidos                 ✅
/estoque                 ✅
/estoque/:id             ✅
/estoque/lotes-vencendo  ✅
/movimentacoes           ✅
/estagiarios             ✅
/residuos                ✅
/relatorios              ✅

ADMIN
/administracao/cadastros ✅
```

Rótulos e relatórios específicos também estão integrados.

---

## 4. Dashboard e alertas — concluídos

Dashboard Gestão apresenta dados reais e ações contextuais para:

```text
pedidos pendentes
pedidos urgentes
estoque baixo
lotes vencidos
lotes próximos do vencimento
resíduos INFORMADO/EM_ANALISE
movimentações recentes
resumo por laboratório
```

Alertas operacionais e busca global foram integrados ao shell.

Tema claro/escuro funciona com persistência.

---

## 5. Próxima etapa obrigatória — Matriz de Permissões

Antes de congelar, consolidar diretrizes funcionais por perfil:

```text
ADMINISTRADOR
GESTOR
TECNICO
ANALISTA
PESQUISADOR
ESTAGIARIO
```

A matriz deve registrar:

```text
rota inicial
menus visíveis
escopo de unidade/laboratório
criação de registros
edição de registros
aprovação/rejeição/entrega/cancelamento de Pedido
recebimento/análise/armazenamento/despacho de Resíduo
acesso a Estagiários
acesso a Relatórios
permissão de exportar
acesso a Administração/Cadastros
alteração de perfis
```

### Regra importante

Essa matriz é, neste momento, especificação de **produto/UX e negócio**.

Os guards do Vue Router e validações pontuais existentes são temporários e não substituem a futura autorização real no backend.

---

## 6. Critério de congelamento

O primeiro protótipo pode ser congelado quando:

```text
fluxos principais do usuário comum funcionarem        ✅
fluxos principais da Gestão funcionarem               ✅
Administração/Cadastros funcionar                     ✅
Resíduos funcionar ponta a ponta                      ✅
Dashboard usar dados reais                            ✅
Alertas operacionais estiverem conectados             ✅
Claro/Escuro estiver funcional                        ✅
404 e erros básicos estiverem tratados                ✅ funcionalmente
Diretrizes/matriz de permissões estiverem registradas ⏳
Nenhuma falha conhecida impedir a homologação         ⏳ confirmar
```

Portanto, o item funcional estruturado restante antes do congelamento é **a matriz de permissões**, seguido de uma checagem rápida de bloqueadores conhecidos.

---

## 7. Congelamento

Depois da matriz:

```text
1. marcar o protótipo como congelado
2. parar entrada de funcionalidades novas
3. permitir apenas correções necessárias à homologação
4. registrar qualquer exceção explicitamente
```

Não inserir no meio da homologação:

```text
novos módulos
refactor amplo
renomeação técnica para inglês
integração corporativa
mudança estrutural de autenticação
modelos pré-determinados de resíduos
```

---

## 8. Homologação completa

Após congelar, executar:

```text
docs/PLANO_TESTES_PRIMEIRO_PROTOTIPO.md
```

A bateria deve ser ponta a ponta e cobrir no mínimo:

```text
Login DEV e sessão expirada
Rotas por perfil
Pedidos — Solicitante/Gestão
Urgência
Estoque/Lotes
Embalagem/fracionamento
Vencidos e lotes vencendo
Movimentações
Relatórios
PDF/XLSX
Fiscalização
Resíduos completo
Código SGL do Resíduo no registro inicial
Rótulo de Resíduo
Rótulo de Produto
Estagiários
Encerramento de estágio
Pessoas por laboratório
Administração/Cadastros
Permissões
Dashboard Gestão
Dashboard Solicitante
Alertas operacionais
Busca global
Claro/Escuro
Responsividade crítica
404
```

---

## 9. Regra da homologação

```text
teste falhou
→ abrir/corrigir defeito
→ testar correção
→ repetir fluxo afetado
→ atualizar documentação se o comportamento final mudar
```

Não transformar um defeito encontrado em oportunidade para ampliar escopo sem necessidade.

---

## 10. Segurança após o protótipo congelado

Depois da homologação funcional:

```text
autenticação real
→ autorização backend por perfil/escopo
→ identidade segura para auditoria
→ integração corporativa/SSO
```

Estado atual:

```text
login visual                       ✅
sessão DEV                         ✅
expiração em 5h                    ✅
guardas de rota                    ✅ UX
senha validada de forma real       ⏳
autorização servidor               ⏳
auditoria por identidade segura    ⏳
```

---

## 11. Documentos/upload

Upload/download documental definitivo ainda depende de contrato backend real.

Isso permanece como evolução posterior, a menos que o produto declare explicitamente que é bloqueador para homologação.

Não criar persistência fictícia.

---

## 12. Pós-protótipo

Refactor técnico para inglês continua documentado como etapa posterior:

```text
backend: classes/métodos/DTOs/services/repositories/controllers
frontend: nomenclatura técnica interna
```

A interface permanece em português.

---

## 13. Sequência oficial restante

```text
AGORA
Matriz/diretrizes de permissões

EM SEGUIDA
Congelamento do primeiro protótipo
→ Homologação completa
→ Estabilização

DEPOIS
Autenticação/Autorização/Auditoria definitiva
→ Integração corporativa
→ Documentos/upload quando definido
→ Refactor técnico para inglês
```

**Administração, Resíduos, Dashboards, Alertas, Busca e Claro/Escuro não são mais etapas pendentes.**
