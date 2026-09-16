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

### Resíduos pré-determinados — opção em estudo

A central exibe uma opção **Resíduos — em breve**, deliberadamente inativa neste protótipo.

A ideia é permitir que a Gestão cadastre modelos de resíduos recorrentes. O usuário poderia selecionar um modelo já conhecido em **Informar resíduo**, evitando redigitar informações repetitivas.

Se a funcionalidade for ativada, o cadastro do modelo deverá armazenar os dados que hoje são informados manualmente no fluxo de resíduo:

```text
nome/identificação do modelo
descrição do resíduo
processo de origem
recipiente padrão
quantidade padrão ou referência de quantidade
unidade de medida
nível de risco sugerido
riscos sugeridos
composição
  ├── produtos do catálogo, quando aplicável
  ├── componentes livres, quando aplicável
  ├── componente principal
  ├── concentração/quantidade do componente
  └── observação do componente
observação padrão do gerador
ativo/inativo
```

A quantidade efetiva deve continuar editável no registro real, porque a quantidade gerada pode variar mesmo quando o tipo de resíduo é recorrente.

Projeto, laboratório e usuário gerador continuam sendo contexto do registro real e não devem ser engessados pelo modelo global, salvo decisão futura de criar modelos restritos por laboratório.

O modelo **não movimenta estoque**. Referências a Produto continuam sendo apenas informativas para composição do resíduo.

A seleção do modelo também não elimina a análise da Gestão: os riscos carregados pelo modelo funcionam como preenchimento inicial e a classificação confirmada continua ocorrendo no fluxo normal.

Regra planejada para **Informar resíduo**, somente se esta opção for ativada:

```text
produto do catálogo OU resíduo pré-cadastrado
→ pelo menos um dos dois deve estar selecionado

se resíduo pré-cadastrado for selecionado
→ produto passa a ser opcional

se produto for selecionado
→ resíduo pré-cadastrado passa a ser opcional
```

Componentes livres podem complementar a composição, mas não substituem essa regra mínima se a funcionalidade futura for confirmada.

No protótipo atual a opção permanece desabilitada e **nenhuma validação existente é alterada**.

## Interface

A central usa quatro áreas funcionais e uma opção planejada:

```text
Laboratórios
Projetos
Produtos
Permissões
Resíduos — em breve / inativo
```

Cada cadastro funcional tem busca, consulta de ativos, opção de mostrar inativos, criação, edição e ativação/inativação.

Não há CRUD de Usuários e não há CRUD de Unidades.

Na tela **Informar resíduo**, a opção de resíduo pré-cadastrado também aparece visualmente como **Em breve**, próxima da composição/produtos, acompanhada da regra futura Produto ou Resíduo. Ela permanece sem ação neste protótipo.

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
16. Cadastros mostra Resíduos com indicação Em breve e sem ação
17. Informar resíduo mostra a opção futura de modelo pré-cadastrado sem alterar o fluxo atual
```
