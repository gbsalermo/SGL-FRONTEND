# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Repositório frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend de referência:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 28/08/2026  
**Branch atual:** `feat/gestao-interface`  
**Fase atual:** Estoque / Lotes  
**Último bloco concluído:** Pedidos da Gestão  
**Próximo passo exato:** validar a nova leitura simplificada do detalhe de estoque + modal de lote; depois implementar Descarte por vencimento; finalizar Estoque; depois Produtos → Movimentações → Relatórios

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
- complexidade de domínio pode existir internamente sem ser exposta como linguagem técnica ao usuário.

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
Entrada de lote                               🟡 implementada / nova linguagem para validar
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

Fluxo:

```text
usuário
→ cria pedido
→ projeto opcional
→ múltiplos produtos
→ quantidade
→ urgência informativa
→ observação
→ PENDENTE
→ acompanha em Meus pedidos
```

A forma de pedir/retirar quantidade ainda deverá ser adaptada ao modelo de embalagem/unidade de controle quando retomarmos a integração de saída. Nunca interpretar quantidade solicitada como quantidade de kits automaticamente.

---

# 6. Pedidos da Gestão — concluído por agora

Rota:

```text
/pedidos
```

Implementado:

```text
listagem de todos os pedidos
busca
filtros expansíveis
status
urgência
laboratório
período
ordenação
submenu lateral por status
detalhe expansível
quantidade solicitada
quantidade a aprovar
aprovação
rejeição com justificativa
cancelamento com justificativa
entrega
informações de risco/perecibilidade do produto
```

Urgência operacional somente enquanto `status = PENDENTE`.

Admin/Gestor podem criar pedidos pela seção `SOLICITAÇÕES`, sem sair do shell da Gestão.

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
→ API corporativa devolve JSON da pessoa
→ JSON contém unidade institucional
→ backend procura por identificador corporativo estável
→ encontrou? associa usuário
→ não encontrou? cria e associa
```

A operação deve ser idempotente e protegida contra duplicidade/concorrência.

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

Esta é uma decisão obrigatória a partir de 28/08/2026.

O backend pode trabalhar com:

```text
unidade-base/unidade de controle
quantidadeApresentacoes
conteudoPorApresentacao
conversão para saldo interno
```

Mas a interface operacional **não deve ensinar esses conceitos ao usuário nem mostrar contas como `2 × 50 = 100`**.

Objetivo da interface:

```text
qualquer pessoa deve conseguir olhar a tela e responder:

- quanto há no estoque?
- quantos kits/frascos/caixas/barris existem?
- quanto há em cada embalagem?
- existe material avulso ou embalagem aberta?
- qual lote vence primeiro?
```

Exemplos de texto correto:

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

A matemática continua sendo responsabilidade do backend/sistema.

## 8.4 Detalhe `/estoque/:id` — NOVA LEITURA

A tela foi simplificada para mostrar:

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

A tabela de lotes passa a priorizar linguagem física:

```text
Lote
O que foi recebido
Disponível agora
Entrada
Validade
Situação
Ver detalhes
```

Não mostrar `Inicial 100 unidade-base` como informação principal da tabela.

## 8.5 Modal de lote — detalhe + edição

Cada linha da tabela abre um modal próprio.

O modal deve mostrar claramente:

```text
código do lote
como chegou
quantidade recebida em linguagem natural
disponível agora em linguagem natural
data de entrada
validade
se pode retirar apenas uma parte
observação
situação
```

Exemplo:

```text
Recebido
2 kits de 50 reações

