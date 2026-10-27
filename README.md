<a id="readme-top"></a>

<div align="center">
  <img src="https://raw.githubusercontent.com/gbsalermo/Sistema-SGL/main/docs/LOGO.png" alt="SGL Logo" width="340" height="auto">

# SGL — Sistema de Gestão de Laboratórios

**Frontend corporativo para pedidos, estoque, lotes, resíduos, movimentações, relatórios, administração e acompanhamento operacional.**

`Vue 3` · `TypeScript` · `Vite` · `Pinia` · `Axios` · `Vuetify`

</div>

---

## Estado atual — 16/10/2026

O primeiro protótipo do SGL foi aprovado funcionalmente, e as **Etapas 1–7 da pré-produção foram concluídas e validadas pelo responsável**. A Etapa 7 consolidou unidades e apresentações, recipientes físicos, medidas decimais, Soluções, Pedidos por embalagem ou medida, abertura parcial de embalagens, alertas de estoque mínimo configuráveis e integração backend/frontend. **A Etapa 8 é a próxima**, com contexto de participação dos Estagiários em Pedidos/Soluções e teste operacional completo. A homologação integral e a autenticação/autorização definitiva ainda são trabalhos posteriores.

Estado consolidado:

```text
Login visual / sessão DEV                         ✅
Expiração automática da sessão DEV em 5h          ✅
Pedidos do Solicitante                            ✅
Pedidos da Gestão                                 ✅
Estoque / lotes                                   ✅
Movimentações                                     ✅
Relatórios / fiscalização                         ✅
PDF/XLSX                                          ✅
Resíduos — Solicitante e Gestão                   ✅
Rótulos de Resíduo e Produto                      ✅
Estagiários                                       ✅
Pessoas por laboratório                           ✅
Administração / Cadastros                         ✅
Dashboard Gestão                                  ✅
Dashboard Solicitante                             ✅
Alertas operacionais                              ✅
Busca global                                      ✅
Modo claro/escuro definitivo + persistência       ✅
404                                               ✅
Contexto de Unidade enviado à API                 ✅
Autenticação/autorização definitiva               ⏳ etapa formal posterior
Integração corporativa                            ⏳ etapa formal posterior
```

> Para retomar o projeto, começar por [`CONTINUIDADE.md`](CONTINUIDADE.md), [`docs/SINCRONIZACAO_GITLAB_GITHUB.md`](docs/SINCRONIZACAO_GITLAB_GITHUB.md), pelo plano e handoff da Etapa 4 no backend, por [`docs/DOSSIE_PROJETO_SGL.md`](docs/DOSSIE_PROJETO_SGL.md) e `src/router/index.ts`. GitLab é a fonte canônica de `main`; contratos HTTP pertencem ao Swagger/OpenAPI do backend.

---

## Papel do frontend

A aplicação organiza três experiências:

```text
SOLICITANTE
→ acompanhar o próprio contexto
→ solicitar materiais
→ informar e acompanhar resíduos

GESTÃO
→ dashboard operacional
→ pedidos
→ estoque/lotes
→ movimentações
→ resíduos
→ estagiários
→ relatórios

ADMINISTRAÇÃO
→ tudo da Gestão
→ Administração/Cadastros
→ alteração de perfis de usuários existentes
```

Regras críticas de domínio continuam no backend.

---

## Stack

```text
Vue 3.5
Vite 8
TypeScript 5.9
Vue Router 5
Pinia 4
Axios 1.x
Vuetify 3.13
Node >= 20.19
```

Diretrizes:

- UUID público nas fronteiras com a API;
- Axios concentrado em `services`;
- Pinia para estado compartilhado;
- regras oficiais de estoque, FIFO/FEFO e transições no backend;
- interface em português;
- nomenclatura técnica em inglês apenas em eventual refactor futuro planejado.

---

## Rotas atuais

Fonte de verdade: `src/router/index.ts`.

### Comum

```text
/login
/:pathMatch(.*)*
```

### Solicitante

```text
/inicio
/meus-pedidos
/meus-residuos
/pedidos/novo
/residuos/novo
```

### Gestão / Administração

```text
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
/administracao/cadastros       ADMINISTRADOR
/solicitacoes/novo
/solicitacoes/meus-pedidos
```

