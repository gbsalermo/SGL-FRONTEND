# Estrutura Física — SGL Frontend

**Atualizado em:** 31/08/2026  
**Status:** referência estrutural atual.  
**Checkpoint funcional:** `../CONTINUIDADE.md`

Este documento nasceu no scaffold inicial, mas foi atualizado para refletir a arquitetura que de fato evoluiu no projeto. Para o inventário exato de arquivos, o código da `main` sempre prevalece.

---

# 1. Organização funcional

```text
SOLICITANTE
Pedidos
├── Novo pedido
└── Meus pedidos

GESTÃO
Pedidos
Estoque
└── Detalhe
    ├── Lotes
    ├── Entrada
    ├── Descarte
    └── Rastreabilidade
Movimentações
Relatórios

ADMINISTRAÇÃO — próxima expansão
Tudo da Gestão
└── Cadastros
    ├── Produtos
    ├── Laboratórios
    ├── Projetos
    ├── Usuários
    └── Estagiários
```

Administração não duplica módulos de Gestão.

**Unidade não faz parte dos Cadastros do frontend.** Sua origem futura será a integração corporativa.

---

# 2. Estrutura base

```text
src/
├── app/
├── assets/
│   ├── icons/
│   └── images/
├── components/
├── layouts/
├── modules/
│   ├── auth/
│   ├── cadastros/
│   ├── dashboard/
│   ├── documentos/
│   ├── estoque/
│   ├── lotes/
│   ├── movimentacoes/
│   ├── pedidos/
│   ├── relatorios/
│   └── system/
├── router/
├── services/
├── stores/
├── types/
├── composables/
├── utils/
└── styles/
```

Pastas vazias ou preparadas para módulos futuros não significam que a funcionalidade já está implementada. Conferir `src/router/index.ts` e o conteúdo real do módulo.

---

# 3. Papel das áreas

```text
app
→ inicialização/composição global

assets
→ imagens, animações e ícones importados

components
→ componentes realmente compartilhados

layouts
→ shell por responsabilidade

modules
→ features/domínios da interface

router
→ rotas, metadata e guards

services
→ comunicação HTTP

stores
→ estado global real

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
→ Axios/http
→ Backend
```

Evitar:

```text
View → axios direto espalhado
Component visual → regra de negócio crítica
Store → depósito de todo dado remoto
```

---

# 6. CSS e assets

```text
src/assets
→ imagens/ícones importados

public
→ arquivos servidos diretamente quando apropriado

src/styles
→ CSS/tokens globais
```

A página 404 utiliza:

```text
public/animations/folder-not-found.lottie
```

Arquivos principais de estilo continuam organizados em tokens/base/main conforme a evolução do projeto.

---

# 7. Regras estruturais

1. Solicitante e Gestão compartilham domínio, mas podem possuir Views diferentes quando a responsabilidade muda a experiência.
2. Administração reutiliza Gestão e adiciona Cadastros.
3. Lote continua contextual a Estoque mesmo que possua organização técnica própria.
4. Documentos podem ter módulo técnico, mas aparecem no contexto de Pedido/Produto/Lote.
5. Fiscalização é parte do cadastro de Produto e possui relatório especializado; não precisa de item isolado principal.
6. Não criar componente compartilhado antes de existir reuso/responsabilidade real.
7. Não criar service/store apenas para preencher pastas.
8. Não criar módulo/rota de Unidade em Cadastros.
9. Não criar área operacional `/produtos` duplicando o cadastro.
10. UUID público é o identificador da fronteira.

---

# 8. Rotas x pastas

A existência de uma pasta não garante uma rota.

Rotas realmente implementadas hoje:

```text
/login
/meus-pedidos
/pedidos/novo
/pedidos
/estoque
/estoque/:id
/movimentacoes
/relatorios
/solicitacoes/novo
/solicitacoes/meus-pedidos
/:pathMatch(.*)*
```

Exemplos de módulos/pastas preparados, mas cuja experiência final ainda está pendente:

```text
cadastros
Dashboard final
documentos
```

---

# 9. Próxima evolução estrutural

A próxima feature é `cadastros/produtos`.

Criar apenas a estrutura necessária para:

```text
listagem/busca
formulário novo/editar
types
service HTTP
componentes específicos
fiscalização
feedback
```

Depois repetir o padrão validado, com adaptação real, para Laboratórios, Projetos, Usuários e Estagiários.

---

# 10. Documento histórico

O Git conserva versões anteriores deste arquivo que descrevem o scaffold “antes dos wireframes”. Essas versões são úteis para entender a origem da arquitetura, mas não devem ser usadas como estado atual ou roadmap.
