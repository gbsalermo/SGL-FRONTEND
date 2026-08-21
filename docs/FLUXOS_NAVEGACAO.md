# Fluxos e Navegação — SGL Frontend

**Etapa:** 1.2 — Fundação visual e técnica  
**Data:** 21/08/2026  
**Base:** `docs/INVENTARIO_TELAS.md` + contratos atuais do backend

Este documento define como o usuário percorre o SGL, quais áreas aparecem na navegação, como as telas se conectam e quais ações pertencem a cada contexto. O objetivo é impedir que o frontend vire apenas um conjunto de CRUDs desconectados.

---

# 1. Princípios de navegação

```text
fluxo principal
→ rota própria

recurso contextual
→ aba, seção, drawer ou modal

ação de domínio
→ executada no contexto do recurso

ação destrutiva/relevante
→ exige confirmação

retorno após ação
→ previsível e seguro
```

Decisões:

1. O sistema terá uma estrutura principal com **sidebar + topbar + área de conteúdo**.
2. A sidebar será orientada por responsabilidade, não por quantidade de entidades do backend.
3. `Pedido` e `Estoque` serão os dois principais pontos de navegação operacional.
4. `Lote` permanece contextual ao estoque.
5. `Documentos` permanecem contextuais ao recurso relacionado.
6. `Relatórios` possuem central própria.
7. `Cadastros` agrupa os módulos administrativos.
8. Breadcrumbs serão utilizados em telas de detalhe e fluxos profundos.
9. Botão "voltar" não deve depender apenas do histórico do navegador quando existir um destino funcional claro.
10. A autorização final será definida com a autenticação; nesta fase, a navegação representa responsabilidades de uso.

---

# 2. Shell principal

## 2.1 Sidebar

### Solicitante

```text
Dashboard
Pedidos
├── Novo pedido
└── Meus pedidos
```

### Gestão

```text
Dashboard
Pedidos
Estoque
Movimentações
Relatórios
```

### Administração

```text
Dashboard
Pedidos
Estoque
Movimentações
Relatórios
Cadastros
├── Produtos
├── Unidades
├── Laboratórios
├── Projetos
├── Usuários
└── Estagiários
```

A sidebar deve suportar grupos expansíveis, porém sem excesso de níveis.

## 2.2 Topbar

Elementos previstos:

```text
identificação da página atual
busca global futura, somente se houver necessidade real
atalhos/contexto quando útil
identificação do usuário
perfil/responsabilidade atual
menu de conta/sessão
```

Durante o desenvolvimento, o seletor temporário de usuário/perfil pode aparecer de forma discreta e claramente marcada como ferramenta de desenvolvimento.

## 2.3 Breadcrumbs

Usar em telas como:

```text
Pedidos > Pedido
Estoque > Produto / Unidade
Cadastros > Produtos
Cadastros > Projetos
Relatórios > categoria selecionada
```

Não usar breadcrumb em telas rasas como Dashboard.

---

# 3. Mapa de rotas consolidado

## 3.1 Comum

| Nome lógico | Rota | Observação |
|---|---|---|
| Login | `/login` | Visual inspirado no Publica |
| Dashboard | `/dashboard` | Conteúdo conforme responsabilidade |
| 404 | `/:pathMatch(.*)*` | Rota inexistente |

## 3.2 Pedidos

| Nome lógico | Rota | Responsabilidade |
|---|---|---|
| Novo pedido | `/pedidos/novo` | Solicitante |
| Meus pedidos | `/meus-pedidos` | Solicitante |
| Gestão de pedidos | `/pedidos` | Gestão/Administração |
| Detalhe do pedido | `/pedidos/:id` | Compartilhado, ações variam |

## 3.3 Estoque

| Nome lógico | Rota | Observação |
|---|---|---|
| Estoque | `/estoque` | Visão geral operacional |
| Detalhe do estoque | `/estoque/:id` | Lotes, movimentos e operações |

