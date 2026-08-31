# Roadmap da Interface de Gestão — SGL

**Atualização:** 31/08/2026  
**Fonte principal de retomada:** `../CONTINUIDADE.md`  
**Handoff completo:** `DOSSIE_PROJETO_SGL.md`

Este documento registra a sequência funcional aprovada para Gestão/Administração. Ele substitui o status antigo de 27/08 que ainda colocava Estoque, Movimentações e Relatórios como etapas futuras.

---

# 1. Estado consolidado

```text
Pedidos da Gestão                              ✅
Estoque / Lotes                                ✅
Movimentações                                  ✅
Relatórios / Fiscalização                      ✅
Exportação PDF/XLSX                            ✅
Página 404                                     ✅
Administração / Cadastros                      🟡 PRÓXIMA
Resíduos                                       ⏳ complementar após reconciliação backend
Documentos / Rotulagem                         ⏳
Dashboard / Alertas / Robustez                 ⏳
Autenticação / Autorização / Auditoria         ⏳
```

---

# 2. Decisões que não devem ser reabertas sem necessidade

## Lotes

Lote continua contextual a Estoque; não precisa ser item principal isolado na sidebar.

## Produto

A proposta antiga de uma área operacional `/produtos` foi substituída.

Decisão atual:

```text
Gestão operacional
├── Estoque
├── Lotes no detalhe de Estoque
├── Movimentações
└── Relatórios

Administração
└── Cadastros
    └── Produtos
```

Consulta de saldo/lote fica em Estoque. Visão analítica fica em Relatórios. CRUD real fica em Cadastros.

## Unidade

Não possui CRUD manual no frontend.

```text
NÃO criar /cadastros/unidades
```

A origem futura será a integração corporativa. Ver `DECISAO_UNIDADES_CORPORATIVAS.md`.

## Pedidos entregues

Não possuem relatório dedicado.

```text
Relatório de Movimentações
→ origem PEDIDO
→ tipo SAIDA quando aplicável
```

---

# 3. Etapa 8 — Administração / Cadastros — PRÓXIMA

Objetivo: fornecer manutenção administrativa dos dados que sustentam os fluxos operacionais já concluídos.

Ordem aprovada:

```text
8.1 Produtos
8.2 Laboratórios
8.3 Projetos
8.4 Usuários
8.5 Estagiários
```

Cada subbloco deve seguir:

```text
contrato Swagger
→ types
→ service
→ listagem/busca
→ novo/editar
→ estados de feedback
→ validação visual
→ validação de integração
→ merge
```

Não avançar automaticamente para o próximo cadastro antes de validar o anterior.

---

# 4. Etapa 8.1 — Produtos

Rota prevista:

```text
/cadastros/produtos
```

Responsabilidades:

```text
listar/buscar catálogo
criar produto
editar produto
ativar/inativar conforme contrato
manter dados estruturais
manter classificação de fiscalização
```

O formulário deve ser construído a partir do contrato real do backend/Swagger. Entre os dados já decididos estão:

```text
nome
código de referência
descrição
unidade de medida/base
localização
risco
perecibilidade
armazenamento
ativo
fiscalizado
órgãos fiscalizadores
observação de fiscalização
```

### Fiscalização

```text
Fiscalizado?              toggle
Órgãos fiscalizadores     seleção múltipla
Observação fiscalização   opcional
```

Se `Fiscalizado = Sim`, ao menos um órgão deve ser informado.

Órgãos iniciais:

```text
Polícia Federal
Vigilância Sanitária
ANVISA
Exército
Outro
```

Não inferir fiscalização por risco ou perecibilidade.

---

# 5. Etapa 8.2 — Laboratórios

Rota prevista:

```text
/cadastros/laboratorios
```

Deve respeitar o vínculo com Unidade e responsável conforme contrato backend.

Como Unidade não é cadastro manual, seletores/contextos devem usar unidades já existentes/sincronizadas no sistema; não adicionar botão “Nova Unidade”.

