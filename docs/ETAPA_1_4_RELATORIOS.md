# Etapa 1.4 — Relatórios

**Rotas:** `/relatorios`, `/relatorios/residuos`, `/relatorios/pessoas-laboratorio`  
**Status:** ✅ validado em 10/09/2026 e aprovado como coerente com o padrão visual do SGL.  
**Branch:** `feat/etapa-1-4-relatorios`

## Objetivo

Aplicar o padrão visual consolidado da Etapa 1 ao bloco de Relatórios sem alterar consultas, filtros, contratos HTTP, geração de prévias ou exportações PDF/XLSX.

## Estratégia

A central de Relatórios já possui uma hierarquia funcional útil:

```text
1. escolher relatório
→ 2. configurar filtros
→ 3. visualizar prévia
→ exportar usando os mesmos filtros
```

Essa estrutura foi preservada. O refinamento é realizado por uma camada visual isolada carregada depois dos estilos existentes.

## Ajustes aplicados

- título de página em 24 px;
- corpo em 14 px;
- labels em 13 px;
- textos auxiliares com mínimo de 12 px;
- campos e botões em 40 px;
- raio de 6 px nos controles e 8 px nas superfícies;
- redução de sombras decorativas;
- cards de seleção de relatório mais legíveis;
- seleção ativa com azul institucional;
- filtros com dimensões consistentes;
- prévias e tabelas com tipografia ampliada;
- chips/status preservando significado semântico;
- exportação PDF/XLSX apresentada como ação de formato, sem grandes blocos vermelho/verde;
- botão de retorno das rotas diretas passa a exibir chevron gráfico em vez da seta Unicode;
- barra de exportação da central alinhada aos mesmos controles de 40 px;
- responsividade preservada para tablet/mobile;
- foco visível e `prefers-reduced-motion` preservados.

## Regras específicas por tela

### `/relatorios`

- preservar a coluna de escolha de relatório;
- preservar todos os tipos atuais: Estagiários, Pessoas por laboratório, Produtos, Movimentações, Resumo operacional, Estoque e lotes, Resíduos e Fiscalização;
- não alterar filtros nem resultados;
- não alterar a integração dos relatórios especiais com a central;
- prévia deve continuar rolando horizontalmente dentro do próprio card quando a tabela for larga.

### `/relatorios/residuos`

- superfícies normais brancas/neutras;
- sem fundo creme estático;
- cores de status continuam semânticas;
- tabela de rastreabilidade deve permanecer legível sem alterar conteúdo;
- exportação PDF/XLSX continua usando exatamente os filtros selecionados.

### `/relatorios/pessoas-laboratorio`

- resumo de laboratório/responsável preservado;
- azul suave pode ser usado como apoio informacional no bloco do responsável;
- perfis e situação continuam sendo apenas informação do relatório;
- exportação e vínculo de estágio não sofrem alteração funcional.

## O que não foi alterado

- `RelatoriosGestaoView.vue`;
- `RelatorioResiduosView.vue`;
- `RelatorioPessoasLaboratorioView.vue`;
- `RelatorioExportacaoBar.vue`;
- services de Relatórios;
- DTOs/types;
- filtros;
- consultas;
- geração de PDF;
- geração de XLSX;
- regras de resíduos;
- regras de estagiários/laboratórios;
- Dark Mode, reservado para a Etapa 2.

## Validação concluída

Em 10/09/2026 o responsável do projeto conferiu o bloco e informou que as três rotas estavam funcionando normalmente e coerentes com o padrão visual já aprovado.

### Central `/relatorios`

- [x] título e descrição coerentes com as demais telas;
- [x] todos os cards de tipo de relatório legíveis;
- [x] item selecionado claramente identificável;
- [x] Pessoas por laboratório mantém posição correta;
- [x] Resíduos abre corretamente dentro da central;
- [x] filtros de Estagiários legíveis e funcionais;
- [x] filtros de Produtos legíveis e funcionais;
- [x] filtros de Movimentações legíveis e funcionais;
- [x] filtros de Resumo operacional legíveis e funcionais;
- [x] filtros de Estoque e lotes legíveis e funcionais;
- [x] filtros de Fiscalização legíveis e funcionais;
- [x] limpar filtros continua funcionando;
- [x] prévia permanece legível;
- [x] tabelas largas possuem scroll interno;
- [x] PDF e Excel continuam habilitando somente após uma prévia válida.

### `/relatorios/residuos`

- [x] título 24 px e descrição legível;
- [x] filtros em 40 px;
- [x] cards de resumo legíveis;
- [x] status semanticamente corretos;
- [x] tabela legível;
- [x] botão de retorno claro;
- [x] PDF/XLSX continuam funcionando;
- [x] responsividade sem sobreposição.

### `/relatorios/pessoas-laboratorio`

- [x] filtros em 40 px;
- [x] resumo de laboratório/responsável legível;
- [x] indicadores legíveis;
- [x] chips de perfis e situação legíveis;
- [x] tabela legível;
- [x] botão de retorno claro;
- [x] PDF/XLSX continuam funcionando;
- [x] responsividade sem sobreposição.

## Próxima continuidade

Depois do bloco de Relatórios, resta apenas a interface operacional principal:

```text
/administracao/cadastros
```

Depois de Administração/Cadastros:

```text
revisão final da 1.4
→ fechamento documental da Etapa 1
→ Etapa 2 — Dark Mode definitivo
```
