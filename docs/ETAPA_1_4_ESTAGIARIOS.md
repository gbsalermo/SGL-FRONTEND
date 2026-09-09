# Etapa 1.4 — Estagiários

**Rota:** `/estagiarios`  
**Status:** preparado em 09/09/2026 e aguardando validação visual/funcional.  
**Branch:** `feat/etapa-1-4-estagiarios`

## Objetivo

Aplicar o padrão visual aprovado da Etapa 1 ao módulo de Estagiários sem alterar regras de negócio, services, contratos HTTP ou o fluxo atual de cadastro/edição/encerramento.

## Ajustes aplicados

- título principal em 24 px;
- textos de corpo em 14 px;
- labels em 13 px;
- textos auxiliares com mínimo de 12 px;
- botões e campos em 40 px;
- raio de 6 px nos controles e 8 px nas superfícies;
- cards de indicadores sem sombra decorativa;
- amarelo e vermelho preservados apenas quando representam prazo/atenção;
- tabela com maior legibilidade;
- chips de status ampliados;
- filtros com escala coerente com as demais telas da Gestão;
- drawer de detalhes mais largo e legível;
- modais de cadastro, edição e encerramento refinados;
- responsividade mantida para tablet/mobile;
- foco visível e reduced-motion preservados.

## O que não foi alterado

- cadastro de estágio;
- edição do vínculo;
- associação Unidade/Laboratório;
- datas e tipo de bolsa/vínculo;
- regras de encerramento;
- chamadas de API;
- contratos backend;
- futura modelagem Projeto ↔ Estagiário da Etapa 5;
- Dark Mode, reservado para a Etapa 2.

## Checklist de validação

### Visual

- [ ] título e descrição legíveis;
- [ ] cards de indicadores coerentes;
- [ ] campos/filtros com 40 px;
- [ ] tabela legível sem textos minúsculos;
- [ ] status ATIVO/ENCERRADO legíveis;
- [ ] drawer de detalhes confortável para leitura;
- [ ] modal de novo estágio legível;
- [ ] modal de edição legível;
- [ ] confirmação de encerramento legível;
- [ ] responsividade sem sobreposição.

### Funcional

- [ ] carregar listagem;
- [ ] atualizar;
- [ ] buscar;
- [ ] filtrar por status;
- [ ] filtrar por laboratório;
- [ ] filtrar por tipo de bolsa;
- [ ] limpar filtros;
- [ ] abrir/fechar detalhes;
- [ ] cadastrar novo estágio;
- [ ] editar vínculo;
- [ ] encerrar estágio;
- [ ] mensagens de sucesso/erro continuam corretas.

## Regra de merge

Não mergear esta branch antes da validação do responsável do projeto.

## Próxima continuidade após aprovação

Depois de Estagiários, restam na aplicação visual da Etapa 1.4:

```text
/relatorios
/relatorios/residuos
/relatorios/pessoas-laboratorio
/administracao/cadastros
```

Os três caminhos de Relatórios podem ser tratados como um único bloco visual. Depois deles, Administração/Cadastros fecha as interfaces operacionais principais da Etapa 1.4.
