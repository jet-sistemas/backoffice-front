import { CheckCircle2, Clock3, KeyRound, Loader2, Mail, TriangleAlert } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useResendAccountValidationMutation } from '@/hooks/use-resend-account-validation-mutation'
import { cn } from '@/lib/utils'
import type { AccountValidationStatusEnum } from '@/types/account-validation'

const STATUS_META: Record<
  Exclude<AccountValidationStatusEnum, 'NOT_APPLICABLE'>,
  {
    label: string
    description: string
    containerClassName: string
    badgeClassName: string
    icon: typeof CheckCircle2
  }
> = {
  PENDING: {
    label: 'Convite pendente',
    description: 'Usuário ainda não validou a conta pelo e-mail de convite.',
    containerClassName: 'border-amber-300/80 bg-amber-50 text-amber-950',
    badgeClassName: 'border-transparent bg-amber-200 text-amber-950 hover:bg-amber-200',
    icon: Clock3,
  },
  INVITE_EXPIRED: {
    label: 'Convite expirado',
    description: 'O convite expirou. Reenvie para gerar novo código e senha temporária.',
    containerClassName: 'border-amber-400/80 bg-amber-100 text-amber-950',
    badgeClassName: 'border-transparent bg-amber-300 text-amber-950 hover:bg-amber-300',
    icon: TriangleAlert,
  },
  PASSWORD_CHANGE_PENDING: {
    label: 'Troca de senha pendente',
    description:
      'Conta validada, mas o usuário ainda não concluiu a troca de senha. Reenvie uma nova senha temporária se necessário.',
    containerClassName: 'border-orange-300/80 bg-orange-50 text-orange-950',
    badgeClassName: 'border-transparent bg-orange-200 text-orange-950 hover:bg-orange-200',
    icon: KeyRound,
  },
  VALIDATED: {
    label: 'Conta validada',
    description: 'Usuário concluiu a validação da conta.',
    containerClassName: 'border-sky-200 bg-sky-50 text-sky-950',
    badgeClassName: 'border-transparent bg-sky-200/80 text-sky-950 hover:bg-sky-200/80',
    icon: CheckCircle2,
  },
}

interface AccountValidationStatusCardProps {
  userId: number
  status?: AccountValidationStatusEnum
  canResendInvite?: boolean
  canResendTemporaryPassword?: boolean
}

export function AccountValidationStatusCard({
  userId,
  status,
  canResendInvite,
  canResendTemporaryPassword,
}: AccountValidationStatusCardProps) {
  const { mutate, isPending } = useResendAccountValidationMutation()

  if (status == null || status === 'NOT_APPLICABLE') {
    return null
  }

  const meta = STATUS_META[status]
  const Icon = meta.icon
  const showResendInvite = canResendInvite === true
  const showResendTemporaryPassword = canResendTemporaryPassword === true

  return (
    <div className={cn('rounded-lg border p-4', meta.containerClassName)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 rounded-md bg-white/60 p-1.5">
            <Icon className="size-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">Validação de conta</p>
            <Badge className={cn('mt-2', meta.badgeClassName)}>{meta.label}</Badge>
            <p className="mt-2 text-xs opacity-80">{meta.description}</p>
          </div>
        </div>
        {(showResendInvite || showResendTemporaryPassword) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-amber-400/70 bg-white/70 text-amber-950 hover:bg-white"
            disabled={isPending}
            onClick={() => mutate(userId)}
          >
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : showResendTemporaryPassword ? (
              <KeyRound className="h-4 w-4" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            {showResendTemporaryPassword ? 'Reenviar senha temporária' : 'Reenviar convite'}
          </Button>
        )}
      </div>
    </div>
  )
}
