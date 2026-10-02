# Etapa Estagiários — Primeiro Protótipo SGL

> **Evolução vigente — Etapa 6.5 (02/10/2026):** este documento preserva o primeiro protótipo como histórico. A rota `/estagiarios` agora usa o modelo de vínculos e participações do backend, com preview operacional na tabela e drawer detalhado. Edição/encerramento manual deixaram de ser ações principais, e Laboratório não é mais tratado como atributo operacional único do Estagiário.

Na rodada de refinamento visual, o drawer de detalhes foi ampliado para 860 px e as linhas da tabela receberam maior altura/padding para manter legibilidade compatível com as demais telas de Gestão. A Unidade IQ recebeu massa DEV adicional no backend para exercitar todos os estados visuais.

Na rodada seguinte de polimento, a hierarquia da tabela foi alinhada ao uso do cliente: Status concentra `Não iniciado`, `Em andamento`, `Prorrogado` e `Encerrado`, com motivo auxiliar abaixo; Estagiário mostra o Orientador/Responsável; Formação concentra nível e Curso; Contexto operacional ganhou ícones e maior legibilidade; Bolsa/modalidade ficou restrita ao drawer. `Não iniciado` só é usado quando o vínculo ainda não possui qualquer participação em Atividade.

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

## Relatório complementar — Pessoas por laboratório

Antes de seguir para Administração foi incluído um relatório de auditoria institucional para o Gestor identificar todas as pessoas vinculadas a um laboratório, não apenas estagiários.

Rota frontend:

```text
/relatorios/pessoas-laboratorio
```

Endpoints:

```text
GET /api/v1/relatorios/pessoas-laboratorio?laboratorioId=...
GET /api/v1/relatorios/pessoas-laboratorio/exportar?formato=PDF|XLSX&laboratorioId=...
```

Filtros opcionais:

```text
perfil
ativo
```

O relatório apresenta:

```text
laboratório e unidade
responsável cadastrado do laboratório
nome e e-mail das pessoas
perfil: gestor, pesquisador, técnico, analista, estagiário ou administrador
situação ativa/inativa
identificação explícita de quem é o responsável
para estagiários: tipo de vínculo, início e fim do estágio
totais por perfil
exportação PDF/XLSX
```

O responsável é obtido de `Laboratorio.responsavel` e os demais vínculos de `Usuario.laboratorio`. Se o responsável também estiver diretamente vinculado ao laboratório, ele aparece uma única vez, marcado como **Responsável**.

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
16. Relatórios → Pessoas por laboratório abre normalmente
17. responsável do laboratório aparece destacado
18. pesquisadores/técnicos/analistas/estagiários vinculados aparecem por perfil
19. filtro ativos/inativos/todos funciona
20. filtro por perfil funciona
21. estagiário mostra tipo e período do vínculo
22. PDF e XLSX são gerados com os mesmos filtros
```

Após esta validação, a etapa de **Estagiários + auditoria de vínculos do laboratório** pode ser encerrada e o roadmap segue para **Administração → Cadastros**.


### Polimento final da listagem principal — 02/10/2026

A tipografia da página, filtros e tabela foi ampliada para melhorar a legibilidade em zoom 100%. Os quatro cards-resumo passaram a usar superfície neutra/cinza por padrão; as cores verde, amarelo, azul e cinza permanecem nas bolinhas e entram no card apenas no hover. A composição informacional da interface principal foi considerada suficiente nesta rodada, ficando o restante do 6.5 concentrado em validação visual e detalhes do drawer.


### Período e ações operacionais — 02/10/2026

A coluna Período passou a usar `data inicial → data final original`; em vínculos prorrogados com histórico disponível, a nova data aparece abaixo como `Prorrogado até ...`. O drawer iniciou suas ações operacionais com Associação de Atividade, registro de treinamento de segurança e gestão de Culturas por participação. A massa IQ inclui também vínculo aberto que já teve participações, mas não possui atividade ativa, para validar a diferença entre `Não iniciado` e `Sem atividade ativa`.


### Edição híbrida do vínculo — 02/10/2026

Foi adicionada a ação `Editar vínculo` no drawer, com Formação, Curso, Bolsa/modalidade, Orientador, data inicial, data final prevista e observação. O SGL pode manter esses campos localmente, mas a sincronização institucional substitui o valor quando informar o mesmo campo.

A data final prevista é obrigatória. Não há opção de estágio sem término previsto.

O modal segue o padrão visual consolidado de Resíduos e vínculos finalizados não oferecem edição local.


### Integração posterior com a tela de Projetos

Depois do fechamento da Etapa 6, usar o vínculo `VinculoEstagioAtividade` também no sentido inverso para enriquecer a tela de Projetos: dentro de cada Atividade, manter o responsável atual e acrescentar os Estagiários associados. O desenho definitivo para participações atuais e históricas será fechado nessa rodada posterior.


### Drawer final — ações, vínculo, observações e Culturas

No polimento final do 6.5, o drawer passa a seguir:

```text
01 Ações operacionais
02 Bolsa / Vínculo
03 Formação
04 Orientador
05 Participações em Atividades
06 Observações
```

Ações operacionais ficam no topo. O treinamento não possui seção própria: aparece como estado/ação, verde quando concluído, e qualquer mudança exige confirmação. É possível reverter uma conclusão; concluir e reverter geram eventos auditáveis no backend. Uma observação opcional pode acompanhar a alteração e é exibida em Observações.

O bloco Observações reúne registros operacionais adicionados por Gestor/Admin e, quando existirem, observações do vínculo, participações e treinamento.

O modal de Culturas permite selecionar Culturas ativas e criar uma nova Cultura para a Unidade sem sair do fluxo. A nova Cultura é selecionada automaticamente, mas a associação à participação só é confirmada ao salvar o modal.

A escala de texto das Participações e os marcadores numéricos das seções foram ampliados para legibilidade em 100% de zoom.
