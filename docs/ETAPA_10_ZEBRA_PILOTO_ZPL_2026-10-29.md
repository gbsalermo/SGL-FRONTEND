# Etapa 10 — Piloto Zebra / ZPL — 29/10/2026

**Estado vigente em 03/11/2026:** o suporte Zebra/ZPL foi estendido a **Soluções, Entradas de Lote, Produtos e Resíduos** na branch `collab/etapa-10-rotulos-impressao`. O visual de Soluções foi aprovado pelo mantenedor; os novos modelos de Produto/Resíduo ainda aguardam build, testes locais e validação visual. A impressão física ainda não foi homologada. O teste local aprovado em 29/10/2026 corresponde ao piloto anterior e não substitui a validação desta ampliação.

## Objetivo e limites

Adicionar uma opção controlada de exportação `.zpl` sem alterar os rótulos aprovados para impressão normal em A4. Um navegador não envia ZPL bruto diretamente a USB, spooler ou porta TCP por padrão. Esta etapa gera o arquivo localmente, que será enviado pela infraestrutura Zebra aprovada (driver ZDesigner, Zebra Setup Utilities ou outro método supervisionado). A integração direta com a impressora, incluindo Browser Print, não foi ativada nem simulada.

**Cobertura inicial (histórico de 29/10, substituída pelas evoluções de 03/11):**
- **Estoque → detalhes do lote → Documento de Entrada:** painel `Impressão Zebra — piloto ZPL` com exportação das informações registradas da entrada.
- **Central de Soluções → detalhes → Rótulo de Solução:** exportação textual apenas para pedidos `EM_PREPARACAO` ou `ENTREGUE`; pedidos ainda não aprovados não podem exportar nem imprimir.
- **Produto e Resíduo:** ainda não tinham exportação ZPL nesta primeira versão. A expansão posterior está registrada em **10.5 — Zebra aplicada a Produto e Resíduo**, abaixo.

## Contratos e código

- `src/modules/rotulos/zebra/zpl.ts`: gerador puro de ZPL (`^XA`, `^CI28`, `^PW`, `^LL`, `^FO`, `^A0`, `^FH`, `^FD`, `^GB`, `^PQ1`, `^XZ`). Converte mm em pontos por DPI, quebra texto em linhas e rejeita a geração se exceder a área física configurada, **sem truncar valores**.
- `src/modules/rotulos/zebra/ZebraExportPanel.vue`: largura 40–110 mm, altura 40–300 mm, densidade 203 ou 300 dpi, botão de download de arquivo ZPL e feedback de erro. Padrão piloto: 90×125 mm, 203 dpi (configuração de interface, **não afirma** compatibilidade com o equipamento físico). Nenhuma configuração é enviada à impressora sem ação do operador.
- Dados gerados no navegador a partir de contratos existentes: nenhum endpoint, migration ou campo persistido foi criado. **Na versão atual**, o ZPL inclui logomarcas oficiais e pictogramas cadastrados, quando presentes, como gráficos monocromáticos `^GFA`; não omite pictogramas exigidos. A versão HTML com as imagens aprovadas permanece intacta.
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

## Pendências ainda não implementadas (revistas em 03/11/2026)

1. Levantar fabricante/modelo exato, capacidade em largura útil, resolução, versão de ZPL, mídia adesiva, etiqueta contínua/intervalo, orientação, driver e sistema operacional do laboratório.
2. Decidir dimensões-alvo e conteúdo obrigatório do layout térmico (não tentar encolher 180×125 mm cegamente para 50×30 mm).
3. **Validar fisicamente** a rasterização monocromática `^GFA` das logomarcas e de todos os pictogramas de risco cadastrados. A conversão já está implementada no frontend, mas ainda não há homologação de fidelidade visual ou aderência a requisitos regulatórios de cada classe de risco.
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

## Ajuste de usabilidade — dimensão Zebra automática (03/11/2026)

O mantenedor aprovou simplificar a configuração térmica para o usuário comum. Implementação restrita ao frontend, compartilhada pelos **quatro** documentos: `ZebraExportPanel.vue` inicia no modo **Automático (recomendado)**, com opção explícita de **Personalizado**. A largura (padrão 90 mm) e a resolução (padrão 203 dpi) continuam visíveis e editáveis. A altura é sugerida e exibida antes do download, sem exigir tentativa e erro.