Lotes não recebem rota principal no MVP. Caso seja necessário deep-link de lote no futuro, poderá ser adotado `/estoque/:estoqueId/lotes/:loteId` sem alterar a organização da sidebar.

## 3.4 Movimentações

| Nome lógico | Rota |
|---|---|
| Movimentações | `/movimentacoes` |

## 3.5 Relatórios

| Nome lógico | Rota |
|---|---|
| Central de relatórios | `/relatorios` |

Categorias podem ser representadas por query string ou estado interno, por exemplo:

```text
/relatorios?tipo=estoque
/relatorios?tipo=pedidos
/relatorios?tipo=consumo
```

Evitar criar uma rota separada para cada relatório antes de confirmar necessidade de compartilhamento/deep-link.

## 3.6 Cadastros

```text
/cadastros/produtos
/cadastros/unidades
/cadastros/laboratorios
/cadastros/projetos
/cadastros/usuarios
/cadastros/estagiarios
```

---

# 4. Fluxo de entrada no sistema

## Estado atual de desenvolvimento

```text
abrir aplicação
→ sessão temporária de desenvolvimento
→ responsabilidade simulada
→ dashboard correspondente
```

## Estado futuro

```text
/login
→ autenticação
→ sessão válida
→ resolução de permissões
→ /dashboard
```

### Redirecionamentos planejados

```text
usuário sem sessão futura
→ rota protegida
→ /login

usuário autenticado em /login
→ /dashboard

rota desconhecida
→ 404
```

A etapa atual não implementa segurança fictícia. Essa estrutura apenas evita reconstrução do router quando a autenticação real chegar.

---

# 5. Fluxo do solicitante

## 5.1 Dashboard do solicitante

Objetivo: responder rapidamente:

```text
tenho pedido pendente?
qual foi o último pedido?
há pedido aprovado/entregue/rejeitado recentemente?
como faço um novo pedido?
```

Ações principais:

```text
Novo pedido
Ver meus pedidos
Abrir pedido recente
```

Fluxos:

```text
Dashboard
├── Novo pedido → /pedidos/novo
└── Meus pedidos → /meus-pedidos
```

---

## 5.2 Criar pedido

Fluxo completo:

```text
/pedidos/novo
→ selecionar laboratório
→ selecionar projeto, quando aplicável
→ adicionar materiais
→ informar quantidades
→ observação/dados adicionais
→ anexar documento, quando o backend suportar
→ revisar pedido
→ enviar
→ feedback de sucesso
→ abrir detalhe do pedido criado
```

### Organização sugerida

O formulário pode ser dividido em passos visuais sem obrigatoriamente usar wizard rígido:

```text
1. Contexto
   laboratório
   projeto

2. Materiais
   produto
   quantidade
   adicionar/remover itens

3. Informações adicionais
   observação
   documento futuro

4. Revisão
   resumo completo
   confirmar envio
```

### Após sucesso

Destino preferencial:

```text
POST criado
→ /pedidos/{uuid}
```

Evitar retornar imediatamente para listagem sem mostrar confirmação e contexto do pedido criado.

### Erro

```text
400 / fieldErrors
→ permanecer no formulário
→ destacar campos

regra de negócio
→ mensagem contextual

500
→ preservar dados preenchidos quando possível
→ permitir nova tentativa
```

---

## 5.3 Meus pedidos

```text
/meus-pedidos
→ lista pedidos do usuário da sessão
→ filtros locais úteis
→ clicar linha/card
→ /pedidos/:id
```

Prioridade visual:

```text
status
data
laboratório
projeto
resumo de materiais
```

O solicitante não deve visualizar botões de aprovação, rejeição ou entrega.

---

## 5.4 Detalhe do pedido — solicitante

Fluxo:

```text
/meus-pedidos
→ /pedidos/:id
→ consultar situação
→ consultar itens
→ consultar observações
→ consultar documento quando houver
```

Ações possíveis do solicitante só serão adicionadas quando houver regra de domínio explícita. Não assumir cancelamento pelo solicitante apenas porque existe endpoint de cancelamento para o sistema.

