# Etapa 2 — Estagiários da Gestão

## Status

Em validação — 10/09/2026.

## Escopo

Aplicação do Dark Mode definitivo em:

- `/estagiarios`;
- `EstagiariosGestaoView.vue`.

## Regra de paridade com o Light Mode

O Dark preserva integralmente a linguagem visual aprovada na Etapa 1:

- título de página em 24px;
- corpo em 14px;
- labels em 13px;
- helpers em 12px;
- controles em 40px;
- mesmas dimensões de cards e ações;
- mesma organização, espaçamento e densidade;
- mesma largura do drawer e dos modais;
- mesma hierarquia entre informação principal e secundária.

## Semântica

- verde: vínculo ativo e sucesso;
- âmbar: término próximo;
- vermelho: prazo vencido e ação de encerramento;
- cinza: vínculo encerrado;
- azul: ação, navegação e contexto.

## Ajustes aplicados

- cabeçalho e ações;
- cards de métricas;
- feedback de sucesso/erro;
- workspace e filtros;
- tabela e status;
- ações Editar/Encerrar;
- drawer de detalhes;
- card de período;
- observação;
- modal de cadastro/edição;
- modal de encerramento;
- estados disabled;
- foco visível e reduced motion.

## Restrições

- nenhum vínculo foi alterado em nível funcional;
- nenhuma regra de Unidade/Laboratório foi alterada;
- nenhum fluxo de cadastro, edição ou encerramento foi alterado;
- nenhum service, rota ou payload foi alterado;
- futura modelagem Projeto ↔ Estagiário continua reservada à Etapa 5;
- Light Mode permanece intacto.

## Próximo passo

Validar `/estagiarios` em Light e Dark antes do merge.
