# Estrutura Física — SGL Frontend

**Momento:** scaffold anterior aos wireframes/telas  
**Objetivo:** materializar no repositório a organização funcional aprovada sem antecipar implementação visual.

---

## 1. Mapa funcional que orienta a estrutura

```text
SOLICITANTE
Dashboard
└── Pedidos
    ├── Novo pedido
    └── Meus pedidos
        └── Detalhe

GESTÃO
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

ADMINISTRAÇÃO
Tudo da Gestão
└── Cadastros
    ├── Produtos
    ├── Unidades
    ├── Laboratórios
    ├── Projetos
    ├── Usuários
    └── Estagiários
```

Administração **não duplica** os módulos de Gestão: reutiliza os mesmos módulos e adiciona o bloco `cadastros`.

---

## 2. Estrutura física aplicada

```text
SGL-FRONTEND/
├── public/
├── src/
│   ├── app/
│   ├── assets/
│   │   ├── icons/
│   │   └── images/
│   ├── components/
│   │   ├── common/
│   │   └── feedback/
│   ├── layouts/
│   ├── modules/
│   │   ├── dashboard/
│   │   │   └── views/
│   │   │       ├── solicitante/
│   │   │       └── gestao/
│   │   ├── pedidos/
│   │   │   ├── components/
│   │   │   └── views/
│   │   │       ├── solicitante/
│   │   │       └── gestao/
│   │   ├── estoque/
│   │   │   ├── components/
│   │   │   └── views/
│   │   ├── lotes/
│   │   ├── movimentacoes/
│   │   │   └── views/
│   │   ├── documentos/
│   │   ├── relatorios/
│   │   │   ├── views/
│   │   │   └── fiscalizacao/
│   │   └── cadastros/
│   │       ├── produtos/
│   │       ├── unidades/
│   │       ├── laboratorios/
│   │       ├── projetos/
│   │       ├── usuarios/
│   │       └── estagiarios/
│   ├── router/
│   ├── services/
│   ├── stores/
│   ├── types/
│   ├── composables/
│   ├── utils/
│   └── styles/
│       ├── tokens.css
│       ├── base.css
│       └── main.css
├── .gitignore
├── README.md
└── CONTINUIDADE.md
```

---

## 3. Papel de cada área

```text
app
→ inicialização/composição global da aplicação

assets
→ imagens, ícones e outros arquivos importados pela interface

components
→ componentes realmente compartilhados entre módulos

layouts
→ sidebar, topbar, shell e estruturas de página

modules
→ funcionalidades do domínio organizadas pelo uso real

router
→ definição das rotas, metadata e futuros guards

services
→ cliente HTTP e comunicação com backend

stores
→ somente estado global real

types
→ interfaces/types TypeScript compartilhados

composables
→ lógica Vue reutilizável

utils
→ funções puras e utilitários

styles
→ CSS global, tokens e regras base
```

---

## 4. CSS e assets

O CSS não será misturado dentro de uma pasta genérica `assets`.

```text
src/assets
→ imagens/ícones

src/styles
→ CSS global
```

Arquivos já criados:

```text
tokens.css
→ reservado para cores, tipografia, espaçamentos e demais tokens definidos na etapa visual

base.css
→ normalização estrutural mínima, sem identidade visual

main.css
→ ponto de entrada dos estilos globais
```

Nenhuma paleta, dimensão de componente ou estilo de tela foi congelado antes dos wireframes.

---

## 5. JavaScript / TypeScript

A stack planejada usa **TypeScript**, então não será criada uma pasta `js/` paralela apenas por convenção.

Quando o bootstrap Vue/Vite começar:

```text
main.ts
router/*.ts
services/*.ts
stores/*.ts
types/*.ts
composables/*.ts
utils/*.ts
```

A ausência atual desses arquivos é intencional: o scaffold físico foi criado antes da confirmação formal/bootstrap da stack, evitando código fictício que ainda não compila.

---

## 6. Regras estruturais

1. Solicitante e Gestão compartilham domínio, mas podem possuir views diferentes quando a responsabilidade muda a experiência.
2. Administração herda a experiência de Gestão e acrescenta Cadastros; não haverá cópia de módulos.
3. Lote continua contextual ao Estoque, mesmo possuindo módulo próprio para organizar componentes/tipos/lógica específica.
4. Documentos ficam em infraestrutura/módulo próprio, mas aparecem visualmente no contexto de Pedido, Produto ou Lote.
5. Fiscalização fica inicialmente dentro de Relatórios, sem virar item isolado da navegação.
6. Não criar componente compartilhado antes de existir reutilização real.
7. Não criar `.vue`, services ou stores apenas para preencher pastas; eles surgem conforme as telas e contratos forem implementados.

---

## 7. Próximo passo

Com a estrutura física pronta, a próxima etapa visual pode desenhar os wireframes sabendo exatamente onde cada responsabilidade será implementada:

```text
shell/sidebar/topbar
→ dashboard
→ pedidos
→ estoque/detalhe
→ movimentações
→ relatórios
→ cadastros
→ login/404/estados de feedback
```
