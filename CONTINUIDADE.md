# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Repositório:** `gbsalermo/SGL-FRONTEND`  
**Backend de referência:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 21/08/2026  
**Fase atual:** planejamento inicial do frontend  
**Próxima etapa:** Etapa 1 — fundação visual e técnica

Este arquivo registra decisões, etapas concluídas, arquitetura do frontend e o ponto exato de continuidade. Ele passa a ser o documento principal de acompanhamento desta fase do SGL.

---

## 1. Handoff do backend — CONCLUÍDO

O backend funcional e estrutural do protótipo foi encerrado antes do início deste frontend.

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

Regra de fronteira que o frontend deve respeitar:

```text
Long id
→ interno do backend
→ nunca deve ser usado pela interface

UUID publicId
→ identificador externo
→ URLs, requests, responses e estado do frontend
```

O Swagger/OpenAPI do backend é a referência operacional para endpoints, parâmetros, request bodies, responses e erros. Não manter uma documentação paralela de contratos HTTP neste repositório.

---

## 2. Diretrizes de produto já aprovadas

### Dashboards claros e funcionais

```text
leitura rápida
→ poucos indicadores realmente úteis
→ prioridade por perfil/responsabilidade
→ evitar excesso de cards, gráficos e informação decorativa
```

### Login inspirado no Publica

A tela de login deve preservar familiaridade visual com o Publica, adaptada à identidade do SGL.

A autenticação definitiva ainda não será implementada nesta fase inicial. A interface deve ser criada de forma que o mecanismo temporário de sessão possa ser substituído posteriormente sem refazer as telas.

### Pedidos separados por responsabilidade

Existirão duas experiências distintas:

```text
SOLICITANTE
→ criar pedido
→ acompanhar pedidos próprios
→ consultar status e histórico
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

### Página 404 customizada

Responsabilidade do frontend.

Distinguir:

```text
rota inexistente
→ página 404 própria

recurso inexistente retornado pela API
→ mensagem contextual na própria experiência
→ página, estado vazio, mensagem inline ou notificação conforme o caso
```

---

## 3. Perfis existentes no domínio

O backend possui atualmente:

```text
ADMINISTRADOR
GESTOR
TECNICO
ANALISTA
PESQUISADOR
ESTAGIARIO
```

Nesta fase, o frontend deve primeiro organizar funcionalidades por **responsabilidade de uso** — solicitante, gestão e administração — e não congelar regras de autorização antes da implementação da autenticação.

O mapeamento final entre perfil e permissão será consolidado junto da etapa futura de autenticação/autorização.

---

## 4. Referências visuais registradas

```text
Salvia Kit
Materio Vuetify
Vue Notus
Sneat Vuetify
Publica — referência para login
```

Fluxo aprovado:

```text
referências/templates
→ Figma
→ selecionar padrões
→ adaptar ao SGL
→ componentes reutilizáveis
→ Design System
→ implementação
```

Referências servem para composição, hierarquia e padrões de UX. O objetivo não é copiar um template inteiro.

---

## 5. Stack inicial planejada

Direção técnica inicial:

```text
Vue 3
Vite
TypeScript
Vue Router
Pinia
Axios
Vuetify 3
```

A stack será confirmada tecnicamente na Etapa 1 antes da criação do esqueleto definitivo.

Ferramentas que podem entrar nas etapas posteriores:

```text
Vitest
Vue Test Utils
ESLint
Prettier
```

---

## 6. Arquitetura frontend planejada

Objetivo: separar infraestrutura compartilhada de módulos de negócio.

Estrutura-base sugerida:

```text
src/
├── app/
├── assets/
├── components/
├── layouts/
├── modules/
│   ├── dashboard/
│   ├── pedidos/
│   ├── estoque/
│   ├── lotes/
│   ├── produtos/
│   ├── laboratorios/
│   ├── unidades/
│   ├── projetos/
│   └── usuarios/
├── router/
├── services/
├── stores/
├── types/
├── composables/
├── utils/
└── styles/
```

Regra:

```text
componente compartilhado
→ components

estrutura de página
→ layouts

regra/tela específica de domínio
→ modules

HTTP
→ services

estado global real
→ stores

