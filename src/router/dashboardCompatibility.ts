import type { Router } from 'vue-router'

/**
 * Mantém compatibilidade entre os links contextuais criados pelo dashboard
 * e os filtros mais recentes do shell de gestão.
 */
export function instalarCompatibilidadeDashboard(router: Router) {
  router.beforeEach((to) => {
    if (to.path !== '/estoque' || typeof to.query.situacao !== 'string') return true

    const situacao = to.query.situacao.toUpperCase()
    const query = { ...to.query }
    delete query.situacao

    if (situacao === 'BAIXO') {
      query.alerta = 'estoque-baixo'
    } else if (situacao === 'VENCIDO') {
      query.validade = 'VENCIDO'
    } else if (situacao === 'PROXIMO') {
      query.validade = 'PROXIMO_VENCIMENTO'
    } else {
      return true
    }

    return { path: '/estoque', query, replace: true }
  })
}
