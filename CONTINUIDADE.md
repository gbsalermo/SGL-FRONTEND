# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Repositório frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend de referência:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 28/08/2026  
**Branch atual:** `feat/gestao-interface`  
**Fase atual:** Estoque / Lotes  
**Último bloco concluído:** Pedidos da Gestão  
**Próximo passo exato:** validar a nova UX do detalhe de estoque + geração automática do código SGL do lote; depois implementar Descarte por vencimento; finalizar Estoque; depois Produtos → Movimentações → Relatórios

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
unidade de controle + apresentação por lote   🟡 implementada / validar fluxo
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
Estoque — visão geral                         ✅ base aprovada
Estoque — detalhe/lotes                       🟡 nova UX para validar
Entrada de lote                               🟡 implementada / validar código automático
Modal de detalhe/edição de lote               🟡 implementado / validar
Descarte por vencimento                       ⏳ próximo
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

A autenticação de desenvolvimento não é autenticação de produção.

A futura integração corporativa deve substituir o login DEV sem exigir reconstrução das telas.

---

# 5. Pedidos do Solicitante — concluído por agora

Rotas:

```text
/meus-pedidos
/pedidos/novo
```

A forma de pedir/retirar quantidade deverá ser adaptada ao modelo de embalagem/unidade de controle quando retomarmos a integração de saída.

Nunca interpretar quantidade solicitada como quantidade de kits automaticamente.

---

# 6. Pedidos da Gestão — concluído por agora

Rota:

```text
/pedidos
```

Implementado:

```text
listagem
busca/filtros/ordenação
submenu por status
detalhe expansível
quantidade solicitada/aprovada
aprovação
rejeição/cancelamento com justificativa
entrega
urgência
risco/perecibilidade
```

Urgência operacional somente enquanto `status = PENDENTE`.

---

# 7. Unidade institucional — decisão definitiva

**Unidade institucional não terá cadastro manual na interface.**

Não criar:

```text
Cadastros → Unidades
/cadastros/unidades
```

Fluxo futuro:

```text
login corporativo
→ API corporativa devolve unidade
→ backend procura por identificador corporativo estável
→ encontrou? associa
→ não encontrou? cria e associa
```

Documento relacionado:

```text
docs/DECISAO_UNIDADES_CORPORATIVAS.md
```

---

# 8. Estoque / Lotes — ETAPA ATUAL

## 8.1 Responsabilidade

```text
Produto
→ especificação do material
→ define a unidade interna usada para consolidar saldo

Estoque Central
→ saldo/configuração do produto na unidade

Lote
→ entrada física/rastreabilidade
→ registra como o material chegou
→ recebe um código interno SGL imutável

Movimentação
→ histórico da operação física
```

Não criar produto dentro da tela de Estoque.

## 8.2 Visão geral `/estoque`

Mostra:

```text
Produtos em estoque
Estoque baixo
Zerados
Produtos com lote vencido
```

Tabela:

```text
Produto
Código
Unidade/forma de contagem
Localização
Quantidade atual
Mínimo
Situação
Detalhe
```

Não existe métrica global de quantidade consolidada entre produtos diferentes.

## 8.3 REGRA DE UX — NÃO EXPOR A MATEMÁTICA INTERNA

O backend pode trabalhar com:

```text
unidade de controle
quantidadeApresentacoes
conteudoPorApresentacao
conversão para saldo interno
```

Mas a interface operacional não deve ensinar esses conceitos nem mostrar contas como `2 × 50 = 100`.

A tela deve responder de forma simples:

```text
quanto há no estoque?
quantos kits/frascos/caixas/barris existem?
quanto há em cada embalagem?
existe material avulso ou embalagem aberta?
qual lote vence primeiro?
```

Exemplos corretos:

```text
2 kits de 50 reações
10 reações avulsas
4 frascos de 500 mL
1 barril de 20 L
1 frasco de 1 L + 250 mL em embalagem aberta
```

Evitar na interface:

```text
unidade-base
quantidade base
fator de conversão
saldo convertido
2 × 50 = 100
```

A matemática é responsabilidade do sistema.

## 8.4 Detalhe `/estoque/:id`

A tela deve mostrar:

```text
Estoque contado em
Embalagem mais comum
Localização
Avisar quando restarem

Quantidade disponível
Como está armazenado
Vencem em até 30 dias
Lotes vencidos
```

Exemplo esperado:

```text
Quantidade disponível
110 reações

Como está armazenado
2 kits de 50 reações + 10 reações avulsas
```

Tabela de lotes:

```text
Código SGL
O que foi recebido
Disponível agora
Entrada
Validade
Situação
Ver detalhes
```

O lote/referência do fornecedor aparece como informação secundária.

## 8.5 CÓDIGO INTERNO SGL DO LOTE — DECISÃO DEFINITIVA

A partir de 28/08/2026, cada lote possui dois identificadores distintos:

```text
codigoInterno
→ identidade interna do SGL
→ gerada automaticamente
→ imutável
→ usada em rastreabilidade, tela, relatórios e rótulos

numeroLote
→ referência/lote informado pelo fornecedor ou responsável
→ dado externo separado do código SGL
```

Formato atual aprovado:

```text
LOT-<CÓDIGO/SIGLA DO PRODUTO>-<SEQUÊNCIA>

LOT-EXT-DNA-PL-001
LOT-EXT-DNA-PL-002
LOT-EXT-DNA-PL-003
LOT-FOR-37-500-001
```

A sigla/código visual é derivada de `Produto.codigoReferencia`. Quando o produto não possuir código de referência, o backend utiliza fallback técnico `PRD-<id>`.

A sequência é **por produto**, não por usuário nem digitada manualmente.

Regras obrigatórias:

```text
gerado exclusivamente pelo backend
não aparece como campo de entrada
não pertence ao DTO de atualização
não possui setter público livre na entidade
coluna updatable = false
único no banco
sequência protegida por bloqueio pessimista do produto
nunca reutilizar número de lote apagado/inativado
```

A geração ocorre durante `registrarEntradaLote`.

O backend bloqueia o produto antes de consultar/incrementar o maior `sequencialInterno`, evitando dois lotes simultâneos receberem o mesmo número.

Flyway:

```text
V7__add_codigo_interno_lote.sql
```

A V7 também gera código SGL para lotes já existentes, preservando os dados históricos.

## 8.6 Modal de lote — detalhe + edição

Cada linha abre um modal.

O modal mostra:

```text
Código SGL
Lote do fornecedor
Recebido
Disponível agora
Como chegou
Entrada
Validade
Pode retirar uma parte?
Observação
```

O **Código SGL é somente leitura**.

O botão deve ser entendido como `Editar dados do lote`, não `Editar identidade do lote`.

Campos que podem ser corrigidos conforme contrato atual:

```text
lote/referência do fornecedor
nome da apresentação
data de validade
fracionável ou não
observação
```

Campos bloqueados:

```text
codigoInterno
sequencialInterno
quantidade de apresentações recebidas
conteúdo por apresentação
quantidade inicial calculada
```

Motivo: identidade, quantidade histórica e rastreabilidade não podem mudar retroativamente.

## 8.7 Observação do lote

A observação informada na entrada é persistida no próprio `Lote`, além da movimentação.

Backend:

```text
Lote.observacao
AtualizarLoteRequestDTO.observacao
LoteResponseDTO.observacao
V6__add_lote_observacao.sql
```

## 8.8 Entrada de lote — implementada

Endpoint:

```text
POST /api/v1/movimentacoes/estoques/{estoqueId}/lotes?usuarioId={uuid}
```

Contrato técnico recebido do usuário:

```text
numeroLote                  ← lote/referência do fornecedor
apresentacao
quantidade
conteudoPorApresentacao
fracionavel
dataValidade
origem
observacao
```

`codigoInterno` NÃO é recebido no request. É gerado pelo backend.

Na interface:

```text
Lote / referência do fornecedor
Como o material chegou?
Quantos chegaram?
Quanto vem em cada um?
Pode retirar apenas uma parte?
Validade
Origem
Observação
```

A própria tela informa que o código SGL será criado automaticamente.

Prévia:

```text
Você está registrando:
2 kits, com 50 reações em cada um.

O sistema fará os cálculos e criará automaticamente o código interno do lote.
```

## 8.9 REGRA ESTRUTURAL — unidade de controle, apresentação e fracionamento

Internamente o produto possui uma unidade estável usada para saldo.

Exemplos:

```text
Formaldeído → mL
Microplaca → unidade
Extrato de DNA → reação
```

Cada lote pode chegar como:

```text
kit
frasco
caixa
bombona
barril
unidade avulsa
```

Campos técnicos:

```text
apresentacao
quantidadeApresentacoes
conteudoPorApresentacao
fracionavel
quantidadeInicial
quantidadeDisponivel
```

`fracionavel = true` permite retirar parte do conteúdo. `fracionavel = false` exige embalagem completa.

### Lotes legados

A interface não inventa quantos kits/frascos existiam quando o dado antigo não possuía essa informação.

Mostrar:

```text
Entrada feita antes do novo controle de embalagens.
```

## 8.10 Saída futura / Pedidos

A saída deve seguir a mesma lógica física:

```text
retirar quantidade avulsa/medida
OU
retirar embalagem completa
```

Exemplo:

```text
Disponível:
2 kits de 50 + 10 reações avulsas

Saída:
10 reações
OU
1 kit
```

Nunca interpretar `10 reações` como `10 kits`.

## 8.11 Próximos subblocos para concluir Estoque

```text
1. atualizar/reiniciar backend e aplicar V6 + V7
2. atualizar frontend feat/gestao-interface
3. abrir /estoque/:id
4. criar um lote novo
5. verificar geração automática LOT-<produto>-001/002/003...
6. confirmar que Código SGL não pode ser alterado no modal
7. validar leitura de kits/frascos/avulsos
8. validar edição dos demais dados permitidos
9. implementar Descarte por vencimento
10. validar saldo/lotes
11. encerrar Estoque
```

