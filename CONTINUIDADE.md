# Continuidade — SGL Frontend

**Projeto:** SGL — Sistema de Gestão de Laboratórios  
**Frontend:** `gbsalermo/SGL-FRONTEND`  
**Backend:** `gbsalermo/Sistema-SGL`  
**Última atualização:** 28/08/2026  
**Branch de fechamento deste ciclo:** `feat/relatorios-exportacao-interface`  
**Backend de fechamento:** `feat/relatorios-exportacao`  
**Fase atual:** interfaces operacionais principais de Gestão + central de Relatórios concluídas; próximo grande bloco é Administração/Cadastros.  
**Último bloco validado:** Relatórios + Fiscalização + exportação PDF/XLSX.  
**Próximo passo exato:** iniciar Administração/Cadastros pelo cadastro real de Produtos, incluindo a classificação de fiscalização; depois Laboratórios, Projetos, Usuários e Estagiários.

Este arquivo é a fonte principal de retomada do frontend.

---

# 0. Como continuar

```text
1. ler CONTINUIDADE.md
2. usar backend/Swagger como fonte de verdade dos contratos
3. conferir docs/ROADMAP_INTERFACE_GESTAO.md quando necessário
4. não duplicar regra de negócio no frontend
5. implementar por bloco funcional
6. validar visualmente e funcionalmente antes do merge
7. atualizar este arquivo ao encerrar o bloco
```

Fluxo:

```text
entender domínio
→ conferir contrato real
→ implementar
→ validar visualmente
→ refinar
→ validar integração
→ merge
→ próxima etapa
```

---

# 1. Stack oficial

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

- UUID público nas fronteiras;
- Axios concentrado em services;
- Admin reutiliza a Gestão;
- não espalhar regra de negócio pelos componentes;
- dados históricos não devem ser reescritos de forma que quebre rastreabilidade;
- linguagem da interface deve ser simples, mesmo quando o backend executa regras complexas.

---

# 2. Estado geral em 28/08/2026

```text
Login                                             ✅
Pedidos do Solicitante                            ✅
Pedidos — forma de retirada por embalagem         ✅
Pedidos Gestão                                    ✅
Urgência de pedido                                ✅
Pedidos entregues — lotes utilizados              ✅
Shell Gestão/Admin                                ✅
Perfil/configurações do usuário                   ✅
Estoque — visão geral                             ✅
Estoque — detalhe                                 ✅
Lotes — entrada                                   ✅
Lotes — Código SGL                                ✅
Lotes — embalagem/multiplicador                   ✅
Lotes — modal detalhe/edição                      ✅
Lotes — histórico de saídas                       ✅
Lotes — fracionamento irreversível                ✅
Lotes — FIFO/FEFO com embalagem                   ✅ integração backend
Lotes — descarte por vencimento                   ✅
Lotes — busca/filtros/status                      ✅
Movimentações                                     ✅
Relatórios — central visual                       ✅
Relatório de Estagiários                          ✅
Relatório de Produtos                             ✅
Relatório de Movimentações                        ✅
Resumo Operacional                                ✅
Relatório de Estoque e Lotes                      ✅
Relatório de Fiscalização                         ✅
Exportação PDF                                    ✅ validada
Exportação Excel/XLSX                             ✅ validada
Resíduos — opção na central                       ✅ placeholder
Resíduos — módulo operacional                     🟡 branch própria; integrar
Resíduos — relatório/exportação                   ⏳ após integração
Administração / Cadastros                         ⏳ PRÓXIMA ETAPA
Documentos / upload real                          ⏳
Dashboard final / robustez / 404                  ⏳
Autenticação definitiva / auditoria               ⏳ pós-frontend
```

---

# 3. Decisão sobre Produtos

A antiga ideia de uma área operacional independente `/produtos` não deve gerar duplicação com Administração.

Decisão atual:

```text
Gestão operacional
→ Estoque
→ Lotes
→ Movimentações
→ Relatórios

Administração
→ Cadastros
   └── Produtos
```

O **CRUD real de Produto** pertence a:

```text
Administração → Cadastros → Produtos
```

Relatórios possuem uma visão de Produtos, mas **não substituem cadastro/edição**.

No cadastro de Produto devem existir, além dos dados já previstos:

```text
Fiscalizado?              toggle
Órgãos fiscalizadores    seleção múltipla
Observação fiscalização  opcional
```

Se `Fiscalizado = Sim`, ao menos um órgão é obrigatório.

Órgãos iniciais:

```text
Polícia Federal
Vigilância Sanitária
ANVISA
Exército
Outro
```