`zpl.ts` contém `recomendarConfiguracaoZpl`: utiliza o **próprio gerador ZPL** e a mesma geometria de pictogramas para testar as alturas `125, 160, 200, 250, 300 mm` até encontrar a menor que comporte os dados. Altura-base inicial: **125 mm** em Soluções/Entrada de Lote; **200 mm** em Produto/Resíduo. A largura escolhida pelo usuário não é aumentada automaticamente porque depende da largura física da mídia instalada; ao mudar a largura, resolução ou registro, a sugestão é recalculada. A lógica de medição de pictogramas foi compartilhada com o rasterizador `marcasZpl.ts` para não divergir. No modo Personalizado, a altura sugerida vira ponto de partida, mas pode ser editada de 40 a 300 mm.

Se não houver formato adequado até 300 mm, o sistema explica a limitação e desabilita o download automático; **não trunca texto nem elimina símbolos**. Ambos os modos verificam encaixe antes de carregar as imagens e exportar o arquivo `.zpl`; os arquivos de logos/pictogramas reais são validados novamente na geração. Esse ajuste recomenda um tamanho lógico, **não configura a impressora**, não garante compatibilidade com todos os modelos nem substitui a conferência do papel e a homologação física.

Testes adicionados a `src/modules/rotulos/zebra/zpl.test.mjs`: padrões por tipo, preservação de largura/DPI, expansão por texto longo, conteúdo impossível de acomodar e simulação com pictogramas. **Aguardando nova execução local de `npm run build` e da suíte Node**, além de validação visual em desktop/mobile e dos quatro documentos. Rótulos A4 e contratos backend não foram alterados. Sem merge.

## Compactação de Resíduos e risco lateral — 03/11/2026

A prévia do Resíduo `Master Mix vencido` ficou longa demais para uma leitura confortável em tela e a captura apresentada não mostrou a parte final da etiqueta. O mantenedor pediu trazer o pictograma para o espaço à direita do nome e usar apenas o rótulo **RISCO**.

**Implementado no gerador Zebra compartilhado (`zpl.ts`), exclusivamente para `categoria: RESIDUO`:**
- Para largura **a partir de 75 mm** e ao menos um risco cadastrado, posiciona **RISCO + pictograma(s) + respectivos nomes** à direita do nome/situação/código SGL, com colunas laterais e múltiplas linhas quando necessário. Evita a antiga seção vertical `PICTOGRAMAS DE RISCO` que consumia muita altura; em mídias mais estreitas o risco permanece em seção própria, evitando pictogramas pequenos demais.
- O corpo de Resíduos usa tipografia e espaçamentos discretamente mais compactos nos títulos de seção, grade, tabela e observações; preserva integralmente campos, descrição de riscos, medidas de segurança, rastreabilidade, composição, avisos e responsável pela liberação. Outros documentos não têm a hierarquia modificada.
- Dimensão mínima sugerida para **Resíduos** passa a ser **125 mm**, com seleção automática da menor altura que comporte as informações, incluindo opções intermediárias `125, 140, 150, 160, 175, 180, 200, 225, 250, 275 e 300 mm`. A **largura padrão permanece 90 mm** e o usuário pode escolher o modo personalizado para corresponder à mídia real.
- `marcasZpl.ts` e `ZebraExportPanel.vue` usam a **mesma geometria reduzida dos pictogramas laterais** do gerador: se não carregar algum símbolo de risco, a exportação continua bloqueada; se o conteúdo não couber na dimensão informada, a geração rejeita em vez de cortar elementos.
- Foram acrescentados testes de regressão em `zpl.test.mjs` para posição lateral, título RISCO, preservação de todas as informações e múltiplos pictogramas.

**Validação ainda pendente:** `npm run build` e `node --experimental-strip-types --test src/modules/rotulos/zebra/zpl.test.mjs`; em seguida, gerar o mesmo Resíduo em Automático, conferir **toda** a imagem ZPL inclusive rodapé e medidas de segurança, e testar Resíduos com dois ou mais pictogramas. As prévias anteriores não homologam esse layout novo. Uma captura cortada na tela não comprova, isoladamente, perda de conteúdo no arquivo; conferir a altura efetiva no visualizador e no `^LL`. Sem merge.