tipos dos contratos consumidos
→ types ou módulo responsável
```

Evitar criar store global para estado que pode permanecer local ao componente ou módulo.

---

## 7. Estratégia de integração com a API

### Configuração

A URL do backend deve vir de ambiente, por exemplo:

```text
VITE_API_BASE_URL
```

Não espalhar URL fixa de `localhost` pelos componentes.

### Cliente HTTP

Centralizar Axios em um cliente único para permitir posteriormente:

```text
baseURL
headers
interceptors
autenticação
normalização de erros
logging de desenvolvimento
```

### Erros

Tratar de forma consistente os contratos atuais do backend:

```text
400 → validação / regra de negócio
404 → recurso não encontrado
409 → conflito
500 → falha inesperada
fieldErrors → vincular aos campos quando aplicável
message → mensagem contextual para o usuário
```

Não exibir stack trace ou detalhes técnicos internos na interface.

### Estado assíncrono

Toda tela que consome API deve prever:

```text
loading
success
empty
error
retry quando fizer sentido
```

---

## 8. Sessão temporária e autenticação futura

A autenticação local foi deliberadamente deixada para depois do frontend.

Durante o desenvolvimento:

```text
sessão temporária de desenvolvimento
→ usuário/perfil controlado em um ponto único
→ UUID público quando a API exigir usuário responsável
→ nenhuma tela deve depender diretamente do mecanismo temporário
```

Preparar abstrações como:

```text
auth/session store
route metadata
permission helpers
```

Mas não implementar uma segurança fictícia no frontend como substituta da autorização do backend.

---

# ROADMAP

## Etapa 0 — Transferência backend → frontend ✅

- [x] confirmar encerramento da fase estrutural do backend;
- [x] definir Swagger/OpenAPI como contrato vivo;
- [x] registrar uso exclusivo de UUID público;
- [x] trazer decisões visuais já aprovadas;
- [x] registrar separação solicitante x gestão;
- [x] registrar 404 customizada;
- [x] criar repositório e documentação inicial do frontend.

---

## Etapa 1 — Fundação visual e técnica ⏳ ATUAL

### 1.1 Inventário de telas

Definir o mapa mínimo de páginas antes de começar a programar telas isoladas.

Base inicial:

```text
Comum
├── Login
├── Layout principal
├── Dashboard
├── Perfil/sessão temporária
└── 404

Solicitante
├── Novo pedido
├── Meus pedidos
├── Detalhe do pedido
└── Histórico/consultas relacionadas

Gestão
├── Fila de pedidos
├── Detalhe/análise do pedido
├── Estoque
├── Lotes
├── Movimentações
└── Entregas/histórico

