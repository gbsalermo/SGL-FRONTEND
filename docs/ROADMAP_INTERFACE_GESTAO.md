# Roadmap da Interface de Gestão — SGL

**Atualização:** 03/09/2026  
**Fonte principal de retomada:** `../CONTINUIDADE.md`  
**Handoff completo:** `DOSSIE_PROJETO_SGL.md`

Este documento mantém a sequência funcional já aprovada. Ele **não cria um novo roadmap**; apenas registra quais etapas anteriormente planejadas já foram concluídas.

---

# 1. Estado consolidado

```text
Pedidos da Gestão                              ✅
Estoque / Lotes                                ✅
Movimentações                                  ✅
Relatórios / Fiscalização                      ✅
Exportação PDF/XLSX                            ✅
Página 404                                     ✅
Resíduos                                       ✅
Estagiários                                    ✅
Pessoas por laboratório                        ✅
Administração / Cadastros                      ✅
Rótulos Produto / Resíduo                      ✅
Dashboard Gestão                               ✅
Dashboard Solicitante                          ✅
Alertas operacionais                           ✅
Busca global                                   ✅
Aparência claro/escuro                         ✅
Diretrizes/matriz de permissões                🟡 PRÓXIMA
Congelamento do protótipo                      ⏳
Homologação completa                           ⏳
Autenticação / Autorização / Auditoria         ⏳ posterior
Integração corporativa                         ⏳ posterior
Refactor técnico para inglês                   ⏳ pós-protótipo
```

---

# 2. Decisões que permanecem fechadas

## Lotes

Lote permanece contextual a Estoque; não precisa ser item principal isolado na sidebar.

## Produto

```text
Gestão operacional
├── Estoque
├── Lotes no detalhe de Estoque
├── Movimentações
└── Relatórios

Administração
└── Cadastros
    └── Produtos
```

Não criar uma segunda área operacional `/produtos`.

## Unidade

```text
NÃO criar CRUD manual normal de Unidade
```

A origem futura é a integração corporativa.

## Usuário

Usuário não é criado manualmente em Administração. A futura autenticação institucional deve criar/sincronizar cadastro. A central atual trabalha com **Permissões** de usuários existentes.

## Pedidos entregues

Não possuem relatório dedicado.

```text
Movimentações
→ origem PEDIDO
→ tipo SAIDA quando aplicável
```

## Resíduos

```text
Produto != Resíduo
```

Referência a Produto dentro da composição não movimenta estoque automaticamente.

## Rótulos

QR Code não integra o rótulo visual do primeiro protótipo.

---

# 3. Etapa Administração / Cadastros — CONCLUÍDA

Rota:

```text
/administracao/cadastros
```

Exclusiva de `ADMINISTRADOR`.

Áreas concluídas:

```text
Laboratórios
Projetos
Produtos
Permissões
```

A opção **Resíduos — Em breve** registra apenas a ideia futura de modelos pré-determinados e permanece inativa.

Implementação segue as decisões de `ETAPA_CADASTROS_ADMIN.md`.

---

# 4. Etapa Resíduos — CONCLUÍDA

A antiga necessidade de reconciliar `feat/gestao-residuos` está superada. O backend foi portado para a `main` atual e o frontend completo foi integrado.

Rotas:

```text
/residuos/novo
/meus-residuos
/residuos
/residuos/:id/rotulo
/relatorios/residuos
```

Cobertura:

```text
Informar Resíduo
Meus Resíduos
recebimento
análise/classificação
Código SGL
rótulo
armazenamento temporário
despacho
histórico
relatório
PDF/XLSX
```

---

# 5. Etapa Estagiários — CONCLUÍDA

