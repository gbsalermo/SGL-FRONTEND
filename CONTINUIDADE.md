# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Repositório frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend de referência:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 21/08/2026  
**Fase atual:** Etapa 1 — Fundação visual e técnica  
**Subetapa atual:** 1.3 — Figma e padrões visuais  
**Próximo bloco exato:** componentes reutilizáveis + estados padrão de interface

Este documento é a **fonte principal de continuidade** do frontend. Ele deve permitir que o projeto seja retomado por outra sessão, outra pessoa ou outra IA sem depender do histórico completo da conversa.

---

# 0. Como continuar a partir deste arquivo

Antes de implementar qualquer coisa:

```text
1. ler este CONTINUIDADE.md
2. conferir o README.md
3. consultar o documento específico da etapa quando necessário
4. conferir Swagger/OpenAPI antes de assumir contrato de backend
5. respeitar as decisões visuais já fechadas
6. continuar exatamente do bloco marcado como PRÓXIMO PASSO
```

Regra de processo atual:

> Durante a Etapa 1.3 trabalhamos primeiro os conceitos e padrões visuais. Não transformar cada decisão em CSS/Vue imediatamente. A implementação vem depois, seguindo a arquitetura oficial.

---

# 1. Estado herdado do backend — CONCLUÍDO

O frontend parte de um backend estruturalmente encerrado.

```text
backend estrutural                         ✅
API REST                                  ✅
Swagger / OpenAPI                         ✅
PostgreSQL                                ✅
Flyway                                    ✅
UUID público na fronteira                 ✅
DTOs request/response separados           ✅
testes principais do domínio              ✅
autenticação + auditoria local            ⏳ pós-frontend
integração corporativa                    ⏳ futura
```

## Regra de identificadores

```text
Long id
→ somente interno do backend
→ nunca expor/usar como identidade pública do frontend

UUID publicId
→ identificador externo
→ URLs
→ requests
→ responses
→ estado da interface
```

## Fonte de verdade de integração

O Swagger/OpenAPI é o contrato operacional para:

- endpoints;
- parâmetros;
- request bodies;
- responses;
- status HTTP;
- DTOs públicos;
- erros.

Não inferir um contrato só porque uma entidade ou repository existe no backend.

---

# 2. Perfis do domínio e responsabilidades de UX

Perfis existentes no backend:

```text
ADMINISTRADOR
GESTOR
TECNICO
ANALISTA
PESQUISADOR
ESTAGIARIO
```

Durante o desenvolvimento visual e funcional, a interface é organizada em três responsabilidades:

```text
SOLICITANTE
GESTÃO
ADMINISTRAÇÃO
```

O mapeamento definitivo `perfil → permissão` será fechado na etapa de autenticação/autorização.

Importante:

```text
responsabilidade de UX
≠
regra definitiva de segurança
```

---

# 3. Arquitetura frontend oficial

Padrão adotado:

```text
SPA (Single Page Application)
+ Feature-based Architecture
+ Component-based UI
+ camadas com responsabilidades claras
```

Não adotar:

- landing page com `index.html + style.css + script.js` como organização central;
- MVC clássico apenas por analogia com Spring;
- DDD/Clean/FSD/Atomic Design completo sem necessidade concreta;
- estrutura excessivamente abstrata antes do sistema exigir.

## 3.1 Estrutura física preparada

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
│   │   └── views/
│   │       ├── solicitante/
│   │       └── gestao/
│   ├── pedidos/
│   │   ├── components/
│   │   └── views/
│   │       ├── solicitante/
│   │       └── gestao/
│   ├── estoque/
│   │   ├── components/
│   │   └── views/
│   ├── lotes/
│   ├── movimentacoes/
│   │   └── views/
│   ├── documentos/
│   ├── relatorios/
│   │   ├── views/
│   │   └── fiscalizacao/
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
    ├── tokens.css
    ├── base.css
    └── main.css
```

TypeScript será usado; não criar uma pasta artificial `js/`.

## 3.2 Responsabilidades

```text
View
→ tela/rota completa
→ coordena componentes e estado local

Component
→ bloco reutilizável de interface

Layout
→ estrutura comum
→ sidebar, topbar, conteúdo, login shell

Module
→ domínio/feature do SGL

