# Inventário de Telas — SGL Frontend

**Atualizado em:** 31/08/2026  
**Fonte de rotas reais:** `src/router/index.ts`  
**Fonte de contratos:** Swagger/OpenAPI do backend  
**Checkpoint:** `../CONTINUIDADE.md`

Este documento substitui o inventário inicial de 21/08 como referência de cobertura atual. A concepção histórica continua registrada no Git, mas o status abaixo representa a aplicação existente e o planejamento vigente.

---

# 1. Princípios

```text
endpoint existente ≠ página obrigatória
recurso contextual → seção/aba/modal quando fizer sentido
fluxo principal → rota própria
UUID público → fronteira frontend/backend
backend → autoridade das regras de negócio
```

Decisões atuais:

1. Lotes continuam dentro do contexto de Estoque.
2. Movimentações possuem página própria de auditoria.
3. Relatórios possuem central única.
4. Produto não terá uma segunda área operacional `/produtos`; CRUD ficará em Cadastros.
5. Unidade não terá CRUD manual no frontend.
6. Documentos continuam contextuais e aguardam contrato real de upload.
7. Resíduos terá fluxo de solicitante e fluxo de gestão após reconciliação backend.
8. Página 404 já está implementada.
9. Dashboard ainda é planejamento futuro e não rota atual.

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
| `/pedidos/novo` | Novo pedido | ✅ |
| `/meus-pedidos` | Meus pedidos | ✅ |

## Gestão/Admin atual

| Rota | Tela | Estado |
|---|---|---:|
| `/pedidos` | Gestão de pedidos | ✅ |
| `/estoque` | Estoque central | ✅ |
| `/estoque/:id` | Detalhe de estoque/lotes | ✅ |
| `/movimentacoes` | Movimentações | ✅ |
| `/relatorios` | Central de Relatórios | ✅ |
| `/solicitacoes/novo` | Nova solicitação dentro da experiência de Gestão | ✅ |
| `/solicitacoes/meus-pedidos` | Solicitações próprias da Gestão | ✅ |

Não documentar `/dashboard` como implementado enquanto não existir no router.

---

# 3. Rotas previstas — Etapa 8

Administração/Cadastros é o próximo bloco.

```text
/cadastros/produtos
/cadastros/laboratorios
/cadastros/projetos
/cadastros/usuarios
/cadastros/estagiarios
```

Não criar:

```text
/cadastros/unidades
```

A Unidade será futuramente sincronizada pela integração corporativa.

Também não criar `/produtos` como rota operacional paralela ao cadastro.

---

# 4. Login

## Tela

```text
/login
```

Estado visual: ✅ concluído.

Estado de autenticação: 🟡 desenvolvimento.

Fluxo atual:

```text
usuário + senha preenchidos
→ GET /v1/usuarios
→ procura usuário ativo
→ senha não é validada no backend
→ localStorage sgl.dev-session
```

A tela pode ser usada para desenvolvimento dos perfis, mas não representa autenticação segura de produção.

---

# 5. Pedidos

## Solicitante

### Novo pedido ✅

```text
/pedidos/novo
```

Suporta o fluxo de solicitação já integrado ao backend, incluindo forma de retirada compatível com as opções atualmente expostas.

### Meus pedidos ✅

```text
/meus-pedidos
```

Prioriza acompanhamento por status, data, laboratório/projeto e itens.

## Gestão ✅

```text
/pedidos
```

Suporta fila/listagem e ações de gestão conforme o estado do pedido.

Regras continuam no backend:

```text
aprovação → baixa
entrega → sem segunda baixa
cancelamento aprovado → restaura lotes exatos
FIFO/FEFO → backend
```

Urgência já está integrada.

---

# 6. Estoque e Lotes ✅

## Estoque

```text
/estoque
```

Cobertura atual:

```text
visão geral
saldo
mínimo
busca/filtros
situação
acesso ao detalhe
```

## Detalhe

```text
/estoque/:id
```

Cobertura atual:

```text
produto + unidade
saldo
lotes
entrada de lote
apresentação física
multiplicador
fracionamento
Código SGL
validade
edição segura
descarte por vencimento
histórico/rastreabilidade de saídas
```

Código SGL vigente:

```text
LOT-<CODIGO_REFERENCIA_PRODUTO>-<SEQUENCIAL>
```

Lote não precisa ser item principal da sidebar.

---

# 7. Movimentações ✅

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

Contextos principais:

```text
produto
lote
tipo
origem
responsável
laboratório
pedido
solicitante
saldo
período conforme contrato
```

Cores aprovadas:

```text
ENTRADA   azul
SAÍDA     vermelho
DESCARTE  amarelo
```

Pedidos entregues são recorte de Movimentações; não criar relatório dedicado.

