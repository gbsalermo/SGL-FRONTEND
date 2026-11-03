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

## Refinamento visual do ZPL — 03/11/2026

**Motivação:** a prévia de Solução aprovada funcionalmente foi considerada excessivamente textual e pouco institucional (sem marcas, informações numa única coluna, grandes áreas vazias e sem hierarquia).

**Alterações realizadas na branch colaborativa:**
- `zpl.ts`: substituído o fluxo de texto simples por layout térmico monocromático com **cabeçalho institucional**, faixa de identificação em negativo, título principal da Solução/Produto, estado separado, código SGL, títulos de seção, campos agrupados em grade de duas colunas (quando a mídia tem largura suficiente), tabela de componentes com quantidade destacada, observações separadas, aviso e rodapé em moldura.
- `marcasZpl.ts`: rasterização **local no navegador**, a partir dos arquivos oficiais de SGL e Embrapa já servidos pelo frontend, para gráficos ZPL `^GFA` em preto e branco, dimensionados conforme a resolução do equipamento. Nenhum recurso é enviado a serviço externo ou armazenado na impressora.
- `ZebraExportPanel.vue`: geração assíncrona de ambas as marcas antes do download, bloqueio temporário do botão e erro explícito caso não seja possível converter as imagens. O rótulo HTML original permanece independente.
- Os dois documentos (Solução e Entrada de Lote) informam **tipo e situação separadamente**, evitando uma longa linha de texto sem destaque.
- Mecanismo de verificação **continua impedindo corte** quando largura/altura não comportam os campos; não encurtar dados cadastrais nem omitir componentes para caber. A altura escolhida ainda é física e precisa corresponder à mídia real. Resultado calculado para o exemplo de Solução (90 × 125 mm, 203 dpi), mas a renderização visual **deve ser conferida novamente** pelo mantenedor.
- `zpl.test.mjs`: testes de faixa inversa, cabeçalho com logos, tabela, injeção de comandos e cenário com campos da prévia de Solução. Os testes já informados como aprovados em 29/10 são de uma versão **anterior**, logo **não validam automaticamente este redesenho**.

**Pendências:** novo `npm run build` e `node --experimental-strip-types --test src/modules/rotulos/zebra/zpl.test.mjs`, prévia no visualizador ZPL com dados reais, legibilidade em mídias estreitas/300 dpi, verificação física e identificação de modelo/driver quando disponível. Gráficos GHS, quando obrigatórios, **não são incluídos**; Produto e Resíduo permanecem sem exportação ZPL de segurança. Sem merge.

## Centralização óptica das marcas — 03/11/2026

Na validação visual do novo layout térmico, foi identificada diferença de alinhamento entre SGL (arte com áreas vazias internas) e Embrapa (proporção diferente). O rasterizador `marcasZpl.ts` agora determina o retângulo de **pixels realmente visíveis** do arquivo original (limiar de luminância e transparência), recorta suas margens e **centraliza a arte recortada nas duas caixas simétricas** usadas pelo cabeçalho ZPL, preservando proporção e margem interna. Escalas ópticas específicas: SGL 88% e Embrapa 82%, sujeitas à conferência na prévia. Função pura de detecção em `recorteMarca.ts` e testes de bordas vazias/transparentes adicionados a `zpl.test.mjs`. Não foram alterados os componentes de impressão normal ou os contratos de dados.

**Conferência pendente para este ajuste:** rodar `npm run build` e `node --experimental-strip-types --test src/modules/rotulos/zebra/zpl.test.mjs` e gerar novamente a Solução 90×125 mm em 203 dpi, observando posição e escala das duas marcas. A validação do ZPL anterior não comprova o novo posicionamento; impressão física ainda pendente e nenhum merge autorizado.

## Correção pontual de alinhamento vertical (03/11/2026)

