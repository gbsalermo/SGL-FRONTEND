# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Repositório frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend de referência:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 27/08/2026  
**Branch atual:** `feat/gestao-interface`  
**Fase atual:** Estoque / Lotes  
**Último bloco concluído:** Pedidos da Gestão  
**Próximo passo exato:** validar entrada com unidade-base/apresentação; depois implementar Descarte por vencimento; finalizar Estoque; depois Produtos → Movimentações → Relatórios

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

Fluxo de implementação aprovado:

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

Arquitetura:

```text
SPA
+ Feature-based Architecture
+ componentes por responsabilidade
+ services para comunicação HTTP
+ stores apenas para estado compartilhado
```

Regras:

- não espalhar Axios pelas Views;
- não recriar no frontend regras já existentes no backend;
- usar UUID público nas fronteiras;
- Admin reutiliza a Gestão e acrescenta responsabilidades administrativas;
- não criar persistência fictícia para campos que a API ainda não suporta.

---

# 2. Estado geral

## Backend

```text
API REST                                  ✅
Swagger / OpenAPI                         ✅
PostgreSQL                                ✅
Flyway                                    ✅
UUID público                              ✅
testes principais                         ✅
CORS local                                ✅
unidade-base + apresentação por lote      🟡 implementação atual
autenticação definitiva                   ⏳ futura
auditoria                                 ⏳ futura
integração corporativa                    ⏳ futura
```

## Frontend

```text
Login                                     ✅
Pedidos do Solicitante                    ✅
Shell Gestão/Admin                        ✅
Pedidos da Gestão                         ✅
Estoque — visão geral                     ✅ base aprovada
Estoque — detalhe/lotes                   🟡 em validação
Entrada de lote                           🟡 implementada; validar modelo novo
Descarte por vencimento                   ⏳ próximo
Produtos operacional + rótulos            ⏳ próximo após Estoque
Movimentações                             ⏳
Relatórios                                ⏳
Administração / Cadastros                 ⏳
Interface individual de Estagiários       ⏳ obrigatória na Administração
Dashboard final / robustez / 404          ⏳
Autenticação/autorização/auditoria        ⏳
```

---

# 3. Identidade visual aprovada

Referência: Publica / Embrapa.

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

# 5. Pedidos do Solicitante — concluído

Rotas atuais:

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

Detalhes são expansíveis na própria tabela.

A quantidade dos pedidos ainda deve ser revista na etapa de integração com o novo modelo de unidade-base/apresentação. A regra definitiva está na seção 8.6.

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

Regra de urgência visual/operacional:

```text
urgência ativa somente enquanto status = PENDENTE
```

Depois de aprovado, entregue, rejeitado ou cancelado, o pedido deixa de aparecer como urgente na fila operacional.

Admin/Gestor podem criar pedidos pela seção `SOLICITAÇÕES`, sem sair do shell da Gestão.

---

# 7. Unidade — decisão definitiva

**Unidade não terá cadastro manual na interface.**

Não criar:

```text
Cadastros → Unidades
/cadastros/unidades
```

Fluxo futuro:

```text
login corporativo
→ API corporativa devolve JSON da pessoa
→ JSON contém a unidade institucional
→ backend procura unidade por identificador corporativo estável
→ encontrou? associa usuário
→ não encontrou? cria unidade e associa usuário
```

A operação deve ser idempotente e protegida contra duplicidade/concorrência.

O modo DEV e CRUD técnico atual do backend permanecem disponíveis enquanto a autenticação corporativa não for implementada.

Documento relacionado:

```text
docs/DECISAO_UNIDADES_CORPORATIVAS.md
```

---

# 8. Estoque / Lotes — ETAPA ATUAL

## 8.1 Responsabilidade

Estoque representa a situação física de um produto dentro da unidade.

Separação:

```text
Produto
→ especificação do material
→ define a unidade-base de controle

Estoque Central
→ saldo/configuração do produto na unidade
→ saldo sempre expresso na unidade-base

Lote
→ entrada física/rastreabilidade
→ registra como o material chegou fisicamente

Movimentação
→ histórico da operação física
→ quantidades registradas na unidade-base
```

Não criar produto dentro da tela de Estoque.

## 8.2 Visão geral `/estoque`

A visão atual mostra:

```text
Produtos em estoque
Estoque baixo
Zerados
Produtos com lote vencido
```

`Quantidade consolidada` foi removida como métrica global, pois somar produtos diferentes não tem significado operacional.

`Produtos com lote vencido` conta produtos distintos que possuem ao menos um lote ativo vencido na unidade.

Tabela atual:

```text
Produto
Código do produto
Unidade
Localização
Quantidade atual
Mínimo
Situação
Detalhe
```

A quantidade atual de cada produto passa a ser interpretada sempre na **unidade-base de controle do próprio produto**.

