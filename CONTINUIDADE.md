# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Repositório frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend de referência:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 28/08/2026  
**Branch atual:** `feat/gestao-interface`  
**Fase atual:** Estoque / Lotes  
**Último bloco concluído:** Pedidos da Gestão  
**Próximo passo exato:** validar a nova contagem em unidades + filtro por embalagem no detalhe de estoque; depois ajustar os próximos pontos de Estoque um por um e só então seguir para Descarte por vencimento.

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
apresentação por lote                         🟡 implementada / validar fluxo
observação persistida no lote                 ✅
edição cadastral segura do lote               ✅
código SGL automático e imutável do lote      ✅ implementar/validar V7
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
Entrada de lote                               🟡 implementada / validar
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

Direção:

```text
clean
corporativo
administrativo/laboratorial
densidade média-compacta
sidebar escura
topbar escura
área principal clara
breadcrumbs
busca local
filtros expansíveis
tabelas funcionais
chips de status
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

## 7.1 Regra principal de quantidade — DECISÃO ATUAL

A quantidade operacional do estoque deve ser entendida pelo usuário **sempre em unidades individuais daquele produto**.

Exemplo:

```text
Produto: Extrato de DNA
1 kit = 50 unidades

4 kits disponíveis
→ saldo geral = 200 unidades

retirada de 1 kit
→ baixa de 50 unidades
→ novo saldo geral = 150 unidades
```

O saldo principal não muda de significado conforme a embalagem escolhida.

### Estoque mínimo

O estoque mínimo também é configurado e exibido em unidades.

Exemplo:

```text
mínimo = 100 unidades

se 1 kit = 50 unidades
→ equivale a 2 kits
```

A comparação de estoque baixo continua simples:

```text
quantidadeAtual < quantidadeMinima
```

sempre considerando a quantidade total em unidades.

## 7.2 Embalagem é uma forma de visualização/agrupamento

Kit, caixa, pacote, barril etc. não substituem o saldo em unidades.

São agrupamentos de unidades registrados no lote.

Exemplos:

```text
Kit
→ 50 unidades por kit

Caixa
→ 10 unidades por caixa

Pacote
→ 25 unidades por pacote
```

O usuário pode visualizar o saldo por um agrupamento específico, mas isso não altera o saldo real.

### Filtro no detalhe do estoque

Em `/estoque/:id`, o cartão `Como está armazenado` foi substituído por:

```text
Visualizar quantidade em
[ Unidades individuais ▼ ]
```

Opções são obtidas das apresentações registradas nos lotes.

Exemplo:

```text
Unidades individuais
Kits — 50 un. por embalagem
Caixas — 10 un. por embalagem
```

Com `Unidades individuais` selecionado:

```text
Quantidade disponível
200 unidades
```

Com `Kit` selecionado:

```text
Quantidade disponível
4 kits

50 unidades por kit.
Unidades avulsas e outras embalagens não entram nesta visualização.
```

### Regra importante do filtro

Ao selecionar uma embalagem específica:

```text
somar apenas lotes daquela apresentação + daquele conteúdo por embalagem
```

Exemplo:

```text
3 kits de 50
+ 20 unidades avulsas
+ 2 caixas de 10

saldo geral = 190 unidades

filtro Kit 50
→ 3 kits

filtro Caixa 10
→ 2 caixas

filtro Unidades
→ 190 unidades
```

As 20 unidades avulsas não entram no filtro Kit ou Caixa.

## 7.3 Produtos com tamanhos diferentes

Quando o próprio item físico é diferente, ele deve ser tratado como uma variante/produto de estoque diferente, e não como simples conversão de embalagem.

Exemplo aprovado:

```text
Água 1 L
Água 500 mL
Água 250 mL
```

Cada um possui sua própria quantidade em unidades.

Para `Água 1 L`:

```text
entrada: 1 caixa
conteúdo da caixa: 10 unidades

