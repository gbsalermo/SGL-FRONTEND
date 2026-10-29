# Etapa 10 — Piloto Zebra / ZPL — 29/10/2026

**Estado:** piloto publicado na branch `collab/etapa-10-rotulos-impressao`. O mantenedor informou em 29/10/2026 que o teste local passou; não foram compartilhados logs para distinguir individualmente build e suíte de testes. Modelo real da impressora, conferência do arquivo gerado e validação física ainda pendentes. **Não homologado para impressão física**.

## Objetivo e limites

Adicionar uma opção controlada de exportação `.zpl` sem alterar os rótulos aprovados para impressão normal em A4. Um navegador não envia ZPL bruto diretamente a USB, spooler ou porta TCP por padrão. Esta etapa gera o arquivo localmente, que será enviado pela infraestrutura Zebra aprovada (driver ZDesigner, Zebra Setup Utilities ou outro método supervisionado). A integração direta com a impressora, incluindo Browser Print, não foi ativada nem simulada.

**Primeira cobertura:**
- **Estoque → detalhes do lote → Documento de Entrada:** painel `Impressão Zebra — piloto ZPL` com exportação das informações registradas da entrada.
- **Central de Soluções → detalhes → Rótulo de Solução:** exportação textual apenas para pedidos `EM_PREPARACAO` ou `ENTREGUE`; pedidos ainda não aprovados não podem exportar nem imprimir.
- **Produto e Resíduo:** continuam com os rótulos HTML aprovados. **Não permitir exportação ZPL incompleta** até haver conversão validada dos pictogramas, identificação de riscos e elementos visuais obrigatórios. Esta etapa não imprime etiquetas químicas de segurança em ZPL.

## Contratos e código

- `src/modules/rotulos/zebra/zpl.ts`: gerador puro de ZPL (`^XA`, `^CI28`, `^PW`, `^LL`, `^FO`, `^A0`, `^FH`, `^FD`, `^GB`, `^PQ1`, `^XZ`). Converte mm em pontos por DPI, quebra texto em linhas e rejeita a geração se exceder a área física configurada, **sem truncar valores**.
- `src/modules/rotulos/zebra/ZebraExportPanel.vue`: largura 40–110 mm, altura 40–300 mm, densidade 203 ou 300 dpi, botão de download de arquivo ZPL e feedback de erro. Padrão piloto: 90×125 mm, 203 dpi (configuração de interface, **não afirma** compatibilidade com o equipamento físico). Nenhuma configuração é enviada à impressora sem ação do operador.
- Dados gerados no navegador a partir de contratos existentes: nenhum endpoint, migration ou campo persistido foi criado. O arquivo ZPL usa texto monocromático e assinatura institucional **SGL/Embrapa em texto**, ainda **sem imagens rasterizadas, logomarcas ou pictogramas**. A versão HTML com as imagens aprovadas permanece intacta.
- Escapar todos os bytes dos campos de dados via UTF-8 `^FH_` (incluindo `^`, `~` e `_`). A exibição de caracteres acentuados depende de compatibilidade do firmware/fonte ZPL e precisa ser testada.

## Testes

Em máquina de desenvolvimento com Node compatível:

```bash
npm run build
node --experimental-strip-types --test src/modules/rotulos/zebra/zpl.test.mjs
```

Cobrir ainda:
1. Baixar ZPL de lote; conferir nome, origem, apresentação, embalagens, quantidades e valor original sem confundir com saldo atual.
2. Baixar ZPL de Solução `EM_PREPARACAO` e `ENTREGUE`; verificar componentes e aprovador apenas se rastreável. Confirmar bloqueio dos status `PENDENTE`, `CANCELADO`, `REJEITADO`.
3. Conferir o erro quando uma observação longa não couber na mídia, sem perder dados.
4. Testar valores com acentos, aspas, `^`, `~` e caracteres especiais.
5. Validar layout em 203 e 300 dpi; comparar comprimento/posição do texto na prévia do software Zebra ou dispositivo real.
6. Confirmar que as páginas existentes imprimem normalmente pelo navegador e que os botões Zebra não aparecem no papel.
7. Testar isolamento de Unidade e rotas de acesso existentes.

## Próximos blocos (não implementados)

1. Levantar fabricante/modelo exato, capacidade em largura útil, resolução, versão de ZPL, mídia adesiva, etiqueta contínua/intervalo, orientação, driver e sistema operacional do laboratório.
2. Decidir dimensões-alvo e conteúdo obrigatório do layout térmico (não tentar encolher 180×125 mm cegamente para 50×30 mm).
3. Criar saída monocromática validada de **logomarcas/pictogramas GHS** com `^GFA` ou gráficos ZPL suportados. Para produtos/resíduos, preservar segurança e texto legível; não produzir etiquetas parciais com informação de risco omitida.
4. Testar fisicamente margens, qualidade e acentuação e evitar imprimir uma etiqueta que esconda informação por falta de espaço.
5. Se for autorizado e necessário: integração com **Zebra Browser Print** com consentimento, descoberta e seleção explícita de impressora, tratamento de indisponibilidade e estratégia de segurança. Não enviar ZPL automaticamente ao dispositivo.
6. Registrar resultados e parecer de compatibilidade por equipamento antes de fechar a Etapa 10.

## Referências técnicas

- Zebra, envio de comandos ZPL: https://support.zebra.com/pt-BR/article/000013751
- Zebra, Zebra Browser Print: https://www.zebra.com/us/en/support-downloads/software/printer-software/browser-print.html
- Zebra, ZPL II Programming Guide: https://cpws.zebra.com/cpws/docs/zpl/zpl_manual.pdf

**Regra de aceite:** exportação ZPL e testes automatizados não são equivalentes à impressão física Zebra homologada. Sem merge automático.

## Checkpoint — retorno de teste local (29/10/2026)

O mantenedor confirmou **“o teste passou”** após a publicação do piloto Zebra e dos comandos de validação. Registrar como **teste local reportado aprovado**, sem interpretar esse retorno como teste na impressora ou confirmação isolada de todos os cenários automatizados. Antes de fechar a Etapa 10: gerar e inspecionar um arquivo `.zpl` pela interface, identificar o modelo Zebra/DPI/largura útil/mídia e realizar impressão física supervisionada. Não fazer merge automático.
