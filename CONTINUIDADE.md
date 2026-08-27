# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Repositório frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend de referência:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 27/08/2026  
**Branch atual:** `feat/gestao-interface`  
**Fase atual:** Estoque / Lotes  
**Último bloco concluído:** Pedidos da Gestão  
**Próximo passo exato:** finalizar Estoque; depois Produtos → Movimentações → Relatórios

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
Estoque — visão geral                     🟡 em validação
Estoque — detalhe/lotes                   🟡 em validação
Entrada de lote                           ⏳
Descarte por vencimento                   ⏳
Produtos operacional + rótulos            ⏳ próximo após Estoque
Movimentações                             ⏳
Relatórios                                ⏳
Demais Cadastros/Administração            ⏳
Dashboard final / robustez / 404           ⏳
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

Estoque Central
→ saldo/configuração do produto na unidade

Lote
→ entrada física/rastreabilidade

Movimentação
→ histórico da operação física
```

Não criar produto dentro da tela de Estoque.

## 8.2 Visão geral `/estoque`

A visão atual deve mostrar:

```text
Produtos em estoque
Estoque baixo
Zerados
Produtos com lote vencido
```

**Quantidade consolidada foi removida.**

Motivo: somar kits, frascos, unidades e outras apresentações gera uma métrica sem significado operacional confiável.

`Produtos com lote vencido` conta produtos distintos que possuem ao menos um lote ativo vencido na unidade.

Tabela aprovada:

```text
Produto
Código do produto
Apresentação
Localização
Quantidade atual
Mínimo
Situação
Detalhe
```

Terminologia:

```text
Apresentação
→ antigo campo visual "Armazenamento"
→ exemplos: frasco de 500 mL, kit com 50 reações

Localização
→ localização física do produto
→ exemplos: AMX2, Geladeira 1, Armário Q3
```

O backend já possui `Produto.localizacaoFisica` e `Produto.codigoReferencia`.

O `EstoqueCentralResponseDTO` foi ampliado de forma aditiva para devolver:

```text
produtoCodigoReferencia
produtoLocalizacaoFisica
```

## 8.3 Detalhe `/estoque/:id`

Deve reunir:

```text
produto
código de referência
apresentação
localização
estoque mínimo
saldo atual
disponível nos lotes
lotes próximos do vencimento
lotes vencidos
lista de lotes
```

A lista de lotes atual diferencia:

```text
VÁLIDO
PRÓXIMO DO VENCIMENTO
VENCIDO
```

O campo atual do backend `numeroLote` deve aparecer como:

```text
Lote fornecedor
```

Isso evita confundi-lo com o futuro código interno gerado pelo SGL.

## 8.4 Navegação do shell

Regra atual:

```text
seção principal, ex. /estoque
→ não mostra seta de voltar no topbar

página aninhada, ex. /estoque/:id
→ uma única seta de voltar no topbar
```

O controle de recolher a sidebar usa ícone de painel e não uma seta direcional.

Não criar botão de voltar duplicado dentro da View de detalhe.

## 8.5 Próximos subblocos para concluir Estoque

```text
1. validar visualmente visão geral e detalhe
2. implementar Nova entrada de lote
3. implementar Descarte por vencimento
4. validar atualização de saldo/lotes
5. encerrar Estoque
```

Entrada real do backend:

```text
POST /api/v1/movimentacoes/estoques/{estoqueId}/lotes?usuarioId={uuid}
```

Dados:

```text
numeroLote
quantidade
dataValidade
origem
observacao
```

Descarte real:

```text
POST /api/v1/movimentacoes/estoques/{estoqueId}/descarte-vencimento?usuarioId={uuid}
```

Dados:

```text
quantidade
justificativa
```

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
consultar estoque atual
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

Este fluxo é obrigatório para a etapa de Produtos:

```text
1. Produto já existe no catálogo
        ↓
2. Usuário vai ao Estoque
        ↓
3. Registra Nova entrada de lote
        ↓
4. Backend cria o lote e atualiza o saldo
        ↓
5. Usuário acessa Operação → Produtos
        ↓
6. Abre o produto
        ↓
7. Confere:
   - nome/código
   - apresentação
   - localização
   - risco
   - perecibilidade
   - condições de armazenamento
   - quantidade atual
   - mínimo
   - última entrada
   - lote/validade
        ↓
8. Edita somente o que sua permissão permitir, se necessário
        ↓
