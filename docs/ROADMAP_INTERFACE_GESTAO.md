# Roadmap da Interface de Gestão — SGL

**Atualização:** 27/08/2026  
**Fonte principal de retomada:** `CONTINUIDADE.md`

Este documento registra a sequência operacional aprovada para a interface de Gestão/Admin. Em caso de conflito, a decisão mais recente registrada na continuidade prevalece.

## Sequência atual

```text
Pedidos da Gestão                         ✅ concluído
↓
Estoque / Lotes                           🟡 atual
  ├── visão geral                         ✅
  ├── detalhe/lotes                       🟡
  ├── entrada com apresentação            🟡 validar
  └── descarte por vencimento             ⏳ próximo
↓
Produtos + Rotulagem                      ⏳
↓
Movimentações                             ⏳
↓
Relatórios / Documentos / Fiscalização    ⏳
↓
Demais Cadastros / Administração          ⏳
  └── Interface de Estagiários            ⏳ obrigatória
↓
Dashboards finais / robustez / 404        ⏳
↓
Autenticação / autorização / auditoria    ⏳
```

## 1. Estoque / Lotes — etapa atual

Objetivo: representar a situação física dos materiais da unidade sem misturar apresentações incompatíveis.

### Regra estrutural obrigatória

O sistema separa:

```text
PRODUTO
→ unidade-base de controle estável

LOTE
→ apresentação física variável
→ quantidade de apresentações
→ conteúdo por apresentação
→ fracionável ou não

ESTOQUE CENTRAL
→ saldo consolidado na unidade-base
```

Não criar uma rede global de conversões entre `kit`, `frasco`, `caixa`, `bombona`, `unidade` etc. Cada lote informa apenas quanto sua apresentação representa na unidade-base do produto.

Exemplos:

```text
2 kits × 50 reações = 100 reações
10 avulsas × 1 reação = 10 reações
4 frascos × 500 mL = 2000 mL
1 bombona × 5000 mL = 5000 mL
```

Apresentações diferentes podem coexistir no mesmo produto porque o saldo final usa a mesma unidade-base.

### Fracionamento

```text
fracionável
→ permite retirada parcial da apresentação
→ ex.: retirar 100 mL de um frasco de 500 mL

não fracionável
→ saída somente em apresentação completa
→ ex.: kit fechado de 50 não pode baixar apenas 10
```

O backend deve impedir que um lote não fracionável termine com saldo que não seja múltiplo de seu conteúdo por apresentação.

A futura saída deve permitir trabalhar em unidade-base ou em apresentação completa, mas nunca confundir `10 unidades-base` com `10 kits`.

### Visão geral `/estoque`

Deve mostrar:

```text
Produtos em estoque
Estoque baixo
Zerados
Produtos com lote vencido
```

Tabela principal:

```text
Produto
Código do produto
Unidade
Localização física
Quantidade atual
Mínimo
Situação
Detalhes
```

A quantidade de cada produto é interpretada em sua unidade-base.

### Detalhe `/estoque/:id`

Deve reunir:

```text
produto
código de referência
unidade-base
apresentação padrão
localização
saldo atual
mínimo
lotes
apresentação real de cada lote
validade
quantidade inicial/disponível na unidade-base
entrada de lote
descarte por vencimento
```

### Entrada de lote

Implementada com:

```text
código do lote
apresentação recebida
quantidade de apresentações
conteúdo por apresentação
fracionável
validade
origem
observação
```

A tela deve mostrar antes da confirmação:

```text
quantidade × conteúdo por apresentação = total incorporado ao estoque
```

O backend persiste a apresentação do lote e consolida `quantidadeInicial` e `quantidadeDisponivel` na unidade-base.

### Próximo subbloco

```text
1. validar o novo modelo de entrada
2. implementar descarte por vencimento
3. validar saldo/lotes
4. encerrar Estoque
```

## 2. Produtos + Rotulagem — próxima etapa

Produto terá duas portas de entrada, mas uma única entidade/fonte de dados.

### Operação → Produtos

Rotas:

```text
/produtos
/produtos/:id
```

Função:

```text
buscar produto
consultar código
consultar unidade-base
consultar apresentação padrão
consultar risco/perecibilidade
consultar localização
consultar quantidade atual
consultar estoque mínimo
consultar lotes e apresentações
consultar última entrada
editar informações permitidas
imprimir identificação/rótulo
```

### Administração → Cadastros → Produtos

```text
criar produto
inativar/excluir conforme regra
alterar informações estruturais
manter catálogo
```

Não duplicar entidade nem regras entre a tela operacional e Cadastros.

### Fluxo oficial produto → lote → rótulo

```text
1. Produto existe no catálogo
        ↓
2. Estoque → Nova entrada de lote
        ↓
3. Informa apresentação física + quantidade + conteúdo + fracionamento
        ↓
4. Backend converte para unidade-base e atualiza saldo
        ↓
5. Usuário acessa Operação → Produtos
        ↓
6. Abre o produto
        ↓
7. Confere produto + estoque + última entrada + apresentação/lote
        ↓
8. Edita somente campos permitidos
        ↓
9. Imprime rótulo usando lote de referência
```

A última entrada deve ser pré-selecionada para impressão, com possibilidade de escolher outro lote ativo.

### Tipos de impressão

```text
Identificação do produto
→ etiqueta genérica de prateleira/localização

Rótulo de lote
→ produto + lote de referência
→ inclui apresentação física real
→ rastreável
```

O rótulo poderá incluir:

```text
nome/código do produto
unidade-base
apresentação
conteúdo por apresentação
código interno SGL do lote
código do lote informado externamente
validade
localização
risco
perecibilidade
condições de armazenamento
```

## 3. Código interno do lote

Será criado futuramente um identificador interno gerado pelo SGL, separado de `numeroLote`.

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
imutável
único no escopo definido
protegido contra concorrência
usado em rastreabilidade/rótulos
```

## 4. Movimentações

Depois de Produtos/Rotulagem:

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
quantidade em unidade-base
contexto de lote/apresentação
```

## 5. Relatórios

Depois de Movimentações:

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

## 6. Cadastros e Administração

Cadastros:

```text
Produtos
Laboratórios
Projetos
Usuários
Estagiários
```

**Unidade não possui cadastro manual.**

### Interface de Estagiários — obrigatória

Rotas:

```text
/cadastros/estagiarios
/cadastros/estagiarios/:id
```

Fluxo:

```text
Administração
→ Cadastros
→ Estagiários
→ buscar/listar
→ selecionar
→ ficha individual
→ consultar dados institucionais e do estágio
→ editar campos permitidos
→ encerrar/inativar conforme regra do backend
```

A ficha individual deve centralizar nome, email, situação, unidade, laboratório, datas do estágio, tipo de bolsa e observação, conforme os contratos reais da API.