Não inferir fiscalização por risco ou perecibilidade.

---

# 4. Pedidos ↔ Estoque/Lotes — consolidado

O saldo operacional permanece em unidades individuais.

Forma de retirada:

```text
UNITARIO
KIT
CAIXA
GARRAFA
GALAO
```

Compatibilidade:

```text
UNITARIO
→ lote UNITARIO ou lote fracionável

KIT/CAIXA/GARRAFA/GALAO
→ mesmo tipo
→ mesmo multiplicador
```

Fluxo:

```text
solicitante escolhe forma realmente disponível
→ backend valida
→ gestão aprova
→ FEFO/FIFO seleciona os lotes compatíveis
→ movimentações registram cada lote utilizado
→ pedido entregue pode mostrar os lotes usados
→ lote pode mostrar histórico de saídas
```

---

# 5. Estoque e Lotes — concluído

Principais entregas:

```text
✅ saldo consolidado em unidades
✅ entrada com embalagem/multiplicador
✅ Código SGL automático e imutável
✅ modal do lote
✅ edição segura
✅ fracionamento false → true, sem retorno
✅ FIFO/FEFO
✅ descarte por vencimento
✅ busca e filtros
✅ status VÁLIDO / PRÓXIMO / VENCIDO / ESGOTADO
✅ histórico de saída por lote
✅ rastreabilidade com pedido/solicitante
```

Código SGL:

```text
LOT-<CODIGO_REFERENCIA_PRODUTO>-<SEQUENCIAL>
```

---

# 6. Movimentações — concluído

Rota:

```text
/movimentacoes
```

A interface possui:

```text
breadcrumb
resumos de movimentação
busca
filtros
atualização
Tabela com detalhes expansíveis
```

Campos principais:

```text
Data
Produto
Tipo
Quantidade
Lote
Origem
Responsável
Saldo
Laboratório
Pedido
Solicitante
Observação
```

Cores semânticas aprovadas:

```text
ENTRADA   → azul
SAÍDA     → vermelho
DESCARTE  → amarelo
```

Pedidos entregues **não possuem relatório exclusivo**. A visão equivalente deve ser feita pelo relatório de Movimentações usando, quando aplicável:

```text
Origem = PEDIDO
Tipo = SAÍDA
```

---

# 7. Central de Relatórios — concluída

Rota:

```text
/relatorios
```

UX aprovada:

```text
1. escolher relatório
2. definir filtros
3. visualizar prévia
4. exportar PDF ou Excel
```

Relatórios atuais:

```text
Estagiários             ✅
Produtos                ✅
Movimentações           ✅
Resumo operacional      ✅
Estoque e lotes         ✅
Resíduos                🟡 reservado; aguarda integração do módulo
Fiscalização            ✅
```

Foi removido:

```text
Pedidos entregues como relatório próprio
```

---

# 8. Relatório de Estagiários

Permite consultar:

```text
todos
ativos
inativos
por laboratório
por período de vínculo
```

Prévia apresenta:

```text
nome/email
laboratório
unidade
bolsa
início
fim
situação
```

Filtros auxiliares de bolsa/busca fazem parte da UX; ao evoluir exportações/filtros no futuro, garantir sempre que qualquer filtro utilizado na exportação esteja refletido no backend.

---

# 9. Relatório de Produtos

Objetivo: visão geral do catálogo.

Filtros:

```text
situação
fiscalizado
perecível
risco
órgão fiscalizador
```

Resumo:

```text
Produtos
Ativos
Inativos
Fiscalizados
Perecíveis
Com risco
```

A existência deste relatório não elimina a necessidade do CRUD em Administração.

---

# 10. Relatório de Movimentações

Filtros:

```text
tipo
origem
período
produto
laboratório
responsável
lote
```

Resumo:

```text
Movimentações
Entradas
Saídas
Devoluções
Descartes
Ajustes
```

A tabela mantém rastreabilidade por lote, solicitante e pedido quando disponíveis.

---

# 11. Resumo Operacional

Objetivo: leitura gerencial rápida.

Apresenta:

```text
total de movimentações
entradas
saídas
descartes
produtos movimentados
lotes movimentados
principais entradas
principais saídas
lotes mais movimentados
```

Filtros:

```text
produto
período
Top 5 / Top 10 / Top 20
```

---

# 12. Relatório de Estoque e Lotes

Filtros:

```text
unidade
produto
situação do estoque
nível do estoque
situação do lote
janela de vencimento
```

Situações:

```text
VALIDO
PROXIMO_VENCIMENTO
VENCIDO
SEM_VALIDADE
ESGOTADO
INATIVO
```

