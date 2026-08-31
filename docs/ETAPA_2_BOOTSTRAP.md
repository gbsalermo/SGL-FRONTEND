# Etapa 2 — Bootstrap técnico do SGL Frontend

> **Documento histórico.** Esta etapa foi concluída e este arquivo preserva as decisões técnicas do bootstrap. A seção “próximo passo” registrada na época **não representa o estado atual do projeto**. Para retomar o desenvolvimento em 31/08/2026, usar `../CONTINUIDADE.md` e `DOSSIE_PROJETO_SGL.md`.

## Status

**CONCLUÍDA E VALIDADA LOCALMENTE em 25/08/2026.**

A subetapa 1.3 não foi concluída no formato originalmente previsto de prototipar todas as telas e todos os componentes antes da implementação.

O projeto já possuía identidade visual, paleta, tipografia, shell, sidebar, topbar, motion, iconografia, padrões de página, busca/filtros e protótipos de referência suficientes para orientar o desenvolvimento.

A partir desse ponto, componentes reutilizáveis e refinamentos visuais passaram a ser consolidados durante a implementação real dos módulos.

Fluxo prioritário registrado naquele momento:

```text
LOGIN
→ INTERFACE DE PEDIDOS DO SOLICITANTE
→ INTERFACE DE GESTÃO
→ ESTOQUE / LOTES / MOVIMENTAÇÕES
→ ADMINISTRAÇÃO
→ RELATÓRIOS / DOCUMENTOS
```

Esse fluxo é histórico. O roadmap atual já concluiu Login, Pedidos, Estoque/Lotes, Movimentações, Relatórios/Fiscalização, PDF/XLSX e 404; Administração/Cadastros é a próxima etapa vigente.

---

## Stack oficial definida no bootstrap

```text
Vue 3
Vite
TypeScript
Vue Router
Pinia
Axios
Vuetify 3
```

Versões da linha adotada:

```text
Vue                 3.5.x
Vite                8.2.x
TypeScript          5.9.x
Vue Router          5.2.x
Pinia               4.0.x
Axios               1.19.x
Vuetify             3.13.x
vite-plugin-vuetify 2.1.x
vue-tsc             3.3.x
@types/node         instalado para tipagem do ambiente Node/Vite
```

### Compatibilidade TypeScript

Durante a validação inicial, TypeScript 7.0.x apresentou incompatibilidade com `vue-tsc 3.3.x`, devido ao acesso ao subpath interno `typescript/lib/tsc`.

A correção adotada foi manter TypeScript na linha `~5.9.3`.

Também foi necessário incluir `@types/node` e o tipo `node` no `tsconfig.json`, pois `vite.config.ts` utiliza `node:url`.

Essas decisões fazem parte da origem da base atual.

---

## Base técnica criada na etapa

```text
package.json
index.html
vite.config.ts
tsconfig.json
.env.example
src/main.ts
src/App.vue
src/app/vuetify.ts
src/router/index.ts
src/services/http.ts
src/modules/auth/views/LoginView.vue
src/styles/tokens.css
```

A árvore evoluiu significativamente depois disso; usar o repositório atual para inventário real de arquivos.

---

## Regras do bootstrap que continuam válidas

### API

```text
VITE_API_BASE_URL
```

Axios centralizado em `src/services/http.ts`.

Não espalhar chamadas HTTP diretamente em Views e Components.

### Estado global

Pinia somente para estado realmente compartilhado.

Não criar Store para toda listagem ou formulário.

### Tema

Paleta base definida:

```text
#1A4DA1 azul principal
#0D2B5E azul escuro
#2D6BC4 azul claro
#007A3D verde institucional
#F5F7FA background
#FFFFFF surface
#1A1A2E texto
#64748B texto secundário
#E2E8F0 borda
```

Tokens em `src/styles/tokens.css`.

---

## Validação histórica executada

```bash
npm install
npm run type-check
npm run dev
```

Resultado no fechamento da etapa:

```text
instalação concluída                         ✅
TypeScript / vue-tsc sem erros               ✅
Vite iniciou normalmente                    ✅
aplicação abriu no navegador                ✅
/ redirecionou para /login                  ✅
Vuetify carregado                           ✅
Pinia registrado                            ✅
Router funcionando                          ✅
```

---

## Próximo passo registrado em 25/08/2026 — HISTÓRICO

Naquele momento, a próxima tarefa era a interface real de Login e depois Pedidos do Solicitante/Gestão.

Essas etapas já foram concluídas.

**Próximo passo vigente em 31/08/2026:**

```text
Administração → Cadastros → Produtos
```

Depois: Laboratórios → Projetos → Usuários → Estagiários.
