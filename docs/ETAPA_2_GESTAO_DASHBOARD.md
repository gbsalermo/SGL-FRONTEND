# Etapa 2 — Dashboard da Gestão

## Status

Em validação — 10/09/2026.

## Escopo

Primeira interface da Gestão adaptada ao Dark Mode definitivo:

- `/dashboard` — `DashboardGestaoView.vue`.

Esta tela passa a ser a referência visual para as demais interfaces administrativas.

## Direção visual

A paleta segue a combinação aprovada a partir dos protótipos 1 e 2:

- fundo navy profundo;
- superfícies em camadas;
- bordas discretas;
- contraste alto;
- sem glow;
- cores semânticas aplicadas apenas onde comunicam estado, ação ou prioridade.

## Ajustes principais

### KPIs

- Pedidos: azul;
- Urgentes: vermelho;
- Baixo estoque: laranja;
- Resíduos a analisar: roxo;
- Vencendo em 30 dias: âmbar.

Cada KPI usa semântica no contorno, ícone e hover, mantendo superfície navy em repouso.

### Precisa de atenção

- fundo navy uniforme;
- prioridade preservada por barra lateral, ícone, chip e hover;
- texto principal e secundário com hierarquia clara.

### Últimas movimentações

- Entrada: azul;
- Saída: vermelho;
- Ajuste: roxo;
- Devolução: verde;
- Descarte: âmbar.

### Resumo por laboratório

- tabs adaptadas;
- card do laboratório em superfície elevada;
- métricas internas com fundo mais profundo;
- valores semânticos preservados;
- navegação integrada ao tema.

### Resumo rápido

- cards compactos em navy;
- diferenciação por borda/ícone;
- rodapé operacional integrado.

## Restrições

- nenhuma regra de negócio alterada;
- nenhum service, store, rota ou payload alterado;
- Light Mode permanece intacto;
- Login/404 continuam claros;
- o CSS desta rodada atua apenas quando `body.sgl-dark-active` e dentro de `.gestao-main .dashboard-page`.

## Próximo passo

Validar visualmente o Dashboard da Gestão em Dark e Light.

Se aprovado:

```text
/dashboard Gestão aprovado
→ merge
→ próxima interface da Gestão
```