Após nova conferência da prévia Zebra, o mantenedor esclareceu que o **tamanho das duas logos já estava correto**; o problema era a posição vertical: SGL próximo demais da legenda institucional e Embrapa muito acima. O ajuste em `src/modules/rotulos/zebra/marcasZpl.ts` preserva os fatores de escala SGL `0,88` e Embrapa `0,82`, bem como o recorte de margens existente, e aplica somente deslocamentos independentes de `-4` pontos (SGL, para cima) e `+4` pontos (Embrapa, para baixo), escalonados por `dpi/203`. O deslocamento é limitado ao interior da caixa para evitar corte.

Nenhum layout A4, contrato de dados, permissão de impressão ou outro elemento ZPL foi alterado. **Aguardando novo teste local e prévia visual**; nenhuma homologação física ou merge.

## 10.5 — Zebra aplicada a Produto e Resíduo (03/11/2026)

O mantenedor **aprovou visualmente o layout Zebra de Soluções** (incluindo ajuste óptico de marcas) e pediu reutilização do modelo nas demais interfaces. No frontend:

- **Produto** (`src/modules/produtos/views/RotuloProdutoView.vue`): `ZebraExportPanel` adicionado à tela. O documento ZPL usa **dados reais do catálogo**: nome, código ou ID identificador, apresentação, unidade de medida, perecibilidade, nível/tipo/descrição de risco, condições e localização de armazenamento, situação do cadastro, órgãos de fiscalização, observação e descrição. Se o cadastro indicar um tipo de risco com pictograma, o símbolo correspondente é obrigatório na exportação.
- **Resíduo** (`src/modules/residuos/views/gestao/RotuloResiduoAjustadoView.vue`): painel Zebra adicionado à prévia; **exportação bloqueada até `impressaoPermitida`**, inclusive quando o navegador tentar exportar um documento sem dados. O ZPL usa código SGL, contexto Unidade/Laboratório/Projeto/SCI/Atividade, risco informado/confirmado, **todos** os pictogramas cadastrados, composição/quantidades textuais, recipiente, estado físico, gerador, datas/autor real da liberação quando auditado, armazenamento, destino, medidas de segurança e observações. Campos nulos continuam explicitamente não identificados quando pertinente.
- **Gerador compartilhado** (`src/modules/rotulos/zebra/zpl.ts`): renderização de pictogramas no layout térmico antes das seções operacionais. Os símbolos são apresentados com seus nomes, rasterizados em `^GFA`; nenhum risco/pictograma é inventado. É **proibido gerar** o arquivo se qualquer pictograma esperado estiver ausente, fora de ordem ou não for carregado; não gerar etiqueta silenciosamente incompleta.
- **Rasterizador** (`marcasZpl.ts`): usa apenas arquivos existentes em `/assets/residuos/pictogramas/`. Imagens são convertidas localmente em preto e branco, sem API, upload, criação de migration ou contato com a impressora. A centralização das marcas SGL/Embrapa foi preservada. O ajuste de legenda (`m + p(48)`), aprovado pelo mantenedor no teste visual local, também foi registrado no gerador compartilhado para manter o mesmo cabeçalho nos quatro documentos.
- **Segurança/regulação:** esta versão reproduz as classificações cadastradas no SGL, sem afirmar que é um rótulo GHS completo, sem frases H/P inventadas e sem substituir ficha de segurança ou requisitos legais. Se os dados não couberem no tamanho configurado (padrão 90 × 125 mm), a exportação falha com mensagem para aumentar a altura; não trunca os campos.
- `zpl.test.mjs`: testes de símbolos obrigatórios, ausência e incompatibilidade dos gráficos, além dos testes existentes de formato, escape ZPL, dimensões, corte e regressão do rótulo de Soluções.

**Portão de conclusão:** o aceite visual de Soluções **não se estende automaticamente** aos novos modelos. Pendências: `npm run build`, `node --experimental-strip-types --test src/modules/rotulos/zebra/zpl.test.mjs`, prévia em visualizador para Produtos com/sem riscos, Resíduos com 0/1/vários riscos e bloqueio antes da liberação, casos de texto longo, 203/300 dpi e avaliação física em Zebra real. **Sem merge.**