Prévia dividida em:

```text
Posição de estoque
Lotes
```

Destaques visuais:

```text
válido/normal        → verde
próximo vencimento   → amarelo
vencido/abaixo mínimo→ vermelho
neutro/inativo       → cinza
```

---

# 13. Fiscalização — concluída

O relatório utiliza somente produtos explicitamente classificados como fiscalizados no backend.

Filtros:

```text
produto fiscalizado
órgão fiscalizador
unidade
período das movimentações
janela de vencimento
```

Resumo:

```text
Produtos fiscalizados
Saldo atual
Lotes ativos
Lotes vencidos
Próximos do vencimento
Entradas
Saídas
```

Seções:

```text
Produtos controlados
Rastreabilidade de movimentações
```

Rastreabilidade pode apresentar:

```text
produto
órgão
saldo
lote
validade
tipo de movimentação
quantidade
laboratório
projeto
solicitante
pedido
responsável
saldo após operação
```

---

# 14. Exportação PDF / Excel — concluída e validada

Branches de desenvolvimento:

```text
backend  → feat/relatorios-exportacao
frontend → feat/relatorios-exportacao-interface
```

Regra central:

```text
um relatório selecionado
→ uma prévia
→ um PDF ou XLSX daquele relatório
```

Não existe exportação de vários relatórios em lote.

A exportação utiliza a **última prévia concluída**, evitando que o usuário altere filtros e baixe um resultado diferente sem visualizar novamente.

Trocar de relatório ou limpar filtros invalida a exportação anterior.

## PDF

Foco em impressão:

```text
logo SGL no canto superior esquerdo
A4
orientação adaptada ao conteúdo
paisagem para tabelas largas
margens compactas
quebra de texto
cabeçalhos repetidos
resumo + filtros
paginação
```

## Excel/XLSX

```text
logo SGL no canto superior esquerdo
título + filtros
resumo
cabeçalho congelado
autofiltro
quebra de texto
colunas dimensionadas
A4
ajuste para uma página de largura
paisagem quando necessário
```

Relatórios compostos permanecem um único arquivo, com abas internas quando útil:

```text
Estoque e Lotes.xlsx
├── Posição de estoque
└── Lotes

Fiscalização.xlsx
├── Produtos controlados
└── Rastreabilidade
```

Validação manual em 28/08/2026:

```text
PDF     ✅
Excel   ✅
logo    ✅
fluxo de exportação ✅
```

---

# 15. Resíduos

Há dois pontos distintos:

```text
Gestão → Resíduos
Solicitante → Informar resíduos
```

Não renomear Gestão para “Informar resíduos”.

Decisão de domínio:

```text
Produto = catálogo/estoque
Resíduo = material gerado pelo laboratório
```

O resíduo pode ser composto por um ou vários produtos/reagentes sem alterar automaticamente o estoque desses produtos.

Fluxo:

```text
laboratório gera
→ informa conteúdo/uso/recipiente/riscos
→ gestor recebe e ficha
→ confirma riscos e rotula
→ armazena temporariamente
→ despacha/destina
```

Branch atual do módulo:

```text
feat/gestao-residuos
```

Depois da integração:

```text
ativar tela operacional
→ ativar relatório Resíduos
→ adicionar PDF/XLSX de Resíduos
```

---

# 16. Administração / Cadastros — PRÓXIMA ETAPA

Cadastros previstos:

```text
Produtos
Laboratórios
Projetos
Usuários
Estagiários
Tipos de unidade/embalagem
```

**Unidade institucional não terá CRUD manual**; futuramente vem da integração corporativa.

## Ordem recomendada

```text
1. Produtos
2. Laboratórios
3. Projetos
4. Usuários
5. Estagiários
6. Tipos de unidade/embalagem, quando o backend estiver preparado
```

### Produtos

O formulário deve contemplar:

```text
nome
código de referência
descrição
unidade de medida
localização
risco
perecibilidade
armazenamento
fiscalizado
órgãos fiscalizadores
observação de fiscalização
ativo
```

### Estagiários

Previsto como cadastro obrigatório.

Mostrar pelo menos:

```text
nome
identidade corporativa
unidade read-only
laboratório
vínculo
situação
período
bolsa
observações
```

### Tipos de embalagem

Hoje o backend ainda usa enum rígido.

Futuro desejado:

```text
cadastrar
editar
inativar
reativar
não excluir fisicamente se já houver histórico
```

---

# 17. Roadmap oficial atualizado

