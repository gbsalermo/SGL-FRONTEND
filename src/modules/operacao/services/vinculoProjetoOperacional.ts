import type { VinculoOperacional } from '@/modules/admin/services/vinculosOperacionaisService'

/**
 * Verificação informativa do contexto do projeto no frontend.
 * O backend permanece a fonte autoritativa e persiste o snapshot no registro.
 * A API já resolve projetoId para vínculos específicos de SCI e Atividade.
 */
export function possuiVinculoVigenteComProjeto(
  vinculos: readonly VinculoOperacional[],
  projetoId: string,
  hoje: string = new Date().toLocaleDateString('en-CA'),
): boolean {
  if (!projetoId) return false
  return vinculos.some(v =>
    v.projetoId === projetoId
    && !v.encerrado
    && v.dataInicio <= hoje
    && (v.dataFim == null || v.dataFim >= hoje))
}
