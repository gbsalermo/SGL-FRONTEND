# Plano de Testes — Primeiro Protótipo Congelado do SGL

**Execução:** somente após o congelamento funcional do primeiro protótipo.  
**Objetivo:** testar o sistema inteiro por perfil, unidade, laboratório, fluxo, erro e integração antes de considerar o protótipo final homologado.

## 1. Princípios

A homologação deve cobrir:

```text
caminho feliz
caminhos alternativos
erros de entrada
regras de negócio
permissões
isolamento entre unidades/laboratórios
rastreabilidade
persistência
responsividade
impressão/exportação
recuperação de erro
```

Cada cenário deve registrar:

```text
perfil usado
unidade
laboratório
pré-condições
passos
resultado esperado
resultado obtido
status PASSOU / FALHOU
 evidência quando necessário
```

## 2. Perfis a simular

```text
ADMINISTRADOR
GESTOR
ESTAGIARIO
PESQUISADOR
ANALISTA
TECNICO
```

Testar também usuário inativo e usuário sem vínculo esperado.

## 3. Isolamento entre unidades e laboratórios

Criar pelo menos duas unidades e múltiplos laboratórios para validar fronteiras.

Cenários mínimos:

- usuário da Unidade A tenta visualizar estoque da Unidade B;
- usuário da Unidade A tenta operar lote da Unidade B;
- usuário tenta consultar pedido de laboratório sem vínculo;
- gestor consulta dados permitidos e dados fora do seu escopo;
- administrador verifica visão global quando essa for a regra definida;
- usuário tenta associar projeto de outro laboratório a pedido/resíduo;
- filtros e relatórios não vazam dados de outra unidade quando não permitido.

Os resultados finais dependem da matriz de permissões aprovada antes do freeze.

## 4. Login, sessão e navegação

- login válido por todos os perfis;
- usuário inativo;
- logout;
- persistência/reentrada de sessão;
- acesso direto por URL;
- rota inexistente `/5555` abre 404;
- usuário comum tenta URL de Gestão;
- Gestor tenta rota exclusiva de Administração;
- refresh em rota interna;
- retorno pelo botão do navegador;
- tema claro/escuro persiste quando definido.

## 5. Pedidos — usuário comum

Testar cada etapa:

```text
criar pedido
selecionar laboratório/projeto permitido
buscar produto
selecionar forma de retirada
quantidade válida
quantidade inválida
pedido normal
pedido urgente
acompanhar status
cancelar quando permitido
visualizar pedido entregue
visualizar lotes usados
```

Cenários de estoque:

- produto sem saldo;
- somente lote vencido;
- kit indisponível;
- retirada unitária de lote fracionável;
- retirada unitária proibida em embalagem fechada;
- múltiplos lotes para completar pedido.

## 6. Pedidos — Gestão

- listar por cada status;
- analisar pedido normal e urgente;
- aprovar total;
- aprovar parcial quando permitido;
- rejeitar;
- entregar;
- cancelar aprovado e conferir restauração dos lotes;
- garantir que entrega não baixa estoque pela segunda vez;
- conferir FIFO para não perecível;
- conferir FEFO para perecível;
- validar concorrência com duas aprovações simultâneas;
- conferir histórico/rastreabilidade do lote usado.

## 7. Estoque e lotes

- criar entrada de lote;
- Código SGL automático;
- número de lote do fornecedor;
- embalagem e multiplicador;
- fracionamento `false → true`;
- bloquear `true → false`;
- editar campos permitidos;
- bloquear alteração de campos históricos;
- estoque consolidado igual à soma dos lotes;
- estoque mínimo;
- lote válido;
- próximo do vencimento;
- vencido;
- esgotado;
- descarte por vencimento;
- histórico de saídas do lote;
- filtros e busca;
- tentar operar lote de outra unidade conforme regras de permissão.

## 8. Movimentações

- ENTRADA;
- SAIDA;
- DESCARTE;
- origem PEDIDO;
- filtros por produto/lote/laboratório/usuário/período;
- vínculo com solicitante e executor;
- saldo anterior/novo quando aplicável;
- consistência com Estoque/Lote/Pedido.

## 9. Resíduos — usuário comum

### Resíduo simples

- informar resíduo com um componente livre;
- informar resíduo referenciando Produto cadastrado;
- confirmar que o estoque do Produto não muda.

### Mistura

- informar vários componentes;
- produto cadastrado + componente livre;
- componente principal;
- quantidade/concentração aproximada;
- riscos informados;
- projeto opcional permitido;
- bloquear projeto de outro laboratório.

### Acompanhamento

- visualizar `INFORMADO`;
- acompanhar `EM_ANALISE`;
- visualizar classificação confirmada sem apagar a declaração original;
- acompanhar liberação, armazenamento e despacho.

