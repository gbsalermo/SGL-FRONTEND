<a id="readme-top"></a>

<div align="center">

# SGL — Sistema de Gestão de Laboratórios

**Frontend corporativo para pedidos, estoque, lotes, movimentações, relatórios e administração laboratorial.**

[Backend](https://github.com/gbsalermo/Sistema-SGL) · [Continuidade](CONTINUIDADE.md) · [Inventário de telas](docs/INVENTARIO_TELAS.md) · [Arquitetura](docs/ESTRUTURA_FRONTEND.md)

</div>

> [!NOTE]
> As imagens de referência visual do README serão adicionadas manualmente pelo mantenedor. A documentação já registra o papel de cada exemplo para que possam ser inseridos sem alterar as decisões do projeto.

---

## 📍 Estado atual

O backend estrutural do SGL já foi encerrado e o frontend está na **Etapa 1 — Fundação visual e técnica**.

```text
Etapa 0 — Handoff backend → frontend             ✅
Etapa 1.1 — Inventário de telas                  ✅
Etapa 1.2 — Fluxos e navegação                   ✅
Etapa 1.3 — Figma e padrões visuais              🟡 em andamento
Etapa 1.4 — Confirmação final da stack           ⏳
Etapa 2 — Bootstrap técnico                      ⏳
```

Na Etapa 1.3 já foram aprovados:

- identidade institucional;
- paleta e tipografia;
- densidade, espaçamento, bordas, arredondamentos e sombras;
- motion e continuidade entre rotas;
- padrão de ícones;
- sidebar aberta/recolhida;
- alertas operacionais;
- topbar minimalista;
- área principal, títulos e breadcrumbs;
- comportamento de busca e filtros.

A próxima parte da 1.3 é definir **componentes reutilizáveis e estados de interface**, e depois validar as telas-chave do sistema.

> [!IMPORTANT]
> Nesta fase as decisões são **conceituais/Figma**. Não estamos transformando cada decisão em CSS ou Vue imediatamente. A implementação será feita posteriormente seguindo a arquitetura oficial do frontend.

---

## 🎨 Referências visuais aprovadas

A identidade do SGL combina a linguagem institucional da Embrapa/Publica com padrões de aplicações administrativas modernas.

### Imagem de capa do README

**A adicionar manualmente.** Deve usar a identidade oficial do SGL e funcionar como apresentação do projeto. Não usar símbolos aproximados gerados em mockups quando diferirem da marca oficial.

### Ícones e microinterações

**Imagem-exemplo a adicionar manualmente.** Deve demonstrar o padrão já aprovado:

```text
ícone normal       → outline, visível e monocromático
hover              → microanimação curta
clique             → pequeno efeito de pressão
item ativo         → filled quando disponível
cor padrão         → preto/grafite de destaque ou branco conforme superfície
cores semânticas   → somente quando comunicam estado
```

Os ícones ilustrativos podem usar símbolos auxiliares semânticos:

```text
azul     → neutro / informação / sem pendência
amarelo  → atenção / pendência
vermelho → urgente / crítico
verde    → sucesso / confirmação
```

### Sidebar + Topbar

**Imagem-exemplo a adicionar manualmente.** Deve mostrar a composição aprovada do shell: sidebar aberta/recolhida, alertas, área de usuário e topbar simples.

O mockup é referência de composição, não de desenho da marca. A implementação deverá usar exclusivamente a logo oficial do SGL.

```text
Sidebar aberta       ~240–248 px
Sidebar recolhida    ~64–72 px
Topbar               ~64 px

sidebar/topbar       permanecem estáveis entre rotas
conteúdo             realiza transição suave
```

### Busca e filtros

**Imagem-exemplo a adicionar manualmente.** Deve ilustrar:

- busca global simples na topbar;
- busca local dentro da página;
- botão `Filtros` para abrir refinamentos contextuais;
- exemplo de filtro de Pedidos por status/laboratório/período;
- tabela operacional após aplicação dos filtros.

Regra aprovada:

- a topbar possui uma **busca global simples**, acionada pelo ícone de pesquisa;
- quando necessário, a busca global pode expandir um painel de pesquisa e refinamento;
- filtros específicos de uma ferramenta/listagem ficam **no contexto da própria página**;
- filtros de página não precisam ocupar permanentemente uma grande faixa da tela: podem ficar atrás de um botão **Filtros** junto da busca local;
- exemplo: em Pedidos, o usuário pode buscar e abrir `Filtros` para exibir somente `REJEITADO`, um laboratório ou um período.

---

## 🎯 Direção visual

A referência institucional principal é o **Publica / Embrapa**, especialmente o contraste entre branco e azuis institucionais e a estrutura limpa do login.

### Paleta base

| Papel | Cor |
|---|---|
| Azul principal | `#1A4DA1` |
| Azul escuro | `#0D2B5E` |
| Azul claro | `#2D6BC4` |
| Verde institucional | `#007A3D` |
| Verde claro | `#4EA674` |
| Verde suave | `#A5D6A7` |
| Fundo | `#F5F7FA` |
| Superfície | `#FFFFFF` |
| Texto | `#1A1A2E` |
| Texto secundário | `#64748B` |
| Bordas | `#E2E8F0` |

**Tipografia principal:** Inter.

A aplicação deverá parecer:

```text
clean
+ institucional
+ administrativa/laboratorial
+ média-compacta
+ baixa carga decorativa
+ alta legibilidade
```

### Densidade e forma

- grid conceitual baseado em 8 px;
- padding de página desktop em torno de 24 px;
- inputs em torno de 40–44 px;
- botões em torno de 40 px;
- linhas de tabela em torno de 44–48 px;
- controles com arredondamento moderado;
- cards geralmente em torno de 8 px de raio;
- bordas discretas;
- sombras mínimas e usadas apenas para hierarquia/elevamento.

Regra de composição:

```text
card   → resumo, indicador ou agrupamento
Tabela → operação e consulta repetitiva
```

---

## ✨ Motion

O SGL deverá transmitir sensação de **aplicação contínua**, não de várias páginas sendo fechadas e abertas.

Referência principal: `PanJiaChen/vue-admin-template`.

```text
rota atual
→ fade + pequeno deslocamento

nova rota
→ entra suavemente na mesma área

sidebar/topbar
→ permanecem
```

Referência inicial de protótipo:

- deslocamento de aproximadamente 20–30 px;
- duração percebida de aproximadamente 250–350 ms;
- animações menores para hover/click;
- suporte futuro a preferência de redução de movimento.

---

## 🧭 Shell e navegação

### Sidebar

Estrutura geral:

```text
[ LOGO SGL ]                           [ ‹ / › ]

Aparência                         [ claro/escuro ]
Alertas operacionais                    [N]   ← Gestão/Admin

PRINCIPAL
Dashboard

OPERAÇÃO
Pedidos
Estoque
Movimentações
Relatórios

ADMINISTRAÇÃO                              ← Admin
Cadastros

────────────────────────────────────────
Avatar  Nome                    [PERFIL]
        e-mail                      ⋮
```

A sidebar recolhida preserva:

- logo/símbolo compacto;
- controle de expansão;
- ícones;
- lâmpada de alertas para Gestão/Admin;
- avatar;
- tooltips e flyouts laterais quando necessários.

Ela **não deve abrir inteira ao hover**. A expansão completa ocorre por ação explícita do usuário.

### Alertas operacionais

Disponíveis para Gestão/Administração.

```text
AZUL     → nenhuma pendência
AMARELO  → existe algo que exige atenção
VERMELHO → existe urgência/crítico
```

Categorias iniciais:

- pedidos pendentes;
- estoque baixo;
- lotes próximos do vencimento;
- lotes vencidos.

Na sidebar aberta:

- clicar na lâmpada expande as categorias;
- passar o mouse em uma categoria mostra uma descrição curta e contextual;
- clicar em uma categoria leva à tela correta já contextualizada/filtrada.

Na sidebar recolhida:

- hover na lâmpada abre um painel lateral resumido.

Situação atual da API:

- lotes vencidos: já suportados;
- próximos do vencimento: previsto no design, mas ainda exige regra/endpoint de janela de validade.

### Topbar

A topbar foi deliberadamente mantida simples e conectada visualmente à sidebar:

```text
LOGO | SETA |                         PESQUISA | SAIR
```

Quando a sidebar está recolhida, a marca pode ganhar um pouco mais de presença visual. O foco do topo é apenas nas ações globais essenciais.

---

## 📄 Padrão da área principal

Ordem de leitura preferida:

```text
breadcrumb quando necessário
↓
título + descrição curta opcional              ação principal
↓
busca/filtros contextuais quando necessários
↓
conteúdo
```

Breadcrumbs são usados principalmente em profundidade/contexto, por exemplo:

```text
Estoque / Produto / Detalhe
Cadastros / Produtos
Pedidos / Detalhe
```

Não é obrigatório exibir breadcrumb em toda página de primeiro nível.

Botões de voltar possuem destino funcional explícito, por exemplo:

```text
pedido do solicitante → Meus pedidos
pedido da gestão      → Pedidos
estoque detalhado     → Estoque
```

A área principal é fluida para aproveitar telas grandes e tabelas extensas.

---

## 👥 Experiência por responsabilidade

### Solicitante

```text
Dashboard
└── Pedidos
    ├── Novo pedido
    └── Meus pedidos
        └── Detalhe
```

Foco: pedir materiais e acompanhar solicitações próprias.

### Gestão

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

Foco: decisão operacional, estoque, validade e rastreabilidade.

### Administração

Reutiliza tudo da Gestão e acrescenta:

```text
Cadastros
├── Produtos
├── Unidades
├── Laboratórios
├── Projetos
├── Usuários
└── Estagiários
```

Não haverá três aplicações separadas. A arquitetura e os componentes são compartilhados; navegação, prioridade das informações e ações mudam conforme a responsabilidade.

---

## 🏛️ Arquitetura oficial do frontend

```text
SPA (Single Page Application)
+ Feature-based Architecture
+ Component-based UI
+ camadas com responsabilidades claras
```

Fluxo preferencial:

```text
View
→ Components
→ Service / Store quando necessário
→ Axios
→ Backend REST
```

Responsabilidades:

| Camada | Papel |
|---|---|
| View | tela/rota completa |
| Component | bloco reutilizável de UI |
| Layout | shell comum |
| Module | funcionalidade/domínio |
| Service | comunicação HTTP por domínio |
| Type | contrato TypeScript |
| Store | estado global real |
| Composable | comportamento Vue reutilizável |
| Router | rotas, metadata e guards de UX |
| Assets | imagens/logos/ícones |
| Styles | tokens e estilos globais |
| Utils | helpers puros |

Regra importante:

```text
não espalhar Axios em Views/Components
não criar Store para todo dado
não duplicar módulos por perfil
não recriar regra de negócio do backend no frontend
não criar página para cada endpoint
```

### Estrutura física preparada

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
├── router/
├── services/
├── stores/
├── types/
├── composables/
├── utils/
└── styles/
```

---

## 🔌 Integração com o backend

O Swagger/OpenAPI do backend é o contrato de referência.

Regras:

- `Long` é interno do backend;
- somente UUID público atravessa a fronteira;
- `VITE_API_BASE_URL` será usada para configuração do endereço da API;
- Axios será centralizado;
- erros `400`, `404`, `409`, `500` e `fieldErrors` terão tratamento consistente;
- telas remotas devem prever `loading`, `empty`, `error`, `success` e `retry` quando aplicável.

### Lacunas conhecidas que não devem ser inventadas pelo frontend

- upload real de arquivos/documentos ainda não possui contrato completo;
- janela oficial para **lotes próximos do vencimento** ainda precisa ser definida no backend;
- alguns filtros agregados de relatórios ainda não existem;
- autenticação/autorização/auditoria definitiva vem após a primeira fase funcional do frontend.

---

## 🔄 Método oficial para implementar uma tela

Quando a etapa técnica começar, cada tela seguirá aproximadamente:

```text
1. entender função e usuário
2. validar wireframe/padrão visual
3. identificar componentes
4. identificar dados necessários
5. conferir Swagger/OpenAPI
6. definir/reutilizar Types
7. definir/reutilizar Services
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
→ PedidoResponse
→ GET /api/v1/pedidos/por-usuario
```

---

## 🛠️ Stack planejada

A confirmação formal ocorrerá na **Etapa 1.4**.

- Vue 3;
- Vite;
- TypeScript;
- Vue Router;
- Pinia;
- Axios;
- Vuetify 3.

Posteriormente:

- Vitest;
- Vue Test Utils;
- ESLint;
- Prettier.

---

## 🗺️ Roadmap

### Etapa 0 — Handoff ✅
Backend → frontend, Swagger como contrato e UUID público.

### Etapa 1 — Fundação visual e técnica 🟡

- [x] 1.1 Inventário de telas;
- [x] 1.2 Fluxos e navegação;
- [ ] 1.3 Figma e padrões visuais;
- [ ] 1.4 Confirmar stack.

#### 1.3 — concluído até aqui

- [x] identidade visual;
- [x] cores e tipografia;
- [x] espaçamento/densidade;
- [x] bordas/arredondamentos/sombras;
- [x] motion;
- [x] iconografia;
- [x] sidebar aberta/recolhida;
- [x] central de alertas;
- [x] topbar;
- [x] área principal;
- [x] títulos/breadcrumbs;
- [x] busca e filtros.

#### 1.3 — próximo

- [ ] componentes reutilizáveis;
- [ ] estados padrão de interface;
- [ ] Login;
- [ ] Dashboards;
- [ ] fluxo visual do Solicitante;
- [ ] fluxo visual da Gestão;
- [ ] Estoque/Lotes/Movimentações;
- [ ] Relatórios/Cadastros/Documentos;
- [ ] 404 e responsividade;
- [ ] mini Design System e revisão final.

### Etapa 2 — Bootstrap
Vue/Vite/TS, Router, Pinia, Axios, UI framework, env, aliases, lint/format e build.

### Etapa 3 — Design System mínimo + shell
Tokens, componentes básicos, estados e implementação real do shell.

### Etapas 4–11
Contratos/API → Solicitante → Gestão → Estoque → Administração → Relatórios → Dashboards → robustez/fechamento.

### Etapa 12
Autenticação, autorização, auditoria e futura integração corporativa.

---

## 📚 Documentação

| Documento | Finalidade |
|---|---|
| [`CONTINUIDADE.md`](CONTINUIDADE.md) | fonte principal para retomar o desenvolvimento |
| [`docs/INVENTARIO_TELAS.md`](docs/INVENTARIO_TELAS.md) | inventário funcional de telas e cobertura da API |
| [`docs/FLUXOS_NAVEGACAO.md`](docs/FLUXOS_NAVEGACAO.md) | jornadas, rotas e regras de navegação |
| [`docs/ESTRUTURA_FRONTEND.md`](docs/ESTRUTURA_FRONTEND.md) | estrutura física e responsabilidades das pastas |
| [`docs/IDENTIDADE_VISUAL.md`](docs/IDENTIDADE_VISUAL.md) | identidade, paleta, densidade e motion |
| [`docs/ICONOGRAFIA.md`](docs/ICONOGRAFIA.md) | padrão conceitual de ícones e microinterações |
| [`docs/SIDEBAR_ALERTAS.md`](docs/SIDEBAR_ALERTAS.md) | sidebar e alertas operacionais |
| [`docs/SHELL_VISUAL.md`](docs/SHELL_VISUAL.md) | sidebar/topbar e comportamento do shell |
| [`docs/PADROES_PAGINA.md`](docs/PADROES_PAGINA.md) | área de conteúdo, cabeçalhos, busca e filtros |

> Para continuar o projeto em outra sessão, por outra pessoa ou por outra IA, começar pelo **`CONTINUIDADE.md`**.

---

## ▶️ Próximo passo exato

```text
Etapa 1.3
→ componentes reutilizáveis
→ botões, inputs/selects, cards, tabelas, chips, dialogs e filtros
→ depois estados de interface
```

Nenhum componente deve ser implementado em Vue antes de a decisão conceitual correspondente ser validada nesta etapa.

---

<div align="center">
  <strong>SGL — Sistema de Gestão de Laboratórios</strong><br/>
  Frontend em planejamento visual e arquitetural.
</div>
