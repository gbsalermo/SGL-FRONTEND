<a id="readme-top"></a>

<div align="center">
  <img src="https://raw.githubusercontent.com/gbsalermo/Sistema-SGL/release/docs/LOGO.png" alt="SGL Logo" width="340" height="auto">

# SGL — Sistema de Gestão de Laboratórios

**Frontend corporativo para pedidos, estoque, lotes, resíduos, movimentações, relatórios, administração e acompanhamento operacional.**

`Vue 3` · `TypeScript` · `Vite` · `Pinia` · `Axios` · `Vuetify`

</div>

## O que é o SGL?

O **SGL (Sistema de Gestão de Laboratórios)** é uma plataforma voltada à organização e ao acompanhamento das operações laboratoriais. Em vez de manter informações dispersas sobre materiais, projetos, atividades, pessoas e resíduos, o sistema reúne esses processos em uma experiência integrada, com registros rastreáveis e informações acessíveis conforme o contexto operacional.

A interface web organiza o trabalho em diferentes perspectivas:

- **Solicitante:** consultar seu contexto, solicitar materiais e soluções, acompanhar pedidos e informar resíduos gerados nas atividades.
- **Gestão:** acompanhar indicadores, analisar solicitações, administrar estoque e lotes, movimentações, resíduos, projetos, participações e relatórios.
- **Administração:** manter os cadastros operacionais, as associações e os perfis previstos para a fase atual do sistema.

O SGL considera a estrutura **Unidade → Laboratório → Projeto → SCI → Atividade** e os vínculos aplicáveis a cada pessoa. Isso permite relacionar solicitações e registros ao seu contexto de origem, enquanto o backend permanece responsável pelas decisões e validações oficiais.

A aplicação utiliza Vue e TypeScript, comunica-se com a API do SGL e busca oferecer uma navegação consistente, responsiva e com suporte a temas claro e escuro. O projeto está em **evolução de pré-produção**; autenticação definitiva e integração institucional pertencem a fases posteriores.

