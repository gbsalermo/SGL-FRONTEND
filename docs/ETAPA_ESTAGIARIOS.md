# Etapa Estagiários — Primeiro Protótipo SGL

**Branch frontend:** `feat/estagiarios-v2`  
**Branch backend:** `feat/estagiarios-v2`  
**Base:** `main` atual, já contendo o módulo de Resíduos mergeado.

## Estado

```text
1. Listagem                         ✅ implementado
2. Cadastro                         ✅ implementado
3. Edição                           ✅ implementado
4. Vínculo com laboratório/unidade  ✅ implementado
5. Período de estágio               ✅ implementado
6. Encerramento de estágio          ✅ implementado
```

A interface é deliberadamente simples porque esta área tem finalidade principal de consulta, auditoria e manutenção de vínculo.

## Contrato backend

Base:

```text
/api/v1/estagiarios
```

```text
GET  /api/v1/estagiarios
GET  /api/v1/estagiarios/{id}
GET  /api/v1/estagiarios/ativos
GET  /api/v1/estagiarios/por-laboratorio?laboratorioId=...
POST /api/v1/estagiarios
PUT  /api/v1/estagiarios/{id}
PUT  /api/v1/estagiarios/{id}/encerrar
```

O backend valida:

- usuário associado com perfil `ESTAGIARIO`;
- um usuário não pode possuir dois cadastros de estágio;
- laboratório e usuário devem pertencer à mesma unidade;
- data final não pode ser anterior à data inicial;
- usuário vinculado não pode ser trocado durante edição;
- estágio já encerrado não pode ser encerrado novamente;
- estágio não pode ser encerrado antes da data de início.

## Tipos de vínculo

O campo técnico continua chamado `tipoBolsa` por compatibilidade, enquanto a interface usa **Tipo de vínculo**.

```text
BOLSA_CNPQ
BOLSA_CAPES
BOLSA_INSTITUCIONAL
VOLUNTARIO
CONTRATUAL
```

`CONTRATUAL` representa estágio empregatício/contratual sem conexão com bolsa ou voluntariado. Como o enum é persistido com `EnumType.STRING` em coluna textual, não exige migration.

## Vínculo institucional

A resposta de Estagiários expõe explicitamente:

```text
unidadeId
unidadeNome
laboratorioId
laboratorioNome
```

Na criação e edição:

```text
usuário ESTAGIARIO
→ identifica a unidade do usuário
→ lista apenas laboratórios ativos dessa unidade
→ frontend valida compatibilidade
→ backend valida novamente a mesma regra
```

A unidade aparece na tabela, no detalhe e no formulário como dado de auditoria.

## Período de estágio

A interface registra e exibe:

```text
data de início
data de fim prevista/efetiva
quantidade de dias de vínculo
situação do período
```

Indicadores de auditoria:

```text
ativos
terminando em até 30 dias
prazo vencido ainda ativo
encerrados
```

A tabela e o detalhe informam quando o término está próximo, vencido ou quando não existe data final definida.

## Encerramento

A ação **Encerrar estágio** aparece somente para vínculos ativos.

Fluxo:

```text
usuário escolhe Encerrar
→ modal de confirmação
→ PUT /api/v1/estagiarios/{id}/encerrar
→ ativo = false
→ dataFimEstagio = data atual
→ histórico permanece na listagem como ENCERRADO
```

A data final planejada é substituída pela data efetiva quando o encerramento é confirmado, evitando vínculo inativo com data final futura.

## Validação final da etapa

Validar localmente:

```text
1. listagem e filtros
2. unidade e laboratório aparecem corretamente
3. Novo estágio lista somente usuários ESTAGIARIO elegíveis
4. laboratório fica restrito à unidade do usuário
5. cadastrar vínculo normal
6. cadastrar vínculo CONTRATUAL
7. editar laboratório/período/tipo/observação
8. data final anterior ao início é rejeitada
9. indicador de término em até 30 dias
10. indicador de prazo vencido ainda ativo
11. abrir Encerrar e cancelar
12. confirmar Encerrar
13. registro passa para ENCERRADO
14. data final passa a ser a data efetiva do encerramento
15. tentativa de encerrar novamente é impedida
```

Após esta validação, a etapa de **Estagiários** pode ser encerrada e o roadmap segue para **Administração → Cadastros**.
