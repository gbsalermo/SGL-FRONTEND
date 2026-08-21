# Fluxos e Navegação — SGL Frontend

**Etapa:** 1.2 — Fundação visual e técnica  
**Data:** 21/08/2026  
**Base:** `docs/INVENTARIO_TELAS.md` + contratos atuais do backend

Este documento define como o usuário percorre o SGL, quais áreas aparecem na navegação e em qual contexto cada ação deve acontecer. A intenção é evitar um frontend composto apenas por CRUDs isolados.

---

# 1. Princípios

```text
fluxo principal → rota própria
recurso contextual → seção, aba, drawer ou modal
ação de domínio → executada no contexto do recurso
ação relevante/destrutiva → confirmação explícita
retorno após ação → previsível e seguro
```

Decisões:

1. Layout principal com **sidebar + topbar + área de conteúdo**.
2. Sidebar organizada por responsabilidade, não por entidade do backend.
3. `Pedido` e `Estoque` são os dois centros operacionais.
4. `Lote` permanece contextual ao estoque.
5. `Documentos` permanecem contextuais a Pedido, Produto ou Lote.
6. `Relatórios` possuem central própria.
7. `Cadastros` agrupa os módulos administrativos.
8. Breadcrumbs aparecem em telas de detalhe e navegação profunda.
9. O botão Voltar deve possuir destino funcional conhecido quando possível.
10. Permissões definitivas serão fechadas com a autenticação; por enquanto a divisão representa responsabilidade de uso.

---

# 2. Navegação principal

## Solicitante

```text
Dashboard
Pedidos
├── Novo pedido
└── Meus pedidos
```

## Gestão

```text
Dashboard
Pedidos
Estoque
Movimentações
Relatórios
```

## Administração

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

Não criar itens principais de sidebar para Lotes, Histórico de Laboratório ou Documentos no MVP.

---

# 3. Topbar e breadcrumbs

## Topbar

Elementos previstos:

```text
título/contexto da página
identificação do usuário
perfil/responsabilidade atual
menu de conta/sessão
```

Busca global só entra se uma necessidade real aparecer.

Durante o desenvolvimento, o seletor temporário de usuário/perfil deve ser discreto e claramente identificado como recurso de desenvolvimento.

## Breadcrumbs

Exemplos:

```text
Pedidos > Pedido
Estoque > Produto / Unidade
Cadastros > Produtos
Relatórios > categoria
```

Dashboard não precisa de breadcrumb.

---

# 4. Rotas propostas

## Comum

| Tela | Rota |
|---|---|
| Login | `/login` |
| Dashboard | `/dashboard` |
| 404 | `/:pathMatch(.*)*` |

## Pedidos

| Tela | Rota |
|---|---|
| Novo pedido | `/pedidos/novo` |
| Meus pedidos | `/meus-pedidos` |
| Gestão de pedidos | `/pedidos` |
| Detalhe do pedido | `/pedidos/:id` |

## Estoque

| Tela | Rota |
|---|---|
| Estoque central | `/estoque` |
| Detalhe do estoque | `/estoque/:id` |

Lotes ficam dentro do detalhe do estoque. Se futuramente houver necessidade de deep-link específico, pode-se adotar `/estoque/:estoqueId/lotes/:loteId` sem promovê-lo para a sidebar.

## Operação e consulta

| Tela | Rota |
|---|---|
| Movimentações | `/movimentacoes` |
| Relatórios | `/relatorios` |

Categorias de relatório podem usar query string, por exemplo `/relatorios?tipo=consumo`, evitando criar muitas rotas antes de existir necessidade real.

## Cadastros

```text
/cadastros/produtos
/cadastros/unidades
/cadastros/laboratorios
/cadastros/projetos
/cadastros/usuarios
/cadastros/estagiarios
```

---

# 5. Entrada no sistema

## Desenvolvimento

```text
abrir aplicação
→ sessão temporária centralizada
→ responsabilidade simulada
→ dashboard correspondente
```

## Futuro

```text
/login
→ autenticação
→ sessão válida
→ permissões
→ /dashboard
```

Planejar desde já:

```text
sem sessão futura + rota protegida → /login
autenticado em /login → /dashboard
rota desconhecida → 404
```

Isso prepara o router sem fingir segurança antes do backend real de autenticação.

---

# 6. Fluxo do solicitante

## Dashboard

Deve responder rapidamente:

```text
tenho pedidos pendentes?
qual foi meu pedido mais recente?
qual o status dos pedidos recentes?
como faço um novo pedido?
```

Ações principais:

```text
Novo pedido
Ver meus pedidos
Abrir pedido recente
```

## Novo pedido

Fluxo:

```text
/pedidos/novo
→ laboratório
→ projeto opcional
→ adicionar materiais
→ informar quantidades
→ informações adicionais
→ documento futuro quando suportado
→ revisão
→ enviar
→ confirmação
→ /pedidos/{uuid}
```

