<a id="readme-top"></a>

<!-- HERO SECTION -->
<div align="center">
  <a href="https://github.com/gbsalermo/SGL-FRONTEND">
    <img src="https://raw.githubusercontent.com/gbsalermo/Sistema-SGL/main/docs/LOGO.png" alt="SGL Logo" width="260" height="auto">
  </a>

  <h1 align="center">SGL — Sistema de Gestão de Laboratórios</h1>

  <p align="center">
    <strong>Frontend corporativo para operação do SGL, reunindo pedidos, estoque, lotes, produtos, laboratórios, projetos, relatórios e rotinas administrativas em uma interface clara, funcional e orientada ao perfil do usuário.</strong>
  </p>

  <p align="center">
    <a href="https://github.com/gbsalermo/Sistema-SGL"><strong>Ver Backend »</strong></a>
    ·
    <a href="http://localhost:8080/swagger-ui/index.html">Explorar Swagger UI</a>
    ·
    <a href="#-roadmap">Acompanhar Roadmap</a>
  </p>

  <!-- BADGES -->
  <p align="center">
    <a href="https://vuejs.org/"><img src="https://img.shields.io/badge/Vue.js-3-42B883?style=for-the-badge&logo=vuedotjs&logoColor=white" alt="Vue.js"></a>
    <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-Frontend-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Planned-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
    <a href="https://vuetifyjs.com/"><img src="https://img.shields.io/badge/Vuetify-3-1867C0?style=for-the-badge&logo=vuetify&logoColor=white" alt="Vuetify"></a>
    <a href="https://pinia.vuejs.org/"><img src="https://img.shields.io/badge/Pinia-State-FADA5E?style=for-the-badge&logo=vuedotjs&logoColor=black" alt="Pinia"></a>
    <a href="https://axios-http.com/"><img src="https://img.shields.io/badge/Axios-HTTP-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios"></a>
    <img src="https://img.shields.io/badge/Status-Frontend%20em%20Planejamento-orange?style=for-the-badge" alt="Status">
  </p>
</div>

<br />

<!-- QUICK NAVIGATION -->
<div align="center">
  <a href="#-sobre-o-projeto">Sobre o Projeto</a> •
  <a href="#-experiência-por-perfil">Perfis</a> •
  <a href="#-tecnologias-planejadas">Tecnologias</a> •
  <a href="#-escopo-funcional">Funcionalidades</a> •
  <a href="#-arquitetura-do-frontend">Arquitetura</a> •
  <a href="#-integração-com-a-api">API</a> •
  <a href="#-roadmap">Roadmap</a> •
  <a href="#-autor">Autor</a>
</div>

<br />

---

<!-- TABLE OF CONTENTS -->
<details>
  <summary>📋 <strong>Tabela de Conteúdos (Clique para expandir)</strong></summary>
  <ol>
    <li>
      <a href="#-sobre-o-projeto">Sobre o Projeto</a>
      <ul>
        <li><a href="#-objetivo-da-interface">Objetivo da Interface</a></li>
        <li><a href="#-direção-visual">Direção Visual</a></li>
      </ul>
    </li>
    <li><a href="#-experiência-por-perfil">Experiência por Perfil</a></li>
    <li><a href="#-tecnologias-planejadas">Tecnologias Planejadas</a></li>
    <li><a href="#-escopo-funcional">Escopo Funcional</a></li>
    <li><a href="#-arquitetura-do-frontend">Arquitetura do Frontend</a></li>
    <li><a href="#-fluxos-principais">Fluxos Principais</a></li>
    <li><a href="#-integração-com-a-api">Integração com a API</a></li>
    <li><a href="#-estados-de-interface-e-erros">Estados de Interface e Erros</a></li>
    <li><a href="#-começando">Começando</a></li>
    <li><a href="#-roadmap">Roadmap</a></li>
    <li><a href="#-backend-e-documentação">Backend e Documentação</a></li>
    <li><a href="#-autor">Autor</a></li>
  </ol>
</details>

---