Service
→ comunicação HTTP por domínio
→ Axios centralizado

Type
→ contratos TypeScript da fronteira

Store
→ somente estado realmente global/compartilhado

Composable
→ comportamento Vue reutilizável quando houver repetição real

Router
→ URL, rotas, metadata e guards de UX

Assets
→ logo, imagens, ícones

Styles
→ tokens/regras globais

Utils
→ funções puras auxiliares
```

## 3.3 Fluxo de dependência preferencial

```text
View
→ Components
→ Service / Store quando necessário
→ Axios
→ API Spring Boot
```

Não espalhar `axios.get/post/...` diretamente pelas Views/Components.

## 3.4 Regra mental para quem vem de Spring

| Spring/backend | Vue/frontend |
|---|---|
| Controller | View/rota — analogia aproximada |
| Service | Service frontend e às vezes Store |
| DTO | Type/interface TypeScript |
| REST endpoint | método do Service usando Axios |
| Config | app/router/configuração |
| Repository | sem equivalente direto; persistência vem pela API |
| Regra de negócio | continua no backend |

---

# 4. Método oficial para implementar uma tela

Quando chegar a implementação real, seguir aproximadamente:

```text
1. entender função e usuário
2. validar wireframe/padrão visual
3. identificar componentes
4. identificar dados necessários
5. conferir Swagger/OpenAPI
6. criar/reutilizar Types
7. criar/reutilizar Services
8. implementar View/components
9. integrar API
10. tratar loading/empty/error/success
11. validar fluxo completo
```

Exemplo:

```text
MeusPedidosView.vue
→ PedidoTable.vue
→ StatusChip.vue
→ pedidoService.listarPorUsuario()
→ PedidoResponse TypeScript
→ GET /api/v1/pedidos/por-usuario
```

---

# 5. Mapa funcional e navegação aprovados

## 5.1 Solicitante

```text
Dashboard
└── Pedidos
    ├── Novo pedido
    └── Meus pedidos
        └── Detalhe
```

## 5.2 Gestão

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

## 5.3 Administração

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

Administração reutiliza Gestão. Não duplicar módulos.

## 5.4 Rotas planejadas

```text
/login
/dashboard
/pedidos/novo
/meus-pedidos
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
/:pathMatch(.*)*        → 404
```

Possível deep link futuro:

```text
/estoque/:estoqueId/lotes/:loteId
```

Lotes continuam contextuais ao Estoque e não viram item principal da sidebar por padrão.

---

# 6. Fluxos funcionais aprovados

## 6.1 Novo pedido — Solicitante

```text
laboratório
→ projeto opcional
→ materiais
→ quantidades
→ informações adicionais
→ documento futuro quando houver contrato
→ revisão
→ envio
→ confirmação
→ detalhe
```

Possível agrupamento visual:

```text
1. Contexto
2. Materiais
3. Informações adicionais
4. Revisão
```

Erros:

- `fieldErrors` ficam próximos aos campos;
- erro de negócio é contextual;
- falha 500 deve preservar dados preenchidos quando possível;
- não assumir que solicitante pode cancelar apenas porque o endpoint existe.

## 6.2 Gestão de pedidos

```text
fila/lista
→ detalhe
→ analisar
→ aprovar/rejeitar
→ entregar/cancelar conforme estado
```

Regras importantes herdadas do backend:

- aprovação pode ajustar quantidade aprovada;
- backend faz FEFO/FIFO e baixa de estoque;
- entrega **não baixa estoque novamente**;
- cancelamento restaura os lotes exatos;
- frontend não recria essas regras.

## 6.3 Estoque

```text
visão geral
→ filtro unidade/busca
→ modos: Todos / Estoque baixo / Vencidos
→ detalhe do produto+unidade
→ lotes
→ entrada/descarte/documentos quando disponíveis
```

## 6.4 Movimentações

Página focada em consulta/rastreabilidade.

Filtros atuais de API:

- produto;
- laboratório;
- usuário;
- pedido;
- tipo.

Entrada e descarte devem ser iniciados preferencialmente no detalhe do estoque.

## 6.5 Relatórios

Rota central:

```text
/relatorios
```

Categorias planejadas:

```text
Estoque
Lotes / validade
Movimentações
Pedidos
Consumo / materiais recebidos
Fiscalização / Auditoria
```

Não criar um filtro universal gigante. Cada categoria recebe filtros próprios.

## 6.6 Documentos

Documentos são contextuais:

- Pedido;
- Produto;
- Lote.

Não criar menu global de Documentos.

Backend ainda não possui fluxo real completo de upload `MultipartFile`; reservar a UX sem inventar persistência local.

---

# 7. Requisito de fiscalização/auditoria regulatória

Existe requisito futuro para informar a órgão fiscalizador dados de determinados produtos controlados.

Arquitetura conceitual aprovada:

```text
Produto / Estoque / Lote / Movimentação
→ continuam fontes de verdade

