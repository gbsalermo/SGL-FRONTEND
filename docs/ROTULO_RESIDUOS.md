# Rótulo físico de Resíduos

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
