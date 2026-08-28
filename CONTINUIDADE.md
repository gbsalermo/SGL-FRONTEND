# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 28/08/2026  
**Branch frontend atual:** `feat/gestao-interface`  
**Backend atual:** `main`  
**Fase atual:** Etapa 5 — Produtos + Rotulagem  
**Última etapa concluída:** Etapa 4 — Estoque / Lotes  
**Próximo passo exato:** iniciar interface operacional de Produtos, consolidando dados do produto, lotes e futura geração de rótulo.

Este arquivo é a fonte principal de retomada do frontend.

---

# 0. Como continuar

Ao abrir uma nova sessão:

```text
1. ler CONTINUIDADE.md
2. ler docs/ROADMAP_INTERFACE_GESTAO.md
3. usar backend/Swagger como fonte de verdade
4. não duplicar regra de negócio no frontend
5. manter a linguagem da interface simples para o usuário
6. continuar da etapa indicada em PRÓXIMO PASSO EXATO
```

Fluxo:

```text
entender domínio
→ conferir contrato real
→ implementar
→ validar visualmente
→ refinar
→ concluir etapa
→ próxima etapa
```

---

# 1. Stack

```text
Vue 3
Vite
TypeScript 5.9
Vue Router
Pinia
Axios
Vuetify 3
```

Regras gerais:

- UUID público nas fronteiras;
- Axios concentrado em services;
- Admin reutiliza a Gestão;
- complexidade técnica pode existir internamente sem aparecer como linguagem de interface;
- identificadores internos são gerados pelo backend;
- dados históricos de estoque não devem ser reescritos de forma que altere rastreabilidade.

---

# 2. Estado geral

```text
Login                                         ✅
Pedidos do Solicitante                        ✅
Shell Gestão/Admin                            ✅
Pedidos da Gestão                             ✅
Estoque — visão geral                         ✅
Estoque — detalhe                             ✅
Lotes — entrada                               ✅
Lotes — código SGL                            ✅
Lotes — embalagem/multiplicador               ✅
Lotes — modal detalhe/edição                  ✅
Lotes — fracionamento irreversível            ✅ validado
Lotes — FIFO/FEFO com embalagem               ✅ backend
Lotes — descarte por vencimento               ✅ validado
Lotes — busca/filtro de situação              ✅
Produtos operacional + rótulos                ⏳ ETAPA ATUAL
Movimentações                                 ⏳
Relatórios                                    ⏳
Administração / Cadastros                     ⏳
Estagiários                                   ⏳ obrigatório em Administração
Dashboard final / robustez / 404              ⏳
Autenticação definitiva / auditoria           ⏳
```

---

# 3. Unidade institucional

Decisão definitiva:

**Unidade institucional não terá CRUD manual no SGL.**

Fluxo futuro:

```text
login corporativo
→ API corporativa informa unidade
→ SGL associa pelo identificador institucional
```

Não criar:

```text
/cadastros/unidades
```

Documento:

```text
docs/DECISAO_UNIDADES_CORPORATIVAS.md
```

---

# 4. Pedidos

Pedidos já funcionam, mas a integração final da saída deverá usar a regra consolidada de embalagem/lote.

Exemplo:

```text
saldo = 200 unit.
1 kit = 50 unit.

pedido de 1 kit
→ baixa 50 unit.

pedido de 10 unit.
→ baixa 10 unit. somente se existir lote compatível com retirada unitária
```

Nunca interpretar quantidade unitária como quantidade de kits.

Quando a interface de pedido for revisitada, deve oferecer apenas formas de retirada realmente disponíveis nos lotes utilizáveis.

---

# 5. Estoque — ETAPA 4 CONCLUÍDA

## 5.1 Regra principal

O saldo operacional é sempre consolidado em **unidades individuais do item cadastrado**.

Exemplo:

```text
Extrato de DNA
4 kits de 50
→ 200 unit.

saída de 1 kit
→ -50
→ 150 unit.
```

O estoque mínimo usa a mesma unidade:

```text
mínimo = 100 unit.
```

