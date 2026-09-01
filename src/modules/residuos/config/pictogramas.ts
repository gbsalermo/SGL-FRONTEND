import type { TipoRiscoResiduo } from '@/modules/residuos/types/residuo'

export interface PictogramaResiduoConfig {
  arquivo: string | null
  rotulo: string
}

const BASE_PATH = '/assets/residuos/pictogramas'

export const PICTOGRAMAS_RESIDUO: Record<TipoRiscoResiduo, PictogramaResiduoConfig> = {
  NENHUM: { arquivo: null, rotulo: 'Nenhum' },
  INFLAMAVEL: { arquivo: 'inflamavel.png', rotulo: 'Inflamável' },
  RADIOATIVO: { arquivo: 'radioativo.png', rotulo: 'Radioativo' },
  TOXICO: { arquivo: 'toxico.png', rotulo: 'Tóxico' },
  CORROSIVO: { arquivo: 'corrosivo.png', rotulo: 'Corrosivo' },
  BIOLOGICO: { arquivo: 'biologico.png', rotulo: 'Biológico' },
  IRRITANTE: { arquivo: 'irritante.png', rotulo: 'Irritante' },
  PERIGO_SAUDE: { arquivo: 'perigo-saude.png', rotulo: 'Perigo à saúde' },
  OXIDANTE: { arquivo: 'oxidante.png', rotulo: 'Oxidante' },
  EXPLOSIVO: { arquivo: 'explosivo.png', rotulo: 'Explosivo' },
  GAS_PRESSURIZADO: { arquivo: 'gas-pressurizado.png', rotulo: 'Gás pressurizado' },
  PERIGO_AMBIENTAL: { arquivo: 'perigo-ambiental.png', rotulo: 'Perigo ambiental' },
}

export function caminhoPictogramaResiduo(risco: TipoRiscoResiduo) {
  const arquivo = PICTOGRAMAS_RESIDUO[risco].arquivo
  return arquivo ? `${BASE_PATH}/${arquivo}` : null
}

export function rotuloRiscoResiduo(risco: TipoRiscoResiduo) {
  return PICTOGRAMAS_RESIDUO[risco].rotulo
}
