# Etapa Estagiários — Primeiro Protótipo SGL

**Branch frontend:** `feat/estagiarios-v2`  
**Branch backend:** `feat/estagiarios-v2`  
**Base:** `main` atual, já contendo o módulo de Resíduos mergeado.

## Objetivo oficial

Concluir a gestão operacional dos vínculos de estágio antes de iniciar Administração → Cadastros.

```text
1. Listagem                         ✅ implementado
2. Cadastro                         ✅ implementado
3. Edição                           ✅ implementado
4. Vínculo com laboratório/unidade  ✅ aplicado no cadastro/edição
5. Período de estágio               ✅ aplicado no cadastro/edição
6. Encerramento de estágio          ⏳ próximo bloco
```

A interface desta etapa é deliberadamente simples: trata-se principalmente de uma área de consulta, auditoria e manutenção do vínculo, sem necessidade de acabamento visual equivalente aos fluxos operacionais de Pedidos ou Resíduos.

## Contrato backend

Base:

```text
/api/v1/estagiarios
```

Endpoints usados:

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
- estágio já encerrado não pode ser encerrado novamente.

## Tipos de vínculo

O campo técnico continua chamado `tipoBolsa` por compatibilidade com o domínio atual, mas a interface usa **Tipo de vínculo**, pois nem todos os casos representam bolsa.

```text
BOLSA_CNPQ
BOLSA_CAPES
BOLSA_INSTITUCIONAL
VOLUNTARIO
CONTRATUAL
```

`CONTRATUAL` representa estágio empregatício/contratual sem conexão com bolsa ou voluntariado.

Como o enum é persistido com `EnumType.STRING` em coluna textual, a inclusão de `CONTRATUAL` não exige migration de banco.

## Listagem

Rota:

```text
/estagiarios
```

Acesso atual:

```text
GESTOR
ADMINISTRADOR
```

Funcionalidades:

- total de ativos e encerrados;
- vínculos terminando em até 30 dias;
- ativos sem data final;
- busca textual;
- filtro por status;
- filtro por laboratório;
- filtro por tipo de vínculo;
- detalhe lateral do vínculo;
- visualização do período e observações.

## Cadastro

O botão **Novo estágio** abre formulário simples com:

```text
usuário estagiário
laboratório
data de início
data de fim prevista (opcional)
tipo de vínculo
observação
```

Regras da UI:

- lista somente usuários ativos com perfil `ESTAGIARIO`;
- não oferece usuário que já possui vínculo de estágio;
- depois da escolha do usuário, oferece somente laboratórios ativos da mesma unidade;
- valida período antes do envio;
- envia `ativo=true` no novo vínculo.

## Edição

A edição pode ser aberta pela tabela ou pelo detalhe.

O usuário vinculado fica bloqueado, respeitando a regra do backend. Podem ser alterados:

```text
laboratório da mesma unidade
início
fim previsto
tipo de vínculo
observação
```

## Próxima validação

Validar localmente:

```text
menu Estagiários abre /estagiarios
listagem e filtros funcionam
Novo estágio lista somente usuários ESTAGIARIO elegíveis
laboratórios respeitam a unidade do usuário
cadastro persiste e aparece na tabela
CONTRATUAL é aceito e exibido corretamente
edição mantém usuário bloqueado
edição persiste laboratório/período/vínculo/observação
fechar/cancelar modal volta para a listagem sem abrir drawer
layout continua legível em 100%
```

Após aprovação, seguir somente para **Encerramento de estágio**.
