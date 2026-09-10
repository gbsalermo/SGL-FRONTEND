# Etapa 2 — Dark Mode / Meus pedidos

## Status

Em validação visual.

## Rota

```text
/meus-pedidos
```

## Objetivo

Aplicar a paleta Dark Mode aprovada no Dashboard do Solicitante à tela de acompanhamento de pedidos, preservando integralmente a estrutura, filtros, expansão de detalhes e regras funcionais existentes.

## Direção visual aplicada

- fundo navy profundo herdado do shell do Solicitante;
- superfícies em camadas para filtros, tabela e detalhes;
- resumo por status com identificação semântica discreta;
- chips de status adaptados ao tema escuro;
- linha selecionada/expandida com destaque azul institucional;
- filtros e busca com foco azul;
- detalhes expandidos com leitura hierárquica clara;
- hover semântico nos cards de resumo;
- nenhuma alteração de regra de negócio ou serviço.

## Semântica

```text
Pendente   → vermelho no resumo / âmbar no status
Aprovado   → verde
Entregue   → azul, com texto branco
Rejeitado  → vermelho
Cancelado  → neutro/cinza-azulado
Urgente    → vermelho
```

## Checklist de validação

- [ ] cabeçalho e botão Novo pedido;
- [ ] cards Pendentes / Aprovados / Entregues;
- [ ] busca e filtro por status;
- [ ] tabela e hover das linhas;
- [ ] chips de todos os status;
- [ ] indicação de pedido urgente;
- [ ] botão de expandir/recolher detalhes;
- [ ] painel expandido e materiais solicitados;
- [ ] estado vazio;
- [ ] estado de erro/recarregar;
- [ ] alternância Dark → Light → Dark sem regressão;
- [ ] responsividade preservada.

## Escopo

Esta etapa atua apenas na apresentação Dark Mode da interface. A View, os serviços de Pedidos, filtros e comportamento de navegação permanecem inalterados.
