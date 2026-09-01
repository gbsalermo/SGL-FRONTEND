# Rótulo físico de Resíduos

**Status:** implementação concluída na branch `feat/residuos-interface`; aguardando validação visual e de impressão.

## Decisão de escopo

```text
QR Code                     fora do rótulo nesta etapa
Código de rastreio          obrigatório
Pictogramas                 conforme riscos confirmados
Impressão                   implementada
Logo Embrapa                canto inferior esquerdo
```

O campo `qrCodeConteudo` pode continuar existindo no contrato do backend, mas não é renderizado nem impresso no protótipo atual.

## Fluxo implementado

```text
LIBERADO_PARA_ARMAZENAMENTO
→ botão Visualizar rótulo
→ GET /v1/residuos/{id}/rotulo
→ rota /residuos/{id}/rotulo
→ ResiduoRotuloModelo
→ pré-visualização sem sidebar/topbar
→ Imprimir rótulo
```

A rota de impressão é independente do `GestaoLayout` justamente para que menus e barra superior não apareçam no papel.

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

Arquivo principal:

```text
embrapa.png
```

O projeto mantém `embrapa.svg` como wrapper de compatibilidade que aponta para o PNG. A marca fica no canto inferior esquerdo do rótulo.

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
logo Embrapa carregada
código SGL correto
composição/quantidade corretas
pré-visualização responsiva
print preview sem elementos da interface
legibilidade física do rótulo impresso
```