Organização visual sugerida:

```text
1. Contexto
2. Materiais
3. Informações adicionais
4. Revisão
```

Não precisa ser um wizard rígido; a Etapa 1.3 definirá a melhor composição visual.

### Erros

```text
fieldErrors → destacar campos e permanecer no formulário
regra de negócio → mensagem contextual
500 → preservar dados preenchidos quando possível + tentar novamente
```

## Meus pedidos

```text
/meus-pedidos
→ listar pedidos do usuário atual
→ abrir pedido
→ /pedidos/:id
```

Priorizar status, data, laboratório, projeto e resumo dos materiais.

Não mostrar ações administrativas para o solicitante.

## Detalhe do pedido

Para solicitante:

```text
status
itens
laboratório/projeto
observações
documentos futuros
```

Retorno funcional padrão: **Meus pedidos**.

Não assumir que o solicitante pode cancelar somente porque existe endpoint de cancelamento; isso depende da futura autorização/regra explícita.

---

# 7. Fluxo de gestão de pedidos

## Entrada

```text
Dashboard
→ indicador de pendentes
→ /pedidos?status=PENDENTE
```

ou

```text
Sidebar → Pedidos → /pedidos
```

## Análise

```text
/pedidos
→ selecionar pedido
→ /pedidos/:id
→ revisar solicitante
→ laboratório/projeto
→ materiais e quantidades
→ tomar decisão
```

A tela de detalhe é compartilhada, mas a área de ações varia conforme responsabilidade e estado.

## Aprovar

```text
PENDENTE
→ Aprovar
→ revisar/ajustar quantidades aprovadas
→ confirmar
→ backend executa FEFO/FIFO
→ APROVADO
```

Se houver estoque insuficiente, permanecer na tela e exibir a mensagem real do backend. O frontend não reproduz FEFO/FIFO.

## Rejeitar

```text
PENDENTE
→ Rejeitar
→ motivo/observação
→ confirmar
→ REJEITADO
```

## Entregar

```text
APROVADO
→ Registrar entrega
→ confirmar
→ ENTREGUE
```

A tela deve deixar claro que a entrega não representa nova baixa de estoque.

## Cancelar

```text
status permitido
→ Cancelar
→ confirmação forte
→ observação quando aplicável
→ CANCELADO
```

Restauração de lotes permanece responsabilidade do backend.

---

# 8. Fluxo de estoque

## Visão geral

```text
/estoque
→ filtrar unidade
→ buscar/identificar produto
→ visualizar saldo
→ destacar estoque baixo
→ abrir detalhe
→ /estoque/:id
```

Modos úteis:

```text
Todos
Estoque baixo
Lotes vencidos
```

Lotes vencidos entram como filtro/aba de Estoque, não como item principal.

## Detalhe

```text
produto + unidade
saldo atual + mínimo
lotes
movimentações relacionadas
documentos futuros
ações operacionais
```

Ações:

```text
Registrar entrada
Descartar vencidos
Editar configuração quando autorizado
```

## Entrada de lote

```text
Detalhe do estoque
→ Registrar entrada
→ formulário contextual
→ quantidade/dados do lote
→ documento futuro
→ confirmar
→ backend registra entrada
→ atualizar saldo e lotes
```

Após sucesso, permanecer no detalhe do estoque.

## Descarte

```text
Detalhe do estoque
→ identificar vencidos
→ Descartar
→ quantidade + justificativa
→ confirmação
→ backend registra movimentação
→ atualizar tela
```

## Lote

Editar e inativar ficam no contexto da listagem de lotes. Inativação exige confirmação.

---

# 9. Movimentações

```text
/movimentacoes
→ listar histórico
→ filtrar por produto/laboratório/usuário/pedido/tipo
→ consultar rastreabilidade
```

A tela é focada em consulta/auditoria. Entrada e descarte permanecem no detalhe de Estoque.

Referências úteis podem levar ao contexto relacionado, por exemplo:

```text
pedido → /pedidos/:id
```

---

# 10. Relatórios

Fluxo padrão:

```text
/relatorios
→ escolher categoria
→ exibir filtros compatíveis
→ consultar
→ loading
→ resultado
→ exportar/imprimir quando suportado
```

Categorias iniciais:

```text
Estoque
Lotes / validade
Movimentações
Pedidos
Consumo / materiais recebidos
```

Filtros devem mudar conforme o relatório. Não criar um único formulário com todos os filtros possíveis.

Exemplos:

```text
Consumo
→ laboratório
→ produto
→ data inicial/final
```

```text
Pedidos por projeto
→ laboratório
→ projeto
→ período
```

Exportação:

```text
resultado simples já carregado → frontend pode exportar
relatório grande/oficial/auditável → preferir backend
```

