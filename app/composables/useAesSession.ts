export function useAesSession() {
  const secretKey = useState<string>('aes-session-key', () => '')
  const ciphertext = useState<string>('aes-session-ciphertext', () => '')

  function clearSession() {
    secretKey.value = ''
    ciphertext.value = ''
  }

  return { secretKey, ciphertext, clearSession }
}
