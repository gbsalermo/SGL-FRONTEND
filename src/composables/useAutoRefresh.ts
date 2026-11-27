import { onBeforeUnmount, onMounted, ref } from 'vue'

export interface AutoRefreshOptions {
  intervalMs?: number
  minAgeOnReturnMs?: number
}

/**
 * Keeps a management screen fresh without a manual button: reloads every few minutes while the tab is
 * visible and when the person comes back to it. The API does not push changes, so polling is the only
 * signal; a hidden tab never polls, to keep the heavy list endpoints quiet.
 *
 * The screen keeps its own first load (with its loading state) and calls `markUpdated()` when it succeeds.
 * `load` must be a silent reload that throws on failure, so a failed attempt keeps the last good time.
 */
export function useAutoRefresh(load: () => Promise<void>, options: AutoRefreshOptions = {}) {
  const intervalMs = options.intervalMs ?? 300_000
  const minAgeOnReturnMs = options.minAgeOnReturnMs ?? 30_000

  const lastUpdatedAt = ref<Date | null>(null)
  const refreshing = ref(false)
  let timer: ReturnType<typeof setInterval> | undefined

  function markUpdated() {
    lastUpdatedAt.value = new Date()
  }

  async function refreshNow() {
    if (refreshing.value) return
    refreshing.value = true
    try {
      await load()
      markUpdated()
    } catch {
      // The screen keeps showing the data it already has; the next tick or return to the tab retries.
    } finally {
      refreshing.value = false
    }
  }

  function isVisible() {
    return document.visibilityState !== 'hidden'
  }

  function onTick() {
    if (isVisible()) void refreshNow()
  }

  function onVisibilityChange() {
    if (!isVisible()) return
    const last = lastUpdatedAt.value?.getTime() ?? 0
    if (Date.now() - last >= minAgeOnReturnMs) void refreshNow()
  }

  onMounted(() => {
    timer = setInterval(onTick, intervalMs)
    document.addEventListener('visibilitychange', onVisibilityChange)
  })

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  })

  return { lastUpdatedAt, refreshing, refreshNow, markUpdated }
}
