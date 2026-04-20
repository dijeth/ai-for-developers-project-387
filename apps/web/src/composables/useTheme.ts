import { ref, onMounted } from 'vue'
import { getInitialThemeState, syncTheme } from '../theme.ts'

export function useTheme() {
  const isDark = ref(getInitialThemeState())

  const toggleTheme = () => {
    isDark.value = !isDark.value
    syncTheme(isDark.value)
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  onMounted(() => {
    syncTheme(isDark.value)
  })

  return {
    isDark,
    toggleTheme
  }
}
