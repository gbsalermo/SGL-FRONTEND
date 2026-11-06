import type { FormacaoEstagiario, TipoBolsaEstagiario } from '@/modules/estagiarios/types/estagiario'

// Single source of the labels so the management screen and the create-bond dialog never diverge.
export const rotulosFormacao: Record<FormacaoEstagiario, string> = {
  ENSINO_MEDIO: 'Ensino médio',
  GRADUACAO: 'Graduação',
  MESTRADO: 'Mestrado',
  DOUTORADO: 'Doutorado',
  POS_DOUTORADO: 'Pós-doutorado',
  APOIO_ADMINISTRATIVO: 'Apoio administrativo',
  APOIO_TECNICO: 'Apoio técnico',
  OUTRO: 'Outro',
}

export const opcoesFormacao = Object.entries(rotulosFormacao).map(([valor, rotulo]) => ({
  valor: valor as FormacaoEstagiario,
  rotulo,
}))

export const opcoesBolsa: Array<{ valor: TipoBolsaEstagiario; rotulo: string }> = [
  { valor: 'BOLSA_CNPQ', rotulo: 'Bolsa CNPq' },
  { valor: 'BOLSA_CAPES', rotulo: 'Bolsa CAPES' },
  { valor: 'BOLSA_INSTITUCIONAL', rotulo: 'Bolsa institucional' },
  { valor: 'VOLUNTARIO', rotulo: 'Voluntário' },
  { valor: 'CONTRATUAL', rotulo: 'Contrato' },
]