Disponível agora
1 kit de 50 reações + 10 reações avulsas
```

O mesmo modal é o ponto de edição cadastral do lote.

Campos editáveis:

```text
código do lote
nome/descrição da apresentação
data de validade
fracionável ou não
observação
```

Campos bloqueados após a entrada:

```text
quantidade de apresentações recebidas
conteúdo por apresentação
quantidade inicial calculada
```

Motivo: alterar esses valores retroativamente muda o significado do saldo e quebra rastreabilidade.

O backend deve rejeitar marcar como não fracionável um lote que já esteja com saldo parcial incompatível com sua embalagem.

## 8.6 Observação do lote

A observação informada na entrada passa a ser persistida no próprio `Lote`, além de continuar registrada na movimentação de entrada.

Backend:

```text
Lote.observacao
AtualizarLoteRequestDTO.observacao
LoteResponseDTO.observacao
Flyway V6__add_lote_observacao.sql
```

Isso permite consultar e editar a observação diretamente no modal do lote sem depender de reconstruir a informação pelo histórico de movimentações.

## 8.7 Entrada de lote — implementada

Endpoint:

```text
POST /api/v1/movimentacoes/estoques/{estoqueId}/lotes?usuarioId={uuid}
```

Contrato técnico:

```text
numeroLote
apresentacao
quantidade
conteudoPorApresentacao
fracionavel
dataValidade
origem
observacao
```

Na interface, esses campos devem ser apresentados em linguagem simples:

```text
Código do lote
Como o material chegou?
Quantos chegaram?
Quanto vem em cada um?
Pode retirar apenas uma parte?
Validade
Origem
Observação
```

Prévia correta:

```text
Você está registrando:
2 kits, com 50 reações em cada um.

O sistema fará os cálculos de estoque automaticamente.
```

Não mostrar multiplicação/conversão.

## 8.8 REGRA ESTRUTURAL — unidade de controle, apresentação e fracionamento

Internamente o produto possui uma unidade estável usada como denominador comum do saldo.

Exemplos:

```text
Formaldeído → mL
Microplaca → unidade
Extrato de DNA → reação
```

Cada lote pode chegar em uma forma física diferente:

```text
kit
frasco
caixa
bombona
barril
unidade avulsa
```

Campos técnicos do lote:

```text
apresentacao
quantidadeApresentacoes
conteudoPorApresentacao
fracionavel
quantidadeInicial
quantidadeDisponivel
```

Exemplos internos:

```text
2 kits × 50 = 100 reações
4 frascos × 500 = 2000 mL
1 bombona × 5000 = 5000 mL
```

Essas contas não precisam aparecer ao usuário.

### Fracionamento

```text
fracionavel = true
→ embalagem pode ser aberta e parte do conteúdo pode sair

fracionavel = false
→ saída deve respeitar embalagem completa
```

Exemplo:

```text
kit de 50 não fracionável
→ não pode sair apenas 10
→ pode sair 1 kit = 50
```

### Lotes legados

Lotes existentes antes desse modelo são preservados como registros antigos.

A interface deve informar claramente:

```text
Entrada feita antes do novo controle de embalagens.
```

Não inventar quantos kits/frascos existiam em um lote antigo se essa informação nunca foi persistida.

## 8.9 Saída futura / Pedidos

A saída deve seguir a mesma lógica física.

O usuário poderá escolher conforme disponibilidade/regra:

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

**Nunca interpretar `10 reações` como `10 kits`.**

A escolha deve ser simples para o usuário; a conversão fica no sistema.

## 8.10 Próximos subblocos para concluir Estoque

```text
1. atualizar/reiniciar backend para aplicar Flyway V6
2. validar nova leitura de /estoque/:id
3. criar um lote novo e conferir textos de embalagem/quantidade
4. abrir modal do lote e validar consulta
5. editar código/validade/apresentação/fracionamento/observação
6. implementar Descarte por vencimento
7. validar atualização de saldo/lotes
8. encerrar Estoque
```

Descarte real:

```text
POST /api/v1/movimentacoes/estoques/{estoqueId}/descarte-vencimento?usuarioId={uuid}
```

Não baixar ou alterar saldo manualmente no frontend.

---

# 9. Produtos — PRÓXIMA ETAPA APÓS ESTOQUE

Produto é módulo operacional de primeira classe e também existe em Cadastros para responsabilidades administrativas.

## 9.1 Operação → Produtos

Rotas planejadas:

```text
/produtos
/produtos/:id
```

Função:

```text
consultar produto
consultar estoque
consultar forma física dos lotes
consultar mínimo
consultar localização
consultar risco/perecibilidade
consultar última entrada
consultar lotes
editar informações permitidas
imprimir identificação/rótulo
```

A tela operacional não deve virar um segundo CRUD completo.

## 9.2 Administração → Cadastros → Produtos

```text
criar produto
inativar/excluir conforme regra
editar informações estruturais
manter catálogo
```

Cadastros previstos:

```text
Produtos
Laboratórios
Projetos
Usuários
Estagiários
```

Unidade institucional não entra em Cadastros.

## 9.3 Produto → lote → rótulo

```text
Produto existe
→ Estoque
→ Nova entrada de lote
→ registra forma física
→ backend calcula saldo
→ Operação → Produtos
→ abre produto
→ escolhe lote
→ imprime rótulo
```

O rótulo deve representar a forma física real do lote.

Exemplos:

```text
Kit com 50 reações
Frasco de 500 mL
10 unidades avulsas
```

A última entrada deve ser pré-selecionada por padrão para impressão, podendo o usuário escolher outro lote ativo.

---

# 10. Código interno do lote — decisão planejada

O backend possui `numeroLote`, informado pelo fornecedor/responsável.

Será criado futuramente outro identificador interno do SGL.

Formato-base:

```text
L<sequência>-<abreviação do produto>-<ano>