Administração / cadastros
├── Produtos
├── Unidades
├── Laboratórios
├── Projetos
└── Usuários
```

O inventário será ajustado de acordo com os endpoints reais expostos no Swagger.

### 1.2 Fluxos e navegação

Desenhar primeiro:

```text
login → dashboard
solicitante → novo pedido → confirmação → acompanhamento
gestão → pendências → análise → decisão → atualização
estoque → produto → lotes/movimentações
rota inválida → 404 → retorno seguro
```

### 1.3 Figma e padrões

Criar os primeiros wireframes do SGL com foco em:

- sidebar/topbar;
- dashboard;
- tabela/listagem;
- formulário;
- detalhe de pedido;
- feedback de status;
- estados vazio/loading/erro;
- login;
- 404.

### 1.4 Confirmar stack

Validar Vue 3 + Vite + TypeScript + Vuetify 3 e registrar qualquer mudança antes do bootstrap.

**Critério de conclusão da Etapa 1:** mapa de telas + fluxo principal + direção visual + stack confirmados.

---

## Etapa 2 — Bootstrap do projeto

- [ ] criar aplicação Vue/Vite;
- [ ] configurar TypeScript;
- [ ] configurar Vuetify;
- [ ] configurar Vue Router;
- [ ] configurar Pinia;
- [ ] configurar Axios;
- [ ] criar `.env.example`;
- [ ] configurar aliases/imports;
- [ ] definir estrutura inicial de pastas;
- [ ] configurar lint/format;
- [ ] validar build local.

**Critério:** aplicação inicia, navega e compila com a infraestrutura base pronta.

---

## Etapa 3 — Design System mínimo + shell da aplicação

- [ ] tokens de cor, tipografia e espaçamento;
- [ ] botões e estados de ação;
- [ ] inputs e validação visual;
- [ ] cards;
- [ ] tabelas;
- [ ] badges/chips de status;
- [ ] feedback de loading;
- [ ] feedback vazio;
- [ ] alertas/notificações;
- [ ] sidebar;
- [ ] topbar;
- [ ] layout responsivo;
- [ ] página 404.

Evitar criar um Design System excessivo antes das necessidades reais aparecerem.

---

## Etapa 4 — Camada de API e contratos

- [ ] configurar `VITE_API_BASE_URL`;
- [ ] criar cliente Axios central;
- [ ] definir tipos principais consumidos da API;
- [ ] criar serviços por domínio;
- [ ] normalizar erros;
- [ ] tratar `fieldErrors`;
- [ ] criar sessão temporária centralizada;
- [ ] validar integração com endpoints reais via Swagger.

**Critério:** pelo menos um fluxo real completo lê/escreve dados no backend sem chamadas HTTP espalhadas pelas views.

---

## Etapa 5 — Fluxo do solicitante

- [ ] dashboard do solicitante;
- [ ] criação de pedido;
- [ ] seleção de laboratório/projeto;
- [ ] seleção e quantidade de materiais;
- [ ] revisão antes do envio;
- [ ] confirmação;
- [ ] listagem de pedidos próprios;
- [ ] detalhe do pedido;
- [ ] visualização clara de status;
- [ ] erros e estados vazios.

Prioridade: este fluxo deve ser simples, rápido e não expor ações de gestão.

---

## Etapa 6 — Fluxo de gestão de pedidos

- [ ] dashboard/fila de pendências;
- [ ] filtros úteis;
- [ ] detalhe completo do pedido;
- [ ] análise das quantidades;
- [ ] aprovação;
- [ ] rejeição;
- [ ] entrega;
- [ ] cancelamento quando permitido;
- [ ] feedback de estoque insuficiente/conflitos;
- [ ] histórico do pedido.

As ações disponíveis devem respeitar o status retornado pela API.

---

## Etapa 7 — Estoque, produtos, lotes e movimentações

- [ ] visão de estoque central;
- [ ] busca/filtro por produto/unidade;
- [ ] detalhe de saldo;
- [ ] lotes;
- [ ] validade;
- [ ] entrada de lote;
- [ ] descarte quando aplicável;
- [ ] movimentações;
- [ ] indicadores de atenção úteis.

FEFO/FIFO são regras do backend. O frontend deve representar o resultado e auxiliar a operação, não duplicar o algoritmo de saída.

---

## Etapa 8 — Cadastros administrativos

- [ ] produtos;
- [ ] unidades;
- [ ] laboratórios;
- [ ] projetos;
- [ ] usuários;
- [ ] formulários reutilizáveis;
- [ ] ativação/inativação quando exposta pela API;
- [ ] confirmação para ações destrutivas/relevantes.

---

## Etapa 9 — Dashboards finais

Construir dashboards a partir das necessidades reais observadas nos módulos implementados.

Possíveis indicadores:

```text
pedidos pendentes
pedidos por status
estoque com atenção
lotes próximos do vencimento, se a API fornecer o dado adequado
atividade recente relevante
```

Não inventar indicadores que o backend não suporte de forma confiável.

---

## Etapa 10 — Robustez e fechamento do frontend

- [ ] responsividade final;
- [ ] acessibilidade básica;
- [ ] navegação por teclado nos fluxos essenciais;
- [ ] mensagens consistentes;
- [ ] tratamento de 400/404/409/500;
- [ ] loading/empty/error em todas as telas remotas;
- [ ] testes dos componentes/fluxos críticos;
- [ ] build de produção;
- [ ] revisão de variáveis de ambiente;
- [ ] revisão de código morto;
- [ ] atualização do README e deste arquivo.

---

## Etapa 11 — Integração com autenticação/autorização

Esta etapa depende da implementação pós-frontend no backend.

Quando o contrato estiver pronto:

```text
sessão temporária
→ autenticação local real
→ autorização por perfil/permissão
→ auditoria
→ futura autenticação corporativa
```

O objetivo da arquitetura atual é permitir essa troca sem reconstruir os módulos de negócio.

---

# Regras de desenvolvimento do frontend

## 1. API é autoridade de negócio

O frontend pode antecipar validações para melhorar UX, mas não substitui regras do backend.

## 2. UUID público somente

Nenhum `Long` interno deve ser introduzido como contrato da interface.

## 3. Componentizar pelo uso real

Criar componente reutilizável quando houver responsabilidade clara ou repetição real; evitar abstrações prematuras.

## 4. Separar solicitante de gestão

A navegação e ações devem refletir responsabilidades distintas.

## 5. Estados de tela são parte da funcionalidade

Não considerar uma tela concluída apenas com o caminho de sucesso.

## 6. Atualizar continuidade ao fechar cada etapa

Registrar:

```text
o que foi feito
decisões tomadas
arquivos/estrutura relevante
testes realizados
pendências
próxima ação exata
```

---

# Próxima ação exata

```text
ETAPA 1.1
→ revisar os endpoints disponíveis no Swagger/backend
→ transformar funcionalidades reais em inventário de telas
→ separar telas comuns, solicitante, gestão e administração
→ fechar o primeiro mapa de navegação do SGL
```

Somente depois avançar para wireframes/Figma e bootstrap técnico, evitando começar o frontend por componentes isolados sem fluxo definido.
