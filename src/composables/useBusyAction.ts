import { ref } from 'vue'

/**
 * Блокирует повторный запуск async-действия (двойной клик по Submit/Delete и т.п.).
 */
export function useBusyAction() {
  const busy = ref(false)

  async function run<T>(fn: () => Promise<T>): Promise<T | undefined> {
    if (busy.value) return undefined
    busy.value = true
    try {
      return await fn()
    } finally {
      busy.value = false
    }
  }

  return { busy, run }
}

/** Per-id busy (списки: Complete/Delete у разных строк). */
export function useBusyIds() {
  const busyIds = ref<Set<string | number>>(new Set())

  function isBusy(id: string | number) {
    return busyIds.value.has(id)
  }

  async function runFor<T>(
    id: string | number,
    fn: () => Promise<T>
  ): Promise<T | undefined> {
    if (busyIds.value.has(id)) return undefined
    busyIds.value = new Set(busyIds.value).add(id)
    try {
      return await fn()
    } finally {
      const next = new Set(busyIds.value)
      next.delete(id)
      busyIds.value = next
    }
  }

  return { busyIds, isBusy, runFor }
}