estoque Água 1 L
→ +10 unidades
```

O volume `1 L` faz parte da definição/apresentação do item físico. O estoque operacional continua respondendo:

```text
10 unidades de Água 1 L
```

Isso evita misturar:

```text
10 garrafas de 1 L
com
10 garrafas de 500 mL
```

como se fossem o mesmo saldo.

**Observação:** esse princípio deve ser refletido com cuidado na futura etapa de Produtos. Não alterar todos os modelos técnicos do backend nesta subetapa sem validação do fluxo atual.

## 7.4 Visão geral `/estoque`

A listagem principal passa a mostrar:

```text
Produto
Código
Embalagem padrão
Localização
Quantidade atual
Mínimo
Situação
```

Quantidade e mínimo aparecem sempre como:

```text
200 unidades
100 unidades
```

A coluna antiga baseada em `unidadeMedida` não deve induzir o usuário a pensar que o saldo muda entre frasco/kit/mL/etc.

A embalagem padrão continua sendo uma referência informativa do produto.

## 7.5 Não mostrar lote antigo/novo na operação

Remover da interface operacional textos como:

```text
registro antigo
entrada feita antes do novo controle
lote legado
```

Esses detalhes de migração não ajudam o usuário a controlar estoque.

Se um lote não possui dados detalhados de embalagem, mostrar apenas o que é seguro afirmar:

```text
10 unidades
```

sem classificar visualmente como antigo ou novo.

## 7.6 Entrada de lote

Endpoint:

```text
POST /api/v1/movimentacoes/estoques/{estoqueId}/lotes?usuarioId={uuid}
```

Interface atual:

```text
Lote / referência do fornecedor
Como o material chegou?
Quantos chegaram?
Quantas unidades vêm em cada um?
Pode retirar unidades separadamente?
Validade
Origem
Observação
```

Exemplo:

```text
Como chegou? Kit
Quantos chegaram? 4
Quantas unidades vêm em cada um? 50

Sistema incorpora 200 unidades ao saldo.
```

O cálculo é interno; não precisa aparecer como multiplicação para o usuário.

Outro exemplo:

```text
Produto: Água 1 L
Como chegou? Caixa
Quantos chegaram? 1
Quantas unidades vêm em cada um? 10

Saldo aumenta 10 unidades de Água 1 L.
```

## 7.7 Fracionamento

`fracionavel` passa a ser entendido na interface como:

```text
Pode retirar unidades separadamente?
```

Exemplo:

```text
Kit com 50 unidades
fracionável = false
→ só pode sair kit completo
→ saída de 1 kit = 50 unidades

Caixa com 10 garrafas
fracionável = true
→ pode sair 1, 2, 3... unidades
```

A quantidade principal continua sempre em unidades.

## 7.8 Código interno SGL do lote — decisão definitiva

Cada lote possui:

```text
codigoInterno
→ identidade interna do SGL
→ gerado automaticamente
→ imutável

numeroLote
→ lote/referência do fornecedor
→ dado externo
```

Padrão atual:

```text
LOT-<CODIGO_REFERENCIA_PRODUTO>-<SEQUENCIAL>

LOT-EXT-DNA-PL-001
LOT-EXT-DNA-PL-002
LOT-EXT-DNA-PL-003
```

O Código SGL:

```text
não é digitado na entrada
não pode ser alterado no modal
é usado para rastreabilidade/rótulo
```

Flyway relacionado:

```text
V7__add_codigo_interno_lote.sql
```

## 7.9 Modal de lote

Cada linha abre um modal com:

```text
Código SGL
Lote do fornecedor
Recebido
Disponível agora
Como chegou
Entrada
Validade
Pode retirar unidades separadamente?
Observação
```

Código SGL é somente leitura.

Campos editáveis conforme contrato atual:

```text
lote/referência do fornecedor
nome da apresentação
data de validade
fracionável
observação
```

Campos bloqueados:

```text
codigoInterno
sequencialInterno
quantidade recebida
conteúdo por embalagem
```

## 7.10 Observação do lote

Persistência:

```text
Lote.observacao
AtualizarLoteRequestDTO.observacao
LoteResponseDTO.observacao
V6__add_lote_observacao.sql
```

## 7.11 Mensagem de sucesso

Não mostrar:

```text
Entrada undefined registrada com sucesso.
```

Se `codigoInterno` ainda não vier na resposta, usar fallback:

```text
Entrada registrada com sucesso.
```

## 7.12 Saída futura / Pedidos

A saída deverá reutilizar exatamente a mesma regra de unidades.

Exemplo:

```text
Saldo geral = 200 unidades
1 kit = 50 unidades

