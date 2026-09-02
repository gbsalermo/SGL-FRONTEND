# Administração → Cadastros — Primeiro Protótipo SGL

**Branch frontend:** `feat/cadastros-admin`  
**Branch backend:** `feat/cadastros-admin`  
**Base:** `main` após merge da etapa de Estagiários e auditoria por laboratório.

## Objetivo

A área de Cadastros existe para manter os **dados-base usados pelos fluxos operacionais**. Não é uma área de operação diária e não deve duplicar Estoque, Pedidos, Resíduos ou Estagiários.

A rota é exclusiva de `ADMINISTRADOR`:

```text
/administracao/cadastros
```

## Decisões de produto

### Usuários

Não existe cadastro manual de usuário nesta interface.

O cadastro do usuário deve ser criado/sincronizado automaticamente a partir do login institucional quando a autenticação definitiva for integrada.

A Administração pode somente consultar os usuários existentes e alterar o **perfil/permissão de acesso**.

Endpoint específico:

```text
PUT /api/v1/usuarios/{id}/perfil
{
  "perfil": "GESTOR"
}
```

Esse endpoint altera somente `perfil`; não exige nem modifica nome, e-mail, senha, unidade ou laboratório.

A tela bloqueia a alteração do perfil do próprio Administrador da sessão para reduzir risco de auto-rebaixamento acidental.

A regra já existente permanece: um usuário com perfil `ESTAGIARIO` e estágio ativo não pode deixar esse perfil antes de encerrar o estágio.

### Unidades

Unidade é dado institucional e não possui CRUD nesta interface.

As unidades retornadas por `/api/v1/unidades` servem apenas como referência para:

- vincular laboratório;
- filtrar usuários elegíveis como responsável;
- auditoria da estrutura institucional.

### Laboratórios

Cadastro administrativo com:

```text
unidade
nome
descrição
responsável
ativo
```

O responsável deve pertencer à mesma unidade do laboratório, regra validada também no backend.

A interface usa ativação/inativação em vez de incentivar exclusão física.

### Projetos

Cadastro administrativo com:

```text
laboratório
nome
descrição
data inicial
data final
responsável
ativo
```

A interface valida que a data final não seja anterior à inicial e preserva os projetos inativos para auditoria.

### Produtos

A área mantém somente o **catálogo-base**. Quantidades, lotes e movimentações continuam nas telas operacionais de Estoque.

Campos contemplados:

```text
nome
código de referência
descrição
unidade de medida
localização física
apresentação/unidade de armazenamento
nível e tipo de risco
descrição do risco
perecibilidade
condições de armazenamento
fiscalização externa
órgãos fiscalizadores
observação de fiscalização
ativo
```

As regras de fiscalização continuam as definidas anteriormente:

- `fiscalizado=false` limpa órgãos e observação;
- `fiscalizado=true` exige ao menos um órgão;
- fiscalização não é inferida automaticamente por risco ou perecibilidade.

## Interface

A central usa quatro abas simples:

```text
Laboratórios
Projetos
Produtos
Permissões
```

Cada cadastro tem busca, consulta de ativos, opção de mostrar inativos, criação, edição e ativação/inativação.

Não há CRUD de Usuários e não há CRUD de Unidades.

## Segurança do frontend

A rota possui `meta.perfis = ['ADMINISTRADOR']`.

O guard do router foi corrigido para respeitar a permissão da rota **mais específica**, em vez de unir permissões do layout pai e da rota filha. Assim um `GESTOR` não herda acesso administrativo apenas por usar o `GestaoLayout`.

A autorização definitiva no backend continua vinculada à futura etapa de autenticação/autorização real e à matriz final de permissões.

## Validação esperada

```text
1. Administrador visualiza Administração → Cadastros
2. Gestor não visualiza a opção
3. Gestor tentando abrir /administracao/cadastros é redirecionado
4. unidades aparecem apenas como referência
5. criar/editar/inativar/reativar laboratório
6. responsável é limitado à unidade selecionada
7. criar/editar/inativar/reativar projeto
8. período inválido de projeto é rejeitado
9. criar/editar/inativar/reativar produto
10. produto fiscalizado exige órgão
11. produto não fiscalizado limpa controle externo
12. Permissões lista usuários existentes sem botão de cadastro
13. alteração de perfil usa somente PUT /usuarios/{id}/perfil
14. perfil da sessão atual não pode ser alterado pela própria tela
15. ESTAGIARIO com estágio ativo não pode perder esse perfil
```