ProdutoFiscalizado / ProdutoControlado
→ somente associação e metadados regulatórios
→ não duplica quantidade, risco, armazenamento, localização ou saídas
```

Possíveis metadados, ainda não congelados:

- órgão fiscalizador;
- código/registro regulatório;
- vigência;
- observação;
- unidade quando a regra variar por local.

Se for necessário preservar exatamente o que foi declarado, avaliar futuramente:

```text
RelatorioFiscalizacao / DeclaracaoRegulatoria
→ período
→ responsável
→ snapshot declarado
→ arquivo/status
```

Não modelar definitivamente antes de receber o formulário/requisito real do órgão.

No frontend:

```text
Relatórios
→ Fiscalização / Auditoria
```

Não criar item principal de sidebar.

---

# 8. Etapa 1.3 — identidade visual aprovada

## 8.1 Referência institucional

Principal:

**Publica / Embrapa**.

Objetivo:

```text
clean
+ corporativo
+ administrativo/laboratorial
+ branco predominante
+ contraste com azuis institucionais
+ verde como apoio
```

Referências administrativas adicionais:

- `iview/iview-admin`;
- `Armour/vue-typescript-admin-template`;
- `PanJiaChen/vue-admin-template`;
- CoreUI como referência de composição da sidebar;
- `vue-awesome-sidebar` como referência de suavidade de abertura/recolhimento;
- PrimeVue Toolbar e Mood UI como referências de simplicidade da topbar.

Esses projetos são referência de UX/composição, não base arquitetural nem código para copiar.

## 8.2 Paleta

### Azuis

```text
#1A4DA1  principal
#0D2B5E  escuro
#2D6BC4  claro
```

### Verdes

```text
#007A3D  institucional
#4EA674  claro
#A5D6A7  suave
```

### Neutros

```text
#F5F7FA  fundo
#FFFFFF  superfície
#1A1A2E  texto principal
#64748B  texto secundário
#E2E8F0  borda
```

Tipografia principal:

**Inter**.

## 8.3 Uso semântico de cores

```text
azul
→ identidade / informação / estado normal

verde
→ sucesso / confirmação

amarelo
→ atenção / pendência

vermelho
→ erro / urgência / crítico
```

---

# 9. Etapa 1.3 — densidade, espaçamento e forma

Densidade:

**média-compacta**.

Grid conceitual:

```text
4   micro ajuste
8   proximidade
12  controles relacionados
16  padrão
24  grupos
32  seções
48+ blocos independentes
```

Referências:

```text
padding de página desktop      ~24 px
card interno                   ~20–24 px
input                          ~40–44 px
botão padrão                   ~40 px
linha de tabela                ~44–48 px
sidebar aberta                 ~240–248 px
sidebar recolhida              ~64–72 px
topbar                         ~64 px
```

Arredondamento:

```text
inputs/botões         ~6 px
cards/tabelas         ~8 px
modais/drawers        ~8–10 px
chips                 pill quando adequado
avatar                circular
```

Sombras:

```text
Nível 0  sem sombra — tabelas/formulários/seções internas
Nível 1  muito discreta — cards/containers quando necessário
Nível 2  suave evidente — modal/dropdown/menu flutuante
```

Regra de hierarquia:

```text
espaço
→ fundo
→ borda
→ tipografia
→ sombra
```

Card = resumo/indicador.  
Tabela = operação/consulta repetitiva.

---

# 10. Etapa 1.3 — motion aprovado

Princípio:

> Navegar no SGL deve parecer mover-se dentro do sistema, não fechar uma página para abrir outra.

Referência: `PanJiaChen/vue-admin-template`.

Troca de rota:

```text
conteúdo atual
→ fade
→ pequeno deslocamento horizontal

