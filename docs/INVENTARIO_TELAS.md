# Inventário de Telas — SGL Frontend

**Atualizado em:** 03/09/2026  
**Fonte de rotas reais:** `src/router/index.ts`  
**Fonte de contratos:** Swagger/OpenAPI do backend  
**Checkpoint:** `../CONTINUIDADE.md`

Este documento registra a cobertura real da aplicação no fechamento do primeiro protótipo.

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
10. Documentos/upload aguardam contrato real e não possuem tela funcional definitiva.

---

# 2. Rotas implementadas

## Comum

| Rota | Tela | Estado |
|---|---|---:|
| `/login` | Login visual + sessão DEV | ✅ |
| `/:pathMatch(.*)*` | Page Not Found animada | ✅ |

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
| `/residuos/:id/rotulo` | Rótulo imprimível de Resíduo | ✅ |
| `/produtos/:id/rotulo` | Rótulo imprimível de Produto | ✅ |

---

# 3. Rota inicial por perfil

```text
GESTOR / ADMINISTRADOR
→ /dashboard

TECNICO / ANALISTA / PESQUISADOR / ESTAGIARIO
→ /inicio
```

Se não autenticado, rota protegida redireciona para `/login`.

Se a sessão DEV expirar, o router redireciona para:

```text
/login?motivo=sessao-expirada
```

---

# 4. Login

```text
/login
```

Estado visual: ✅  
Autenticação real: ⏳

Fluxo atual:

```text
identificador + senha preenchidos
→ consulta usuários existentes
→ resolve usuário ativo
→ sessão DEV
→ expiração em 5h
```

Senha ainda não é validada pelo backend de autenticação definitivo.

---

# 5. Dashboard do Solicitante

```text
/inicio
```

Função: página inicial do usuário comum, com resumo útil ao próprio contexto e sem ações de Gestão/Administração.

---

# 6. Pedidos

## Solicitante

```text
/pedidos/novo
/meus-pedidos
```

Cobertura:

```text
criar solicitação
selecionar materiais
quantidade / forma de retirada
urgência conforme contrato
acompanhar status
```

## Gestão

```text
/pedidos
```

Cobertura:

```text
fila/filtros
pedido urgente
aprovação
rejeição
entrega
cancelamento conforme estado
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
situação
entrada de lote
Código SGL
apresentação física
multiplicador
fracionamento
validade
edição segura
descarte
histórico/rastreabilidade
filtro por embalagem
contexto vindo de dashboard/alertas/busca
```

Código SGL de lote:

```text
LOT-<CODIGO_REFERENCIA_PRODUTO>-<SEQUENCIAL>
```

---

# 8. Movimentações

```text
/movimentacoes
```

Função:

```text
histórico operacional
auditoria
rastreabilidade
filtros
```

Semântica visual:

```text
ENTRADA   azul
SAÍDA     vermelho
DESCARTE  amarelo
```

---

# 9. Resíduos

## Solicitante

```text
/residuos/novo
/meus-residuos
```

## Gestão

```text
/residuos
```

Cobertura:

```text
informar
acompanhar
receber
analisar/classificar
Código SGL
rótulo
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

Sem QR visual no protótipo atual.

---

# 10. Estagiários

```text
/estagiarios
```

Cobertura:

```text
listar
cadastrar
editar
unidade/laboratório
período
tipo de vínculo
encerrar
indicadores de prazo
```

---

# 11. Administração/Cadastros

```text
/administracao/cadastros
```

Acesso: `ADMINISTRADOR`.

Áreas:

```text
Laboratórios
Projetos
Produtos
Permissões
Resíduos — Em breve
```

Não há:

```text
CRUD manual normal de Unidade
cadastro manual de Usuário
módulo operacional paralelo /produtos
```

---

# 12. Rótulo de Produto

```text
/produtos/:id/rotulo
```

Tela imprimível, contextual ao catálogo, com indicação de fiscalização quando aplicável.

---

# 13. Relatórios

## Central

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

## Resíduos

```text
/relatorios/residuos
```

## Pessoas por laboratório

```text
/relatorios/pessoas-laboratorio
```

Ambos suportam exportações conforme contratos backend.

---

# 14. Dashboard da Gestão

```text
/dashboard
```

Cobertura:

```text
pedidos pendentes
pedidos urgentes
estoque baixo
lotes vencidos
lotes vencendo
resíduos pendentes de análise
movimentações recentes
resumo por laboratório
resumo rápido
```

Ações relevantes direcionam para rotas operacionais com query/alvo quando suportado.

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

Esses recursos não devem ser inventariados como páginas separadas.

---

# 16. Telas não implementadas / futuras

## Documentos/upload

Não há tela funcional definitiva porque o contrato backend de persistência documental ainda não foi fechado.

## Resíduos pré-determinados

Aparecem apenas como **Em breve** dentro de Administração/Informar Resíduo. Não possuem rota própria nem contrato operacional atual.

## Autenticação definitiva

Não é uma “nova tela” apenas; envolve backend, sessão segura, autorização e integração corporativa.

---

# 17. Próximo trabalho de interface

Não criar nova rota funcional antes do congelamento sem necessidade de homologação.

Próximo bloco:

```text
matriz funcional de permissões
→ congelamento
→ homologação
→ correções
```

A matriz deve validar se as rotas/menus atuais estão corretos para cada perfil antes de qualquer expansão.
