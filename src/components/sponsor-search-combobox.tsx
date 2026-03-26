import { useMemo, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { UserWithSponsorDTO } from '@/types/user'

export interface SponsorSearchComboboxProps {
  value: number | null
  onChange: (sponsorId: number | null) => void
  sponsors: (UserWithSponsorDTO & {
    sponsor: NonNullable<UserWithSponsorDTO['sponsor']>
  })[]
  isLoading?: boolean
  disabled?: boolean
  id?: string
  'aria-invalid'?: boolean
}

export function SponsorSearchCombobox({
  value,
  onChange,
  sponsors,
  isLoading = false,
  disabled = false,
  id,
  'aria-invalid': ariaInvalid,
}: SponsorSearchComboboxProps) {
  const [open, setOpen] = useState(false)

  const selected = useMemo(
    () => sponsors.find((u) => u.sponsor.id === value),
    [sponsors, value],
  )

  const triggerLabel =
    selected != null
      ? selected.sponsor.publicName
      : 'Benefício geral (sem patrocinador)'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={ariaInvalid}
          aria-controls={id != null ? `${id}-listbox` : undefined}
          disabled={disabled || isLoading}
          className="h-auto min-h-10 w-full justify-between px-3 py-2 text-left font-normal"
        >
          <span className="line-clamp-2">{triggerLabel}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Buscar patrocinador..." />
          <CommandList id={id != null ? `${id}-listbox` : undefined}>
            <CommandEmpty>
              {isLoading
                ? 'Carregando...'
                : 'Nenhum patrocinador encontrado.'}
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__none__"
                keywords={['nenhum', 'geral', 'sem']}
                onSelect={() => {
                  onChange(null)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'size-4',
                    value === null ? 'opacity-100' : 'opacity-0',
                  )}
                />
                Benefício geral (sem patrocinador)
              </CommandItem>
              {sponsors.map((u) => {
                const s = u.sponsor
                const label = s.publicName
                const sub = u.name !== s.publicName ? u.name : undefined
                return (
                  <CommandItem
                    key={s.id}
                    value={`${s.id}-${label}`}
                    keywords={[label, u.name, u.email].filter(Boolean)}
                    onSelect={() => {
                      onChange(s.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'size-4',
                        value === s.id ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate">{label}</span>
                      {sub != null ? (
                        <span className="truncate text-xs text-muted-foreground">
                          {sub}
                        </span>
                      ) : null}
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
