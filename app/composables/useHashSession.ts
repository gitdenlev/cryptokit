export function useHashSession() {
  const inputText = useState<string>('hash-session-input', () => '')
  const hashResult = useState<string>('hash-session-result', () => '')
  const selectedAlgorithm = useState<string>('hash-session-algorithm', () => 'SHA-256')

  function clearSession() {
    inputText.value = ''
    hashResult.value = ''
  }

  return { inputText, hashResult, selectedAlgorithm, clearSession }
}
