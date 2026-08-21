# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Repositório:** `gbsalermo/SGL-FRONTEND`  
**Backend de referência:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 21/08/2026  
**Fase atual:** Etapa 1 — fundação visual e técnica  
**Subetapa atual:** 1.2 — fluxos e navegação

Este arquivo registra decisões, etapas concluídas, arquitetura planejada e o ponto exato de continuidade do frontend do SGL.

---

# 1. Handoff do backend — CONCLUÍDO

Estado herdado:

```text
backend estrutural ✅
OpenAPI / Swagger ✅
PostgreSQL + Flyway ✅
UUID público na API ✅
DTOs request/response separados ✅
testes principais do domínio ✅
frontend ← fase atual
autenticação + auditoria local ← após frontend
integração corporativa ← futura
```

Regra de fronteira:

```text
Long id
→ interno do backend
→ nunca deve ser usado pela interface

UUID publicId
→ identificador externo
→ URLs, requests, responses e estado do frontend
```

O Swagger/OpenAPI do backend é a referência operacional para endpoints, parâmetros, request bodies, responses e erros.

---

# 2. Diretrizes de produto aprovadas

## Dashboards claros e funcionais

```text
leitura rápida
→ poucos indicadores realmente úteis
→ prioridade por responsabilidade/perfil
→ evitar excesso de cards, gráficos e informação decorativa
```

## Login inspirado no Publica

A tela de login deve manter familiaridade visual com o Publica, adaptada à identidade do SGL.

A autenticação definitiva será implementada após a primeira fase funcional do frontend. A interface deve permitir substituir a sessão temporária sem reconstruir as telas.

## Pedidos separados por responsabilidade

```text
SOLICITANTE
→ criar pedido
→ acompanhar pedidos próprios
→ consultar status e detalhe
→ interface simples e orientada à tarefa

GESTÃO
→ visualizar fila de pedidos
→ analisar itens
→ aprovar / rejeitar
→ entregar / cancelar quando aplicável
→ acompanhar impacto no estoque
→ interface orientada à decisão
```

Não misturar ações administrativas na experiência de quem apenas solicita materiais.

## Página 404 customizada

```text
rota inexistente
→ página 404 própria

recurso inexistente retornado pela API
→ mensagem contextual
→ estado vazio, inline, notificação ou página conforme o caso
```

## Relatórios e documentos

Fazem parte do escopo do produto.

```text
documentos/anexos
→ upload
→ visualização/download
→ remoção/substituição quando permitida
→ associação ao contexto correto

relatórios
→ filtros operacionais
→ visualização
→ impressão quando útil
→ exportação
```

Persistência de arquivos, consultas adicionais e geração oficial de relatórios dependentes do servidor devem possuir contrato próprio no backend.

## Fiscalização / auditoria regulatória

O cliente precisa informar a uma organização de fiscalização dados de produtos específicos existentes no estoque. Esse requisito passa a fazer parte do planejamento do SGL e pode exigir complemento tanto no backend quanto no frontend.

Objetivo funcional:

```text
selecionar/identificar produtos sujeitos à fiscalização
→ consultar os dados oficiais já mantidos pelo SGL
→ consolidar período e movimentações relevantes
→ gerar relatório específico para fiscalização/auditoria
→ exportar ou registrar a informação de forma rastreável
```

O relatório poderá utilizar, entre outros dados já existentes no domínio:

```text
Produto
→ identificação/código de referência
→ unidade de medida
→ localização física
→ risco, tipo e descrição de risco
→ condições de armazenamento
→ unidade de armazenamento

EstoqueCentral
→ quantidade atual por Unidade + Produto

Lote
→ quantidades e validade quando aplicável

MovimentacaoEstoque
→ entradas, saídas, descartes e restaurações
→ apuração das saídas no período solicitado
```

Regra arquitetural inicial:

```text
NÃO duplicar no cadastro regulatório:
quantidade atual
risco
armazenamento
localização
saídas

esses dados continuam pertencendo às entidades operacionais existentes
```

