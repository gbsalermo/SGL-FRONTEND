# Documentação — SGL Frontend

## Checkpoint vigente — 26/10/2026: Etapa 8 integrada; Etapa 9 iniciada documentalmente

**Estado verificado:** os merges da Etapa 8 constam na `main` backend (`818d580`, GitLab MR `nti/sgl-api!10`) e frontend (`12a195a`, MR `nti/sgl-web!11`); os sincronizadores GitLab → GitHub reportaram sucesso. Etapa 8 concluída funcionalmente; V44/Flyway, build frontend e ArchUnit 5/5 foram validados nos checkpoints informados. Testes globais de carga/E2E continuam na Etapa 12.

**Etapa 9 vigente = RELATÓRIOS CONSOLIDADOS.** Adicionar relatório de **Projetos** à Central de Relatórios; unificar visualmente **Movimentações** e **Resumo operacional** em uma opção com modos **Resumo / Detalhamento**, inicialmente mantendo endpoints existentes. Não confundir com seções antigas que denominavam "Etapa 9" de Pedidos/Soluções — esse trabalho foi absorvido pela Etapa 8.

**Branches criadas, sem implementação funcional nem merge:** `collab/etapa-9-relatorios-consolidados` nos dois repositórios, derivadas dos HEADs da `main` pós-Etapa 8. Contrato de início, escopo, regras e checklist bilateral: `docs/ETAPA_9_INICIO_RELATORIOS_CONSOLIDADOS_2026-10-26.md`. Auditoria prévia de dados institucionais: `docs/AUDITORIA_COBERTURA_DADOS_MVP_ETAPA_8_2026-10-23.md`. GitLab é canônico; GitHub colaboração/espelho.

**Status documental:** checkpoints históricos abaixo descrevem o estado de suas datas; qualquer menção antiga a "Etapa 8 pendente", "sem merge" ou "Etapa 9 Pedidos" não vale para o HEAD atual.



> **Checkpoint vigente — 23/10/2026 (Etapa 8, MVP em DEV):** blocos funcionais Vínculos, Pedidos, Soluções e Resíduos homologados manualmente; Pedido/Solução/Resíduo permitem Projeto opcional para os perfis elegíveis; vínculo específico por Projeto/SCI/Atividade deriva contexto operacional sem criar vínculos formais automaticamente. Backend PostgreSQL/Flyway validou 44 migrations; o frontend compilou e o ArchUnit passou 5/5 regras. Auditorias completas de carga/E2E e eventual identidade institucional permanecem fora deste aceite. **Auditoria de campos e entradas:** `docs/AUDITORIA_COBERTURA_DADOS_MVP_ETAPA_8_2026-10-23.md` — há dependência de provisionamento externo/seed para Unidade, Usuário e cadastro inicial de Estagiário, embora os cadastros operacionais restantes tenham telas. **Sem merge; não presumir sincronização GitLab confirmada.** Trechos históricos datados abaixo descrevem o estado *àquela época*, não substituem este checkpoint.


## Checkpoint de encerramento funcional — Etapa 7 (16/10/2026)

**Estado:** Etapa 7 (7.0–7.7) concluída funcionalmente e validada pelo responsável; código e documentação preparados na branch `collab/etapa-7-unidades-solucoes-contexto` para merge **a ser realizado pelo responsável**. Não afirmar que o merge, publicação ou homologação integral de produção ocorreram.

**Entregas:** unidades de medida e apresentações físicas, conversão e decimais, recipientes individuais, FEFO/FIFO, Soluções, contrato de Pedidos convencionais por embalagem ou medida, aprovação em embalagens com conversão canônica, retirada individual de reações/unidades de kits quando o lote permite abertura, massa DEV/DEMO revisada, resumo físico na listagem de Estoque, mínimo configurável em embalagem ou medida (V39), revisão da nomenclatura e da configuração `fracionavel` por lote, QA e auditoria de integração. O valor mínimo salvo continua canônico; a preferência de apresentação é persistida separadamente.

