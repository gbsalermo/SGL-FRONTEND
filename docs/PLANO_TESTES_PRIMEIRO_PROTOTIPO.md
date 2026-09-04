# Plano de Testes Integrados — SGL

**Revisado em:** 04/09/2026  
**Estado do produto:** primeiro protótipo funcional aprovado.  
**Execução:** reutilizar/adaptar este plano na homologação formal posterior ao bloco atual de pré-produção.  
**Objetivo:** validar o sistema inteiro por perfil, Unidade, Laboratório, fluxo, erro e integração antes da entrada no ciclo definitivo de produção.

> Este documento não é um gate pendente do protótipo já aprovado. Ele é uma bateria de homologação para o roadmap formal posterior.

---

## 1. Princípios

A homologação deve cobrir:

```text
caminho feliz
caminhos alternativos
erros de entrada
regras de negócio
permissões definidas na matriz futura
isolamento entre Unidades/Laboratórios
rastreabilidade
persistência
responsividade
impressão/exportação
recuperação de erro
```

Cada cenário deve registrar:

```text
perfil usado
Unidade
Laboratório
pré-condições
passos
resultado esperado
resultado obtido
status PASSOU / FALHOU
evidência quando necessária
```

---

## 2. Perfis a simular

```text
ADMINISTRADOR
GESTOR
ESTAGIARIO
PESQUISADOR
ANALISTA
TECNICO
```

Testar também usuário inativo e vínculos/contextos inválidos.

---

## 3. Isolamento entre Unidades e Laboratórios

Usar pelo menos duas Unidades e múltiplos Laboratórios para validar fronteiras.

Cenários mínimos:

- usuário da Unidade A tenta visualizar estoque da Unidade B;
- usuário da Unidade A tenta operar lote da Unidade B;
- usuário da Unidade A tenta consultar pedido/resíduo da Unidade B;
- filtros, dashboards e relatórios não vazam dados de outra Unidade;
- associações de Laboratório/Projeto/Usuário de outra Unidade são bloqueadas;
- alteração do header `X-SGL-Unidade-Id` é tratada conforme a estratégia de segurança vigente no momento da homologação;
- depois da autenticação definitiva, tenant deve ser derivado da identidade confiável e não de valor livremente controlado pelo cliente.

A matriz futura definirá diferenças de ação entre perfis **dentro do escopo institucional permitido**, sem eliminar o princípio de isolamento entre Unidades.

---

## 4. Login, sessão e navegação

No estado DEV atual:

- login funcional por todos os perfis;
- usuário inativo;
- logout;
- persistência/reentrada de sessão;
- expiração automática após 5h;
- acesso direto por URL;
- rota inexistente `/5555` abre 404;
- usuário comum tenta URL de Gestão;
- Gestor tenta rota exclusiva de Administração;
- refresh em rota interna;
- retorno pelo botão do navegador;
- contexto de Unidade permanece coerente na sessão e nas requisições.

Quando a autenticação definitiva existir, substituir os cenários de senha/sessão DEV pelos contratos reais de autenticação, autorização e SSO.

---

## 5. Pedidos — Solicitante

Testar:

```text
criar pedido
selecionar Laboratório/Projeto permitido
buscar Produto
selecionar forma de retirada
quantidade válida
quantidade inválida
pedido normal
pedido urgente
acompanhar status
cancelar quando permitido
visualizar pedido entregue
visualizar rastreabilidade disponível
```

Cenários de estoque:

- produto sem saldo;
- somente lote vencido;
- kit indisponível;
- retirada unitária de lote fracionável;
- retirada unitária proibida em embalagem fechada;
- múltiplos lotes para completar pedido.

---

## 6. Pedidos — Gestão

- listar por status;
- analisar pedido normal e urgente;
- aprovar total;
- aprovar parcial quando permitido pelo contrato atual;
- rejeitar;
- entregar;
- cancelar aprovado e conferir restauração dos lotes exatos utilizados;
- garantir que entrega não baixa estoque pela segunda vez;
- conferir FIFO para não perecível;
- conferir FEFO para perecível;
- validar concorrência com aprovações simultâneas;
- conferir histórico/rastreabilidade do lote usado;
- conferir que urgência não altera FIFO/FEFO.