A modelagem recomendada para avaliação é uma entidade auxiliar conceitualmente semelhante a:

```text
ProdutoFiscalizado / ProdutoControlado
→ identifica quais produtos entram no escopo regulatório
→ referencia Produto
→ pode referenciar Unidade quando o controle depender do estoque/local
→ guarda apenas metadados regulatórios
→ não vira fonte paralela para dados de estoque
```

Metadados possíveis, a confirmar com o requisito real do órgão:

```text
órgão fiscalizador
código/registro regulatório
vigência/estado ativo
observação
outros campos específicos exigidos pela fiscalização
```

Não congelar nome da entidade nem seus campos antes de conhecer o formulário/relatório exigido pelo órgão.

Caso o mesmo produto possa ser fiscalizado por órgãos diferentes, ou com regras distintas por unidade/local, uma entidade auxiliar é preferível a apenas adicionar `fiscalizado = true` em `Produto`.

### Rastreabilidade do relatório emitido

Se a auditoria exigir comprovar exatamente o conteúdo enviado em uma data/período, avaliar uma segunda estrutura conceitual:

```text
RelatorioFiscalizacao / DeclaracaoRegulatoria
→ órgão destinatário
→ período de referência
→ data/hora de geração
→ responsável
→ produtos/valores declarados (snapshot quando necessário)
→ arquivo/exportação ou identificador da declaração
→ status quando houver fluxo de envio
```

Essa estrutura só deve ser criada se houver necessidade real de preservar o **snapshot do que foi declarado**. Se a exigência for apenas consulta atual/reprocessável, o histórico existente poderá ser suficiente.

---

# 3. Perfis existentes no domínio

```text
ADMINISTRADOR
GESTOR
TECNICO
ANALISTA
PESQUISADOR
ESTAGIARIO
```

Durante o desenvolvimento inicial, o frontend será organizado por **responsabilidade de uso**:

```text
solicitante
gestão
administração
```

O mapeamento definitivo perfil → permissão será consolidado junto da autenticação/autorização.

---

# 4. Referências visuais

```text
Salvia Kit
Materio Vuetify
Vue Notus
Sneat Vuetify
Publica — referência para login
```

Fluxo visual aprovado:

```text
referências/templates
→ Figma
→ selecionar padrões
→ adaptar ao SGL
→ componentes reutilizáveis
→ Design System mínimo
→ implementação
```

O objetivo não é copiar um template inteiro.

---

# 5. Stack inicial planejada

```text
Vue 3
Vite
TypeScript
Vue Router
Pinia
Axios
Vuetify 3
```

Ferramentas previstas para etapas posteriores:

```text
Vitest
Vue Test Utils
ESLint
Prettier
```

A stack será confirmada formalmente na Etapa 1.4 antes do bootstrap definitivo.

---

# 6. Arquitetura frontend planejada

O padrão oficial do SGL Frontend será:

```text
SPA (Single Page Application)
+ arquitetura por funcionalidades/domínios (feature-based)
+ interface baseada em componentes
+ camadas com responsabilidades explícitas
```

Não será adotado MVC clássico no navegador nem uma estrutura de landing page baseada em `index.html + style.css + script.js` com responsabilidades misturadas.

Estrutura física:

```text
src/
├── app/
├── assets/
│   ├── icons/
│   └── images/
├── components/
│   ├── common/
│   └── feedback/
├── layouts/
├── modules/
│   ├── dashboard/
│   ├── pedidos/
│   ├── estoque/
│   ├── lotes/
│   ├── movimentacoes/
│   ├── documentos/
│   ├── relatorios/
│   └── cadastros/
│       ├── produtos/
│       ├── unidades/
│       ├── laboratorios/
│       ├── projetos/
│       ├── usuarios/
│       └── estagiarios/
├── router/
├── services/
├── stores/
├── types/
├── composables/
├── utils/
└── styles/
```

## 6.1 Responsabilidade de cada camada