Retorno funcional:

```text
Voltar para meus pedidos
```

---

# 6. Fluxo de gestão de pedidos

## 6.1 Entrada pela fila

```text
Dashboard gestão
→ indicador Pedidos pendentes
→ /pedidos?status=PENDENTE
```

ou

```text
Sidebar
→ Pedidos
→ /pedidos
```

Tela deve priorizar pendências e filtros por status.

---

## 6.2 Análise de pedido

```text
/pedidos
→ selecionar pedido
→ /pedidos/:id
→ analisar solicitante
→ laboratório/projeto
→ materiais e quantidades
→ disponibilidade/feedback do backend
→ tomar decisão
```

A tela de detalhe é compartilhada com solicitante, mas a área de ações aparece conforme responsabilidade e estado.

---

## 6.3 Aprovação

```text
Pedido PENDENTE
→ Aprovar
→ informar quantidades aprovadas por item
→ confirmar
→ PUT aprovar
→ backend executa FEFO/FIFO
→ sucesso
→ detalhe atualizado como APROVADO
```

Se estoque insuficiente:

```text
backend 400/regra de negócio
→ não sair da tela
→ exibir mensagem de disponibilidade
→ permitir ajustar quantidades quando aplicável
```

Nunca simular FEFO/FIFO no frontend.

---

## 6.4 Rejeição

```text
Pedido PENDENTE
→ Rejeitar
→ modal de confirmação
→ observação/motivo
→ confirmar
→ status REJEITADO
```

O modal deve deixar explícito que a decisão altera o estado do pedido.

---

## 6.5 Entrega

```text
Pedido APROVADO
→ Registrar entrega
→ confirmação
→ PUT entregar
→ status ENTREGUE
→ histórico de laboratório criado pelo backend
```

A interface não deve sugerir que a entrega baixará estoque novamente.

---

## 6.6 Cancelamento

```text
Pedido em status permitido
→ Cancelar
→ confirmação forte
→ observação/motivo quando útil
→ PUT cancelar
→ backend restaura lotes exatos se necessário
→ status CANCELADO
```

A interface não tenta calcular restauração.

---

# 7. Fluxo de estoque

## 7.1 Visão geral

```text
/estoque
→ selecionar/filtrar unidade
→ visualizar produtos e saldos
→ destacar estoque baixo
→ buscar produto
→ selecionar registro
→ /estoque/:id
```

A visão geral deve permitir alternar entre:

```text
Todos
Estoque baixo
Lotes vencidos
```

`Lotes vencidos` pode alterar o conteúdo da tabela/aba sem transformar Lote em item principal da sidebar.

---

## 7.2 Detalhe do estoque

```text
/estoque/:id
→ cabeçalho produto + unidade
→ saldo atual / mínimo
→ lotes
→ movimentações relacionadas
→ documentos futuros
→ ações operacionais
```

Ações principais:

```text
Registrar entrada
Descartar vencidos
Editar configuração do estoque, quando autorizado
```

---

## 7.3 Entrada de lote

```text
Detalhe do estoque
→ Registrar entrada
→ modal/drawer ou formulário contextual
→ quantidade
→ código/referência e validade conforme contrato
→ documento da entrada futuramente
→ confirmar
→ POST entrada
→ atualizar saldo e lotes
```

Após sucesso, permanecer no detalhe do estoque e destacar o novo lote/feedback.

Não redirecionar para Movimentações após cada entrada; o objetivo primário do usuário continua sendo o estoque.

---

## 7.4 Descarte de vencidos

```text
Detalhe do estoque
→ lote/estoque vencido identificado
→ Descartar
→ quantidade + justificativa
→ confirmação
→ backend registra descarte
→ atualizar saldo/lotes
```

A confirmação deve ser mais forte que uma edição comum por gerar movimentação física/auditoria.

---

## 7.5 Edição/inativação de lote

Ações de lote ficam na lista contextual:

```text
Lote
├── editar dados permitidos
└── inativar
```

Inativação exige confirmação.

---