---

# 6. Etapa 8.3 — Projetos

Rota prevista:

```text
/cadastros/projetos
```

Priorizar:

```text
laboratório
nome/descrição
responsável
período
ativo
```

Usar o contrato real da API como autoridade.

---

# 7. Etapa 8.4 — Usuários

Rota prevista:

```text
/cadastros/usuarios
```

O fluxo administrativo deve permitir manutenção/inativação prevista no backend, sem confundir isso com a futura autenticação corporativa.

A etapa de autenticação definitiva continuará separada.

---

# 8. Etapa 8.5 — Estagiários

Rota prevista:

```text
/cadastros/estagiarios
```

Cadastro obrigatório.

Mostrar/manter conforme contrato:

```text
nome / identidade de usuário
unidade read-only/contextual
laboratório
situação do vínculo
início/fim
bolsa
observações
```

`Encerrar estágio` deve ser ação de domínio própria, distinta de exclusão genérica.

---

# 9. Etapa complementar — Resíduos

Não iniciar assumindo que a branch backend antiga está pronta.

Estado em 31/08/2026:

```text
backend feat/gestao-residuos
→ 2 commits próprios
→ 91 commits atrás da main
→ migration antiga incompatível com numeração atual
```

Fluxo correto:

```text
reconciliar/portar backend sobre main atual
→ validar Swagger
→ implementar fluxo Solicitante: Informar resíduo
→ implementar fluxo Gestão: Resíduos
→ ativar relatório Resíduos
→ ativar PDF/XLSX Resíduos
```

Decisão de domínio:

```text
Produto ≠ Resíduo
```

Composição de resíduo não altera automaticamente o estoque dos produtos citados.

---

# 10. Documentos e Rotulagem

Continuam como bloco complementar após os cadastros/resíduos conforme dependências.

## Documentos

Contextos previstos:

```text
Pedido
Produto
Lote
```

Não implementar persistência local/fictícia; aguardar/definir contrato backend real de upload/download.

## Rotulagem

Pode usar dados de Produto + Lote, inclusive Código SGL e apresentação física.

Código vigente de lote:

```text
LOT-<CODIGO_REFERENCIA_PRODUTO>-<SEQUENCIAL>
```

Formatos experimentais registrados em documentos antigos não são o padrão atual.

---

# 11. Dashboard / Alertas / Robustez

Depois dos blocos funcionais principais:

```text
Dashboard final
alertas de estoque baixo
alertas de vencimento
pedidos pendentes/urgentes
estados loading/empty/error/retry
responsividade final
acessibilidade
prefers-reduced-motion
```

Página 404 já está concluída e não deve voltar para a lista de pendências.

---

# 12. Autenticação / Autorização / Auditoria

Etapa final funcional prevista:

```text
frontend funcional fechado
→ autenticação local definitiva
→ autorização por perfil
→ auditoria derivada da sessão segura
→ integração corporativa
```

A sessão atual é DEV e não valida senha no backend.

Unidade será sincronizada pela integração corporativa; não criar CRUD manual como preparação para essa etapa.

---

# 13. Pós-protótipo

Refactor técnico para inglês:

```text
classes/métodos backend
DTOs/services/repositories/controllers
nomenclatura técnica frontend
```

Interface permanece em português.

Não misturar o refactor com novas funcionalidades. Ver `Sistema-SGL/docs/PENDENCIAS_POS_PROTOTIPO.md`.

---

# 14. Sequência oficial resumida

```text
AGORA
Administração / Cadastros
  Produtos
  → Laboratórios
  → Projetos
  → Usuários
  → Estagiários

DEPOIS
Resíduos reconciliado
→ Relatório/exportação Resíduos
→ Documentos/Rotulagem
→ Dashboard/Alertas/Robustez
→ Autenticação/Autorização/Auditoria
→ Integração corporativa
→ Refactor inglês pós-protótipo
```