```text
View
→ tela/rota completa
→ coordena componentes e o estado local da página

Component
→ bloco reutilizável da interface
→ tabela, filtro, formulário, card, dialog, chip, feedback etc.

Layout
→ estrutura comum entre páginas
→ sidebar, topbar, área de conteúdo e shells de autenticação

Module
→ agrupa tudo que pertence a uma funcionalidade/domínio do SGL
→ Pedidos, Estoque, Relatórios, Cadastros etc.

Service
→ comunicação com backend
→ concentra chamadas Axios e contratos HTTP por domínio

Type
→ representa contratos consumidos/produzidos pelo frontend
→ equivalente conceitual aos DTOs da fronteira da API

Store
→ somente estado realmente compartilhado entre áreas/telas
→ sessão, usuário atual, responsabilidade/permissões e outros estados globais reais

Composable
→ comportamento Vue reutilizável
→ criado somente quando houver repetição real

Router
→ rotas, metadados, guards de UX e ligação URL → View

Assets
→ imagens, logo, ícones e recursos estáticos importados pela aplicação

Styles
→ tokens e regras globais de CSS
→ estilos específicos permanecem próximos dos componentes quando fizer sentido

Utils
→ funções puras auxiliares sem responsabilidade de domínio ou estado Vue
```

Regra mental oficial:

```text
Tela inteira?                    → View
Parte reutilizável da interface? → Component
Comunicação com backend?         → Service
Contrato de dados?               → Type
Estado global real?              → Store
Estrutura comum de páginas?       → Layout
Comportamento Vue reutilizável?   → Composable
Imagem/ícone?                     → Assets
Estilo global?                    → Styles
```

## 6.2 Fluxo de dependência preferencial

O fluxo normal de uma tela será:

```text
View
→ Components
→ Service / Store quando necessário
→ Axios
→ API Spring Boot
```

Uma View pode consumir um Service diretamente quando o dado pertence somente àquela tela. Não transformar toda lista ou formulário em estado global.

Chamadas HTTP não devem ficar espalhadas em componentes visuais:

```text
ERRADO
PedidoTable.vue → axios.get(...)

CERTO
PedidoTable/PedidoView → pedidoService.listar(...)
```

## 6.3 Relação mental com o backend

A equivalência não é literal, mas serve como referência para quem vem de Spring Boot:

| Backend Spring | Frontend Vue |
|---|---|
| Controller | View / rota |
| Service | Service frontend e, quando necessário, Store |
| DTO | Type/interface TypeScript |
| Endpoint REST | método do Service usando Axios |
| Configuração | app/router/configuração do frontend |
| Regra de domínio | continua no backend; frontend apenas representa a UX |

`Repository` não possui equivalente direto no frontend, porque o acesso persistente acontece através da API.

## 6.4 Organização feature-based

O sistema será organizado por funcionalidades reais, e não por uma pasta global gigante de telas.

Exemplo:

```text
modules/pedidos/
├── components/
└── views/
    ├── solicitante/
    └── gestao/
```

A separação Solicitante/Gestão só existe quando a experiência muda. Administração reutiliza os módulos de Gestão e acrescenta os Cadastros; não haverá cópia da aplicação para cada perfil.

## 6.5 Processo padrão para implementar uma tela

Toda tela deve seguir, de forma adaptável, este fluxo:

```text
1. entender a função e o usuário da tela
2. validar wireframe/padrão visual
3. identificar componentes reutilizáveis
4. identificar dados necessários
5. conferir Swagger/OpenAPI
6. definir/reutilizar Types
7. definir/reutilizar Service
8. implementar a View e componentes
9. integrar a API
10. tratar loading / empty / error / success
11. validar o fluxo completo
```

Exemplo conceitual:

```text
MeusPedidosView.vue
→ PedidoTable.vue
→ StatusChip.vue
→ pedidoService.listarPorUsuario()
→ PedidoResponse (TypeScript)
→ GET /api/v1/pedidos/por-usuario
```

## 6.6 O que evitar

