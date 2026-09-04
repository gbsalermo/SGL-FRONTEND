# Estrutura Física — SGL Frontend

**Atualizado em:** 04/09/2026  
**Status:** referência estrutural vigente.  
**Checkpoint funcional:** `../CONTINUIDADE.md`

Este documento descreve a organização arquitetural do frontend. Para o inventário exato de arquivos e rotas, o código da `main` e `src/router/index.ts` sempre prevalecem.

---

# 1. Organização funcional atual

```text
SOLICITANTE
├── Dashboard / Início
├── Novo pedido
├── Meus pedidos
├── Informar resíduo
└── Meus resíduos

GESTÃO
├── Dashboard
├── Pedidos
├── Estoque
│   ├── Detalhe
│   ├── Lotes
│   ├── Entrada
│   ├── Descarte
│   └── Rastreabilidade
├── Movimentações
├── Resíduos
├── Estagiários
└── Relatórios

ADMINISTRAÇÃO
├── tudo da Gestão
└── Cadastros
    ├── Laboratórios
    ├── Projetos
    ├── Produtos
    └── Permissões
```

Administração não duplica módulos de Gestão.

**Unidade não faz parte de um CRUD manual normal do frontend.** Sua origem definitiva será a integração corporativa.

---

# 2. Estrutura base

```text
src/
├── app/
├── assets/
├── components/
├── layouts/
├── modules/
│   ├── admin/
│   ├── auth/
│   ├── cadastros/
│   ├── dashboard/
│   ├── estagiarios/
│   ├── estoque/
│   ├── movimentacoes/
│   ├── pedidos/
│   ├── produtos/
│   ├── relatorios/
│   ├── residuos/
│   └── system/
├── router/
├── services/
├── stores/
├── types/
├── composables/
├── utils/
└── styles/
```

A estrutura deve representar implementação real, não placeholders vazios. Lotes continuam pertencendo funcionalmente ao contexto de Estoque e documentos só devem ganhar módulo próprio quando houver implementação/contrato que justifique isso.

---

# 3. Papel das áreas

```text
app
→ inicialização e composição global

assets
→ imagens, ícones e recursos importados

components
→ componentes realmente compartilhados

layouts
→ shell por responsabilidade/perfil

modules
→ features e domínios da interface

router
→ rotas, metadata e guards

services
→ comunicação HTTP

stores
→ estado global compartilhado

types
→ tipos compartilhados

composables
→ lógica Vue reutilizável

utils
→ funções puras/utilitários

styles
→ tokens e CSS global
```

---

# 4. Padrão interno de módulo

Quando a feature justificar:

```text
modules/<feature>/
├── components/
├── views/
├── services/ ou service.ts
├── types/
├── composables/
└── utils/ quando específico
```

Não criar todas essas pastas mecanicamente. A estrutura deve nascer da responsabilidade real.

---

# 5. Fluxo de dependência recomendado

```text
View
→ Component
→ Service / Store quando necessário
→ http/Axios
→ Backend
```

Evitar:

```text
View → axios direto espalhado
Component visual → regra crítica de negócio
Store → depósito genérico de todo dado remoto
```

Regras oficiais de domínio permanecem no backend.

---

# 6. Comunicação com backend e Unidade

A comunicação HTTP é centralizada em:

```text
src/services/http.ts
```

Base URL:

```text
VITE_API_BASE_URL
```

Em desenvolvimento existe fallback para:

```text
http://localhost:8080/api
```

O interceptor HTTP lê a Unidade da sessão DEV e envia:

```text
X-SGL-Unidade-Id
```

Esse contexto suporta o isolamento funcional multitenant atual. Não tratá-lo como autenticação/autorização definitiva.

---

# 7. CSS, tema e assets

```text
src/assets
→ imagens/ícones importados

public
→ arquivos servidos diretamente

src/styles
→ tokens e estilos globais
```

O tema claro/escuro é persistido para as interfaces autenticadas.

**Decisão atual:** a tela de login não deve ser afetada automaticamente pelo tema das interfaces internas.

A página 404 utiliza:

```text
public/animations/folder-not-found.lottie
```

---

# 8. Regras estruturais

1. Solicitante e Gestão compartilham domínio, mas podem ter Views diferentes quando a responsabilidade muda a experiência.
2. Administração reutiliza Gestão e adiciona Cadastros.
3. Lote continua contextual a Estoque; não manter módulo vazio apenas para representar esse conceito.
4. Documentos só devem ganhar experiência/módulo definitivo quando houver contrato backend real.
5. Fiscalização faz parte do cadastro de Produto e possui relatório especializado; não exige item isolado principal.
6. Não criar componente compartilhado antes de existir reuso/responsabilidade real.
7. Não criar service/store/pasta apenas para preencher estrutura prevista.
8. Não criar CRUD manual de Unidade.
9. Não criar área operacional de Produto duplicando Cadastro/Estoque sem nova decisão.
10. UUID público é o identificador de fronteira.
11. Guards do frontend são UX; autorização definitiva pertence ao backend.

---

# 9. Rotas atuais

Fonte: `src/router/index.ts`.

```text
/login
/inicio
/meus-pedidos
/meus-residuos
/pedidos/novo
/residuos/novo
/dashboard
/pedidos
/estoque
/estoque/lotes-vencendo
/estoque/:id
/movimentacoes
/estagiarios
/residuos
/relatorios
/relatorios/residuos
/relatorios/pessoas-laboratorio
/administracao/cadastros
/solicitacoes/novo
/solicitacoes/meus-pedidos
/residuos/:id/rotulo
/produtos/:id/rotulo
/:pathMatch(.*)*
```

---

# 10. Estado de evolução

Não existe “próxima feature estrutural” definida por este documento.

O primeiro protótipo foi funcionalmente aprovado e o projeto está em pré-produção pós-aprovação. A sequência vigente está em `../CONTINUIDADE.md`.

Este arquivo deve ser atualizado quando a arquitetura física mudar de forma relevante, não a cada alteração visual ou pequena feature.
