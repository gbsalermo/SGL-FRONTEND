# Pictogramas de risco — Resíduos

Coloque nesta pasta os arquivos SVG usados no rótulo físico dos resíduos.

## Nomes esperados

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

`NENHUM` não usa pictograma.

O frontend faz o vínculo pelos valores do enum `TipoRisco` retornado pelo backend.

## Recomendações para os SVGs

- fundo transparente;
- preservar o losango/borda e símbolo originais do pictograma;
- preferir `viewBox` para manter qualidade na impressão;
- evitar textos incorporados na figura;
- não alterar os nomes acima sem atualizar `src/modules/residuos/config/pictogramas.ts`.

Durante a montagem do protótipo, caso algum SVG ainda não exista, o componente do rótulo mostra um fallback textual e o build continua funcionando.