```text
não usar MVC clássico apenas por familiaridade com backend
não criar uma pasta js/ separada se a lógica está em TypeScript
não espalhar axios.get/post diretamente pelas Views/Components
não criar Store para todo dado carregado
não criar Composable sem reutilização real
não duplicar módulos por perfil
não criar página para todo endpoint
não misturar regra de domínio do backend com regra visual do frontend
não aplicar arquiteturas excessivamente complexas sem necessidade real
```

A meta é manter uma arquitetura **modular, compreensível e evolutiva**, sem cair nem em uma estrutura simplista de landing page nem em excesso de camadas como DDD/Clean Architecture frontend sem necessidade concreta.

---

# 7. Estratégia de integração com a API

## Configuração

Usar variável de ambiente:

```text
VITE_API_BASE_URL
```

Não espalhar `localhost` pelos componentes.

## Cliente HTTP

Axios centralizado para permitir:

```text
baseURL
headers
interceptors
autenticação futura
normalização de erros
logging de desenvolvimento
```

## Erros

```text
400 → validação / regra de negócio
404 → recurso não encontrado
409 → conflito
500 → falha inesperada
fieldErrors → vincular aos campos quando aplicável
message → mensagem contextual
```

Não exibir stack trace ou detalhes internos.

## Estado assíncrono

Toda tela remota deve prever:

```text
loading
success
empty
error
retry quando fizer sentido
```

## Arquivos

Quando o backend disponibilizar os contratos:

```text
multipart/form-data quando aplicável
nome/tipo/tamanho
progresso de envio quando útil
download seguro
tratamento de arquivo inválido
```

Chamadas de arquivo ficam em services, não diretamente nas views.

---

# 8. Sessão temporária e autenticação futura

Durante o desenvolvimento:

```text
sessão temporária de desenvolvimento
→ usuário/perfil controlado em ponto único
→ UUID público quando a API exigir usuário responsável
→ nenhuma tela depende diretamente do mecanismo temporário
```

Preparar:

```text
auth/session store
route metadata
permission helpers
```

Não tratar segurança visual do frontend como substituta da autorização do backend.

---

# 9. Relatórios e documentos — REQUISITO FUNCIONAL APROVADO

## 9.1 Documentos/anexos

Contextos previstos:

```text
Pedido
→ documentos da solicitação

Produto
→ ficha técnica
→ documentação geral

Lote
→ nota fiscal
→ certificado
→ laudo
→ documento de entrada
→ documentação específica da aquisição
```

O vínculo com `Lote` merece atenção especial porque documentos de compra/recebimento normalmente pertencem à entrada física específica.

Frontend previsto:

- selecionar arquivo;
- upload;
- metadados exigidos pelo contrato;
- listagem;
- visualização;
- download;
- remoção/substituição conforme regra;
- feedback de tipo/tamanho/erro/progresso.

Formatos iniciais desejáveis:

```text
PDF
imagens comuns
```

### Estado atual do backend para arquivos

Foi confirmado na Etapa 1.1:

```text
Pedido possui arquivoDocumento como String ⚠️
não existe endpoint MultipartFile ❌
não existe fluxo real upload/download ❌
não existem documentos de Produto/Lote ❌
```

Portanto, o frontend não deve criar armazenamento fictício local. O design reservará áreas para anexos, mas a funcionalidade definitiva exigirá contrato complementar do backend.

Responsabilidades:

```text
FRONTEND
→ seleção
→ validação inicial de UX
→ upload
→ listagem
→ visualização/download
→ feedback

BACKEND
→ validação definitiva
→ armazenamento
→ metadados
→ vínculo ao recurso
→ autorização
→ upload/download/delete
→ rastreabilidade
```

## 9.2 Relatórios

Relatórios inicialmente previstos:

```text
Estoque
→ saldo por produto/unidade
→ estoque baixo

Lotes
→ lotes por estoque
→ vencidos
→ próximos do vencimento quando houver contrato adequado

Movimentações
→ entradas
→ saídas
→ descartes
→ restaurações/devoluções

Pedidos
→ status
→ usuário
→ laboratório/projeto/período quando suportado

Consumo / materiais recebidos
→ laboratório
→ produto
→ projeto
→ período

Fiscalização / auditoria regulatória
→ somente produtos marcados como sujeitos à fiscalização
→ quantidade por unidade/estoque
→ armazenamento e localização
→ risco
→ lotes/validade quando exigidos
→ entradas/saídas por período
→ demais campos exigidos pelo órgão
```

Formatos desejados:

```text
PDF
CSV e/ou XLSX
```

Regra:

```text
relatório simples já carregado
→ exportação frontend pode ser suficiente

relatório grande/oficial/auditável
→ preferir geração no backend
```

Não duplicar regra de negócio no navegador para produzir relatório.

## 9.3 Relatório regulatório — requisito em descoberta

Antes de implementar a tela/relatório definitivo:

- [ ] obter ou mapear o modelo de informação exigido pelo órgão fiscalizador;
- [ ] confirmar se a fiscalização é por Produto ou por Produto + Unidade/local;
- [ ] confirmar se um produto pode estar submetido a mais de um órgão/regra;
- [ ] definir metadados regulatórios necessários;
- [ ] definir como identificar produtos fiscalizados;
- [ ] confirmar filtros/período exigidos;
- [ ] definir se o relatório é apenas gerado ou também precisa ser registrado como declaração emitida;
- [ ] confirmar necessidade de snapshot histórico do que foi informado;
- [ ] definir formato oficial de saída (PDF, planilha ou outro);
- [ ] criar/adaptar contratos do backend somente após essas respostas.

Direção de UX:

```text
Relatórios
→ Fiscalização / Auditoria
→ selecionar órgão/período/unidade quando aplicável
→ sistema carrega apenas produtos fiscalizados
→ usuário revisa dados consolidados
→ gerar/exportar relatório
→ registrar emissão, se o domínio exigir
```

---

# 10. Etapa 1.1 — Inventário de telas ✅ CONCLUÍDA

Documento detalhado:

- [`docs/INVENTARIO_TELAS.md`](docs/INVENTARIO_TELAS.md)

Controllers analisados:

```text
Pedidos
Estoque Central
Lotes
Movimentações de Estoque
Histórico de Laboratório
Produtos
Projetos
Laboratórios
Unidades
Usuários
Estagiários
```

## Decisões fechadas

```text
Pedido
→ tela de detalhe central

Estoque
→ porta principal para saldo, lotes e operações físicas

Lotes
→ inicialmente dentro de Estoque
→ vencidos como filtro/aba

Movimentações
→ página própria de consulta/auditoria

Histórico de laboratório
→ alimenta relatórios e contextos
→ sem item principal próprio no MVP

Cadastros
→ um único grupo na navegação
→ Produtos, Unidades, Laboratórios, Projetos, Usuários, Estagiários

Documentos
→ contextuais a Pedido/Produto/Lote
→ sem item principal próprio inicialmente

Relatórios
→ central única
→ inclui futura categoria Fiscalização/Auditoria
```

## Mapa principal de navegação resultante

### Solicitante

```text
Dashboard
Pedidos
├── Novo pedido
└── Meus pedidos
    └── Detalhe do pedido
```

### Gestão

```text
Dashboard
Pedidos
Estoque
Movimentações
Relatórios
```

### Administração

```text
Dashboard
Pedidos
Estoque
Movimentações
Relatórios
Cadastros
├── Produtos
├── Unidades
├── Laboratórios
├── Projetos
├── Usuários
└── Estagiários
```

## Cobertura backend identificada

### Cobertura suficiente ✅

```text
novo pedido
meus pedidos
listar/filtrar pedidos
buscar detalhe de pedido
aprovar/rejeitar/entregar/cancelar
estoque central
estoque baixo
lotes por estoque
lotes vencidos
entrada de lote
descarte de vencidos
movimentações e filtros atuais
CRUD Produto
CRUD Unidade
CRUD Laboratório
CRUD Projeto
CRUD/inativação Usuário
gestão de Estagiário
histórico/consumo de laboratório
```

