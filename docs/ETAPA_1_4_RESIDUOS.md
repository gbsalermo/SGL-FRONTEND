# Etapa 1.4 — Aplicação visual em Resíduos

## Status

Em validação visual.

## Escopo

Telas cobertas nesta rodada:

- Gestão/Admin: `/residuos`
- Solicitante: `/meus-residuos`
- Solicitante: `/residuos/novo`

Nenhuma regra de negócio, service, API, rota ou transição de status foi alterada.

## Objetivo visual

Aplicar o padrão fechado na Etapa 1.1 preservando a identidade própria de Resíduos.

A diferenciação do domínio utiliza fundo amarelo/creme suave em superfícies específicas, sem substituir as cores semânticas de status:

- azul = ação/informação;
- verde = sucesso;
- amarelo = atenção/status quando aplicável;
- vermelho = erro/crítico;
- creme suave = identidade visual de Resíduos, sem significado operacional isolado.

## Principais ajustes

- títulos de página em 24 px;
- seções em 18 px e cards em 16 px;
- textos operacionais e auxiliares elevados para pelo menos 12 px nos pontos cobertos;
- controles e botões em 40 px;
- raio de controles em 6 px e superfícies em 8 px;
- sombras reduzidas;
- cards de Resíduos com diferenciação creme suave;
- tabela da Gestão com tipografia e espaçamento ampliados;
- ações operacionais da Gestão padronizadas em azul;
- status continuam com cores semânticas próprias;
- `Ver detalhes` do Solicitante utiliza chevron gráfico de 24 px em vez de seta Unicode;
- foco visível e reduced-motion tratados.

## Checklist — Solicitante `/meus-residuos`

- [ ] título, breadcrumb e descrição legíveis;
- [ ] botão `Informar resíduo` com 40 px;
- [ ] cards de resumo equilibrados;
- [ ] busca e status alinhados;
- [ ] cards de resíduos com fundo creme suave sem excesso de amarelo;
- [ ] status facilmente identificáveis;
- [ ] `Ver detalhes` com chevron grande e claro;
- [ ] drawer de detalhes legível;
- [ ] composição, risco e andamento sem fontes pequenas;
- [ ] responsividade preservada.

## Checklist — Solicitante `/residuos/novo`

- [ ] contexto de gerador/laboratório legível;
- [ ] seções numeradas com identidade creme suave;
- [ ] inputs/selects com 40 px;
- [ ] labels e textos auxiliares legíveis;
- [ ] seleção de risco clara;
- [ ] adicionar/remover componente funcionando;
- [ ] alternância catálogo/componente livre funcionando;
- [ ] componente principal funcionando;
- [ ] mensagens de erro/aviso legíveis;
- [ ] envio do resíduo funcionando;
- [ ] superfície de sucesso legível;
- [ ] responsividade preservada.

## Checklist — Gestão `/residuos`

- [ ] título e métricas legíveis;
- [ ] abas de status com contadores claros;
- [ ] busca com 40 px;
- [ ] tabela legível em zoom 100%;
- [ ] linhas não utilizam textos minúsculos;
- [ ] status continuam semanticamente distintos;
- [ ] Receber funciona;
- [ ] Analisar funciona;
- [ ] Armazenar funciona;
- [ ] Despachar funciona;
- [ ] Visualizar rótulo continua disponível somente quando permitido;
- [ ] drawer de detalhes legível;
- [ ] histórico/rastreabilidade legível;
- [ ] modais operacionais legíveis;
- [ ] responsividade preservada.

## Fora do escopo

Não antecipar nesta rodada os refinamentos funcionais da Etapa 3, incluindo mudanças de fluxo, rótulo, impressão Zebra ou regras adicionais de armazenamento. Aqui a intervenção é exclusivamente visual.

Dark Mode permanece reservado para a Etapa 2.