## 📌 Sobre o Projeto

O **SGL Frontend** é a camada de interface do **Sistema de Gestão de Laboratórios**, responsável por transformar as regras e contratos do backend em fluxos operacionais simples para pesquisadores, solicitantes e responsáveis pela gestão de materiais.

O frontend faz parte do mesmo ecossistema do repositório principal [`Sistema-SGL`](https://github.com/gbsalermo/Sistema-SGL), cujo backend em Java/Spring Boot já fornece a API REST e a documentação OpenAPI/Swagger utilizadas como contrato de integração.

> [!NOTE]
> Esta etapa parte de um backend funcional e documentado. A interface não deve recriar regras de domínio já existentes na API; o objetivo é oferecer uma experiência de uso consistente sobre os contratos atuais do sistema.

### 🎯 Objetivo da Interface

O frontend deve:

- apresentar **dashboards claros e funcionais**, sem excesso de informação;
- separar a experiência de quem **solicita materiais** daquela de quem **faz a gestão**;
- facilitar a consulta e operação de produtos, lotes, estoque, laboratórios, projetos e pedidos;
- oferecer feedback visual consistente para carregamento, sucesso, erro e ausência de dados;
- disponibilizar relatórios e operações documentais de forma integrada aos fluxos do sistema;
- possuir tratamento próprio para rotas inexistentes, incluindo uma **página 404 customizada**;
- permanecer desacoplado do mecanismo definitivo de autenticação até a etapa específica de segurança.

---

### 🎨 Direção Visual

A identidade visual deve manter uma aparência corporativa, limpa e adequada a um ambiente administrativo/laboratorial, priorizando legibilidade, hierarquia visual e rapidez de operação.

Referências iniciais de interface:

- **Salvia Kit**;
- **Materio Vuetify**;
- **Vue Notus**;
- **Sneat Vuetify**;
- interface de login do **Publica** como referência de familiaridade visual institucional.

Fluxo planejado de design:

```text
Referências / Templates
        ↓
       Figma
        ↓
Seleção de padrões visuais
        ↓
Adaptação aos fluxos do SGL
        ↓
Componentes reutilizáveis
        ↓
     Design System
        ↓
    Implementação
```

<p align="right">(<a href="#readme-top">voltar ao topo ⬆</a>)</p>

---

## 👥 Experiência por Perfil

A interface será organizada principalmente em duas experiências operacionais.

### 👤 Solicitante

Voltada a pesquisadores, integrantes de laboratórios e usuários responsáveis por solicitar materiais.

Principais necessidades:

- visualizar informações relevantes do próprio contexto;
- criar e acompanhar pedidos;
- selecionar laboratório e projeto quando aplicável;
- consultar status e histórico de solicitações;
- acessar materiais efetivamente recebidos;
- anexar ou consultar documentos quando o fluxo exigir.

### 🧑‍💼 Gestão

Voltada aos usuários responsáveis por estoque, aprovação e administração do sistema.

Principais necessidades:

- visualizar pendências e indicadores operacionais;
- analisar pedidos;
- aprovar, rejeitar, entregar ou cancelar pedidos conforme as regras disponíveis;
- consultar estoque consolidado e lotes físicos;
- acompanhar validade, disponibilidade e movimentações;
- administrar cadastros permitidos pelo perfil;
- acessar relatórios e documentos relacionados às operações.

> [!IMPORTANT]
> A separação de experiência não significa duplicar o sistema. O objetivo é compartilhar componentes e infraestrutura, alterando navegação, ações disponíveis e prioridade das informações conforme o perfil do usuário.

<p align="right">(<a href="#readme-top">voltar ao topo ⬆</a>)</p>

---

## 🛠️ Tecnologias Planejadas

A configuração definitiva será consolidada na etapa inicial de implementação. A direção técnica atual é:

| Categoria | Tecnologia | Finalidade |
|---|---|---|
| **Framework** | ![Vue](https://img.shields.io/badge/Vue.js_3-42B883?style=flat-square&logo=vuedotjs&logoColor=white) | Construção da interface baseada em componentes |
| **Build Tool** | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | Ambiente de desenvolvimento e build |
| **Linguagem** | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | Tipagem estática e contratos mais seguros no frontend |
| **UI Framework** | ![Vuetify](https://img.shields.io/badge/Vuetify_3-1867C0?style=flat-square&logo=vuetify&logoColor=white) | Componentes visuais e base do Design System |
| **Rotas** | ![Vue Router](https://img.shields.io/badge/Vue_Router-42B883?style=flat-square&logo=vuedotjs&logoColor=white) | Navegação e controle de rotas |
| **Estado Global** | ![Pinia](https://img.shields.io/badge/Pinia-FADA5E?style=flat-square&logo=vuedotjs&logoColor=black) | Gerenciamento de estado compartilhado |
| **HTTP Client** | ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white) | Comunicação centralizada com a API REST |
| **Contrato da API** | ![Swagger](https://img.shields.io/badge/OpenAPI_3.0-Swagger_UI-85EA2D?style=flat-square&logo=swagger&logoColor=black) | Referência para endpoints, DTOs, parâmetros e respostas |

<p align="right">(<a href="#readme-top">voltar ao topo ⬆</a>)</p>

---

## ✨ Escopo Funcional

### Estrutura e navegação

- [ ] Layout base da aplicação;
- [ ] navegação lateral/superior de acordo com o perfil;
- [ ] breadcrumbs quando úteis ao fluxo;
- [ ] sistema consistente de títulos, ações e filtros;
- [ ] página 404 customizada;
- [ ] responsividade para diferentes tamanhos de tela.

### Dashboards

- [ ] dashboard do solicitante;
- [ ] dashboard de gestão;
- [ ] indicadores de pedidos pendentes;
- [ ] visão resumida de estoque;
- [ ] alertas para lotes críticos ou próximos do vencimento quando disponibilizados pela API;
- [ ] atalhos para ações frequentes.

### Pedidos

- [ ] criação de pedido;
- [ ] seleção de laboratório e projeto;
- [ ] inclusão e remoção de itens;
- [ ] acompanhamento de status;
- [ ] análise do pedido pela gestão;
- [ ] aprovação e rejeição;
- [ ] entrega e cancelamento quando permitidos;
- [ ] consulta ao histórico.

### Estoque e materiais

- [ ] consulta de produtos;
- [ ] consulta de estoque central;
- [ ] consulta e gestão de lotes conforme permissões;
- [ ] visualização de validade e disponibilidade;
- [ ] consulta de movimentações de estoque;
- [ ] formulários administrativos necessários ao fluxo.

### Estrutura organizacional

- [ ] unidades;
- [ ] laboratórios;
- [ ] projetos;
- [ ] usuários e perfis quando a etapa de autenticação/autorização for integrada.

### Relatórios e documentos

- [ ] relatórios por laboratório e projeto;
- [ ] consulta de materiais efetivamente recebidos;
- [ ] exportação/geração de relatórios quando prevista pelo contrato da API;
- [ ] suporte visual para envio, consulta e download de arquivos vinculados a produtos, lotes ou pedidos quando aplicável.

<p align="right">(<a href="#readme-top">voltar ao topo ⬆</a>)</p>

---

## 🏛️ Arquitetura do Frontend

A proposta é manter a aplicação organizada por responsabilidades, com componentes reutilizáveis e acesso à API centralizado.

```text
┌─────────────────────────────────────────────────────────────┐
│                        Views / Pages                        │
│         Dashboard · Pedidos · Estoque · Cadastros          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Components / Design UI                    │
│      Tabelas · Formulários · Cards · Dialogs · Feedback     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Stores / Composables / Router               │
│          Estado compartilhado e regras de interface         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Services / HTTP Client                   │
│              Axios + tratamento padronizado                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    SGL Backend REST API                     │
│                   OpenAPI / Swagger                        │
└─────────────────────────────────────────────────────────────┘
```

Estrutura inicial esperada:

```text
src/
├── assets/
├── components/
├── layouts/
├── views/
├── router/
├── stores/
├── services/
├── composables/
├── types/
└── utils/
```

A organização poderá evoluir conforme os primeiros módulos forem implementados e o padrão real de reutilização ficar claro.

<p align="right">(<a href="#readme-top">voltar ao topo ⬆</a>)</p>

---

## 🔄 Fluxos Principais

### 👤 Fluxo do Solicitante

```text
Dashboard
   ↓
Criar Pedido
   ↓
Selecionar Laboratório / Projeto
   ↓
Adicionar Materiais
   ↓
Revisar Solicitação
   ↓
Enviar Pedido
   ↓
Acompanhar Status
   ↓
Consultar Histórico / Recebimentos
```

### 🧑‍💼 Fluxo de Gestão

```text
Dashboard
   ↓
Visualizar Pendências
   ↓
Analisar Pedido
   ↓
Aprovar ──────┬────── Rejeitar
   ↓           │
Separação      │
   ↓           │
Entregar       │
   ↓           │
Histórico      └────── Encerramento do fluxo
```

Além dos pedidos, a gestão terá acesso aos módulos administrativos e de estoque conforme o perfil configurado no sistema.

<p align="right">(<a href="#readme-top">voltar ao topo ⬆</a>)</p>

---

## 🔌 Integração com a API

O frontend utiliza o backend como **fonte oficial das regras de negócio**.

```text
Frontend
   ↓
consome identificadores públicos UUID
   ↓
centraliza requisições HTTP
   ↓
segue contratos do Swagger / OpenAPI
   ↓
interpreta respostas e erros padronizados
   ↓
renderiza o estado correto da interface
```

### Princípios obrigatórios

- consumir apenas os **identificadores públicos expostos pela API**;
- não depender de IDs `Long` internos do backend;
- utilizar Swagger/OpenAPI como contrato vivo para endpoints e DTOs;
- centralizar a configuração do Axios e a URL base da API;
- evitar chamadas HTTP diretamente espalhadas pelos componentes;
- não duplicar regras de domínio como FEFO/FIFO, aprovação ou estorno no frontend;
- permitir validações de UX no formulário sem substituir a validação do backend;
- tratar erros HTTP de forma previsível e reutilizável.

### Ambiente local previsto

Backend em execução:

```text
http://localhost:8080
```

Swagger UI:

```text
http://localhost:8080/swagger-ui/index.html
```

> [!TIP]
> Durante o desenvolvimento das telas, sempre valide o contrato atual no Swagger antes de criar ou alterar services, types e formulários no frontend.

<p align="right">(<a href="#readme-top">voltar ao topo ⬆</a>)</p>

---

## ⚠️ Estados de Interface e Erros

O projeto deve possuir tratamento visual consistente para os estados mais comuns:

| Estado | Comportamento esperado |
|---|---|
| **Loading** | Skeleton, spinner ou estado equivalente sem travar a interface |
| **Empty** | Mensagem clara e ação contextual quando aplicável |
| **Success** | Feedback curto confirmando a operação |
| **Validation Error** | Erros próximos aos campos relacionados |
| **400 / Regra de negócio** | Exibir mensagem retornada pela API de forma compreensível |
| **401 / 403** | Fluxo integrado à autenticação/autorização quando implementado |
| **404 de recurso** | Estado contextual dentro da página |
| **404 de rota** | Página própria do frontend |
| **500 / indisponibilidade** | Feedback de erro com possibilidade de nova tentativa quando adequada |

<p align="right">(<a href="#readme-top">voltar ao topo ⬆</a>)</p>

---

## 🚀 Começando

O repositório encontra-se atualmente na etapa de planejamento do frontend. A estrutura Vue será criada na primeira fase de implementação.

### Pré-requisitos planejados

- **Node.js** em versão LTS compatível com a stack definida;
- **npm**;
- **Git**;
- backend do SGL disponível para integração;
- acesso ao Swagger/OpenAPI do backend.

### Instalação

Após a criação da base Vue/Vite, o fluxo padrão será documentado nesta seção, incluindo:

```bash
git clone https://github.com/gbsalermo/SGL-FRONTEND.git
cd SGL-FRONTEND
npm install
npm run dev
```

> [!WARNING]
> Os comandos acima representam o fluxo planejado. A configuração definitiva de scripts e versões será registrada após o bootstrap oficial do projeto.

<p align="right">(<a href="#readme-top">voltar ao topo ⬆</a>)</p>

---

## 🗺️ Roadmap

- [x] **Fase 0: Planejamento do Frontend**
  - [x] definição inicial dos fluxos de solicitante e gestão;
  - [x] definição das referências visuais;
  - [x] definição preliminar da stack;
  - [x] definição do Swagger/OpenAPI como contrato de integração;
  - [x] definição de página 404 e tratamento consistente de estados da interface.

- [ ] **Fase 1: Fundação Técnica**
  - [ ] bootstrap Vue 3 + Vite + TypeScript;
  - [ ] configuração do Vuetify;
  - [ ] Vue Router;
  - [ ] Pinia;
  - [ ] Axios e service base;
  - [ ] organização inicial de pastas;
  - [ ] variáveis de ambiente.

- [ ] **Fase 2: Design System e Estrutura Global**
  - [ ] identidade visual do SGL;
  - [ ] layout principal;
  - [ ] login baseado na familiaridade visual do Publica;
  - [ ] componentes reutilizáveis;
  - [ ] padrões de tabela, filtros, formulários e dialogs;
  - [ ] loading, empty states, feedback e página 404.

- [ ] **Fase 3: Experiência do Solicitante**
  - [ ] dashboard;
  - [ ] criação de pedidos;
  - [ ] seleção de laboratório/projeto;
  - [ ] acompanhamento de status;
  - [ ] histórico e materiais recebidos.

- [ ] **Fase 4: Experiência de Gestão**
  - [ ] dashboard administrativo;
  - [ ] fila de pedidos;
  - [ ] análise, aprovação e rejeição;
  - [ ] entrega e cancelamento;
  - [ ] consultas operacionais.

- [ ] **Fase 5: Estoque e Cadastros**
  - [ ] produtos;
  - [ ] estoque central;
  - [ ] lotes;
  - [ ] movimentações;
  - [ ] unidades, laboratórios e projetos.

- [ ] **Fase 6: Relatórios e Arquivos**
  - [ ] relatórios por laboratório/projeto;
  - [ ] geração/exportação quando suportada pela API;
  - [ ] fluxos de upload e consulta de documentos quando aplicáveis.

- [ ] **Fase 7: Autenticação, Autorização e Auditoria Final**
  - [ ] integração com o mecanismo definitivo de autenticação;
  - [ ] aplicação real das permissões por perfil;
  - [ ] associação automática do usuário autenticado às operações auditáveis.

<p align="right">(<a href="#readme-top">voltar ao topo ⬆</a>)</p>

---

## 📚 Backend e Documentação

### Backend oficial

📦 [`gbsalermo/Sistema-SGL`](https://github.com/gbsalermo/Sistema-SGL)

O backend utiliza **Java, Spring Boot, PostgreSQL, Flyway e OpenAPI/Swagger** e deve ser tratado como a autoridade para regras de domínio e contratos HTTP.

### Swagger

Com o backend rodando localmente:

👉 [`http://localhost:8080/swagger-ui/index.html`](http://localhost:8080/swagger-ui/index.html)

### Continuidade do desenvolvimento

O ponto exato de continuidade, decisões tomadas e alterações de planejamento deverão permanecer documentados no arquivo `CONTINUIDADE.md` do frontend assim que ele estiver versionado neste repositório.

<p align="right">(<a href="#readme-top">voltar ao topo ⬆</a>)</p>

---

## 👨‍💻 Autor

Desenvolvido por **Gabriel Salermo**.

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/gbsalermo)

<p align="right">(<a href="#readme-top">voltar ao topo ⬆</a>)</p>
