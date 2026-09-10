# Etapa 1.4 — Administração / Cadastros

**Rota:** `/administracao/cadastros`  
**Status:** preparado em 10/09/2026 e aguardando validação visual/funcional.  
**Branch:** `feat/etapa-1-4-cadastros`

## Objetivo

Aplicar o padrão visual consolidado da Etapa 1 à última interface operacional principal pendente da Etapa 1.4, sem alterar regras de Laboratórios, Projetos, Produtos ou Permissões.

## Escopo atual preservado

A tela continua exclusiva de `ADMINISTRADOR` e mantém as quatro áreas atuais:

```text
Laboratórios
Projetos
Produtos
Permissões
```

Não antecipar nesta etapa:

- nova modelagem de Projetos da Etapa 5;
- modelos de Resíduos da Etapa 4;
- Soluções da Etapa 7;
- autenticação/autorização definitiva;
- Dark Mode definitivo.

## Ajustes visuais aplicados

- título de página em 24 px;
- corpo em 14 px;
- labels em 13 px;
- auxiliares com mínimo de 12 px;
- cards de resumo com raio 8 px e sem sombra decorativa;
- navegação lateral de Cadastros mais legível;
- aba ativa com destaque azul institucional;
- campos e botões principais em 40 px;
- barra de busca e controle de inativos padronizados;
- tabelas com cabeçalhos e conteúdo ampliados;
- chips Ativo/Inativo ampliados;
- ações de tabela mais fáceis de clicar;
- seletor de perfil em Permissões passa a 40 px;
- avisos da sessão atual mais legíveis;
- modais de Laboratório, Projeto e Produto ampliados e padronizados;
- seções internas do cadastro de Produto mais legíveis;
- checkboxes e textos associados ampliados;
- responsividade ajustada para tablet/mobile;
- foco visível e `prefers-reduced-motion` preservados.

## O que não foi alterado

- `CadastrosAdminView.vue`;
- `cadastrosAdminService`;
- tipos/DTOs;
- chamadas HTTP;
- busca e filtros;
- criação/edição/inativação de Laboratórios;
- criação/edição/inativação de Projetos;
- criação/edição/inativação de Produtos;
- alteração de perfil em Permissões;
- bloqueio de alteração do perfil da própria sessão;
- regras institucionais de Unidade;
- comportamento funcional aprovado.

## Regras visuais específicas

### Superfícies

O estado normal permanece branco/neutro. Azul é usado para seleção, ação principal e informação institucional. Verde/vermelho permanecem semânticos para sucesso/erro e Ativo/Inativo quando aplicável.

### Tabelas

As tabelas continuam permitindo rolagem horizontal quando necessário. Não reduzir texto para fazer todas as colunas caberem à força.

### Modais

Os modais preservam o mesmo formulário e os mesmos campos. A alteração é somente de escala, espaçamento, legibilidade e responsividade.

## Checklist de validação

### Geral

- [ ] título e descrição coerentes com as demais telas;
- [ ] cards de resumo legíveis;
- [ ] aviso sobre escopo institucional legível;
- [ ] Atualizar dados funciona normalmente;
- [ ] responsividade sem sobreposição.

### Navegação e busca

- [ ] Laboratórios abre normalmente;
- [ ] Projetos abre normalmente;
- [ ] Produtos abre normalmente;
- [ ] Permissões abre normalmente;
- [ ] aba ativa é claramente identificável;
- [ ] busca continua funcionando;
- [ ] Mostrar inativos continua funcionando onde aplicável.

### Laboratórios

- [ ] tabela legível;
- [ ] Novo laboratório abre modal;
- [ ] edição funciona;
- [ ] inativação/reativação funciona;
- [ ] Unidade e Responsável permanecem corretos.

### Projetos

- [ ] tabela legível;
- [ ] Novo projeto abre modal;
- [ ] edição funciona;
- [ ] inativação/reativação funciona;
- [ ] período e laboratório permanecem corretos.

### Produtos

- [ ] tabela legível;
- [ ] Novo produto abre modal;
- [ ] modal completo continua confortável para leitura;
- [ ] identificação funciona;
- [ ] risco/armazenamento funciona;
- [ ] perecibilidade funciona;
- [ ] fiscalização funciona;
- [ ] edição funciona;
- [ ] inativação/reativação funciona.

### Permissões

- [ ] usuários permanecem legíveis;
- [ ] Unidade/Laboratório permanece visível;
- [ ] perfil atual permanece correto;
- [ ] seletor de novo perfil é legível;
- [ ] salvar alteração continua funcionando;
- [ ] própria sessão continua bloqueada para alteração de perfil;
- [ ] aviso da sessão atual está legível.

## Regra de merge

Não mergear antes da validação visual e funcional pelo responsável do projeto.

## Próximo passo após aprovação

Com Administração/Cadastros aprovada, não resta outra interface operacional principal da Etapa 1.4.

A sequência será:

```text
revisão final rápida da Etapa 1.4
→ atualizar documentação de fechamento
→ marcar Etapa 1 como concluída
→ iniciar Etapa 2 — Dark Mode definitivo
```
