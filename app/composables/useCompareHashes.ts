export function useCompareHashes() {
  const hash1 = useState<string>('compare-hash-1', () => '')
  const hash2 = useState<string>('compare-hash-2', () => '')
  const isMatch = useState<boolean | null>('compare-match', () => null)

  function clearSession() {
    hash1.value = ''
    hash2.value = ''
    isMatch.value = null
  }

  return { hash1, hash2, isMatch, clearSession }
}