9. Imprime rótulo usando um lote de referência
```

A **última entrada deve vir selecionada por padrão** como lote de referência, mas o usuário deve poder escolher outro lote ativo.

## 9.4 Tipos de impressão

Planejar duas saídas:

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
código interno SGL do lote
lote do fornecedor
validade
localização
risco
perecibilidade
condições de armazenamento
```

A impressão não pode inventar campo ausente da API.

---

# 10. Código interno do lote — decisão planejada

O backend atual já possui:

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
separado do numeroLote do fornecedor
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

# 13. Roadmap oficial atualizado

```text
Etapa 0 — Handoff backend → frontend                       ✅
Etapa 1 — Fundação visual/técnica                          ✅
Etapa 2 — Bootstrap técnico                                ✅

Etapa 3 — Interfaces iniciais                              ✅
  3.1 Login                                                ✅
  3.2 Pedidos do Solicitante                               ✅
  3.3 Shell Gestão/Admin + Pedidos da Gestão               ✅

Etapa 4 — Operação de estoque                              🟡 ATUAL
  4.1 Visão geral do Estoque                               🟡 validação
  4.2 Detalhe / Lotes                                      🟡 validação
  4.3 Entrada de lote                                      ⏳
  4.4 Descarte por vencimento                              ⏳

Etapa 5 — Produtos operacional + Rotulagem                 ⏳ PRÓXIMO
  5.1 Lista/consulta operacional                           ⏳
  5.2 Detalhe do produto                                   ⏳
  5.3 Última entrada + lotes                               ⏳
  5.4 Edição conforme permissão                            ⏳
  5.5 Identificação do produto                             ⏳
  5.6 Rótulo com lote de referência                        ⏳
  5.7 Código interno SGL de lote — suporte backend         ⏳

Etapa 6 — Movimentações                                    ⏳
Etapa 7 — Relatórios / Documentos / Fiscalização           ⏳
Etapa 8 — Demais Cadastros / Administração                 ⏳
Etapa 9 — Dashboards finais / robustez / 404               ⏳
Etapa 10 — Autenticação / autorização / auditoria          ⏳
```

Sequência prática obrigatória atual:

```text
FINALIZAR ESTOQUE
→ PRODUTOS
→ MOVIMENTAÇÕES
→ RELATÓRIOS
```

---

# 14. Rotas planejadas/atuais

```text
/login
/meus-pedidos
/pedidos/novo
/pedidos
/estoque
/estoque/:id
/produtos                 ⏳
/produtos/:id             ⏳
/movimentacoes            ⏳
/relatorios               ⏳
/cadastros/produtos       ⏳
/cadastros/laboratorios   ⏳
/cadastros/projetos       ⏳
/cadastros/usuarios       ⏳
/cadastros/estagiarios    ⏳
/:pathMatch(.*)*          ⏳ 404 customizada futura
```

Não criar `/cadastros/unidades`.

---

# 15. Documentos importantes

```text
CONTINUIDADE.md
→ fonte principal de retomada

docs/ROADMAP_INTERFACE_GESTAO.md
→ sequência Gestão/Estoque/Produtos/Rotulagem

docs/DECISAO_UNIDADES_CORPORATIVAS.md
→ regra futura de criação automática de Unidade

docs/SHELL_VISUAL.md
→ shell, sidebar e topbar

docs/SIDEBAR_ALERTAS.md
→ alertas operacionais

docs/PADROES_PAGINA.md
→ busca, filtros e conteúdo

docs/ESTRUTURA_FRONTEND.md
→ arquitetura física
```

---

# 16. PRÓXIMO PASSO EXATO

Não voltar para Pedidos neste momento, salvo correção de bug.

Estamos em:

```text
ETAPA 4 — ESTOQUE / LOTES
```

Próxima sequência:

```text
1. validar os ajustes atuais de /estoque
2. validar /estoque/:id
3. implementar Nova entrada de lote
4. implementar Descarte por vencimento
5. validar fluxo completo
6. marcar Estoque como concluído
7. iniciar ETAPA 5 — PRODUTOS + ROTULAGEM
```

Na etapa de Produtos, o fluxo de impressão descrito na seção 9.3 é obrigatório e não deve ser simplificado para um rótulo genérico sem lote quando a intenção for rastreabilidade física.

---

# 17. Estado atual de branches

Frontend em desenvolvimento:

```text
feat/gestao-interface
```

Backend de referência:

```text
main
```

Alteração aditiva recente no backend para a interface de Estoque:

```text
EstoqueCentralResponseDTO
→ produtoCodigoReferencia
→ produtoLocalizacaoFisica
```

Essa alteração não modifica regras de estoque; apenas expõe dados já existentes de Produto para a interface.
