# Etapa 2 — Fechamento integrado do Dark Mode

**Branch:** `feat/etapa-2-fechamento`  
**Data de fechamento:** 11/09/2026  
**Status:** ✅ concluída e validada.

## Objetivo

Fechar a Etapa 2 em uma única rodada integrada, cobrindo as interfaces que ainda faltavam e substituindo a arquitetura provisória do tema por uma fonte única.

## Interfaces concluídas nesta rodada

### Gestão

- `/residuos`
- `/relatorios`
- `/relatorios/residuos`
- `/relatorios/pessoas-laboratorio`
- `/administracao/cadastros`
- `/solicitacoes/novo`
- `/solicitacoes/meus-pedidos`

As interfaces anteriores de Dashboard, Pedidos, Estoque, Movimentações e Estagiários já estavam validadas e foram preservadas.

## Arquitetura final do tema

A fonte de verdade passa a ser:

`src/services/themeService.ts`

Responsabilidades:

- carregar e persistir `sgl.theme`;
- expor o tema reativo para Gestão e Solicitante;
- sincronizar `data-theme`;
- sincronizar `.sgl-dark-active/.sgl-light-active`;
- sincronizar Vuetify por `theme.change(...)`;
- forçar tema claro em Login, 404 e rótulos de impressão.

Fluxo:

```text
preferência do usuário
        ↓
themeService
        ↓
DOM + body + Vuetify
        ↓
tokens.css
        ↓
fundação Dark compartilhada
        ↓
estilos específicos das telas
```

## Limpeza realizada

Removidos:

- `dark-mode.css`
- `dark-mode-runtime.css`
- `dark-mode-coverage.css`
- `dark-mode-consistency.css`
- listener global de clique para descobrir o tema pelo texto do botão
- lógica duplicada de persistência em `GestaoLayout.vue`
- lógica duplicada de persistência em `SolicitanteThemeToggle.vue`

## Tokens definitivos

A paleta oficial da Etapa 2 foi centralizada em `tokens.css`:

- fundo: `#07111F`
- fundo profundo: `#050D19`
- superfície: `#0D1929`
- superfície elevada: `#111F33`
- superfície interativa: `#172941`
- borda: `#233650`
- borda forte: `#315071`
- texto: `#F5F8FC`
- texto secundário: `#9FB0C6`
- azul: `#5B9DF8`
- verde: `#54D59A`
- amarelo: `#F2BE55`
- vermelho: `#FF7180`

O tema `sglDark` do Vuetify utiliza a mesma paleta.

## Regra de paridade

Nenhuma interface Dark deve criar outra linguagem visual.

A validação deve confirmar:

```text
mesma hierarquia do Light
+ mesmas fontes
+ mesmos tamanhos de controles
+ mesmos espaçamentos
+ mesma organização
+ mesma legibilidade
+ mesma força relativa
+ apenas paleta/contraste adaptados
```

## Validação final integrada

### Troca de tema

- [x] Light → Dark funciona na Gestão.
- [x] Dark → Light funciona na Gestão.
- [x] Light → Dark funciona no Solicitante.
- [x] Dark → Light funciona no Solicitante.
- [x] navegar entre rotas mantém a preferência.
- [x] atualizar a página mantém a preferência.
- [x] logout leva ao Login claro.
- [x] novo login recupera a preferência anteriormente escolhida.
- [x] 404 permanece clara.
- [x] não há flash/faixa branca relevante ao navegar.

### Impressão

- [x] rótulo de resíduo permanece claro.
- [x] rótulo de produto permanece claro.

### Gestão — rodada final

- [x] Resíduos: lista, abas, drawer e modais.
- [x] Relatórios: seletor, filtros, preview, tabelas e exportação.
- [x] Relatório de Resíduos.
- [x] Pessoas por Laboratório.
- [x] Administração/Cadastros: tabs, tabelas e modais.
- [x] Solicitações/Novo reutiliza corretamente o Dark de Novo Pedido.
- [x] Solicitações/Meus Pedidos reutiliza corretamente o Dark de Meus Pedidos.

### Regressão das telas já aprovadas

- [x] Dashboard Gestão.
- [x] Pedidos Gestão.
- [x] Estoque + detalhe + lotes vencendo.
- [x] Movimentações.
- [x] Estagiários.
- [x] Dashboard Solicitante.
- [x] Meus Pedidos.
- [x] Meus Resíduos.
- [x] Novo Pedido.
- [x] Informar Resíduo.

### Técnica

- [ ] `npm run build` — não há check automatizado publicado no PR; validação final desta etapa foi manual/local.
- [x] nenhuma regra de negócio foi alterada.
- [x] nenhum service HTTP funcional foi alterado.
- [x] nenhum payload/contrato foi alterado.

## Ajustes finais após validação visual

Após a primeira validação integrada, foram corrigidos escapes do tema claro que ainda apareciam no Dark:

- cards de resumo e rankings da prévia de Relatórios;
- estados vazios de Relatórios e relatórios especiais;
- estado vazio da Central de Resíduos;
- botão `Escolher foto` e botão de fechar do modal de Perfil;
- ação `Salvar alterações` do Perfil;
- ações primárias de Relatórios, incluindo `Visualizar relatório`;
- ações primárias de Administração/Cadastros, incluindo `+ Novo produto`.

Foi criado um azul específico para ação primária no Dark, propositalmente mais escuro que o azul informativo:

- ação: `#315FAE`;
- hover: `#3B6FC3`;
- borda: `#4D7ED1`.

A cor informativa `#5B9DF8` continua disponível para links, foco, ícones e destaques que não sejam botões primários.

## Correções finais da validação — 11/09/2026

Além dos ajustes já registrados, o fechamento incluiu:

- fundos de cards/KPIs e estados vazios dos Relatórios convertidos para superfícies navy;
- estado vazio de Resíduos convertido para superfície escura;
- controles claros remanescentes do Perfil adaptados ao Dark;
- azul de ações primárias escurecido para integrar melhor com as superfícies navy;
- badges de risco/status revisados para seguir a semântica já usada em Estoque, Movimentações e Resíduos;
- relatório de Movimentações passou a diferenciar visualmente o tipo da operação:
  - Entrada/Devolução → verde;
  - Saída → azul;
  - Ajuste → âmbar;
  - Descarte por vencimento → vermelho.

## Encerramento

A validação manual integrada foi aprovada em 11/09/2026.

```text
Etapa 2 — Dark Mode definitivo   ✅ encerrada
Próxima etapa                    → Etapa 3 — Refinamentos do fluxo atual de Resíduos
```

O fechamento foi integrado à `main` pelo **PR #50**, com squash merge `a3fff4fa8edb6b8900c4a5b359dbfc0245afb87c`.