## 8.3 Detalhe `/estoque/:id`

Deve reunir:

```text
produto
código de referência
unidade-base
apresentação padrão
localização
estoque mínimo
saldo atual
disponível nos lotes
lotes próximos do vencimento
lotes vencidos
lista de lotes
```

A lista de lotes diferencia:

```text
VÁLIDO
PRÓXIMO DO VENCIMENTO
VENCIDO
```

O campo `numeroLote` aparece como `Código do lote` na interface atual. O futuro identificador interno SGL continua sendo uma decisão separada descrita na seção 10.

## 8.4 Navegação do shell

```text
seção principal, ex. /estoque
→ não mostra seta de voltar no topbar

página aninhada, ex. /estoque/:id
→ uma única seta de voltar no topbar
```

O controle de recolher a sidebar usa ícone de painel e não uma seta direcional.

Não criar botão de voltar duplicado dentro da View de detalhe.

## 8.5 Entrada de lote — implementada

Endpoint:

```text
POST /api/v1/movimentacoes/estoques/{estoqueId}/lotes?usuarioId={uuid}
```

O formulário agora trabalha com:

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

`quantidade` representa a quantidade de apresentações físicas recebidas.

Exemplo:

```text
Produto: Extrato de DNA
Unidade-base: REACAO

Apresentação: kit
Quantidade: 2
Conteúdo por apresentação: 50

Saldo incorporado = 2 × 50 = 100 REACOES
```

A tela deve sempre mostrar o total convertido antes da confirmação.

## 8.6 REGRA ESTRUTURAL — unidade-base, apresentação e fracionamento

Esta decisão é obrigatória para Estoque, Pedidos, Movimentações e Rotulagem.

### Produto

O produto possui uma **unidade-base de controle** estável (`Produto.unidadeMedida`).

Exemplos:

```text
Formaldeído 37% → ML
Microplaca → UNIDADE
Extrato de DNA → REACAO
```

A unidade-base é o denominador comum usado para:

```text
saldo
estoque mínimo
entrada
saída
descarte
movimentações
consumo
```

Não criar uma rede global de conversões entre kit, caixa, frasco, bombona etc.

### Lote

Cada lote registra sua própria apresentação física:

```text
apresentacao
quantidadeApresentacoes
conteudoPorApresentacao
fracionavel
quantidadeInicial     ← unidade-base
quantidadeDisponivel  ← unidade-base
```

Exemplos:

```text
2 kits × 50 reações = 100 reações
10 unidades avulsas × 1 reação = 10 reações
4 frascos × 500 mL = 2000 mL
1 bombona × 5000 mL = 5000 mL
```

Apresentações diferentes do mesmo produto podem coexistir porque todas convergem para a mesma unidade-base.

### Fracionamento

```text
fracionavel = true
→ o lote pode perder parte do conteúdo de uma apresentação
→ ex.: frasco de 500 mL pode liberar 100 mL

fracionavel = false
→ a saída deve respeitar apresentações completas
→ ex.: kit fechado de 50 não pode perder apenas 10 unidades-base
```

O backend já protege lotes não fracionáveis contra saldo que não seja múltiplo de `conteudoPorApresentacao`.

Lotes legados são migrados pelo Flyway como fator 1 e fracionáveis, preservando compatibilidade.

### Saída futura / Pedidos

A saída deve trabalhar na mesma lógica.

O usuário poderá solicitar/operar em:

```text
unidade-base
OU
apresentação completa disponível
```

Exemplo:

```text
Disponível:
2 kits de 50 + 10 avulsas = 110 reações

Saída possível:
10 reações, se houver lote fracionável/avulso capaz de atender
OU
1 kit = 50 reações
```

**Nunca interpretar `10 unidades-base` como `10 kits`.**

Quando o fluxo de Pedidos/saída for adaptado ao novo modelo, a interface deve mostrar claramente o modo de saída e a conversão aplicada.

### Rotulagem

O rótulo de lote deve carregar também a apresentação real daquele lote, seu conteúdo por apresentação e a unidade-base quando relevante.

Isso permite que o rótulo represente corretamente tanto `kit com 50` quanto `10 unidades avulsas` do mesmo produto.

## 8.7 Próximos subblocos para concluir Estoque

```text
1. validar entrada com apresentação + unidade-base + fracionamento
2. implementar Descarte por vencimento respeitando unidade-base/fracionamento
3. validar atualização de saldo/lotes
4. encerrar Estoque
```

Descarte real:

```text
POST /api/v1/movimentacoes/estoques/{estoqueId}/descarte-vencimento?usuarioId={uuid}
```

Dados atuais:

```text
quantidade
justificativa
```

`quantidade` deve ser interpretada em unidade-base. Lotes não fracionáveis não podem terminar com saldo quebrado.