### Cobertura parcial ⚠️

```text
dashboard gestão
→ pode compor dados atuais; agregações podem ser otimizadas depois

lotes próximos do vencimento
→ não há consulta por janela de dias

movimentações por período
→ não há filtro de período atual

pedidos com combinações livres de filtros
→ contratos atuais cobrem apenas combinações específicas

CSV/XLSX/PDF
→ implementação/estratégia ainda será definida por relatório

fiscalização/auditoria regulatória
→ dados operacionais principais já existem
→ falta definir identificação dos produtos fiscalizados e metadados regulatórios
→ pode exigir entidade/contratos complementares no backend
→ eventual snapshot de declaração emitida depende da exigência do órgão
```

### Contrato inexistente ❌

```text
login/autenticação real
→ deliberadamente futuro

upload/download/delete de documentos
metadados de anexos
documentos de Produto/Lote
```

---

# ROADMAP

## Etapa 0 — Transferência backend → frontend ✅

- [x] confirmar encerramento da fase estrutural do backend;
- [x] Swagger/OpenAPI como contrato vivo;
- [x] UUID público como identificador externo;
- [x] decisões visuais iniciais;
- [x] separação solicitante x gestão;
- [x] 404 customizada;
- [x] relatórios e documentos no escopo;
- [x] documentação inicial do frontend.

---

## Etapa 1 — Fundação visual e técnica ⏳ ATUAL

### 1.1 Inventário de telas ✅

- [x] revisar controllers/Swagger;
- [x] mapear funcionalidades para telas reais;
- [x] separar comum/solicitante/gestão/administração;
- [x] incluir relatórios/documentos;
- [x] criar mapa de cobertura frontend ↔ backend;
- [x] identificar contratos complementares;
- [x] criar `docs/INVENTARIO_TELAS.md`.

### 1.2 Fluxos e navegação ⏳ ATUAL

Fechar os caminhos principais antes dos wireframes:

```text
login → dashboard
solicitante → novo pedido → revisão → envio → acompanhamento
gestão → fila → análise → decisão → atualização
estoque → detalhe → lotes → entrada/descarte
pedido/produto/lote → documentos relacionados
relatórios → filtros → resultado → exportação
relatórios → fiscalização/auditoria → revisão → geração/exportação
cadastros → listagem → criar/editar → confirmação
rota inválida → 404 → retorno seguro
```

**Critério:** fluxos sem contradições, origem/destino de cada ação principal definidos e navegação pronta para virar wireframe.

### 1.3 Figma e padrões

Wireframes prioritários:

- login;
- shell/sidebar/topbar;
- dashboard;
- tabela/listagem;
- formulário;
- novo pedido;
- detalhe de pedido;
- estoque/detalhe/lotes;
- movimentações;
- documentos contextuais;
- relatórios;
- relatório regulatório/fiscalização como categoria da central;
- estados loading/empty/error;
- 404.

### 1.4 Confirmar stack

Validar formalmente:

```text
Vue 3 + Vite + TypeScript + Vuetify 3
Vue Router
Pinia
Axios
```

**Critério de conclusão da Etapa 1:** inventário + fluxos + direção visual + stack confirmados.

---

## Etapa 2 — Bootstrap do projeto

- [ ] criar aplicação Vue/Vite;
- [ ] configurar TypeScript;
- [ ] Vuetify;
- [ ] Vue Router;
- [ ] Pinia;
- [ ] Axios;
- [ ] `.env.example`;
- [ ] aliases/imports;
- [ ] estrutura inicial de pastas;
- [ ] lint/format;
- [ ] validar build local.

---

## Etapa 3 — Design System mínimo + shell

