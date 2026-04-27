export function useThemeImage() {
  const colorMode = useColorMode()

  function getThemeImage(darkPath: string, lightPath: string): string {
    return colorMode.value === 'dark' ? darkPath : lightPath
  }

  const isDark = computed(() => colorMode.value === 'dark')

  return {
    getThemeImage,
    isDark
  }
}
