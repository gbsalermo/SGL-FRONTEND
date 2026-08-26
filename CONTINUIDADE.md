# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Repositório frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend de referência:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 26/08/2026  
**Fase atual:** Etapa 3 — Interfaces reais  
**Última etapa concluída:** 3.2 — Pedidos do Solicitante  
**Próximo bloco exato:** 3.3 — Interface do Sistema de Gestão

Este arquivo é a fonte principal de retomada do frontend.

---

# 0. Como continuar

Ao abrir uma nova sessão:

```text
1. ler este CONTINUIDADE.md
2. ler docs/ETAPA_2_BOOTSTRAP.md quando precisar da base técnica
3. conferir README.md para visão geral e apresentação visual
4. usar Swagger/OpenAPI como fonte de verdade dos contratos do backend
5. respeitar as decisões visuais e arquiteturais já aprovadas
6. continuar do bloco PRÓXIMO PASSO EXATO
```

Regra de processo atual:

> Não vamos concluir um Figma completo antes de codar. O frontend segue o fluxo `protótipo aprovado → implementação real → extração de componentes quando houver responsabilidade/repetição real → validação → próxima tela`.

---

# 1. Estado geral do projeto

## Backend

O backend estrutural está concluído e permanece como fonte de verdade do domínio.

```text
API REST                                  ✅
Swagger / OpenAPI                         ✅
PostgreSQL                                ✅
Flyway                                    ✅
UUID público na fronteira                 ✅
DTOs request/response separados           ✅
testes principais                         ✅
CORS para frontend local                  ✅
urgência informativa em pedidos           ✅
autenticação + auditoria local            ⏳ pós-frontend inicial
integração corporativa                    ⏳ futura
```

Regra de identificadores:

```text
Long id
→ somente interno ao backend

UUID publicId
→ identidade pública
→ URLs
→ requests
→ responses
→ estado da interface
```

Nunca reconstruir no frontend regras de negócio que já pertencem ao backend.

### Ajuste recente importante no backend

A urgência do pedido continua sendo apenas informativa e não altera automaticamente fluxo, estoque ou prioridade transacional.

O contrato ainda mantém:

```text
urgente
motivoUrgencia
observacao
```

Por compatibilidade com pedidos antigos, `motivoUrgencia` permanece no modelo/banco, mas no fluxo novo ele não é mais obrigatório. A experiência atual concentra o texto livre em `observacao`.

Pedidos antigos que já possuam `motivoUrgencia` devem continuar exibindo essa informação quando necessário.

---

# 2. Stack oficial

```text
Vue 3
Vite
TypeScript 5.9
Vue Router
Pinia
Axios
Vuetify 3
```

Base validada:

```text
npm install                              ✅
npm run type-check                      ✅
npm run dev                             ✅
/ redireciona para /login               ✅
Vuetify carregado                       ✅
Pinia registrado                        ✅
Router funcionando                      ✅
```

Decisões de compatibilidade:

- TypeScript oficial: `~5.9.3`;
- `vue-tsc` 3.3.x;
- `@types/node` instalado;
- aliases via `@` configurados no Vite/TypeScript.

---

# 3. Arquitetura frontend oficial

```text
SPA
+ Feature-based Architecture
+ Component-based UI
+ responsabilidades claras
```

Fluxo preferencial:

```text
View
→ Components
→ Service / Store quando necessário
→ Axios
→ API Spring Boot
```

Estrutura base:

```text
src/
├── app/
├── assets/
├── components/
├── layouts/
├── modules/
├── router/
├── services/
├── stores/
├── types/
├── composables/
├── utils/
└── styles/
```

Regras:

- não espalhar Axios diretamente por Views/Components;
- Store somente para estado realmente compartilhado;
- Composable somente quando houver repetição real;
- não duplicar módulos por perfil;
- Admin reutiliza Gestão + Cadastros;
- regras de negócio permanecem no backend;
- Views representam composição de tela e não devem virar arquivos monolíticos quando houver responsabilidades reais separáveis.

