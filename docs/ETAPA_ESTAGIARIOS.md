# Etapa Estagiários — Primeiro Protótipo SGL

**Branch frontend:** `feat/estagiarios-interface`  
**Branch backend:** `feat/estagiarios`  
**Base:** branches de Resíduos já implementadas, sem merge antecipado na `main`.

## Objetivo oficial

Concluir a gestão operacional dos vínculos de estágio antes de iniciar Administração → Cadastros.

```text
1. Listagem                         ← implementado, aguardando validação
2. Cadastro                         ⏳
3. Edição                           ⏳
4. Vínculo com laboratório/unidade  ⏳
5. Período de estágio               ⏳
6. Encerramento de estágio          ⏳
```

## Contrato backend já disponível

Base:

```text
/api/v1/estagiarios
```

Endpoints usados/previstos:

```text
GET  /api/v1/estagiarios
GET  /api/v1/estagiarios/{id}
GET  /api/v1/estagiarios/ativos
GET  /api/v1/estagiarios/por-laboratorio?laboratorioId=...
POST /api/v1/estagiarios
PUT  /api/v1/estagiarios/{id}
PUT  /api/v1/estagiarios/{id}/encerrar
```

O backend atual já valida:

- usuário associado com perfil `ESTAGIARIO`;
- um usuário não pode possuir dois cadastros de estágio;
- laboratório e usuário devem pertencer à mesma unidade;
- data final não pode ser anterior à data inicial;
- usuário vinculado não pode ser trocado durante edição;
- estágio já encerrado não pode ser encerrado novamente.

Tipos de bolsa atuais:

```text
BOLSA_CNPQ
BOLSA_CAPES
BOLSA_INSTITUCIONAL
VOLUNTARIO
```

## Bloco E1 — Listagem

Implementado em:

```text
src/modules/estagiarios/views/EstagiariosGestaoView.vue
src/modules/estagiarios/services/estagiarioService.ts
src/modules/estagiarios/types/estagiario.ts
```

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
- filtro por tipo de bolsa;
- detalhe lateral do vínculo;
- visualização do período e observações.

## Próxima validação

Antes de implementar cadastro/edição/encerramento, validar:

```text
menu Estagiários abre /estagiarios
GET /v1/estagiarios carrega sem erro
cards representam os dados reais
filtros funcionam
linha abre detalhe
X e clique fora fecham detalhe
layout permanece legível em 100%
```

Após aprovação, seguir para o bloco E2: cadastro com seleção somente de usuários ativos com perfil `ESTAGIARIO`, respeitando unidade/laboratório.
