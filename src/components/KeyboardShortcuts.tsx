import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Separator } from '~/components/ui/separator'

const shortcuts = [
  { section: 'Navigation', items: [
    { keys: ['j', '↓'], description: 'Move focus down' },
    { keys: ['k', '↑'], description: 'Move focus up' },
    { keys: ['e', 'Enter'], description: 'Open focused issue' },
    { keys: ['⌘ Enter'], description: 'Open issue full page' },
    { keys: ['/'], description: 'Focus search' },
    { keys: ['Esc'], description: 'Close panel / dialog' },
  ]},
  { section: 'Actions', items: [
    { keys: ['n'], description: 'New issue' },
    { keys: ['d'], description: 'Delete focused issue' },
    { keys: ['⌘ Enter'], description: 'Submit form (in dialogs)' },
    { keys: ['?'], description: 'Toggle this help' },
  ]},
]

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {shortcuts.map((section, i) => (
            <div key={section.section}>
              {i > 0 && <Separator className="mb-3" />}
              <h4 className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest mb-2">
                {section.section}
              </h4>
              <div className="flex flex-col gap-1.5">
                {section.items.map((item) => (
                  <div key={item.description} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground text-xs">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, ki) => (
                        <span key={ki}>
                          {ki > 0 && <span className="text-muted-foreground/40 text-[10px] mx-0.5">/</span>}
                          <kbd className="inline-flex items-center justify-center min-w-5 h-5 rounded border border-border/60 bg-muted/50 px-1.5 font-mono text-[10px] text-muted-foreground">
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Inline keyboard shortcut hint */
export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd className={`inline-flex items-center justify-center min-w-4 h-4 rounded border border-border/40 bg-muted/30 px-1 font-mono text-[9px] text-muted-foreground/50 ml-1 ${className ?? ''}`}>
      {children}
    </kbd>
  )
}
