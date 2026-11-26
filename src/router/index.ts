import { createRouter, createWebHistory, type RouteLocationNormalized, type RouteMeta } from 'vue-router'

import { FAQ_ID, findHelpTask } from '@/modules/ajuda/helpTasks'
import { ehGestao, PAPEIS_ADMIN, PAPEIS_GESTAO, temAlgumPapel } from '@/modules/auth/papeis'
import type { AuthConfig, CategoriaCargo, PapelSistema, UsuarioSessao } from '@/modules/auth/types/session'
import { http } from '@/services/http'
import { useSessionStore } from '@/stores/session'

const ROTA_AGUARDANDO = '/aguardando-aprovacao'

/**
 * The test-user page only exists while the API exposes the developer login; any failure to confirm
 * that sends the visitor back to the corporate login instead of showing a page that cannot work.
 */
export async function entradaLoginTeste(): Promise<true | string> {
  try {
    const { data } = await http.get<AuthConfig>('/v1/auth/config')
    if (!data.devLoginAtivo) return '/login'
  } catch {
    return '/login'
  }

  // "Trocar usuário" lands here: picking another test user starts from a clean session.
  const session = useSessionStore()
  if (session.autenticado) session.sair()
  return true
}

function rotaInicial() {
  const session = useSessionStore()
  if (session.pendente) return ROTA_AGUARDANDO
  return ehGestao(session.usuario) ? '/dashboard' : '/inicio'
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: () => {
        const session = useSessionStore()
        return session.autenticado ? rotaInicial() : '/login'
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/modules/auth/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/login/teste',
      name: 'login-teste',
      component: () => import('@/modules/auth/views/LoginTesteView.vue'),
      meta: { public: true },
      beforeEnter: entradaLoginTeste,
    },
    {
      path: ROTA_AGUARDANDO,
      name: 'aguardando-aprovacao',
      component: () => import('@/modules/auth/views/AguardandoAprovacaoView.vue'),
      meta: { requiresSession: true },
    },
    {
      path: '/residuos/:id/rotulo',
      name: 'gestao-residuo-rotulo',
      component: () => import('@/modules/residuos/views/gestao/RotuloResiduoAjustadoView.vue'),
      meta: { requiresSession: true, papeis: PAPEIS_GESTAO },
    },
    {
      path: '/produtos/:id/rotulo',
      name: 'gestao-produto-rotulo',
      component: () => import('@/modules/produtos/views/RotuloProdutoView.vue'),
      meta: { requiresSession: true, papeis: PAPEIS_GESTAO },
    },
    {
      path: '/solucoes/:id/rotulo',
      name: 'gestao-solucao-rotulo',
      component: () => import('@/modules/solucoes/views/RotuloSolucaoView.vue'),
      meta: { requiresSession: true, papeis: PAPEIS_GESTAO },
    },
    {
      path: '/lotes/:id/documento-entrada',
      name: 'gestao-documento-entrada-lote',
      component: () => import('@/modules/estoque/views/DocumentoEntradaLoteView.vue'),
      meta: { requiresSession: true, papeis: PAPEIS_GESTAO },
    },
    {
      path: '/',
      component: () => import('@/layouts/SolicitanteLayout.vue'),
      meta: { requiresSession: true, somenteSemPapelDeGestao: true },
      children: [
        {
          path: 'inicio',
          name: 'solicitante-dashboard',
          component: () => import('@/modules/dashboard/views/solicitante/DashboardSolicitanteView.vue'),
        },
        {
          path: 'pedidos-orientandos',
          name: 'pedidos-orientandos',
          redirect: { path: '/meus-pedidos', query: { visao: 'orientandos' } },
          meta: { categorias: ['PESQUISADOR', 'ANALISTA'] },
        },
        {
          path: 'meus-pedidos',
          name: 'meus-pedidos',
          component: () => import('@/modules/pedidos/views/solicitante/MeusPedidosView.vue'),
        },
        {
          path: 'minhas-solucoes',
          name: 'solicitante-solucoes',
          component: () => import('@/modules/solucoes/views/SolucoesSolicitanteView.vue'),
        },
        {
          path: 'solucoes/solicitar',
          name: 'solicitante-nova-solucao',
          component: () => import('@/modules/solucoes/views/NovaSolucaoView.vue'),
          props: true,
        },
        {
          path: 'meus-residuos',
          name: 'meus-residuos',
          component: () => import('@/modules/residuos/views/solicitante/MeusResiduosView.vue'),
        },
        {
          path: 'pedidos/novo',
          name: 'novo-pedido',
          component: () => import('@/modules/pedidos/views/solicitante/NovoPedidoView.vue'),
        },
        {
          path: 'residuos/novo',
          name: 'informar-residuo',
          component: () => import('@/modules/residuos/views/solicitante/InformarResiduoView.vue'),
        },
      ],
    },
    {
      path: '/',
      component: () => import('@/layouts/GestaoLayout.vue'),
      meta: { requiresSession: true, papeis: PAPEIS_GESTAO },
      children: [
        {
          path: 'dashboard',
          name: 'gestao-dashboard',
          component: () => import('@/modules/dashboard/views/gestao/DashboardGestaoView.vue'),
        },
        {
          path: 'pedidos',
          name: 'gestao-pedidos',
          component: () => import('@/modules/pedidos/views/gestao/PedidosGestaoView.vue'),
        },
        {
          path: 'estoque',
          name: 'gestao-estoque',
          component: () => import('@/modules/estoque/views/EstoqueGestaoView.vue'),
        },
        {
          path: 'estoque/lotes-vencendo',
          name: 'gestao-lotes-vencendo',
          component: () => import('@/modules/estoque/views/LotesVencendoView.vue'),
        },
        {
          path: 'estoque/:id',
          name: 'gestao-estoque-detalhe',
          component: () => import('@/modules/estoque/views/EstoqueDetalheView.vue'),
        },
        {
          path: 'movimentacoes',
          name: 'gestao-movimentacoes',
          component: () => import('@/modules/movimentacoes/views/MovimentacoesGestaoView.vue'),
        },
        {
          path: 'projetos',
          name: 'gestao-projetos',
          component: () => import('@/modules/projetos/views/ProjetosGestaoView.vue'),
        },
        {
          path: 'estagiarios',
          name: 'gestao-estagiarios',
          component: () => import('@/modules/estagiarios/views/EstagiariosGestaoView.vue'),
        },
        {
          path: 'solucoes',
          name: 'gestao-solucoes',
          component: () => import('@/modules/solucoes/views/SolucoesGestaoView.vue'),
        },
        {
          path: 'solucoes/nova',
          name: 'gestao-nova-solucao',
          component: () => import('@/modules/solucoes/views/NovaSolucaoView.vue'),
        },
        {
          path: 'residuos/informar',
          name: 'gestao-informar-residuo',
          component: () => import('@/modules/residuos/views/solicitante/InformarResiduoView.vue'),
        },
        {
          path: 'residuos',
          name: 'gestao-residuos',
          component: () => import('@/modules/residuos/views/gestao/ResiduosGestaoCompletoView.vue'),
        },
        {
          path: 'relatorios',
          name: 'gestao-relatorios',
          component: () => import('@/modules/relatorios/views/RelatoriosExportacaoView.vue'),
        },
        {
          path: 'relatorios/residuos',
          name: 'gestao-relatorio-residuos',
          component: () => import('@/modules/relatorios/views/RelatorioResiduosView.vue'),
        },
        {
          path: 'relatorios/pessoas-laboratorio',
          name: 'gestao-relatorio-pessoas-laboratorio',
          component: () => import('@/modules/relatorios/views/RelatorioPessoasLaboratorioView.vue'),
        },
        {
          path: 'administracao/unidades',
          name: 'admin-unidades',
          component: () => import('@/modules/admin/views/UnidadesHabilitacaoView.vue'),
          meta: { requiresSession: true, papeis: ['ADMINISTRADOR_GERAL'] },
        },
        {
          path: 'administracao/cadastros/vinculos/importar',
          name: 'gestao-vinculos-importar',
          component: () => import('@/modules/admin/views/ImportarPessoasView.vue'),
          meta: { requiresSession: true, papeis: PAPEIS_GESTAO },
        },
        {
          path: 'administracao/cadastros/vinculos',
          name: 'gestao-vinculos-cadastros',
          component: () => import('@/modules/admin/views/VinculosOperacionaisGestaoView.vue'),
          meta: { requiresSession: true, papeis: PAPEIS_GESTAO },
        },
        {
          path: 'administracao/cadastros',
          name: 'admin-cadastros',
          component: () => import('@/modules/admin/views/CadastrosAdminView.vue'),
          meta: { requiresSession: true, papeis: PAPEIS_ADMIN },
        },
        {
          path: 'administracao/cadastros/residuos-solucoes',
          name: 'admin-catalogos-residuos-solucoes',
          component: () => import('@/modules/admin/views/CatalogosResiduosSolucoesView.vue'),
          meta: { requiresSession: true, papeis: PAPEIS_ADMIN },
        },
        {
          path: 'administracao/cadastros/modelos-residuo',
          name: 'admin-modelos-residuo',
          redirect: '/administracao/cadastros/residuos-solucoes?tipo=residuos',
          meta: { requiresSession: true, papeis: PAPEIS_ADMIN },
        },
        {
          path: 'administracao/cadastros/modelos-solucao',
          name: 'admin-modelos-solucao',
          redirect: '/administracao/cadastros/residuos-solucoes?tipo=solucoes',
          meta: { requiresSession: true, papeis: PAPEIS_ADMIN },
        },
        {
          path: 'solicitacoes/novo',
          name: 'gestao-novo-pedido',
          component: () => import('@/modules/pedidos/views/solicitante/NovoPedidoView.vue'),
        },
        {
          path: 'solicitacoes/meus-pedidos',
          name: 'gestao-meus-pedidos',
          component: () => import('@/modules/pedidos/views/solicitante/MeusPedidosView.vue'),
        },
      ],
    },
    {
      path: '/ajuda',
      name: 'ajuda',
      component: () => import('@/modules/ajuda/views/HelpCenterView.vue'),
      meta: { public: true },
    },
    {
      path: '/ajuda/:taskId',
      name: 'ajuda-tarefa',
      component: () => import('@/modules/ajuda/views/HelpCenterView.vue'),
      meta: { public: true },
      // A stale or mistyped link lands on the help index instead of a blank page.
      beforeEnter: (to) => {
        const id = String(to.params.taskId)
        return id === FAQ_ID || findHelpTask(id) ? true : { name: 'ajuda' }
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/modules/system/views/NotFoundView.vue'),
      meta: { public: true },
    },
  ],
})

