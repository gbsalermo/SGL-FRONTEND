# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Repositório frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend de referência:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 25/08/2026  
**Fase atual:** Etapa 3 — Interfaces reais  
**Última etapa concluída:** 3.1 — Login  
**Próximo bloco exato:** 3.2 — Pedidos do Solicitante

Este arquivo é a fonte principal de retomada do frontend.

---

# 0. Como continuar

Ao abrir uma nova sessão:

```text
1. ler este CONTINUIDADE.md
2. ler docs/ETAPA_2_BOOTSTRAP.md quando precisar da base técnica
3. conferir README.md para visão geral e apresentação visual
4. usar Swagger/OpenAPI como fonte de verdade dos contratos do backend
5. respeitar as decisões visuais e arquiteturais já aprovadas
6. continuar do bloco PRÓXIMO PASSO
```

Regra de processo atual:

> Não vamos concluir um Figma completo antes de codar. O frontend é desenvolvido no fluxo `protótipo aprovado → implementação real → extração de componentes quando houver responsabilidade/repetição real → validação → próxima tela`.

---

# 1. Estado geral do projeto

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

# 2. Stack oficial

```text
Vue 3
Vite
TypeScript 5.9
Vue Router
Pinia
Axios
Vuetify 3
```

Base validada:

```text
npm install                              ✅
npm run type-check                      ✅
npm run dev                             ✅
/ redireciona para /login               ✅
Vuetify carregado                       ✅
Pinia registrado                        ✅
Router funcionando                      ✅
```

Decisões de compatibilidade:

- TypeScript oficial: `~5.9.3`;
- `vue-tsc` 3.3.x;
- `@types/node` instalado;
- aliases via `@` configurados no Vite/TypeScript.

---

# 3. Arquitetura frontend oficial

```text
SPA
+ Feature-based Architecture
+ Component-based UI
+ responsabilidades claras
```

Fluxo preferencial:

```text
View
→ Components
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

- não espalhar Axios diretamente por Views/Components;
- Store somente para estado realmente compartilhado;
- Composable somente quando houver repetição real;
- não duplicar módulos por perfil;
- Admin reutiliza Gestão + Cadastros;
- regras de negócio permanecem no backend;
- Views devem representar composição de tela, não concentrar toda a implementação quando já existem responsabilidades claras separáveis.

---

# 4. Estratégia de implementação

A antiga etapa de Figma completo foi abandonada de propósito.

Fluxo oficial:

```text
protótipo aprovado
→ implementação real
→ identificar responsabilidades/repetição
→ extrair componentes quando fizer sentido
→ validar visual e tecnicamente
→ próxima tela
```

Ordem de trabalho:

```text
LOGIN                                  ✅
→ PEDIDOS DO SOLICITANTE              ⏳ PRÓXIMO
→ GESTÃO
→ ESTOQUE / LOTES / MOVIMENTAÇÕES
→ ADMINISTRAÇÃO
→ RELATÓRIOS / DOCUMENTOS
→ DASHBOARDS / ROBUSTEZ / 404
→ AUTENTICAÇÃO / AUTORIZAÇÃO / AUDITORIA
```

---

# 5. Identidade visual aprovada

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

# 6. Etapa 3.1 — Login — CONCLUÍDA

Branch de implementação:

```text
feat/login-interface
```

## Resultado visual aprovado

Layout:

```text
aproximadamente 50/50
lado esquerdo institucional
lado direito branco e limpo
sem card grande
sem repetição da marca SGL no formulário
```

### Lado esquerdo

Composição final:

```text
imagem de laboratório com profissional/tablet
→ tratada como contexto/textura
→ overlay azul institucional forte

Embrapa
↓
marca oficial SGL
↓
Gestão integrada para pedidos, estoque, lotes e relatórios.
↓
quatro ícones auxiliares do domínio
```

Decisões finais:

- fundo enfatiza o azul institucional e apaga parcialmente a fotografia;
- Embrapa branca em destaque, sem competir com a marca SGL;
- logo SGL oficial centralizada;
- ícones ficam abaixo da frase institucional;
- azul e verde funcionam como identidade/apoio;
- conjunto principal foi refinado verticalmente; o ajuste local final aprovado ficou em torno de `translateY(-18px)` — manter essa referência ao sincronizar a última alteração local.

### Lado direito

Conteúdo final:

```text
Bem-vindo
Acesse o sistema para continuar

