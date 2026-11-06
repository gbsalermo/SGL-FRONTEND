import { describe, expect, it } from 'vitest'

import { aguardaAprovacao, perfisConcedidosPor, ROTA_APROVAR_PENDENTES } from '@/modules/auth/perfis'

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

describe('aguardaAprovacao', () => {
  it('so a situacao PENDENTE_VINCULACAO conta como aguardando aprovacao', () => {
    expect(aguardaAprovacao({ situacao: 'PENDENTE_VINCULACAO' })).toBe(true)
    expect(aguardaAprovacao({ situacao: 'ATIVO' })).toBe(false)
    // API antiga, sem o campo: nada bloqueado, a propria API recusa a troca se preciso.
    expect(aguardaAprovacao({})).toBe(false)
    expect(aguardaAprovacao(null)).toBe(false)
  })

  it('a rota de aprovacao abre a aba Pendentes de Vinculos', () => {
    expect(ROTA_APROVAR_PENDENTES).toEqual({ path: '/administracao/cadastros/vinculos', query: { aba: 'PENDENTES' } })
  })
})