Não existem saldos independentes de `kit` e `unidade`.

---

# 6. Produto x embalagem

O item físico é definido pelo Produto.

Exemplos de produtos distintos:

```text
Água 1 L
Água 500 mL
Água 250 mL
```

Não misturar esses saldos.

Uma caixa com 10 garrafas de Água 1 L representa:

```text
Produto: Água 1 L
Tipo de embalagem: CAIXA
Especificação: caixa com 10 garrafas de 1 L
Multiplicador: 10
Quantidade recebida: 1 caixa
Saldo incorporado: 10 unit.
```

A matemática fica interna.

---

# 7. Estrutura definitiva atual do Lote

```text
codigoInterno
numeroLote
tipoEmbalagem
apresentacao
quantidadeApresentacoes
conteudoPorApresentacao
fracionavel
observacao
quantidadeInicial
quantidadeDisponivel
dataEntrada
dataValidade
ativo
```

## Código SGL

Formato:

```text
LOT-<CODIGO_REFERENCIA_PRODUTO>-<SEQUENCIAL>
```

Exemplo:

```text
LOT-EXT-DNA-PL-001
LOT-EXT-DNA-PL-002
```

Regras:

```text
gerado pelo backend
sequencial por produto
único
imutável
não digitado pelo usuário
não editável
```

Flyway:

```text
V7__add_codigo_interno_lote.sql
```

---

# 8. Tipo e especificação de embalagem

Tipo controlado:

```text
UNITARIO
KIT
CAIXA
GARRAFA
GALAO
```

Backend:

```text
TipoEmbalagem
Lote.tipoEmbalagem
```

Flyway:

```text
V8__add_tipo_embalagem_lote.sql
```

Especificação livre:

```text
kit com 50 unidades
garrafa de 1 L
caixa com 10 garrafas de 1 L
unidade de 10 kg
```

O tipo original da embalagem é histórico e não pode ser trocado depois da criação.

A descrição textual pode ser corrigida sem mudar o multiplicador original.

---

# 9. Multiplicador

`conteudoPorApresentacao` é exibido como:

```text
Multiplicador de unidades
```

Exemplos:

```text
UNITARIO → 1
KIT com 50 → 50
CAIXA com 10 itens → 10
```

Depois da entrada ficam bloqueados:

```text
quantidade recebida
multiplicador
código SGL
tipo original da embalagem
```

Motivo: preservar a rastreabilidade física e matemática da entrada.

---

# 10. Fracionamento — decisão definitiva e validada

Na interface:

```text
Pode retirar unidades separadamente?
```

Significado:

```text
false
→ embalagem precisa sair completa

true
→ podem sair unidades individuais
```

Exemplo:

```text
KIT
multiplicador = 50
fracionavel = false

saídas válidas:
50
100
150
...
```

Transição permitida:

```text
não fracionável
→ fracionável
```

Transição proibida:

```text
fracionável
→ não fracionável
```

A segunda é bloqueada permanentemente pelo backend. Após liberar retirada unitária não é possível garantir que a embalagem continua completa/lacrada.

O lote continua historicamente KIT/CAIXA/etc.; apenas sua permissão operacional muda.

Fluxo validado no frontend e backend em 28/08/2026.

---

# 11. FIFO / FEFO com fracionamento

Ordenação:

```text
perecível → FEFO
não perecível → FIFO
```

O lote também precisa ser compatível com a quantidade solicitada.

Fluxo do backend:

```text
ordenar lotes por FEFO/FIFO
→ analisar lote
→ se fracionável, pode consumir a quantidade necessária
→ se não fracionável, consumir somente múltiplos completos
→ se não servir, seguir para o próximo lote
→ repetir até completar a saída
```

Exemplo:

```text
Lote A vence primeiro
KIT 50
não fracionável

Lote B vence depois
KIT 50
fracionável

pedido = 10 unit.
→ A é pulado
→ B atende 10
```

Se nenhuma combinação conseguir atender sem quebrar embalagem fechada, a transação inteira é recusada.

