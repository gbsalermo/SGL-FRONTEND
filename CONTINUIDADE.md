# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 28/08/2026  
**Branch frontend atual:** `feat/gestao-interface`  
**Backend atual:** `main`  
**Fase atual:** Etapa 5 — Produtos + Rotulagem  
**Última etapa concluída:** Etapa 4 — Estoque / Lotes  
**Próximo passo exato:** validar a integração final Pedidos ↔ Lotes/Embalagens; depois iniciar a interface operacional de Produtos, estoque mínimo e Rotulagem.

Este arquivo é a fonte principal de retomada do frontend.

---

# 0. Como continuar

```text
1. ler CONTINUIDADE.md
2. ler docs/ROADMAP_INTERFACE_GESTAO.md
3. usar backend/Swagger como fonte de verdade
4. não duplicar regra de negócio no frontend
5. manter linguagem simples para o usuário
6. validar o bloco atual antes de avançar
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
- complexidade técnica pode existir internamente sem aparecer como linguagem técnica ao usuário;
- identificadores internos são gerados pelo backend;
- dados históricos de estoque não devem ser reescritos de forma que altere rastreabilidade.

---

# 2. Estado geral

```text
Login                                         ✅
Pedidos do Solicitante                        ✅
Pedidos — forma de retirada por embalagem     ✅ implementar/validar
Pedidos Gestão                                ✅
Pedidos Entregues — lotes utilizados          ✅ implementar/validar
Shell Gestão/Admin                            ✅
Estoque — visão geral                         ✅
Estoque — detalhe                             ✅
Lotes — entrada                               ✅
Lotes — código SGL                            ✅
Lotes — embalagem/multiplicador               ✅
Lotes — modal detalhe/edição                  ✅
Lotes — histórico de saídas                   ✅ implementar/validar
Lotes — fracionamento irreversível            ✅ validado
Lotes — FIFO/FEFO com embalagem               ✅ backend
Lotes — descarte por vencimento               ✅ validado
Lotes — busca/filtro de situação              ✅
Produtos operacional + rótulos                ⏳ ETAPA ATUAL
Movimentações                                 ⏳
Relatórios                                    ⏳
Administração / Cadastros                     ⏳
Estagiários                                   ⏳ obrigatório
Tipos de unidade/embalagem                    ⏳ previsto em Administração
Dashboard final / robustez / 404              ⏳
Autenticação definitiva / auditoria           ⏳
```

---

# 3. Unidade institucional

**Unidade institucional não terá CRUD manual no SGL.**

Fluxo futuro:

```text
login corporativo
→ API corporativa informa unidade
→ SGL associa pelo identificador institucional
```

Não criar `/cadastros/unidades`.

Documento relacionado:

```text
docs/DECISAO_UNIDADES_CORPORATIVAS.md
```

Unidade institucional e tipo de unidade/embalagem de estoque são conceitos diferentes.

---

# 4. Pedidos — integração definitiva com Lotes/Embalagens

A regra de quantidade do Estoque passou a fazer parte do contrato de Pedido.

## 4.1 Novo pedido — forma de retirada

O solicitante não informa apenas uma quantidade abstrata. Para cada produto, ele escolhe uma **forma de retirada realmente disponível nos lotes utilizáveis**.

Exemplos:

```text
UNITÁRIO
KIT — 50 unit. por kit
CAIXA — 10 unit. por caixa
GARRAFA
GALÃO
```

A interface consulta os lotes ativos com saldo daquele estoque.

### UNITÁRIO

A opção `UNITÁRIO` fica disponível quando existir:

```text
lote UNITARIO
OU
lote com fracionavel = true
```

Exemplo:

```text
pedido = 10 unidades
→ quantidadeSolicitada interna = 10
```

### KIT / CAIXA / GARRAFA / GALÃO

Para retirada por embalagem, devem existir lotes compatíveis com:

```text
mesmo tipoEmbalagem
+
mesmo multiplicador
```

Exemplo:

```text
KIT
multiplicador = 50
pedido = 2 kits
→ quantidadeSolicitada interna = 100 unit.
```

**Nunca atender 1 KIT usando 50 unidades de outro tipo de embalagem apenas porque a matemática coincide.**

A forma escolhida é persistida em `ItemPedido`:

```text
tipoEmbalagemSolicitada
quantidadeEmbalagensSolicitada
multiplicadorSolicitado
quantidadeSolicitada = total em unidades
```

Migration:

```text
V9__add_forma_retirada_item_pedido.sql
```

Pedidos anteriores à V9 são migrados como `UNITARIO`, multiplicador `1`.

## 4.2 Orientação quando não existir kit

Se não houver lote com KIT disponível, a interface não oferece KIT como opção e informa:

```text
Não há kits disponíveis.
Solicite por unidade ou por outra embalagem disponível.
```

Não mostrar ao usuário opções impossíveis de atender.

## 4.3 Aprovação pela Gestão

A quantidade aprovada continua sendo registrada em unidades, porém precisa respeitar a forma solicitada.

Exemplo:

```text
solicitado = KIT de 50

