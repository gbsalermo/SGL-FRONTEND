import { http } from '@/services/http'
import type {
  AprovarPedidoRequest,
  EstoqueCentralResponse,
  PedidoRequest,
  PedidoResponse,
  ProjetoResponse,
  StatusPedido,
} from '@/modules/pedidos/types/pedido'

type ProdutoDetalhe = {
  id: string
  risco: string | null
  tipoRisco: string | null
  descricaoRisco: string | null
  perecivel: boolean
  tipoPerecivel: string | null
  condicoesArmazenamento: string | null
}

function rotuloEnum(valor: string | null | undefined) {
  if (!valor || valor === 'NENHUM') return null

  const rotulos: Record<string, string> = {
    BAIXO: 'Baixo',
    MEDIO: 'Médio',
    ALTO: 'Alto',
    INFLAMAVEL: 'Inflamável',
    RADIOATIVO: 'Radioativo',
    TOXICO: 'Tóxico',
    CORROSIVO: 'Corrosivo',
    BIOLOGICO: 'Biológico',
    VALIDADE: 'Validade',
    MICROBIANO: 'Microbiano',
    QUIMICO: 'Químico',
  }

  return rotulos[valor] ?? valor
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/^./, (letra) => letra.toUpperCase())
}

function descricaoOperacionalProduto(item: PedidoResponse['itens'][number]) {
  const partes = [item.produtoUnidadeArmazenamento]

  if (item.produtoPerecivel) {
    const tipoPerecivel = rotuloEnum(item.produtoTipoPerecivel)
    partes.push(tipoPerecivel ? `Perecível (${tipoPerecivel})` : 'Perecível')
  }

  if (item.produtoRisco && item.produtoRisco !== 'NENHUM') {
    const nivel = rotuloEnum(item.produtoRisco)
    const tipo = rotuloEnum(item.produtoTipoRisco)
    partes.push(`Risco ${nivel}${tipo ? ` — ${tipo}` : ''}`)
  }

  if (item.produtoDescricaoRisco?.trim()) {
    partes.push(item.produtoDescricaoRisco.trim())
  }

  if (item.produtoCondicoesArmazenamento?.trim()) {
    partes.push(`Armazenamento: ${item.produtoCondicoesArmazenamento.trim()}`)
  }

  return partes.filter(Boolean).join(' • ')
}

function itemSemContextoProduto(item: PedidoResponse['itens'][number]) {
  return item.produtoRisco === undefined
    || item.produtoPerecivel === undefined
    || item.produtoTipoRisco === undefined
}

async function enriquecerItensComProduto(pedido: PedidoResponse): Promise<PedidoResponse> {
  const ids = [...new Set(
    pedido.itens
      .filter(itemSemContextoProduto)
      .map((item) => item.produtoId),
  )]

  if (ids.length === 0) return pedido

  const resultados = await Promise.allSettled(
    ids.map(async (produtoId) => {
      const { data } = await http.get<ProdutoDetalhe>(`/v1/produtos/${produtoId}`)
      return data
    }),
  )

  const produtos = new Map<string, ProdutoDetalhe>()
  for (const resultado of resultados) {
    if (resultado.status === 'fulfilled') {
      produtos.set(resultado.value.id, resultado.value)
    }
  }

  return {
    ...pedido,
    itens: pedido.itens.map((item) => {
      const produto = produtos.get(item.produtoId)
      if (!produto) return item

      return {
        ...item,
        produtoRisco: produto.risco,
        produtoTipoRisco: produto.tipoRisco,
        produtoDescricaoRisco: produto.descricaoRisco,
        produtoPerecivel: produto.perecivel,
        produtoTipoPerecivel: produto.tipoPerecivel,
        produtoCondicoesArmazenamento: produto.condicoesArmazenamento,
      }
    }),
  }
}

async function aplicarContextoOperacional(pedido: PedidoResponse): Promise<PedidoResponse> {
  const enriquecido = await enriquecerItensComProduto(pedido)

  return {
    ...enriquecido,
    urgente: enriquecido.urgente && enriquecido.status === 'PENDENTE',
    itens: enriquecido.itens.map((item) => ({
      ...item,
      produtoUnidadeArmazenamento: descricaoOperacionalProduto(item),
    })),
  }
}

async function aplicarContextoOperacionalLista(pedidos: PedidoResponse[]) {
  return Promise.all(pedidos.map(aplicarContextoOperacional))
}

export const pedidoService = {
  async listarTodos() {
    const { data } = await http.get<PedidoResponse[]>('/v1/pedidos')
    return aplicarContextoOperacionalLista(data)
  },

  async listarPorStatus(status: StatusPedido) {
    const { data } = await http.get<PedidoResponse[]>('/v1/pedidos/por-status', {
      params: { status },
    })
    return aplicarContextoOperacionalLista(data)
  },

  async listarPorUrgencia(urgente: boolean) {
    const { data } = await http.get<PedidoResponse[]>('/v1/pedidos/por-urgencia', {
      params: { urgente },
    })
    return aplicarContextoOperacionalLista(data)
  },

  async buscarPorId(id: string) {
    const { data } = await http.get<PedidoResponse>(`/v1/pedidos/${id}`)
    return aplicarContextoOperacional(data)
  },

  async aprovar(id: string, payload: AprovarPedidoRequest) {
    const { data } = await http.put<PedidoResponse>(`/v1/pedidos/${id}/aprovar`, payload)
    return aplicarContextoOperacional(data)
  },

  async rejeitar(id: string, observacao: string) {
    const { data } = await http.put<PedidoResponse>(`/v1/pedidos/${id}/rejeitar`, null, {
      params: { observacao },
    })
    return aplicarContextoOperacional(data)
  },

  async entregar(id: string) {
    const { data } = await http.put<PedidoResponse>(`/v1/pedidos/${id}/entregar`)
    return aplicarContextoOperacional(data)
  },

  async cancelar(id: string, observacao: string) {
    const { data } = await http.put<PedidoResponse>(`/v1/pedidos/${id}/cancelar`, null, {
      params: { observacao },
    })
    return aplicarContextoOperacional(data)
  },

  async listarPorUsuario(usuarioId: string) {
    const { data } = await http.get<PedidoResponse[]>('/v1/pedidos/por-usuario', {
      params: { usuarioId },
    })
    return aplicarContextoOperacionalLista(data)
  },

  async criar(payload: PedidoRequest) {
    const { data } = await http.post<PedidoResponse>('/v1/pedidos', payload)
    return aplicarContextoOperacional(data)
  },

  async listarProjetosPorLaboratorio(laboratorioId: string) {
    const { data } = await http.get<ProjetoResponse[]>('/v1/projetos/por-laboratorio', {
      params: { laboratorioId },
    })
    return data.filter((projeto) => projeto.ativo)
  },

  async listarEstoquePorUnidade(unidadeId: string) {
    const { data } = await http.get<EstoqueCentralResponse[]>('/v1/estoque-central/por-unidade', {
      params: { unidadeId },
    })
    return data.filter((estoque) => estoque.ativo)
  },
}
