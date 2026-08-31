# Fluxos e Navegação — SGL Frontend

**Atualizado em:** 31/08/2026  
**Rotas reais:** `src/router/index.ts`  
**Estado/planejamento:** `../CONTINUIDADE.md`

Este documento descreve a navegação vigente e os fluxos já consolidados. Ele substitui como referência atual o snapshot inicial de 21/08.

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

Decisões vigentes:

1. Layout por responsabilidade: Solicitante e Gestão/Admin.
2. Lotes permanecem contextuais a Estoque.
3. Movimentações são trilha operacional independente.
4. Relatórios usam central única.
5. Produto tem CRUD em Administração, não rota operacional duplicada.
6. Unidade não possui CRUD manual no frontend.
7. Documentos ficam contextuais.
8. 404 de rota e 404 de recurso são situações diferentes.
9. Dashboard será implementado depois; não é rota atual.

---

# 2. Rotas atuais

```text
/login

SOLICITANTE
/meus-pedidos
/pedidos/novo

GESTÃO / ADMIN
/pedidos
/estoque
/estoque/:id
/movimentacoes
/relatorios
/solicitacoes/novo
/solicitacoes/meus-pedidos

SISTEMA
/:pathMatch(.*)*
```

Rotas futuras não devem aparecer como implementadas antes da etapa correspondente.

---

# 3. Entrada no sistema

## Desenvolvimento atual

```text
/login
→ preencher identificador + senha
→ frontend busca usuários ativos no backend
→ sessão DEV
→ perfil define rota inicial
```

Rota inicial atual:

```text
GESTOR / ADMINISTRADOR
→ /pedidos

TECNICO / ANALISTA / PESQUISADOR / ESTAGIARIO
→ /meus-pedidos
```

A senha ainda não é validada por autenticação backend real.

## Futuro

```text
autenticação real
→ sessão segura
→ autorização
→ auditoria
→ integração corporativa
```

---

# 4. Fluxo do Solicitante

## Novo pedido

```text
/pedidos/novo
→ contexto do laboratório/projeto
→ adicionar materiais
→ definir quantidade e forma de retirada
→ revisar
→ enviar
→ feedback
```

O backend valida:

```text
produto
estoque disponível
embalagem/forma de retirada
FIFO/FEFO quando ocorrer aprovação
regras de domínio
```

Erros de validação devem manter o contexto/formulário quando possível.

## Meus pedidos

```text
/meus-pedidos
→ listar solicitações do usuário
→ acompanhar status
→ visualizar informações relevantes
```

Ações administrativas não devem aparecer para perfis solicitantes.

---

# 5. Fluxo da Gestão — Pedidos

Entrada:

```text
/pedidos
```

Fluxo:

```text
fila/listagem
→ selecionar pedido
→ revisar solicitante/laboratório/projeto/itens
→ tomar ação permitida pelo estado
```

Aprovação:

```text
PENDENTE
→ revisar quantidades
→ Aprovar
→ backend executa baixa + FIFO/FEFO
→ APROVADO
```

Rejeição:

```text
PENDENTE
→ Rejeitar
→ motivo/observação quando aplicável
→ REJEITADO
```

Entrega:

```text
APROVADO
→ Registrar entrega
→ ENTREGUE
```

Entrega **não faz segunda baixa de estoque**.

Cancelamento:

```text
estado permitido
→ Cancelar
→ confirmação
→ backend restaura lotes quando necessário
→ CANCELADO
```

Urgência já faz parte da experiência e deve permanecer visualmente evidente quando aplicável.

---

# 6. Fluxo de Estoque

## Visão geral

```text
/estoque
→ buscar/filtrar
→ visualizar saldo/situação
→ abrir produto em uma unidade
→ /estoque/:id
```

## Detalhe

```text
/estoque/:id
→ produto + unidade
→ saldo + mínimo
→ lotes
→ entrada
→ edição segura
→ descarte
→ histórico/rastreabilidade
```

Lote permanece no contexto de Estoque.

## Entrada de lote

```text
Detalhe de estoque
→ Registrar entrada
→ informar lote/apresentação/quantidade/multiplicador/fracionamento/validade
→ confirmar total na unidade-base
→ backend registra entrada
→ atualizar saldo e lotes
```

## Fracionamento

```text
false → true  permitido
true  → false não permitido
```

## Descarte

```text
lote vencido/elegível
→ Descartar
→ quantidade/justificativa conforme contrato
→ confirmar
→ backend registra movimentação
→ atualizar tela
```

---

# 7. Fluxo de Movimentações

```text
/movimentacoes
→ histórico
→ busca/filtros
→ expandir contexto
→ rastrear produto/lote/origem/responsável/pedido
```

A página é de consulta/auditoria. Entrada de lote e descarte continuam acionados no contexto de Estoque.

Cores:

```text
ENTRADA   azul
SAÍDA     vermelho
DESCARTE  amarelo
```

Pedidos entregues são analisados como recorte dessa trilha, não em relatório exclusivo.

---

# 8. Fluxo de Relatórios

```text
/relatorios
→ selecionar relatório
→ mostrar filtros específicos
→ consultar
→ loading
→ prévia
→ exportar PDF ou XLSX
```

