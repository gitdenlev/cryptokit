interface PasswordHistoryEntry {
  value: string
  timestamp: number
  generator: string
}

const MAX_ENTRIES = 20

export function usePasswordHistory() {
  const enabled = useLocalStorage<boolean>('ck-password-history-enabled', false)
  const history = useLocalStorage<PasswordHistoryEntry[]>('ck-password-history', [])

  function add(value: string, generator: string) {
    if (!enabled.value) return

    const entry: PasswordHistoryEntry = {
      value,
      timestamp: Date.now(),
      generator
    }

    const updated = [...history.value, entry]
    if (updated.length > MAX_ENTRIES) {
      updated.splice(0, updated.length - MAX_ENTRIES)
    }
    history.value = updated
  }

  function clear() {
    history.value = []
  }

  return { history, enabled, add, clear }
}
