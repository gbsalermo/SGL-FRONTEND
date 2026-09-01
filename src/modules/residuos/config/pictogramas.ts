import type { TipoRiscoResiduo } from '@/modules/residuos/types/residuo'

export interface PictogramaResiduoConfig {
  arquivo: string | null
  rotulo: string
}

const BASE_PATH = '/assets/residuos/pictogramas'

export const PICTOGRAMAS_RESIDUO: Record<TipoRiscoResiduo, PictogramaResiduoConfig> = {
  NENHUM: { arquivo: null, rotulo: 'Nenhum' },
  INFLAMAVEL: { arquivo: 'inflamavel.svg', rotulo: 'Inflamável' },
  RADIOATIVO: { arquivo: 'radioativo.svg', rotulo: 'Radioativo' },
  TOXICO: { arquivo: 'toxico.svg', rotulo: 'Tóxico' },
  CORROSIVO: { arquivo: 'corrosivo.svg', rotulo: 'Corrosivo' },
  BIOLOGICO: { arquivo: 'biologico.svg', rotulo: 'Biológico' },
  IRRITANTE: { arquivo: 'irritante.svg', rotulo: 'Irritante' },
  PERIGO_SAUDE: { arquivo: 'perigo-saude.svg', rotulo: 'Perigo à saúde' },
  OXIDANTE: { arquivo: 'oxidante.svg', rotulo: 'Oxidante' },
  EXPLOSIVO: { arquivo: 'explosivo.svg', rotulo: 'Explosivo' },
  GAS_PRESSURIZADO: { arquivo: 'gas-pressurizado.svg', rotulo: 'Gás pressurizado' },
  PERIGO_AMBIENTAL: { arquivo: 'perigo-ambiental.svg', rotulo: 'Perigo ambiental' },
}

export function caminhoPictogramaResiduo(risco: TipoRiscoResiduo) {
  const arquivo = PICTOGRAMAS_RESIDUO[risco].arquivo
  return arquivo ? `${BASE_PATH}/${arquivo}` : null
}

export function rotuloRiscoResiduo(risco: TipoRiscoResiduo) {
  return PICTOGRAMAS_RESIDUO[risco].rotulo
}