válido:
50
100
150

inválido:
25
75
```

Para `UNITARIO`, a aprovação pode ocorrer unidade a unidade.

## 4.4 FIFO / FEFO + forma solicitada

Fluxo de saída:

```text
pedido informa forma de retirada
→ localizar lotes compatíveis
→ ordenar por FEFO/FIFO
→ respeitar fracionamento
→ baixar os lotes realmente utilizados
→ registrar MovimentacaoEstoque por lote
```

Compatibilidade:

```text
UNITARIO
→ lote UNITARIO ou lote fracionável

KIT/CAIXA/GARRAFA/GALAO
→ mesmo tipo + mesmo multiplicador
```

## 4.5 Pedidos Entregues — rastreabilidade por lote

Em `Gestão → Pedidos → Entregues`, ao abrir o pedido, cada item deve mostrar os **lotes realmente utilizados na saída**:

```text
Código SGL
quantidade retirada daquele lote
data/hora da saída
```

Exemplo:

```text
LOT-EXT-DNA-PL-007
50 unit. · saída em 28/08/2026 10:30
```

O Código SGL exibido vem de `MovimentacaoEstoque.lote`, e não de inferência do frontend.

Endpoint usado:

```text
GET /api/v1/movimentacoes/pedido?pedidoId={uuid}
```

---

# 5. Estoque — ETAPA 4 CONCLUÍDA

O saldo operacional é sempre consolidado em **unidades individuais do item cadastrado**.

```text
4 kits de 50
→ 200 unit.

