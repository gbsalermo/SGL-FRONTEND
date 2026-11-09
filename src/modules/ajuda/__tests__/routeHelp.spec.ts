import { describe, expect, it } from 'vitest'
import type { AbaCadastro } from '@/modules/admin/types/cadastros'
import { findHelpTask } from '../helpTasks'
import { helpTaskForCadastroTab, helpTaskForRoute } from '../routeHelp'

const ROUTE_TABLE: Array<[string, string]> = [
  ['/pedidos/novo', 'fazer-um-pedido-e-acompanhar'],
  ['/meus-pedidos', 'fazer-um-pedido-e-acompanhar'],
  ['/solicitacoes/novo', 'fazer-um-pedido-e-acompanhar'],
  ['/solicitacoes/meus-pedidos', 'fazer-um-pedido-e-acompanhar'],
  ['/administracao/cadastros/vinculos', 'importar-pessoa-da-embrapa'],
  ['/solucoes/solicitar', 'solicitar-uma-solucao'],
  ['/minhas-solucoes', 'solicitar-uma-solucao'],
  ['/residuos/novo', 'informar-um-residuo'],
  ['/meus-residuos', 'informar-um-residuo'],
  ['/dashboard', 'painel-e-alertas-da-gestao'],
  ['/pedidos', 'analisar-pedido'],
  ['/estoque', 'estoque-e-lotes'],
  ['/estoque/abc', 'estoque-e-lotes'],
  ['/estoque/lotes-vencendo', 'estoque-e-lotes'],
  ['/movimentacoes', 'movimentacoes-do-estoque'],
  ['/solucoes', 'central-de-solucoes'],
  ['/solucoes/nova', 'central-de-solucoes'],
  ['/residuos', 'gestao-de-residuos'],
  ['/residuos/informar', 'gestao-de-residuos'],
  ['/relatorios', 'relatorios'],
  ['/relatorios/residuos', 'relatorios'],
  ['/relatorios/pessoas-laboratorio', 'relatorios'],
  ['/administracao/cadastros/vinculos/importar', 'importar-pessoa-da-embrapa'],
  ['/estagiarios', 'acompanhar-estagiarios'],
  ['/projetos', 'projeto-em-varios-laboratorios'],
  ['/administracao/cadastros/modelos-residuo', 'modelos-de-solucao-e-de-residuo'],
  ['/administracao/cadastros/modelos-solucao', 'modelos-de-solucao-e-de-residuo'],
  ['/administracao/cadastros/residuos-solucoes', 'modelos-de-solucao-e-de-residuo'],
]

const TABS: AbaCadastro[] = ['laboratorios', 'projetos', 'produtos', 'residuos-solucoes', 'classes-residuo', 'locais-armazenamento', 'permissoes']

describe('helpTaskForRoute', () => {
  it.each(ROUTE_TABLE)('maps %s to %s', (path, taskId) => {
    expect(helpTaskForRoute(path)).toBe(taskId)
  })

  it('maps the orientandos view before the generic my-orders screen', () => {
    expect(helpTaskForRoute('/meus-pedidos', { visao: 'orientandos' })).toBe('pedidos-dos-orientandos')
    expect(helpTaskForRoute('/meus-pedidos')).toBe('fazer-um-pedido-e-acompanhar')
    expect(helpTaskForRoute('/solicitacoes/meus-pedidos', { visao: 'orientandos' })).toBe('pedidos-dos-orientandos')
  })

  it('leaves cadastros to the tabs', () => {
    expect(helpTaskForRoute('/administracao/cadastros')).toBeNull()
  })

  it('returns null for unmapped screens', () => {
    expect(helpTaskForRoute('/inicio')).toBeNull()
    expect(helpTaskForRoute('/administracao/unidades')).toBeNull()
  })

  it('only returns ids that exist', () => {
    const ids = [...ROUTE_TABLE.map(([, id]) => id), ...TABS.map(helpTaskForCadastroTab)]
    for (const id of ids) expect(findHelpTask(id), id).toBeDefined()
  })
})

describe('helpTaskForCadastroTab', () => {
  it.each([
    ['laboratorios', 'cadastro-de-laboratorios'],
    ['projetos', 'projeto-em-varios-laboratorios'],
    ['produtos', 'produtos-classes-e-permissoes'],
    ['classes-residuo', 'produtos-classes-e-permissoes'],
    ['locais-armazenamento', 'produtos-classes-e-permissoes'],
    ['permissoes', 'produtos-classes-e-permissoes'],
    ['residuos-solucoes', 'modelos-de-solucao-e-de-residuo'],
  ] as Array<[AbaCadastro, string]>)('maps tab %s to %s', (tab, taskId) => {
    expect(helpTaskForCadastroTab(tab)).toBe(taskId)
  })
})