novo conteúdo
→ entra suavemente
→ ocupa a mesma área
```

Referência inicial:

```text
movimento ~20–30 px
duração ~250–350 ms
```

Sidebar e topbar permanecem estáveis.

Contextos:

```text
rota        → fade + deslocamento curto
breadcrumb  → transição mais discreta
modal       → fade + elevação
Drawer      → slide coerente com origem
Dropdown    → aparição curta
```

Futuro: respeitar preferência por redução de movimento.

---

# 11. Etapa 1.3 — iconografia FECHADA

Padrão:

```text
normal
→ outline moderno e bem visível
→ cor padrão preta/grafite em superfície clara
→ branco/claro em superfície escura

hover
→ microanimação curta
→ leve escala/movimento e mudança de destaque

click
→ pequeno press

ativo
→ filled quando disponível
```

Diretriz de tamanho:

```text
menu/sidebar  ~20–22 px
botões        ~18–20 px
destaques     ~24 px quando necessário
```

Não usar duas cores em todos os ícones operacionais.

Ícones operacionais:

```text
monocromáticos
```

Ícones ilustrativos podem usar símbolo auxiliar de estado:

```text
Estoque baixo          → amarelo/alerta
Pedido aprovado        → verde/sucesso
Entrada registrada     → verde/sucesso
Próximo vencimento     → amarelo/alerta
Vencido                → vermelho/crítico
Relatório gerado       → azul/informação ou verde quando conclusão
```

Regra:

> Ícone ajuda a reconhecer; texto explica.

Sidebar aberta usa ícone + texto. Sidebar recolhida usa ícone + tooltip.

---

# 12. Etapa 1.3 — Sidebar aberta/recolhida FECHADA

Referências:

```text
CoreUI
→ organização visual

vue-awesome-sidebar
→ suavidade da expansão/recolhimento
```

## 12.1 Cabeçalho

```text
[ LOGO SGL ]                    [ ‹ / › ]
```

A seta muda de orientação conforme a ação possível.

Aberta:

```text
‹ = recolher
```

Recolhida:

```text
› = expandir
```

Logo oficial do SGL deve ser usada; mockups gerados são somente referência de composição.

## 12.2 Ordem interna

```text
Logo + toggle
↓
Aparência
↓
Alertas operacionais — somente Gestão/Admin
↓
Navegação
↓
Usuário no rodapé
```

## 12.3 Navegação

Grupos:

```text
PRINCIPAL
OPERAÇÃO
ADMINISTRAÇÃO quando aplicável
```

Não passar de dois níveis de submenu sem necessidade real.

Submenus abrem com expansão vertical curta + fade.

A sidebar **não expande inteira no hover**.

## 12.4 Recolhida

Mantém:

- marca compacta;
- ícones;
- alertas;
- avatar;
- tooltips;
- flyout lateral para contexto/submenu quando necessário.

## 12.5 Usuário

Rodapé aberto:

```text
Avatar / iniciais
Nome                       [PERFIL]
e-mail                         ⋮
```

Menu `⋮` conceitual:

```text
Minha conta
Preferências
Aparência
Sair
```

A edição futura deve respeitar o contrato de autenticação. Não assumir que o usuário pode alterar login, e-mail institucional, perfil, unidade, laboratório ou senha.

Recolhida:

- avatar permanece;
- hover mostra identificação;
- clique abre menu de conta.

## 12.6 Mobile

Sidebar vira drawer/overlay. Não usar simplesmente a mini-sidebar desktop.

---

# 13. Etapa 1.3 — Alertas operacionais FECHADOS

Disponíveis para:

```text
GESTÃO
ADMINISTRAÇÃO
```

Não são notificações sociais. São uma central de **atenção operacional**.

## 13.1 Lâmpada

```text
AZUL
→ nenhuma pendência
→ visualmente desligada/neutra

AMARELO
→ pendência exige atenção

