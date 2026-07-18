import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { z } from 'zod'

import { DatePicker } from '@/components/date-picker'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMarkSubscriberPaidMutation } from '@/hooks/use-mark-subscriber-paid-mutation'
import { usePatchSubscriberMemberMutation } from '@/hooks/use-patch-subscriber-member-mutation'
import { useSubscriberPaymentEventsQuery } from '@/hooks/use-subscriber-payment-events-query'
import { isPaidCycleAlreadyRegistered } from '@/lib/subscriber-payment-mark'
import { BILLING_STATUS_BADGE } from '@/lib/billing-status-badge'
import { formatDatePtBR, formatDateTimePtBR } from '@/lib/utils'
import type { SubscriberPaymentEventTypeEnum } from '@/types/billing'
import type { MemberStatusEnum, SubscriberMemberDTO } from '@/types/member'

export { BILLING_STATUS_BADGE }

const EVENT_TYPE_LABEL: Record<SubscriberPaymentEventTypeEnum, string> = {
  STATUS_AUTO_UPDATED: 'Status automático',
  PAYMENT_MARKED_PAID: 'Pagamento registrado',
  BILLING_CONFIG_UPDATED: 'Configuração alterada',
}

const subscriberPatchSchema = z.object({
  monthlyFeeAmount: z.coerce.number().positive('Valor deve ser maior que zero'),
  billingDay: z.coerce.number().min(1).max(28, 'Use um dia entre 1 e 28'),
  nextDueDate: z.string().min(1, 'Data obrigatória'),
  status: z.enum(['ACTIVE', 'DUE_SOON', 'OVERDUE', 'INACTIVE']),
})

type SubscriberPatchForm = z.infer<typeof subscriberPatchSchema>