Descarte real:

```text
POST /api/v1/movimentacoes/estoques/{estoqueId}/descarte-vencimento?usuarioId={uuid}
```

Não alterar saldo manualmente no frontend.

---

# 9. Produtos — PRÓXIMA ETAPA APÓS ESTOQUE

Produto é módulo operacional de primeira classe e também existe em Cadastros.

Rotas planejadas:

```text
/produtos
/produtos/:id
```

Função operacional:

```text
consultar produto/estoque
consultar forma física dos lotes
consultar mínimo/localização
consultar risco/perecibilidade
consultar última entrada
consultar lotes
editar informações permitidas
imprimir identificação/rótulo
```

Fluxo de rótulo:

```text
Produto
→ Estoque
→ Nova entrada
→ backend gera Código SGL do lote
→ Operação → Produtos
→ escolher lote
→ imprimir rótulo usando codigoInterno
```

O rótulo deve usar o `codigoInterno` como identidade principal do lote e pode mostrar o lote do fornecedor como informação secundária.

---

# 10. Código interno do lote

A antiga decisão planejada foi promovida para **decisão implementada** e está detalhada na seção 8.5.

Padrão oficial atual:

```text
LOT-<CODIGO_REFERENCIA_PRODUTO>-<SEQUENCIAL>
```

Exemplo:

```text
Produto.codigoReferencia = EXT-DNA-PL

1ª entrada → LOT-EXT-DNA-PL-001
2ª entrada → LOT-EXT-DNA-PL-002
3ª entrada → LOT-EXT-DNA-PL-003
```

Não adicionar ano ao código neste momento. A sequência não reinicia a cada ano; isso evita reutilização de identidade e simplifica rastreabilidade.

---

# 11. Movimentações

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

# 12. Relatórios

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

Código SGL deve ser a referência estável para relatórios de lote.

---

# 13. Administração / Cadastros

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

# 14. Roadmap oficial atualizado

```text
Etapa 0 — Handoff backend → frontend                       ✅
Etapa 1 — Fundação visual/técnica                          ✅
Etapa 2 — Bootstrap técnico                                ✅

Etapa 3 — Interfaces iniciais                              ✅
  3.1 Login                                                ✅
  3.2 Pedidos do Solicitante                               ✅
  3.3 Shell Gestão/Admin + Pedidos da Gestão               ✅

Etapa 4 — Operação de estoque                              🟡 ATUAL
  4.1 Visão geral do Estoque                               ✅
  4.2 Detalhe / Lotes                                      🟡 validar UX
  4.3 Entrada de lote                                      🟡 validar
  4.4 Modal detalhe/edição do lote                         🟡 validar
  4.5 Código SGL automático/imutável                        🟡 validar V7
  4.6 Descarte por vencimento                              ⏳ PRÓXIMO
  4.7 Integração da mesma lógica nas saídas                 ⏳

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
VALIDAR UX + CÓDIGO SGL DOS LOTES
→ DESCARTE
→ FINALIZAR ESTOQUE
→ PRODUTOS
→ MOVIMENTAÇÕES
→ RELATÓRIOS
```

---

# 15. Rotas

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

# 16. Documentos importantes

```text
CONTINUIDADE.md
→ fonte principal

docs/ROADMAP_INTERFACE_GESTAO.md
→ sequência da Gestão

docs/DECISAO_UNIDADES_CORPORATIVAS.md
→ integração futura de Unidade
```

---

# 17. PRÓXIMO PASSO EXATO

Executar:

```text
1. git pull backend main
2. reiniciar backend e confirmar Flyway V6 + V7
3. git pull frontend feat/gestao-interface
4. abrir /estoque/:id
5. criar duas entradas do mesmo produto
6. confirmar códigos sequenciais, ex. LOT-EXT-DNA-PL-005 e 006
7. abrir modal
8. confirmar Código SGL somente leitura
9. validar lote do fornecedor + apresentação + observação
10. somente depois implementar Descarte por vencimento
```

---

# 18. Estado das branches e alterações recentes

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
Lote.codigoInterno            → imutável/único
Lote.sequencialInterno        → sequência por produto
ProdutoRepository             → bloqueio pessimista para geração
LoteRepository                → maior sequência por produto
MovimentacaoEstoqueService    → gera LOT-<produto>-<sequência>
LoteResponseDTO               → expõe codigoInterno
V6                            → observação do lote
V7                            → código interno + sequência + backfill
```

Frontend recente:

```text
EstoqueDetalheView
→ linguagem simples de estoque físico
→ Código SGL como identidade principal
→ lote do fornecedor como referência secundária
→ código interno nunca editável
→ modal de detalhe/edição segura
```

Regra central:

**O sistema faz contas e gera identidades internamente; o usuário enxerga materiais físicos de forma simples e um Código SGL estável para rastreabilidade.**
