import axios from 'axios'

const configuredBaseURL = import.meta.env.VITE_API_BASE_URL?.trim()
const baseURL = configuredBaseURL || (import.meta.env.DEV ? 'http://localhost:8080/api' : undefined)

const SESSION_STORAGE_KEY = 'sgl.dev-session'
const TENANT_HEADER = 'X-SGL-Unidade-Id'

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

function obterUnidadeDaSessao(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null

    const sessao = JSON.parse(raw) as {
      usuario?: { unidadeId?: string | null }
    }

    return sessao.usuario?.unidadeId ?? null
  } catch {
    return null
  }
}

http.interceptors.request.use((config) => {
  const unidadeId = obterUnidadeDaSessao()

  if (unidadeId) {
    config.headers.set(TENANT_HEADER, unidadeId)
  }

  return config
})
