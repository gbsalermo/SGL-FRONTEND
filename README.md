<a id="readme-top"></a>

<div align="center">
  <img src="https://raw.githubusercontent.com/gbsalermo/Sistema-SGL/main/docs/LOGO.png" alt="SGL Logo" width="340" height="auto">

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

> **Acompanhamento da evolução:** entregas, decisões e próximos passos estão em [`CONTINUIDADE.md`](CONTINUIDADE.md) e no roadmap do backend [`docs/PLANO_PRE_PRODUCAO.md`](https://github.com/gbsalermo/Sistema-SGL/blob/main/docs/PLANO_PRE_PRODUCAO.md). O histórico e o contrato da Etapa 9 estão em [`docs/ETAPA_9_INICIO_RELATORIOS_CONSOLIDADOS_2026-10-26.md`](docs/ETAPA_9_INICIO_RELATORIOS_CONSOLIDADOS_2026-10-26.md).

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

## Evolução do projeto

O desenvolvimento de pré-produção evolui de forma incremental, preservando os fluxos homologados. A Etapa 9 está validada funcionalmente na branch colaborativa, mas ainda não integrada à `main`:

| Etapa | Escopo | Situação |
|---|---|---|
| 1–4 | Padrão visual, experiência inicial, Resíduos e expansão operacional | Concluídas |
| 5 | Projetos, SCI e Atividades | Concluída |
| 6 | Estagiários, vínculos, participações e formação | Concluída |
| 7 | Estoque físico, apresentações, fracionamento, FEFO/FIFO e Soluções | Concluída |
| 8 | Contextos operacionais, Pedidos, Soluções, Resíduos e vínculos adicionais | Concluída e integrada |
| 9 | Relatórios consolidados: Projetos, Movimentações (Resumo/Detalhamento), Estoque/Lotes e Fiscalização | Implementada e validada funcionalmente; aguardando merge |
| 10 | Rótulos e impressão operacional | Planejada |
| 11 | Manual do usuário e revisão de inativação/delete lógico | Planejada |
| 12 | Testes transversais de arquitetura, carga, E2E e regressão | Planejada |
| 13 | Revisão estrutural e auditoria final integral | Planejada |

**Preparação para produção:** após a estabilização funcional, o plano contempla matriz de permissões, congelamento, homologação integrada, correções, identidade e autorização definitivas, integração institucional e liberação controlada.

O detalhamento das decisões, entregas e critérios de validação fica em [`CONTINUIDADE.md`](CONTINUIDADE.md) e no [plano de pré-produção](https://github.com/gbsalermo/Sistema-SGL/blob/main/docs/PLANO_PRE_PRODUCAO.md). Este README apresenta a arquitetura e as capacidades do sistema; não substitui os checkpoints técnicos.

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
