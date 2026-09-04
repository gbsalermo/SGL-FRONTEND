# Documentação — SGL Frontend

**Atualizado em:** 04/09/2026

Este índice separa documentação vigente, decisões de produto, referências visuais e registros históricos. O objetivo é evitar que uma etapa antiga seja interpretada como planejamento atual.

---

## Ordem de leitura para retomada

```text
1. ../CONTINUIDADE.md
2. ../README.md
3. DOSSIE_PROJETO_SGL.md
4. src/router/index.ts para rotas reais
5. Swagger/OpenAPI do backend para contratos HTTP
6. documento específico da área em trabalho
```

---

## Fonte de verdade

```text
código da main
→ Swagger/OpenAPI
→ ../CONTINUIDADE.md
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
Limpeza/revisão documental                   🔧 bloco atual
Matriz formal de permissões                  ⏳ após a pré-produção atual
Congelamento/homologação final               ⏳ posterior
Autenticação definitiva                      ⏳ posterior
Integração corporativa                       ⏳ posterior
```

---

## Documentos vigentes

| Documento | Papel | Estado |
|---|---|---|
| `../CONTINUIDADE.md` | checkpoint, fase atual e regra de retomada | **ATUAL — 04/09** |
| `../README.md` | visão rápida e execução | **ATUAL — 04/09** |
| `DOSSIE_PROJETO_SGL.md` | handoff completo humano/IA | **ATUAL — 04/09** |
| `INVENTARIO_TELAS.md` | inventário de rotas/telas | **REFERÊNCIA VIGENTE** |
| `FLUXOS_NAVEGACAO.md` | jornadas atuais | **REFERÊNCIA VIGENTE** |
| `ETAPA_CADASTROS_ADMIN.md` | decisões de Administração/Cadastros | **DECISÃO VIGENTE** |
| `ETAPA_ESTAGIARIOS.md` | decisões do módulo Estagiários | **DECISÃO VIGENTE** |
| `DECISAO_UNIDADES_CORPORATIVAS.md` | Unidade institucional e integração futura | **DECISÃO VIGENTE** |
| `IDENTIDADE_VISUAL.md` | identidade visual | **REFERÊNCIA** |
| `PADROES_PAGINA.md` | padrões de composição | **REFERÊNCIA** |
| `SHELL_VISUAL.md` | sidebar/topbar/shell | **REFERÊNCIA** |
| `ROTULO_PRODUTOS.md` | rótulo de Produto | **REFERÊNCIA** |
| `ROTULO_RESIDUOS.md` | rótulo de Resíduo | **REFERÊNCIA** |

---

## Roadmap e fechamento

| Documento | Interpretação atual |
|---|---|
| `ROADMAP_INTERFACE_GESTAO.md` | roadmap formal que será retomado **após** o bloco atual de pré-produção |
| `FECHAMENTO_PRIMEIRO_PROTOTIPO.md` | registro de fechamento/aprovação do primeiro protótipo; não é mais um gate pendente |
| `PLANO_TESTES_PRIMEIRO_PROTOTIPO.md` | bateria de testes reaproveitável na homologação formal posterior |

A matriz de permissões continua planejada, mas não deve ser descrita como tarefa imediata enquanto o bloco atual de pré-produção estiver aberto.

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
- modelos pré-determinados de Resíduo continuam possibilidade futura;
- QR Code não integra o rótulo visual atual;
- sessão atual é DEV e expira em 5h;
- o tema claro/escuro pertence às interfaces autenticadas e não deve alterar a tela de login sem decisão explícita;
- o frontend envia `X-SGL-Unidade-Id` a partir da Unidade da sessão DEV;
- o isolamento por Unidade é funcional, mas a segurança definitiva dependerá de identidade autenticada.

---

## Fase atual e roadmap

### Agora

```text
limpeza e atualização documental
→ planejamento dos ajustes de pré-produção
→ execução/refinamento
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
2. conferir src/router/index.ts
3. conferir a main atual
4. conferir Swagger/OpenAPI quando houver contrato HTTP
5. abrir o documento específico da área
6. distinguir decisão atual de registro histórico
```

Não reconstruir módulos aprovados apenas porque uma documentação antiga descreve uma fase anterior.