## Layout compacto Zebra de Produtos (03/11/2026)

O mantenedor solicitou reproduzir em Produtos o acabamento do ZPL de Resíduos: fontes e espaçamentos do corpo mais compactos; pictograma (quando cadastrado) com o título **RISCO**, ao lado do nome do produto para largura de mídia de pelo menos 75 mm, com o nome do risco embaixo da imagem. Mídias estreitas mantêm o bloco vertical para não reduzir o símbolo em excesso.

Implementação feita no **gerador ZPL comum** (`zpl.ts`), incluindo o mesmo dimensionamento de pictograma usado em Resíduos (`ladoPictogramaZpl`, compartilhado com `marcasZpl.ts`). Os dados de fiscalização, condições de armazenamento, apresentação, nível de risco e demais campos de Produto continuam íntegros. O modo automático passa a iniciar os formatos de Produto em **125 mm** e escolhe a menor altura que caiba, sem cortes nem remoção de pictogramas. O rótulo HTML/A4 de Produto permanece inalterado.

Testes adicionados para Produto com pictograma e fiscalização e Produto sem pictograma; ajustadas as expectativas de altura automática. **Aguardando build e suíte Node no ambiente local, prévia visual completa e teste físico. Nenhum merge.**

## Orientação de leitura Vertical/Horizontal, sem girar mídia (03/11/2026)

**Motivação do mantenedor:** permitir colar rótulos em recipientes com pouca altura e maior largura, sem obrigar a reconfigurar o formato físico da mídia Zebra. A orientação **Vertical** continua padrão e preserva o layout ZPL homologado visualmente até aqui.

**Frontend (painel compartilhado pelos quatro documentos):** `ZebraExportPanel.vue` oferece agora controles **Vertical** / **Horizontal** com estado visível. A escolha de orientação **não troca largura, altura ou DPI**; em modo automático permanece a altura calculada para a mídia, e em modo personalizado permanecem os números escolhidos. A verificação de encaixe é instantânea; se não houver espaço para a versão horizontal, o botão de exportar fica desabilitado e a interface orienta a selecionar outra mídia ou a versão vertical. As regras de aprovação para Resíduos/Soluções permanecem intactas.

**Gerador Zebra:** `zpl.ts` aceita `orientacao: 'VERTICAL' | 'HORIZONTAL'`, padrão Vertical. O caminho Horizontal compõe a informação com leitura transversal, seções lado a lado para otimizar altura, pictogramas e marcas oficiais **girados bit a bit no bitmap `^GFA`**, caracteres `^A0R`, e campos/divisórias reposicionados por transformação coordenada de 90°; respeita `^PW` e `^LL` **com os mesmos valores físicos**, não envia comandos persistentes da impressora, não solicita alteração de perfil de driver e não omite informações. A geometria e o encaixe são verificados antes de gerar o arquivo. Se houver incompatibilidade de largura/altura ou risco de corte, a exportação é impedida (não é feita redução arbitrária da fonte ou remoção dos riscos).

**Testes adicionados:** igualdade de `^PW`/`^LL` entre orientações, comando `^A0R`, rotação de bits dos gráficos, obrigatoriedade dos pictogramas em Horizontal e falha segura em etiquetas com informação que não cabe. O novo renderer foi consolidado no mesmo `zpl.ts` para conservar o teste direto Node com `--experimental-strip-types`, sem nova dependência de runtime ou alteração global do TSConfig.

**Pendências da nova opção:** novo `npm run build`, `node --experimental-strip-types --test src/modules/rotulos/zebra/zpl.test.mjs`, prévias reais com os quatro tipos e pictogramas (90×125 mm / 203 dpi, comparando `^PW`/`^LL`), verificar margens e direção de leitura num visualizador ZPL e testes em equipamento físico quando disponível. A orientação Horizontal **não foi homologada visual nem fisicamente** e o suporte físico depende da mídia instalada. Sem merge.

## Impressão direta Zebra via Browser Print — 03/11/2026

