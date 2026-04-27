import { onKeyStroke } from '@vueuse/core'

const STORAGE_KEY = 'cryptokit_panic'

export function usePanicShortcut() {
  const isPanic = useState('isPanic', () => false)

  onMounted(() => {
    isPanic.value = sessionStorage.getItem(STORAGE_KEY) === 'true'
  })

  watch(isPanic, (val) => {
    sessionStorage.setItem(STORAGE_KEY, String(val))
  })

  onKeyStroke('x', (e: KeyboardEvent) => {
    if (!e.ctrlKey || !e.shiftKey) return
    e.preventDefault()
    isPanic.value = !isPanic.value
  })

  return { isPanic }
}
