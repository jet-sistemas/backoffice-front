import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMemberQuery } from '@/hooks/use-member-query'
import { usePatchSubscriberMemberMutation } from '@/hooks/use-patch-subscriber-member-mutation'
import type { SubscriberMemberDTO } from '@/types/member'

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

function SubscriberBillingCard({
  subscriber,
  userId,
}: {
  subscriber: SubscriberMemberDTO
  userId: number
}) {
  const { mutate: patchSubscriber, isPending: isPatching } =
    usePatchSubscriberMemberMutation()

  const form = useForm<SubscriberPatchForm>({
    resolver: zodResolver(subscriberPatchSchema),
    values: {
      monthlyFeeAmount: subscriber.monthlyFeeAmount,
      billingDay: subscriber.billingDay,
      nextDueDate: subscriber.nextDueDate?.slice(0, 10) ?? '',
      status: subscriber.status,
    },
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Mensalidade (assinante)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          <p>
            <strong>Valor atual:</strong> {formatBrl(subscriber.monthlyFeeAmount)}
          </p>
          <p>
            <strong>Dia de cobrança:</strong> {subscriber.billingDay}
          </p>
          <p>
            <strong>Status da mensalidade:</strong> {subscriber.status}
          </p>
          <p>
            <strong>Próximo vencimento:</strong> {subscriber.nextDueDate}
          </p>
        </div>

        <form className="space-y-4 border-t pt-4" onSubmit={onPatchSubscriber}>
          <p className="font-medium text-foreground">Ajustar mensalidade</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                {...form.register('monthlyFeeAmount')}
              />
              {form.formState.errors.monthlyFeeAmount && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.monthlyFeeAmount.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Dia de cobrança</Label>
              <Input type="number" min={1} max={28} {...form.register('billingDay')} />
              {form.formState.errors.billingDay && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.billingDay.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Próximo vencimento</Label>
              <Input type="date" {...form.register('nextDueDate')} />
              {form.formState.errors.nextDueDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.nextDueDate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(v) =>
                  form.setValue('status', v as SubscriberPatchForm['status'], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="DUE_SOON">DUE_SOON</SelectItem>
                  <SelectItem value="OVERDUE">OVERDUE</SelectItem>
                  <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isPatching}>
              {isPatching ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

interface MemberDetailPageProps {
  userId: string
}

export function MemberDetailPage({ userId }: MemberDetailPageProps) {
  const parsedId = Number.parseInt(userId, 10)
  const validId = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : null
  const { data, isLoading, isError, error } = useMemberQuery(validId)

  if (validId == null) {
    return <p>Identificador de usuário inválido.</p>
  }

  if (isLoading) return <p>Carregando associado...</p>
  if (isError) return <p>{error?.message ?? 'Erro ao carregar associado.'}</p>
  if (data == null) return <p>Associado não encontrado.</p>

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          Detalhe do associado
        </h1>
        <Button variant="outline" asChild>
          <Link to="/admin/associados">Voltar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{data.fullname}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <p>
            <strong>E-mail:</strong> {data.email}
          </p>
          <p>
            <strong>Documento:</strong> {data.document}
          </p>
          <p>
            <strong>Código:</strong> {data.code}
          </p>
          <p>
            <strong>WhatsApp:</strong> {data.whatsapp}
          </p>
          <p>
            <strong>Tipo:</strong>{' '}
            {data.type === 'SUBSCRIBER' ? 'Assinante' : 'Patrocinado'}
          </p>
          <p>
            <strong>Situação do membro:</strong> {data.active ? 'Ativo' : 'Inativo'}
          </p>
        </CardContent>
      </Card>

      {data.subscriber && (
        <SubscriberBillingCard subscriber={data.subscriber} userId={validId} />
      )}

      {data.sponsored && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Patrocínio</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p>
              <strong>Concedido por (user id):</strong> {data.sponsored.grantedByUserId}
            </p>
            <p>
              <strong>Início:</strong> {data.sponsored.startAt}
            </p>
            {data.sponsored.endAt && (
              <p>
                <strong>Término:</strong> {data.sponsored.endAt}
              </p>
            )}
            <p>
              <strong>Patrocínio ativo:</strong> {data.sponsored.active ? 'Sim' : 'Não'}
            </p>
            {data.sponsored.reason && (
              <p>
                <strong>Motivo:</strong> {data.sponsored.reason}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
