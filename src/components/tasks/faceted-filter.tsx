import * as React from "react"
import { Check, PlusCircle, Filter } from "lucide-react"

import { cn } from "~/lib/utils"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Separator } from "~/components/ui/separator"

export interface FilterOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  iconClassName?: string
}

interface FacetedFilterProps {
  title: string
  options: FilterOption[]
  selectedValues: string[]
  onFilterChange: (values: string[]) => void
  counts?: Map<string, number>
}

export function FacetedFilter({
  title,
  options,
  selectedValues,
  onFilterChange,
  counts,
}: FacetedFilterProps) {
  const selected = new Set(selectedValues)
  const isActive = selected.size > 0

  const toggleValue = (value: string) => {
    const next = new Set(selected)
    if (next.has(value)) {
      next.delete(value)
    } else {
      next.add(value)
    }
    onFilterChange(Array.from(next))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={isActive ? "secondary" : "outline"}
          size="sm"
          className={cn(
            "h-8",
            isActive
              ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
              : "border-dashed"
          )}
        >
          {isActive ? <Filter className="size-3.5" /> : <PlusCircle />}
          {title}
          {isActive && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selected.size}
              </Badge>
              <div className="hidden gap-1 lg:flex">
                {selected.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selected.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selected.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.has(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleValue(option.value)}
                  >
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-[4px] border",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input [&_svg]:invisible"
                      )}
                    >
                      <Check className="size-3.5 text-primary-foreground" />
                    </div>
                    {option.icon && (
                      <option.icon className={cn("size-4", option.iconClassName ?? "text-muted-foreground")} />
                    )}
                    <span>{option.label}</span>
                    {counts?.get(option.value) != null && (
                      <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs text-muted-foreground">
                        {counts.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selected.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onFilterChange([])}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
