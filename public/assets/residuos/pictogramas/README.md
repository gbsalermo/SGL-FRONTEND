# Pictogramas de risco — Resíduos

Esta pasta contém os arquivos PNG usados no rótulo físico dos resíduos.

## Nomes esperados

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

`NENHUM` não usa pictograma.

O frontend faz o vínculo pelos valores do enum `TipoRisco` retornado pelo backend.

## Recomendações para os PNGs

- formato quadrado;
- boa resolução para impressão (preferencialmente 512x512 ou superior);
- preservar o losango/borda e o símbolo originais do pictograma;
- preferir fundo transparente quando disponível;
- evitar textos incorporados na figura;
- não alterar os nomes acima sem atualizar `src/modules/residuos/config/pictogramas.ts`.

O componente possui fallback visual caso algum arquivo não possa ser carregado, evitando quebra do layout durante desenvolvimento.
