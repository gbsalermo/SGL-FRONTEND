# Identidade visual — SGL Frontend

**Etapa:** 1.3 — Figma e padrões visuais  
**Status:** referência conceitual aprovada; implementação futura

Este documento registra somente as decisões de design escolhidas para orientar os wireframes e a implementação posterior. Nesta etapa não devem ser criados componentes, tema Vuetify, CSS definitivo ou código de interface a partir destas decisões.

---

# 1. Referência institucional principal

A referência visual principal do SGL será a interface do sistema **Publica / Embrapa**, especialmente a tela de login apresentada durante o planejamento e o padrão global de cores/tipografia do projeto de referência.

Objetivo:

```text
manter familiaridade institucional
+ aparência corporativa e limpa
+ forte contraste entre branco e azuis institucionais
+ uso comedido do verde Embrapa
+ bastante espaço visual e hierarquia simples
```

A intenção é manter a linguagem institucional, sem copiar integralmente a implementação ou o CSS do sistema de referência.

---

# 2. Direção visual aprovada

O SGL deverá transmitir:

- ambiente administrativo/laboratorial;
- aparência clean;
- leitura rápida;
- predominância de branco e superfícies claras;
- azul como identidade principal;
- verde como identidade secundária/semântica;
- baixa carga decorativa;
- contraste e legibilidade acima de efeitos visuais.

Regra conceitual:

```text
branco e neutros claros
→ base da interface

azul institucional
→ navegação, ações principais, títulos e identidade

verde institucional
→ apoio visual, sucesso e situações semanticamente adequadas
```

Evitar uma interface inteiramente azul ou inteiramente colorida. As cores institucionais devem marcar hierarquia e estado, não preencher todas as superfícies.

---

# 3. Paleta institucional escolhida

A paleta de referência vem do projeto modelo da empresa.

## Azuis

| Papel conceitual | Cor |
|---|---|
| Azul principal | `#1A4DA1` |
| Azul escuro | `#0D2B5E` |
| Azul claro | `#2D6BC4` |

Uso esperado:

```text
#1A4DA1
→ ação principal
→ elemento institucional
→ destaque ativo

#0D2B5E
→ navegação escura
→ áreas institucionais de maior peso visual

#2D6BC4
→ hover, seleção e destaques mais leves
```

## Verdes

| Papel conceitual | Cor |
|---|---|
| Verde institucional | `#007A3D` |
| Verde claro | `#4EA674` |
| Verde suave | `#A5D6A7` |

O verde não deve competir com o azul como cor principal do sistema. Seu uso deve ser secundário e, quando adequado, semântico.

## Neutros

| Papel conceitual | Cor |
|---|---|
| Fundo da aplicação | `#F5F7FA` |
| Superfície / cards | `#FFFFFF` |
| Texto principal | `#1A1A2E` |
| Texto secundário | `#64748B` |
| Bordas | `#E2E8F0` |

Direção de proporção visual:

```text
predominância de superfícies brancas e neutras
+ azul institucional em pontos de atenção
+ verde apenas como apoio
```

---

# 4. Tipografia escolhida

Fonte principal: **Inter**.

Fallback conceitual: Roboto / sans-serif.

Motivos:

- boa legibilidade em aplicações administrativas;
- bom desempenho em tabelas, filtros, formulários e dashboards;
- leitura clara de números e textos pequenos;
- aparência moderna sem perder formalidade institucional.

A hierarquia exata de tamanhos e pesos será fechada posteriormente no mini Design System. Nesta etapa fica aprovada apenas a família tipográfica e a direção de uso.

---

# 5. Uso conceitual das cores em ações

Regra inicial:

```text
ação primária
→ azul principal

ação secundária
→ superfície branca / neutra com destaque azul

sucesso ou confirmação semanticamente positiva
→ verde

ação destrutiva
→ cor semântica de erro a definir no Design System
```

O verde do projeto de referência não será automaticamente usado como cor de todo botão principal do SGL. O azul será a cor de ação primária por coerência com a identidade do login e com a navegação institucional.

---

# 6. Login — referência estrutural aprovada

A tela de login do Publica será a principal referência estrutural para o login do SGL.

Estrutura conceitual:

```text
DESKTOP

metade esquerda
→ área institucional azul
→ identidade Embrapa/SGL
→ nome do sistema
→ mensagem institucional curta
→ elementos decorativos discretos

metade direita
→ superfície branca
→ marca SGL
→ mensagem de boas-vindas
→ usuário
→ senha
→ ação Entrar
```

A tela deve preservar:

- contraste forte azul × branco;
- composição simples;
- poucos elementos;
- familiaridade com os sistemas internos da empresa;
- formulário centralizado e de leitura imediata.

A identidade do SGL substituirá a identidade específica do Publica, mantendo a linguagem visual institucional.

---

# 7. Relação com o projeto modelo

O CSS e a tela do projeto modelo são **referências de design**, não código-base para copiar.

Devem ser reaproveitados conceitualmente:

- paleta;
- tipografia;
- contraste;
- leveza visual;
- linguagem de login;
- uso institucional de azul e verde.

Devem ser redefinidos posteriormente de acordo com a arquitetura do SGL:

- tema do framework visual;
- botões;
- tabelas;
- modais;
- fieldsets;
- scrollbars;
- estilos globais;
- componentes e estados.

Código específico do projeto antigo, seletores de versão anterior do framework e nomes ligados ao domínio do Publica não devem ser transportados automaticamente.

---

# 8. Decisão de processo

Durante a Etapa 1.3 trabalharemos primeiro os **conceitos e padrões visuais**.

Fluxo aprovado:

```text
referência institucional
→ decisão conceitual
→ wireframes
→ padrões visuais
→ mini Design System
→ confirmação da stack
→ implementação seguindo a arquitetura do frontend
```

Portanto, enquanto estivermos nesta etapa:

```text
não transformar decisão visual em CSS definitivo
não criar componentes apenas para experimentar a ideia
não configurar tema Vuetify antes da etapa técnica
não misturar exploração visual com implementação
```

---

# 9. Estado atual da identidade

## Fechado

- referência institucional: Publica / Embrapa;
- direção visual clean e corporativa;
- predominância branco + azul;
- azul como cor principal;
- verde como apoio institucional/semântico;
- paleta base aprovada;
- Inter como tipografia principal;
- login do Publica como referência estrutural do login SGL.

## Próximos conceitos a definir

- espaçamento;
- bordas e arredondamentos;
- sombras;
- densidade visual;
- estilo de ícones;
- shell principal: sidebar + topbar + conteúdo;
- padrões de tabelas, formulários e estados.

Nenhum desses itens deve ser tratado como código até o momento de implementação correspondente.