```text
Etapa 0 — Handoff backend → frontend                       ✅
Etapa 1 — Fundação visual/técnica                          ✅
Etapa 2 — Bootstrap técnico                                ✅
Etapa 3 — Interfaces iniciais                              ✅
  Login                                                     ✅
  Pedidos Solicitante                                      ✅
  Shell Gestão/Admin + Pedidos Gestão                      ✅

Refino Pedidos ↔ Estoque/Lotes                             ✅
Etapa 4 — Estoque / Lotes                                  ✅
Etapa 5 — Produtos operacional                             ↪ consolidado em Estoque + futuro Cadastro de Produtos
          Rotulagem                                        ⏳ manter como necessidade futura de Produto/Lote
Etapa 6 — Movimentações                                    ✅
Etapa 7 — Relatórios / Fiscalização                        ✅
          Exportação PDF/XLSX                              ✅
          Documentos/upload                                ⏳
          Resíduos em Relatórios                           ⏳ após integração
Etapa 8 — Administração / Cadastros                        🟡 PRÓXIMA
  Produtos                                                  ⏳
  Laboratórios                                              ⏳
  Projetos                                                  ⏳
  Usuários                                                  ⏳
  Estagiários                                               ⏳ obrigatório
  Tipos de unidade / embalagem                             ⏳ backend futuro
Etapa complementar — Resíduos operacional                  🟡 integrar branch existente
Etapa 9 — Dashboards finais / robustez / 404               ⏳
Etapa 10 — Autenticação / autorização / auditoria          ⏳
```

---

# 18. Rotas atuais e previstas

```text
/login                         ✅
/meus-pedidos                  ✅
/pedidos/novo                  ✅
/pedidos                       ✅
/estoque                       ✅
/estoque/:id                   ✅
/movimentacoes                 ✅
/relatorios                    ✅

/cadastros/produtos            ⏳
/cadastros/laboratorios        ⏳
/cadastros/projetos            ⏳
/cadastros/usuarios            ⏳
/cadastros/estagiarios         ⏳
/cadastros/estagiarios/:id     ⏳
/cadastros/tipos-unidade       ⏳ futuro

/residuos                      ⏳ integrar
/informar-residuo              ⏳ integrar conforme fluxo solicitante

/:pathMatch(.*)*               ⏳ página 404 customizada
```

---

# 19. Alertas e robustez futura

Ainda previstos:

```text
Dashboard final
alertas operacionais consolidados
estoque baixo
lotes próximos do vencimento
lotes vencidos
pedidos pendentes/urgentes
página 404 customizada
estados de erro mais robustos
acessibilidade/motion final
```

---

# 20. Autenticação / autorização / auditoria

Decisão preservada:

```text
frontend funcional principal
→ concluir Administração/Resíduos/robustez
→ autenticação/autorização/auditoria local definitiva
→ integração corporativa futura
```

---

# 21. Checkpoint de 28/08/2026

Trabalho concluído e validado no dia:

```text
✅ Movimentações já consolidada e utilizada como base de rastreabilidade
✅ Central visual de Relatórios aprovada
✅ Relatório de Estagiários
✅ Relatório de Produtos
✅ Relatório de Movimentações
✅ Resumo Operacional
✅ Relatório de Estoque e Lotes
✅ Fiscalização de produtos controlados
✅ Produtos fiscalizados diferenciados de risco/perecibilidade
✅ Pedidos entregues removido como relatório próprio
✅ Pedidos tratados como recorte de Movimentações
✅ Resíduos adicionado como categoria futura de relatório
✅ PDF individual por relatório
✅ Excel individual por relatório
✅ arquivos preparados para impressão
✅ logo SGL no canto superior esquerdo dos arquivos
✅ exportação vinculada à última prévia
✅ testes manuais do fluxo aprovados pelo usuário
```

PRs do bloco de Relatórios já integrados antes do fechamento de exportação:

```text
Backend  → PR #8  — feat/relatorios
Frontend → PR #13 — feat/relatorios-interface
```

---

# 22. Próximo passo exato

Após o merge das branches de exportação:

```text
1. iniciar Administração / Cadastros
2. começar por Produtos
   └── incluir fiscalização desde criação/edição
3. seguir Laboratórios → Projetos → Usuários → Estagiários
4. integrar feat/gestao-residuos
5. ativar relatório/exportação de Resíduos
6. voltar para Documentos/Rotulagem que ainda estiverem pendentes
7. Dashboard final / robustez / 404
8. autenticação/autorização/auditoria
```

---

# 23. Regra central

**O frontend simplifica a operação para o usuário; o backend continua responsável por integridade, FIFO/FEFO, concorrência, rastreabilidade, regras de fiscalização, composição de relatórios e geração oficial dos arquivos.**
