# Checkpoint de continuidade — Etapa 1.4

**Data:** 09/09/2026  
**Projeto:** SGL — Frontend  
**Etapa atual:** 1.4 — aplicação tela a tela do padrão visual  
**Branch atual para retomada:** `feat/etapa-1-4-estagiarios`

## Estado ao encerrar o trabalho do dia

A Etapa 1 continua em andamento.

```text
1.1 — padrão visual SGL                         ✅ concluída
1.2 — fundação visual compartilhada             ✅ concluída
1.3 — componentes básicos compartilhados        ✅ concluída
1.4 — aplicação tela a tela                     🔧 em andamento
```

## Blocos já aprovados e integrados à main

```text
Pedidos                       ✅
Dashboards                     ✅
Resíduos                       ✅
Estoque                        ✅
Movimentações                  ✅
```

### Decisões visuais importantes já consolidadas

- Login permanece fora da padronização das interfaces autenticadas.
- Gestão e Solicitante compartilham a mesma linguagem visual.
- controles: 40 px;
- icon-only: 40 × 40 px;
- ícones comuns: 20 px;
- chevrons: 24 px;
- raio de controles: 6 px;
- raio de superfícies: 8 px;
- título de página: 24 px;
- corpo: 14 px;
- label: 13 px;
- auxiliar: mínimo 12 px;
- superfícies normalmente brancas/neutras;
- cor semântica somente quando ajuda a compreensão;
- Dashboard do Solicitante mantém diferenciação suave por domínio: Pedidos azul claro e Resíduos creme/amarelo claro;
- telas operacionais de Resíduos permanecem brancas, com creme apenas em hover quando aplicável;
- Movimentações possui cor estática muito suave por tipo e hover um pouco mais forte:
  - entrada/devolução = verde;
  - saída = azul;
  - ajuste = amarelo;
  - descarte = vermelho.

## Estagiários — preparado, ainda não validado

Rota:

```text
/estagiarios
```

Branch:

```text
feat/etapa-1-4-estagiarios
```

Arquivos adicionados/alterados:

```text
src/styles/etapa-1-4-estagiarios.css
src/main.ts
docs/ETAPA_1_4_ESTAGIARIOS.md
```

O ajuste é apenas visual. A View, services e regras atuais de Estagiários não foram reescritos.

Principais refinamentos:

- tipografia alinhada ao padrão;
- campos e botões em 40 px;
- cards e filtros padronizados;
- tabela mais legível;
- status ampliados;
- drawer de detalhes mais confortável;
- modais de cadastro/edição/encerramento refinados;
- responsividade e foco preservados.

### Primeiro passo na retomada

```bash
git fetch origin
git switch feat/etapa-1-4-estagiarios
git pull
npm run build
npm run dev
```

Depois validar visual e funcionalmente `/estagiarios` usando o checklist em `docs/ETAPA_1_4_ESTAGIARIOS.md`.

**Não mergear antes dessa validação.**

## Interfaces que restam depois de Estagiários

Após a aprovação de Estagiários, faltam quatro rotas únicas para fechar as interfaces operacionais principais da Etapa 1.4:

```text
/relatorios
/relatorios/residuos
/relatorios/pessoas-laboratorio
/administracao/cadastros
```

Estratégia sugerida:

```text
Estagiários
→ bloco Relatórios (3 rotas juntas)
→ Administração / Cadastros
→ revisão final da Etapa 1.4
→ fechamento documental da Etapa 1
→ Etapa 2 — Dark Mode definitivo
```

Não contar como telas pendentes:

- `/solicitacoes/novo` e `/solicitacoes/meus-pedidos`, pois reutilizam telas de Pedidos já padronizadas;
- `/residuos/:id/rotulo`, pois o refinamento está planejado para a Etapa 3.2;
- Login, excluído do escopo;
- 404, tela técnica;
- `/produtos/:id/rotulo`, recomendado tratar junto da revisão de impressão/rótulos.

## Requisitos futuros adicionados durante esta rodada

### Etapa 3.2

Além do refinamento do rótulo de Resíduo e compatibilidade com Zebra, foi registrada a necessidade de avaliar uma **Ficha/Comprovante de Lote imprimível**, usando dados já exibidos nos detalhes do lote. Não tratar como nota fiscal oficial.

### Etapa 7.1

Antes de mudanças estruturais em Pedidos, analisar o padrão real de pedido usado pelo cliente, comparar com o SGL e sintetizar o padrão-alvo aproveitando os pontos positivos dos dois modelos.

## Regra de retomada

Amanhã, começar pela validação de Estagiários na branch indicada. Se aprovado, mergear por squash e iniciar o bloco de Relatórios. Não avançar para Dark Mode antes de terminar a Etapa 1.4 e fechar a Etapa 1.
