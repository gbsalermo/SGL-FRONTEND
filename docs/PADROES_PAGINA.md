# Padrões de Página — SGL Frontend

**Etapa:** 1.3 — Figma e padrões visuais  
**Status:** decisão conceitual aprovada; implementação futura

Este documento registra como o conteúdo principal do SGL deve ser organizado, incluindo cabeçalhos, breadcrumbs, ações, busca e filtros.

---

## 1. Área principal

A área de conteúdo deve ser **fluida**, aproveitando monitores grandes e tabelas extensas.

Referências:

```text
desktop  ~24 px de margem/padding
Tablet   ~16 px
Mobile   ~12–16 px
```

Composição:

- fundo geral claro;
- superfícies de conteúdo brancas;
- não envolver toda página em um único card gigante por padrão;
- tabelas e formulários podem possuir containers próprios quando necessário.

---

## 2. Hierarquia padrão

```text
breadcrumb quando necessário
↓
título                                      ação principal
subtítulo curto opcional
↓
busca/filtros contextuais quando necessários
↓
conteúdo
```

A ordem visual deve responder:

```text
Onde estou?
→ breadcrumb

O que estou vendo?
→ título

O que posso fazer?
→ ação principal

Como refino a informação?
→ busca/filtros

Qual é o conteúdo?
→ tabela/card/formulário/resultado
```

---

## 3. Títulos

Referência inicial:

```text
Título de página       ~24 px / 700
Título de seção        ~18 px / 600–700
Título de card         ~16 px / 600
Texto normal           ~14 px / 400
Label                  ~13 px / 600
Texto auxiliar         ~12–13 px
```

Subtítulo/descrição de página só deve existir se acrescentar informação útil.

---

## 4. Ação principal

Quando existir, a ação principal fica preferencialmente no canto direito do cabeçalho da página.

Exemplos:

```text
Produtos                          [+ Novo produto]
Usuários                          [+ Novo usuário]
Estoque                           [+ Nova entrada] quando contextual
```

Não criar ação primária apenas para preencher espaço.

---

## 5. Breadcrumbs

Breadcrumb não é obrigatório em todas as páginas.

### Primeiro nível

Exemplos como:

```text
Dashboard
Pedidos
Estoque
```

podem funcionar sem breadcrumb.

### Profundidade/contexto

Usar quando ajuda a entender a localização:

```text
Estoque / Produto
Pedidos / Detalhe
Cadastros / Produtos
```

Elementos anteriores são navegáveis; o último representa o contexto atual.

---

## 6. Botão voltar

Breadcrumb e voltar não são equivalentes.

Em fluxos/detalhes, o botão voltar possui destino funcional definido:

```text
pedido solicitante → Meus pedidos
pedido gestão      → Pedidos
estoque detalhe    → Estoque
```

Evitar voltar apenas pelo histórico do navegador quando o fluxo funcional exigir um destino conhecido.

---

## 7. Busca global

A topbar possui um **ícone de pesquisa global**.

Comportamento conceitual:

```text
ícone
→ clique
→ expande campo/painel de busca
```

A busca global pode futuramente consultar recursos como:

- Pedidos;
- Produtos;
- Laboratórios;
- Usuários.

Esse escopo não deve ser implementado antes de confirmar necessidade e contrato. O shell apenas reserva o padrão.

---

## 8. Busca e filtros locais

Decisão aprovada: filtros de uma listagem não precisam permanecer sempre expostos.

Padrão preferido:

```text
[ Buscar... ] [ Filtros ]
```

Ao abrir filtros:

```text
Status
Laboratório
Período
outros filtros realmente úteis/suportados
```

Exemplo de Pedidos:

```text
Todos os pedidos
→ Buscar
→ Filtros
→ Status = REJEITADO
→ aplicar
```

Busca local e filtro trabalham juntos, mas permanecem no contexto da página.

---

## 9. Filtros dentro de ferramentas

Quando o filtro pertence a um componente específico do Dashboard ou relatório, ele fica dentro daquele contexto.

Exemplo:

```text
Card/Gráfico de consumo
→ Período
→ Laboratório
```

Não levar todo filtro contextual para a topbar global.

---

## 10. Tabelas

Tabela é o padrão preferido para operação repetitiva:

- Pedidos;
- Estoque;
- Movimentações;
- Cadastros.

Estrutura típica:

```text
busca/filtros
↓
tabela
↓
paginação
```

Ações por linha devem ser discretas e coerentes, usando menu de três pontos quando houver várias ações secundárias.

---

## 11. Cards

Cards são preferidos para:

- indicadores;
- resumos;
- dashboard;
- blocos de detalhe;
- agrupamento de informações relacionadas.

Não transformar cada registro operacional em um card grande quando tabela for mais eficiente.

---

## 12. Referência visual

Arquivo no repositório:

```text
docs/images/exemplo-busca-filtros.webp
```

A imagem demonstra o conceito:

- cabeçalho simples;
- ação principal;
- busca local;
- botão de filtros expansível;
- filtros aplicados;
- tabela operacional;
- topbar com busca global.

Não considerar dados, nomes ou logo aproximada do mockup como contrato funcional.
