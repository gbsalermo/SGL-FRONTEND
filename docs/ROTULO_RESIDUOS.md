# Rótulo físico de Resíduos — preparação

**Status:** scaffold preparado; integração final e impressão aguardam os SVGs e validação das telas até Análise/Classificação.

## Decisão de escopo

```text
QR Code                     fora do rótulo nesta etapa
Código de rastreio          obrigatório
Pictogramas                 conforme riscos confirmados
Impressão                   prevista
Logo Embrapa                canto inferior esquerdo
```

O campo `qrCodeConteudo` pode continuar existindo no contrato do backend, mas não será renderizado no rótulo do protótipo atual.

## Referência visual

O modelo segue a organização do template fornecido para a etapa:

```text
┌──────────────────────────────────────────────────────────────┐
│ NOME/COMPONENTE PRINCIPAL + CÓDIGO     SGL / LAB / GERADOR  │
├────────────────┬─────────────────────────────────────────────┤
│                │ NÍVEL DE RISCO CONFIRMADO                  │
│ PICTOGRAMAS    │                                             │
│                │ Advertências de perigo                     │
│                │ Composição                                  │
│                │ Processo / recipiente                      │
│                │ Armazenamento / destino                    │
├────────────────┴─────────────────────────────────────────────┤
│ EMBRAPA          DESCRIÇÃO                        QUANTIDADE │
└──────────────────────────────────────────────────────────────┘
```

O componente inicial está em:

```text
src/modules/residuos/components/rotulo/ResiduoRotuloModelo.vue
```

Ele ainda não está ligado a uma rota para não avançar a funcionalidade antes da validação da etapa atual.

## Pictogramas

Pasta:

```text
public/assets/residuos/pictogramas/
```

Arquivos esperados:

```text
inflamavel.svg
radioativo.svg
toxico.svg
corrosivo.svg
biologico.svg
irritante.svg
perigo-saude.svg
oxidante.svg
explosivo.svg
gas-pressurizado.svg
perigo-ambiental.svg
```

Mapeamento:

```text
src/modules/residuos/config/pictogramas.ts
```

`NENHUM` não usa pictograma.

Enquanto um SVG estiver ausente, o modelo usa um fallback visual para que o build não dependa dos assets.

## Logo Embrapa

Pasta:

```text
public/assets/residuos/marcas/
```

Arquivo esperado:

```text
embrapa.svg
```

No rótulo a marca fica no canto inferior esquerdo. Enquanto o arquivo estiver ausente, aparece um fallback textual `EMBRAPA`.

## Dados usados

O modelo foi preparado para `RotuloResiduoResponseDTO` do backend:

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

`qrCodeConteudo` é deliberadamente ignorado na interface de rótulo desta etapa.

## Sobre textos de segurança

O frontend não deve inventar frases regulamentares de perigo ou prudência a partir de um enum genérico. No scaffold atual, a seção de advertências apresenta apenas os riscos confirmados pela Gestão e os demais dados operacionais reais.

Caso o projeto passe a exigir frases GHS oficiais, elas devem entrar como regra/dado formalmente definido no domínio antes de serem impressas.

## Próximo passo

Após colocar os SVGs e validar as interfaces já implementadas:

```text
GET /v1/residuos/{id}/rotulo
→ ResiduoRotuloModelo
→ tela de pré-visualização
→ ação Imprimir
→ CSS @media print
```

Só então ligar o rótulo à central da Gestão.
