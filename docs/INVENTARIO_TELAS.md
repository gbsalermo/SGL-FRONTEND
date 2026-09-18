# Inventário de Telas — SGL Frontend

**Atualizado em:** 18/09/2026  
**Fonte de rotas reais:** `src/router/index.ts`  
**Fonte de contratos:** Swagger/OpenAPI do backend  
**Checkpoint:** `../CONTINUIDADE.md`

Este documento registra a cobertura real da aplicação no estado funcional aprovado e o impacto planejado apenas quando já fechado pelo roadmap atual.

---

# 1. Princípios

```text
endpoint existente ≠ página obrigatória
recurso contextual → seção/aba/modal quando fizer sentido
fluxo principal → rota própria
UUID público → fronteira frontend/backend
backend → autoridade das regras de negócio
```

Decisões:

1. Lotes ficam no contexto de Estoque.
2. Movimentações possuem página própria.
3. Relatórios usam central única, com rotas específicas quando a experiência exigir.
4. Produto não possui módulo operacional `/produtos`; CRUD está em Administração/Cadastros.
5. Unidade não possui CRUD manual normal.
6. Resíduos possui experiências separadas de Solicitante e Gestão.
7. Dashboard existe para Gestão e Solicitante.
8. Rótulos de Produto e Resíduo possuem rotas próprias imprimíveis.
9. 404 de rota é diferente de recurso da API não encontrado.
10. Documentos/upload aguardam contrato real.
11. O contexto de Unidade é enviado por `X-SGL-Unidade-Id` durante a fase DEV.
12. Classes de Resíduo já são cadastro funcional em Administração.
13. Locais de armazenamento foram adicionados à mesma central na Etapa 4.1-F e integrados à Gestão na 4.1-G.

---

# 2. Rotas implementadas

## Comum

| Rota | Tela | Estado |
|---|---|---:|
| `/login` | Login visual + sessão DEV | ✅ |
| `/:pathMatch(.*)*` | Page Not Found | ✅ |

## Solicitante

| Rota | Tela | Estado |
|---|---|---:|
| `/inicio` | Dashboard do Solicitante | ✅ |
| `/meus-pedidos` | Meus pedidos | ✅ |
| `/meus-residuos` | Meus resíduos | ✅ |
| `/pedidos/novo` | Novo pedido | ✅ |
| `/residuos/novo` | Informar resíduo | ✅ |

## Gestão / Administração

| Rota | Tela | Estado |
|---|---|---:|
| `/dashboard` | Dashboard operacional da Gestão | ✅ |
| `/pedidos` | Gestão de pedidos | ✅ |
| `/estoque` | Estoque central | ✅ |
| `/estoque/lotes-vencendo` | Lotes próximos do vencimento | ✅ |
| `/estoque/:id` | Detalhe de estoque/lotes | ✅ |
| `/movimentacoes` | Movimentações | ✅ |
| `/estagiarios` | Estagiários | ✅ |
| `/residuos` | Gestão completa de resíduos | ✅ |
| `/relatorios` | Central de Relatórios | ✅ |
| `/relatorios/residuos` | Relatório de Resíduos | ✅ |
| `/relatorios/pessoas-laboratorio` | Pessoas por laboratório | ✅ |
| `/administracao/cadastros` | Administração/Cadastros | ✅ ADMIN |
| `/solicitacoes/novo` | Nova solicitação na experiência Gestão | ✅ |
| `/solicitacoes/meus-pedidos` | Solicitações próprias da Gestão | ✅ |

## Rótulos

| Rota | Tela | Estado |
|---|---|---:|
| `/residuos/:id/rotulo` | Prévia/rótulo de Resíduo | ✅ |
| `/produtos/:id/rotulo` | Rótulo de Produto | ✅ |

---

# 3. Rota inicial por perfil

```text
GESTOR / ADMINISTRADOR → /dashboard
TECNICO / ANALISTA / PESQUISADOR / ESTAGIARIO → /inicio
```

Se não autenticado, rota protegida redireciona para `/login`.

Se a sessão DEV expirar:

```text
/login?motivo=sessao-expirada
```

---

# 4. Login e sessão DEV

```text
/login
```

Estado visual: ✅  
Autenticação real: ⏳

```text
identificador + senha preenchidos
→ consulta usuários existentes
→ resolve usuário ativo
→ sessão DEV
→ expiração em 5h
```

A sessão mantém contexto institucional e o interceptor envia `X-SGL-Unidade-Id`.

---

# 5. Dashboard do Solicitante

```text
/inicio
```

Página inicial do usuário comum, com resumo próprio e sem ações de Gestão/Administração.

---

# 6. Pedidos

## Solicitante

