# Documentação — SGL Frontend

**Atualizado em:** 11/09/2026

Este índice separa documentação vigente, decisões de produto, referências visuais e registros históricos. O objetivo é evitar que uma etapa antiga seja interpretada como planejamento atual.

---

## Ordem de leitura para retomada

```text
1. ../CONTINUIDADE.md
2. backend: docs/PLANO_PRE_PRODUCAO.md
3. backend: docs/CONTINUIDADE_ETAPA_3_2026-09-11.md
4. ../README.md
5. DOSSIE_PROJETO_SGL.md
6. src/router/index.ts para rotas reais
7. Swagger/OpenAPI do backend para contratos HTTP
8. documento específico da área em trabalho
```

---

## Fonte de verdade

```text
código da main
→ Swagger/OpenAPI
→ ../CONTINUIDADE.md
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
Etapa 3 — refinamentos de Resíduos           🔧 atual
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
| `PADRAO_VISUAL_PRE_PRODUCAO.md` | decisões concretas da Etapa 1.1: dimensões, tipografia, cards, ícones, filtros, setas, botões e estados | **DECISÃO VIGENTE — Etapa 1 concluída** |
| `../README.md` | visão rápida e execução | **ATUAL** |
| `DOSSIE_PROJETO_SGL.md` | handoff completo humano/IA | **ATUAL** |
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
- modelos pré-cadastrados de Resíduo fazem parte da Etapa 4 da pré-produção;
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
→ Etapa 3 refinamentos de Resíduos          🔧
→ Etapas 4 a 9
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
2. ler o plano canônico do backend: docs/PLANO_PRE_PRODUCAO.md
3. ler o checkpoint da Etapa 3: docs/CONTINUIDADE_ETAPA_3_2026-09-11.md
4. conferir src/router/index.ts
5. conferir a main atual
6. conferir Swagger/OpenAPI quando houver contrato HTTP
7. abrir o documento específico da área
8. distinguir decisão atual de registro histórico
```

Não reconstruir módulos aprovados apenas porque uma documentação antiga descreve uma fase anterior. Preservar o padrão visual consolidado na Etapa 1 e a arquitetura de tema consolidada na Etapa 2; só reabrir esses blocos diante de regressão concreta ou nova decisão.
