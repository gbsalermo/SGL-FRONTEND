# Etapa 2 — Dark Mode definitivo

## Status

Em andamento — início em 10/09/2026.

A Etapa 1 — Padronização e refinamento visual global — foi concluída e validada. A Etapa 2 passa a ser o trabalho atual do frontend.

## Objetivo

Substituir o Dark Mode provisório atual por um tema escuro único, previsível e coerente com o padrão visual aprovado na Etapa 1.

O Dark Mode deve preservar a identidade do SGL e seguir a referência visual já aprovada para o projeto: superfícies em tons de azul-marinho, contraste por profundidade, textos claros e cores semânticas usadas apenas quando comunicam estado ou ação.

## Restrições já aprovadas

- o Dark Mode atua somente nas interfaces autenticadas;
- Login e 404 permanecem em tema claro;
- Gestão e Solicitante devem compartilhar a mesma linguagem visual;
- o usuário escolhe explicitamente claro/escuro;
- a preferência deve persistir entre navegações e sessões locais;
- trocar de rota não pode alterar o tema selecionado;
- nenhum componente deve ficar branco/pastel por falta de cobertura;
- cores semânticas de erro, atenção, sucesso e informação continuam existindo no tema escuro, adaptadas para contraste adequado;
- telas de impressão/rótulo continuam claras quando necessário para impressão.

## Auditoria do estado atual

A implementação atual é funcional como protótipo, mas não deve ser mantida como arquitetura definitiva.

### 1. Três camadas CSS sobrepostas

Atualmente existem:

- `dark-mode-runtime.css`;
- `dark-mode-coverage.css`;
- `dark-mode-consistency.css`.

As três repetem cores e seletores, usam muitos `!important` e tentam cobrir telas por nome de classe. Isso aumenta o risco de regressão a cada nova View.

### 2. Duas fontes de verdade para o tema

O `main.ts` força o tema global do Vuetify para `sglLight` e aplica o escuro principalmente por classes no `body`, enquanto o `GestaoLayout.vue` também possui lógica própria de mudança de tema.

Resultado atual:

```text
Vuetify claro
+ classe CSS escura no body
+ lógica local no layout
```

A Etapa 2 deve convergir para uma única fonte de verdade.

### 3. Listener global baseado no texto do botão

O `main.ts` detecta mudança de tema por `document.addEventListener('click')` e interpreta `aria-label/title` do botão. Essa solução foi útil como compatibilidade temporária, mas é frágil e deve ser removida.

### 4. Cores hardcoded por toda a cobertura

A mesma superfície aparece repetida em vários arquivos como `#0b1627`, `#111e31`, `#17263d` etc. O tema definitivo deve expor tokens semânticos, e as telas devem consumir os tokens em vez de redefinir cores.

## Direção visual da Etapa 2

O tema escuro não é uma simples inversão do modo claro.

Hierarquia desejada:

```text
fundo da aplicação
→ superfície base
→ superfície elevada
→ superfície interativa/hover
→ borda discreta
→ texto principal
→ texto secundário
```

Nenhuma superfície operacional deve virar branco puro no tema escuro.

### Referências escolhidas

Foram avaliados cinco protótipos visuais. A direção escolhida combina principalmente os protótipos 1 e 2:

- fundo navy profundo, quase preto;
- cards escuros em camadas;
- bordas discretas;
- contraste alto sem excesso de brilho;
- azul como cor principal de ação;
- verde, amarelo, vermelho e violeta usados de forma semântica e controlada.

### Paleta-base para o piloto

A primeira aplicação será validada visualmente antes de congelar os valores finais.

| Papel | Valor-base |
| --- | --- |
| Fundo profundo | `#07111F` |
| Fundo secundário | `#050D19` |
| Superfície base | `#0D1929` |
| Superfície elevada | `#111F33` |
| Superfície interativa | `#172941` |
| Borda | `#233650` |
| Borda forte | `#315071` |
| Texto principal | `#F5F8FC` |
| Texto secundário | `#9FB0C6` |
| Azul de ação | `#5B9DF8` |
| Verde | `#54D59A` |
| Amarelo | `#F2BE55` |
| Vermelho | `#FF7180` |
| Violeta | `#9D82F5` |