```text
/pedidos/novo
/meus-pedidos
```

## Gestão

```text
/pedidos
```

Regras de baixa/FIFO/FEFO pertencem ao backend.

---

# 7. Estoque e Lotes

```text
/estoque
/estoque/:id
/estoque/lotes-vencendo
```

Cobertura:

```text
saldo
mínimo
busca/filtros
entrada de lote
Código SGL
apresentação física
multiplicador
fracionamento
validade
edição segura
descarte
histórico/rastreabilidade
```

---

# 8. Movimentações

```text
/movimentacoes
```

Função: histórico operacional, auditoria, rastreabilidade e filtros.

---

# 9. Resíduos

## Solicitante

```text
/residuos/novo
/meus-residuos
```

Cobertura após Etapa 3:

```text
projeto opcional
descrição
procedência/uso
recipiente
quantidade/unidade
estado físico
tratamento
riscos informados
composição
Classes de Resíduo
Segurança/EPI
observação
```

## Gestão

```text
/residuos
```

Cobertura:

```text
receber
analisar/classificar
confirmar Classes
confirmar Segurança/EPI
comparar informado x aprovado
identificar Gestor que liberou
pré-visualizar rótulo
armazenar
despachar
histórico
```

Status:

```text
INFORMADO
EM_ANALISE
LIBERADO_PARA_ARMAZENAMENTO
ARMAZENADO_TEMPORARIAMENTE
DESPACHADO
```

## Rótulo

```text
/residuos/:id/rotulo
```

Regra:

```text
INFORMADO / EM_ANALISE
→ prévia ✅
→ impressão ❌

LIBERADO_PARA_ARMAZENAMENTO ou posterior
→ impressão ✅
```

Código SGL e QR técnico existem desde a criação. O template físico atual pode não renderizar o QR visualmente; isso não significa ausência do QR técnico no contrato.

---

# 10. Estagiários

```text
/estagiarios
```

Cobertura: listar, cadastrar, editar, Unidade/Laboratório, período, tipo de vínculo, encerrar e indicadores de prazo.

---

# 11. Administração/Cadastros

```text
/administracao/cadastros
```

Acesso: `ADMINISTRADOR`.

Áreas atuais:

```text
Laboratórios
Projetos
Produtos
Classes de Resíduo
Permissões
```

Não há CRUD manual normal de Unidade, cadastro manual de Usuário nem módulo operacional paralelo `/produtos`.

### Evolução implementada na Etapa 4

```text
4.1-F → Locais de armazenamento de Resíduo ✅
4.2/4.3 → Modelos de Resíduo e uso no formulário
```

Essas áreas ainda não estão implementadas neste checkpoint.

---

# 12. Rótulo de Produto

```text
/produtos/:id/rotulo
```

Tela imprimível contextual ao catálogo, com indicação de fiscalização quando aplicável.

---

# 13. Relatórios

```text
/relatorios
/relatorios/residuos
/relatorios/pessoas-laboratorio
```

Prévia e exportações seguem contratos backend.

---

# 14. Dashboard da Gestão

```text
/dashboard
```

Cobertura:

```text
pedidos pendentes/urgentes
estoque baixo
lotes vencidos/vencendo
resíduos pendentes de ação
movimentações recentes
resumo por laboratório
```

---

# 15. Recursos do shell sem rota própria

```text
Busca global             ✅
Alertas operacionais     ✅
Modo claro/escuro        ✅
Persistência de tema     ✅
Sidebar responsiva       ✅
Topbar                    ✅
```

A tela de login permanece independente do tema das interfaces autenticadas, salvo nova decisão explícita.

---

# 16. Evoluções da Etapa 4 e telas futuras

## Etapa 4.1 — locais de armazenamento ✅

Não há rota própria. O cadastro foi integrado em `/administracao/cadastros` e a seleção/correção foi integrada ao fluxo existente de `/residuos`.

## Etapa 4.2/4.3 — Modelos de Resíduo

Ainda não implementados. Devem aparecer na Administração e no fluxo de Informar Resíduo somente após o domínio backend estar definido.

## Documentos/upload

Sem tela funcional definitiva enquanto contrato backend não estiver fechado.

## Autenticação definitiva

Envolve backend, sessão segura, autorização e integração corporativa; não é apenas uma tela nova.

---

# 17. Fase atual

```text
Etapa 1 ✅
Etapa 2 ✅
Etapa 3 ✅
Etapa 4 🔧
  4.1 backend ✅
  4.1-F/G frontend ✅
  4.1-H regressão ✅
  4.2 Modelos de Resíduo 🔧
```

O planejamento vigente está em `../CONTINUIDADE.md` e no handoff da Etapa 4 do backend.