Não desenhar PDF/XLSX/CSV como funcionalidade pronta antes de fechar a estratégia de cada relatório.

---

# 11. Documentos/anexos

Documentos permanecem dentro do recurso relacionado.

## Pedido

```text
/pedidos/:id
→ seção Documentos
```

## Produto

```text
Cadastros > Produtos
→ documento geral/ficha técnica
```

## Lote

```text
/estoque/:id
→ lote
→ nota fiscal / certificado / laudo / documento de entrada
```

Fluxo futuro:

```text
selecionar arquivo
→ validação inicial de UX
→ upload
→ backend valida/persiste
→ feedback
→ atualizar lista
```

O Figma pode prever esse espaço, mas a implementação definitiva depende dos endpoints de arquivo ainda ausentes.

---

# 12. Cadastros

Padrão geral:

```text
Cadastros
→ módulo
→ listagem
├── Novo → formulário → salvar
├── Editar → salvar sem perder filtros/contexto
└── ação relevante → confirmação
```

Ações que exigem atenção:

```text
Excluir
Inativar
Encerrar estágio
```

`Encerrar estágio` deve ter linguagem e ação próprias, nunca ser tratado como sinônimo visual de exclusão.

Não criar rota de detalhe para cada cadastro sem necessidade. GET por UUID pode alimentar edição/drawer/modal.

---

# 13. 404 e recurso não encontrado

## Rota inexistente

```text
/caminho-invalido
→ página 404 customizada
→ Voltar ao Dashboard
```

## Recurso inexistente

```text
/pedidos/{uuid-inexistente}
→ API retorna 404
→ estado contextual "Pedido não encontrado"
→ voltar para lista adequada
```

Nunca transformar automaticamente 404 da API em página 404 de rota.

---

# 14. Regras de retorno

```text
Pedido criado → detalhe do novo pedido
Cadastro criado → listagem atualizada
Entrada de lote → detalhe do estoque
Edição → permanecer no contexto
Exclusão/inativação → listagem + feedback
```

Botão Voltar:

```text
Pedido do solicitante → Meus pedidos
Pedido da gestão → Pedidos
Detalhe de estoque → Estoque
```

Quando a mesma rota puder ser acessada de origens diferentes, usar origem segura no router com fallback funcional conhecido.

---

# 15. Confirmações

Sem confirmação adicional:

```text
filtros
buscas
navegação
abrir detalhe
```

Com confirmação:

```text
rejeitar pedido
registrar entrega
cancelar pedido
descarte
inativar usuário/lote
excluir cadastro
encerrar estágio
```

Na aprovação, a própria revisão das quantidades funciona como confirmação operacional.

---

# 16. Alterações não salvas

Formulários com trabalho relevante devem avisar quando o usuário tentar sair com mudanças não salvas:

```text
Sair sem salvar
Permanecer
```

Não aplicar esse bloqueio a filtros simples.

---

# 17. Responsividade

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

Tabelas podem usar scroll horizontal ou apresentação resumida, sem esconder informações críticas de operação.

---

# 18. Fluxos consolidados

## Solicitante

```text
Dashboard
→ Novo pedido
→ Contexto
→ Materiais
→ Revisão
→ Enviar
→ Detalhe
→ Acompanhar
```

## Gestão

```text
Fila
→ Pedido
→ Analisar
├── Aprovar → APROVADO
└── Rejeitar → REJEITADO

APROVADO
├── Entregar → ENTREGUE
└── Cancelar → CANCELADO
```

## Estoque

```text
Estoque
→ Produto/Unidade
→ Detalhe
├── Lotes
├── Entrada
├── Descarte
├── Movimentações
└── Documentos futuros
```

## Relatórios

```text
Relatórios
→ Categoria
→ Filtros
→ Resultado
→ Exportar/Imprimir quando suportado
```

## Cadastros

```text
Cadastros
→ Módulo
→ Listagem
├── Novo
├── Editar
└── ação relevante + confirmação
```

---

# 19. Fora do escopo da 1.2

Ainda não são definidos aqui:

```text
cores finais
tipografia final
medidas finais
componentes Vuetify exatos
logo aplicada ao layout
wireframes finais
```

Esses itens pertencem à **Etapa 1.3 — Figma e padrões**.

---

# 20. Resultado

A Etapa 1.2 fecha:

```text
hierarquia da sidebar ✅
rotas propostas ✅
jornada do solicitante ✅
jornada da gestão ✅
fluxo de estoque ✅
fluxo de movimentações ✅
fluxo de relatórios ✅
posicionamento dos documentos ✅
padrão de cadastros ✅
404 x recurso não encontrado ✅
retornos e confirmações ✅
```

Próxima etapa: **1.3 — Figma e padrões**, transformando esses fluxos em wireframes e direção visual antes do bootstrap do Vue.