**Aceites relatados pelo responsável:** suítes Maven/JUnit verdes, API iniciando normalmente, build do frontend verde, solicitações/aprovações e refinamento de estoque validados, correções finais de cadastro/entrada, massa DEMO e documentação testadas e aceitas. Não extrapolar esses aceites para teste exaustivo de todos os perfis ou homologação para produção.

**Regras importantes:** `fracionavel` controla permitir abrir embalagem e consumir parte do conteúdo; não permite dividir uma unidade indivisível como 1 reação. O lote governa a permissão; pedidos por medida não são pedidos de embalagem; pedidos por embalagem são aprovados visualmente em apresentações inteiras, enviados ao backend em quantidade canônica. FEFO/FIFO e baixa única na aprovação continuam no servidor. Kit fracionável admite retirada de uma reação individual; frasco de 500 mL admite pedido por medida, sem inventar “500 unidades”.

**Etapa 8, próximo passo:** integração do contexto de participação do Estagiário (Projeto/SCI/Atividade) aos Pedidos/Soluções, incluindo regras de vínculo, acesso e aprovação. Executar também **roteiro operacional exaustivo ainda não realizado**: cadastro de produto → entrada de lotes → escolha de embalagem ou medida → pedido → liberação/aprovação → entrega → movimentação/rastreabilidade, com casos de abertura, estoque mínimo, validade, FEFO/FIFO e múltiplas unidades. Nenhuma mudança da Etapa 8 deve ser inferida como implementada.

**Infra e migrations:** DEV PostgreSQL com Flyway; DEMO H2 em memória; massa de teste por inicializadores. V39 acrescenta metadados opcionais para exibição do mínimo. Flyway para evolução estrutural/dados de referência necessários, não para atualizar dados fictícios descartáveis. Confirmar ambos os repositórios após o merge e criar branch separada para a Etapa 8.

**Documentação canônica:** backend `docs/PLANO_PRE_PRODUCAO.md`, `docs/CONTINUIDADE_ETAPA_7_2026-10-06.md`, `docs/ETAPA_7_7_AUDITORIA_INTEGRACAO_BACKEND_FRONTEND.md`; frontend `docs/PADRAO_VISUAL_PRE_PRODUCAO.md`, `docs/ETAPA_7_6_0_AUDITORIA_FRONTEND_PADRAO_VISUAL_PEDIDOS.md`. Registros datados anteriores refletem checkpoints históricos, não substituem este encerramento.


**Atualizado em:** 16/10/2026

Este índice separa documentação vigente, decisões de produto, referências visuais e registros históricos. O objetivo é evitar que uma etapa antiga seja interpretada como planejamento atual.

---

## Ordem de leitura para retomada

```text
1. ../CONTINUIDADE.md
2. SINCRONIZACAO_GITLAB_GITHUB.md
3. backend: docs/PLANO_PRE_PRODUCAO.md
4. backend: docs/CONTINUIDADE_ETAPA_5_2026-09-24.md
5. ../README.md
6. DOSSIE_PROJETO_SGL.md
7. src/router/index.ts para rotas reais
8. Swagger/OpenAPI do backend para contratos HTTP
9. documento específico da área em trabalho
```

---

## Fonte de verdade

```text
código da main
→ Swagger/OpenAPI
→ ../CONTINUIDADE.md
→ SINCRONIZACAO_GITLAB_GITHUB.md
→ PADRAO_VISUAL_PRE_PRODUCAO.md durante a Etapa 1
→ DOSSIE_PROJETO_SGL.md
→ decisões específicas
→ documentos de etapa e snapshots históricos
```

Um documento histórico pode continuar útil para explicar uma decisão, mas não define sozinho o próximo passo do projeto.

---

## Estado do projeto