---

# 8. Relatórios ✅

```text
/relatorios
```

Relatórios ativos:

| Relatório | Prévia | PDF | XLSX |
|---|---:|---:|---:|
| Estagiários | ✅ | ✅ | ✅ |
| Produtos | ✅ | ✅ | ✅ |
| Movimentações | ✅ | ✅ | ✅ |
| Resumo operacional | ✅ | ✅ | ✅ |
| Estoque e lotes | ✅ | ✅ | ✅ |
| Fiscalização | ✅ | ✅ | ✅ |
| Resíduos | ⏳ | ⏳ | ⏳ |

Fluxo:

```text
selecionar
→ filtros específicos
→ prévia
→ exportar
```

A exportação é gerada pelo backend e vinculada à última consulta válida.

---

# 9. Produtos — próxima tela de cadastro

Rota prevista:

```text
/cadastros/produtos
```

Funções:

```text
listar/buscar
criar
editar
ativar/inativar conforme contrato
configurar fiscalização
```

Campos exatos devem seguir Swagger.

Decisões já fechadas:

```text
fiscalizado
órgãos fiscalizadores
observação de fiscalização
```

Se fiscalizado, ao menos um órgão obrigatório.

Não inferir fiscalização por risco/perecibilidade.

---

# 10. Laboratórios — planejado

```text
/cadastros/laboratorios
```

Deve respeitar Unidade existente e responsável.

Não oferecer criação manual de Unidade.

---

# 11. Projetos — planejado

```text
/cadastros/projetos
```

Deve suportar vínculo com laboratório, responsável, período e situação conforme contrato.

---

# 12. Usuários — planejado

```text
/cadastros/usuarios
```

Cadastro/administração de usuários não substitui a futura etapa de autenticação corporativa.

Inativação deve ter confirmação explícita.

---

# 13. Estagiários — planejado e obrigatório

```text
/cadastros/estagiarios
```

Cobertura desejada conforme backend:

```text
listar/buscar
criar
editar
laboratório
período do estágio
tipo de bolsa
observação
encerrar estágio
situação
```

`Encerrar estágio` é ação própria e não deve ser tratada como exclusão genérica.

---

# 14. Unidade — sem tela de CRUD

Decisão vigente:

```text
Unidade institucional
→ API corporativa futura
→ backend sincroniza
→ frontend consome
```

A entidade continua existindo no domínio e em filtros/relacionamentos, mas não terá cadastro manual normal.

Ver `DECISAO_UNIDADES_CORPORATIVAS.md`.

---

# 15. Resíduos — planejado

Rotas conceituais ainda não implementadas:

```text
/residuos
/informar-residuo
```

Não congelar detalhes do formulário usando a branch backend antiga. Primeiro reconciliar o backend com a `main`, atualizar Swagger e então implementar a interface.

Fluxos:

```text
Solicitante
→ informar conteúdo/uso/recipiente/riscos

Gestão
→ receber
→ analisar
→ rotular/liberar
→ armazenar
→ despachar
```

Produto e Resíduo são domínios separados.

---

# 16. Documentos — contrato ainda incompleto

Não há fluxo definitivo de upload/download integrado.

Contextos reservados:

```text
Pedido
Produto
Lote
```

Não criar solução local que finja persistência real.

---

# 17. Dashboard e alertas — planejados

Dashboard não é rota atual.

Futuro:

```text
visão operacional
estoque baixo
vencimentos
pedidos pendentes/urgentes
atalhos por responsabilidade
```

A 404 já está concluída e não pertence mais às pendências.

---

# 18. Cobertura resumida

| Área | Estado |
|---|---:|
| Login visual | ✅ |
| Sessão DEV | ✅ |
| Autenticação real | ⏳ |
| Pedidos solicitante | ✅ |
| Pedidos gestão | ✅ |
| Estoque | ✅ |
| Lotes | ✅ |
| Movimentações | ✅ |
| Relatórios | ✅ |
| Fiscalização | ✅ |
| PDF/XLSX | ✅ |
| 404 | ✅ |
| Produtos cadastro | ⏳ próximo |
| Laboratórios cadastro | ⏳ |
| Projetos cadastro | ⏳ |
| Usuários cadastro | ⏳ |
| Estagiários cadastro | ⏳ |
| Unidade cadastro | 🚫 não implementar |
| Resíduos | ⏳ |
| Documentos/upload | ⏳ |
| Dashboard final | ⏳ |

---

# 19. Próxima ação

```text
Administração → Cadastros → Produtos
```

Antes de escrever a tela:

```text
conferir Swagger
→ conferir tipos/serviços existentes
→ usar UUID público
→ incluir fiscalização
→ não criar Unidade manual
→ validar visual e integração
```
