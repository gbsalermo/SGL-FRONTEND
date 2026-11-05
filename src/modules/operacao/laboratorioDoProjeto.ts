import type { LaboratorioResumo } from '@/modules/projetos/types/projetos'

/**
 * A project may run in several laboratories. With a single one there is nothing to ask,
 * so it is preselected; with several, the requester must pick explicitly — guessing would
 * route the request to a laboratory the responsible person did not choose.
 */
export function laboratorioInicial(laboratorios: LaboratorioResumo[]): string {
  return laboratorios.length === 1 ? laboratorios[0]!.id : ''
}

export function precisaEscolherLaboratorio(laboratorios: LaboratorioResumo[]): boolean {
  return laboratorios.length > 1
}

/** Returns the id only when it belongs to the project, so a stale choice is never sent. */
export function laboratorioDoProjetoValido(laboratorios: LaboratorioResumo[], laboratorioId: string): string {
  return laboratorios.some(l => l.id === laboratorioId) ? laboratorioId : ''
}