# 8. Fluxo de movimentações

```text
/movimentacoes
→ carregar histórico
→ filtrar
   produto
   laboratório
   usuário
   pedido
   tipo
→ abrir detalhes quando necessário
```

Objetivo da tela:

```text
consulta
rastreabilidade
auditoria operacional
```

Não posicionar `Entrada` e `Descarte` como ações principais aqui; essas operações nascem do contexto do estoque.

Um clique em referência deve permitir navegação contextual quando possível:

```text
pedido → /pedidos/:id
estoque/produto relacionado → contexto de estoque
```

---

# 9. Fluxo de relatórios

## 9.1 Entrada

```text
/relatorios
→ selecionar categoria
→ exibir filtros compatíveis
→ executar consulta
→ mostrar resultado
→ exportar/imprimir quando disponível
```

Categorias iniciais:

```text
Estoque
Lotes / validade
Movimentações
Pedidos
Consumo / materiais recebidos
```

## 9.2 Regra de filtros

Filtros aparecem conforme categoria; não criar um formulário gigante com todos os campos possíveis.

Exemplo:

```text
Consumo
→ laboratório
→ produto
→ data inicial
→ data final
```

```text
Pedidos por projeto
→ laboratório
→ projeto
→ período
```

## 9.3 Resultado

```text
filtros válidos
→ loading
→ tabela/resumo
→ empty se não houver dados
→ exportação disponível
```

Alterar filtro não deve apagar o último resultado antes da nova consulta ser confirmada quando isso prejudicar a leitura.

## 9.4 Exportação

```text
resultado já carregado e simples
→ exportação frontend pode ser usada

relatório oficial/grande/auditável
→ backend preferencial
```

Enquanto a estratégia não estiver fechada, botões de exportação não devem ser desenhados como se todos os formatos já estivessem disponíveis.

---

# 10. Fluxo de documentos/anexos

Documentos são contextuais.

## Pedido

```text
/pedidos/:id
→ seção Documentos
→ listar
→ visualizar/download
→ upload quando permitido
```

## Produto

```text
/cadastros/produtos
→ editar/consultar produto
→ seção Documentos
→ ficha técnica/documentação geral
```

## Lote

```text
/estoque/:id
→ lote
→ documentos
→ nota fiscal/certificado/laudo/documento de entrada
```

## Fluxo de upload futuro

```text
Selecionar arquivo
→ validar UX básica
→ enviar
→ progresso quando necessário
→ backend valida/persiste
→ sucesso
→ documento aparece na lista
```

Até os endpoints existirem, o Figma pode prever o espaço/fluxo, mas a implementação não deve fingir persistência real.

---

# 11. Fluxo de cadastros

Padrão base:

```text
Cadastros
→ selecionar módulo
→ listagem
→ Novo
→ formulário
→ salvar
→ feedback
→ retornar/permanecer na listagem atualizada
```

Edição:

```text
listagem
→ Editar
→ modal/drawer ou página conforme complexidade
→ salvar
→ atualizar item sem perder filtros/contexto
```

Ações destrutivas/relevantes:

```text
Excluir
Inativar
Encerrar estágio
→ confirmação explícita
```

`Encerrar estágio` não deve ser apresentado visualmente como sinônimo de excluir.

---

# 12. Navegação contextual entre módulos

O SGL deve permitir atravessar relações úteis sem duplicar telas.

Exemplos:

```text
Pedido
→ laboratório
→ projeto
→ movimentações relacionadas

Estoque
→ produto
→ lotes
→ movimentações

Relatório
→ pedido identificado
→ detalhe do pedido
```

Links contextuais devem ser usados apenas quando ajudam a tarefa. Não transformar toda informação relacionada em link.

---

# 13. Estados de rota e tela

Toda rota remota deve prever:

```text
loading
success
empty
error
```

## Recurso inexistente

Exemplo:

```text
/pedidos/{uuid-inexistente}
→ API retorna 404
→ estado contextual "Pedido não encontrado"
→ botão Voltar para pedidos
```

