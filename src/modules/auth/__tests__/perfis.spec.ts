import { describe, expect, it } from 'vitest'

import { perfisConcedidosPor } from '@/modules/auth/perfis'

describe('perfisConcedidosPor (regra 3b)', () => {
  it('gestor concede so perfis solicitantes', () => {
    expect(perfisConcedidosPor('GESTOR')).toEqual(['TECNICO', 'ANALISTA', 'PESQUISADOR', 'ESTAGIARIO'])
  })

  it('administrador local concede gestor mas nao administradores', () => {
    expect(perfisConcedidosPor('ADMINISTRADOR')).toContain('GESTOR')
    expect(perfisConcedidosPor('ADMINISTRADOR')).not.toContain('ADMINISTRADOR')
    expect(perfisConcedidosPor('ADMINISTRADOR')).not.toContain('ADMINISTRADOR_GERAL')
  })

  it('administrador geral concede todos', () => {
    expect(perfisConcedidosPor('ADMINISTRADOR_GERAL')).toContain('ADMINISTRADOR_GERAL')
    expect(perfisConcedidosPor('ADMINISTRADOR_GERAL')).toHaveLength(7)
  })

  it('solicitante nao concede nada', () => {
    expect(perfisConcedidosPor('TECNICO')).toEqual([])
    expect(perfisConcedidosPor(null)).toEqual([])
  })
})