### Rótulos

```text
/residuos/:id/rotulo
/produtos/:id/rotulo
```

Rota inicial por perfil:

```text
GESTOR / ADMINISTRADOR
→ /dashboard

TECNICO / ANALISTA / PESQUISADOR / ESTAGIARIO
→ /inicio
```

---

## Sessão e contexto de Unidade

O login usa a conta da Embrapa (login de rede, ou CPF para colaboradores) e a senha da Embrapa. O backend valida as credenciais e devolve um JWT próprio do SGL.

```text
login + senha → POST /v1/auth/login → { token, expiraEm, usuario }
→ sessão persistida em localStorage, chave sgl.session (a antiga sgl.dev-session é apagada)
→ expira em 5 horas
→ interceptor envia Authorization: Bearer <token>
```

- Usuário `PENDENTE_VINCULACAO` só vê `/aguardando-aprovacao` ("Verificar novamente" consulta `/v1/auth/me`).
- 401 em rota protegida encerra a sessão e volta ao login; 403 com `USUARIO_PENDENTE` leva à tela de espera.
- A Unidade vem da sessão no backend. O header `X-SGL-Unidade-Id` só é enviado pelo **Administrador geral**, quando ele escolhe outra Unidade no seletor da barra superior.
- O botão "Entrar como desenvolvedor" aparece só quando o backend roda em `dev`/`demo` (`/v1/auth/config`).

Telas novas da gestão: aba **Pendentes** e **Importar da Embrapa** em Vínculos de usuários; **Unidades** (habilitação), só para o Administrador geral.

---

## Pedidos

### Solicitante

```text
/pedidos/novo
/meus-pedidos
```

### Gestão

```text
/pedidos
```

Regras que não devem ser duplicadas no frontend:

```text
criação → não baixa estoque
aprovação → baixa estoque
entrega → sem segunda baixa
cancelamento aprovado → restaura lotes utilizados
perecível → FEFO
não perecível → FIFO
```

Urgência não muda FIFO/FEFO.

---

## Estoque e lotes

```text
/estoque
/estoque/:id
/estoque/lotes-vencendo
```

Cobertura:

- saldo consolidado;
- estoque mínimo;
- busca e filtros;
- entrada de lote;
- Código SGL;
- embalagem e multiplicador;
- fracionamento irreversível `false → true`;
- validade;
- descarte por vencimento;
- histórico/rastreabilidade;
- integração com dashboard, alertas e busca global.

Lotes continuam pertencendo ao contexto de Estoque; não há motivo para criar uma área principal independente.

---

## Resíduos

Decisão de domínio:

```text
Produto != Resíduo
```

### Solicitante

```text
/residuos/novo
/meus-residuos
```

### Gestão

```text
/residuos
```

Fluxo:

```text
INFORMADO
→ EM_ANALISE
→ LIBERADO_PARA_ARMAZENAMENTO
→ ARMAZENADO_TEMPORARIAMENTE
→ DESPACHADO
```

O Código SGL existe desde o registro inicial.

Rótulo:

```text
/residuos/:id/rotulo
```

O visual atual não utiliza QR Code.

Relatório:

```text
/relatorios/residuos
```

Modelos de resíduos pré-determinados permanecem possibilidade futura, não requisito atual.

---


### Estado atual de Estagiários para futura integração

Contrato backend já estabilizado para a futura integração do 6.5:

- vínculo institucional com histórico;
- múltiplas participações em Atividades;
- Formação + Curso por vínculo;
- treinamento de segurança no vínculo;
- Culturas associadas por participação;
- cada participação deriva SCI, Projeto e Laboratório;
- a interface futura não deve apresentar um único “Laboratório do Estagiário” como atributo definitivo.

Até o 6.5, as telas atuais continuam sendo tratadas como compatibilidade visual e não como representação final desse domínio.

## Estagiários

```text
/estagiarios
```

Cobertura:

```text
listagem
cadastro
edição
Unidade/Laboratório
período
tipo de vínculo
encerramento com data efetiva
indicadores de término/vencimento
```

Relatório complementar:

```text
/relatorios/pessoas-laboratorio
```

---

## Administração / Cadastros

```text
/administracao/cadastros
```

