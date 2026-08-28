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
      meta: {
        public: true,
      },
    },
    {
      path: '/',
      component: () => import('@/layouts/SolicitanteLayout.vue'),
      meta: {
        requiresSession: true,
        perfis: PERFIS_SOLICITANTE,
      },
      children: [
        {
          path: 'meus-pedidos',
          name: 'meus-pedidos',
          component: () => import('@/modules/pedidos/views/solicitante/MeusPedidosView.vue'),
        },
        {
          path: 'pedidos/novo',
          name: 'novo-pedido',
          component: () => import('@/modules/pedidos/views/solicitante/NovoPedidoView.vue'),
        },
      ],
    },
    {
      path: '/',
      component: () => import('@/layouts/GestaoLayout.vue'),
      meta: {
        requiresSession: true,
        perfis: PERFIS_GESTAO,
      },
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
      redirect: '/',
    },
  ],
})

router.beforeEach((to) => {
  const session = useSessionStore()

  if (to.meta.requiresSession && !session.autenticado) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.path === '/login' && session.autenticado) {
    return rotaInicial()
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