Isso **não** deve cair na página 404 de rota.

## Rota inexistente

```text
/caminho-que-nao-existe
→ 404 customizada
→ voltar ao Dashboard
```

---

# 14. Regras de retorno

## Após criação

```text
Pedido
→ detalhe do novo pedido

Cadastro simples
→ listagem atualizada

Entrada de lote
→ detalhe do estoque
```

## Após edição

Preferir permanecer no contexto atual.

## Após exclusão/inativação

```text
item deixa de existir/ficar disponível
→ voltar/listagem
→ feedback claro
```

## Botão Voltar

Priorizar destino funcional:

```text
Detalhe pedido solicitante → Meus pedidos
Detalhe pedido gestão → Pedidos
Detalhe estoque → Estoque
```

Se a mesma rota puder ser aberta de contextos diferentes, o router pode armazenar `from` seguro ou usar fallback funcional conhecido.

---

# 15. Confirmações e feedback

## Sem confirmação extra

```text
filtros
buscas
navegação
abrir detalhe
```

## Confirmação recomendada

```text
rejeitar pedido
registrar entrega
cancelar pedido
inativar usuário/lote
excluir cadastro
encerrar estágio
descarte de estoque
```

## Aprovação

A própria revisão de quantidades + botão de confirmação funciona como confirmação operacional.

---

# 16. Alterações não salvas

Formulários relevantes devem proteger contra perda acidental quando houver mudanças ainda não salvas.

```text
usuário altera formulário
→ tenta sair
→ aviso de alterações não salvas
→ sair sem salvar / permanecer
```

Aplicar apenas a formulários onde a perda de trabalho é material; não adicionar bloqueios a filtros simples.

---

# 17. Responsividade de navegação

Desktop:

```text
sidebar persistente/recolhível
+ topbar
```

Telas menores:

```text
sidebar em drawer
+ topbar compacta
```

Tabelas densas podem adaptar para scroll horizontal ou visualização resumida, mas não devem esconder campos críticos de operação.

---

# 18. O que não entra nesta etapa

A Etapa 1.2 define comportamento e hierarquia, mas ainda não define:

```text
cores finais
tipografia final
componentes Vuetify exatos
medidas finais
logo aplicada ao layout
wireframe visual final
```

Esses pontos entram na Etapa 1.3 — Figma e padrões.

---

# 19. Fluxos consolidados

## Solicitante

```text
Dashboard
→ Novo pedido
→ Contexto
→ Materiais
→ Revisão
→ Enviar
→ Detalhe
→ Acompanhar status
```

## Gestão de pedidos

```text
Dashboard/Fila
→ Pedido
→ Analisar
├── Aprovar → quantidades → confirmar → APROVADO
└── Rejeitar → motivo → confirmar → REJEITADO

APROVADO
├── Entregar → confirmar → ENTREGUE
└── Cancelar → confirmar → CANCELADO
```

## Estoque

```text
Estoque
→ Unidade/Produto
→ Detalhe
├── Lotes
├── Registrar entrada
├── Descartar vencidos
├── Movimentações relacionadas
└── Documentos futuros
```

## Relatórios

```text
Relatórios
→ Categoria
→ Filtros
→ Consultar
→ Resultado
→ Exportar/Imprimir quando suportado
```

## Cadastros

```text
Cadastros
→ Módulo
→ Listagem
├── Novo → Salvar
├── Editar → Salvar
└── ação relevante → Confirmar
```

---

# 20. Resultado da Etapa 1.2

Com os fluxos definidos, o SGL possui agora:

```text
mapa de telas ✅
hierarquia de navegação ✅
rotas propostas ✅
jornadas solicitante/gestão ✅
fluxo de estoque ✅
fluxo de relatórios ✅
posição dos documentos ✅
padrão administrativo ✅
regras de retorno/404 ✅
confirmações relevantes ✅
```

A próxima etapa é transformar essa estrutura em **wireframes e padrões visuais**, sem começar a implementar Vue antes de fechar a direção visual mínima.