Regra aplicada em `MovimentacaoEstoqueService.registrarSaida`.

---

# 12. Interface do detalhe de estoque

Rota:

```text
/estoque/:id
```

Resumo:

```text
Quantidade disponível
Visualizar por embalagem
Vencem em até 30 dias
Lotes vencidos
```

Saldo principal:

```text
200 unit.
```

Filtro por embalagem:

```text
Unidades individuais
Kits — 50 unit. por embalagem
Caixas — 10 unit. por embalagem
```

Selecionar embalagem não altera o saldo real; muda somente a visualização.

---

# 13. Tabela de lotes

Colunas:

```text
Código SGL
Unidade
Disponível agora
Entrada
Validade
Situação
Detalhes
```

Exemplo:

```text
Unidade
2 kits
kit com 50 unidades

Disponível agora
100 unit.
```

Não mostrar conceitos como:

```text
unidade-base
registro antigo
lote legado
fator de conversão
```

## Busca e filtro

A lista possui busca por:

```text
Código SGL
lote/referência do fornecedor
especificação da embalagem
tipo de embalagem
```

Filtro de situação:

```text
Todos
Válidos
Próximos do vencimento
Vencidos
Descartados por vencimento
```

A filtragem é local sobre os lotes carregados do estoque atual.

## Status visual de descarte

Não foi criado novo status persistido no backend nesta etapa.

Regra visual atual:

```text
lote vencido + quantidadeDisponivel > 0
→ VENCIDO

lote vencido + quantidadeDisponivel = 0
→ DESCARTADO POR VENCIMENTO
```

Isso evita manter um lote já tratado visualmente como apenas `VENCIDO`.

Observação de domínio: se futuramente for necessário distinguir com precisão `zerado por consumo` de `zerado por descarte`, o backend deverá expor explicitamente a causa/status final do lote através do histórico de movimentações. Por enquanto, a nomenclatura é um refinamento visual desta interface.

---

# 14. Modal de lote

Mostra:

```text
Código SGL
Lote do fornecedor
Tipo de unidade
Especificação
Multiplicador
Entrada
Validade
Retirada unitária
Observação
```

Editáveis:

```text
referência do fornecedor
especificação textual
data de validade
observação
liberar fracionamento, caso ainda esteja bloqueado
```

Não editáveis:

```text
Código SGL
tipo original da embalagem
quantidade original
multiplicador original
fracionável=true → false
```

---

# 15. Descarte por vencimento — implementado e validado

Endpoint:

```text
POST /api/v1/movimentacoes/estoques/{estoqueId}/descarte-vencimento?usuarioId={uuid}
```

Body:

```text
quantidade
justificativa
```

Na interface existe `Descartar vencidos` quando há lote vencido com saldo.

O modal mostra:

```text
lotes vencidos com saldo
total vencido
Código SGL
especificação
validade
quantidade disponível
regra de embalagem/fracionamento
quantidade a descartar
justificativa
```

Regras:

```text
somente produto perecível
somente saldo de lotes vencidos
justificativa obrigatória
baixa no estoque em unit.
movimentação registrada por lote
lotes vencidos mais antigos primeiro
embalagem não fracionável deve ser descartada em múltiplos completos
```

Se a quantidade exigir quebrar uma embalagem fechada e não houver combinação válida, a transação inteira é recusada.

Após descarte completo, lote vencido com saldo zero não entra mais no indicador operacional `Produtos com lote vencido`.

Fluxo validado em 28/08/2026.

---

# 16. Migrations relacionadas a Lotes

```text
V5 → apresentação/fracionamento
V6 → observação do lote
V7 → Código SGL + sequência
V8 → tipo de embalagem
```

---

# 17. Etapa 4 — encerramento

Validações realizadas:

```text
✅ saldo em unidades
✅ entrada com embalagem/multiplicador
✅ Código SGL automático
✅ modal de lote
✅ edição segura
✅ fracionamento false → true
✅ bloqueio true → false
✅ tipo de embalagem preservado
✅ descarte por vencimento
✅ baixa de saldo após descarte
✅ indicador de vencimento considera somente saldo > 0
✅ busca e filtro de lotes implementados
✅ nomenclatura visual DESCARTADO POR VENCIMENTO
```

