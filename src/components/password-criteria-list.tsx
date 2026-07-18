import { Check, X } from 'lucide-react'

import { PASSWORD_CRITERIA } from '@/lib/password-criteria'
import { cn } from '@/lib/utils'

interface PasswordCriteriaListProps {
  password: string
}

export function PasswordCriteriaList({ password }: PasswordCriteriaListProps) {
  return (
    <ul className="space-y-1.5" aria-live="polite">
      {PASSWORD_CRITERIA.map((criterion) => {
        const passed = criterion.test(password)
        return (
          <li
            key={criterion.id}
            className={cn(
              'flex items-center gap-2 text-xs',
              passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground',
            )}
          >
            {passed ? (
              <Check className="size-3.5 shrink-0" aria-hidden />
            ) : (
              <X className="size-3.5 shrink-0" aria-hidden />
            )}
            <span>{criterion.label}</span>
          </li>
        )
      })}
    </ul>
  )
}
