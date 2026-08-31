# Documentação — SGL Frontend

**Atualizado em:** 31/08/2026

Este índice separa **documentação atual** de **snapshots históricos de etapas**, evitando que outra IA retome o projeto por uma instrução antiga de “próximo passo”.

## Ordem de leitura para retomada

```text
1. ../CONTINUIDADE.md
2. DOSSIE_PROJETO_SGL.md
3. src/router/index.ts para rotas realmente implementadas
4. Swagger/OpenAPI do backend para contratos HTTP
5. ROADMAP_INTERFACE_GESTAO.md
6. documento específico da área em que se vai trabalhar
```

## Fonte de verdade

Em caso de conflito:

```text
código da main
→ Swagger/OpenAPI
→ CONTINUIDADE.md
→ DOSSIE_PROJETO_SGL.md
→ decisões específicas
→ documentos de etapa/históricos
```

## Documentos atuais

| Documento | Papel | Estado |
|---|---|---|
| `../CONTINUIDADE.md` | checkpoint, status e próxima etapa | **ATUAL** |
| `DOSSIE_PROJETO_SGL.md` | handoff completo para humano/IA | **ATUAL** |
| `ROADMAP_INTERFACE_GESTAO.md` | sequência funcional atual | **ATUAL** |
| `INVENTARIO_TELAS.md` | telas/rotas implementadas e previstas | **ATUAL** |
| `FLUXOS_NAVEGACAO.md` | jornadas e regras de navegação atuais | **ATUAL** |
| `DECISAO_UNIDADES_CORPORATIVAS.md` | Unidade sem CRUD manual | **DECISÃO VIGENTE** |
| `IDENTIDADE_VISUAL.md` | paleta e linguagem visual | referência vigente |
| `PADROES_PAGINA.md` | padrões de composição | referência vigente |
| `SHELL_VISUAL.md` | sidebar/topbar/shell | referência vigente |
| `SIDEBAR_ALERTAS.md` | navegação e alertas | referência; conferir status no dossiê |
| `ICONOGRAFIA.md` | ícones e microinterações | referência vigente |

## Documentos históricos

Os arquivos abaixo registram fases já concluídas. São úteis para entender **por que** certas decisões foram tomadas, mas suas seções “próxima etapa” não são planejamento atual:

| Documento | Interpretação |
|---|---|
| `ETAPA_2_BOOTSTRAP.md` | snapshot do bootstrap técnico |
| `ESTRUTURA_FRONTEND.md` | origem da organização física; estrutura real evoluiu depois |

Screenshots e arquivos em `docs/screenshots/` são referências visuais, não status funcional.

## Decisões que substituem planejamento antigo

```text
Administração → Cadastros
├── Produtos
├── Laboratórios
├── Projetos
├── Usuários
└── Estagiários
```

Não existe CRUD manual normal de Unidade no frontend. `DECISAO_UNIDADES_CORPORATIVAS.md` substitui qualquer documento anterior que mostre `/cadastros/unidades` como fluxo planejado.

Produto também não deve virar um segundo módulo operacional `/produtos`: consulta de saldo/lotes fica em Estoque, visão analítica em Relatórios e CRUD em Cadastros.

## Estado atual resumido

```text
Pedidos                           ✅
Estoque/Lotes                     ✅
Movimentações                     ✅
Relatórios/Fiscalização           ✅
PDF/XLSX                          ✅
404 animada                       ✅
Administração/Cadastros           ⏳ próximo
Resíduos                          ⏳ após reconciliação backend
Documentos/rotulagem              ⏳
Dashboard/robustez                ⏳
Autenticação definitiva           ⏳
```

## Regra para outra IA

Antes de implementar uma tela, conferir se a rota realmente existe em `src/router/index.ts` e se o contrato está no Swagger. Não tratar uma rota mencionada em wireframe antigo como funcionalidade já criada ou obrigação de arquitetura atual.