---

# 4. Estratégia de implementação

Fluxo oficial:

```text
protótipo aprovado
→ implementação real
→ identificar responsabilidades/repetição
→ extrair componentes quando fizer sentido
→ validar visual e tecnicamente
→ próxima tela
```

Ordem de trabalho atualizada:

```text
LOGIN                                  ✅
→ PEDIDOS DO SOLICITANTE              ✅
→ GESTÃO                              ⏳ PRÓXIMO
→ ESTOQUE / LOTES / MOVIMENTAÇÕES     ⏳
→ ADMINISTRAÇÃO                       ⏳
→ RELATÓRIOS / DOCUMENTOS             ⏳
→ DASHBOARDS / ROBUSTEZ / 404         ⏳
→ AUTENTICAÇÃO / AUTORIZAÇÃO / AUDITORIA ⏳
```

---

# 5. Identidade visual aprovada

Referência principal:

```text
Publica / Embrapa
```

Objetivo:

```text
clean
corporativo
administrativo/laboratorial
branco predominante
azul institucional como identidade
verde como apoio
```

Paleta:

```text
#1A4DA1  azul principal
#0D2B5E  azul escuro
#2D6BC4  azul claro

#007A3D  verde institucional
#4EA674  verde claro
#A5D6A7  verde suave

#F5F7FA  fundo
#FFFFFF  superfície
#1A1A2E  texto principal
#64748B  texto secundário
#E2E8F0  borda
```

Tipografia:

```text
Inter
fallback Roboto / sans-serif
```

Densidade:

```text
média-compacta
```

Motion aprovado:

```text
fade + deslocamento horizontal curto
~20–30 px
~250–350 ms
shell permanece estável
```

---

# 6. Etapa 3.1 — Login — CONCLUÍDA

## Resultado final

Layout institucional aproximadamente 50/50:

```text
lado esquerdo
→ laboratório/tablet como contexto
→ overlay azul institucional
→ Embrapa
→ logo SGL
→ frase institucional
→ ícones do domínio

lado direito
→ Bem-vindo
→ Acesse o sistema para continuar
→ usuário
→ senha
→ Entrar
```

Estrutura principal:

```text
src/modules/auth/
├── components/
│   ├── LoginBrandPanel.vue
│   └── LoginAccessForm.vue
└── views/
    └── LoginView.vue
```

### Acesso atual

A autenticação definitiva ainda não existe no backend.

Para permitir o desenvolvimento das interfaces, o frontend possui um acesso de desenvolvimento que consulta usuários reais da API e cria sessão local somente em ambiente `DEV`.

Não tratar isso como autenticação de produção.

A etapa futura de autenticação deve substituir esse comportamento sem refazer as telas já aprovadas.

---

# 7. Etapa 3.2 — Pedidos do Solicitante — CONCLUÍDA

Esta etapa foi implementada, validada visualmente e integrada à `main`.

## Fluxo funcional atual

```text
/login
→ sessão de desenvolvimento
→ /meus-pedidos
→ /pedidos/novo
→ POST /pedidos
→ retorno para /meus-pedidos
```

## Shell do solicitante

Arquivo principal:

```text
src/layouts/SolicitanteLayout.vue
```

Características aprovadas:

```text
sidebar azul escura
logo SGL centralizada
Meus pedidos
Novo pedido
bloco do usuário no rodapé
engrenagem de perfil
topbar com laboratório/unidade
botão Sair
```

### Sidebar

A sidebar desktop agora é realmente fixa na viewport:

```text
largura: 258px
position: fixed
height: 100vh
conteúdo principal compensa com margin-left
```

Ao rolar a página, sidebar, navegação e bloco do usuário permanecem estáveis.

No mobile o comportamento volta a ser fluxo normal da página.

## Perfil do solicitante

A engrenagem no bloco do usuário permite personalizar apenas informações visuais:

```text
foto
apelido / nome de exibição
descrição curta
```