VERMELHO
→ existe pelo menos uma urgência/crítico
```

Prioridade:

```text
vermelho > amarelo > azul
```

Badge ao lado mostra quantidade total de pendências quando > 0.

## 13.2 Categorias iniciais

```text
Pedidos pendentes       amarelo
Estoque baixo           amarelo
Próximos do vencimento  amarelo
Vencidos                vermelho
```

## 13.3 Sidebar aberta

Clique na lâmpada:

```text
expande/recolhe categorias
```

Hover em **uma categoria**:

```text
mostra somente descrição curta/contextual
```

Exemplo:

```text
Pedidos pendentes [2]
→ 2 pedidos aguardando análise
→ laboratórios relevantes quando couber
```

Clique em categoria:

```text
leva à página operacional correta já filtrada/contextualizada
```

## 13.4 Sidebar recolhida

Hover na lâmpada abre painel lateral resumido com as categorias.

## 13.5 Validade — contrato atual

```text
GET /api/v1/lotes/vencidos
→ existe

Próximos do vencimento
→ previsto na UX
→ ainda falta regra/endpoint de janela de validade
→ não calcular como regra definitiva no frontend
```

A janela poderá futuramente ser 7/15/30 dias ou configurável; ainda não congelar.

---

# 14. Etapa 1.3 — Topbar FECHADA

Objetivo:

**simplicidade máxima**.

Referências conceituais:

- PrimeVue Toolbar;
- Mood UI topbar.

Composição:

```text
LOGO | SETA |                         PESQUISA | SAIR
```

Topbar é visualmente conectada à sidebar.

A marca é a mesma identidade oficial do sidebar.

Quando a sidebar estiver recolhida, a logo/assinatura pode ganhar um pouco mais de presença visual.

Não transformar a topbar em segunda navegação principal.

Ações globais essenciais:

```text
pesquisa
sair
```

Perfil/conta permanece prioritariamente no footer da sidebar.

---

# 15. Etapa 1.3 — Área principal, títulos e breadcrumbs FECHADOS

## 15.1 Área principal

Fluida, para aproveitar telas grandes e tabelas extensas.

Referências:

```text
desktop  ~24 px de margem/padding
Tablet   ~16 px
Mobile   ~12–16 px
```

Fundo geral claro (`#F5F7FA`), superfícies de conteúdo brancas.

Não colocar um card branco gigante envolvendo toda página por padrão.

## 15.2 Hierarquia da página

```text
breadcrumb quando necessário
↓
título                         ação principal
subtítulo curto opcional
↓
busca/filtro contextual quando necessário
↓
conteúdo
```

Título de página:

```text
~24 px / peso 700
```

Subtítulo:

```text
13–14 px / secundário
```

Somente usar subtítulo se realmente acrescentar contexto.

## 15.3 Breadcrumbs

Não exibir obrigatoriamente em página de primeiro nível.

Usar principalmente em profundidade/contexto:

```text
Estoque / Produto
Pedidos / Detalhe
Cadastros / Produtos
```

## 15.4 Botão voltar

Não duplicar breadcrumb sem necessidade.

Destino explícito:

```text
pedido solicitante → Meus pedidos
pedido gestão      → Pedidos
estoque detalhe    → Estoque
```

---

# 16. Etapa 1.3 — Busca e filtros FECHADOS

Decisão refinada:

## 16.1 Busca global

Fica na topbar como ícone simples.

Ao acionar:

```text
ícone pesquisa
→ expande campo/painel de busca
→ pode oferecer refinamento global quando fizer sentido
```

Exemplos de escopo futuro:

- Pedidos;
- Produtos;
- Laboratórios;
- Usuários.

Não precisa existir toda essa busca global no MVP se o custo não se justificar; o shell apenas reserva a interação.

## 16.2 Filtros de página

Filtros específicos ficam dentro da própria ferramenta/listagem.

Evitar uma linha grande de filtros sempre exposta sem necessidade.

Padrão preferido:

```text
[ Buscar... ] [ Filtros ]
```

Ao abrir `Filtros`:

```text
Status
Laboratório
Período
outros filtros realmente suportados
```

Exemplo:

```text
Pedidos
→ listar todos
→ abrir Filtros
→ Status = REJEITADO
```

Ou seja:

```text
busca global      → topbar
busca da página   → contexto local
filtros da página → botão/área expansível quando necessários
```

