# Padrão Visual de Pré-Produção — SGL Frontend

**Etapa:** 1 — Padronização e refinamento visual global  
**Estado:** ✅ Etapa 1 concluída e validada  
**Data de fechamento:** 10/09/2026  
**Observação de continuidade:** este documento registra as decisões e a execução histórica da Etapa 1. A Etapa 2 — Dark Mode definitivo — também já foi concluída; a etapa atual do projeto é a Etapa 3 — refinamentos do fluxo de Resíduos.

Este documento registra as decisões oficiais fechadas na subetapa 1.1 e acompanha a implementação da Etapa 1 de pré-produção. Ele não redefine a identidade visual original do SGL; consolida os valores e regras que devem orientar as próximas subetapas sem quebrar o MVP funcional já aprovado.

Referências anteriores que continuam válidas:

- `IDENTIDADE_VISUAL.md`;
- `ICONOGRAFIA.md`;
- `PADROES_PAGINA.md`.

Em caso de divergência durante a Etapa 1, este documento representa a decisão mais recente para o refinamento visual de pré-produção.

---

## 1. Princípios aprovados

```text
preservar o MVP atual
→ não reconstruir o frontend
→ não migrar toda a aplicação para Vuetify
→ manter a identidade visual original
→ padronizar progressivamente
→ priorizar legibilidade e consistência
```

O objetivo da Etapa 1 é corrigir inconsistências visuais, não alterar regras de negócio nem fluxos funcionais aprovados.

O Login permanece fora deste refinamento, salvo necessidade específica futura.

O Dark Mode não será corrigido nesta etapa. A revisão definitiva do tema escuro fica reservada para a Etapa 2.

---

## 2. Identidade e cores semânticas

A identidade original permanece baseada nos azuis institucionais do SGL.

```text
AZUL
→ ação
→ identidade
→ informação
→ interação

VERDE
→ sucesso
→ confirmação

AMARELO
→ atenção
→ pendência

VERMELHO
→ erro
→ crítico
→ urgência

CINZA / NEUTRO
→ sem interação
→ informação secundária
→ estado neutro
```

Evitar cores puramente decorativas. Uma cor semântica deve representar um estado ou função real.

---

## 3. Dimensões-base aprovadas

| Elemento | Valor padrão |
|---|---:|
| Controle comum | `40 px` |
| Botão icon-only | `40 × 40 px` |
| Ícone comum | `20 px` |
| Chevron / seta | `24 px` |
| Raio botão/input/select | `6 px` |
| Raio card/tabela/container | `8 px` |
| Linha de tabela | `48 px` |
| Padding interno de card | `20 px` |

A densidade permanece média-compacta. A interface deve aproveitar bem o espaço sem sacrificar leitura.

---

## 4. Tipografia e legibilidade

Escala aprovada:

```text
Título de página   24 px / 700
Título de seção    18 px / 600–700
Título de card     16 px / 600
Texto normal       14 px / 400
Label              13 px / 600
Texto auxiliar     12 px mínimo
```

Regra de legibilidade:

> Não reduzir texto operacional para fazer conteúdo caber.

Valores extremamente pequenos existentes no MVP, como `6.5px`, `7.5px` ou equivalentes, devem ser tratados como inconsistências a serem corrigidas quando a tela correspondente for revisada.

---

## 5. Espaçamento

Grade oficial:

```text
4 px   → microajuste
8 px   → elementos muito próximos
12 px  → conteúdo interno relacionado
16 px  → espaçamento padrão
24 px  → grupos
32 px  → seções
```

Evitar valores arbitrários quando um valor da grade resolver o mesmo problema.

---

## 6. Bordas e sombras

### Bordas

```text
1 px
→ neutra
→ discreta
→ azul quando houver foco/seleção/interação
→ cor semântica apenas quando o estado justificar
```

### Sombras

```text
Nível 0
→ sem sombra
→ tabelas, formulários, seções internas e cards comuns

Nível 1
→ sombra muito suave
→ card navegável quando necessário, especialmente no hover

Nível 2
→ sombra perceptível
→ modal, dropdown e menu flutuante
```

Hierarquia preferida:

```text
espaço
→ fundo
→ borda
→ tipografia
→ sombra
```

---

## 7. Cards

Existem três famílias visuais principais.

### 7.1 Card de conteúdo/detalhe

- raio `8 px`;
- borda `1 px`;
- fundo branco no tema claro;
- padding `20 px`;
- sem hover se não for clicável;
- sem sombra ou sombra imperceptível.

### 7.2 Card navegável

Usa a mesma base do card de conteúdo, adicionando:

- indicação clara de interação;
- hover discreto em borda/fundo/sombra;
- seta/chevron alinhado dentro de área própria;
- cursor de interação.

### 7.3 Card KPI/indicador

- mesma linguagem de raio e superfície;
- número/dado principal em destaque;
- ícone de aproximadamente `24 px` quando necessário;
- cor semântica somente quando representar estado real;
- evitar transformar cada KPI em uma cor diferente apenas por decoração.

Regra original permanece:

```text
CARD   → resumo / indicador / agrupamento
TABELA → operação / consulta repetitiva
```

---

## 8. Iconografia

A implementação deve convergir para a iconografia do ecossistema **Vuetify / Material Design Icons (MDI)**, preservando a proposta original do projeto.

Padrão:

```text
normal → outline
ativo  → filled quando houver equivalente coerente
```

Tamanho comum: `20 px`.

Ícones devem complementar o texto e não substituir informação importante sem acessibilidade adequada.

SVGs locais ou símbolos improvisados podem permanecer temporariamente durante a migração incremental, mas não devem ser criados como novo padrão quando houver equivalente MDI adequado.

---

## 9. Filtros

Regra fechada:

> Todo controle visual que representa filtros deve utilizar o símbolo de **funil**.

Padrão preferido:

```text
[ Buscar... ] [ funil  Filtros ]
```

Quando houver filtros aplicados, pode existir contador/chip discreto:

```text
[ funil  Filtros  2 ]
```

Não utilizar setas, triângulos ou caracteres Unicode como símbolo de filtro.

---

## 10. Setas e chevrons

Setas são um dos principais focos de refinamento da Etapa 1.

Padrão aprovado:

```text
ícone       24 px
área        40 × 40 px quando icon-only
alinhamento central
traço       consistente
família     MDI
```

Sentido funcional:

```text
chevron-down   → expandir
chevron-up     → recolher
chevron-right  → abrir / navegar para detalhe
chevron-left   → voltar
```

Não utilizar `⌃`, `⌄`, `>`, `<` ou caracteres similares como controle visual.

A seta deve parecer um controle palpável, não um símbolo flutuando ao lado do conteúdo.

---

## 11. Botões

O padrão de botões original do SGL permanece. A Etapa 1 apenas elimina variações entre módulos.

### 11.1 Primário

Uso: ação principal do contexto.

```text
altura        40 px
raio          6 px
fundo         azul institucional
texto         branco
```

Exemplos: `Novo pedido`, `Salvar`, `Cadastrar`, `Aprovar`.

### 11.2 Secundário

Uso: ação auxiliar.

```text
altura        40 px
raio          6 px
fundo         claro/neutro
borda         1 px neutra
texto         azul/escuro
```

Exemplos: `Atualizar`, `Voltar`, `Cancelar edição`.

### 11.3 Perigo

Uso exclusivo para ação destrutiva ou crítica.

Exemplos: `Descartar`, `Excluir`, `Cancelar pedido`, `Encerrar definitivamente`.

Vermelho não deve ser usado apenas para aumentar destaque.

### 11.4 Icon-only

```text
área          40 × 40 px
ícone         20–24 px
alinhamento   central
```

Uso: setas, expandir/recolher, editar, busca e outros controles compactos.

Todo botão icon-only deve possuir nome acessível, como `aria-label`/`title` quando aplicável.

### Hierarquia

Por contexto, normalmente deve existir uma única ação visualmente primária.

Exemplo:

```text
[ Atualizar ]   [ + Novo estágio ]
 secundário          primário
```

---

## 12. Estados de interação

### Normal

Aparência base sem destaque excessivo.

### Hover

- alteração leve de fundo e/ou borda;
- sem saltos ou animações exageradas;
- microinteração apenas confirma resposta.

### Focus

- contorno azul visível de `2 px`;
- foco não deve depender apenas de mudança de cor difícil de perceber.

### Active / clique

- pequeno efeito de pressão;
- referência aproximada de escala: `98%`;
- duração curta.

### Disabled

- cinza/neutro;
- contraste reduzido, mas ainda legível;
- sem hover;
- cursor/estado coerente com indisponibilidade.

### Loading

- manter altura e largura do controle;
- evitar deslocamento de layout;
- utilizar indicador + texto quando necessário, por exemplo `Salvando...`.

---

## 13. Dark Mode

Decisão explícita:

> Durante a Etapa 1, o Dark Mode não foi corrigido junto com o refinamento visual.

Essa separação foi respeitada. A Etapa 2 tratou o Dark Mode de forma própria e já foi concluída e validada em 11/09/2026.

---

## 14. Status da Etapa 1

```text
1.1 — Definir padrão visual SGL             ✅ concluída
1.2 — Fundação visual compartilhada          ✅ concluída
1.3 — Padronizar componentes básicos         ✅ concluída
1.4 — Aplicar tela a tela                     ✅ concluída
1.5 — Limpar exceções/CSS corretivo           ✅ concluída
1.6 — Revisão visual final                    ✅ concluída
```

A Etapa 1 está encerrada. As instruções de execução incremental mantidas neste documento devem ser interpretadas como registro histórico das decisões adotadas, não como trabalho pendente.

---

## 15. Implementação da subetapa 1.2

A fundação visual compartilhada foi criada sem migrar as Views existentes.

Arquivos:

```text
src/styles/tokens.css
→ concentra valores aprovados de dimensões, tipografia, espaçamento,
  semântica, estados, bordas, raios, sombras e interação

src/styles/foundation.css
→ classes compartilhadas para tipografia, controles, botões,
  icon-only, filtros, cards, status e linhas de tabela

src/main.ts
→ carrega foundation.css depois dos tokens/base
```

Decisões de implementação:

- nenhuma View foi alterada na 1.2;
- as novas classes não substituem automaticamente estilos legados;
- a migração será progressiva na 1.3/1.4;
- a iconografia MDI será aplicada quando os componentes básicos forem padronizados;
- nenhum ajuste de Dark Mode faz parte desta implementação;
- o objetivo desta camada é permitir que telas antigas e novas compartilhem o mesmo padrão sem quebrar o MVP.

---

## 16. Regra de continuidade

Como a Etapa 1 está encerrada, estas regras passam a funcionar como critérios de preservação do padrão visual em etapas posteriores. Toda IA ou pessoa que alterar a aparência do SGL deve:

1. ler este documento antes de alterar aparência;
2. preservar as decisões fechadas na 1.1;
3. usar os tokens/classes criados na 1.2 em vez de criar novo padrão local por tela;
4. evitar criar novo padrão visual local por tela;
5. preservar a arquitetura definitiva do Dark Mode fechada na Etapa 2 e não recriar soluções provisórias;
6. comparar mudanças com o padrão já aprovado e evitar regressões funcionais;
7. registrar novas decisões visuais no documento da etapa correspondente antes de espalhá-las pela aplicação.
