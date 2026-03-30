import { themes, useTheme } from '~/lib/theme'
import { cn } from '~/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Palette, Sun, Moon } from 'lucide-react'

const lightThemes = themes.filter(t => t.group === 'light')
const darkThemes = themes.filter(t => t.group === 'dark')

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-1.5 rounded-md border border-border/40 bg-muted/30 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          title="Switch theme"
        >
          <Palette className="size-3.5" />
          <span className="hidden sm:inline">Theme</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 p-2">
        <div className="flex items-center gap-1.5 px-2 pt-0.5 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <Sun className="size-3" />
          Light
        </div>
        <div className="flex flex-col gap-0.5">
          {lightThemes.map((t) => (
            <ThemeButton key={t.id} def={t} active={theme === t.id} onClick={() => setTheme(t.id)} />
          ))}
        </div>
        <div className="my-1.5 h-px bg-border/50" />
        <div className="flex items-center gap-1.5 px-2 pt-0.5 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <Moon className="size-3" />
          Dark
        </div>
        <div className="flex flex-col gap-0.5">
          {darkThemes.map((t) => (
            <ThemeButton key={t.id} def={t} active={theme === t.id} onClick={() => setTheme(t.id)} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ThemeButton({ def, active, onClick }: { def: typeof themes[0]; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors text-left",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      <span
        className={cn(
          "size-3 rounded-full shrink-0",
          def.group === 'light' ? "ring-1 ring-black/15" : "ring-1 ring-white/15"
        )}
        style={{ backgroundColor: def.swatch }}
      />
      {def.label}
    </button>
  )
}
