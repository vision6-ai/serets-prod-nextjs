'use client'

import * as React from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTranslations } from 'next-intl'

interface Theater {
  id: string
  name: string
  location: string
}

interface TheaterFilterSelectProps {
  theaters: Theater[]
  selectedTheaterId: string | null
  onTheaterChange: (theaterId: string | null) => void
  className?: string
  placeholder?: string
}

export function TheaterFilterSelect({
  theaters,
  selectedTheaterId,
  onTheaterChange,
  className,
  placeholder
}: TheaterFilterSelectProps) {
  const [open, setOpen] = React.useState(false)
  const t = useTranslations('navigation')
  
  // Find the selected theater for displaying in the trigger
  const selectedTheater = React.useMemo(() => {
    return theaters.find(theater => theater.id === selectedTheaterId)
  }, [theaters, selectedTheaterId])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full bg-background hover:bg-accent text-sm sm:text-base px-3 sm:px-4 h-10 sm:h-11 flex items-center justify-center gap-1",
            className
          )}
        >
          <span className="truncate">
            {selectedTheater ? selectedTheater.name : placeholder || t('theater')}
          </span>
          <ChevronDown className="h-4 w-4 flex-shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] sm:w-[380px] p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <CommandInput 
              placeholder={t('searchTheaters')} 
              className="flex-1 h-9 focus:outline-none" 
            />
            {selectedTheaterId && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 ml-2"
                onClick={() => {
                  onTheaterChange(null)
                  setOpen(false)
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear</span>
              </Button>
            )}
          </div>
          <CommandEmpty>No theater found.</CommandEmpty>
          <CommandGroup>
            <ScrollArea className="h-[300px]">
              {theaters.map((theater) => (
                <CommandItem
                  key={theater.id}
                  value={`${theater.name} ${theater.location}`}
                  onSelect={() => {
                    onTheaterChange(theater.id === selectedTheaterId ? null : theater.id)
                    setOpen(false)
                  }}
                >
                  <div className="flex-1 flex flex-col">
                    <span>{theater.name}</span>
                    <span className="text-xs text-muted-foreground">{theater.location}</span>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4 ml-2",
                      selectedTheaterId === theater.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 