Rota:

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
```

Relatório complementar:

```text
/relatorios/pessoas-laboratorio
```

---

# 6. Documentos e Rotulagem

## Rotulagem — CONCLUÍDA para o escopo atual

```text
/residuos/:id/rotulo
/produtos/:id/rotulo
```

Rótulos de Produto e Resíduo possuem experiência imprimível no frontend.

## Documentos/upload — POSTERIOR

Persistência documental real ainda não possui contrato definitivo no protótipo atual.

Contextos possíveis:

```text
Pedido
Produto
Lote
```

Não implementar upload fake/local apenas para preencher uma tela.

---

# 7. Dashboard / Alertas / Aparência — CONCLUÍDO

## Dashboard Gestão

```text
/dashboard
```

Cobertura:

```text
pedidos pendentes/urgentes
estoque baixo
lotes vencidos
lotes próximos do vencimento
resíduos aguardando ação
movimentações recentes
resumo por laboratório
resumo rápido
navegação contextual
```

## Dashboard Solicitante

```text
/inicio
```

Página inicial dos perfis solicitantes.

## Alertas

Alertas operacionais estão integrados ao shell e navegam ao contexto relevante.

## Busca global

Integrada ao shell, com destinos contextuais para módulos como Pedidos, Estoque e Administração.

## Aparência

```text
claro        ✅
escuro       ✅
persistência ✅
```

---

# 8. Próxima etapa — Diretrizes / Matriz de Permissões

Antes do congelamento, consolidar por perfil:

```text
ADMINISTRADOR
GESTOR
TECNICO
ANALISTA
PESQUISADOR
ESTAGIARIO
```

Responder:

```text
rota inicial
menus visíveis
escopo de unidade/laboratório
registros que pode criar
registros que pode editar
transições de Pedido permitidas
transições de Resíduo permitidas
relatórios e exportações disponíveis
acesso a Administração
ações exclusivas de Gestão/Admin
```

Essa matriz será primeiro uma especificação funcional/UX. Depois orientará a autorização real no backend.

Não confundir guardas atuais do router/sessão DEV com segurança final.

---

# 9. Congelamento do primeiro protótipo

Depois da matriz:

```text
1. declarar o primeiro protótipo funcional congelado
2. impedir entrada de novas funcionalidades
3. permitir apenas correções necessárias à homologação
```

Critérios já alcançados:

```text
fluxos principais do Solicitante       ✅
fluxos principais da Gestão            ✅
Administração/Cadastros                 ✅
Resíduos ponta a ponta                  ✅
Dashboard/alertas                       ✅
claro/escuro                            ✅
404                                     ✅
```

Critério restante imediato:

```text
matriz/diretrizes de permissões         ⏳
```

---

# 10. Homologação completa

Após congelar:

```text
executar docs/PLANO_TESTES_PRIMEIRO_PROTOTIPO.md
→ registrar falhas
→ corrigir
→ repetir testes afetados
```

A homologação deve incluir especialmente os recursos adicionados em 01–03/09:

```text
Resíduos + V12/Código SGL inicial
rótulos
Estagiários
Pessoas por laboratório
Administração
Dashboard Gestão/Solicitante
Alertas
Busca global
Tema claro/escuro
Sessão expirada
Perfis/rotas
```

---

# 11. Autenticação / Autorização / Auditoria — POSTERIOR AO PROTÓTIPO CONGELADO

Estado atual:

```text
login visual / sessão DEV              ✅
expiração da sessão DEV                ✅
guardas de rota                        ✅ UX
senha validada por backend real        ⏳
autenticação segura                    ⏳
autorização real                       ⏳
auditoria por identidade autenticada  ⏳
integração corporativa                 ⏳
```

Sequência prevista:

```text
protótipo congelado e homologado
→ autenticação local/real conforme decisão
→ autorização por perfil
→ auditoria segura
→ integração corporativa/SSO
```

---

# 12. Pós-protótipo

Refactor técnico para inglês:

```text
classes/métodos backend
DTOs/services/repositories/controllers
nomenclatura técnica frontend
```

A interface permanece em português.

Não misturar esse refactor com homologação ou novas funcionalidades.

---

# 13. Sequência oficial resumida

```text
AGORA
Matriz de permissões

DEPOIS
Congelar primeiro protótipo
→ Homologação completa
→ Estabilização
→ Autenticação/Autorização/Auditoria definitiva
→ Integração corporativa
→ Documentos/upload quando contrato existir
→ Refactor técnico para inglês
```

Não recolocar **Administração, Resíduos, Dashboard, Alertas ou Claro/Escuro** como etapas futuras: já estão integrados à `main`.
