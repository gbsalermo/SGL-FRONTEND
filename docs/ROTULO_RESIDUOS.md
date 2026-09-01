# Rótulo físico de Resíduos — preparação

**Status:** scaffold preparado; pictogramas e marca já enviados em PNG; integração final e impressão aguardam a validação das telas até Análise/Classificação.

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
│                │ Composição                                 │
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

Mapeamento:

```text
src/modules/residuos/config/pictogramas.ts
```

`NENHUM` não usa pictograma.

O componente mantém fallback visual se algum arquivo falhar ao carregar, mas os onze riscos atuais já possuem asset correspondente.

## Logo Embrapa

Pasta:

```text
public/assets/residuos/marcas/
```

Arquivo principal:

```text
embrapa.png
```

O scaffold mantém `embrapa.svg` apenas como wrapper de compatibilidade para o componente inicial. A imagem efetiva usada pelo wrapper é `embrapa.png`.

No rótulo a marca fica no canto inferior esquerdo.

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

Após validar as interfaces já implementadas:

```text
GET /v1/residuos/{id}/rotulo
→ ResiduoRotuloModelo
→ tela de pré-visualização
→ ação Imprimir
→ CSS @media print
```

Só então ligar o rótulo à central da Gestão.