Pedido/saída de 1 kit
→ -50 unidades
→ 150 unidades

Pedido/saída de 10 unidades
→ -10 unidades
→ 190 unidades
```

Quando o usuário escolher saída por embalagem, o sistema converte a embalagem em unidades internamente.

Não duplicar saldos separados de `kits` e `unidades`.

Existe um único saldo total em unidades e diferentes formas de consultá-lo/retirá-lo.

---

# 8. Produtos — próxima etapa após Estoque

Produto é módulo operacional de primeira classe e também existe em Cadastros.

Rotas planejadas:

```text
/produtos
/produtos/:id
```

A etapa de Produtos precisará consolidar a decisão atual de **item físico / variante**.

Exemplos que precisam ser tratados de forma clara:

```text
Água 1 L
Água 500 mL
Água 250 mL
```

Não transformar isso automaticamente em uma rede global de conversão entre litros/mL.

O item físico cadastrado deve ser claro para que a quantidade do estoque possa continuar sendo uma contagem simples de unidades.

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

O rótulo usa `codigoInterno` como identidade principal do lote.

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

A quantidade operacional exibida deve respeitar a regra unitária definida no Estoque.

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
  4.1 Visão geral do Estoque                               🟡 validar contagem em unidades
  4.2 Detalhe / Lotes                                      🟡 validar UX
  4.3 Entrada de lote                                      🟡 validar
  4.4 Filtro por embalagem                                 🟡 validar
  4.5 Modal detalhe/edição do lote                         🟡 validar
  4.6 Código SGL automático/imutável                        🟡 validar V7
  4.7 Descarte por vencimento                              ⏳ depois da validação atual
  4.8 Integração da mesma lógica nas saídas                 ⏳

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

Sequência atual:

```text
VALIDAR CONTAGEM UNITÁRIA
→ VALIDAR FILTRO POR EMBALAGEM
→ CORRIGIR PRÓXIMO PONTO DO ESTOQUE
→ DESCARTE
→ FINALIZAR ESTOQUE
→ PRODUTOS
→ MOVIMENTAÇÕES
→ RELATÓRIOS
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
1. git pull frontend feat/gestao-interface
2. abrir /estoque
3. confirmar Quantidade atual e Mínimo em unidades
4. abrir /estoque/:id
5. confirmar que Quantidade disponível inicia em unidades
6. testar seletor "Visualizar quantidade em"
7. selecionar Kit/Caixa/etc. e conferir se só aquela embalagem entra na contagem
8. confirmar que não aparece "registro antigo", "lote legado" ou equivalente
9. criar uma entrada e confirmar que não aparece "undefined" na mensagem de sucesso
10. enviar captura/resultado antes de mexer no próximo ponto
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

Frontend recente:

```text
EstoqueGestaoView
→ saldo e mínimo exibidos em unidades
→ embalagem padrão separada da quantidade

EstoqueDetalheView
→ saldo principal em unidades
→ filtro por embalagem
→ embalagem não altera saldo real
→ remove textos de lote antigo/novo
→ fallback para mensagem de entrada sem codigoInterno
→ mantém modal de lote e Código SGL imutável
```

Regra central atual:

**Existe um único saldo operacional em unidades individuais. Kit, caixa, pacote e outras embalagens são agrupamentos usados para entrada, visualização e saída; não são saldos independentes.**