Rota exclusiva de `ADMINISTRADOR`.

Áreas:

```text
Laboratórios
Projetos
Produtos
Permissões
Resíduos — modelos e cadastros reutilizáveis
```

Decisões:

- Unidade não tem CRUD manual normal;
- usuário não é criado manualmente nessa central;
- Permissões altera perfil de usuários existentes;
- Produto representa catálogo-base, não estoque;
- Laboratório respeita Unidade e responsável;
- Projetos preservam histórico por ativação/inativação quando necessário.

---

## Relatórios

Central:

```text
/relatorios
```

Cobertura:

```text
Estagiários
Produtos
Movimentações
Resumo operacional
Estoque e lotes
Fiscalização
Resíduos
Pessoas por laboratório
```

Pedidos entregues são recorte de Movimentações, não relatório separado.

Prévia e exportação devem usar os mesmos filtros.

---

## Dashboard, alertas, busca e aparência

Dashboard da Gestão:

```text
/dashboard
```

Indicadores operacionais incluem:

```text
pedidos pendentes/urgentes
estoque baixo
lotes vencidos
lotes próximos do vencimento
resíduos aguardando ação / em análise
movimentações recentes
resumo por laboratório
```

Dashboard do Solicitante:

```text
/inicio
```

Shell integrado:

```text
Alertas operacionais            ✅
Busca global                    ✅
Tema claro/escuro               ✅
Persistência de preferência     ✅
Responsividade                  ✅
```

A tela de login não deve ser alterada pelo tema das interfaces autenticadas sem decisão explícita.

---

## Segurança — interpretação correta

```text
login corporativo + sessão JWT                 ✅
autorização das operações novas no servidor    ✅
Unidade derivada da sessão                     ✅
guardas de rota por perfil                     ✅ UX
matriz completa de permissões por módulo       ⏳
```

Visibilidade de menu/rota continua sendo só UX; quem decide é o backend.

---

## Sequência de trabalho

### Agora — pré-produção pós-aprovação

```text
Etapa 1 — padrão visual global                 ✅
Etapa 2 — Dark Mode definitivo                 ✅
Etapa 3 — refinamentos do fluxo de Resíduos    ✅
Etapa 4 — expansão operacional de Resíduos     ✅
Etapa 5 — Projetos e Atividades                ✅ concluída e validada
Etapa 6 — Estagiários e vínculos               🔧 backend 6.1–6.4 validado; frontend 6.5 implementado, validação pendente
Etapas 7 a 13                                  ⏳ sequenciais
```

### Depois — roadmap formal de produção

```text
1. matriz/diretrizes de permissões
2. congelamento funcional
3. homologação integrada final
4. correção de falhas encontradas
5. autenticação + autorização + auditoria definitiva
6. integração corporativa / tenant confiável
7. documentos/upload quando houver contrato
8. refactors técnicos planejados
```

O roadmap formal continua válido; apenas começa após o bloco atual.

---

## Documentação

| Documento | Uso |
|---|---|
| [`CONTINUIDADE.md`](CONTINUIDADE.md) | checkpoint e fase atual |
| [`docs/DOSSIE_PROJETO_SGL.md`](docs/DOSSIE_PROJETO_SGL.md) | handoff consolidado |
| [`docs/README.md`](docs/README.md) | índice e classificação documental |
| [`docs/INVENTARIO_TELAS.md`](docs/INVENTARIO_TELAS.md) | rotas/telas |
| [`docs/FLUXOS_NAVEGACAO.md`](docs/FLUXOS_NAVEGACAO.md) | jornadas |
| [`docs/ROADMAP_INTERFACE_GESTAO.md`](docs/ROADMAP_INTERFACE_GESTAO.md) | roadmap formal posterior |
| [`docs/FECHAMENTO_PRIMEIRO_PROTOTIPO.md`](docs/FECHAMENTO_PRIMEIRO_PROTOTIPO.md) | registro do fechamento/aprovação do protótipo |

---

## Execução

```bash
npm install
npm run dev
```

Build e testes (Vitest + jsdom):

```bash
npm run build
npm test
```

---

<div align="center">
  <strong>SGL Frontend</strong><br/>
  Sistema funcionalmente aprovado em preparação para o ciclo formal de produção.
</div>
