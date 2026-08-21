# Sidebar e Alertas Operacionais — SGL Frontend

**Etapa:** 1.3 — Figma e padrões visuais  
**Status:** decisão conceitual aprovada; implementação futura

Este documento registra o comportamento conceitual da sidebar e da central de alertas operacionais. Não representa implementação Vue, CSS, Vuetify ou integração de API nesta etapa.

---

# 1. Posição da central de alertas

A central de alertas será exibida somente para responsabilidades de **Gestão** e **Administração**.

Posição conceitual na sidebar aberta:

```text
[ LOGO SGL ]                       [ ‹ ]

Aparência                    [ ☀ | 🌙 ]

💡 Alertas                         [N]

PRINCIPAL
Dashboard
Pedidos
Estoque
Movimentações
Relatórios
...
```

A central deve funcionar como indicador de atenção operacional, e não como uma área genérica de notificações sociais.

---

# 2. Estado visual da lâmpada

A lâmpada representa o maior nível de severidade atualmente existente entre os alertas.

```text
AZUL
→ nenhuma pendência
→ lâmpada visualmente "desligada"
→ badge de quantidade pode ser omitida quando total = 0

AMARELO
→ existem pendências que exigem atenção
→ exemplo: pedidos pendentes, estoque baixo, lotes próximos do vencimento

VERMELHO
→ existe ao menos uma pendência urgente/crítica
→ exemplo: produto/lote vencido
```

Regra de prioridade:

```text
se houver alerta vermelho
→ lâmpada vermelha

senão, se houver alerta amarelo
→ lâmpada amarela

senão
→ lâmpada azul
```

O número ao lado da lâmpada representa a quantidade total de pendências consolidadas.

---

# 3. Sidebar aberta — clique e hover

Na sidebar aberta, o comportamento é dividido em duas interações distintas.

## Clique na lâmpada

O clique expande/recolhe a lista de categorias de alerta:

```text
💡 Alertas                         [6]
│
├─ Pedidos pendentes               [2]
├─ Estoque baixo                   [2]
├─ Próximos do vencimento          [1]
└─ Vencidos                        [1]
```

A expansão deve ser suave e curta, seguindo o padrão de motion aprovado para submenus.

## Hover sobre uma categoria

O hover **não abre a central inteira**. Ele mostra apenas uma breve descrição contextual referente à categoria apontada.

Exemplo:

```text
Pedidos pendentes [2]
        ───────────────►
        2 pedidos aguardando análise.
        Laboratórios: Química Orgânica e Biologia.
```

Outro exemplo:

```text
Estoque baixo [2]
        ───────────────►
        2 itens estão abaixo do estoque mínimo.
        Clique para visualizar os itens.
```

Outro exemplo:

```text
Próximos do vencimento [2]
        ───────────────►
        2 lotes estão próximos do vencimento.
        Clique para visualizar os lotes.
```

A descrição deve ser curta. Quando houver informação extra útil, pode incluir um pequeno resumo, como laboratório, unidade ou quantidade crítica, sem transformar o hover em uma tabela completa.

---

# 4. Clique nas categorias

Cada categoria deve levar o usuário ao contexto operacional correto, preferencialmente já filtrado.

```text
Pedidos pendentes
→ Pedidos
→ filtro/status = PENDENTE

Estoque baixo
→ Estoque
→ modo/filtro = Estoque baixo

Próximos do vencimento
→ Estoque / Lotes
→ filtro de validade futura

Vencidos
→ Estoque / Lotes
→ filtro = Vencidos
```

A central de alertas não deve duplicar a tela de operação. Ela serve como ponto de entrada rápido para pendências.

---

# 5. Sidebar recolhida

Quando a sidebar estiver recolhida, permanece apenas o ícone da lâmpada com seu estado semântico.

```text
┌────┐
│ 💡 │
└────┘
```

Ao passar o mouse sobre a lâmpada recolhida, abre um pequeno painel lateral resumido:

```text
       ┌──────────────────────────────┐
💡 ───►│ Alertas                  6   │
       │ Pedidos pendentes        2   │
       │ Estoque baixo            2   │
       │ Próximos do vencimento   1   │
       │ Vencidos                 1   │
       └──────────────────────────────┘
```

Esse painel deve ser leve, temporário e permitir acesso rápido às mesmas categorias.

O clique continua podendo abrir a central completa/contextual conforme o padrão definitivo do shell.

---

# 6. Categorias iniciais

Categorias previstas para Gestão/Administração:

| Categoria | Severidade padrão | Objetivo |
|---|---|---|
| Pedidos pendentes | Amarelo | pedidos aguardando análise |
| Estoque baixo | Amarelo | itens abaixo do mínimo configurado |
| Próximos do vencimento | Amarelo | lotes que se aproximam da validade |
| Vencidos | Vermelho | lotes cuja validade já foi ultrapassada |

Outras categorias poderão ser adicionadas somente quando houver necessidade funcional real.

---

# 7. Validade — situação atual do backend

O backend já possui suporte para consultar **lotes vencidos**.

Contrato atual:

```text
GET /api/v1/lotes/vencidos
```

Por outro lado, **lotes próximos do vencimento** já fazem parte do planejamento funcional do frontend, mas ainda não possuem endpoint específico por janela de dias no backend.

Portanto:

```text
Vencidos
→ suportado atualmente pelo backend

Próximos do vencimento
→ manter no design e na UX
→ implementar quando existir regra/consulta oficial de janela de validade
→ não inventar cálculo definitivo no frontend como regra de domínio
```

A futura regra deverá definir, por exemplo, o que significa "próximo do vencimento" (7, 15, 30 dias ou configuração própria) antes da implementação.

---

# 8. Regra de informação no hover

O hover deve responder rapidamente à pergunta:

> "Por que este alerta está aparecendo?"

Estrutura preferida:

```text
quantidade + situação
+ uma informação contextual útil, quando disponível
+ indicação de que o clique leva ao detalhe
```

Evitar:

- listas longas dentro do hover;
- excesso de dados;
- operações destrutivas dentro do tooltip;
- informações que exijam rolagem;
- duplicação completa da tela de destino.

---

# 9. Integração com a linguagem visual dos ícones

A lâmpada segue o padrão de ícones aprovado:

```text
estado neutro
→ ícone visível, monocromático

hover
→ microanimação curta

click
→ pequeno efeito de pressão

estado semântico
→ cor comunica severidade
```

As categorias internas também seguem a paleta semântica do SGL.

Regra principal:

```text
azul = normal / sem pendência
amarelo = atenção / pendência
vermelho = crítico / urgente
```

O verde permanece reservado a sucesso/confirmação, e não deve ser usado para indicar ausência de alertas na lâmpada.

---

# 10. Resumo aprovado

```text
Gestor/Admin
→ possuem central de alertas na sidebar

Lâmpada azul
→ nada pendente

Lâmpada amarela
→ existem pendências

Lâmpada vermelha
→ existe pendência urgente

Sidebar aberta
→ clique expande categorias
→ hover na categoria mostra breve descrição contextual

Sidebar recolhida
→ hover na lâmpada abre painel lateral resumido

Clique em categoria
→ leva ao contexto/tela correta já filtrada

Categorias iniciais
→ pedidos pendentes
→ estoque baixo
→ próximos do vencimento
→ vencidos
```
