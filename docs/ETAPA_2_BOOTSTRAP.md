# Etapa 2 — Bootstrap técnico do SGL Frontend

## Decisão de processo

A subetapa 1.3 não será concluída no formato originalmente previsto de prototipar todas as telas e todos os componentes antes da implementação.

O projeto já possui identidade visual, paleta, tipografia, shell, sidebar, topbar, motion, iconografia, padrões de página, busca/filtros e protótipos de referência suficientes para iniciar o desenvolvimento.

A partir daqui, os componentes reutilizáveis e os refinamentos visuais serão consolidados durante a implementação real dos módulos, mantendo os protótipos aprovados como referência.

Fluxo prioritário de implementação:

```text
LOGIN
→ INTERFACE DE PEDIDOS DO SOLICITANTE
→ INTERFACE DE GESTÃO
→ ESTOQUE / LOTES / MOVIMENTAÇÕES
→ ADMINISTRAÇÃO
→ RELATÓRIOS / DOCUMENTOS
```

## Stack oficial

A stack fica formalmente definida como:

```text
Vue 3
Vite
TypeScript
Vue Router
Pinia
Axios
Vuetify 3
```

Decisão sobre Vuetify:

- manter Vuetify 3 no SGL mesmo com a existência do Vuetify 4;
- motivo: linha v3 estável, madura e alinhada ao planejamento já feito;
- evitar migração de major version no início do frontend sem benefício funcional necessário.

Versões iniciais registradas no `package.json`:

```text
Vue              3.5.x
Vite             8.2.x
TypeScript       7.0.x
Vue Router       5.2.x
Pinia            4.0.x
Axios            1.19.x
Vuetify          3.13.x
vite-plugin-vuetify 2.1.x
vue-tsc          3.3.x
```

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

Não espalhar `axios.get/post/...` diretamente pelas Views ou componentes.

### Estado global

Pinia será usado somente para estado realmente compartilhado.

Exemplos futuros:

```text
sessão temporária / autenticação
usuário atual
responsabilidade/permissões
preferência de aparência
```

Não criar Store para toda listagem ou formulário.

### Router

A primeira rota real do sistema será `/login`.

A rota raiz redireciona para o Login durante o bootstrap.

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

Os tokens permanecem em `src/styles/tokens.css` para uso fora dos componentes Vuetify e para manter a identidade centralizada.

## Validação obrigatória antes de avançar

No ambiente local:

```bash
npm install
npm run type-check
npm run dev
```

Validar:

```text
1. instalação sem conflito de dependência
2. Vite inicia normalmente
3. aplicação abre no navegador
4. / redireciona para /login
5. Vuetify está carregado
6. Pinia está registrado
7. TypeScript não apresenta erro
8. VITE_API_BASE_URL é lida corretamente após criar .env
```

Só depois dessa validação o bootstrap deve ser considerado concluído.

## Próximo passo após validação

```text
ETAPA 3 / primeiro fluxo real
→ implementar Login do SGL
→ seguir o protótipo aprovado inspirado no Publica
→ depois Interface de Pedidos do Solicitante
→ depois Interface de Gestão
```
