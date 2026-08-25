# Etapa 2 — Bootstrap técnico do SGL Frontend

## Status

**CONCLUÍDA E VALIDADA LOCALMENTE em 25/08/2026.**

A subetapa 1.3 não foi concluída no formato originalmente previsto de prototipar todas as telas e todos os componentes antes da implementação.

O projeto já possui identidade visual, paleta, tipografia, shell, sidebar, topbar, motion, iconografia, padrões de página, busca/filtros e protótipos de referência suficientes para orientar o desenvolvimento.

A partir daqui, componentes reutilizáveis e refinamentos visuais serão consolidados durante a implementação real dos módulos.

Fluxo prioritário de implementação:

```text
LOGIN
→ INTERFACE DE PEDIDOS DO SOLICITANTE
→ INTERFACE DE GESTÃO
→ ESTOQUE / LOTES / MOVIMENTAÇÕES
→ ADMINISTRAÇÃO
→ RELATÓRIOS / DOCUMENTOS
```

---

## Stack oficial

```text
Vue 3
Vite
TypeScript
Vue Router
Pinia
Axios
Vuetify 3
```

Versões base atuais:

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

Essas decisões passam a fazer parte da base oficial do frontend.

---

## Base técnica criada

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

## Regras do bootstrap

### API

A URL do backend vem de:

```text
VITE_API_BASE_URL
```

O cliente Axios é centralizado em `src/services/http.ts`.

Não espalhar chamadas Axios diretamente por Views e Components.

### Estado global

Pinia será usado somente quando o estado for realmente compartilhado.

Exemplos futuros:

```text
sessão/autenticação
usuário atual
responsabilidade/permissões
preferência de aparência
```

Não criar Store para toda listagem ou formulário.

### Router

A primeira rota real do sistema é:

```text
/login
```

Durante o bootstrap, `/` redireciona para `/login`.

As demais rotas serão adicionadas conforme cada fluxo for implementado e validado.

### Tema

A base do Vuetify já recebe a identidade aprovada do SGL:

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

Os tokens permanecem em `src/styles/tokens.css`.

---

## Validação executada

Comandos utilizados:

```bash
npm install
npm run type-check
npm run dev
```

Resultado confirmado:

```text
instalação concluída                         ✅
TypeScript / vue-tsc sem erros               ✅
Vite iniciou normalmente                    ✅
aplicação abriu no navegador                ✅
/ redirecionou para /login                  ✅
/login renderizou o placeholder técnico     ✅
Vuetify carregado                           ✅
Pinia registrado                            ✅
Router funcionando                          ✅
```

O bootstrap está oficialmente validado.

---

## Próximo passo

A próxima sessão deve começar diretamente pela **interface real de Login do SGL**.

Direção aprovada:

```text
padrão visual inspirado no Publica / Embrapa
layout dividido aproximadamente 50/50
lado esquerdo com imagem de laboratório + overlay azul
marca oficial do SGL em destaque
símbolos institucionais abaixo
lado direito branco e limpo
formulário simples de acesso
sem card excessivo
sem repetição da marca SGL no lado direito
```

Ordem após concluir e validar o Login:

```text
Login
→ Pedidos do Solicitante
→ Gestão
```