Não baixar ou alterar saldo manualmente no frontend.

---

# 9. Produtos — PRÓXIMA ETAPA APÓS ESTOQUE

Produto passa a ser **módulo operacional de primeira classe** e também continua existindo em Cadastros para responsabilidades administrativas.

Essa duplicidade é de navegação/responsabilidade, não de entidade ou dados.

## 9.1 Operação → Produtos

Sidebar planejada:

```text
OPERAÇÃO
Pedidos
Produtos
Estoque
Movimentações
Relatórios
```

Rotas planejadas:

```text
/produtos
/produtos/:id
```

Função:

```text
consultar produto rapidamente
conferir informações
consultar unidade-base
consultar apresentação padrão
consultar estoque atual
consultar mínimo
consultar localização
consultar risco/perecibilidade
consultar última entrada
consultar lotes e apresentações reais
editar informações permitidas
imprimir identificação/rótulo
```

A tela operacional não deve virar um segundo CRUD completo.

## 9.2 Administração → Cadastros → Produtos

Função administrativa:

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

Unidade não entra em Cadastros.

## 9.3 Fluxo oficial de produto e impressão

```text
1. Produto já existe no catálogo
        ↓
2. Usuário vai ao Estoque
        ↓
3. Registra Nova entrada de lote
        ↓
4. Informa apresentação, quantidade, conteúdo por apresentação e fracionamento
        ↓
5. Backend converte para unidade-base, cria o lote e atualiza o saldo
        ↓
6. Usuário acessa Operação → Produtos
        ↓
7. Abre o produto
        ↓
8. Confere:
   - nome/código
   - unidade-base
   - apresentação do lote
   - localização
   - risco
   - perecibilidade
   - condições de armazenamento
   - quantidade atual
   - mínimo
   - última entrada
   - lote/validade
        ↓
9. Edita somente o que sua permissão permitir, se necessário
        ↓
10. Imprime rótulo usando um lote de referência
```

A **última entrada deve vir selecionada por padrão** como lote de referência, mas o usuário deve poder escolher outro lote ativo.

## 9.4 Tipos de impressão

```text
Identificação do produto
→ etiqueta genérica de localização/prateleira
→ não representa um lote específico

Rótulo de lote
→ produto + lote de referência
→ rastreabilidade do recipiente/material físico
```

O rótulo de lote poderá conter:

```text
nome do produto
código do produto
unidade-base
apresentação do lote
conteúdo por apresentação
fracionável ou não, quando relevante
código interno SGL do lote
código/lote informado pelo fornecedor
validade
localização
risco
perecibilidade
condições de armazenamento
```

A impressão não pode inventar campo ausente da API.

---

# 10. Código interno do lote — decisão planejada

O backend atual possui:

```text
numeroLote
→ identificação informada pelo fornecedor/responsável
```

Será criado futuramente outro campo persistido para identificação interna do SGL.

Formato-base aprovado para implementação posterior:

```text
L<sequência>-<abreviação do produto>-<ano>

L01-EXTDNA-26
L02-EXTDNA-26
L01-FORM37-26
```

Regras obrigatórias:

```text
gerado automaticamente pelo backend
não digitado livremente
imutável após criação
único no escopo definido pelo backend
separado do numeroLote informado externamente
usado para rastreabilidade e rótulos
```

A geração precisa tratar concorrência no backend antes de ser usada pela interface.

Não implementar um código calculado apenas no frontend.

---

# 11. Movimentações — depois de Produtos

Rota:

```text
/movimentacoes
```

Objetivo:

```text
histórico
rastreabilidade
consulta por produto
consulta por laboratório
consulta por usuário
consulta por pedido
consulta por tipo
período
```

As quantidades das movimentações devem ser apresentadas na unidade-base, com contexto de apresentação/lote quando necessário.

Entrada de lote e descarte continuam iniciados pelo contexto do Estoque.

Movimentações é principalmente consulta/auditoria.

---

# 12. Relatórios — depois de Movimentações

Rota:

```text
/relatorios
```

Categorias previstas:

```text
Estoque
Lotes / validade
Movimentações
Pedidos
Consumo / materiais recebidos
Fiscalização / auditoria
```

Documentos e exportações só devem ser implementados conforme contrato real.

O backend ainda não possui upload multipart completo; não criar persistência fake.

---

# 13. Administração / Cadastros — futura

Cadastros administrativos previstos:

```text
Produtos
Laboratórios
Projetos
Usuários
Estagiários
```

**Estagiários terá uma interface própria dentro da etapa de Administração.** Não deve ser tratado apenas como um filtro ou subtipo escondido em Usuários.

Rotas planejadas:

```text
/cadastros/estagiarios
/cadastros/estagiarios/:id
```

Objetivo da interface:

```text
listar estagiários
buscar/filtrar
abrir cadastro individual
consultar os dados completos do estagiário
editar campos permitidos
acompanhar situação do estágio
encerrar/inativar conforme regra real do backend
```

A ficha individual deverá puxar os dados reais do Estagiário/Usuário e apresentar, conforme contrato:

```text
nome
email
perfil
ativo/inativo
unidade
laboratório
data de início do estágio
data de fim do estágio
tipo de bolsa
observação
```

Fluxo oficial:

```text
Administração
→ Cadastros
→ Estagiários
→ listagem
→ selecionar estagiário
→ ficha individual
→ consultar dados institucionais e do estágio
→ editar somente conforme permissão
→ encerrar/inativar quando permitido
```

A ficha individual é a fonte central de consulta daquele estagiário. Não criar páginas paralelas com cópias dos mesmos dados.

`Encerrar estágio` deve continuar sendo uma ação de domínio própria, não sinônimo visual de excluir usuário. Permissões definitivas serão fechadas junto com autorização/autenticação.

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
  4.2 Detalhe / Lotes                                      🟡 validação
  4.3 Entrada de lote                                      🟡 unidade-base/apresentação implementada
  4.4 Descarte por vencimento                              ⏳ PRÓXIMO
  4.5 Integração unidade-base/apresentação nas saídas       ⏳ validar com Pedidos/Movimentações

Etapa 5 — Produtos operacional + Rotulagem                 ⏳
  5.1 Lista/consulta operacional                           ⏳
  5.2 Detalhe do produto                                   ⏳
  5.3 Última entrada + lotes                               ⏳
  5.4 Edição conforme permissão                            ⏳
  5.5 Identificação do produto                             ⏳
  5.6 Rótulo com lote de referência                        ⏳
  5.7 Código interno SGL de lote — suporte backend         ⏳

Etapa 6 — Movimentações                                    ⏳
Etapa 7 — Relatórios / Documentos / Fiscalização           ⏳
Etapa 8 — Administração / Cadastros                        ⏳
  8.1 Produtos — cadastro administrativo                   ⏳
  8.2 Laboratórios                                         ⏳
  8.3 Projetos                                             ⏳
  8.4 Usuários                                             ⏳
  8.5 Estagiários — listagem + ficha individual            ⏳ OBRIGATÓRIO

Etapa 9 — Dashboards finais / robustez / 404               ⏳
Etapa 10 — Autenticação / autorização / auditoria          ⏳
```

Sequência prática obrigatória atual:

```text
VALIDAR NOVO MODELO DE ENTRADA
→ DESCARTE
→ FINALIZAR ESTOQUE
→ PRODUTOS
→ MOVIMENTAÇÕES
→ RELATÓRIOS
```

---

# 15. Rotas planejadas/atuais

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
/cadastros/estagiarios/:id ⏳ ficha individual
/:pathMatch(.*)*           ⏳ 404 customizada futura
```

Não criar `/cadastros/unidades`.

---

# 16. Documentos importantes

```text
CONTINUIDADE.md
→ fonte principal de retomada

docs/ROADMAP_INTERFACE_GESTAO.md
→ sequência Gestão/Estoque/Produtos/Rotulagem/Administração

docs/DECISAO_UNIDADES_CORPORATIVAS.md
→ regra futura de criação automática de Unidade
```

---

# 17. PRÓXIMO PASSO EXATO

Estamos em:

```text
ETAPA 4 — ESTOQUE / LOTES
```

Próxima sequência:

```text
1. atualizar/reiniciar backend para aplicar Flyway V5
2. validar Nova entrada de lote com apresentação + fator + fracionamento
3. conferir se saldo e lote aparecem em unidade-base
4. implementar Descarte por vencimento
5. validar fluxo completo
6. marcar Estoque como concluído
7. iniciar ETAPA 5 — PRODUTOS + ROTULAGEM
```

Na etapa de Produtos, o fluxo de impressão descrito na seção 9.3 é obrigatório.

Na futura etapa 8, `Estagiários` deverá obrigatoriamente possuir listagem e ficha individual própria.

---

# 18. Estado atual de branches

Frontend:

```text
feat/gestao-interface
```

Backend:

```text
main
```

Alterações estruturais recentes no backend para Estoque:

```text
Lote
→ apresentacao
→ quantidadeApresentacoes
→ conteudoPorApresentacao
→ fracionavel
→ quantidadeInicial/Disponivel passam a representar unidade-base

EntradaLoteRequestDTO
→ recebe apresentação física e fator

LoteResponseDTO
→ devolve apresentação + unidade-base

EstoqueCentralResponseDTO
→ produtoUnidadeMedida

Flyway V5
→ adiciona os novos campos preservando lotes existentes
```

Regra central: **apresentação física pode variar entre lotes; unidade-base do produto é estável e é usada para consolidar todo o saldo.**