Dados institucionais são somente leitura:

```text
nome verdadeiro
e-mail
perfil
```

Estado atual:

- preferências são persistidas localmente no navegador por usuário;
- ainda não existe contrato backend definitivo para avatar/perfil visual;
- não alterar nome verdadeiro, e-mail ou perfil por este fluxo.

Store:

```text
src/stores/profilePreferences.ts
```

## Novo pedido

Arquivo:

```text
src/modules/pedidos/views/solicitante/NovoPedidoView.vue
```

Comportamentos validados:

- laboratório e unidade vêm da sessão;
- projeto é opcional;
- produtos disponíveis vêm do estoque da unidade;
- usuário pode adicionar múltiplos produtos;
- o mesmo produto não pode aparecer duas vezes no mesmo pedido;
- ao selecionar um produto ele desaparece das demais opções;
- ao remover o item o produto volta para a lista;
- quantidade é ajustada na própria linha;
- urgência é informativa;
- texto livre foi unificado em uma única caixa `Observação / descrição`;
- ao marcar urgência aparece apenas um aviso pedindo, se possível, que o motivo seja explicado nessa caixa;
- pedido continua sendo criado como `PENDENTE`.

Mensagem aprovada no rodapé:

```text
O pedido ficará pendente até análise da gestão.
Marque o pedido como urgente apenas quando necessário.
```

## Meus pedidos

Arquivo:

```text
src/modules/pedidos/views/solicitante/MeusPedidosView.vue
```

Características aprovadas:

```text
cards de resumo
→ Pendentes
→ Aprovados
→ Entregues

busca local
filtro por status
tabela de pedidos
```

A tabela prioriza o que interessa ao solicitante:

```text
Data
Produtos
Itens
Status
Laboratório
Detalhes
```

Produtos são informação principal. Projeto aparece como informação secundária.

A busca considera, entre outros:

```text
produto
projeto
laboratório
status
urgência
observação
```

### Urgência

Status visual:

```text
PENDENTE       → chip amarelo
PEDIDO URGENTE → chip vermelho
```

Pedidos antigos criados antes da migration de urgência naturalmente não possuem `urgente = true`.

### Detalhes do pedido

O antigo modal foi removido.

Agora existe uma seta na própria linha da tabela:

```text
clicar
→ expande a linha
→ mostra detalhes abaixo do pedido
clicar novamente
→ recolhe
```

Detalhes exibidos:

```text
materiais e quantidades
status
projeto
laboratório
indicação de urgência
observação / descrição
```

Pedidos antigos que possuam `motivoUrgencia` separado têm esse conteúdo preservado na área textual do detalhe.

---

# 8. Regras importantes do domínio para o frontend

## Pedidos

```text
PENDENTE
→ APROVADO
   → ENTREGUE
   → CANCELADO

PENDENTE
→ REJEITADO
```

Regras críticas:

- aprovação pode ajustar quantidade aprovada;
- backend executa FEFO/FIFO e baixa de estoque;
- entrega não baixa estoque novamente;
- cancelamento restaura os lotes exatos;
- produto duplicado no mesmo pedido é proibido também no backend;
- usuário inativo não pode criar pedido;
- laboratório/projeto inativos também são validados pelo backend;
- frontend deve antecipar erros de UX, mas não substituir validação de domínio.

### Estagiário inativo

A proteção já existe:

```text
PedidoService.criar
→ usuario.validateActive()
```

O login temporário do frontend também não deve permitir trabalhar com usuário inativo.

Atenção futura: `dataFimEstagio` sozinha não é a regra final de bloqueio; o domínio atualmente depende do estado `ativo` do usuário/estagiário.

## Documentos

- backend ainda não possui upload multipart completo;
- não criar persistência fake no frontend.

## Fiscalização

- deve ficar dentro de Relatórios → Fiscalização/Auditoria;
- não duplicar dados operacionais;
- modelagem definitiva aguarda requisito oficial.

---

