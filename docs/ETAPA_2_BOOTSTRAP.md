# Etapa 2 — Bootstrap técnico do SGL Frontend

> **DOCUMENTO HISTÓRICO.** Esta etapa foi concluída em 25/08/2026 e este arquivo preserva decisões técnicas da criação do frontend. Qualquer seção de “próximo passo” abaixo deve ser lida apenas como registro da época. Para o estado atual, usar `../CONTINUIDADE.md`, `DOSSIE_PROJETO_SGL.md` e `README.md`.

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

Esse fluxo é exclusivamente histórico. Todos os principais blocos acima evoluíram e o primeiro protótipo funcional já foi aprovado.

---

## Stack definida no bootstrap

```text
Vue 3
Vite
TypeScript
Vue Router
Pinia
Axios
Vuetify 3
```

Linha de versões adotada na origem:

```text
Vue                 3.5.x
Vite                8.x
TypeScript          5.9.x
Vue Router          5.x
Pinia               4.x
Axios               1.x
Vuetify             3.x
vite-plugin-vuetify 2.x
vue-tsc             3.x
```

### Compatibilidade TypeScript

Durante a validação inicial, TypeScript 7.0.x apresentou incompatibilidade com `vue-tsc 3.3.x`, devido ao acesso ao subpath interno `typescript/lib/tsc`.

A decisão foi manter TypeScript na linha 5.9. Também foram incluídos os tipos de Node necessários ao `vite.config.ts`.

Essas informações explicam a origem da base, mas versões atuais devem ser confirmadas no `package.json`.

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

A árvore evoluiu significativamente desde então. Usar o repositório atual para inventário real de arquivos.

---

## Regras do bootstrap que continuam válidas

### API

```text
VITE_API_BASE_URL
```

Axios centralizado em `src/services/http.ts`.

Não espalhar chamadas HTTP diretamente em Views e Components sem necessidade.

### Estado global

Pinia para estado realmente compartilhado. Não criar Store apenas por existir uma listagem ou formulário.

### Tema

A etapa estabeleceu a base de tokens visuais. A implementação atual de tema claro/escuro e os arquivos atuais de estilo prevalecem sobre valores históricos registrados aqui.

---

## Validação histórica executada

```bash
npm install
npm run type-check
npm run dev
```

Resultado na época:

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

## Registro de próximos passos da época

Em 25/08/2026, a sequência ainda previa Login, Pedidos e posteriormente Administração. Essas etapas foram concluídas e **não representam pendências atuais**.

Estado vigente em 04/09/2026:

```text
primeiro protótipo funcional aprovado
→ pré-produção pós-aprovação em andamento
→ roadmap formal de matriz/permissões somente depois desse bloco
```

Para continuidade real, não usar este documento como roadmap.
