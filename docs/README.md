# Documentação — SGL Frontend

**Atualizado em:** 03/09/2026

Este índice separa documentação vigente de snapshots históricos e impede que uma IA retome o projeto por uma instrução antiga de “próximo passo”.

## Ordem de leitura para retomada

```text
1. ../CONTINUIDADE.md
2. DOSSIE_PROJETO_SGL.md
3. src/router/index.ts para rotas realmente implementadas
4. Swagger/OpenAPI do backend para contratos HTTP
5. FECHAMENTO_PRIMEIRO_PROTOTIPO.md
6. ROADMAP_INTERFACE_GESTAO.md
7. documento específico da área em trabalho
```

## Fonte de verdade

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
| `../CONTINUIDADE.md` | checkpoint, status e próximo passo | **ATUAL — 03/09** |
| `DOSSIE_PROJETO_SGL.md` | handoff completo humano/IA | **ATUAL — 03/09** |
| `FECHAMENTO_PRIMEIRO_PROTOTIPO.md` | sequência de congelamento/homologação | **ATUAL — 03/09** |
| `ROADMAP_INTERFACE_GESTAO.md` | sequência funcional consolidada | **ATUAL — 03/09** |
| `INVENTARIO_TELAS.md` | rotas/telas implementadas | **ATUAL — 03/09** |
| `FLUXOS_NAVEGACAO.md` | jornadas e regras de navegação | **ATUAL — 03/09** |
| `ETAPA_CADASTROS_ADMIN.md` | decisões de Administração/Cadastros | **VIGENTE** |
| `ETAPA_ESTAGIARIOS.md` | decisões do módulo Estagiários | **VIGENTE** |
| `DECISAO_UNIDADES_CORPORATIVAS.md` | Unidade sem CRUD manual | **DECISÃO VIGENTE** |
| `IDENTIDADE_VISUAL.md` | paleta e linguagem visual | referência vigente |
| `PADROES_PAGINA.md` | padrões de composição | referência vigente |
| `SHELL_VISUAL.md` | sidebar/topbar/shell | referência vigente |
| `SIDEBAR_ALERTAS.md` | concepção de navegação/alertas | histórico conceitual; implementação já existe |
| `PLANO_TESTES_PRIMEIRO_PROTOTIPO.md` | bateria de homologação | **USAR APÓS CONGELAMENTO** |

## Estado resumido

```text
Pedidos                           ✅
Estoque/Lotes                     ✅
Movimentações                     ✅
Relatórios/Fiscalização           ✅
PDF/XLSX                          ✅
Resíduos                          ✅
Rótulos                           ✅
Estagiários                       ✅
Pessoas por laboratório           ✅
Administração/Cadastros           ✅
Dashboard Gestão                  ✅
Dashboard Solicitante             ✅
Alertas operacionais              ✅
Busca global                      ✅
Claro/Escuro                      ✅
404                               ✅
Matriz final de permissões        ⏳ próximo
Congelamento                      ⏳
Homologação                       ⏳
Autenticação definitiva           ⏳ posterior
```

## Mudanças que tornam o handoff de 31/08 obsoleto

Não considerar mais verdadeiras afirmações como:

```text
Administração/Cadastros é a próxima etapa
Resíduos precisa ser reconciliado
Dashboard ainda não existe
Alertas operacionais ainda são conceituais
Tema escuro ainda não foi implementado
```

Tudo isso já avançou na `main`.

## Decisões vigentes

- Lotes continuam no contexto de Estoque;
- Produto não possui segunda área operacional `/produtos`;
- Unidade não possui CRUD manual normal;
- Administração usa `/administracao/cadastros` e é exclusiva de `ADMINISTRADOR`;
- usuário não é criado manualmente em Cadastros; permissões alteram perfis existentes;
- `Produto != Resíduo`;
- modelos pré-determinados de Resíduo permanecem “Em breve”;
- QR Code não aparece no rótulo visual atual;
- autenticação atual é DEV e expira em 5h;
- o próximo bloco é matriz de permissões, depois congelamento e homologação.

## Documentos históricos

Arquivos de bootstrap, Figma, etapas antigas e screenshots continuam úteis para entender decisões visuais/técnicas, mas se contiverem “próxima etapa” antiga, essa indicação não prevalece sobre `CONTINUIDADE.md`.

## Regra para outra IA

Antes de implementar algo novo:

```text
1. verificar se já existe em src/router/index.ts
2. conferir CONTINUIDADE.md
3. conferir o Swagger
4. confirmar se a tarefa pertence ao fechamento/homologação ou a uma etapa posterior
```

Não reconstruir módulos concluídos apenas porque um documento histórico ainda descreve uma fase anterior.
