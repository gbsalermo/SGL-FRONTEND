# Documentação — SGL Frontend

**Atualizado em:** 17/09/2026

Este índice separa documentação vigente, decisões de produto, referências visuais e registros históricos. O objetivo é evitar que uma etapa antiga seja interpretada como planejamento atual.

---

## Ordem de leitura para retomada

```text
1. ../CONTINUIDADE.md
2. backend: docs/PLANO_PRE_PRODUCAO.md
3. backend: docs/CONTINUIDADE_ETAPA_4_2026-09-17.md
4. ../README.md
5. DOSSIE_PROJETO_SGL.md
6. INVENTARIO_TELAS.md
7. FLUXOS_NAVEGACAO.md
8. src/router/index.ts para rotas reais
9. Swagger/OpenAPI do backend para contratos HTTP
10. documento específico da área em trabalho
```

---

## Fonte de verdade

```text
código da main / branch atual validada
→ Swagger/OpenAPI
→ ../CONTINUIDADE.md
→ backend: docs/PLANO_PRE_PRODUCAO.md
→ backend: docs/CONTINUIDADE_ETAPA_4_2026-09-17.md
→ DOSSIE_PROJETO_SGL.md
→ INVENTARIO_TELAS.md / FLUXOS_NAVEGACAO.md
→ documentos de referência
→ documentos históricos
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
Etapa 4 — expansão operacional de Resíduos   🔧 iniciada
  4.1 — locais de armazenamento              🔧 regressão final
Etapas 5 a 13                                ⏳
Matriz formal de permissões                  ⏳ após a pré-produção atual
Congelamento/homologação final               ⏳ posterior
Autenticação definitiva                      ⏳ posterior
Integração corporativa                       ⏳ posterior
```

---

## Documentos vigentes

| Documento | Papel | Estado |
|---|---|---|
| `../CONTINUIDADE.md` | checkpoint, fase atual e regra de retomada | **ATUAL — Etapa 4.1** |
| `../README.md` | visão rápida e execução | **ATUAL — Etapa 4.1** |
| `DOSSIE_PROJETO_SGL.md` | handoff completo humano/IA | **ATUAL — Etapa 4.1** |
| `INVENTARIO_TELAS.md` | inventário de rotas/telas atuais | **ATUAL** |
| `FLUXOS_NAVEGACAO.md` | jornadas atuais | **ATUAL** |
| `PADRAO_VISUAL_PRE_PRODUCAO.md` | padrão visual aprovado na Etapa 1 | **REFERÊNCIA VIGENTE** |
| `DECISAO_UNIDADES_CORPORATIVAS.md` | Unidade institucional e integração futura | **DECISÃO VIGENTE** |
| `IDENTIDADE_VISUAL.md` | identidade visual conceitual original | **REFERÊNCIA BASE** |
| `ICONOGRAFIA.md` | conceitos de iconografia | **REFERÊNCIA BASE** |
| `PADROES_PAGINA.md` | padrões de composição | **REFERÊNCIA BASE** |
| `SHELL_VISUAL.md` | sidebar/topbar/shell | **REFERÊNCIA** |

---

## Documentos históricos / de etapa

Os arquivos abaixo preservam decisões e contexto do momento em que foram produzidos. **Não devem ser interpretados como checkpoint atual** quando citarem “próxima etapa” ou “em breve”:

| Documento | Uso correto |
|---|---|
| `ETAPA_CADASTROS_ADMIN.md` | histórico do primeiro protótipo da central de Cadastros; anterior a Classes de Resíduo |
| `ROTULO_RESIDUOS.md` | histórico/base do primeiro template físico; anterior à separação final prévia x impressão |
| `ETAPA_2_DARK_MODE.md` | fechamento técnico do Dark Mode |
| `ETAPA_2_FECHAMENTO.md` | fechamento da Etapa 2 |
| `ETAPA_2_BOOTSTRAP.md` | histórico de bootstrap |
| arquivos `ETAPA_1_*` | registro da padronização visual |
| `FECHAMENTO_PRIMEIRO_PROTOTIPO.md` | registro de aprovação do primeiro protótipo |
| `PLANO_TESTES_PRIMEIRO_PROTOTIPO.md` | bateria histórica reaproveitável |
| screenshots/registros visuais antigos | comparação histórica |

Se um documento histórico disser que `Classes de Resíduo`, Administração, Resíduos, Dashboard, Alertas, tema escuro ou outra funcionalidade já integrada “ainda será feita”, essa afirmação está superada.

---

## Decisões vigentes

- Lotes continuam dentro do contexto de Estoque;
- não existe área operacional independente de Produto;
- Unidade não possui CRUD manual normal;
- Administração usa `/administracao/cadastros` e é exclusiva de `ADMINISTRADOR`;
- usuário não é criado manualmente em Cadastros; Permissões altera perfis existentes;
- `Produto != Resíduo`;
- Classes de Resíduo já existem em Cadastros;
- modelos pré-cadastrados de Resíduo pertencem à Etapa 4.2;
- sessão atual é DEV e expira em 5h;
- o tema claro/escuro pertence às interfaces autenticadas e não altera Login sem decisão explícita;
- o frontend envia `X-SGL-Unidade-Id` a partir da sessão DEV;
- isolamento por Unidade é funcional, mas segurança definitiva dependerá de identidade autenticada;
- Código SGL e QR técnico de Resíduo existem desde a criação;
- o template físico atual pode não renderizar o QR técnico visualmente;
- prévia do rótulo e autorização de impressão são conceitos distintos.

---

## Etapa 4.1 — backend e frontend implementados

```text
LocalArmazenamentoResiduo
= catálogo mutável por Unidade

Residuo.localArmazenamentoResiduo
= referência opcional ao catálogo

Residuo.complementoLocalArmazenamento
= complemento opcional

Residuo.localArmazenamentoTemporario
= snapshot textual histórico
```

Impacto planejado no frontend após estabilização do backend:

```text
4.1-F Administração/Cadastros
→ manter locais de armazenamento

4.1-G Gestão
→ selecionar local cadastrado + complemento
→ ou usar modo manual
→ corrigir local na confirmação física
```

A 4.1-E foi fechada. As 4.1-F e 4.1-G estão implementadas; resta a 4.1-H para build, regressão integrada e fechamento.

---

## Roadmap atual

```text
Etapa 1 padrão visual                     ✅
Etapa 2 Dark Mode definitivo              ✅
Etapa 3 refinamentos de Resíduos          ✅
Etapa 4 expansão operacional de Resíduos  🔧 atual
Etapa 5 Projetos + Atividades             ⏳
Etapa 6 Estagiários + vínculos            ⏳
Etapa 7 relatórios consolidados           ⏳
Etapa 8 unidades + Soluções               ⏳
Etapa 9 Pedidos + Soluções                ⏳
Etapa 10 rótulos + impressão              ⏳
Etapa 11 Manual + delete lógico           ⏳
Etapa 12 testes frontend                  ⏳
Etapa 13 revisão estrutural               ⏳
```

---

## Regra para outra IA

Antes de implementar algo novo:

```text
1. ler ../CONTINUIDADE.md
2. ler o plano canônico do backend
3. ler o handoff da Etapa 4
4. conferir src/router/index.ts
5. conferir branch atual
6. conferir Swagger/OpenAPI
7. abrir o documento específico da área
8. distinguir decisão atual de registro histórico
```

Na situação atual, o frontend da 4.1 já está implementado e aguarda apenas a regressão integrada da 4.1-H.
