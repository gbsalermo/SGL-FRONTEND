# Capturas de tela para apresentação do SGL

**Referência editorial:** 18/11/2026. Esta pasta reúne imagens **reais e revisadas**, não telas simuladas para aparentar funcionalidades, resultados ou homologação. Não publicar imagens com dados institucionais ou pessoais.

## Evidência disponível

- `login-final.png` — captura versionada da tela de acesso, já exibida no [README principal](../../README.md).
- **Dashboard, Pedidos, Estoque, Relatórios e fluxo de Estagiário:** ainda não há captura recente aprovada nesta pasta. Não criar links Markdown para arquivos inexistentes.

A imagem atualmente publicada usa:

```markdown
![Tela de acesso do SGL — captura aprovada e versionada no repositório](docs/screenshots/login-final.png)
```

## Capturas que completariam a apresentação

| Jornada | Nome sugerido (somente após validação) | O que demonstrar |
|---|---|---|
| Gestão — visão geral | `dashboard-gestao.png` | Indicadores e navegação por módulo |
| Solicitante — novo pedido | `pedido-material.png` | Seletores de contexto, laboratório e itens |
| Gestão — análise | `analise-pedido.png` | Decisão e estado, sem dados de terceiros |
| Estoque físico | `estoque-lote-recipiente.png` | Lotes, recipientes e unidades de medida |
| Relatórios | `relatorios-movimentacoes.png` | Filtros e resumo/detalhamento |
| Estagiário — celular | `estagiario-mobile.png` | Jornada real em viewport mobile, **sem alegar homologação** |

## Critérios antes de adicionar imagens

1. Usar ambiente autorizado e preferencialmente **dados sintéticos**. Ocultar nomes, CPF, e-mail, número de inscrição, identificadores internos, tokens, endereços institucionais e qualquer dado sensível.
2. Confirmar que a tela corresponde ao código da `release` e ao perfil representado. Identificar data e ambiente da captura no registro do commit, sem inserir credenciais.
3. Evitar capturas de erro, placeholders ou dados exemplificativos sem sinalizá-los. Não reconstruir a tela em editor de imagem para apresentá-la como execução real.
4. Rever legibilidade, responsividade e identidade visual; conferir caminhos e renderização do README após o commit.
5. **Não modificar** vídeos, pôsteres, PDFs ou textos publicados da Central de Ajuda para compor esta vitrine. Esses conteúdos têm política própria em [preservação de mídias](../PRESERVACAO_CENTRAL_AJUDA_VIDEOS.md).

As capturas são evidências **visuais do estado da interface**; não demonstram, por si sós, desempenho, autorização efetiva no backend, acessibilidade, confiabilidade em rede ou testes E2E. Essas validações pertencem ao [plano de homologação](https://github.com/gbsalermo/Sistema-SGL/blob/collab/docs-release-estado-2026-11/docs/PLANO_HOMOLOGACAO_NUVEM_MOBILE_2026-11-17.md).
