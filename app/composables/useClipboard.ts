type ClearDelay = 'off' | '10' | '30' | '60'

let timer: ReturnType<typeof setTimeout> | null = null

export function useClipboard() {
  const clearAfter = useLocalStorage<ClearDelay>('ck-clear-clipboard-after', '30')

  async function copy(text: string) {
    await navigator.clipboard.writeText(text)
    scheduleWipe()
  }

  function scheduleWipe() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    if (clearAfter.value === 'off') return

    const ms = Number(clearAfter.value) * 1000
    timer = setTimeout(() => {
      navigator.clipboard.writeText('')
      timer = null
    }, ms)
  }

  return { copy, clearAfter }
}