Usuário de colaborador
Senha
Entrar
```

Características:

- fundo branco;
- formulário sem card grande;
- campos discretos;
- botão em azul institucional;
- controle de mostrar/ocultar senha;
- linguagem institucional simples.

## Estrutura implementada

O Login foi reorganizado para não concentrar toda a tela em um único arquivo:

```text
src/modules/auth/
├── components/
│   ├── LoginBrandPanel.vue
│   └── LoginAccessForm.vue
└── views/
    └── LoginView.vue

src/assets/images/auth/
├── embrapa-white.png
├── login-laboratorio.jpg
└── sgl-logo.png
```

Responsabilidades:

```text
LoginView.vue
→ composição da tela/rota

LoginBrandPanel.vue
→ identidade institucional do lado esquerdo

LoginAccessForm.vue
→ formulário e interação visual do acesso
```

Isso passa a ser uma referência prática para as próximas telas: componentes devem nascer de responsabilidades reais, sem transformar toda View em um arquivo monolítico.

## Escopo deliberadamente não implementado ainda

```text
autenticação real
JWT/sessão
store de autenticação
service definitivo de login
redirecionamento por perfil
Embrapa ID / integração corporativa
recuperação de senha
```

Não inventar contrato de autenticação antes da etapa específica.

## Apresentação visual

O README possui uma seção para apresentar o Login final usando o caminho:

```text
docs/screenshots/login-final.png
```

Ao atualizar o screenshot aprovado, manter esse nome para que o README continue renderizando sem alterações.

---

# 7. Navegação funcional aprovada

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

# 8. Regras importantes do domínio para o frontend

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

# 9. Padrões de shell já aprovados

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

# 10. Método para implementar cada tela

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

Fluxo de trabalho preferido:

```text
mudança pequena
→ assistente explica exatamente a alteração
→ alteração pode ser feita localmente

mudança estrutural
→ pode ser feita diretamente na branch/repositório quando solicitado
```

---

# 11. Roadmap atualizado

```text
Etapa 0 — Handoff backend → frontend                    ✅
Etapa 1 — Fundação visual/técnica essencial             ✅
  1.1 Inventário                                        ✅
  1.2 Fluxos                                            ✅
  1.3 Figma completo                                    ⏭️ substituído por implementação direta
  1.4 Stack                                             ✅

Etapa 2 — Bootstrap técnico                             ✅

Etapa 3 — Interfaces reais                              🟡 ATUAL
  3.1 Login                                             ✅ CONCLUÍDO
  3.2 Pedidos do Solicitante                            ⏳ PRÓXIMO
  3.3 Gestão                                            ⏳

Etapa 4 — Estoque / Lotes / Movimentações              ⏳
Etapa 5 — Administração                                 ⏳
Etapa 6 — Relatórios / Documentos / Fiscalização        ⏳
Etapa 7 — Dashboards finais / robustez / 404             ⏳
Etapa 8 — Autenticação / autorização / auditoria        ⏳
```

---

# 12. Documentos importantes

```text
CONTINUIDADE.md
→ fonte principal de retomada

README.md
→ visão geral, apresentação e screenshot do estado visual aprovado

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

# 13. Próximo passo exato

Abrir uma sessão focada em:

```text
ETAPA 3.2 — PEDIDOS DO SOLICITANTE
```

Primeiro fluxo a detalhar/implementar:

```text
Pedidos
├── Novo pedido
└── Meus pedidos
    └── Detalhe
```

Antes de codar cada parte:

```text
conferir Swagger/OpenAPI
→ identificar contratos reais
→ definir a experiência do solicitante
→ implementar diretamente
→ extrair componentes quando a responsabilidade/repetição aparecer
```

A tela de Login está oficialmente encerrada como referência visual e arquitetural da primeira interface real do SGL.