# 9. Navegação funcional aprovada

## Solicitante — implementado

```text
Meus pedidos
├── detalhes expansíveis
└── Novo pedido
```

## Gestão — próximo foco

```text
Dashboard
├── Pedidos
├── Estoque
│   └── Detalhe
│       ├── Lotes
│       ├── Entrada
│       ├── Descarte
│       └── Documentos
├── Movimentações
└── Relatórios
```

## Administração

```text
Tudo da Gestão
└── Cadastros
    ├── Produtos
    ├── Unidades
    ├── Laboratórios
    ├── Projetos
    ├── Usuários
    └── Estagiários
```

Rotas planejadas/atuais:

```text
/login
/meus-pedidos
/pedidos/novo
/dashboard
/pedidos
/pedidos/:id
/estoque
/estoque/:id
/movimentacoes
/relatorios
/cadastros/produtos
/cadastros/unidades
/cadastros/laboratorios
/cadastros/projetos
/cadastros/usuarios
/cadastros/estagiarios
/:pathMatch(.*)*
```

---

# 10. Modelo visual aprovado para o Sistema de Gestão

A próxima interface NÃO deve reutilizar cegamente o shell simplificado do solicitante.

Usar o modelo de gestão já aprovado anteriormente como referência estrutural:

```text
sidebar escura institucional
logo SGL no topo
navegação mais completa
bloco de usuário no rodapé

topbar escura
contexto / ações globais
sair

conteúdo branco/cinza muito claro
breadcrumbs
título + subtítulo
botão de ação principal
cards quando fizerem sentido
busca local
filtros expansíveis
tabelas densidade média-compacta
status em chips
linhas/detalhes expansíveis quando ajudar a leitura
```

Referência funcional do menu de Gestão:

```text
PRINCIPAL
Dashboard
Pedidos
Estoque
Movimentações
Relatórios
```

Administração acrescenta:

```text
ADMINISTRAÇÃO
Cadastros
```

Alertas operacionais previstos para Gestão/Admin:

```text
Pedidos pendentes
Estoque baixo
Próximos do vencimento
Vencidos
```

Sem transformar a tela em dashboard excessivamente moderno. Manter linguagem institucional e funcional.

---

# 11. Padrões de shell para Gestão/Admin

Sidebar de gestão:

```text
aberta ~240–258 px
recolhida ~64–72 px
clique para recolher/expandir
não expandir sidebar inteira por hover
mobile → drawer/overlay
```

Topbar:

```text
contexto | espaço | pesquisa global futura | sair
```

Busca/filtros:

```text
busca global → topbar quando implementada
busca local → página
filtros locais → botão Filtros / área expansível
```

Alertas:

```text
azul      nenhuma pendência
amarelo   atenção
vermelho  urgência
```

---

# 12. Método para implementar cada tela

```text
1. entender função e usuário
2. conferir referência visual aprovada
3. identificar componentes reais
4. identificar dados necessários
5. conferir Swagger/OpenAPI
6. criar/reutilizar Types
7. criar/reutilizar Services
8. implementar View/Components
9. integrar API quando aplicável
10. tratar loading/empty/error/success
11. validar fluxo completo
```

Fluxo de trabalho preferido:

```text
mudança pequena
→ assistente explica exatamente a alteração
→ alteração pode ser feita localmente

mudança estrutural
→ pode ser feita diretamente na branch/repositório quando solicitado
```

---

# 13. Roadmap atualizado

```text
Etapa 0 — Handoff backend → frontend                    ✅
Etapa 1 — Fundação visual/técnica essencial             ✅
  1.1 Inventário                                        ✅
  1.2 Fluxos                                            ✅
  1.3 Figma completo                                    ⏭️ substituído por implementação direta
  1.4 Stack                                             ✅

Etapa 2 — Bootstrap técnico                             ✅

Etapa 3 — Interfaces reais                              🟡 ATUAL
  3.1 Login                                             ✅ CONCLUÍDO
  3.2 Pedidos do Solicitante                            ✅ CONCLUÍDO
  3.3 Interface do Sistema de Gestão                    ⏳ PRÓXIMO

Etapa 4 — Estoque / Lotes / Movimentações              ⏳
Etapa 5 — Administração                                 ⏳
Etapa 6 — Relatórios / Documentos / Fiscalização        ⏳
Etapa 7 — Dashboards finais / robustez / 404             ⏳
Etapa 8 — Autenticação / autorização / auditoria        ⏳
```