Esses valores são a base inicial do piloto, não uma autorização para espalhar hexadecimais pelas Views. Depois da validação visual eles devem convergir para tokens semânticos definitivos.

## Comportamento semântico

### Azul

- ação primária;
- foco;
- seleção;
- informação;
- navegação ativa.

### Verde

- sucesso;
- entrada/devolução quando semanticamente aplicável;
- confirmação.

### Amarelo

- atenção;
- pendência;
- ajuste;
- vencimento próximo.

### Vermelho

- erro;
- urgência;
- descarte;
- vencido/crítico.

### Resíduos e Pedidos

A diferenciação por domínio aprovada no Dashboard permanece também no Dark Mode.

No Dashboard do Solicitante:

```text
Acompanhamento de Pedido
→ fundo azul identificado, adaptado para profundidade escura

Acompanhamento de Resíduo
→ fundo creme/âmbar identificado, adaptado para profundidade escura
```

A intenção é manter a leitura imediata existente no Light Mode sem inserir grandes superfícies claras no tema escuro.

## Estratégia de aplicação aprovada

A aplicação prática será feita **interface por interface**, repetindo a estratégia de validação utilizada na Etapa 1.

A ordem começa pela área do Solicitante:

```text
/inicio
→ /meus-pedidos
→ /pedidos/novo
→ /meus-residuos
→ /residuos/novo
```

Somente depois da validação das interfaces do Solicitante a aplicação segue para Gestão/Admin.

## Arquitetura-alvo

A Etapa 2 deve convergir para:

```text
preferência do usuário
        ↓
fonte única de tema
        ↓
Vuetify + atributo/classe raiz sincronizados
        ↓
tokens semânticos
        ↓
componentes compartilhados
        ↓
Views
```

Não deve permanecer dependência de listener global que interpreta texto de botão.

## Sequência de execução

### 2.1 — Esboço, paleta e piloto do Solicitante

- referências visuais escolhidas: protótipos 1 e 2;
- paleta-base definida;
- Dashboard do Solicitante (`/inicio`) aplicado como primeiro piloto prático;
- preservar fundo azul para acompanhamento de Pedido;
- preservar fundo creme/âmbar para acompanhamento de Resíduo;
- aguardar validação visual antes de congelar a paleta.

Implementação piloto:

```text
src/styles/etapa-2-solicitante-dashboard.css
```

Essa folha é carregada após as camadas provisórias atuais apenas durante o piloto. A arquitetura antiga ainda não é considerada definitiva.

### 2.2 — Regras e fonte única de tema

- centralizar leitura/persistência da preferência;
- sincronizar Vuetify e DOM;
- garantir Login/404 sempre claros;
- remover listener global baseado em `aria-label/title`;
- eliminar duplicidade de lógica entre `main.ts` e layouts.

### 2.3 — Tokens e componentes compartilhados

- criar tokens escuros semânticos;
- adaptar componentes `Sgl*` para consumir tokens;
- garantir foco, hover, disabled, borders e estados.

### 2.4 — Aplicação nas interfaces autenticadas

A validação será incremental, começando pelo Solicitante e depois seguindo para Gestão.

### 2.5 — Revisão tela a tela

Validar Gestão e Solicitante, incluindo modais, drawers, dropdowns, tabelas, filtros, estados vazios, loading e responsividade.

### 2.6 — Limpeza e testes

- remover as folhas provisórias de cobertura quando não forem mais necessárias;
- remover regras duplicadas/hardcoded;
- testar persistência e troca de rota;
- testar claro → escuro → claro;
- testar logout/login sem contaminar Login;
- testar impressão/rótulos em tema claro;
- executar build final.

## Ponto atual de continuidade

```text
Etapa 2.1
→ Dashboard do Solicitante aplicado na branch feat/etapa-2-dark-mode
→ aguardando validação visual em /inicio
→ próxima interface após aprovação: /meus-pedidos
```

## Critério de conclusão

A Etapa 2 só termina quando:

```text
um único sistema de tema
+ paleta aprovada
+ todas as interfaces autenticadas cobertas
+ Login/404 preservados em claro
+ sem flash/faixa branca em troca de rota
+ sem regressão funcional
+ documentação atualizada
```
