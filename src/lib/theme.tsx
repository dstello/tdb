import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react'

export interface ThemeDefinition {
  id: string
  label: string
  group: 'light' | 'dark'
  className: string | null // CSS class to apply (null = use base light/dark defaults)
  swatch: string           // preview color
}

export const themes: ThemeDefinition[] = [
  // Light themes
  { id: 'light',       label: 'Light',               group: 'light', className: null,             swatch: 'oklch(0.985 0.004 285)' },
  { id: 'light-hc',    label: 'Light High Contrast',  group: 'light', className: 'theme-light-hc', swatch: 'oklch(0.42 0.20 285)' },
  // Dark themes
  { id: 'dark',        label: 'Dark',                group: 'dark',  className: null,             swatch: 'oklch(0.72 0.14 285)' },
  { id: 'dark-dimmed', label: 'Dark Dimmed',          group: 'dark',  className: 'theme-dimmed',   swatch: 'oklch(0.65 0.10 220)' },
  { id: 'dark-hc',     label: 'Dark High Contrast',   group: 'dark',  className: 'theme-dark-hc',  swatch: 'oklch(0.80 0.18 285)' },
  { id: 'dark-ocean',  label: 'Dark Ocean',           group: 'dark',  className: 'theme-ocean',    swatch: 'oklch(0.70 0.14 230)' },
]

const ALL_THEME_CLASSES = themes.map(t => t.className).filter(Boolean) as string[]
const STORAGE_KEY = 'tdb-theme'

interface ThemeContextValue {
  theme: string
  setTheme: (id: string) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    return localStorage.getItem(STORAGE_KEY) ?? 'dark'
  })

  const setTheme = useCallback((id: string) => {
    setThemeState(id)
    localStorage.setItem(STORAGE_KEY, id)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const def = themes.find(t => t.id === theme)
    if (!def) return

    // Remove all theme classes
    root.classList.remove(...ALL_THEME_CLASSES)

    // Toggle dark/light mode
    if (def.group === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Apply theme-specific class if any
    if (def.className) {
      root.classList.add(def.className)
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

