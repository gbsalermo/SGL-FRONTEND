/** Limites ópticos da arte visível de uma marca, sem considerar margens transparentes ou brancas. */
export interface LimitesConteudo {
  x: number
  y: number
  largura: number
  altura: number
}

/**
 * Localiza pixels com conteúdo em RGBA. Funciona com PNG transparente ou com
 * fundo branco; não depende de Canvas e pode ser testado no Node.
 */
export function encontrarLimitesConteudo(
  pixels: Uint8ClampedArray,
  largura: number,
  altura: number,
): LimitesConteudo | null {
  if (largura <= 0 || altura <= 0 || pixels.length < largura * altura * 4) return null
  let minX = largura
  let minY = altura
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < altura; y++) {
    for (let x = 0; x < largura; x++) {
      const i = (y * largura + x) * 4
      const a = pixels[i + 3]
      const luminancia = pixels[i] * 0.2126 + pixels[i + 1] * 0.7152 + pixels[i + 2] * 0.0722
      // Ignora margens claras, antialiasing residual e pixels transparentes.
      if (a > 10 && luminancia < 245) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }

  return maxX < 0 ? null : {
    x: minX,
    y: minY,
    largura: maxX - minX + 1,
    altura: maxY - minY + 1,
  }
}