---

# 14. Documentos importantes

```text
CONTINUIDADE.md
→ fonte principal de retomada

README.md
→ visão geral e apresentação visual

docs/ETAPA_2_BOOTSTRAP.md
→ stack, bootstrap, compatibilidade e validação

docs/IDENTIDADE_VISUAL.md
→ identidade, paleta, densidade e motion

docs/ICONOGRAFIA.md
→ ícones e microinterações

docs/SIDEBAR_ALERTAS.md
→ sidebar e alertas operacionais

docs/SHELL_VISUAL.md
→ shell, sidebar e topbar

docs/PADROES_PAGINA.md
→ conteúdo, breadcrumbs, busca e filtros

docs/ESTRUTURA_FRONTEND.md
→ arquitetura física
```

---

# 15. PRÓXIMO PASSO EXATO — PARA O PRÓXIMO CHAT

Não refazer Login nem Pedidos do Solicitante.

Ambos estão encerrados e integrados à `main`.

O próximo chat deve começar por:

```text
ETAPA 3.3 — INTERFACE DO SISTEMA DE GESTÃO
```

## Primeiro objetivo

Criar a base visual/estrutural da Gestão usando o modelo já aprovado anteriormente.

Começar pelo shell da Gestão e pela tela de Pedidos da Gestão — NÃO pela gestão de estoque ainda.

Sequência recomendada:

```text
1. criar branch a partir da main
   sugestão: feat/gestao-interface

2. ler:
   CONTINUIDADE.md
   docs/SHELL_VISUAL.md
   docs/SIDEBAR_ALERTAS.md
   docs/PADROES_PAGINA.md

3. conferir no Swagger os endpoints reais de pedidos usados pela gestão

4. implementar primeiro:
   GestaoLayout.vue
   ↓
   sidebar completa de Gestão
   ↓
   topbar
   ↓
   PedidosGestaoView.vue

5. Pedidos da Gestão deve permitir visualizar/filtrar pedidos do sistema
   e preparar as ações de análise previstas pelo backend

6. somente depois avançar para Estoque / Lotes / Movimentações
```

## Direção visual da primeira tela de Gestão

Usar como base o modelo aprovado já discutido:

```text
sidebar escura
logo SGL
Dashboard
Pedidos
Estoque
Movimentações
Relatórios

área principal clara
breadcrumb
Título: Pedidos
subtítulo operacional
botão de ação apenas quando fizer sentido
busca
filtros
lista/tabela de pedidos
chips de status
urgência destacada
linhas/detalhes expansíveis ou painel contextual conforme a tela exigir
```

O foco da Gestão é diferente do Solicitante:

```text
Solicitante
→ criar e acompanhar o próprio pedido

Gestão
→ enxergar pedidos do sistema
→ filtrar/priorizar
→ analisar
→ aprovar/rejeitar conforme contrato real
→ posteriormente conectar estoque/movimentações
```

Não inventar ações ou campos. Antes de implementar aprovação/rejeição, confirmar exatamente os DTOs e endpoints no Swagger/backend.

---

# 16. Estado dos branches após encerramento deste bloco

As alterações aprovadas foram integradas à `main`.

Frontend:

```text
feat/perfil-solicitante
→ merge/fast-forward para main concluído
```

Backend:

```text
feat/urgencia-observacao-unificada
→ merge/fast-forward para main concluído
```

A `main` de ambos os repositórios é agora a base oficial para continuar o desenvolvimento.
