import type { UsuarioSessao } from '@/modules/auth/types/session'
import type { ContextoParticipacaoOperacional } from '@/modules/operacao/types/contextoOperacional'
import type { LaboratorioResumo } from '@/modules/projetos/types/projetos'
import { useSessionStore } from '@/stores/session'

export function participacaoEstagio(laboratorios: LaboratorioResumo[]): ContextoParticipacaoOperacional {
  return {
    origem: 'PARTICIPACAO_ESTAGIO', participacaoId: 'part-1', vinculoEstagioId: 'v-1',
    usuarioId: 'u-1', usuarioNome: 'Estagiária', atividadeId: 'at-1', atividadeNome: 'Atividade',
    atividadeCodigoSeg: null, sciId: 'sci-1', sciNome: 'SCI', projetoId: 'proj-1', projetoNome: 'Projeto',
    laboratorios, unidadeId: 'unidade-1', dataInicioParticipacao: '2026-01-01', dataFimParticipacao: null,
    aberta: true, elegivel: true, motivoInelegibilidade: null,
  }
}

export function entrarComoEstagiario() {
  const usuario: UsuarioSessao = {
    id: 'u-1', nome: 'Estagiária', email: 'e@embrapa.br', perfil: 'ESTAGIARIO', situacao: 'ATIVO',
    unidadeId: 'unidade-1', unidadeNome: 'Mandioca', unidadeSigla: 'CNPMF',
    laboratorioId: null, laboratorioNome: null, ativo: true,
  }
  useSessionStore().$patch({ token: 'jwt', usuario, expiraEm: Date.now() + 60_000 })
}

export const DOIS_LABORATORIOS: LaboratorioResumo[] = [{ id: 'A', nome: 'Lab A', ativo: true }, { id: 'B', nome: 'Lab B', ativo: true }]
export const UM_LABORATORIO: LaboratorioResumo[] = [{ id: 'A', nome: 'Lab A', ativo: true }]
export const UM_ATIVO_UM_INATIVO: LaboratorioResumo[] = [{ id: 'A', nome: 'Lab A', ativo: true }, { id: 'I', nome: 'Lab Inativo', ativo: false }]
