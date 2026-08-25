import { createRouter, createWebHistory } from 'vue-router'

import { useSessionStore } from '@/stores/session'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: () => {
        const session = useSessionStore()
        return session.autenticado ? '/meus-pedidos' : '/login'
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
    return '/meus-pedidos'
  }

  return true
})
