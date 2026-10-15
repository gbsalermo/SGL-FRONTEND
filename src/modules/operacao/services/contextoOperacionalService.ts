import { http } from '@/services/http'
import type { ContextoParticipacaoOperacional } from '@/modules/operacao/types/contextoOperacional'

/**
 * APIs de leitura da 7.5.2. O endpoint pessoal exige autorizar a identidade
 * do titular no backend antes de uso real. A sessao DEV nao e autenticacao.
 *
 * Esta camada ainda NAO e conectada a NovoPedido/NovaSolucao: o endpoint
 * de criacao precisa derivar o contexto de participacaoId na Etapa 8.
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