L01-EXTDNA-26
L02-EXTDNA-26
L01-FORM37-26
```

Regras:

```text
gerado pelo backend
não digitado livremente
imutável
único no escopo definido
separado de numeroLote
usado para rastreabilidade/rótulo
```

Não gerar apenas no frontend.

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
laboratório
usuário
pedido
tipo
período
```

A tela deve priorizar linguagem compreensível; detalhes técnicos de conversão ficam no backend/auditoria quando necessário.

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

**Estagiários terá interface própria.**

Rotas planejadas:

```text
/cadastros/estagiarios
/cadastros/estagiarios/:id
```

Ficha individual:

```text
nome
email
perfil
ativo/inativo
unidade
laboratório
data de início
data de fim
tipo de bolsa
observação
```

`Encerrar estágio` é ação de domínio própria, não sinônimo de excluir usuário.

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
  4.2 Detalhe / Lotes                                      🟡 nova UX para validar
  4.3 Entrada de lote                                      🟡 implementada
  4.4 Modal detalhe/edição do lote                         🟡 implementado
  4.5 Descarte por vencimento                              ⏳ PRÓXIMO
  4.6 Integração da mesma lógica nas saídas                 ⏳

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
VALIDAR NOVA UX DE ESTOQUE/LOTE
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

Não criar `/cadastros/unidades`.

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

Estamos em:

```text
ETAPA 4 — ESTOQUE / LOTES
```

Executar:

```text
1. git pull/reiniciar backend main
2. confirmar aplicação do Flyway V6
3. git pull frontend feat/gestao-interface
4. abrir /estoque/:id
5. validar se a tela responde claramente "quanto tenho e como está armazenado"
6. criar lote novo NÃO legado
7. abrir o modal do lote
8. testar edição segura + observação
9. validar visualmente
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
Lote
→ apresentacao
→ quantidadeApresentacoes
→ conteudoPorApresentacao
→ fracionavel
→ observacao

LoteResponseDTO
→ devolve observacao e características físicas

AtualizarLoteRequestDTO
→ permite edição cadastral segura

Flyway V5
→ apresentação/fracionamento

Flyway V6
→ observação do lote
```

Frontend recente:

```text
EstoqueDetalheView
→ remove linguagem técnica de unidade-base
→ mostra quantidade em linguagem natural
→ mostra kits/frascos/avulsos
→ entrada sem exibir conta de conversão
→ lote clicável
→ modal de detalhe
→ edição segura no mesmo modal
```

Regra central:

**O sistema pode fazer contas complexas internamente; o usuário deve enxergar estoque físico em linguagem simples.**