Relatórios atuais:

```text
Estagiários
Produtos
Movimentações
Resumo operacional
Estoque e lotes
Fiscalização
```

Resíduos será acrescentado após integração do módulo.

A exportação usa a mesma consulta/filtros da prévia e é gerada no backend.

O frontend rastreia a última prévia válida; trocar ou limpar o contexto invalida a exportação anterior.

---

# 9. Fluxo de Administração — PRÓXIMO

Administração reutiliza as áreas de Gestão e acrescentará Cadastros.

```text
Cadastros
├── Produtos
├── Laboratórios
├── Projetos
├── Usuários
└── Estagiários
```

Não incluir Unidade.

## Padrão de cadastro

```text
/cadastros/<modulo>
→ listagem/busca
├── Novo → formulário → salvar
├── Editar → salvar mantendo contexto quando possível
└── inativar/encerrar/excluir conforme regra → confirmação
```

### Produtos — primeiro

```text
/cadastros/produtos
→ listar/buscar
→ Novo
→ Editar
→ fiscalização
```

Fiscalização deve fazer parte do cadastro, não de Relatórios:

```text
Fiscalizado?
Órgãos fiscalizadores
Observação
```

### Estagiários

`Encerrar estágio` deve ser ação própria e claramente separada de exclusão.

---

# 10. Unidade institucional

Não existe fluxo de cadastro manual.

```text
API corporativa futura
→ backend resolve/cria/reutiliza Unidade
→ associa usuário
→ frontend consome unidade da sessão
```

A interface pode exibir Unidade em filtros, detalhes e relações, mas não oferecer “Nova Unidade”.

---

# 11. Fluxo futuro de Resíduos

Só iniciar após o backend reconciliar `feat/gestao-residuos` com a `main` e publicar contrato Swagger atualizado.

## Solicitante

Rota conceitual:

```text
/informar-residuo
```

Fluxo esperado:

```text
laboratório gera resíduo
→ informar composição
→ uso/processo
→ recipiente
→ quantidade
→ riscos percebidos
→ enviar para gestão
```

## Gestão

Rota conceitual:

```text
/residuos
```

Fluxo esperado:

```text
receber
→ fichar/analisar
→ confirmar riscos
→ rotular/liberar
→ armazenar temporariamente
→ despachar/destinar
```

Produto e Resíduo permanecem independentes; composição de resíduo não baixa estoque automaticamente.

---

# 12. Documentos/anexos

Permanecem contextuais:

```text
Pedido
→ documento da solicitação

Produto
→ ficha técnica

Lote
→ nota fiscal / certificado / laudo / documento de entrada
```

Não existe ainda fluxo definitivo de upload/download. Não criar persistência fictícia no frontend.

---

# 13. 404 e recurso não encontrado

## Rota inexistente ✅

```text
/caminho-invalido
→ /:pathMatch(.*)*
→ NotFoundView
→ animação folder-not-found.lottie
```

## Recurso inexistente

```text
API retorna 404 para pedido/estoque/etc.
→ estado contextual “recurso não encontrado”
→ retorno funcional apropriado
```

Nunca converter automaticamente 404 da API em página 404 de rota.

---

# 14. Regras de retorno

Padrões:

```text
pedido criado → contexto/lista correspondente
entrada de lote → detalhe do estoque
edição → permanecer no contexto
cadastro criado → listagem atualizada
inativação/encerramento → listagem + feedback
```

Sempre preferir retorno funcional conhecido a `history.back()` quando a origem puder ser ambígua.

---

# 15. Confirmações

Sem confirmação adicional:

```text
buscar
filtrar
navegar
abrir detalhe
```

Com confirmação:

```text
rejeitar
entregar
cancelar
descartar
inativar
excluir quando existir essa regra
encerrar estágio
```

---

# 16. Alterações não salvas

Formulários administrativos e operações com trabalho relevante devem avisar ao sair com alterações não salvas.

Não aplicar essa proteção a filtros simples.

---

# 17. Responsividade e movimento

Direção vigente:

```text
desktop → sidebar/topbar estáveis
mobile → drawer/overlay
conteúdo largo → scroll ou apresentação responsiva sem esconder dado crítico
```

A transição entre rotas pode usar fade/deslocamento suave, respeitando futuramente `prefers-reduced-motion`.

---

# 18. Fluxos consolidados

```text
SOLICITANTE
Novo pedido → Meus pedidos → acompanhamento

GESTÃO
Pedidos → analisar → aprovar/rejeitar → entregar/cancelar
Estoque → detalhe → lotes/entrada/descarte
Movimentações → auditoria
Relatórios → filtros → prévia → PDF/XLSX

ADMINISTRAÇÃO — PRÓXIMO
Produtos → Laboratórios → Projetos → Usuários → Estagiários

COMPLEMENTAR
Resíduos → Documentos/Rotulagem → Dashboard/Robustez → Autenticação
```

---

# 19. Próximo fluxo a implementar

```text
/cadastros/produtos
```

Sequência:

```text
Swagger
→ listagem
→ busca
→ criar/editar
→ fiscalização
→ feedback
→ validação
→ merge
```
