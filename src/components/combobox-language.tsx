"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Language } from "@/generated/prisma/client"

interface ComboboxLanguageProps {
  languages: Language[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function ComboboxLanguage({ languages, value, onChange, placeholder, disabled, className }: ComboboxLanguageProps) {
  const [open, setOpen] = React.useState(false)

  const selectedLanguage = languages.find((language) => language.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", !selectedLanguage && "text-muted-foreground", className)}
          disabled={disabled}
        >
          {selectedLanguage ? (
            <span className="flex items-center gap-2">
                <span className="text-lg leading-none">{selectedLanguage.flagEmoji}</span>
                {selectedLanguage.name}
            </span>
          ) : (
            placeholder || "Select language..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search language..." />
           <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
                {languages.map((language) => (
                <CommandItem
                    key={language.id}
                    value={language.name}
                    keywords={[language.name, language.code]}
                    onSelect={() => {
                        onChange(language.id)
                        setOpen(false)
                    }}
                >
                    <Check
                    className={cn(
                        "mr-2 h-4 w-4",
                        value === language.id ? "opacity-100" : "opacity-0"
                    )}
                    />
                    <span className="text-lg mr-2 leading-none">{language.flagEmoji}</span>
                    {language.name}
                </CommandItem>
                ))}
            </CommandGroup>
           </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

