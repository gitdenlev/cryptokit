export function useFileIntegrity() {
  const selectedFile = useState<File | null>('file-integrity-file', () => null)
  const fileHash = useState<string>('file-integrity-hash', () => '')
  const selectedAlgorithm = useState<string>('file-integrity-algorithm', () => 'SHA-256')
  const isProcessing = useState<boolean>('file-integrity-processing', () => false)
  const errorMessage = useState<string>('file-integrity-error', () => '')

  function clearSession() {
    selectedFile.value = null
    fileHash.value = ''
    errorMessage.value = ''
  }

  return { selectedFile, fileHash, selectedAlgorithm, isProcessing, errorMessage, clearSession }
}
