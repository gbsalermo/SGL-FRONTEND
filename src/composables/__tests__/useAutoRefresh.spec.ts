import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAutoRefresh } from '@/composables/useAutoRefresh'

let visibility: DocumentVisibilityState = 'visible'

function mountWith(load: () => Promise<void>) {
  let api!: ReturnType<typeof useAutoRefresh>
  const Host = defineComponent({
    setup() {
      api = useAutoRefresh(load)
      return () => h('div')
    },
  })
  const wrapper = mount(Host)
  return { wrapper, api: () => api }
}

function showTab() {
  visibility = 'visible'
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('useAutoRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    visibility = 'visible'
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('recarregaACadaCincoMinutosComAbaVisivel', async () => {
    const load = vi.fn().mockResolvedValue(undefined)
    mountWith(load)
    await vi.advanceTimersByTimeAsync(300_000)
    expect(load).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(300_000)
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('naoRecarregaComAbaEscondida', async () => {
    const load = vi.fn().mockResolvedValue(undefined)
    mountWith(load)
    visibility = 'hidden'
    await vi.advanceTimersByTimeAsync(600_000)
    expect(load).not.toHaveBeenCalled()
  })

  it('aoVoltarParaAbaRecarregaSoSePassouTrintaSegundos', async () => {
    const load = vi.fn().mockResolvedValue(undefined)
    const { api } = mountWith(load)
    api().markUpdated()
    await vi.advanceTimersByTimeAsync(10_000)
    showTab()
    await vi.advanceTimersByTimeAsync(0)
    expect(load).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(25_000)
    showTab()
    await vi.advanceTimersByTimeAsync(0)
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('naoSobrepoeCargas', async () => {
    let resolve!: () => void
    const load = vi.fn(() => new Promise<void>((r) => { resolve = r }))
    const { api } = mountWith(load)
    const first = api().refreshNow()
    void api().refreshNow()
    expect(load).toHaveBeenCalledTimes(1)
    expect(api().refreshing.value).toBe(true)
    resolve()
    await first
    expect(api().refreshing.value).toBe(false)
    expect(api().lastUpdatedAt.value).not.toBeNull()
  })

  it('falhaMantemHorarioAnterior', async () => {
    const load = vi.fn().mockRejectedValue(new Error('offline'))
    const { api } = mountWith(load)
    api().markUpdated()
    const before = api().lastUpdatedAt.value
    await vi.advanceTimersByTimeAsync(60_000)
    await expect(api().refreshNow()).resolves.toBeUndefined()
    expect(api().lastUpdatedAt.value).toBe(before)
    expect(api().refreshing.value).toBe(false)
  })

  it('limpaAoDesmontar', async () => {
    const load = vi.fn().mockResolvedValue(undefined)
    const { wrapper } = mountWith(load)
    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(600_000)
    showTab()
    await vi.advanceTimersByTimeAsync(0)
    expect(load).not.toHaveBeenCalled()
  })
})
