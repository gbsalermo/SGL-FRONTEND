import axios from 'axios'

/** The API's own message when there is one, otherwise a plain fallback for the screen. */
export function mensagemDeErro(error: unknown, padrao: string): string {
  if (axios.isAxiosError(error)) return error.response?.data?.message ?? padrao
  return error instanceof Error ? error.message : padrao
}

export function codigoDeErro(error: unknown): string | null {
  return axios.isAxiosError(error) ? (error.response?.data?.codigo ?? null) : null
}
