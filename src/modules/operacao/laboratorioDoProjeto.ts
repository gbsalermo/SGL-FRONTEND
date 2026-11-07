import { atuaNoLaboratorio } from '@/modules/operacao/laboratoriosDaPessoa'
import type { LaboratorioResumo } from '@/modules/projetos/types/projetos'

export const AVISO_SEM_LABORATORIO_DO_ESTAGIARIO =
  'Nenhum laboratório deste projeto está entre os seus laboratórios. Peça à Gestão para incluí-lo.'

/**
 * An intern may only act in project laboratories that are also in their own list; offering any other
 * would preselect a laboratory the API refuses with 400.
 */
export function laboratoriosOferecidosAoEstagiario(
  laboratoriosDoProjeto: LaboratorioResumo[], laboratoriosDaPessoa: LaboratorioResumo[],
): LaboratorioResumo[] {
  return laboratoriosAtivos(laboratoriosDoProjeto).filter(l => atuaNoLaboratorio(laboratoriosDaPessoa, l.id))
}

/**
 * Only active laboratories are offered: the API ignores inactive ones when it resolves the
 * operational laboratory and rejects an explicitly chosen inactive one with 400.
 */
export function laboratoriosAtivos(laboratorios: LaboratorioResumo[]): LaboratorioResumo[] {
  return laboratorios.filter(l => l.ativo)
}

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

/**
 * Informational list of every laboratory of the project. Inactive ones stay visible (the
 * project still lists them) but are flagged, so nobody assumes they can receive requests.
 */
export function nomesDosLaboratorios(laboratorios: LaboratorioResumo[]): string {
  return laboratorios.map(l => (l.ativo ? l.nome : `${l.nome} (inativo)`)).join(', ')
}
