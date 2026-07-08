import type { AccountValidationStatusEnum } from '@/types/account-validation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useResendAccountValidationMutation } from '@/hooks/use-resend-account-validation-mutation'
import { Loader2, Mail } from 'lucide-react'

const STATUS_LABELS: Record<AccountValidationStatusEnum, string> = {
  NOT_APPLICABLE: 'Não aplicável',
  PENDING: 'Convite pendente',
  INVITE_EXPIRED: 'Convite expirado',
  VALIDATED: 'Conta validada',
}

interface AccountValidationStatusCardProps {
  userId: number
  status?: AccountValidationStatusEnum
  canResendInvite?: boolean
}

export function AccountValidationStatusCard({
  userId,
  status,
  canResendInvite,
}: AccountValidationStatusCardProps) {
  const { mutate, isPending } = useResendAccountValidationMutation()

  if (status == null || status === 'NOT_APPLICABLE') {
    return null
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Validação de conta</p>
          <Badge variant="secondary" className="mt-2">
            {STATUS_LABELS[status]}
          </Badge>
        </div>
        {canResendInvite && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => mutate(userId)}
          >
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            Reenviar convite
          </Button>
        )}
      </div>
    </div>
  )
}
