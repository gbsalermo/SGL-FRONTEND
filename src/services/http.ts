import axios, { type AxiosError } from 'axios'

const configuredBaseURL = import.meta.env.VITE_API_BASE_URL?.trim()
const baseURL = configuredBaseURL || (import.meta.env.DEV ? 'http://localhost:8080/api' : undefined)

export const SESSION_STORAGE_KEY = 'sgl.session'
const TENANT_HEADER = 'X-SGL-Unidade-Id'
// A 401 from these is a login answer (e.g. wrong password); from /v1/auth/me it is a dead session.
const ROTAS_DE_LOGIN = ['/v1/auth/login', '/v1/auth/dev-login']

if (!configuredBaseURL && import.meta.env.DEV) {
  console.warn(
    '[SGL] VITE_API_BASE_URL não definida. Usando fallback de desenvolvimento: http://localhost:8080/api',
  )
}

if (!baseURL) {
  throw new Error('[SGL] VITE_API_BASE_URL é obrigatória fora do ambiente de desenvolvimento.')
}

export const http = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

interface SessaoArmazenada {
  token?: string
  unidadeOperacaoId?: string | null
  usuario?: { perfil?: string }
}

// Read straight from localStorage: importing the session store here would be a circular import.
function lerSessao(): SessaoArmazenada | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SessaoArmazenada) : null
  } catch {
    return null
  }
}

export interface RespostasDeSessao {
  aoExpirar: () => void
  aoPendente: () => void
}

let respostasDeSessao: RespostasDeSessao | null = null

/** Lets the app decide navigation on 401/403 without this module depending on the router. */
export function configurarRespostasDeSessao(respostas: RespostasDeSessao) {
  respostasDeSessao = respostas
}

http.interceptors.request.use((config) => {
  const sessao = lerSessao()

  if (sessao?.token) {
    config.headers.set('Authorization', `Bearer ${sessao.token}`)
  }

  // The backend derives the Unidade from the session; only a general administrator may override it.
  if (sessao?.usuario?.perfil === 'ADMINISTRADOR_GERAL' && sessao.unidadeOperacaoId) {
    config.headers.set(TENANT_HEADER, sessao.unidadeOperacaoId)
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ codigo?: string }>) => {
    const status = error.response?.status
    const rotaDeLogin = ROTAS_DE_LOGIN.includes(error.config?.url ?? '')

    if (status === 401 && !rotaDeLogin) {
      localStorage.removeItem(SESSION_STORAGE_KEY)
      respostasDeSessao?.aoExpirar()
    } else if (status === 403 && error.response?.data?.codigo === 'USUARIO_PENDENTE') {
      respostasDeSessao?.aoPendente()
    }

    return Promise.reject(error)
  },
)
