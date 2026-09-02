import { createRouter, createWebHistory } from 'vue-router'

import type { PerfilUsuario } from '@/modules/auth/types/session'
import { useSessionStore } from '@/stores/session'

const PERFIS_GESTAO: PerfilUsuario[] = ['GESTOR', 'ADMINISTRADOR']
const PERFIS_SOLICITANTE: PerfilUsuario[] = ['TECNICO', 'ANALISTA', 'PESQUISADOR', 'ESTAGIARIO']

function ehPerfilGestao(perfil?: PerfilUsuario) {
  return Boolean(perfil && PERFIS_GESTAO.includes(perfil))
}

function rotaInicial() {
  const session = useSessionStore()
  return ehPerfilGestao(session.usuario?.perfil) ? '/pedidos' : '/meus-pedidos'
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
      path: '/residuos/:id/rotulo',
      name: 'gestao-residuo-rotulo',
      component: () => import('@/modules/residuos/views/gestao/RotuloResiduoAjustadoView.vue'),
      meta: { requiresSession: true, perfis: PERFIS_GESTAO },
    },
    {
      path: '/produtos/:id/rotulo',
      name: 'gestao-produto-rotulo',
      component: () => import('@/modules/produtos/views/RotuloProdutoView.vue'),
      meta: { requiresSession: true, perfis: PERFIS_GESTAO },
    },
    {
      path: '/',
      component: () => import('@/layouts/SolicitanteLayout.vue'),
      meta: { requiresSession: true, perfis: PERFIS_SOLICITANTE },
      children: [
        {
          path: 'meus-pedidos',
          name: 'meus-pedidos',
          component: () => import('@/modules/pedidos/views/solicitante/MeusPedidosView.vue'),
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
      meta: { requiresSession: true, perfis: PERFIS_GESTAO },
      children: [
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
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/modules/system/views/NotFoundView.vue'),
      meta: { public: true },
    },
  ],
})

router.beforeEach((to) => {
  const session = useSessionStore()

  if (session.expirarSeNecessario()) {
    if (to.path === '/login') return true

    return {
      path: '/login',
      query: { motivo: 'sessao-expirada' },
    }
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

  if (session.autenticado) {
    const perfil = session.usuario?.perfil
    const perfisPermitidos = to.matched
      .flatMap((record) => (record.meta.perfis as PerfilUsuario[] | undefined) ?? [])

    if (perfisPermitidos.length > 0 && (!perfil || !perfisPermitidos.includes(perfil))) {
      return rotaInicial()
    }
  }

  return true
})