A pedido do mantenedor, o painel Zebra das quatro interfaces agora oferece **duas ações complementares**: **Baixar ZPL** (inalterada) e **Imprimir na Zebra**. Diferentemente da impressão A4 pelo diálogo `window.print()`, uma impressora Zebra que recebe ZPL puro exige um serviço local no computador do operador. Por isso, o SGL integra o protocolo do **Zebra Browser Print**, sem alterar backend, salvar informações de impressoras no servidor ou tentar acessar dispositivos diretamente pelo navegador.

**Fluxo de uso:**
1. Instalar e iniciar o [Zebra Browser Print oficial](https://www.zebra.com/us/en/support-downloads/software/printer-software/browser-print.html) na estação de trabalho compatível, conectar a impressora e permitir o endereço de acesso ao SGL em `Accepted Hosts`. Quando HTTPS for usado, pode ser necessário aceitar o certificado local confiável do Browser Print; seguir orientações institucionais de TI para isso.
2. Na prévia Zebra, escolher medidas reais de etiqueta, orientação e DPI. Clicar **Buscar impressoras** (nenhuma descoberta automática). O SGL consulta apenas o serviço no próprio computador: `http://localhost:9100/available` se a página for HTTP, ou `https://localhost:9101/available` se for HTTPS.
3. Selecionar a impressora descoberta (uma única impressora pode ser pré-selecionada). Clicar **Imprimir na Zebra**; confirmar no diálogo o equipamento e a mídia; o frontend gera o mesmo ZPL validado da exportação, com logos/pictogramas e bloqueios intactos, e o transmite via `POST /write` com `device` e `data`.
4. O retorno positivo indica apenas que o **serviço local recebeu o ZPL para envio**, não confirma alimentação de mídia nem impressão física. Se o Browser Print estiver indisponível, a origem não for permitida, o certificado impedir comunicação, o ZPL não couber ou a impressora não for encontrada, o SGL mostra erro. **Baixar ZPL continua disponível independentemente do serviço local.**

**Arquivos:** `src/modules/rotulos/zebra/browserPrintLocal.ts` (adaptador de /available e /write, timeout, limite de tamanho, erros), `ZebraExportPanel.vue` (busca intencional, seleção, confirmação, feedback e envio), `browserPrintLocal.test.mjs` (mock de transporte, nenhum acesso físico). Não adiciona SDK de terceiros ao bundle, não usa IP externo nem gera impressão automaticamente. O envio direto respeita restrições de liberação de Soluções/Resíduos, necessidade de todos os pictogramas e validação do tamanho. Compatível com instalações de Browser Print que expõem essas rotas; a disponibilidade pode depender de políticas de rede e navegador.

**Testes ainda pendentes:** `npm run build`, `node --experimental-strip-types --test src/modules/rotulos/zebra/*.test.mjs`, validação visual do botão, instalação e autorização do Browser Print, descoberta em estação com equipamento real, prova de impressão e ausência de envio indevido ao cancelar. Sem impressora real a funcionalidade pode ser revisada/testada em mocks, mas **não homologada fisicamente**. Não há merge automático.

## Correção do Auto Horizontal e painel recolhível — 04/11/2026

A prévia de Resíduos na orientação Horizontal evidenciou que o dimensionamento “Automático” ainda usava a medida **calculada para o Vertical**; com a orientação alterada, a tela permanecia em 90×160 mm e informava que o conteúdo não cabia. Também se observou espaço mal aproveitado nos quadros da versão horizontal, e o painel Zebra ocupava espaço excessivo acima do rótulo.

**Corrigido no frontend colaborativo:**
- `ZebraExportPanel.vue` passa a fornecer a **orientação atual** à função `recomendarConfiguracaoZpl`, recalculando a altura quando o operador alterna Vertical/Horizontal. Quando o modo é Personalizado, as medidas físicas continuam sob controle do operador; erro de tamanho é exibido mesmo com o menu recolhido. A exportação e o envio direto seguem bloqueados se o documento não couber.
- `zpl.ts`: o modo Automático Horizontal tenta tamanhos a partir de 90 mm (`90, 100, 110, 120, 125, 140, 150, 160, 175, 180, 200, 225, 250, 275, 300 mm`) na largura e DPI escolhidos. Para cada dimensão, executa a **renderização de validação completa do layout horizontal**, sem reaproveitar a altura calculada para a vertical. Não muda a largura física automaticamente nem autoriza truncar símbolos, campos ou observações.
- O layout horizontal agora testa números diferentes de colunas e **empacota os quadros mais extensos primeiro**, escolhendo a distribuição que melhor utiliza a altura disponível, sem alterar o conteúdo registrado. Se não houver formato que comporte todo o documento até 300 mm, o SGL mantém os botões de geração/impressão desabilitados e informa a limitação.
- O painel Zebra passou a ter **resumo compacto** (orientação, modo, dimensões e DPI), um elemento nativo acessível de **Configurações da etiqueta** recolhido por padrão e ações visíveis `Baixar ZPL`, `Buscar impressoras` e `Imprimir na Zebra`. Orientação, dimensionamento e dimensões só ocupam espaço quando o operador expande manualmente o menu. Status e erros ficam visíveis mesmo com o menu fechado.
- Testes adicionais em `zpl.test.mjs` cobrem a recomendação Horizontal, preservação da largura física, um Resíduo semelhante à prévia demonstrativa e bloqueio com conteúdo excessivo.

**Atenção ao aceite:** o código e a documentação foram atualizados, porém **não se executou build nem a suíte Node na estação local nesta revisão**, e a nova prévia horizontal ainda precisa de conferência do mantenedor (tamanho final, quadros, pictogramas e rodapé). A prévia anterior não valida automaticamente o layout atualizado. Testes físicos Zebra seguem pendentes; sem merge.

## Cálculo largura × altura por conteúdo — 05/11/2026

Depois da validação visual do formato horizontal, o mantenedor pediu que o sistema responda à alteração da largura física (exemplo: **150 mm**) com a **menor altura que comporte o rótulo específico**, e não apenas com tamanhos predefinidos. A versão anterior restringia largura a `40–110 mm` no próprio validador e escolhia a altura em uma lista curta.

**Implementado no frontend colaborativo:**
- `zpl.ts`: `recomendarConfiguracaoZpl` preserva a largura informada, orientação e DPI e testa a renderização completa em **incrementos de 5 mm**, até encontrar o primeiro comprimento válido. A versão horizontal começa em **40 mm de altura**, desde que os requisitos de legibilidade/margens sejam atendidos; a vertical preserva mínimo inicial de **125 mm**, buscando em passos de 5 mm. O limite conservador de comprimento continua 300 mm. Nenhum campo ou pictograma é abreviado para caber.
- A largura virtual permitida no ZPL foi ampliada até **168 mm**, viabilizando simular e calcular `150 × altura calculada` em modelos de **6 polegadas com largura útil suficiente**. Isso **não** transforma uma Zebra de 4 polegadas em impressora de 6 polegadas: a largura máxima real é uma propriedade do hardware e da mídia. Ex.: ZT411 imprime até ~104 mm, ZT421 até ~168 mm (ficha oficial do fabricante); outros modelos podem variar.
- `ZebraExportPanel.vue`: o campo de largura aceita até 168 mm e, ao informar 150 mm, o modo Automático recalcula a altura em tempo real e apresenta o resultado no resumo superior, inclusive com a área de configurações recolhida. Larguras acima do limite anterior de 110 mm exibem aviso de **mídia larga**; para **impressão direta**, o operador precisa confirmar explicitamente a compatibilidade da impressora. O download ZPL continua disponível para avaliação em simulador, mas não comprova suporte físico.
- `zpl.test.mjs`: casos de largura 150 mm, confirmação de `^PW` e `^LL` correspondentes à geometria recomendada, encaixe do documento na altura retornada, rejeição em 169 mm e abaixo de 40 mm. O cálculo não utiliza apenas uma proporção fixa: depende do conteúdo real, da orientação, das dimensões das imagens e da largura selecionada.

**Validação pendente:** novo `npm run build` e testes Node; prévia com a mesma etiqueta em 90 mm, 110 mm e 150 mm, em ambas as orientações; conferir largura útil do modelo Zebra antes de habilitar impressão física. O cálculo sugere dimensões **do documento ZPL**, mas não detecta automaticamente a largura máxima de cada impressora conectada. Nenhum merge.
