# Inventário de Telas — SGL Frontend

**Etapa:** 1.1 — Fundação visual e técnica  
**Data:** 21/08/2026  
**Fonte de verdade:** controllers e contrato Swagger/OpenAPI do backend `gbsalermo/Sistema-SGL`

Este documento transforma as funcionalidades reais já expostas pelo backend em um primeiro mapa de páginas do SGL. O objetivo é evitar criar telas por entidade de forma automática e definir uma navegação coerente com o trabalho real de quem solicita materiais, de quem faz gestão e de quem administra cadastros.

---

## 1. Princípios usados no inventário

```text
endpoint existente
→ não significa obrigatoriamente página própria

recurso de apoio
→ pode aparecer em detalhe, aba, drawer ou modal

fluxo principal do usuário
→ merece página/rota própria

UUID público
→ único identificador usado pelas rotas e pelo estado do frontend
```

Decisões de UX desta etapa:

1. `Pedido` terá uma tela de detalhe central, reutilizada conforme a responsabilidade do usuário.
2. Estoque será a entrada principal para consultar produto + saldo + lotes + operações relacionadas.
3. Lotes não precisam ocupar um item principal separado da sidebar no MVP; serão acessíveis a partir de Estoque, com filtros especiais para vencidos.
4. Movimentações terão página própria porque funcionam como trilha operacional/auditoria de estoque e possuem vários filtros.
5. Cadastros administrativos serão agrupados sob um único item de navegação chamado **Cadastros**.
6. Documentos/anexos serão inicialmente **contextuais** ao Pedido, Produto ou Lote, e não um item principal isolado da sidebar.
7. Relatórios terão uma central própria, com filtros e categorias, em vez de várias páginas soltas.
8. A seleção temporária de usuário/perfil é ferramenta de desenvolvimento e não deve virar uma funcionalidade definitiva do produto.

---

# 2. Navegação principal proposta

## Experiência comum

```text
Login
Dashboard
404
```

## Solicitante

```text
Dashboard
Pedidos
├── Novo pedido
├── Meus pedidos
└── Detalhe do pedido
```

## Gestão

```text
Dashboard
Pedidos
├── Fila / todos os pedidos
└── Detalhe / análise do pedido

Estoque
├── Visão geral
└── Detalhe do estoque
    ├── Lotes
    ├── Entrada de lote
    ├── Descarte
    └── Documentos do produto/lote

Movimentações
Relatórios
```

## Administração

```text
Cadastros
├── Produtos
├── Unidades
├── Laboratórios
├── Projetos
├── Usuários
└── Estagiários
```

A autorização definitiva desses blocos será definida na etapa futura de autenticação/autorização. Neste momento a divisão representa responsabilidade de uso, não uma regra de segurança fechada.

---

# 3. Rotas funcionais propostas

As rotas abaixo são uma proposta inicial e podem ser refinadas na Etapa 1.2.

## Comum

| Rota | Tela | Observação |
|---|---|---|
| `/login` | Login | Visual inspirado no Publica; autenticação real virá depois |
| `/dashboard` | Dashboard | Conteúdo muda conforme responsabilidade/perfil |
| `/:pathMatch(.*)*` | 404 | Página própria para rota inexistente |

A sessão temporária de desenvolvimento deve ficar centralizada em store/helper e, se precisar de interface, preferir um controle discreto de desenvolvimento em vez de uma página de produção.

## Solicitante

| Rota | Tela | Objetivo |
|---|---|---|
| `/pedidos/novo` | Novo pedido | Criar solicitação de materiais |
| `/meus-pedidos` | Meus pedidos | Listar pedidos do usuário atual |
| `/pedidos/:id` | Detalhe do pedido | Acompanhar status, itens, observação e documentos quando suportados |

## Gestão

| Rota | Tela | Objetivo |
|---|---|---|
| `/pedidos` | Gestão de pedidos | Listagem/fila com filtros por status |
| `/pedidos/:id` | Detalhe/análise | Aprovar, rejeitar, entregar ou cancelar conforme status |
| `/estoque` | Estoque central | Saldo por unidade/produto, busca e alertas de estoque baixo |
| `/estoque/:id` | Detalhe do estoque | Saldo, produto, lotes e operações físicas |
| `/movimentacoes` | Movimentações | Histórico operacional com filtros |
| `/relatorios` | Central de relatórios | Consultas e exportações |

Não criar inicialmente rota exclusiva para `lotes`. A listagem de lotes é parte natural do detalhe de estoque. Uma visão de lotes vencidos pode ser apresentada como filtro/aba especial dentro de Estoque. Se o uso real mostrar necessidade de operação independente, a rota pode ser promovida depois.