## 10. Resíduos — Gestão

Testar sequência completa:

```text
INFORMADO
→ receber
EM_ANALISE
→ analisar/liberar
LIBERADO_PARA_ARMAZENAMENTO
→ imprimir/consultar rótulo
→ armazenar
ARMAZENADO_TEMPORARIAMENTE
→ despachar
DESPACHADO
```

Cenários obrigatórios:

- confirmar risco igual ao informado;
- corrigir risco informado;
- múltiplos riscos;
- definir local temporário;
- definir destino previsto;
- destino final diferente do previsto;
- tentar transição fora de ordem;
- usuário comum tenta executar ação de Gestão;
- histórico registra responsável, ação, status e data/hora;
- QR/código identifica o resíduo correto;
- **impressão do rótulo de resíduo funciona e contém os dados esperados**;
- rótulo não disponível antes da liberação;
- componente ligado a Produto não altera EstoqueCentral/Lote/Movimentação.

## 11. Estagiários

- cadastrar;
- editar;
- vínculo com laboratório;
- unidade coerente;
- datas válidas/inválidas;
- tipo de bolsa/vínculo;
- listar ativos/inativos;
- encerrar estágio;
- impedir operação indevida sobre estágio encerrado quando aplicável;
- relatório de Estagiários reflete cadastro e situação.

## 12. Administração / Cadastros

### Produtos

- criar/editar/inativar;
- risco/perecibilidade;
- produto fiscalizado e não fiscalizado;
- exigir órgão quando fiscalizado;
- remover órgãos ao desmarcar fiscalização;
- estoque mínimo.

### Laboratórios

- criar/editar/inativar conforme contrato;
- vínculo com unidade;
- responsável;
- impedir associações inválidas.

### Projetos

- criar/editar/inativar;
- laboratório correto;
- datas;
- responsável.

### Usuários

- criar/editar/inativar;
- perfil;
- unidade/laboratório;
- tentar combinações inválidas.

## 13. Relatórios

Para cada relatório:

```text
sem filtro
cada filtro isolado
combinação de filtros
resultado vazio
resultado com muitos registros
prévia
PDF
XLSX
```

Relatórios:

- Estagiários;
- Produtos;
- Movimentações;
- Resumo operacional;
- Estoque e lotes;
- Fiscalização;
- Resíduos.

Validar que prévia, PDF e Excel representam o mesmo conjunto de dados.

## 14. PDF / XLSX / impressão

- logo no arquivo;
- nome do relatório;
- filtros;
- data de geração;
- cabeçalhos;
- quebra de página;
- paisagem/retrato adequados;
- dados extensos não extrapolam de forma inutilizável;
- XLSX abre sem reparo;
- múltiplas abas somente dentro do mesmo relatório;
- impressão física ou preview de impressão legível.

## 15. Fiscalização

- produto não fiscalizado não entra;
- produto fiscalizado aparece;
- filtro por órgão;
- múltiplos órgãos;
- saldo/lotes;
- vencimento;
- entradas/saídas;
- laboratório/projeto/solicitante/pedido quando disponíveis;
- PDF/XLSX.

## 16. Dashboard e alertas

- indicadores batem com dados operacionais;
- pedido pendente;
- pedido urgente;
- estoque baixo;
- lote próximo do vencimento;
- lote vencido;
- resíduo aguardando recebimento/análise/armazenamento/despacho;
- alerta desaparece quando condição deixa de existir;
- perfil sem permissão não recebe link/ação indevida.

## 17. Aparência e responsividade

Testar tema claro e escuro em:

- login;
- pedidos;
- estoque/lotes;
- movimentações;
- resíduos;
- relatórios;
- cadastros;
- dashboard;
- 404.

Resoluções mínimas:

```text
desktop amplo
desktop/notebook médio
tablet
mobile estreito quando a tela for suportada
```

Verificar tabelas, modais, menus, sidebar, rolagem e impressão.

## 18. Erros e integridade

- backend indisponível;
- timeout/erro HTTP;
- 400 regra de negócio;
- 404 recurso inexistente contextual;
- 409 conflito/concorrência;
- duplo clique em ações críticas;
- refresh durante fluxo;
- formulário incompleto;
- UUID inexistente;
- tentativa de operação em registro inativo;
- nenhuma falha deixa saldo/status parcial inconsistente.

## 19. Critério de aprovação

O primeiro protótipo só será considerado homologado quando:

```text
100% dos fluxos críticos executados
nenhuma falha crítica aberta
nenhuma quebra de isolamento/permissão conhecida
nenhuma inconsistência de estoque/lote/pedido/resíduo conhecida
rótulos e exportações validados
problemas médios/baixos registrados e classificados
regressão dos fluxos corrigidos concluída
```

A homologação final deve produzir um checklist de execução e uma lista formal de correções pós-teste.