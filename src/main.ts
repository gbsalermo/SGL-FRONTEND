import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { router } from './router'
import { instalarCompatibilidadeDashboard } from './router/dashboardCompatibility'
import { vuetify } from './app/vuetify'
import { aplicarTemaDaRota } from './services/themeService'
import { useSessionStore } from './stores/session'

import './styles/tokens.css'
import './styles/base.css'
import './styles/foundation.css'
import './styles/main.css'
import './styles/relatorios-responsive.css'
import './styles/gestao-shell-controls.css'
import './styles/dashboard-layout-compat.css'
import './styles/etapa-1-4-pedidos-piloto.css'
import './styles/etapa-1-4-pedidos-piloto-ajustes.css'
import './styles/etapa-1-4-dashboard.css'
import './styles/etapa-1-4-dashboard-ajustes.css'
import './styles/etapa-1-4-residuos.css'
import './styles/etapa-1-4-residuos-ajustes.css'
import './styles/etapa-1-4-estoque.css'
import './styles/etapa-1-4-estoque-ajustes.css'
import './styles/etapa-1-4-movimentacoes.css'
import './styles/etapa-1-4-movimentacoes-ajustes.css'
import './styles/etapa-1-4-estagiarios.css'
import './styles/etapa-1-4-relatorios.css'
import './styles/etapa-1-4-cadastros.css'
import './styles/etapa-1-4-cadastros-ajustes.css'
import './styles/etapa-2-solicitante-dashboard.css'
import './styles/etapa-2-solicitante-dashboard-ajustes.css'
import './styles/etapa-2-meus-pedidos.css'
import './styles/etapa-2-solicitante-restante.css'
import './styles/etapa-2-gestao-dashboard.css'
import './styles/etapa-2-gestao-pedidos.css'
import './styles/etapa-2-gestao-estoque.css'
import './styles/etapa-2-gestao-movimentacoes.css'
import './styles/etapa-2-gestao-estagiarios.css'

aplicarTemaDaRota(window.location.pathname)

const session = useSessionStore(pinia)
let timerExpiracao: ReturnType<typeof setTimeout> | null = null

function limparTimerExpiracao() {
  if (timerExpiracao) {
    clearTimeout(timerExpiracao)
    timerExpiracao = null
  }
}

function encerrarSessaoExpirada() {
  limparTimerExpiracao()
  session.sair()
  aplicarTemaDaRota('/login')

  if (router.currentRoute.value.path !== '/login') {
    void router.replace({
      path: '/login',
      query: { motivo: 'sessao-expirada' },
    })
  }
}

function agendarExpiracao() {
  limparTimerExpiracao()

  if (!session.usuario || !session.expiraEm) return

  const tempoRestante = session.expiraEm - Date.now()

  if (tempoRestante <= 0) {
    encerrarSessaoExpirada()
    return
  }

  timerExpiracao = setTimeout(encerrarSessaoExpirada, tempoRestante)
}

watch(() => session.expiraEm, agendarExpiracao, { immediate: true })

app.mount('#app')