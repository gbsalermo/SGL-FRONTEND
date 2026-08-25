# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Repositório frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend de referência:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 25/08/2026  
**Fase atual:** Etapa 3 — primeira interface real  
**Próximo bloco exato:** implementar a interface de Login

Este arquivo é a fonte principal de retomada do frontend.

---

# 0. Como continuar

Ao abrir uma nova sessão:

```text
1. ler este CONTINUIDADE.md
2. ler docs/ETAPA_2_BOOTSTRAP.md
3. conferir README.md quando precisar de visão geral
4. usar Swagger/OpenAPI como contrato do backend
5. respeitar identidade visual e decisões já fechadas
6. continuar do bloco PRÓXIMO PASSO
```

Regra de processo atual:

> Não vamos concluir um Figma completo antes de codar. O frontend será desenvolvido diretamente a partir dos protótipos e decisões visuais já aprovados, extraindo componentes reutilizáveis durante a implementação real.

---

# 1. Estado do projeto

## Backend

O backend estrutural está concluído.

```text
API REST                                  ✅
Swagger / OpenAPI                         ✅
PostgreSQL                                ✅
Flyway                                    ✅
UUID público na fronteira                 ✅
DTOs request/response separados           ✅
testes principais                         ✅
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

Nunca reconstruir regras de domínio no frontend quando elas já pertencem ao backend.

---

# 2. Arquitetura frontend oficial

```text
SPA
+ Feature-based Architecture
+ Component-based UI
+ responsabilidades claras
```

Fluxo preferencial:

```text
View
→ Component
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

- não espalhar Axios diretamente pelas Views/Components;
- Store somente para estado realmente compartilhado;
- Composable somente quando houver repetição real;
- não duplicar módulos por perfil;
- Admin reutiliza Gestão + Cadastros;
- regras de negócio permanecem no backend.

---

# 3. Stack oficial — DEFINIDA

```text
Vue 3
Vite
TypeScript
Vue Router
Pinia
Axios
Vuetify 3
```

Base atual:

```text
Vue                 3.5.x
Vite                8.2.x
TypeScript          5.9.x
Vue Router          5.2.x
Pinia               4.0.x
Axios               1.19.x
Vuetify             3.13.x
vue-tsc             3.3.x
@types/node         instalado
```

Decisões de compatibilidade:

- TypeScript 7.0.x foi descartado no bootstrap por incompatibilidade com `vue-tsc 3.3.x`;
- TypeScript oficial do projeto ficou em `~5.9.3`;
- `@types/node` foi adicionado porque `vite.config.ts` usa `node:url`;
- `tsconfig.json` inclui os tipos `vite/client` e `node`.

---

# 4. Bootstrap técnico — CONCLUÍDO

Branch utilizada:

```text
feat/bootstrap-etapa-2
```

Base implementada:

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

Validação local concluída em 25/08/2026:

```text
npm install                              ✅
npm run type-check                      ✅
npm run dev                             ✅
Vite iniciou                            ✅
/ redirecionou para /login             ✅
/login renderizou placeholder          ✅
Vuetify carregado                       ✅
Pinia registrado                        ✅
Router funcionando                      ✅
```

O placeholder exibido dizia que o bootstrap técnico estava ativo. Ele deve ser substituído agora pela tela real de Login.

---

# 5. Estratégia de implementação

A antiga subetapa 1.3 de Figma completo foi interrompida de propósito.

O projeto já possui decisões suficientes para começar código real:

```text
identidade visual                         ✅
paleta                                    ✅
tipografia                                ✅
densidade/spacing                         ✅
motion                                    ✅
iconografia                               ✅
sidebar aberta/recolhida                  ✅
alertas operacionais                      ✅
topbar                                    ✅
área principal                            ✅
títulos/breadcrumbs                       ✅
busca/filtros                             ✅
protótipos de referência                  ✅
```

A partir daqui:

```text
protótipo aprovado
→ implementação real
→ identificar repetição
→ extrair componente reutilizável
→ validar
→ próxima tela
```

Ordem de trabalho:

```text
LOGIN
→ PEDIDOS DO SOLICITANTE
→ GESTÃO
→ ESTOQUE / LOTES / MOVIMENTAÇÕES
→ ADMINISTRAÇÃO
→ RELATÓRIOS / DOCUMENTOS
```

---

# 6. Identidade visual aprovada

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

# 7. Login — PRÓXIMA IMPLEMENTAÇÃO

A tela de Login será o primeiro fluxo real do SGL.

Referência estrutural:

```text
Publica / Embrapa
```

Direção visual aprovada:

```text
layout dividido aproximadamente 50/50
```

## Lado esquerdo

