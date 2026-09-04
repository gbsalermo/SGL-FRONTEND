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
import './styles/dark-mode-runtime.css'

const TEMA_STORAGE_KEY = 'sgl.theme'

type TemaAplicacao = 'light' | 'dark'

function carregarTemaPersistido(): TemaAplicacao {
  try {
    return localStorage.getItem(TEMA_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function persistirTema(tema: TemaAplicacao) {
  try {
    localStorage.setItem(TEMA_STORAGE_KEY, tema)
  } catch {
    // A aplicação continua funcional quando o navegador bloqueia localStorage.
  }
}

function aplicarTemaDaInterface(tema: TemaAplicacao) {
  document.body.classList.toggle('sgl-dark-active', tema === 'dark')
  document.body.classList.toggle('sgl-light-active', tema === 'light')
}

function forcarTemaGlobalClaro() {
  // O dark mode do SGL é apenas uma aparência da interface autenticada.
  // Login, 404 e Vuetify global permanecem sempre claros.
  document.documentElement.dataset.theme = 'light'
  vuetify.theme.global.name.value = 'sglLight'
}

function aplicarTemaDaRota(path: string) {
  forcarTemaGlobalClaro()

  if (path === '/login' || path.startsWith('/404')) {
    aplicarTemaDaInterface('light')
    return
  }

  aplicarTemaDaInterface(carregarTemaPersistido())
}

forcarTemaGlobalClaro()
aplicarTemaDaInterface('light')

const app = createApp(App)
const pinia = createPinia()

instalarCompatibilidadeDashboard(router)

app.use(pinia)
app.use(router)
app.use(vuetify)

router.afterEach((to) => {
  aplicarTemaDaRota(to.path)
})

/*
 * O GestaoLayout já possui os dois botões de Aparência e mantém seu estado local.
 * Ele ainda altera data-theme por compatibilidade histórica. Após o clique,
 * convertemos essa escolha para a única regra atual: body.sgl-dark-active.
 * Em seguida restauramos o tema global claro, impedindo vazamento para o login.
 */
document.addEventListener('click', (event) => {
  const target = event.target
  if (!(target instanceof Element)) return

  const botao = target.closest('.gestao-theme-switch button')
  if (!(botao instanceof HTMLButtonElement)) return

  queueMicrotask(() => {
    const temaEscolhido: TemaAplicacao = document.documentElement.dataset.theme === 'dark'
      ? 'dark'
      : 'light'

    persistirTema(temaEscolhido)
    aplicarTemaDaInterface(temaEscolhido)
    forcarTemaGlobalClaro()
  })
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
  aplicarTemaDaInterface('light')
  forcarTemaGlobalClaro()

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
