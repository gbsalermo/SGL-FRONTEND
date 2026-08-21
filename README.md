# SGL Frontend — Sistema de Gestão de Laboratórios

Frontend do **SGL (Sistema de Gestão de Laboratórios)**, responsável pela interface de operação do sistema de unidades, laboratórios, projetos, produtos, estoque, lotes e pedidos de materiais.

Este repositório é a continuação da fase de backend do projeto: [gbsalermo/Sistema-SGL](https://github.com/gbsalermo/Sistema-SGL).

## Estado atual

**Fase:** início do planejamento e construção do frontend.

O backend funcional/estrutural do protótipo foi concluído e validado. A API possui documentação OpenAPI/Swagger e passa a ser a referência para endpoints, parâmetros, corpos de requisição, respostas e erros.

A autenticação/autorização local e a auditoria final ficaram deliberadamente para depois da construção do frontend. Nesta fase, a interface deve permanecer desacoplada do mecanismo definitivo de autenticação.

## Objetivos do frontend

- oferecer uma interface clara e funcional para o SGL;
- separar a experiência de quem **solicita materiais** da experiência de quem **faz a gestão** dos pedidos;
- apresentar dashboards úteis e sem excesso de informação;
- facilitar operações de estoque, produtos, lotes, laboratórios, projetos e usuários conforme o perfil;
- tratar carregamento, ausência de dados e erros HTTP de forma consistente;
- possuir página 404 própria para rotas inexistentes;
- consumir apenas os identificadores públicos UUID expostos pela API.

## Direção visual já definida

Referências iniciais:

- Salvia Kit;
- Materio Vuetify;
- Vue Notus;
- Sneat Vuetify;
- interface de login do Publica como referência de familiaridade visual.

Fluxo de design planejado:

```text
referências/templates
→ Figma
→ seleção de padrões
→ adaptação ao fluxo do SGL
→ componentes reutilizáveis
→ Design System
→ implementação
```

## Stack inicial planejada

A direção técnica inicial para o projeto é:

- Vue 3;
- Vite;
- TypeScript;
- Vue Router;
- Pinia;
- Axios;
- Vuetify 3.

A configuração definitiva será consolidada na primeira etapa de implementação, antes de iniciar as telas de negócio.

## Princípios de integração com a API

```text
Frontend
→ consome UUID público
→ nunca depende do Long interno do backend
→ usa Swagger/OpenAPI como contrato vivo
→ centraliza chamadas HTTP
→ trata respostas e erros de forma consistente
```

O frontend não deve duplicar manualmente regras de domínio que pertencem ao backend. Validações de experiência do usuário podem existir na interface, mas a API continua sendo a autoridade das regras de negócio.

## Fluxos principais

### Solicitante

```text
Dashboard
→ criar pedido
→ selecionar laboratório/projeto
→ adicionar materiais
→ enviar pedido
→ acompanhar status
→ consultar histórico
```

### Gestão

```text
Dashboard
→ visualizar pendências
→ analisar pedido
→ aprovar / rejeitar
→ acompanhar separação
→ entregar / cancelar quando aplicável
→ consultar estoque e movimentações
```

## Planejamento

O acompanhamento detalhado das etapas, decisões e ponto exato de continuidade ficará no arquivo [`CONTINUIDADE.md`](CONTINUIDADE.md).

## Backend

Repositório: [Sistema-SGL](https://github.com/gbsalermo/Sistema-SGL)

O backend utiliza Java/Spring Boot, PostgreSQL, Flyway e OpenAPI/Swagger. O frontend deve ser desenvolvido a partir do contrato atual da API, evitando dependência de detalhes internos da implementação.
