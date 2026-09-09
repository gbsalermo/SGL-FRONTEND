# Etapa 1.4 — Piloto visual de Pedidos

**Status:** EM VALIDAÇÃO VISUAL  
**Escopo:** primeira aplicação tela a tela do padrão visual aprovado na Etapa 1.1.

Este piloto valida a mesma linguagem visual nas duas interfaces autenticadas antes de expandir a Etapa 1.4 para os demais módulos.

## Telas do piloto

### Gestão / Admin

```text
/pedidos
→ PedidosGestaoView.vue
```

### Solicitante / Usuário

```text
/meus-pedidos
→ MeusPedidosView.vue
```

A tela de Login não faz parte deste piloto.

O Dark Mode não é critério de aceite desta etapa; sua revisão definitiva permanece reservada para a Etapa 2.

---

## O que foi aplicado

- título de página em `24 px`;
- texto operacional priorizando `14 px`;
- labels em `13 px`;
- texto auxiliar mínimo em `12 px`;
- controles principais em `40 px`;
- raio de controles em `6 px`;
- cards/containers em `8 px`;
- padding de cards aproximado de `20 px`;
- sombras removidas/reduzidas quando não necessárias;
- filtros da Gestão com símbolo de funil;
- remoção visual das setas Unicode do filtro;
- botão de detalhe da Gestão com área `40 × 40 px` e chevron `24 px`;
- botão de detalhe do Solicitante com área `40 × 40 px` e chevron `24 px`;
- chips/status com legibilidade mínima de `12 px`;
- ações operacionais da Gestão padronizadas em altura, raio e semântica de cores;
- foco visível em controles relevantes;
- estado desabilitado coerente;
- respeito a `prefers-reduced-motion`.

A aplicação foi feita por adaptador visual CSS para evitar reescrever, neste primeiro teste, duas Views grandes que concentram regra operacional.

---

## Checklist — Gestão / Pedidos

Testar em `/pedidos`:

- [ ] título, subtítulo e breadcrumb estão legíveis e proporcionais;
- [ ] botão `Atualizar` tem tamanho e hierarquia adequados;
- [ ] cards Pendentes/Urgentes/Aprovados/Entregues mantêm leitura clara;
- [ ] botão `Filtros` mostra funil e não mostra `⌃`/`⌄`;
- [ ] abrir/fechar filtros continua funcionando;
- [ ] Status, Urgência, Laboratório, datas, ordenação e ordem continuam filtrando normalmente;
- [ ] `Limpar filtros` continua funcionando;
- [ ] tabela permanece legível sem texto microscópico;
- [ ] chips de status continuam semanticamente corretos;
- [ ] urgência continua vermelha;
- [ ] botão de detalhe está claramente clicável em `40 × 40 px`;
- [ ] chevron de detalhe tem presença visual adequada e gira ao abrir/recolher;
- [ ] expandir/recolher Pedido continua funcionando;
- [ ] quantidades solicitadas/aprovadas permanecem legíveis;
- [ ] aprovação continua funcionando;
- [ ] rejeição continua funcionando;
- [ ] registro de entrega continua funcionando;
- [ ] cancelamento continua funcionando;
- [ ] carregamento dos lotes utilizados continua funcionando;
- [ ] foco por teclado é perceptível;
- [ ] controles desabilitados continuam identificáveis.

---

## Checklist — Solicitante / Meus Pedidos

Testar em `/meus-pedidos`:

- [ ] título, subtítulo e breadcrumb estão legíveis e proporcionais;
- [ ] botão `Novo pedido` está em `40 px` e continua navegando para criação;
- [ ] cards Pendentes/Aprovados/Entregues seguem a mesma linguagem da Gestão;
- [ ] busca continua funcionando;
- [ ] filtro por Status continua funcionando;
- [ ] tabela permanece legível;
- [ ] chips de status continuam semanticamente corretos;
- [ ] urgência continua vermelha;
- [ ] botão de detalhe está claramente clicável em `40 × 40 px`;
- [ ] chevron usa `24 px` e gira ao expandir/recolher;
- [ ] detalhes do pedido continuam abrindo e fechando;
- [ ] materiais, quantidades, projeto, laboratório e observação continuam legíveis;
- [ ] estado vazio continua correto;
- [ ] estado de erro e `Tentar novamente` continuam corretos;
- [ ] foco por teclado é perceptível.

---

## Checklist — regressão

- [ ] Login não mudou;
- [ ] nenhuma regra de negócio de Pedido mudou;
- [ ] nenhuma chamada HTTP foi alterada;
- [ ] sessão DEV continua igual;
- [ ] contexto de Unidade continua igual;
- [ ] outras telas ainda mantêm o visual anterior enquanto não passam pela Etapa 1.4;
- [ ] comportamento em largura menor continua utilizável.

---

## Critério para avançar

O piloto só deve ser integrado à `main` depois da validação visual das duas interfaces.

Após aceite:

```text
Pedidos Gestão + Solicitante aprovados
→ registrar ajustes finais do piloto
→ merge
→ expandir Etapa 1.4 para os próximos módulos
```

Ordem sugerida após o piloto:

```text
Dashboard Gestão + Dashboard Solicitante
→ Estoque / Lotes
→ Movimentações
→ Estagiários
→ Resíduos
→ Relatórios
→ Administração
→ formulários restantes do Solicitante
```