saída de 1 kit
→ -50
→ 150 unit.
```

O estoque mínimo usa o mesmo saldo.

## Estoque mínimo

O estoque mínimo pertence à configuração operacional do **Produto** e será editado principalmente em:

```text
/produtos/:id
```

A tela de Estoque apenas exibe/compara o valor para gerar alertas.

## Resumo superior

Foi removido do topo:

```text
Embalagem mais comum
```

Permanecem:

```text
Contagem padrão
Localização
Avisar quando restarem
```

---

# 6. Produto x embalagem

Produtos com tamanho/volume físico diferente são itens distintos quando isso muda o material estocado.

```text
Água 1 L
Água 500 mL
Água 250 mL
```

Exemplo de entrada:

```text
Produto: Água 1 L
Tipo: CAIXA
Especificação: caixa com 10 garrafas de 1 L
Multiplicador: 10
Quantidade recebida: 1 caixa
Saldo incorporado: 10 unit.
```

A matemática fica interna.

---

# 7. Estrutura atual do Lote

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

Código SGL:

```text
LOT-<CODIGO_REFERENCIA_PRODUTO>-<SEQUENCIAL>
```

Regras:

```text
gerado pelo backend
sequencial por produto
único
imutável
não digitado
não editável
```

---

# 8. Tipo e especificação de embalagem

Tipos atuais:

```text
UNITARIO
KIT
CAIXA
GARRAFA
GALAO
```

Especificação livre:

```text
kit com 50 unidades
garrafa de 1 L
caixa com 10 garrafas de 1 L
```

O tipo original da embalagem é histórico e não pode ser trocado depois da criação.

---

# 9. Multiplicador

`conteudoPorApresentacao` aparece na interface como **Multiplicador de unidades**.

```text
UNITARIO → 1
KIT com 50 → 50
CAIXA com 10 → 10
```

Depois da entrada ficam bloqueados:

```text
quantidade recebida
multiplicador
Código SGL
tipo original da embalagem
```

---

# 10. Fracionamento — decisão definitiva

```text
false → embalagem precisa sair completa
true  → unidades podem sair separadamente
```

Transição:

```text
false → true ✅
true → false ❌
```

O backend bloqueia a volta para não fracionável.

---

# 11. FIFO / FEFO

```text
perecível → FEFO
não perecível → FIFO
```

A seleção também precisa respeitar:

```text
forma solicitada
multiplicador
fracionamento
```

Se não houver combinação válida, a transação inteira é recusada.

---

# 12. Detalhe de Estoque

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

Filtro por embalagem muda apenas a visualização, nunca o saldo real.

---

# 13. Tabela de Lotes

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

Busca:

```text
Código SGL
lote do fornecedor
especificação
tipo de embalagem
```

Filtro:

```text
Todos
Válidos
Próximos do vencimento
Vencidos
Descartados por vencimento
```

Regra visual:

```text
vencido + saldo > 0 → VENCIDO
vencido + saldo = 0 → DESCARTADO POR VENCIMENTO
```

---

# 14. Modal do Lote — dados + histórico de saída

Dados cadastrais mostrados:

```text
Código SGL
lote do fornecedor
tipo
especificação
multiplicador
entrada
validade
retirada unitária
observação
```

O modal também possui **Saídas deste lote**, consultando:

```text
GET /api/v1/movimentacoes/lote?loteId={uuid}
```

Para cada `SAIDA`, mostrar pelo menos:

```text
data/hora da saída
quantidade
nome do usuário solicitante do pedido
```

Exemplo:

```text
Maria Oliveira
28/08/2026 10:30
50 unit.
```

`pedidoSolicitanteNome` identifica quem fez o pedido. `usuarioNome` da movimentação continua representando quem executou/registrou a operação, como o gestor aprovador.

Isso cria rastreabilidade nos dois sentidos:

```text
Pedido entregue → quais lotes saíram
Lote → para quais pedidos/solicitantes houve saída
```

---

# 15. Descarte por vencimento

Implementado e validado.

```text
somente produto perecível
somente lotes vencidos com saldo
justificativa obrigatória
baixa em unit.
movimentação por lote
mais antigos primeiro
respeita embalagem fechada
```

---

# 16. Migrations relacionadas

```text
V5 → apresentação/fracionamento do lote
V6 → observação do lote
V7 → Código SGL + sequência
V8 → tipo de embalagem do lote
V9 → forma de retirada persistida no ItemPedido
```

---

# 17. Etapa 4 — Estoque/Lotes encerrada

```text
✅ saldo em unidades
✅ entrada com embalagem/multiplicador
✅ Código SGL automático
✅ modal de lote
✅ edição segura
✅ fracionamento irreversível
✅ FIFO/FEFO compatível
✅ descarte por vencimento
✅ busca/filtro de lotes
✅ status visual de descarte
✅ resumo superior simplificado
✅ histórico de saída por lote implementado para validação
```

---

# 18. Etapa 5 — Produtos + Rotulagem — ATUAL

Rotas planejadas:

```text
/produtos
/produtos/:id
```

Produto deve consolidar:

```text
nome
código de referência
descrição
item físico / unidade
localização
estoque mínimo
risco
perecibilidade
condições de armazenamento
saldo atual
lotes ativos
última entrada
```

A edição do estoque mínimo ocorrerá em Produto.

## Rotulagem

Rótulo de lote usa `codigoInterno` como identidade principal.

Candidatos:

```text
produto
Código SGL
lote do fornecedor
validade
especificação
quantidade
localização
risco
condições de armazenamento
```

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

Refino transversal Pedidos ↔ Estoque/Lotes                🟡 VALIDAR
  forma de retirada no novo pedido                         ✅
  disponibilidade baseada em lotes                         ✅
  aprovação respeita embalagem                             ✅
  saída respeita tipo + multiplicador                      ✅
  lotes em pedidos entregues                               ✅
  histórico de saída dentro do lote                        ✅

Etapa 4 — Estoque / Lotes                                  ✅ CONCLUÍDA
Etapa 5 — Produtos operacional + Rotulagem                 🟡 ATUAL
Etapa 6 — Movimentações                                    ⏳
Etapa 7 — Relatórios / Documentos / Fiscalização           ⏳
Etapa 8 — Administração / Cadastros                        ⏳
  Produtos                                                  ⏳
  Laboratórios                                              ⏳
  Projetos                                                  ⏳
  Usuários                                                  ⏳
  Estagiários                                               ⏳ obrigatório
  Tipos de unidade / embalagem                             ⏳ planejar CRUD
Etapa 9 — Dashboards finais / robustez / 404               ⏳
Etapa 10 — Autenticação / autorização / auditoria          ⏳
```

---

# 20. Administração futura — Cadastros

Previstos:

```text
Produtos
Laboratórios
Projetos
Usuários
Estagiários
Tipos de unidade / embalagem
```

## Tipos de unidade / embalagem

Deve permitir:

```text
cadastrar
editar
inativar/remover da seleção
reativar
```

Exemplos:

```text
UNITÁRIO
KIT
CAIXA
GARRAFA
GALÃO
PACOTE
BOMBONA
BARRIL
```

Se já estiver usado em lote histórico, não excluir fisicamente. Remover significa inativar para novos registros.

A implementação futura deverá substituir o enum rígido `TipoEmbalagem` por catálogo persistido ou mecanismo equivalente.

## Estagiários

Interface própria prevista:

```text
/cadastros/estagiarios
/cadastros/estagiarios/:id
```

Mostrar nome, identidade corporativa, unidade read-only, laboratório, supervisor/professor, vínculo, situação, período e observações.

---

# 21. Rotas

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
/cadastros/tipos-unidade   ⏳
/:pathMatch(.*)*           ⏳
```

---

# 22. Regra central

**O usuário enxerga unidades e embalagens físicas de forma simples; o backend preserva matemática, FIFO/FEFO, forma solicitada, fracionamento e rastreabilidade por lote.**
