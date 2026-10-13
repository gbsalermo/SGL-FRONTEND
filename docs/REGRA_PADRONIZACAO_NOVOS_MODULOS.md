# Regra obrigatória — Padronização visual de novos módulos do SGL

**Origem:** auditoria de identidade da Etapa 7.4 (13/10/2026).  
**Aplicação:** qualquer View nova ou reformulada, Gestão, Administração e Solicitante.

## Ordem de autoridade

1. `docs/PADRAO_VISUAL_PRE_PRODUCAO.md` — refinamento vigente, densidade, tipografia, dimensões, prioridade de elementos.
2. `docs/IDENTIDADE_VISUAL.md` — paleta e linguagem institucional aprovadas.
3. `docs/ETAPA_2_DARK_MODE.md` — paridade claro/escuro, fonte única do tema.
4. `docs/ETAPA_1_3_COMPONENTES_BASICOS.md` — componentes visuais compartilhados.
5. `docs/PADROES_PAGINA.md`, `docs/ICONOGRAFIA.md`, `docs/GUIA_EFEITOS_VISUAIS.md` — composição, ícones e interações.
6. `src/styles/tokens.css`, `src/styles/foundation.css`, `src/components/common` — implementação-base; código de telas consolidadas de Resíduos, Pedidos e Cadastros serve de referência apenas **quando não conflitar com as regras acima**.

## Regras de implementação

- Não iniciar o CSS ou a composição de uma nova View sem ler os documentos-base e verificar se já existem componentes `Sgl*` equivalentes.
- Reutilizar `SglButton`, `SglCard`, `SglStatusChip`, `SglTextField`, `SglSelect`, `SglBreadcrumb`, `SglIconButton`, `SglChevronButton` e `SglFilterButton` onde pertinentes. Não criar famílias visuais paralelas como `sol-btn`, `sol-card` etc. para duplicar base de botão/card/chip.
- Componente próprio apenas se houver **comportamento específico de domínio**, não para modificar aparência já padronizada.
- Utilizar `--sgl-*` para cores, tipografia, espaçamento, bordas, raios, dimensões, transições, estados e sombras. Valores locais de layout só quando justificados e sem conflitar com os tokens.
- Fonte Inter; título 24 px, seção 18 px, card 16 px, corpo 14 px, label 13 px, auxiliar não inferior a 12 px.
- Controles 40 px; raio de controles 6 px; cartões e superfícies 8 px; espaçamento na grade de 4/8/12/16/24/32 px.
- Em operações recorrentes preferir **tabela**; cards resumem informação/indicadores. Não criar cards gigantes por registro para substituírem tabelas de operação.
- Botão vermelho apenas para ação crítica/destrutiva; a tela possui normalmente uma ação primária por contexto. Cor de destaque de KPI somente se houver significado semântico real.
- Ícones preferencialmente MDI e com tamanho/estilo documentados, sem SVG improvisado como novo padrão.
- O modo escuro usa **a mesma organização e densidade** do claro: só superfícies/contrastes/cores semânticas se adaptam. Não recriar layout, não fixar tons claros no dark e não forçar CSS `!important` para contornar problemas de estrutura.
- Modais usam overlay com blur discreto, conteúdo nítido, dimensões e transições compartilhadas. Não multiplicar implementações de backdrop.
- A permissão de tela não substitui autorização em API. Mudanças de apresentação não podem alterar regras de negócio.

## Checklist obrigatório antes de solicitar validação visual

- [ ] Componentes compartilhados reaproveitados; ausência de duplicação visual desnecessária.
- [ ] Tokens institucionais aplicados; nenhum hex hardcoded sem papel semântico documentado.
- [ ] Escala tipográfica, altura dos controles, raios, espaçamento e densidade revisados.
- [ ] Organização equivalente às Views homologadas mais próximas.
- [ ] Mesmo layout em tema claro e escuro; textos, modais, formulários e estados funcionais legíveis.
- [ ] Responsividade desktop e mobile.
- [ ] Hover/foco/disabled/feedback acessíveis e discretos.
- [ ] `npm run build` e smoke funcional confirmados pelo desenvolvedor.
- [ ] Sem regressão em módulos anteriores.

## Achados da auditoria da 7.4

A implementação inicial de Soluções utilizou uma linguagem paralela com `sol-btn`, `sol-card`, `sol-pill`, cores e escalas CSS próprias, além de formulário/modal específicos com regras já cobertas pela fundação. Também surgiram contrastes incoerentes no Dark Mode e uma organização diferente das Centrais consolidadas.

**Correção iniciada:** a Central de Soluções passou a usar `SglButton`, `SglCard`, `SglStatusChip` e `SglBreadcrumb`, além dos tokens comuns. O trabalho **não está encerrado**: Solicitante, formulário administrativo e os componentes próprios remanescentes devem passar pela mesma revisão antes da validação final.

**Status:** auditoria documentada; refatoração visual **em andamento**, sem autorização para declarar a 7.4 concluída. Nenhum merge por causa desta revisão.