- [ ] tokens de cor/tipografia/espaçamento;
- [ ] botões;
- [ ] inputs;
- [ ] cards;
- [ ] tabelas;
- [ ] chips/status;
- [ ] loading/empty/error;
- [ ] alertas/notificações;
- [ ] padrão de upload quando necessário;
- [ ] sidebar/topbar;
- [ ] responsividade base;
- [ ] página 404.

---

## Etapa 4 — Camada de API e contratos

- [ ] `VITE_API_BASE_URL`;
- [ ] cliente Axios central;
- [ ] tipos principais;
- [ ] services por domínio;
- [ ] normalização de erros;
- [ ] `fieldErrors`;
- [ ] sessão temporária centralizada;
- [ ] validar integração real com Swagger;
- [ ] preparar service de arquivos quando houver contrato;
- [ ] incorporar contratos de fiscalização quando a modelagem for aprovada.

---

## Etapa 5 — Fluxo do solicitante

- [ ] dashboard do solicitante;
- [ ] novo pedido;
- [ ] seleção de laboratório/projeto;
- [ ] seleção de materiais/quantidades;
- [ ] revisão;
- [ ] documento do pedido quando suportado;
- [ ] envio/confirmação;
- [ ] meus pedidos;
- [ ] detalhe/status;
- [ ] estados de erro/vazio.

---

## Etapa 6 — Gestão de pedidos

- [ ] fila/pendências;
- [ ] filtros;
- [ ] detalhe/análise;
- [ ] documentos quando suportados;
- [ ] aprovação;
- [ ] rejeição;
- [ ] entrega;
- [ ] cancelamento;
- [ ] feedback de estoque/conflitos;
- [ ] histórico relacionado.

---

## Etapa 7 — Estoque, lotes e movimentações

- [ ] estoque central;
- [ ] filtro unidade/produto;
- [ ] estoque baixo;
- [ ] detalhe de saldo;
- [ ] lotes;
- [ ] vencidos;
- [ ] entrada de lote;
- [ ] descarte;
- [ ] movimentações;
- [ ] documentos Produto/Lote quando suportados;
- [ ] indicadores de atenção úteis.

FEFO/FIFO continuam exclusivamente como regra do backend.

---

## Etapa 8 — Cadastros administrativos

- [ ] Produtos;
- [ ] Unidades;
- [ ] Laboratórios;
- [ ] Projetos;
- [ ] Usuários;
- [ ] Estagiários;
- [ ] identificação/configuração de produtos fiscalizados quando o backend definir o contrato;
- [ ] formulários reutilizáveis;
- [ ] ativação/inativação/encerramento conforme domínio;
- [ ] confirmações para ações relevantes.

---

## Etapa 9 — Relatórios e documentos

### 9.1 Documentos

- [ ] definir/implementar contratos complementares no backend;
- [ ] upload;
- [ ] listagem;
- [ ] visualização/download;
- [ ] remoção/substituição;
- [ ] documentos de Pedido;
- [ ] documentos de Produto;
- [ ] documentos de Lote;
- [ ] tratamento de tipo/tamanho/erro.

### 9.2 Relatórios

- [ ] estoque;
- [ ] lotes/validade;
- [ ] movimentações;
- [ ] pedidos;
- [ ] consumo/materiais recebidos;
- [ ] fiscalização/auditoria regulatória;
- [ ] filtros reutilizáveis;
- [ ] resultado tabular;
- [ ] PDF;
- [ ] CSV e/ou XLSX;
- [ ] impressão quando fizer sentido.

### 9.3 Fiscalização / auditoria

- [ ] confirmar requisito oficial do órgão;
- [ ] definir classificação de produtos fiscalizados;
- [ ] definir metadados regulatórios;
- [ ] cruzar Produto + Estoque + Lote + Movimentações;
- [ ] definir período e campos do relatório;
- [ ] decidir se há registro/snapshot da declaração emitida;
- [ ] implementar exportação no formato exigido;
- [ ] validar rastreabilidade para auditoria.

---

## Etapa 10 — Dashboards finais

Possíveis indicadores:

