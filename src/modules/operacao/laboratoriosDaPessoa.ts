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

/** The part of an additional link that decides whether it is in force today. */
interface VinculoComPrazo {
  laboratorioId: string
  encerrado: boolean
  dataInicio: string
  dataFim?: string | null
}

function hojeIso(): string {
  return new Date().toLocaleDateString('en-CA')
}

export function possuiVinculoVigenteNoLaboratorio(vinculos: VinculoComPrazo[], id: string): boolean {
  const hoje = hojeIso()
  return vinculos.some(v => v.laboratorioId === id && !v.encerrado && v.dataInicio <= hoje && (!v.dataFim || v.dataFim >= hoje))
}

/**
 * An employee may request in any active laboratory of the Unidade (decision 6); the person's own
 * laboratories come first so the common case stays on top. Input order is kept inside each group.
 */
export function laboratoriosDaUnidadeComOsDaPessoaPrimeiro<T extends { id: string }>(
  laboratoriosDaUnidade: T[], laboratoriosDaPessoa: LaboratorioResumo[],
): T[] {
  const proprios = laboratoriosDaUnidade.filter(l => atuaNoLaboratorio(laboratoriosDaPessoa, l.id))
  const demais = laboratoriosDaUnidade.filter(l => !atuaNoLaboratorio(laboratoriosDaPessoa, l.id))
  return [...proprios, ...demais]
}

/** Only laboratories reached through an additional link get a suffix; the other ones are plain. */
export function sufixoDeVinculoAdicional(
  laboratoriosDaPessoa: LaboratorioResumo[], vinculos: VinculoComPrazo[], id: string,
): string {
  return !atuaNoLaboratorio(laboratoriosDaPessoa, id) && possuiVinculoVigenteNoLaboratorio(vinculos, id)
    ? ' (vínculo adicional)' : ''
}
