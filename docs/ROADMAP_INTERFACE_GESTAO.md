# Roadmap da Interface de Gestão — SGL

**Atualização:** 27/08/2026  
**Fonte principal de retomada:** `CONTINUIDADE.md`

Este documento registra a sequência operacional aprovada para a interface de Gestão/Admin. Ele complementa o `CONTINUIDADE.md`; em caso de conflito, a decisão mais recente registrada na continuidade prevalece.

## Sequência atual

```text
Pedidos da Gestão                         ✅ concluído
↓
Estoque / Lotes                           🟡 atual
↓
Produtos + Rotulagem                      ⏳ próximo
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

Objetivo: representar a situação física dos materiais da unidade e permitir as operações físicas previstas pelo backend.

### Visão geral `/estoque`

Deve mostrar:

```text
Produtos em estoque
Estoque baixo
Zerados
Produtos com lote vencido
```

A métrica `Quantidade consolidada` não deve existir, pois soma unidades/apresentações incompatíveis e não possui significado operacional confiável.

Tabela principal:

```text
Produto
Código do produto
Apresentação
Localização física
Quantidade atual
Mínimo
Situação
Detalhes
```

Terminologia:

```text
Apresentação
→ antiga "unidade de armazenamento"
→ exemplo: frasco de 500 mL, kit com 50 reações

Localização física
→ onde o material é encontrado
→ exemplo: AMX2, Geladeira 1, Armário Q3
```

### Detalhe `/estoque/:id`

Deve reunir:

```text
produto
código de referência
apresentação
localização
saldo atual
mínimo
lotes
validade
quantidade inicial/disponível
entrada de lote
descarte por vencimento
```

Entrada e descarte permanecem no contexto do Estoque porque são operações físicas.

## 2. Produtos + Rotulagem — próxima etapa

Produto terá duas portas de entrada, mas uma única entidade/fonte de dados.

### Operação → Produtos

Rota planejada:

```text
/produtos
/produtos/:id
```

Função: ambiente operacional para consultar e trabalhar com um produto sem precisar entrar em Cadastros.

Deve permitir, conforme permissão:

```text
buscar produto
abrir produto
consultar código
consultar/editar informações permitidas
consultar risco e perecibilidade
consultar apresentação
consultar localização
consultar quantidade atual em estoque
consultar estoque mínimo
consultar lotes
consultar última entrada
imprimir identificação/rótulo
```

### Administração → Cadastros → Produtos

Função administrativa:

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
3. Backend registra o lote e atualiza o estoque
        ↓
4. Usuário acessa Operação → Produtos
        ↓
5. Abre o produto
        ↓
6. Confere:
   - informações do produto
   - risco/perecibilidade
   - apresentação
   - localização
   - quantidade atual
   - última entrada
   - lote/validade
        ↓
7. Edita somente os campos permitidos, quando necessário
        ↓
8. Imprime rótulo usando um lote de referência
```

A última entrada deve ser pré-selecionada como lote de referência para impressão, mas o usuário poderá escolher outro lote ativo quando necessário.

### Tipos de impressão previstos

```text
Identificação do produto
→ etiqueta genérica de prateleira/localização
→ não representa um lote específico

Rótulo de lote
→ produto + lote de referência
→ rastreável
→ usado no recipiente/material físico
```

O rótulo de lote poderá incluir, conforme contrato final:

```text
nome do produto
código do produto
código SGL do lote
lote do fornecedor
validade
localização
risco
perecibilidade
condições de armazenamento
```

Não gerar dados fictícios no frontend. A impressão definitiva só deve usar campos persistidos/retornados pela API.

## 3. Código interno do lote

O backend atual possui `numeroLote`, que representa a identificação informada pelo fornecedor/responsável.

Será criado futuramente um segundo identificador interno, gerado pelo SGL, separado do lote do fornecedor.

Formato-base aprovado para estudo/implementação:

```text
L<sequência>-<abreviação do produto>-<ano>

L01-EXTDNA-26
L02-EXTDNA-26
L01-FORM37-26
```

Regras:

```text
gerado pelo sistema
não digitado livremente pelo usuário
imutável após criação do lote
único dentro do escopo definido pelo backend
não substituir numeroLote do fornecedor
usar no rótulo e na rastreabilidade
```

A estratégia exata de sequência/concorrência deve ser implementada no backend antes da tela de impressão depender desse campo.

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
```

Entrada e descarte continuam sendo iniciados pelo Estoque; Movimentações é principalmente consulta/auditoria.

## 5. Relatórios

Depois de Movimentações:

```text
/relatorios
```

Categorias previstas:

```text
Estoque
Lotes / validade
Movimentações
Pedidos
Consumo
Fiscalização / auditoria
```

## 6. Cadastros e Administração

Cadastros administrativos previstos:

```text
Produtos
Laboratórios
Projetos
Usuários
Estagiários
```

**Unidade não possui cadastro manual.**

Regra futura da integração corporativa:

```text
login corporativo
→ API corporativa devolve JSON institucional
→ SGL identifica a unidade
→ unidade já existe? associa usuário
→ unidade não existe? cria unidade e associa usuário
```

O modo DEV atual não deve ser quebrado antes da implementação da autenticação corporativa.

### 6.1 Interface de Estagiários — obrigatória na etapa de Administração

`Estagiários` não deve ser tratado apenas como uma linha genérica dentro de Usuários. A Administração terá uma interface própria para consultar e acompanhar cada estagiário individualmente.

Rotas planejadas:

```text
/cadastros/estagiarios
/cadastros/estagiarios/:id
```

A listagem deve permitir localizar o estagiário e abrir seu registro individual. O detalhe deverá puxar os dados reais do cadastro de Estagiário/Usuário e apresentar, conforme os contratos existentes no backend:

```text
nome
email
situação ativo/inativo
unidade
laboratório
perfil
data de início do estágio
data de fim do estágio
tipo de bolsa
observação
```

Também deve deixar espaço para informações administrativas adicionais que existirem no contrato definitivo, sem inventar campos no frontend.

Fluxo esperado:

```text
Administração
→ Cadastros
→ Estagiários
→ buscar/listar
→ selecionar estagiário
→ abrir ficha individual
→ consultar dados institucionais e do estágio
→ editar campos permitidos
→ encerrar/inativar estágio conforme regra real do backend
```

A ficha individual é o centro de consulta do estagiário. Não duplicar dados em páginas paralelas.

A futura autorização deve definir quais perfis podem editar, encerrar ou apenas consultar. Até lá, não inferir permissões que o backend ainda não estabeleceu.