## Administração

| Rota | Tela | Objetivo |
|---|---|---|
| `/cadastros/produtos` | Produtos | Catálogo, busca, risco, perecibilidade e CRUD |
| `/cadastros/unidades` | Unidades | CRUD de unidades institucionais |
| `/cadastros/laboratorios` | Laboratórios | CRUD e vínculo com unidade/responsável |
| `/cadastros/projetos` | Projetos | CRUD, ativos e vínculo com laboratório |
| `/cadastros/usuarios` | Usuários | CRUD/inativação e vínculo com laboratório |
| `/cadastros/estagiarios` | Estagiários | CRUD, ativos e encerramento de estágio |

Para esses cadastros, o padrão inicial será:

```text
página de listagem
→ busca/filtros quando existirem
→ ação Novo
→ edição em modal/drawer ou página conforme complexidade real do formulário
→ confirmação antes de excluir/inativar/encerrar
```

Não criar uma página de detalhe para cada cadastro somente porque existe `GET /{id}`. O endpoint de detalhe pode alimentar edição, seleção e relacionamentos sem exigir rota própria.

---

# 4. Mapeamento por domínio

## 4.1 Pedidos

Backend atual permite:

```text
criar pedido ✅
listar todos ✅
listar por usuário ✅
buscar por UUID ✅
listar por status ✅
listar por laboratório + projeto + período ✅
aprovar ✅
rejeitar ✅
entregar ✅
cancelar ✅
```

### Tela: Novo pedido

Deve oferecer:

- laboratório;
- projeto opcional quando aplicável;
- materiais/produtos;
- quantidades;
- observação/dados previstos pelo contrato;
- revisão antes do envio;
- feedback de sucesso/erro.

### Tela: Meus pedidos

Deve usar a consulta por usuário e priorizar:

```text
status
data
laboratório
projeto
resumo de itens
acesso ao detalhe
```

### Tela: Gestão de pedidos

Deve priorizar:

```text
filtro por status
pendentes em evidência
identificação do solicitante
laboratório/projeto
data
acesso rápido à análise
```

### Tela: Detalhe do pedido

Será uma das telas centrais do sistema.

Blocos previstos:

```text
cabeçalho + status
solicitante
laboratório/projeto
itens solicitados/aprovados
observações
histórico relacionado
movimentações do pedido quando úteis à gestão
documentos quando suportados
ações válidas para o status atual
```

A interface não deve calcular localmente as transições permitidas como regra definitiva; o backend continua sendo autoridade do domínio.

---

## 4.2 Estoque e lotes

Backend de estoque central permite:

```text
criar registro de estoque ✅
listar todos ✅
buscar por UUID ✅
listar por unidade ✅
buscar por unidade + produto ✅
atualizar ✅
excluir ✅
listar estoque baixo por unidade ✅
```

Backend de lotes permite:

```text
listar todos ✅
buscar por UUID ✅
listar por estoque ✅
listar vencidos ✅
atualizar ✅
inativar ✅
```

### Tela: Estoque central

Prioridades:

- filtro por unidade;
- busca/identificação do produto;
- quantidade atual;
- quantidade mínima;
- indicação visual de estoque baixo;
- acesso ao detalhe;
- ação administrativa de criação/configuração quando autorizada.

### Tela: Detalhe do estoque

Blocos previstos:

```text
produto + unidade
saldo atual + mínimo
estado de atenção
lista de lotes
entrada de lote
descarte de vencidos
movimentações relacionadas
documentos do produto/lote
```

### Lotes vencidos

No MVP, usar a consulta específica de vencidos como:

```text
Estoque
→ filtro/aba "Lotes vencidos"
```

Não criar item principal na sidebar neste momento.

---

## 4.3 Movimentações

Backend permite:

```text
listar todas ✅
buscar por UUID ✅
filtrar por produto ✅
filtrar por laboratório ✅
filtrar por usuário ✅
filtrar por pedido ✅
filtrar por tipo ✅
registrar entrada de lote ✅
registrar descarte por vencimento ✅
```

### Tela: Movimentações

Deve funcionar como histórico operacional do estoque.

Filtros inicialmente suportados:

- produto;
- laboratório;
- usuário;
- pedido;
- tipo.

A entrada de lote e o descarte devem ser acionados preferencialmente a partir do **detalhe do estoque**, porque ali existe o contexto do produto/unidade. A página de movimentações fica focada em consulta/auditoria.

---

## 4.4 Histórico de laboratório

Backend permite:

```text
listar todo histórico ✅
buscar registro por UUID ✅
filtrar por laboratório ✅
filtrar por produto ✅
filtrar por pedido ✅
filtrar laboratório + período ✅
calcular consumo de produto por laboratório + período ✅
filtrar laboratório + projeto + período ✅
```

Decisão de UX:

O histórico não precisa ser um item principal separado no MVP. Ele alimentará principalmente:

```text
Relatórios
Detalhe de pedido
consultas contextuais de laboratório/projeto
```

---

## 4.5 Produtos

Backend permite:

```text
CRUD ✅
listar por risco ✅
listar perecíveis ✅
buscar por nome ✅
```

A tela de Produtos deve ser um cadastro rico o suficiente para também servir de ponto de consulta do catálogo, sem duplicar uma segunda tela somente para pesquisa.

Documentos gerais do produto serão incorporados quando o backend tiver contrato de anexos.

---

## 4.6 Projetos

Backend permite:

```text
CRUD ✅
listar por laboratório ✅
listar ativos ✅
```

A tela de Projetos deve oferecer filtro por laboratório e estado ativo, além de servir como origem de seleção nos pedidos e relatórios.

---

## 4.7 Laboratórios

Backend permite:

```text
CRUD ✅
listar por unidade ✅
```

A tela de Laboratórios deve priorizar vínculo com unidade e responsável e servir como origem para seletores usados em pedidos, usuários, projetos e relatórios.

---

## 4.8 Unidades

Backend permite CRUD completo. A tela pode ser administrativa e simples, sem detalhe próprio inicialmente.

---

## 4.9 Usuários

Backend permite:

```text
listar todos ✅
buscar por UUID ✅
listar por laboratório ✅
criar ✅
atualizar ✅
inativar ✅
```

A tela deve tratar inativação como ação relevante com confirmação, não como exclusão visual genérica.

---

## 4.10 Estagiários

Backend permite:

```text
listar todos ✅
buscar por UUID ✅
listar por laboratório ✅
listar ativos ✅
criar ✅
atualizar ✅
excluir ✅
encerrar estágio ✅
```

A ação **Encerrar estágio** deve aparecer de forma distinta de exclusão, pois representa mudança de estado/vínculo do domínio.

---

# 5. Relatórios — cobertura atual

## Central de relatórios proposta

Uma única rota `/relatorios`, organizada inicialmente por categorias:

```text
Estoque
Lotes / validade
Movimentações
Pedidos
Consumo / materiais recebidos
```

### Cobertura

| Relatório/consulta | Cobertura atual | Observação |
|---|---|---|
| Estoque por unidade | ✅ | Endpoint de estoque por unidade |
| Estoque baixo por unidade | ✅ | Endpoint específico |
| Lotes por estoque | ✅ | Endpoint específico |
| Lotes vencidos | ✅ | Endpoint específico |
| Lotes próximos do vencimento | ⚠️ | Não há endpoint específico por janela de dias |
| Movimentações por produto/laboratório/usuário/pedido/tipo | ✅ | Filtros existentes |
| Movimentações por período | ⚠️ | Não há filtro de período no controller atual |
| Pedidos por status | ✅ | Endpoint específico |
| Pedidos por usuário | ✅ | Endpoint específico |
| Pedidos por laboratório + projeto + período | ✅ | Endpoint específico |
| Pedidos gerais por período/laboratório sem projeto | ⚠️ | Contrato atual não cobre todas as combinações de filtro |
| Histórico recebido por laboratório + período | ✅ | Endpoint específico |
| Consumo de produto por laboratório + período | ✅ | Endpoint específico |
| Histórico por laboratório + projeto + período | ✅ | Endpoint específico |
| Exportação CSV | ⚠️ | Pode ser feita no frontend para conjuntos já carregados; decisão por relatório |
| Exportação XLSX | ⚠️ | Ainda sem implementação definida |
| Exportação PDF | ⚠️ | Ainda sem implementação definida |

Regra para a próxima fase:

```text
não criar endpoint agregado novo apenas por conveniência visual
→ primeiro validar o relatório real necessário
→ adicionar backend complementar somente quando houver lacuna funcional concreta
```

---

# 6. Documentos/anexos — cobertura atual

## Situação encontrada

O modelo de `Pedido` possui `arquivoDocumento` como `String`, mas não existe fluxo real de arquivo exposto pela API.

Busca no backend não encontrou uso de `MultipartFile`.

Portanto:

| Requisito | Cobertura atual |
|---|---|
| Campo de referência em Pedido | ⚠️ parcial |
| Upload de documento de pedido | ❌ |
| Download de documento de pedido | ❌ |
| Remoção/substituição de documento de pedido | ❌ |
| Metadados de arquivo | ❌ |
| Documento vinculado a Produto | ❌ |
| Documento vinculado a Lote | ❌ |
| Upload/download genérico | ❌ |

