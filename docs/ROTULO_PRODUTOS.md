# Rótulo físico de Produtos

## Objetivo

Permitir que a Gestão gere e imprima um rótulo físico para um Produto cadastrado, reaproveitando o padrão visual definido para Resíduos.

## Fonte de dados

O rótulo usa diretamente:

```text
GET /api/v1/produtos/{id}
```

Não existe duplicação de dados nem endpoint específico de rótulo no backend.

## Informações exibidas

```text
nome
código de referência
descrição
nível e tipo de risco
descrição complementar de risco
pictograma correspondente
unidade/apresentação
localização física
condições de armazenamento
perecibilidade
controle/fiscalização externa
órgãos fiscalizadores
observação de fiscalização
logo Embrapa
```

Quando `fiscalizado = true`, os órgãos são apresentados nominalmente, por exemplo:

```text
Polícia Federal
Exército
Anvisa
Vigilância Sanitária
Outro órgão
```

Quando o Produto não está sujeito a fiscalização externa cadastrada, o rótulo deixa isso explícito.

## Acesso

Na tela de detalhe de Estoque existe o atalho contextual:

```text
Rotular produto
```

A rota de impressão é:

```text
/produtos/{produtoId}/rotulo
```

## Impressão

A página física permanece A4 em orientação retrato. O usuário controla apenas o tamanho do conteúdo do rótulo, entre 70 e 190 mm de largura, com presets Pequeno, Médio, Grande e Máx. A4.

A proporção-base usada por Produtos e pela versão ajustada do rótulo de Resíduos é 180 × 125 mm, evitando sobreposição entre conteúdo e rodapé.
