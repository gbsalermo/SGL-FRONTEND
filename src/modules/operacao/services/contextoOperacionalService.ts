import { http } from '@/services/http'
import type { ContextoParticipacaoOperacional } from '@/modules/operacao/types/contextoOperacional'

/**
 * APIs de leitura da 7.5.2. O endpoint pessoal exige autorizar a identidade
 * do titular no backend antes de uso real. A sessao DEV nao e autenticacao.
 *
 * A Etapa 8 utiliza esta consulta nos formularios de Pedidos e Solucoes.
 * O backend resolve e valida a participacao na criacao do Pedido.
 */
export const contextoOperacionalService = {
  async listarParticipacoesEstagiario(usuarioId: string) {
    const { data } = await http.get<ContextoParticipacaoOperacional[]>(
      `/v1/contextos-operacionais/usuarios/${encodeURIComponent(usuarioId)}`,
    )
    return data
  },

  async listarParticipacoesAtividade(atividadeId: string) {
    const { data } = await http.get<ContextoParticipacaoOperacional[]>(
      `/v1/contextos-operacionais/atividades/${encodeURIComponent(atividadeId)}/participacoes`,
    )
    return data
  },

  async listarParticipacoesProjeto(projetoId: string) {
    const { data } = await http.get<ContextoParticipacaoOperacional[]>(
      `/v1/contextos-operacionais/projetos/${encodeURIComponent(projetoId)}/participacoes`,
    )
    return data
  },
}
