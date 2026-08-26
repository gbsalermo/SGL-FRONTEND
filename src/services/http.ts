import axios from 'axios'

const configuredBaseURL = import.meta.env.VITE_API_BASE_URL?.trim()
const baseURL = configuredBaseURL || (import.meta.env.DEV ? 'http://localhost:8080/api' : undefined)

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