Não exigir em teste uma movimentação `DEVOLUCAO` específica no cancelamento enquanto esse comportamento não for um contrato garantido pela implementação. O requisito funcional atual é a restauração correta dos lotes utilizados.

---

## 7. Estoque e Lotes

- registrar entrada de lote;
- Código SGL automático;
- número de lote do fornecedor;
- embalagem e multiplicador;
- fracionamento `false → true`;
- bloquear `true → false`;
- editar campos permitidos;
- preservar campos históricos;
- estoque consolidado coerente com lotes;
- estoque mínimo;
- lote válido;
- próximo do vencimento;
- vencido;
- esgotado;
- descarte por vencimento;
- histórico de saídas do lote;
- filtros e busca;
- bloqueio de operações fora da Unidade atual.

---

## 8. Movimentações

Validar tipos/origens existentes no contrato vigente e, no mínimo:

- ENTRADA;
- SAIDA;
- DESCARTE;
- origem PEDIDO;
- filtros disponíveis;
- vínculo com Produto/Lote/usuários envolvidos quando aplicável;
- saldo anterior/novo quando aplicável;
- consistência com Estoque/Lote/Pedido;
- ausência de registros de outra Unidade.

---

## 9. Resíduos — Solicitante

### Resíduo simples

- informar resíduo com componente livre;
- informar resíduo referenciando Produto cadastrado;
- confirmar que o estoque do Produto não muda;
- confirmar geração/exibição do Código SGL desde o registro inicial.

### Mistura

- vários componentes;
- Produto cadastrado + componente livre;
- componente principal;
- quantidade/concentração aproximada;
- riscos informados;
- Projeto opcional permitido;
- bloquear Projeto de outro contexto institucional.

### Acompanhamento

- visualizar `INFORMADO`;
- acompanhar `EM_ANALISE`;
- visualizar classificação confirmada preservando declaração original;
- acompanhar liberação, armazenamento e despacho.

---

## 10. Resíduos — Gestão

Testar sequência completa:

```text
INFORMADO
→ receber
EM_ANALISE
→ analisar/liberar
LIBERADO_PARA_ARMAZENAMENTO
→ consultar/imprimir rótulo conforme fluxo atual
→ armazenar
ARMAZENADO_TEMPORARIAMENTE
→ despachar
DESPACHADO
```

Cenários:

- confirmar risco igual ao informado;
- corrigir risco informado;
- múltiplos riscos;
- definir local temporário;
- definir destino previsto;
- destino final diferente do previsto quando suportado;
- tentar transição fora de ordem;
- usuário sem permissão tenta executar ação de Gestão;
- histórico registra responsável, ação, status e data/hora conforme contrato;
- Código SGL identifica o resíduo correto;
- impressão do rótulo contém os dados esperados;
- **não exigir QR Code visual**, pois ele não faz parte do rótulo atual;
- componente ligado a Produto não altera EstoqueCentral/Lote/Movimentação;
- dados permanecem restritos à Unidade.

---

## 11. Estagiários

- cadastrar;
- editar;
- vínculo com Laboratório;
- Unidade coerente;
- datas válidas/inválidas;
- tipo de vínculo;
- listar ativos/inativos;
- encerrar estágio;
- impedir encerramento repetido ou data anterior ao início;
- impedir vínculo incompatível com Unidade;
- relatório de Estagiários reflete cadastro e situação;
- perfil `ESTAGIARIO` ativo segue as restrições definidas pelo domínio/administração.

---

## 12. Administração / Cadastros

### Produtos

- criar/editar/inativar conforme contrato;
- risco/perecibilidade;
- produto fiscalizado e não fiscalizado;
- exigir órgão quando fiscalizado;
- limpar órgãos/observações conforme regra ao desmarcar fiscalização;
- estoque mínimo quando aplicável ao contrato de catálogo/estoque.

### Laboratórios

- criar/editar/inativar conforme contrato;
- vínculo com Unidade atual;
- responsável da mesma Unidade;
- impedir associações inválidas.

### Projetos

- criar/editar/inativar;
- Laboratório correto;
- datas e responsável conforme contrato;
- impedir vínculo fora da Unidade.

### Permissões / Usuários existentes

O frontend **não cria usuários manualmente** na central administrativa.

Testar:

- listar/consultar usuários existentes da Unidade;
- alterar perfil permitido;
- bloquear combinações inválidas;
- proteger Administrador da sessão contra auto-rebaixamento quando a regra visual estiver vigente;
- impedir remoção indevida do perfil `ESTAGIARIO` enquanto houver vínculo ativo;
- garantir ausência de CRUD manual normal de Unidade.

---

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

Relatórios atuais:

- Estagiários;
- Produtos;
- Movimentações;
- Resumo operacional;
- Estoque e lotes;
- Fiscalização;
- Resíduos;
- Pessoas por laboratório.

Validar:

- prévia, PDF e XLSX representam o mesmo conjunto de dados;
- filtros da Unidade atual são respeitados;
- Pedidos entregues continuam sendo recorte de Movimentações, não relatório próprio.

---

## 14. PDF / XLSX / impressão

- logo quando previsto;
- nome do relatório;
- filtros;
- data de geração;
- cabeçalhos;
- quebra de página;
- orientação adequada;
- dados extensos legíveis;
- XLSX abre sem reparo;
- múltiplas abas somente quando fizerem parte do mesmo relatório;
- preview/impressão legível;
- rótulos de Produto e Resíduo imprimíveis.

---

## 15. Fiscalização

- produto não fiscalizado não entra no recorte específico;
- produto fiscalizado aparece;
- filtro por órgão;
- múltiplos órgãos;
- saldo/lotes quando aplicável;
- vencimento;
- entradas/saídas;
- contexto de Laboratório/Projeto/Solicitante/Pedido quando disponível;
- PDF/XLSX;
- isolamento por Unidade.

---

## 16. Dashboard, alertas e busca

- indicadores batem com dados operacionais;
- pedido pendente;
- pedido urgente;
- estoque baixo;
- lote próximo do vencimento;
- lote vencido;
- resíduos `INFORMADO`/`EM_ANALISE` nos indicadores correspondentes;
- movimentações recentes;
- resumo por Laboratório;
- alerta desaparece quando condição deixa de existir;
- perfil sem permissão não recebe ação indevida;
- clique de card/alerta abre contexto correto;
- busca global encontra/navega somente dentro do escopo permitido;
- nenhum desses componentes vaza dados de outra Unidade.

---

## 17. Aparência e responsividade

### Interfaces autenticadas

Testar tema claro e escuro em:

- dashboards;
- pedidos;
- estoque/lotes;
- movimentações;
- resíduos;
- relatórios;
- cadastros;
- estagiários;
- rótulos quando aplicável;
- 404 quando exibida dentro do comportamento atual.

### Login

A tela de login é visualmente independente do tema das interfaces autenticadas. Testar que alternância/persistência de dark mode **não altera indevidamente o login**.

Resoluções conforme suporte real do produto:

```text
desktop amplo
desktop/notebook médio
tablet
mobile quando a tela for suportada
```

Verificar tabelas, modais, menus, sidebar, rolagem e impressão.

---

## 18. Erros e integridade

- backend indisponível;
- timeout/erro HTTP;
- 400 de validação/regra de negócio;
- 404 de recurso contextual;
- 409 conflito/concorrência;
- header de Unidade inválido;
- duplo clique em ações críticas;
- refresh durante fluxo;
- formulário incompleto;
- UUID inexistente;
- tentativa de operação em registro inativo;
- tentativa de acessar recurso de outra Unidade;
- nenhuma falha deixa saldo/status parcialmente inconsistente.

---

## 19. Critério da homologação formal futura

Quando este plano for executado no roadmap formal, considerar a homologação concluída quando:

```text
fluxos críticos executados
nenhuma falha crítica aberta
nenhuma quebra conhecida de isolamento/permissão
nenhuma inconsistência conhecida de estoque/lote/pedido/resíduo
rótulos e exportações validados
problemas não críticos registrados e classificados
regressão das correções concluída
```

A execução deve produzir checklist/evidências e lista formal de correções.

---

## 20. Relação com a fase atual

```text
AGORA
pré-produção pós-aprovação
→ limpeza documental
→ planejamento
→ ajustes/refinamentos
→ estabilização

DEPOIS
matriz de permissões
→ congelamento funcional
→ executar/adaptar este plano
→ homologação integrada final
```

Não usar este documento para bloquear melhorias justificadas que ainda pertencem ao bloco atual de pré-produção.
