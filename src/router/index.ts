import { createRouter, createWebHistory } from 'vue-router'

import { useSessionStore } from '@/stores/session'

function rotaInicial() {
  const session = useSessionStore()
  const perfil = session.usuario?.perfil

  return perfil === 'GESTOR' || perfil === 'ADMINISTRADOR'
    ? '/pedidos'
    : '/meus-pedidos'
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
      },
      children: [
        {
          path: 'pedidos',
          name: 'gestao-pedidos',
          component: () => import('@/modules/pedidos/views/gestao/PedidosGestaoView.vue'),
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

  return true
})