```text
Primeiro protótipo funcional                 ✅ aprovado
Pré-produção pós-aprovação                   🔧 em andamento
Etapa 1 — padrão visual global               ✅ concluída
Etapa 2 — Dark Mode definitivo               ✅ concluída
Etapa 3 — refinamentos de Resíduos           ✅ concluída e validada
Etapa 4 — expansão operacional de Resíduos   ✅ concluída e validada
Matriz formal de permissões                  ⏳ após a pré-produção atual
Congelamento/homologação final               ⏳ posterior
Autenticação definitiva                      ⏳ posterior
Integração corporativa                       ⏳ posterior
```

---

## Documentos vigentes

| Documento | Papel | Estado |
|---|---|---|
| `../CONTINUIDADE.md` | checkpoint, fase atual e regra de retomada | **ATUAL** |
| `SINCRONIZACAO_GITLAB_GITHUB.md` | remotes, branches, Actions, push/pull e regras de sincronização | **ATUAL — 22/09** |
| `PADRAO_VISUAL_PRE_PRODUCAO.md` | decisões concretas da Etapa 1.1: dimensões, tipografia, cards, ícones, filtros, setas, botões e estados | **DECISÃO VIGENTE — Etapa 1 concluída** |
| `../README.md` | visão rápida e execução | **ATUAL** |
| `DOSSIE_PROJETO_SGL.md` | handoff completo humano/IA | **ATUAL** |
| backend: `docs/VALIDACAO_ETAPA_4.md` | bateria executada e critérios de fechamento da Etapa 4 | **FECHADO — 24/09** |
| `INVENTARIO_TELAS.md` | inventário de rotas/telas | **REFERÊNCIA VIGENTE** |
| `FLUXOS_NAVEGACAO.md` | jornadas atuais | **REFERÊNCIA VIGENTE** |
| `ETAPA_CADASTROS_ADMIN.md` | decisões de Administração/Cadastros | **DECISÃO VIGENTE** |
| `ETAPA_ESTAGIARIOS.md` | decisões do módulo Estagiários | **DECISÃO VIGENTE** |
| `DECISAO_UNIDADES_CORPORATIVAS.md` | Unidade institucional e integração futura | **DECISÃO VIGENTE** |
| `IDENTIDADE_VISUAL.md` | identidade visual conceitual original | **REFERÊNCIA BASE** |
| `ICONOGRAFIA.md` | conceitos originais de iconografia | **REFERÊNCIA BASE** |
| `PADROES_PAGINA.md` | padrões de composição | **REFERÊNCIA BASE** |
| `SHELL_VISUAL.md` | sidebar/topbar/shell | **REFERÊNCIA** |
| `ROTULO_PRODUTOS.md` | rótulo de Produto | **REFERÊNCIA** |
| `ROTULO_RESIDUOS.md` | rótulo de Resíduo | **REFERÊNCIA** |

`PADRAO_VISUAL_PRE_PRODUCAO.md` permanece como referência do padrão aprovado na Etapa 1; `ETAPA_2_DARK_MODE.md` e `ETAPA_2_FECHAMENTO.md` registram o fechamento visual da Etapa 2.

---

## Roadmap e fechamento

| Documento | Interpretação atual |
|---|---|
| `ROADMAP_INTERFACE_GESTAO.md` | roadmap formal que será retomado **após** o bloco atual de pré-produção |
| `FECHAMENTO_PRIMEIRO_PROTOTIPO.md` | registro de fechamento/aprovação do primeiro protótipo; não é mais um gate pendente |
| `PLANO_TESTES_PRIMEIRO_PROTOTIPO.md` | bateria de testes reaproveitável na homologação formal posterior |

A matriz de permissões continua planejada, mas não deve ser descrita como tarefa imediata enquanto o bloco atual de pré-produção estiver aberto.

---

## Decisões visuais atuais — Etapa 1

A subetapa 1.1 foi concluída em 09/09/2026. O padrão aprovado está em `PADRAO_VISUAL_PRE_PRODUCAO.md`.

Resumo obrigatório para retomada:

```text
preservar MVP e identidade original
Vuetify/MDI como família de iconografia
controle comum 40 px
icon-only 40 × 40 px
ícone comum 20 px
seta/chevron 24 px, centralizada e palpável
raio controles 6 px
raio cards 8 px
linha de tabela 48 px
padding de card 20 px
título de página 24 px
texto normal 14 px
label 13 px
texto auxiliar mínimo 12 px
filtros sempre representados por funil
azul = ação/informação
verde = sucesso
amarelo = atenção
vermelho = erro/urgência
cinza = neutro/sem interação
Dark Mode consolidado e concluído na Etapa 2
```

Status da Etapa 1:

```text
1.1 definir padrão visual                  ✅
1.2 fundação visual compartilhada          ✅
1.3 padronizar componentes básicos         ✅
1.4 aplicar tela a tela                     ✅
1.5 limpar exceções/CSS corretivo           ✅
1.6 revisão visual final                    ✅
Etapa 1                                    ✅ concluída
```

---

## Documentos históricos

Os arquivos abaixo registram etapas já concluídas ou concepções anteriores. Permanecem úteis para contexto, mas não definem o estado atual:

| Documento | Uso correto |
|---|---|
| `ETAPA_2_BOOTSTRAP.md` | histórico de bootstrap e primeiras decisões |
| `SIDEBAR_ALERTAS.md` | concepção anterior à implementação final de alertas/shell |
| screenshots e registros visuais antigos | comparação histórica, não fonte de estado funcional |

Se um documento histórico disser que Administração, Resíduos, Dashboard, Alertas, tema escuro ou outra funcionalidade já integrada “ainda será feita”, essa afirmação está superada.

---

## Decisões vigentes

- Lotes continuam dentro do contexto de Estoque;
- não existe uma segunda área operacional independente de Produto;
- Unidade não possui CRUD manual normal;
- Administração usa `/administracao/cadastros` e é exclusiva de `ADMINISTRADOR`;
- usuário não é criado manualmente em Cadastros; permissões alteram perfis existentes;
- `Produto != Resíduo`;
- modelos pré-cadastrados de Resíduo foram implementados e validados na Etapa 4;
- QR Code não integra o rótulo visual atual;
- sessão atual é DEV e expira em 5h;
- o tema claro/escuro pertence às interfaces autenticadas e não deve alterar a tela de login sem decisão explícita;
- o frontend envia `X-SGL-Unidade-Id` a partir da Unidade da sessão DEV;
- o isolamento por Unidade é funcional, mas a segurança definitiva dependerá de identidade autenticada.

---

## Fase atual e roadmap

### Agora

```text
planejamento de pré-produção                 ✅
→ Etapa 1 padrão visual                     ✅
→ Etapa 2 Dark Mode definitivo              ✅
→ Etapa 3 refinamentos de Resíduos          ✅
→ Etapa 4 expansão operacional de Resíduos  ✅
→ Etapa 5 Projetos e Atividades              ✅ concluída e validada
→ Etapa 6 Estagiários e vínculos             ⏳ próxima
→ Etapas 7 a 9
→ estabilização do bloco
```

### Depois

```text
matriz de permissões
→ congelamento funcional
→ homologação integrada final
→ autenticação/autorização/auditoria
→ integração corporativa
→ demais etapas formais de produção
```

---

## Regra para outra IA

Antes de implementar algo novo:

```text
1. ler ../CONTINUIDADE.md
2. ler SINCRONIZACAO_GITLAB_GITHUB.md
3. ler o plano canônico do backend: docs/PLANO_PRE_PRODUCAO.md
4. ler o handoff da Etapa 4 no backend
5. conferir src/router/index.ts
6. conferir gitlab/main e github/main
7. conferir Swagger/OpenAPI quando houver contrato HTTP
8. abrir o documento específico da área
9. distinguir decisão atual de registro histórico
```

Não reconstruir módulos aprovados apenas porque uma documentação antiga descreve uma fase anterior. Preservar o padrão visual consolidado na Etapa 1 e a arquitetura de tema consolidada na Etapa 2; só reabrir esses blocos diante de regressão concreta ou nova decisão.
