# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Repositório frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend de referência:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 28/08/2026  
**Branch atual:** `feat/gestao-interface`  
**Fase atual:** Estoque / Lotes  
**Último bloco concluído:** Pedidos da Gestão  
**Próximo passo exato:** validar a nova leitura de Unidade + Disponível em `unit.` e a entrada com tipo de embalagem + especificação + multiplicador; depois continuar os ajustes de Estoque um por vez.

Este arquivo é a fonte principal de retomada do frontend.

---

# 0. Como continuar

Ao abrir uma nova sessão:

```text
1. ler este CONTINUIDADE.md
2. ler docs/ROADMAP_INTERFACE_GESTAO.md
3. conferir README.md para visão geral
4. usar Swagger/OpenAPI e o backend como fonte de verdade
5. não duplicar regras de negócio no frontend
6. continuar exatamente do bloco PRÓXIMO PASSO EXATO
```

Fluxo aprovado:

```text
entender domínio
→ conferir contrato real
→ implementar
→ validar visualmente
→ refinar
→ concluir etapa
→ seguir para a próxima
```

Não avançar de etapa sem validar a anterior.

---

# 1. Stack e arquitetura

```text
Vue 3
Vite
TypeScript 5.9
Vue Router
Pinia
Axios
Vuetify 3
```

Regras:

- não espalhar Axios pelas Views;
- não recriar no frontend regras já existentes no backend;
- usar UUID público nas fronteiras;
- Admin reutiliza a Gestão e acrescenta responsabilidades administrativas;
- não criar persistência fictícia para campos que a API ainda não suporta;
- complexidade de domínio pode existir internamente sem ser exposta como linguagem técnica ao usuário;
- identificadores internos do sistema são gerados pelo backend e não podem ser editados pela interface.

---

# 2. Estado geral

## Backend

```text
API REST                                      ✅
Swagger / OpenAPI                             ✅
PostgreSQL                                    ✅
Flyway                                        ✅
UUID público                                  ✅
testes principais                             ✅
CORS local                                    ✅
observação persistida no lote                 ✅
código SGL automático e imutável do lote      ✅
tipo de embalagem do lote                     ✅ V8 implementada / validar
especificação de embalagem                    ✅
multiplicador por embalagem                   ✅
edição cadastral segura do lote               ✅
autenticação definitiva                       ⏳ futura
auditoria                                     ⏳ futura
integração corporativa                        ⏳ futura
```

## Frontend

```text
Login                                         ✅
Pedidos do Solicitante                        ✅
Shell Gestão/Admin                            ✅
Pedidos da Gestão                             ✅
Estoque — visão geral                         🟡 ajustado para unidades / validar
Estoque — detalhe/lotes                       🟡 nova UX para validar
Entrada de lote                               🟡 tipo + especificação + multiplicador
Filtro de visualização por embalagem          🟡 implementado / validar
Modal de detalhe/edição de lote               🟡 implementado / validar
Descarte por vencimento                       ⏳ depois da validação atual
Produtos operacional + rótulos                ⏳ próximo após Estoque
Movimentações                                 ⏳
Relatórios                                    ⏳
Administração / Cadastros                     ⏳
Interface individual de Estagiários           ⏳ obrigatória na Administração
Dashboard final / robustez / 404              ⏳
Autenticação/autorização/auditoria            ⏳
```

---

# 3. Identidade visual aprovada

```text
#1A4DA1  azul principal
#0D2B5E  azul escuro
#2D6BC4  azul claro
#007A3D  verde institucional
#4EA674  verde claro
#A5D6A7  verde suave
#F5F7FA  fundo
#FFFFFF  superfície
#1A1A2E  texto principal
#64748B  texto secundário
#E2E8F0  borda
```

---

# 4. Login — concluído

Login visual aprovado e sessão DEV funcionando.

A futura integração corporativa deve substituir o login DEV sem exigir reconstrução das telas.

---

# 5. Pedidos — concluído por agora

Rotas do solicitante:

```text
/meus-pedidos
/pedidos/novo
```

Rota da gestão:

```text
/pedidos
```

A forma de pedir/retirar quantidade ainda deverá ser adaptada ao modelo definitivo de **unidades + embalagem**.

Regra já definida:

```text
se pedir 1 kit de 50
→ o estoque perde 50 unidades

se pedir 10 unidades
→ o estoque perde 10 unidades

nunca interpretar 10 unidades como 10 kits
```

---

# 6. Unidade institucional — decisão definitiva

**Unidade institucional não terá cadastro manual na interface.**

Não criar:

```text
Cadastros → Unidades
/cadastros/unidades
```

Documento relacionado:

```text
docs/DECISAO_UNIDADES_CORPORATIVAS.md
```

---

# 7. Estoque / Lotes — ETAPA ATUAL

## 7.1 Regra principal de quantidade

O saldo operacional do estoque é sempre convertido para **unidades individuais daquele produto**.

Exemplo:

```text
Produto: Extrato de DNA
1 kit = 50 unidades

4 kits
→ saldo = 200 unidades

saída de 1 kit
→ baixa = 50 unidades
→ saldo = 150 unidades
```

O estoque mínimo também usa esse mesmo saldo:

```text
mínimo = 100 unidades
1 kit = 50
→ mínimo equivalente a 2 kits
```

Não existem saldos independentes de kit e unidade.

---

## 7.2 Tipo de unidade/embalagem — DECISÃO ATUAL

O lote passa a separar duas informações que antes estavam misturadas.

### Tipo de unidade

Campo controlado/preselecionado:

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

Esse tipo é usado para:

```text
organização visual
filtro por embalagem
entrada
futura saída por embalagem
```

### Especificação da embalagem

`Lote.apresentacao` passa a representar a descrição livre da embalagem.

Exemplos:

```text
kit com 50 unidades
garrafa de 1 L
unidade de 10 kg
caixa com 10 garrafas de 1 L
galão de 20 L
```

Na interface o campo se chama:

```text
Especificar embalagem
```

Tipo e especificação não são a mesma coisa.

Exemplo:

```text
tipo = KIT
especificação = kit com 50 unidades
```

---

## 7.3 Multiplicador de unidades

O campo técnico existente `conteudoPorApresentacao` continua sendo usado, mas na interface passa a ser chamado de:

```text
Multiplicador de unidades
```

Objetivo:

```text
quantas unidades individuais uma embalagem representa no saldo
```

Exemplos:

```text
UNITARIO
multiplicador = 1

KIT com 50 unidades
multiplicador = 50

CAIXA com 10 garrafas do produto Água 1 L
multiplicador = 10
```

O backend continua calculando internamente:

```text
quantidade recebida × multiplicador
```

A interface não precisa expor a multiplicação como regra matemática.

---

## 7.4 Produtos com tamanho/volume diferente

O tamanho físico do produto continua fazendo parte da identidade do item quando ele muda o que está sendo estocado.

Exemplo:

```text
Água 1 L
Água 500 mL
Água 250 mL
```

São itens distintos no estoque.

Para `Água 1 L`:

```text
entrada = 1 CAIXA
especificação = caixa com 10 garrafas de 1 L
multiplicador = 10

saldo do produto Água 1 L
→ +10 unidades
```

Não somar garrafas de 1 L com garrafas de 500 mL como se fossem o mesmo produto.

---

## 7.5 Detalhe `/estoque/:id`

Topo:

```text
Contagem padrão            Unidades individuais
Embalagem mais comum       referência do produto
Localização
Avisar quando restarem     N unit.
```

Quantidade principal:

```text
Quantidade disponível
200 unit.
```

### Filtro por embalagem

```text
Visualizar por embalagem
[ Unidades individuais ▼ ]
```

Exemplos de opções:

```text
Unidades individuais
kits — 50 unit. por embalagem
caixas — 10 unit. por embalagem
```

Se selecionar Kit 50:

```text
4 kits
50 unit. por kit
```

Somar somente lotes com:

```text
mesmo tipoEmbalagem
+ mesmo multiplicador
```

Unidades de outros tipos não entram nessa visão específica.

---

## 7.6 Tabela de lotes

Colunas atuais:

```text
Código SGL
Unidade
Disponível agora
Entrada
Validade
Situação
Ver detalhes
```

### Coluna Unidade

Informação principal:

```text
1 kit
4 caixas
10 unit.
```

Texto secundário:

```text
kit com 50 unidades
caixa com 10 garrafas de 1 L
unidade de 10 kg
```

### Disponível agora

Mostrar apenas:

```text
50 unit.
10 unit.
200 unit.
```

Não decompor essa coluna em kit + avulso.

O detalhamento físico pertence à coluna Unidade, filtro e modal.

---

## 7.7 Não mostrar lote antigo/novo

Removidos da interface operacional:

```text
registro antigo
lote legado
entrada feita antes do novo controle
```

Migração é detalhe técnico e não deve aparecer para quem está usando o estoque.

---

## 7.8 Entrada de lote

Endpoint:

```text
POST /api/v1/movimentacoes/estoques/{estoqueId}/lotes?usuarioId={uuid}
```

Interface:

```text
Lote / referência do fornecedor
Tipo de unidade
Especificar embalagem
Quantos chegaram?
Multiplicador de unidades
Pode retirar unidades separadamente?
Validade
Origem
Observação
```

Exemplo:

```text
Tipo de unidade: KIT
Especificar embalagem: kit com 50 unidades
Quantos chegaram: 4
Multiplicador: 50

saldo incorporado internamente = 200 unidades
```

Outro exemplo:

```text
Produto: Água 1 L
Tipo: CAIXA
Especificação: caixa com 10 garrafas de 1 L
Quantidade: 1
Multiplicador: 10

saldo do produto aumenta 10 unidades
```

---

## 7.9 Fracionamento

Interface:

```text
Pode retirar unidades separadamente?
```

Exemplo:

```text
KIT com 50
fracionável = false
→ saída deve respeitar 50 unidades por kit

CAIXA com 10
fracionável = true
→ pode sair 1 unidade individual sem retirar a caixa inteira
```

O multiplicador continua sendo usado para validar uma embalagem não fracionável.

---

## 7.10 Código interno SGL do lote

Cada lote possui:

```text
codigoInterno
→ gerado automaticamente
→ imutável

numeroLote
→ referência externa do fornecedor
```

Padrão:

```text
LOT-<CODIGO_REFERENCIA_PRODUTO>-<SEQUENCIAL>
```

Exemplo:

```text
LOT-EXT-DNA-PL-001
LOT-EXT-DNA-PL-002
```

Flyway:

```text
V7__add_codigo_interno_lote.sql
```

---

## 7.11 Modal de lote

Mostrar:

```text
Código SGL
Lote do fornecedor
Tipo de unidade
Especificação da embalagem
Multiplicador
Quantidade recebida
Disponível agora em unit.
Entrada
Validade
Pode retirar unidades separadamente?
Observação
```

Código SGL, quantidade recebida e multiplicador ficam bloqueados após a entrada para preservar rastreabilidade.

Tipo de unidade, especificação, validade, referência do fornecedor, fracionamento e observação podem ser corrigidos conforme contrato atual.

---

## 7.12 Saída futura / Pedidos

A saída deve reutilizar a mesma estrutura.

```text
saldo = 200 unit.
KIT = multiplicador 50

saída de 1 KIT
→ -50 unit.
→ saldo 150 unit.

saída de 10 unit.
→ -10 unit.
```

Se a embalagem não for fracionável, a saída deve respeitar múltiplos completos do multiplicador.

---

# 8. Produtos — próxima etapa após Estoque

Produto é módulo operacional de primeira classe e também existe em Cadastros.

Rotas planejadas:

```text
/produtos
/produtos/:id
```

A etapa de Produtos deverá consolidar a diferença entre:

```text
produto físico
embalagem do lote
```

Exemplo:

```text
Água 1 L      → produto
CAIXA         → tipo de embalagem do lote
caixa com 10 garrafas de 1 L → especificação
10            → multiplicador
```

Também continuam previstos:

```text
risco
perecibilidade
localização
condições de armazenamento
última entrada
lotes
identificação/rótulo
```

---

# 9. Movimentações

Rota futura:

```text
/movimentacoes
```

Foco:

```text
histórico
rastreabilidade
produto
Código SGL do lote
laboratório
usuário
pedido
tipo
período
```

---

# 10. Relatórios

Rota futura:

```text
/relatorios
```

Categorias:

```text
Estoque
Lotes / validade
Movimentações
Pedidos
Consumo
Fiscalização / auditoria
```

---

# 11. Administração / Cadastros

Previstos:

```text
Produtos
Laboratórios
Projetos
Usuários
Estagiários
```