```text
pedidos pendentes
pedidos por status
estoque com atenção
lotes próximos do vencimento quando suportado
atividade recente relevante
```

Não inventar indicador sem suporte confiável do domínio.

---

## Etapa 11 — Robustez e fechamento

- [ ] responsividade final;
- [ ] acessibilidade básica;
- [ ] teclado nos fluxos essenciais;
- [ ] mensagens consistentes;
- [ ] 400/404/409/500;
- [ ] loading/empty/error em telas remotas;
- [ ] testes de componentes/fluxos críticos;
- [ ] testes de upload/download;
- [ ] validação das exportações;
- [ ] validação do relatório regulatório quando implementado;
- [ ] build de produção;
- [ ] variáveis de ambiente;
- [ ] remover código morto;
- [ ] atualizar documentação.

---

## Etapa 12 — Autenticação/autorização

```text
sessão temporária
→ autenticação local real
→ autorização por perfil/permissão
→ auditoria
→ futura autenticação corporativa
```

Objetivo: realizar a troca sem reconstruir módulos de negócio.

---

# Regras de desenvolvimento

## 1. API é autoridade de negócio

Frontend pode antecipar validações para UX, mas não substitui regras do backend.

## 2. UUID público somente

Nenhum `Long` interno atravessa a interface.

## 3. Componentizar pelo uso real

Evitar abstrações prematuras.

## 4. Separar solicitante de gestão

Navegação e ações devem refletir responsabilidades distintas.

## 5. Estados de tela são funcionalidade

Uma tela não está concluída somente pelo caminho de sucesso.

## 6. Arquivos exigem contrato real

Não usar navegador como repositório definitivo de documentos.

## 7. Relatórios não duplicam regra de negócio

Filtros/apresentação no frontend; regra oficial permanece na API.

## 8. Dados regulatórios não duplicam estoque

A identificação de produto fiscalizado pode ser uma entidade/associação própria, mas quantidade, risco, armazenamento, localização, lotes e movimentações continuam vindo das fontes oficiais já existentes no domínio.

## 9. Arquitetura por funcionalidade

Telas e componentes específicos devem permanecer próximos ao módulo de negócio correspondente. Infraestrutura compartilhada fica nas pastas globais apropriadas.

## 10. HTTP centralizado em Services

Não espalhar Axios pelas Views/Components. A camada visual consome Services e contratos tipados.

## 11. Store somente para estado global real

Dados locais de uma tela não devem virar Pinia automaticamente.

## 12. Não criar página por endpoint

Endpoint de consulta pode alimentar modal, drawer, aba, selector ou detalhe existente.

## 13. Atualizar continuidade ao fechar etapas

Registrar:

```text
o que foi feito
decisões
testes/validações
pendências
próxima ação exata
```

---

# Documentos desta fase

- [`README.md`](README.md)
- [`CONTINUIDADE.md`](CONTINUIDADE.md)
- [`docs/INVENTARIO_TELAS.md`](docs/INVENTARIO_TELAS.md)
- [`docs/FLUXOS_NAVEGACAO.md`](docs/FLUXOS_NAVEGACAO.md)
- [`docs/ESTRUTURA_FRONTEND.md`](docs/ESTRUTURA_FRONTEND.md)

---

# Próxima ação exata

```text
ETAPA 1.2 — FLUXOS E NAVEGAÇÃO / ESTRUTURA

1. integrar o scaffold físico do frontend
2. manter arquitetura SPA + feature-based como padrão oficial
3. avançar para a Etapa 1.3 — Figma e padrões visuais
4. começar pelo shell: sidebar + topbar + conteúdo + breadcrumbs

REQUISITO REGULATÓRIO — PENDENTE DE DESCOBERTA

→ obter o modelo/fields exigidos pelo órgão fiscalizador antes de congelar entidade ou contrato
→ avaliar ProdutoFiscalizado/ProdutoControlado como associação auxiliar
→ avaliar snapshot de RelatorioFiscalizacao somente se a auditoria exigir preservar exatamente o conteúdo declarado
```