**Etapa 4 — Estoque / Lotes encerrada.**

---

# 18. Etapa 5 — Produtos + Rotulagem — PRÓXIMA

Produto é módulo operacional de primeira classe.

Rotas planejadas:

```text
/produtos
/produtos/:id
```

A interface deve consolidar informações como:

```text
nome
código de referência
descrição
item físico / unidade
embalagem padrão
localização
estoque mínimo
risco
perecibilidade
condições de armazenamento
saldo atual
lotes ativos
última entrada
```

Também deve preparar o fluxo de rotulagem.

Rótulo de lote deve usar como identidade principal:

```text
codigoInterno
```

Exemplo:

```text
LOT-EXT-DNA-PL-001
```

Informações candidatas ao rótulo:

```text
produto
Código SGL
lote do fornecedor
validade
especificação da embalagem
quantidade
localização
risco
condições de armazenamento
```

Definir o layout e os tipos de rótulo durante esta etapa antes de implementar geração/impressão definitiva.

---

# 19. Roadmap oficial

```text
Etapa 0 — Handoff backend → frontend                       ✅
Etapa 1 — Fundação visual/técnica                          ✅
Etapa 2 — Bootstrap técnico                                ✅
Etapa 3 — Interfaces iniciais                              ✅
  Login                                                     ✅
  Pedidos Solicitante                                      ✅
  Shell Gestão/Admin + Pedidos Gestão                      ✅

Etapa 4 — Estoque / Lotes                                  ✅ CONCLUÍDA
  visão geral                                               ✅
  detalhe                                                   ✅
  entrada de lote                                           ✅
  Código SGL                                                ✅
  embalagem + multiplicador                                ✅
  modal lote                                                ✅
  fracionamento irreversível                               ✅
  FIFO/FEFO compatível com embalagem                       ✅
  descarte por vencimento                                  ✅
  busca/filtro/status visual                               ✅

Etapa 5 — Produtos operacional + Rotulagem                 🟡 ATUAL
Etapa 6 — Movimentações                                    ⏳
Etapa 7 — Relatórios / Documentos / Fiscalização           ⏳
Etapa 8 — Administração / Cadastros                        ⏳
  Produtos                                                  ⏳
  Laboratórios                                              ⏳
  Projetos                                                  ⏳
  Usuários                                                  ⏳
  Estagiários                                               ⏳ obrigatório
Etapa 9 — Dashboards finais / robustez / 404               ⏳
Etapa 10 — Autenticação / autorização / auditoria          ⏳
```

---

# 20. Administração futura — Estagiários

Interface própria prevista:

```text
/cadastros/estagiarios
/cadastros/estagiarios/:id
```

Mostrar:

```text
nome
email/identificador corporativo
unidade corporativa read-only
laboratório
supervisor/professor responsável
vínculo
situação
período
observações
```

Não duplicar senha/identidade corporativa localmente.

---

# 21. Rotas

```text
/login
/meus-pedidos
/pedidos/novo
/pedidos
/estoque
/estoque/:id
/produtos                  ⏳ próxima implementação
/produtos/:id              ⏳ próxima implementação
/movimentacoes             ⏳
/relatorios                ⏳
/cadastros/produtos        ⏳
/cadastros/laboratorios    ⏳
/cadastros/projetos        ⏳
/cadastros/usuarios        ⏳
/cadastros/estagiarios     ⏳
/cadastros/estagiarios/:id ⏳
/:pathMatch(.*)*           ⏳
```

---

# 22. Regra central atual

**O usuário enxerga unidades e embalagens físicas de forma simples; o backend preserva matemática, FIFO/FEFO, fracionamento e rastreabilidade.**

Próxima direção:

**Produtos deve organizar o catálogo operacional e preparar a geração de rótulos sem duplicar as responsabilidades do Estoque/Lote.**
