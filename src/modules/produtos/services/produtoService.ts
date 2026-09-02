import { http } from '@/services/http'
import type { ProdutoRotuloResponse } from '@/modules/produtos/types/produtoRotulo'

export const produtoService = {
  async buscarPorId(id: string) {
    const { data } = await http.get<ProdutoRotuloResponse>(`/v1/produtos/${id}`)
    return data
  },
}