Filtros de uma ferramenta específica de dashboard podem ficar dentro do próprio widget/card/gráfico quando necessário.

---

# 17. Logos e imagens de referência

## Logo

Usar a **marca oficial aprovada do SGL**.

Mockups de interface gerados durante a Etapa 1.3 podem apresentar símbolos aproximados por limitação da geração de imagem; eles servem somente para composição/layout.

Há também uma versão secundária/compacta da marca para espaços menores, como modais ou áreas reduzidas, quando fizer sentido.

## README

O README deverá conter exemplos visuais de:

- iconografia;
- sidebar/topbar;
- busca/filtros;
- banner institucional.

Essas imagens são referência visual da etapa, não screenshots de implementação concluída.

---

# 18. Stack planejada — confirmar somente na 1.4

Direção atual:

```text
Vue 3
Vite
TypeScript
Vue Router
Pinia
Axios
Vuetify 3
```

Depois:

```text
Vitest
Vue Test Utils
ESLint
Prettier
```

Até a 1.4, tratar como **planejada**, não como stack formalmente encerrada.

---

# 19. Contratos/API relevantes para o frontend

## 19.1 Pedidos

Base:

```text
/api/v1/pedidos
```

Cobertura atual inclui:

- criar;
- listar todos;
- listar por usuário;
- detalhe;
- por status;
- laboratório+projeto+período;
- aprovar;
- rejeitar;
- entregar;
- cancelar.

Estados:

```text
PENDENTE
→ APROVADO
   → ENTREGUE
   → CANCELADO

PENDENTE
→ REJEITADO
```

## 19.2 Estoque Central

Base:

```text
/api/v1/estoque-central
```

Cobertura inclui:

- criar;
- listar;
- detalhe;
- por unidade;
- unidade+produto;
- atualizar;
- excluir/inativar conforme contrato;
- estoque baixo.

## 19.3 Lotes

Base:

```text
/api/v1/lotes
```

Cobertura inclui:

- listar;
- detalhe;
- por estoque;
- vencidos;
- atualizar;
- inativar.

## 19.4 Movimentações

Cobertura de consulta:

- todas;
- produto;
- laboratório;
- usuário;
- pedido;
- tipo.

Entrada de lote e descarte são operações contextuais ao estoque.

## 19.5 Histórico de laboratório

Serve principalmente a relatórios/contextos, não como item principal da sidebar.

## 19.6 Cadastros

Cobertura administrativa:

- Produtos;
- Projetos;
- Laboratórios;
- Unidades;
- Usuários;
- Estagiários.

---

# 20. Lacunas de backend já conhecidas

Não inventar solução definitiva no frontend para:

## Próximos do vencimento

```text
vencidos ✅
janela futura de vencimento ⚠️
```

Ainda falta contrato/regra específica.

## Arquivos

```text
Pedido possui referência String parcial
MultipartFile/fluxo real de upload não existe ⚠️
```

Reservar UX; persistência somente quando houver contrato.

## Relatórios

Algumas combinações/filtros ainda não existem, por exemplo:

- movimento por período;
- janela de validade futura;
- filtros arbitrários agregados.

Não criar endpoint só por conveniência visual sem validar necessidade real.

## Autenticação

Ainda não é a etapa atual.

Sessão temporária de desenvolvimento deve ficar centralizada para futura substituição.

---

# 21. Roadmap completo

## Etapa 0 — Handoff backend → frontend ✅

## Etapa 1 — Fundação visual e técnica 🟡

### 1.1 Inventário de telas ✅

### 1.2 Fluxos e navegação ✅

### 1.3 Figma e padrões visuais 🟡 ATUAL

Concluído:

```text
Identidade                                  ✅
Cores e tipografia                          ✅
Espaçamento/densidade                       ✅
Bordas/arredondamentos/sombras              ✅
Motion                                      ✅
Ícones                                      ✅
Sidebar aberta/recolhida                    ✅
Alertas operacionais                        ✅
Topbar                                      ✅
Área principal                              ✅
Títulos/breadcrumbs                         ✅
Busca/filtros                               ✅
```

Ainda falta nesta 1.3:

```text
1. componentes reutilizáveis                ⏳ PRÓXIMO
2. estados padrão de interface              ⏳
3. Login completo                           ⏳
4. Dashboards                               ⏳
5. fluxo visual do Solicitante              ⏳
6. fluxo visual da Gestão                   ⏳
7. Estoque/Lotes/Movimentações              ⏳
8. Relatórios/Cadastros/Documentos          ⏳
9. 404 + responsividade                     ⏳
10. mini Design System + revisão final      ⏳
```

### 1.4 Confirmar stack ⏳

Última subetapa macro da Etapa 1.

---

## Etapa 2 — Bootstrap técnico

```text
Vue + Vite
TypeScript
UI framework
Router
Pinia
Axios
env
aliases
estrutura física final
lint/format
build
```

## Etapa 3 — Design System mínimo + shell

Implementar de verdade:

- tokens;
- tipografia;
- botões;
- inputs;
- cards;
- tabelas;
- chips;
- loading/empty/error;
- alerts;
- sidebar/topbar;
- responsividade;
- 404.

## Etapa 4 — API e contratos

- Axios/base URL;
- Types;
- Services;
- erros/fieldErrors;
- sessão temporária;
- validação com Swagger;
- contratos de arquivos quando existirem;
- contratos regulatórios quando aprovados.

## Etapa 5 — Solicitante

## Etapa 6 — Gestão de pedidos

## Etapa 7 — Estoque/Lotes/Movimentações

## Etapa 8 — Administração

## Etapa 9 — Relatórios/Documentos/Fiscalização

## Etapa 10 — Dashboards finais

## Etapa 11 — Robustez/fechamento frontend

## Etapa 12 — Autenticação/autorização/auditoria/corporativa

---

# 22. Estado de Git/documentação deste checkpoint

Histórico principal até aqui:

```text
PR #1  planejamento inicial                         ✅ merged
PR #2  fluxos e navegação                           ✅ merged
PR #3  scaffold físico                              ✅ merged
PR #4  padrão arquitetural                          ✅ merged
PR #5/#6 identidade visual                          ✅ merged
PR #7  sidebar/alertas/shell/checkpoint visual      → checkpoint atual
```

O usuário autorizou neste checkpoint:

- atualizar toda a documentação;
- inserir imagens de referência no README;
- consolidar as decisões da Etapa 1.3 tomadas até agora;
- fazer merge dessas mudanças.

---

# 23. Documentos do repositório

```text
README.md
→ apresentação pública e estado resumido

CONTINUIDADE.md
→ fonte principal para retomada

docs/INVENTARIO_TELAS.md
→ inventário funcional e cobertura

docs/ESTRUTURA_FRONTEND.md
→ estrutura física/arquitetura

docs/IDENTIDADE_VISUAL.md
→ identidade, paleta, densidade e motion

docs/ICONOGRAFIA.md
→ ícones e microinterações

docs/SIDEBAR_ALERTAS.md
→ sidebar e central operacional

docs/SHELL_VISUAL.md
→ sidebar/topbar e shell

docs/PADROES_PAGINA.md
→ conteúdo, cabeçalhos, breadcrumbs, busca e filtros
```

---

# 24. Próximo passo exato

Continuar a **Etapa 1.3** pelo bloco:

```text
COMPONENTES REUTILIZÁVEIS
```

Trabalhar conceitualmente, nesta ordem sugerida:

```text
1. botões
2. inputs / selects / textarea / checkbox / radio
3. cards
4. tabelas
5. chips/status
6. dialogs/modais/drawers
7. busca/filtros como componente
8. paginação
9. tooltips
10. alertas/feedback
```

Depois:

```text
ESTADOS PADRÃO
→ loading
→ empty
→ error
→ success
→ sem permissão
→ recurso não encontrado
→ confirmação destrutiva
```

Só então avançar para os wireframes completos de Login, Dashboards e fluxos por domínio.

---

# 25. Regra final de continuidade

Se uma nova pessoa/IA assumir o projeto:

```text
NÃO recomeçar o planejamento
NÃO trocar arquitetura sem motivo concreto
NÃO inventar endpoint
NÃO implementar regra de negócio no frontend
NÃO copiar template inteiro
NÃO confundir mockup com logo oficial
```

Continuar a partir do **Passo 24** deste arquivo e atualizar este documento sempre que uma decisão importante for fechada.
