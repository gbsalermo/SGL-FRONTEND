# Rótulo físico de Resíduos


> **Ajuste de proporção horizontal (28/10/2026):** após comparar a prévia real com o esboço aprovado, foi corrigida a distribuição CSS da versão ativa de Resíduos. O desenho continua com largura-base de 180 mm e altura mínima de 125 mm, mas usa cabeçalho mais compacto, seção central em duas colunas, pictogramas proporcionais, faixa de medidas/observações menos alta e rodapé horizontal equilibrado. Não há segundo logotipo SGL no cabeçalho; a marca permanece à direita do rodapé, e a Embrapa à esquerda. **Quando os dados ultrapassarem a altura mínima, a etiqueta cresce para não cortar informações**, portanto a proporção fixa do esboço não é garantia para registros extensos. Sem alteração de contrato/API nesta revisão visual; executar build e testar prévia/diálogo de impressão em cada largura antes da homologação.

> **Atualização vigente — 28/10/2026 (Etapa 10, pré-merge):** a rota ativa de impressão usa `RotuloResiduoAjustadoView.vue` e `ResiduoRotuloModeloAjustado.vue`. O visual foi atualizado para o esboço aprovado: nome/código/quantidade e contexto no cabeçalho, composição/risco/pictogramas e dados operacionais no centro, medidas de segurança e observações no terço inferior e marcas Embrapa/SGL apenas no rodapé. Os dados extras vêm do backend, não são frases químicas presumidas. O rótulo tem altura dinâmica e dimensões mínimas de referência; a impressão continua bloqueada conforme `impressaoPermitida`. Mudança ainda sujeita aos testes e à validação do mantenedor, sem merge. As descrições abaixo documentam também o histórico de versões anteriores.

**Status:** implementação concluída na branch `feat/residuos-interface`; aguardando validação visual e de impressão.

## Decisão de escopo

```text
QR Code                     fora do rótulo nesta etapa
Código de rastreio          obrigatório
Pictogramas                 conforme riscos confirmados
Impressão                   implementada em folha A4
Tamanho do conteúdo         configurável em milímetros
Logo Embrapa                canto inferior esquerdo, ao lado da descrição
```

O campo `qrCodeConteudo` pode continuar existindo no contrato do backend, mas não é renderizado nem impresso no protótipo atual.

## Fluxo implementado

```text
LIBERADO_PARA_ARMAZENAMENTO
→ botão Visualizar rótulo
→ GET /v1/residuos/{id}/rotulo
→ rota /residuos/{id}/rotulo
→ ResiduoRotuloModelo
→ escolher tamanho físico do rótulo
→ pré-visualização sem sidebar/topbar
→ Imprimir rótulo
```

A rota de impressão é independente do `GestaoLayout` justamente para que menus e barra superior não apareçam no papel.

## Tamanho físico e folha A4

A folha de impressão permanece A4 em modo retrato, com margem de 10 mm. O usuário controla apenas o tamanho físico do conteúdo do rótulo.

O modelo-base possui proporção `180 × 108 mm`. A alteração de tamanho preserva essa proporção para evitar deformação de textos, pictogramas e marca.

Presets iniciais:

```text
Pequeno       90 × 54 mm
Médio        135 × 81 mm
Grande       180 × 108 mm
Máx. A4      190 × 114 mm aproximadamente
```

Também existe controle personalizado de largura entre `70 mm` e `190 mm`. A altura é calculada automaticamente.

Isso permite adequar o mesmo rótulo a recipientes de diferentes dimensões, como frascos pequenos, garrafas, galões ou recipientes maiores, sem alterar o formato da folha.

## Referência visual

O modelo segue a organização do template definido para a etapa:

```text
┌──────────────────────────────────────────────────────────────┐
│ NOME/COMPONENTE PRINCIPAL + CÓDIGO     SGL / LAB / GERADOR  │
├────────────────┬─────────────────────────────────────────────┤
│                │ NÍVEL DE RISCO CONFIRMADO                  │
│ PICTOGRAMAS    │                                             │
│                │ Advertências de perigo                     │
│                │ Composição                                 │
│                │ Processo / recipiente                      │
│                │ Armazenamento / destino                    │
├────────────────┴─────────────────────────────────────────────┤
│ EMBRAPA          DESCRIÇÃO                        QUANTIDADE │
└──────────────────────────────────────────────────────────────┘
```

Arquivos principais:

```text
src/modules/residuos/components/rotulo/ResiduoRotuloModelo.vue
src/modules/residuos/views/gestao/RotuloResiduoView.vue
src/modules/residuos/config/pictogramas.ts
```

## Pictogramas

Pasta:

```text
public/assets/residuos/pictogramas/
```

Arquivos usados:

```text
inflamavel.png
radioativo.png
toxico.png
corrosivo.png
biologico.png
irritante.png
perigo-saude.png
oxidante.png
explosivo.png
gas-pressurizado.png
perigo-ambiental.png
```

`NENHUM` não usa pictograma. Os pictogramas são escolhidos a partir de `riscos` retornado pelo DTO do rótulo, que prioriza os riscos confirmados pela Gestão.

## Logo Embrapa

Pasta:

```text
public/assets/residuos/marcas/
```

Arquivo usado diretamente pelo rótulo:

```text
embrapa.png
```

O componente não depende mais do wrapper SVG para a impressão. O PNG é carregado diretamente no bloco inferior esquerdo, imediatamente ao lado da seção `Descrição`, evitando a falha observada no print preview.

## Dados usados

```text
residuoId
codigoRastreio
descricao
laboratorioNome
geradorNome
processoOrigem
recipiente
quantidade
unidadeMedida
nivelRisco
riscos
componentes
localArmazenamentoTemporario
destinoFinalPrevisto
dataPrevistaDespacho
dataRotulagem
```

`qrCodeConteudo` é deliberadamente ignorado.

## Textos de segurança

O frontend não inventa frases regulamentares de perigo ou prudência a partir de um enum genérico. A seção de advertências mostra os riscos efetivamente confirmados e os dados operacionais existentes.

Se frases GHS oficiais forem exigidas futuramente, elas devem entrar como dado/regra formal do domínio antes de serem impressas.

## Validação pendente

```text
pictogramas corretos para cada risco
logo Embrapa visível na prévia e no print preview
presets Pequeno / Médio / Grande / Máx. A4
largura personalizada entre 70 e 190 mm
manutenção da proporção do conteúdo
código SGL correto
composição/quantidade corretas
print preview sem elementos da interface
legibilidade física do rótulo impresso
```

> **Responsável pela liberação (28/10/2026, Etapa 10):** quando o resíduo tem data de liberação, o rótulo passa a mostrar **Responsável pela liberação** logo após a data. O backend consulta o usuário do evento auditado `RISCO_CONFERIDO_E_RESIDUO_LIBERADO`, restrito ao resíduo previamente recuperado com isolamento de Unidade; não usa o gerador ou o gestor que apenas recebeu como substituto. Em registros antigos sem esse evento, exibe **Não identificado no histórico** em vez de inventar um nome. Antes da liberação, não apresenta esse campo. Nenhuma migration é necessária. Build, testes e conferência visual permanecem pendentes da validação local.
