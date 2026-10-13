
# Etapa 7.4 — Validação integrada de Soluções pela interface

**Decisão:** a antiga 7.5 (Frontend) foi antecipada para **7.4**, para testar o ciclo solicitante ↔ gestor ↔ estoque. O antigo contexto operacional da 7.4 será desenvolvido na **7.5**.

**Estado:** implementação frontend publicada na branch `collab/etapa-7-unidades-solucoes-contexto`. Backend da 7.3: suite Maven e inicialização local confirmadas como verdes pelo desenvolvedor. **Build do frontend e smoke funcional não verificados no momento da publicação**.

## Preparar o ambiente

Usar a branch `collab/etapa-7-unidades-solucoes-contexto` tanto no Backend quanto no Frontend. Executar o backend no perfil local DEV, com o banco correspondente e a migration V37. Não repetir `repair` ou reset do banco sem diagnóstico.

No frontend:

```bash
git fetch github
git switch collab/etapa-7-unidades-solucoes-contexto
git pull --ff-only github collab/etapa-7-unidades-solucoes-contexto
npm ci
npm run build
npm run dev
```

A configuração DEV padrão aponta para `http://localhost:8080/api`, salvo variável `VITE_API_BASE_URL`. Utilizar sessão com Unidade definida (`X-SGL-Unidade-Id` é enviado automaticamente pelo frontend).

**Menus e rotas:**

- Solicitante: **Minhas soluções** (`/minhas-solucoes`) e **Solicitar solução** (`/solucoes/solicitar?nova=1`);
- Gestor/Administrador: **Soluções** (`/solucoes`) e **Solicitar solução** (`/solucoes/nova?nova=1`, requer laboratório/Projeto vinculado ao usuário);
- Gestor: aba **Solicitações** (análise/entrega/cancelamento) e aba **Catálogo de soluções** (modelos reutilizáveis).

## Testes manuais de ida e volta

| ID | Ação no sistema | Resultado esperado |
|---|---|---|
| S01 | Entrar como Gestor e abrir Soluções → Catálogo → Cadastrar modelo | Exibir editor de nome, descrição, componentes, quantidade e unidade |
| S02 | Cadastrar modelo de 2 Produtos ativos com unidades compatíveis | Modelo salvo na mesma Unidade e aparece na lista; sem movimentação de estoque |
| S03 | Entrar como solicitante com laboratório e Projeto válidos → Solicitar solução → Catálogo | Modelo padrão cadastrado aparece como opção |
| S04 | Selecionar Projeto, modelo e enviar | Pedido `SOLUCAO` criado `PENDENTE` com itens correspondentes |
| S05 | Criar outra solicitação com composição personalizada | Pedido `PENDENTE`; composição não entra no catálogo automaticamente |
| S06 | Gestor → Soluções → Solicitações → aprovar | Todos os componentes aprovados integralmente; status `EM_PREPARACAO`; movimentações `SAIDA` vinculadas ao Pedido |
| S07 | Comparar estoque antes e após a aprovação | Baixa **uma única vez** por Produto, com saldos coerentes de Lote/Recipiente |
| S08 | Solicitante abre Minhas soluções | Vê o próprio Pedido em `EM_PREPARACAO` sem acesso a pedidos de outras pessoas |
| S09 | Gestor → Confirmar entrega | Pedido `ENTREGUE` e recebimento registrado, **sem nova baixa** dos mesmos Produtos |
| S10 | Nova Solução: aprovar → cancelar marcando **Não preparada** | Pedido `CANCELADO`; saídas revertidas; saldo recomposto quando não houve movimentação concorrente no Recipiente |
| S11 | Outra Solução: aprovar → cancelar marcando **Já preparada** | Pedido `CANCELADO`; consumo definitivo; **ingredientes não voltam** ao estoque |
| S12 | Cancelar uma Solução ainda `PENDENTE` | `CANCELADO`, sem tentativa de devolver saída inexistente |
| S13 | Gestor → Solicitação personalizada → Salvar no catálogo | Novo modelo criado com mesma composição; pedido original não modificado |
| S14 | Inativar modelo, consultar como solicitante | Modelo inativo não aparece na criação de novos Pedidos, sem perder histórico |
| S15 | Enviar unidades incompatíveis ou repetir Produto no cadastro | Erro de negócio claro, sem alteração de saldos |
| S16 | Navegar pelos Pedidos convencionais dos dois perfis | Pedidos comuns continuam visíveis e Soluções ficam nas seções próprias |
| S17 | Trocar Unidade de contexto por sessão autorizada | Modelos e Pedidos de Solução da primeira Unidade não aparecem na outra |

### Observações operacionais

- **Evitar dados reais** até a verificação funcional. Usar DEV.
- Para os testes S06–S11, conferir a tela de movimentações e o estoque, não apenas a mensagem de sucesso.
- **Concorrência:** a restauração do recipiente é protegida; se o mesmo recipiente sofreu movimentação posterior, a reversão pode ser recusada para evitar sobrescrever o estado físico. Reportar a situação específica para revisão do contrato de standby. Não criar ajustes manuais apenas para forçar o teste a passar.
- A interface de Solicitante permite criar e acompanhar; as decisões de cancelamento são operacionais do Gestor. **Não há workflow independente de "solicitar cancelamento" no backend** neste estágio.
- O cadastro opcional de uma Solução física reaproveitada após cancelamento é feito pelo fluxo de Produto/estoque e **não** é automatizado nesta interface.
- A autenticação atual é temporária em DEV; permissões reais devem ser validadas no backend antes da produção, independente das proteções de rota do Vue.
- Margem de erro: **extra futuro**; nenhum campo ou cálculo de tolerância exigido nestes testes.

## Critérios de conclusão da 7.4

```text
[ ] npm run build verde
[ ] Navegação correta para Solicitante
[ ] Navegação correta para Gestor/Administrador
[ ] S01–S17 validados (ou achados documentados e resolvidos)
[ ] Sem regressão no Pedido comum
[ ] Sem dupla baixa no estoque
[ ] Sem reposição fictícia após preparo
[ ] Documentação sincronizada com resultados
[ ] Merge apenas após autorização expressa
```
