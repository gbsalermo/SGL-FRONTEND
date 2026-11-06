import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { AxiosError } from 'axios'

export interface FakeReply {
  status: number
  data?: unknown
}

/**
 * Axios adapter that answers from a handler instead of the network and records every request,
 * so the real interceptors run while the backend is replaced.
 */
export function fakeAdapter(handler: (config: InternalAxiosRequestConfig) => FakeReply) {
  const requests: InternalAxiosRequestConfig[] = []

  const adapter: AxiosAdapter = async (config) => {
    requests.push(config)
    const reply = handler(config)
    const response: AxiosResponse = {
      data: reply.data,
      status: reply.status,
      statusText: String(reply.status),
      headers: {},
      config,
    }
    if (reply.status >= 400) {
      throw new AxiosError(`Request failed with status code ${reply.status}`,
        AxiosError.ERR_BAD_RESPONSE, config, undefined, response)
    }
    return response
  }

  return { adapter, requests }
}
