import type { AbaCadastro } from '@/modules/admin/types/cadastros'

type RouteQuery = Record<string, unknown>

interface RouteHelpRule {
  match: (path: string, query: RouteQuery) => boolean
  taskId: string
}

const exact = (...paths: string[]) => (path: string) => paths.includes(path)
const prefix = (base: string) => (path: string) => path === base || path.startsWith(`${base}/`)

// Order matters: the first match wins, so specific cases go before generic ones.
const ROUTE_HELP_RULES: RouteHelpRule[] = [
  { match: (path, query) => path === '/meus-pedidos' && query.visao === 'orientandos', taskId: 'pedidos-dos-orientandos' },
  { match: exact('/pedidos/novo', '/meus-pedidos'), taskId: 'fazer-um-pedido-e-acompanhar' },
  { match: exact('/solucoes/solicitar', '/minhas-solucoes'), taskId: 'solicitar-uma-solucao' },
  { match: exact('/residuos/novo', '/meus-residuos'), taskId: 'informar-um-residuo' },
  { match: exact('/dashboard'), taskId: 'painel-e-alertas-da-gestao' },
  { match: exact('/pedidos'), taskId: 'analisar-pedido' },
  { match: prefix('/estoque'), taskId: 'estoque-e-lotes' },
  { match: exact('/movimentacoes'), taskId: 'movimentacoes-do-estoque' },
  { match: exact('/solucoes', '/solucoes/nova'), taskId: 'central-de-solucoes' },
  { match: exact('/residuos', '/residuos/informar'), taskId: 'gestao-de-residuos' },
  { match: prefix('/relatorios'), taskId: 'relatorios' },
  { match: exact('/administracao/cadastros/vinculos/importar'), taskId: 'importar-pessoa-da-embrapa' },
  { match: exact('/estagiarios'), taskId: 'acompanhar-estagiarios' },
  { match: exact('/projetos'), taskId: 'projeto-em-varios-laboratorios' },
  {
    match: exact(
      '/administracao/cadastros/modelos-residuo',
      '/administracao/cadastros/modelos-solucao',
      '/administracao/cadastros/residuos-solucoes',
    ),
    taskId: 'modelos-de-solucao-e-de-residuo',
  },
]

// `/administracao/cadastros` is deliberately unmapped: its tabs map to different tasks
// (see helpTaskForCadastroTab), so the view renders its own link.
export function helpTaskForRoute(path: string, query: RouteQuery = {}): string | null {
  return ROUTE_HELP_RULES.find((rule) => rule.match(path, query))?.taskId ?? null
}

const CADASTRO_TAB_HELP: Record<AbaCadastro, string> = {
  laboratorios: 'cadastro-de-laboratorios',
  projetos: 'projeto-em-varios-laboratorios',
  produtos: 'produtos-classes-e-permissoes',
  'classes-residuo': 'produtos-classes-e-permissoes',
  'locais-armazenamento': 'produtos-classes-e-permissoes',
  permissoes: 'produtos-classes-e-permissoes',
  'residuos-solucoes': 'modelos-de-solucao-e-de-residuo',
}

export function helpTaskForCadastroTab(tab: AbaCadastro): string {
  return CADASTRO_TAB_HELP[tab]
}