> **Acompanhamento da evolução:** entregas, decisões e próximos passos estão em [`CONTINUIDADE.md`](CONTINUIDADE.md) e no roadmap do backend [`docs/PLANO_PRE_PRODUCAO.md`](https://github.com/gbsalermo/Sistema-SGL/blob/release/docs/PLANO_PRE_PRODUCAO.md). O histórico e o contrato da Etapa 9 estão em [`docs/ETAPA_9_INICIO_RELATORIOS_CONSOLIDADOS_2026-10-26.md`](docs/ETAPA_9_INICIO_RELATORIOS_CONSOLIDADOS_2026-10-26.md).

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

As operações seguem as regras de negócio executadas pelo backend:

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

A interface permite utilizar modelos de resíduos cadastrados administrativamente, além do preenchimento manual, conforme o contrato do módulo.

---


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

Cobertura funcional validada na Etapa 9:

```text
Estagiários
Produtos
Projetos — relatório consolidado
Movimentações — Resumo / Detalhamento
Estoque e lotes
Fiscalização
Resíduos
Pessoas por laboratório
```

A opção **Movimentações** reúne contagens por tipo no modo Resumo e consulta de registros no Detalhamento. Os filtros do Detalhamento contemplam contexto Laboratório/Projeto/SCI/Atividade, produto, apresentação/unidade, origem e período. A quantidade física pode ser exibida opcionalmente e é identificada pela unidade real de medida. Estoque e lotes exibem apresentações e estados dos recipientes; Fiscalização inclui rastreabilidade por recipiente. As exportações PDF/XLSX usam a consulta filtrada da prévia.

A apresentação física e a quantidade consumida são conceitos distintos. A identificação histórica de consumo completo ou por medida é inferida dos detalhes registrados e não comprova a apresentação originalmente solicitada.

Pedidos entregues são recorte de Movimentações, não relatório separado.

Os mesmos filtros selecionados são utilizados na prévia e na exportação.

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

O tema claro/escuro é aplicado às áreas autenticadas, mantendo a identidade visual própria da tela de acesso.

---

## Identidade e controle de acesso

```text
login corporativo + sessão JWT                 ✅
autorização das operações novas no servidor    ✅
Unidade derivada da sessão                     ✅
guardas de rota por perfil                     ✅ UX
matriz completa de permissões por módulo       ⏳
```

Visibilidade de menu/rota continua sendo só UX; quem decide é o backend.

---

## Evolução do projeto — referência de 17/11/2026

A `release` integra módulos que documentos de outubro descreviam como “aguardando merge”. Esse quadro reflete **código presente**, não homologação de desempenho ou segurança:

| Escopo | Verificação estática |
|---|---|
| Projetos, SCI, Atividades e Estagiários | Telas e services de gestão e participação presentes |
| Estoque, Pedidos e Soluções | Fluxos, fracionamento, baixa por aprovação e gestão presentes |
| Resíduos e Relatórios | Prévia, filtros, histórico e exportação presentes |
| Rótulos | Produto, Resíduo, Solução e Documento de Entrada com A4/Zebra/Browser Print; **teste físico pendente** |
| Multilaboratório | Regras de empregados e estagiários diferentes; participação elegível para Estagiário |
| Qualidade (Etapas 12–13) | Auditoria documental e de código avançada; **E2E, carga, PostgreSQL/Flyway e teste Android/iOS pendentes** |

**Riscos abertos:** autorização por objeto em consultas GET, desempenho do Dashboard e de Relatórios, consistência de quantidades físicas, compatibilidade API e acesso mobile. A documentação organiza os achados, mas **não os corrige nem os homologa**. O acompanhamento está no registro único de revisão do backend (`docs/REGISTRO_PENDENCIAS_REVISAO_SGL_2026-11.md`).
---

## Documentação

| Referência | Uso |
|---|---|
| [`CONTINUIDADE.md`](CONTINUIDADE.md) | Checkpoint atual e regras de retomada |
| [`docs/README.md`](docs/README.md) | **Índice técnico corrente** dos guias frontend |
| [`docs/DOSSIE_PROJETO_SGL.md`](docs/DOSSIE_PROJETO_SGL.md) | Stack, stores, services, rotas e contratos frontend |
| [`docs/GOVERNANCA_DOCUMENTAL.md`](docs/GOVERNANCA_DOCUMENTAL.md) | Fonte de verdade e separação histórica |
| [`docs/INVENTARIO_TELAS.md`](docs/INVENTARIO_TELAS.md) e [`docs/FLUXOS_NAVEGACAO.md`](docs/FLUXOS_NAVEGACAO.md) | Telas e jornadas |
| [`docs/PRESERVACAO_CENTRAL_AJUDA_VIDEOS.md`](docs/PRESERVACAO_CENTRAL_AJUDA_VIDEOS.md) | **Proteção obrigatória** dos 20 tutoriais, vídeo, poster, PDF e FAQ |
| [`docs/SINCRONIZACAO_GITLAB_GITHUB.md`](docs/SINCRONIZACAO_GITLAB_GITHUB.md) | GitLab `release`, GitHub espelho, branches `collab/*` e MR |
| [`docs/PLANO_TESTES_PRIMEIRO_PROTOTIPO.md`](docs/PLANO_TESTES_PRIMEIRO_PROTOTIPO.md) | Plano inicial histórico; não atesta execução recente |

No **backend**, consultar `docs/MATRIZ_COERENCIA_FRONTEND_BACKEND_2026-11-12.md`, `docs/REGISTRO_PENDENCIAS_REVISAO_SGL_2026-11.md` (31 itens) e `docs/PLANO_HOMOLOGACAO_NUVEM_MOBILE_2026-11-17.md` (CL-01–11, MB-01–12). Todos os novos problemas são registrados **num único backlog**, sem duplicações entre repositórios.
---

## Vídeos da Central de Ajuda

Os MP4 da Central de Ajuda (`/ajuda`) **não** vão para o git nem para a imagem: são servidos pelo Nginx a partir do volume externo `sgl_web_ajuda_videos`, montado somente leitura em `/usr/share/nginx/ajuda-videos/`. Os pôsteres (`public/ajuda/posters/`) ficam versionados.

1. Criar o volume, uma única vez por servidor. **Faça isto antes da primeira tag**: sem o volume, o `docker compose up` falha.

   ```bash
   docker volume create sgl_web_ajuda_videos
   ```

2. Copiar ou atualizar os vídeos (baixe os MP4 da pasta do Drive para um diretório no servidor, aqui `saida/`). Não precisa de novo deploy.

   ```bash
   docker run --rm -v sgl_web_ajuda_videos:/dest -v "$PWD/saida":/src:ro alpine sh -c 'cp /src/*.mp4 /dest/'
   ```

3. Em desenvolvimento, apontar para a pasta de saída dos manuais:

   ```bash
   ln -s ~/repos/sgl-manuais/saida public/ajuda/videos
   ```

4. Teste rápido (smoke test) após mudar o Nginx ou o `public/ajuda/`: construir a imagem, subir e conferir que `/ajuda` responde 200 (e não redireciona para `/ajuda/`, que é um diretório em `dist/`).

   ```bash
   docker build -t sgl-web:smoke . && docker run -d --name sgl-web-smoke -p 8081:80 \
     -e API_UPSTREAM=http://localhost:1 sgl-web:smoke
   curl -I localhost:8081/ajuda                      # 200 text/html
   curl -I localhost:8081/ajuda/sgl-guia.pdf         # 200 application/pdf
   docker rm -f sgl-web-smoke
   ```

---

## Execução e testes

Na raiz do repositório, com Node adequado à versão Vite do `package.json`:

```bash
npm ci
npm run dev
npm run type-check
npm run test
npm run build
```

`npm run test` usa Vitest + `jsdom`, com `src/**/__tests__/*.spec.ts`. Os testes de impressão Zebra `src/modules/rotulos/zebra/zpl.test.mjs` e `browserPrintLocal.test.mjs` usam `node:test` e **não entram no comando padrão**. O plano de execução deverá incluir os dois separadamente; ainda não foram executados nesta auditoria.

**Operação:** Dockerfile compila Vite com base `/api` e Nginx encaminha `/api` ao serviço `sgl-api` na rede compartilhada. Não reutilizar `docker-compose.yml` de produção para homologação sem substituir **rede, volumes, gateway e segredos** por versões isoladas.

**Mobile:** os formulários de Pedido, Solução e Resíduo possuem regras responsivas, mas **não há aceite em Android/Chrome ou iOS/Safari reais**. O plano do backend requer fluxo de Estagiário multilaboratório em celular, teclado virtual, toque, perda de rede, ausência de envios duplicados e E2E com API/PostgreSQL em staging.

---

<div align="center">
  <strong>SGL Frontend</strong>
  <p>Documentação consolidada sobre a <code>release</code>; revisão de código e referências concluída parcialmente, homologação integrada ainda pendente.</p>
</div>
