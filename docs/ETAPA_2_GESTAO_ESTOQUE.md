# Etapa 2 — Estoque da Gestão

## Status

Concluída e validada — 10/09/2026.

## Escopo

Aplicação do Dark Mode definitivo no domínio de Estoque:

- `/estoque`;
- `/estoque/lotes-vencendo`;
- `/estoque/:id`.

## Regra de paridade com o Light Mode

A adaptação preserva o padrão visual aprovado na Etapa 1:

- título de página em 24px;
- corpo em 14px;
- labels em 13px;
- helpers em 12px;
- controles em 40px;
- mesma hierarquia, densidade, espaçamento e organização;
- mesma escala ampliada do modal de detalhes do lote;
- mesmas áreas de chevron e ações.

O Dark Mode altera principalmente paleta, contraste, estados, hover e foco.

## Semântica

- azul: ação, informação e navegação;
- verde: situação normal/sucesso;
- amarelo/âmbar: estoque baixo e proximidade de vencimento;
- vermelho: zerado, vencido, descarte e estado crítico;
- cinza: neutro, esgotado ou descartado quando aplicável.

## /estoque

- cards de resumo em navy com semântica por borda e valor;
- busca e filtros escuros;
- tabela em camadas;
- chips de situação adaptados;
- hover de linha neutro;
- chevron de detalhe preservado.

## /estoque/lotes-vencendo

- cards de 30 dias / 7 dias / hoje adaptados;
- aviso de validade em âmbar;
- busca e resultado integrados ao tema;
- prazo crítico/atenção/próximo preservado semanticamente;
- tabela e chevrons adaptados.

## /estoque/:id

- contexto do produto;
- resumo e seletor de visualização;
- card de lotes;
- filtros e tabela;
- chips de lote;
- destaque vindo de rota em azul;
- modal de nova entrada;
- modal de detalhe do lote;
- histórico de saídas;
- modal de descarte de vencidos;
- mensagens de sucesso e erro.

## Detalhes de lote

A escala ampliada aprovada na Etapa 1 foi preservada no Dark Mode:

- modal até 920px;
- padding interno maior;
- labels em 13px;
- valores em 14–16px;
- grid com mínimo de 72px por bloco;
- histórico de saídas legível.

## Restrições

- nenhuma regra FIFO/FEFO alterada;
- nenhum saldo, lote, entrada ou descarte alterado em nível funcional;
- nenhum service, rota ou payload alterado;
- Light Mode permanece intacto;
- Login/404 continuam claros.

## Validação final

As três interfaces foram conferidas em Light e Dark sem necessidade de ajustes adicionais.

## Próximo passo

Seguir para Gestão → `/movimentacoes`.