### Decisão de frontend

Não criar uma falsa implementação local.

O design deve reservar a área para anexos nos contextos relevantes, mas a funcionalidade definitiva depende de contrato complementar do backend.

Contextos previstos:

```text
Detalhe do pedido
→ documentos da solicitação

Produto
→ ficha técnica / documentação geral

Detalhe do estoque → lote
→ nota fiscal / certificado / laudo / documento de entrada
```

---

# 7. Mapa de cobertura frontend ↔ backend

Legenda:

```text
✅ contrato atual suficiente para iniciar
⚠️ suporte parcial ou decisão técnica ainda necessária
❌ contrato ainda inexistente
```

| Tela/ação | Estado |
|---|---:|
| Login real | ❌ |
| Sessão temporária de desenvolvimento | ✅ frontend |
| Dashboard solicitante | ✅ com composição de dados atuais |
| Dashboard gestão | ⚠️ pode compor dados atuais; agregações podem ser otimizadas depois |
| Novo pedido | ✅ |
| Meus pedidos | ✅ |
| Detalhe do pedido | ✅ |
| Aprovar/rejeitar/entregar/cancelar | ✅ |
| Gestão/listagem de pedidos por status | ✅ |
| Estoque central | ✅ |
| Estoque baixo | ✅ |
| Detalhe de estoque | ✅ |
| Lotes por estoque | ✅ |
| Lotes vencidos | ✅ |
| Entrada de lote | ✅ |
| Descarte de vencidos | ✅ |
| Movimentações + filtros atuais | ✅ |
| CRUD Produtos | ✅ |
| CRUD Unidades | ✅ |
| CRUD Laboratórios | ✅ |
| CRUD Projetos | ✅ |
| CRUD Usuários | ✅ |
| Gestão de Estagiários | ✅ |
| Relatórios de consumo/histórico atuais | ✅ |
| Relatório de movimentações por período | ⚠️ |
| Lotes próximos do vencimento por janela | ⚠️ |
| Relatórios com combinações livres de filtros | ⚠️ |
| Exportação CSV simples | ⚠️ implementação frontend |
| Exportação XLSX/PDF | ⚠️ decisão por relatório |
| Upload/download de documentos | ❌ |
| Documentos de Produto/Lote | ❌ |
| 404 customizada | ✅ frontend |

---

# 8. O que NÃO será página própria inicialmente

Para manter o SGL direto e evitar menu inflado:

```text
Lotes
→ dentro de Estoque

Histórico de laboratório
→ dentro de Relatórios/contextos

Documentos
→ dentro de Pedido/Produto/Lote

Perfil/sessão temporária
→ infraestrutura/controle de desenvolvimento

Detalhe individual de Unidade/Laboratório/Projeto/Usuário
→ somente se o fluxo real justificar depois
```

---

# 9. Primeiro mapa visual da sidebar

## Solicitante

```text
SGL
├── Dashboard
└── Pedidos
    ├── Novo pedido
    └── Meus pedidos
```

## Gestão

```text
SGL
├── Dashboard
├── Pedidos
├── Estoque
├── Movimentações
└── Relatórios
```

## Administração

```text
SGL
├── Dashboard
├── Pedidos
├── Estoque
├── Movimentações
├── Relatórios
└── Cadastros
    ├── Produtos
    ├── Unidades
    ├── Laboratórios
    ├── Projetos
    ├── Usuários
    └── Estagiários
```

A sidebar final será refinada com autenticação/permissões no futuro, mas este mapa já serve para os wireframes.

---

# 10. Resultado da Etapa 1.1

A Etapa 1.1 estabelece:

```text
mapa mínimo de telas ✅
separação solicitante x gestão x administração ✅
navegação principal inicial ✅
decisão de agrupar cadastros ✅
decisão de lotes dentro de estoque ✅
decisão de documentos contextuais ✅
central única de relatórios ✅
mapa de cobertura frontend ↔ backend ✅
lacunas de documentos identificadas ✅
lacunas específicas de relatórios identificadas ✅
```

## Próxima etapa

```text
ETAPA 1.2 — FLUXOS E NAVEGAÇÃO

→ detalhar os caminhos entre as telas
→ definir origem e destino das ações principais
→ fechar fluxo de pedido do solicitante
→ fechar fluxo de gestão do pedido
→ fechar fluxo de estoque/lote
→ fechar entrada para relatórios/cadastros
→ preparar a base para wireframes/Figma
```
