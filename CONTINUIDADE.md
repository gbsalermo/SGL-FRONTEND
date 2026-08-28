# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 28/08/2026  
**Branch frontend atual:** `feat/gestao-interface`  
**Backend atual:** `main`  
**Fase atual:** Estoque — validação final  
**Próximo passo exato:** validar fracionamento irreversível + descarte por vencimento; se aprovados, encerrar Estoque e seguir para Produtos.

Este arquivo é a fonte principal de retomada do frontend.

---

# 0. Como continuar

Ao abrir uma nova sessão:

```text
1. ler CONTINUIDADE.md
2. ler docs/ROADMAP_INTERFACE_GESTAO.md
3. usar backend/Swagger como fonte de verdade
4. não duplicar regra de negócio no frontend
5. validar a etapa atual antes de avançar
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
Estoque — visão geral                         ✅ implementado
Estoque — detalhe                             ✅ implementado
Lotes — entrada                               ✅ implementado
Lotes — código SGL                            ✅ implementado
Lotes — embalagem/multiplicador               ✅ implementado
Lotes — modal detalhe/edição                  ✅ implementado
Lotes — fracionamento irreversível            ✅ implementado / validar
Lotes — descarte por vencimento               ✅ implementado / validar
Produtos operacional + rótulos                ⏳ próxima etapa
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

Pedidos já funcionam, mas a futura integração final de saída deve respeitar a regra de embalagem do estoque.

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

---

# 5. Estoque — regra principal

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

Exemplos de produtos diferentes:

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

# 7. Lote — estrutura definitiva atual

Cada lote possui:

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

## 7.1 Código SGL

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

O tipo original da embalagem passa a ser tratado como **histórico do lote** e não pode ser trocado depois da criação.

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

# 10. Fracionamento — decisão definitiva

Na interface:

```text
Pode retirar unidades separadamente?
```

Significado:

```text
false
→ a embalagem precisa sair completa

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

## Transição permitida

```text
não fracionável
→ fracionável
```

Permitido porque o gestor pode decidir abrir/liberar a embalagem.

## Transição proibida

```text
fracionável
→ não fracionável
```

Bloqueada permanentemente pelo backend.

Motivo: após liberar retiradas unitárias não é possível garantir que a embalagem física continua completa/lacrada.

O lote continua sendo historicamente KIT/CAIXA/etc.; apenas sua permissão operacional muda.

---

# 11. FIFO / FEFO com fracionamento

A ordenação continua:

```text
perecível → FEFO
não perecível → FIFO
```

Mas o lote também precisa ser compatível com a quantidade solicitada.

Fluxo do backend:

```text
ordenar lotes por FEFO/FIFO
→ analisar primeiro lote
→ se fracionável, pode consumir a quantidade necessária
→ se não fracionável, consumir somente múltiplos completos do multiplicador
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

Se nenhuma combinação de lotes conseguir atender sem quebrar uma embalagem fechada, a transação inteira é recusada.

Essa regra foi aplicada em `MovimentacaoEstoqueService.registrarSaida`.

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

Selecionar uma embalagem não altera o saldo real; muda apenas a visualização.

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

# 15. Descarte por vencimento — implementado

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

Se a quantidade solicitada exigir quebrar uma embalagem fechada e não houver outra combinação válida, a transação inteira é recusada.

Após descarte completo, lote vencido com saldo zero não entra mais no indicador operacional de `Produtos com lote vencido`.

---

# 16. Migrations relacionadas a Lotes

```text
V5 → apresentação/fracionamento
V6 → observação do lote
V7 → Código SGL + sequência
V8 → tipo de embalagem
```

Ao atualizar o backend, executar/reiniciar para o Flyway aplicar as migrations pendentes.

---

# 17. Próxima validação para encerrar Estoque

Validar:

```text
1. lote KIT não fracionável
2. abrir modal de edição
3. liberar retirada unitária
4. salvar
5. confirmar que não é mais possível desmarcar
6. confirmar tipo KIT preservado
7. criar/usar lote vencido com saldo
8. abrir Descartar vencidos
9. informar quantidade + justificativa
10. confirmar baixa do saldo
11. confirmar movimentação por lote
12. confirmar indicador de vencido some quando o saldo vencido chegar a zero
```

Se aprovado:

```text
Etapa 4 — Estoque ✅ ENCERRADA
→ iniciar Etapa 5 — Produtos + Rotulagem
```

---

# 18. Roadmap oficial

```text
Etapa 0 — Handoff backend → frontend                       ✅
Etapa 1 — Fundação visual/técnica                          ✅
Etapa 2 — Bootstrap técnico                                ✅
Etapa 3 — Interfaces iniciais                              ✅
  Login                                                     ✅
  Pedidos Solicitante                                      ✅
  Shell Gestão/Admin + Pedidos Gestão                      ✅

Etapa 4 — Estoque                                          🟡 VALIDAÇÃO FINAL
  visão geral                                               ✅
  detalhe                                                   ✅
  entrada de lote                                           ✅
  Código SGL                                                ✅
  embalagem + multiplicador                                ✅
  modal lote                                                ✅
  fracionamento irreversível                               ✅ validar
  FIFO/FEFO compatível com embalagem                       ✅ backend
  descarte por vencimento                                  ✅ validar

Etapa 5 — Produtos operacional + Rotulagem                 ⏳ PRÓXIMA
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

# 19. Administração futura — Estagiários

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

# 20. Rotas

```text
/login
/meus-pedidos
/pedidos/novo
/pedidos
/estoque
/estoque/:id
/produtos                  ⏳
/produtos/:id              ⏳
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

# 21. Regra central atual

**O usuário enxerga unidades e embalagens físicas de forma simples; o backend preserva a matemática, FIFO/FEFO, fracionamento e rastreabilidade.**
