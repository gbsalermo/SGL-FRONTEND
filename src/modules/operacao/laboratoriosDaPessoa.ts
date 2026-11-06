import type { LaboratorioResumo } from '@/modules/projetos/types/projetos'

/** Whether the person works in the laboratory without needing an additional (time-boxed) link. */
export function atuaNoLaboratorio(laboratorios: LaboratorioResumo[], id: string): boolean {
  return laboratorios.some(l => l.id === id)
}

/**
 * Inactive laboratories stay in the list (the API keeps them), so they are flagged instead of hidden.
 * An empty string lets each screen choose its own placeholder.
 */
export function nomesDosLaboratoriosDaPessoa(laboratorios: LaboratorioResumo[], separador = ', '): string {
  return laboratorios.map(l => (l.ativo ? l.nome : `${l.nome} (inativo)`)).join(separador)
}