Unidade institucional não entra em Cadastros.

Estagiários terá interface própria:

```text
/cadastros/estagiarios
/cadastros/estagiarios/:id
```

---

# 12. Roadmap oficial atualizado

```text
Etapa 0 — Handoff backend → frontend                       ✅
Etapa 1 — Fundação visual/técnica                          ✅
Etapa 2 — Bootstrap técnico                                ✅

Etapa 3 — Interfaces iniciais                              ✅
  3.1 Login                                                ✅
  3.2 Pedidos do Solicitante                               ✅
  3.3 Shell Gestão/Admin + Pedidos da Gestão               ✅

Etapa 4 — Operação de estoque                              🟡 ATUAL
  4.1 Visão geral do Estoque                               🟡 validar contagem unitária
  4.2 Detalhe / Lotes                                      🟡 validar UX
  4.3 Entrada de lote                                      🟡 validar tipo/especificação/multiplicador
  4.4 Filtro por embalagem                                 🟡 validar
  4.5 Modal detalhe/edição do lote                         🟡 validar
  4.6 Código SGL automático/imutável                        🟡 validar
  4.7 Tipo de embalagem / Flyway V8                        🟡 validar
  4.8 Descarte por vencimento                              ⏳ depois da validação atual
  4.9 Integração da mesma lógica nas saídas                 ⏳

Etapa 5 — Produtos operacional + Rotulagem                 ⏳
Etapa 6 — Movimentações                                    ⏳
Etapa 7 — Relatórios / Documentos / Fiscalização           ⏳
Etapa 8 — Administração / Cadastros                        ⏳
  8.1 Produtos                                             ⏳
  8.2 Laboratórios                                         ⏳
  8.3 Projetos                                             ⏳
  8.4 Usuários                                             ⏳
  8.5 Estagiários — listagem + ficha individual            ⏳ OBRIGATÓRIO
Etapa 9 — Dashboards finais / robustez / 404               ⏳
Etapa 10 — Autenticação / autorização / auditoria          ⏳
```

---

# 13. Rotas

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
/:pathMatch(.*)*           ⏳ 404 futura
```

---

# 14. Documentos importantes

```text
CONTINUIDADE.md
→ fonte principal

docs/ROADMAP_INTERFACE_GESTAO.md
→ sequência da Gestão

docs/DECISAO_UNIDADES_CORPORATIVAS.md
→ integração futura de Unidade
```

---

# 15. PRÓXIMO PASSO EXATO

Estamos corrigindo Estoque **um ponto por vez**.

Validar agora:

```text
1. git pull backend main
2. reiniciar backend e confirmar Flyway V8
3. git pull frontend feat/gestao-interface
4. abrir /estoque/:id
5. confirmar coluna UNIDADE
6. confirmar texto secundário com especificação da embalagem
7. confirmar DISPONÍVEL AGORA apenas como "N unit."
8. criar entrada escolhendo UNITARIO/KIT/CAIXA/GARRAFA/GALAO
9. preencher Especificar embalagem
10. testar Multiplicador de unidades
11. testar filtro por embalagem
12. enviar captura/resultado antes do próximo ajuste
```

Não avançar para Descarte antes dessa validação.

---

# 16. Estado das branches e alterações recentes

Frontend:

```text
feat/gestao-interface
```

Backend:

```text
main
```

Backend recente:

```text
TipoEmbalagem
→ UNITARIO / KIT / CAIXA / GARRAFA / GALAO

Lote.tipoEmbalagem
→ categoria controlada da embalagem

Lote.apresentacao
→ especificação livre

conteudoPorApresentacao
→ multiplicador de unidades

V8__add_tipo_embalagem_lote.sql
→ adiciona tipo_embalagem e classifica registros existentes quando possível
```

Frontend recente:

```text
Tabela de lotes
→ O que foi recebido virou UNIDADE
→ tipo/quantidade em destaque
→ especificação em texto menor
→ Disponível agora = N unit.

Entrada de lote
→ Tipo de unidade preselecionado
→ Especificar embalagem
→ Multiplicador de unidades
→ fracionamento preservado
```

Regra central atual:

**Existe um único saldo operacional em unidades individuais. O tipo de embalagem organiza como essas unidades chegaram e o multiplicador informa quantas unidades uma embalagem representa.**