```text
imagem de laboratório em tela cheia dentro da coluna
+ overlay azul escuro para contraste
+ identidade institucional
```

Composição aprovada:

```text
logo/identidade Embrapa quando aplicável
marca oficial SGL em destaque
símbolos do projeto abaixo da marca
frase curta institucional
```

Imagem de referência escolhida durante o planejamento:

- laboratório com profissional usando tablet;
- transmite laboratório + tecnologia + gestão;
- overlay sugerido `#0D2B5E` em aproximadamente 72–78%, ajustado visualmente durante implementação.

## Lado direito

```text
fundo branco
sem card grande desnecessário
sem repetir a logo SGL
formulário limpo
```

Conteúdo previsto:

```text
Bem-vindo de volta!
Acesse o sistema para continuar

Usuário / identificação do colaborador
Senha
Entrar
```

Diretrizes:

- seguir o padrão Publica, sem modernização excessiva;
- não repetir a marca SGL nos dois lados;
- evitar visual de landing page;
- responsividade deve preservar legibilidade;
- estados de loading/erro serão definidos na implementação;
- autenticação real ainda é posterior, então não inventar contrato definitivo.

No momento, `/login` existe e renderiza apenas o placeholder técnico.

---

# 8. Navegação funcional aprovada

## Solicitante

```text
Dashboard
└── Pedidos
    ├── Novo pedido
    └── Meus pedidos
        └── Detalhe
```

## Gestão

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

Rotas planejadas:

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
/:pathMatch(.*)*
```

---

# 9. Regras importantes do domínio para o frontend

Pedidos:

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
- frontend não reproduz essas regras.

Documentos:

- backend ainda não possui upload multipart completo;
- não criar persistência fake no frontend.

Fiscalização:

- deve ficar dentro de Relatórios → Fiscalização/Auditoria;
- não duplicar dados operacionais;
- modelagem definitiva aguarda requisito oficial.

---

# 10. Padrões de shell já aprovados

Sidebar:

```text
aberta ~240–248 px
recolhida ~64–72 px
clique para recolher/expandir
não expandir sidebar inteira por hover
mobile → drawer/overlay
```

Topbar:

```text
logo | toggle | espaço | pesquisa | sair
```

Busca/filtros:

```text
busca global → topbar
busca local → página
filtros locais → botão Filtros / área expansível
```

Alertas operacionais Gestão/Admin:

```text
azul      nenhuma pendência
amarelo   atenção
vermelho  urgência
```

Categorias previstas:

```text
Pedidos pendentes
Estoque baixo
Próximos do vencimento
Vencidos
```

---

# 11. Método para implementar cada tela

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

Para mudanças pequenas de configuração/código, preferência do fluxo de trabalho:

```text
assistente explica exatamente a alteração
→ alteração é feita localmente
```

Mudanças maiores/estruturais podem ser feitas diretamente na branch/repositório quando solicitado.

---

# 12. Roadmap atualizado

```text
Etapa 0 — Handoff backend → frontend                    ✅
Etapa 1 — Fundação visual/técnica essencial             ✅
  1.1 Inventário                                        ✅
  1.2 Fluxos                                            ✅
  1.3 Figma completo                                    ⏭️ substituído por implementação direta
  1.4 Stack                                             ✅

Etapa 2 — Bootstrap técnico                             ✅

Etapa 3 — Interfaces reais                              🟡 ATUAL
  3.1 Login                                             ⏳ PRÓXIMO
  3.2 Pedidos do Solicitante                            ⏳
  3.3 Gestão                                            ⏳

Etapa 4 — Estoque / Lotes / Movimentações              ⏳
Etapa 5 — Administração                                 ⏳
Etapa 6 — Relatórios / Documentos / Fiscalização        ⏳
Etapa 7 — Dashboards finais / robustez / 404             ⏳
Etapa 8 — Autenticação / autorização / auditoria        ⏳
```

A numeração prática pode ser refinada conforme o desenvolvimento, mas a ordem funcional acima é a referência.

---

# 13. Documentos importantes

```text
CONTINUIDADE.md
→ fonte principal de retomada

docs/ETAPA_2_BOOTSTRAP.md
→ stack, bootstrap, correções de compatibilidade e validação

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

# 14. Próximo passo exato

Abrir uma sessão focada exclusivamente em:

```text
INTERFACE DE LOGIN
```

Primeiro objetivo dessa sessão:

```text
substituir o placeholder de src/modules/auth/views/LoginView.vue
pela tela real de Login aprovada
```

Não avançar para pedidos antes de:

```text
layout do login validado
responsividade mínima validada
type-check passando
npm run dev funcionando
rota /login correta
```

Depois do Login:

```text
INTERFACE DE PEDIDOS DO SOLICITANTE
```
