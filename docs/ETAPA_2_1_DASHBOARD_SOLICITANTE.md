# Etapa 2.1 — Dashboard do Solicitante

## Rota

`/inicio`

## Status

Piloto aplicado e em validação visual.

## Direção aprovada

A paleta combina as referências visuais 1 e 2 escolhidas para a Etapa 2:

- fundo navy profundo;
- superfícies escuras em camadas;
- bordas discretas;
- contraste alto sem branco puro em grandes áreas;
- azul como ação/informação;
- verde como sucesso;
- amarelo/âmbar como atenção;
- vermelho como crítico/erro;
- roxo apenas como acento secundário quando fizer sentido.

## Decisões específicas do Dashboard do Solicitante

A diferenciação visual por domínio permanece explícita também no Dark Mode:

```text
Acompanhamento de Pedido  → azul
Acompanhamento de Resíduo → creme/âmbar
```

O creme do Resíduo não deve desaparecer no modo escuro. Ele é traduzido para uma superfície âmbar escura, mantendo textos, bordas e linha do tempo em uma família creme/âmbar coerente.

## Refinamentos solicitados durante a validação

- [x] corrigir o chip `ENTREGUE`, que ainda aparecia com aparência clara no Dark Mode;
- [x] reforçar a linha do tempo do Resíduo em creme/âmbar;
- [x] aplicar a mesma correção da linha do tempo do Resíduo também no Light Mode;
- [x] adicionar contorno semântico aos cards de indicadores superiores;
- [x] reforçar no hover a cor correspondente a cada situação:
  - Pedidos pendentes → vermelho;
  - Pedidos aprovados → verde;
  - Resíduos ativos → âmbar;
  - Pedidos entregues → azul.

## Arquivos do piloto

- `src/styles/etapa-2-solicitante-dashboard.css`
- `src/styles/etapa-2-solicitante-dashboard-ajustes.css`

A implementação ainda é uma camada visual de piloto carregada depois das coberturas antigas de Dark Mode. A limpeza estrutural e a fonte única de tema continuam previstas nas subetapas seguintes, depois da aprovação visual da paleta.

## Próximo passo

Após aprovação desta tela:

```text
merge do Dashboard do Solicitante
→ próxima interface do Solicitante: /meus-pedidos
```
