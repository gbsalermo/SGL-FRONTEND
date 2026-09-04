import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { router } from './router'
import { instalarCompatibilidadeDashboard } from './router/dashboardCompatibility'
import { vuetify } from './app/vuetify'
import { useSessionStore } from './stores/session'

import './styles/tokens.css'
import './styles/base.css'
import './styles/main.css'
import './styles/relatorios-responsive.css'
import './styles/gestao-shell-controls.css'
import './styles/dashboard-layout-compat.css'
import './styles/dark-mode.css'

const TEMA_STORAGE_KEY = 'sgl.theme'

type TemaAplicacao = 'light' | 'dark'

function carregarTemaPersistido(): TemaAplicacao {
  try {
    return localStorage.getItem(TEMA_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function aplicarTemaGlobal(tema: TemaAplicacao) {
  document.documentElement.dataset.theme = tema
  vuetify.theme.global.name.value = tema === 'dark' ? 'sglDark' : 'sglLight'
}

function aplicarTemaDaRota(path: string) {
  // Login e rotas públicas permanecem sempre no tema visual original.
  if (path === '/login') {
    aplicarTemaGlobal('light')
    return
  }

  aplicarTemaGlobal(carregarTemaPersistido())
}

// O bootstrap sempre começa claro para impedir que uma preferência salva
// contamine a tela de login antes de o Vue Router resolver a rota atual.
document.documentElement.dataset.theme = 'light'

const app = createApp(App)
const pinia = createPinia()

instalarCompatibilidadeDashboard(router)

app.use(pinia)
app.use(router)
app.use(vuetify)

vuetify.theme.global.name.value = 'sglLight'

router.afterEach((to) => {
  aplicarTemaDaRota(to.path)
})

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
