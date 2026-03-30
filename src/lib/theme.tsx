import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react'

export interface ThemeDefinition {
  id: string
  label: string
  swatch: string // CSS color for the preview dot
}

export const themes: ThemeDefinition[] = [
  { id: 'midnight', label: 'Midnight',  swatch: 'oklch(0.72 0.14 285)' },
  { id: 'dimmed',   label: 'Dimmed',    swatch: 'oklch(0.68 0.12 285)' },
  { id: 'slate',    label: 'Slate',     swatch: 'oklch(0.70 0.008 260)' },
  { id: 'ocean',    label: 'Ocean',     swatch: 'oklch(0.70 0.14 230)' },
  { id: 'rose',     label: 'Rose',      swatch: 'oklch(0.70 0.14 350)' },
  { id: 'forest',   label: 'Forest',    swatch: 'oklch(0.68 0.14 155)' },
  { id: 'amber',    label: 'Amber',     swatch: 'oklch(0.76 0.14 65)' },
]

const STORAGE_KEY = 'tdb-theme'

function getThemeClass(id: string): string | null {
  return id === 'midnight' ? null : `theme-${id}`
}

interface ThemeContextValue {
  theme: string
  setTheme: (id: string) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'midnight',
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'midnight'
    return localStorage.getItem(STORAGE_KEY) ?? 'midnight'
  })

  const setTheme = useCallback((id: string) => {
    setThemeState(id)
    localStorage.setItem(STORAGE_KEY, id)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    // Remove all theme- classes
    for (const t of themes) {
      const cls = getThemeClass(t.id)
      if (cls) root.classList.remove(cls)
    }
    // Apply new theme class
    const cls = getThemeClass(theme)
    if (cls) root.classList.add(cls)
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