function formatBrl(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function SubscriberBillingCard({
  subscriber,
  userId,
}: {
  subscriber: SubscriberMemberDTO
  userId: number
}) {
  const [paidOpen, setPaidOpen] = useState(false)
  const { mutate: patchSubscriber, isPending: isPatching } =
    usePatchSubscriberMemberMutation()
  const { mutate: markPaid, isPending: isMarkingPaid } = useMarkSubscriberPaidMutation()

  const billingDefaults: SubscriberPatchForm = {
    monthlyFeeAmount: subscriber.monthlyFeeAmount,
    billingDay: subscriber.billingDay,
    nextDueDate: subscriber.nextDueDate?.slice(0, 10) ?? '',
    status: subscriber.status,
  }

  const form = useForm<SubscriberPatchForm>({
    resolver: zodResolver(subscriberPatchSchema),
    values: billingDefaults,
  })

  const onPatchSubscriber = form.handleSubmit((values) => {
    patchSubscriber({
      userId,
      body: {
        monthlyFeeAmount: values.monthlyFeeAmount,
        billingDay: values.billingDay,
        nextDueDate: values.nextDueDate,
        status: values.status,
      },
    })
  })

  function resetBillingFromSubscriber() {
    form.reset(billingDefaults)
  }

  const statusInfo = BILLING_STATUS_BADGE[subscriber.status]
  const nextDueValue = form.watch('nextDueDate')

  const paidCycleUi =
    subscriber.canMarkPayment === false &&
    subscriber.status === 'ACTIVE' &&
    isPaidCycleAlreadyRegistered(subscriber)

  const paymentBlocked =
    subscriber.status === 'INACTIVE' ||
    subscriber.canMarkPayment === false ||
    isMarkingPaid ||
    isPatching

  const markPaidTooltipReason =
    subscriber.canMarkPayment === false &&
    subscriber.paymentMarkBlockedReason &&
    !paidCycleUi
      ? subscriber.paymentMarkBlockedReason
      : undefined

  const markPaidPrimaryButton = paidCycleUi ? (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-2 sm:w-auto"
      disabled
    >
      <CheckCircle2 className="size-4 shrink-0" aria-hidden />
      Pago neste mês
    </Button>
  ) : (
    <Button
      type="button"
      variant="success"
      className="w-full sm:w-auto"
      onClick={() => setPaidOpen(true)}
      disabled={paymentBlocked}
    >
      Marcar como pago
    </Button>
  )

  function confirmMarkPaid() {
    markPaid(
      { userId },
      {
        onSuccess: () => setPaidOpen(false),
      },
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Mensalidade (assinante)</CardTitle>
          <CardDescription>
            Configurações de cobrança e status da mensalidade do associado. O status
            Ativa, A vencer e Em atraso é recalculado periodicamente pelo sistema conforme
            o vencimento; Inativa permanece sob controle manual.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Valor atual
              </p>
              <p className="font-medium">{formatBrl(subscriber.monthlyFeeAmount)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Dia de cobrança
              </p>
              <p className="font-medium">{subscriber.billingDay}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Status da mensalidade
              </p>
              <Badge variant="default" className={statusInfo.className}>
                {statusInfo.label}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Próximo vencimento
              </p>
              <p className="font-medium">
                {formatDatePtBR(subscriber.nextDueDate) || '—'}
              </p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Último pagamento registrado
              </p>
              <p className="font-medium">
                {subscriber.lastPaidAt
                  ? formatDateTimePtBR(subscriber.lastPaidAt)
                  : '—'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium text-foreground">Pagamento manual</p>
            <div className="flex w-full justify-end sm:w-auto">
              {markPaidTooltipReason ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex w-full justify-end sm:w-auto">
                        {markPaidPrimaryButton}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{markPaidTooltipReason}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                markPaidPrimaryButton
              )}
            </div>
          </div>

          <form className="space-y-4 border-t pt-4" onSubmit={onPatchSubscriber}>
            <p className="font-medium text-foreground">Ajustar mensalidade</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sub-monthly">Valor (R$)</Label>
                <Input
                  id="sub-monthly"
                  type="number"
                  step="0.01"
                  min="0.01"
                  aria-invalid={Boolean(form.formState.errors.monthlyFeeAmount)}
                  {...form.register('monthlyFeeAmount')}
                />
                {form.formState.errors.monthlyFeeAmount && (
                  <p className="text-sm text-destructive" role="alert">
                    {form.formState.errors.monthlyFeeAmount.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-billing-day">Dia de cobrança</Label>
                <Input
                  id="sub-billing-day"
                  type="number"
                  min={1}
                  max={28}
                  aria-invalid={Boolean(form.formState.errors.billingDay)}
                  {...form.register('billingDay')}
                />
                {form.formState.errors.billingDay && (
                  <p className="text-sm text-destructive" role="alert">
                    {form.formState.errors.billingDay.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-next-due">Próximo vencimento</Label>
                <DatePicker
                  id="sub-next-due"
                  value={nextDueValue}
                  onChange={(v) =>
                    form.setValue('nextDueDate', v ?? '', {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  aria-invalid={Boolean(form.formState.errors.nextDueDate)}
                />
                {form.formState.errors.nextDueDate && (
                  <p className="text-sm text-destructive" role="alert">
                    {form.formState.errors.nextDueDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub-status">Status</Label>
                <Select
                  value={form.watch('status')}
                  onValueChange={(v) =>
                    form.setValue('status', v as SubscriberPatchForm['status'], {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger id="sub-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(BILLING_STATUS_BADGE) as MemberStatusEnum[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {BILLING_STATUS_BADGE[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={resetBillingFromSubscriber}
                disabled={isPatching}
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto" disabled={isPatching}>
                {isPatching ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Salvando…
                  </>
                ) : (
                  'Salvar alterações'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={paidOpen} onOpenChange={setPaidOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registrar pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Confirma que a mensalidade foi paga? O sistema avança o próximo vencimento,
              define o status como Ativa e registra o pagamento no histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {subscriber.status === 'OVERDUE' ? (
            <p className="px-6 text-sm text-muted-foreground">
              Se o atraso for de competência anterior ao mês atual, o primeiro registro só confirma o recebimento;
              o segundo atualiza o próximo vencimento.
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMarkingPaid}>Cancelar</AlertDialogCancel>
            <Button type="button" disabled={isMarkingPaid} onClick={confirmMarkPaid}>
              {isMarkingPaid ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Registrando…
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function SubscriberBillingHistory({ userId }: { userId: number }) {
  const [page, setPage] = useState(1)
  const pageSize = 10
  const { data, isLoading, isFetching, isError, error } = useSubscriberPaymentEventsQuery(
    userId,
    page,
    pageSize,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">Histórico da mensalidade</CardTitle>
        <CardDescription>
          Eventos de auditoria: alterações automáticas, ajustes manuais e pagamentos
          registrados.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isError && (
          <p className="text-sm text-destructive" role="alert">
            {error?.message ?? 'Não foi possível carregar o histórico.'}
          </p>
        )}
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}
        {!isLoading && !isError && data != null && data.events.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum evento registrado ainda.</p>
        )}
        {!isLoading && !isError && data != null && data.events.length > 0 && (
          <>
            <div
              className={isFetching ? 'pointer-events-none opacity-60' : undefined}
              aria-busy={isFetching ? true : undefined}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quando</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Alteração</TableHead>
                    <TableHead>Quem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.events.map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                        {formatDateTimePtBR(ev.createdAt ?? '') || '—'}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {EVENT_TYPE_LABEL[ev.eventType]}
                      </TableCell>
                      <TableCell className="max-w-[200px] text-xs sm:max-w-none sm:text-sm">
                        <span className="text-muted-foreground">
                          {BILLING_STATUS_BADGE[ev.oldStatus].label} · venc.{' '}
                          {formatDatePtBR(ev.oldNextDueDate)}
                        </span>
                        <span className="mx-1 text-muted-foreground">→</span>
                        <span>
                          {BILLING_STATUS_BADGE[ev.newStatus].label} · venc.{' '}
                          {formatDatePtBR(ev.newNextDueDate)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {ev.adminUser?.name ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between gap-2 text-sm">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>
                <span className="text-muted-foreground">
                  Página {data.currentPage} de {data.totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages || isFetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
