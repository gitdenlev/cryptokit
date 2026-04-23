/**
 * Composable for getting theme-appropriate image paths
 * Handles the colorMode reactivity in a type-safe way
 */
export function useThemeImage() {
  const colorMode = useColorMode()

  /**
   * Returns the appropriate image path based on current theme
   * @param darkPath - Path to image for dark mode
   * @param lightPath - Path to image for light mode
   */
  function getThemeImage(darkPath: string, lightPath: string): string {
    return colorMode.value === 'dark' ? darkPath : lightPath
  }

  /**
   * Check if current theme is dark
   */
  const isDark = computed(() => colorMode.value === 'dark')

  return {
    getThemeImage,
    isDark
  }
}