/**
 * Every matched record's rule must hold (a child narrows its parent). `papeis`: any of these roles;
 * `categorias`: any of these job categories; `somenteSemPapelDeGestao`: the solicitante area, which
 * people with a management role do not use yet (they keep the gestão layout).
 */
export function permiteAcesso(meta: RouteMeta, usuario: UsuarioSessao | null) {
  const papeis = meta.papeis as PapelSistema[] | undefined
  if (papeis?.length && !temAlgumPapel(usuario, papeis)) return false
  const categorias = meta.categorias as CategoriaCargo[] | undefined
  if (categorias?.length && !(usuario?.categoriaCargo && categorias.includes(usuario.categoriaCargo))) return false
  if (meta.somenteSemPapelDeGestao && ehGestao(usuario)) return false
  return true
}

// Only the fields the guard reads, so tests can pass router.resolve() results directly.
export function guardaDeRota(to: Pick<RouteLocationNormalized, 'path' | 'fullPath' | 'meta' | 'matched'>) {
  const session = useSessionStore()

  if (session.expirarSeNecessario()) {
    if (to.path === '/login') return true

    return {
      path: '/login',
      query: { motivo: 'sessao-expirada' },
    }
  }

  // A pending user sees only the waiting screen (the backend refuses everything else with 403 anyway).
  if (session.autenticado && session.pendente) {
    // The help center stays reachable so a pending user can learn how to proceed.
    const ehAjuda = to.path === '/ajuda' || to.path.startsWith('/ajuda/')
    return to.path === ROTA_AGUARDANDO || ehAjuda ? true : ROTA_AGUARDANDO
  }

  if (to.path === ROTA_AGUARDANDO && session.autenticado) {
    return rotaInicial()
  }

  if (to.meta.public) {
    if (to.path === '/login' && session.autenticado) {
      return rotaInicial()
    }
    return true
  }

  if (to.meta.requiresSession && !session.autenticado) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (session.autenticado && !to.matched.every((record) => permiteAcesso(record.meta, session.usuario))) {
    return rotaInicial()
  }

  return true
}

router.beforeEach(guardaDeRota)
