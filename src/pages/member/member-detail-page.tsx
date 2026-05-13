import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { z } from 'zod'

import { DatePicker } from '@/components/date-picker'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { usePatchSubscriberMemberMutation } from '@/hooks/use-patch-subscriber-member-mutation'
import { useUpdateMemberAccountMutation } from '@/hooks/use-update-member-account-mutation'
import { useUpdateMemberProfileMutation } from '@/hooks/use-update-member-profile-mutation'
import { useUserWithMemberQuery } from '@/hooks/use-user-with-member-query'
import { cn, formatCPF, formatDatePtBR, formatPhone } from '@/lib/utils'
import {
  memberAccountEditSchema,
  memberProfileEditSchema,
  type MemberAccountEditFormData,
  type MemberProfileEditFormData,
} from '@/schemas/member-edit-schema'
import type {
  MemberStatusEnum,
  MemberTypeEnum,
  SubscriberMemberDTO,
} from '@/types/member'

const STATUS_VARIANT: Record<
  MemberStatusEnum,
  { className: string; label: string }
> = {
  ACTIVE: { className: 'bg-emerald-600 text-white hover:bg-emerald-600/90', label: 'Ativa' },
  DUE_SOON: { className: 'bg-amber-500 text-amber-950 hover:bg-amber-500/90', label: 'A vencer' },
  OVERDUE: { className: 'bg-red-600 text-white hover:bg-red-600/90', label: 'Em atraso' },
  INACTIVE: {
    className: 'bg-neutral-200 text-neutral-600 hover:bg-neutral-200/90',
    label: 'Inativa',
  },
}

const MEMBER_TYPE_LABELS: Record<MemberTypeEnum, string> = {
  SUBSCRIBER: 'Assinante',
  SPONSORED: 'Patrocinado',
}

const ACCOUNT_DEFAULTS: MemberAccountEditFormData = {
  email: '',
  name: '',
  document: '',
}

const PROFILE_DEFAULTS: MemberProfileEditFormData = {
  fullname: '',
  whatsapp: '',
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

function SubscriberBillingCard({
  subscriber,
  userId,
}: {
  subscriber: SubscriberMemberDTO
  userId: number
}) {
  const { mutate: patchSubscriber, isPending: isPatching } =
    usePatchSubscriberMemberMutation()

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

  const statusInfo = STATUS_VARIANT[subscriber.status]
  const nextDueValue = form.watch('nextDueDate')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">Mensalidade (assinante)</CardTitle>
        <CardDescription>
          Configurações de cobrança e status da mensalidade do associado.
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
                  {(Object.keys(STATUS_VARIANT) as MemberStatusEnum[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_VARIANT[s].label}
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
  )
}

interface MemberDetailPageProps {
  userId: string
}

export function MemberDetailPage({ userId }: MemberDetailPageProps) {
  const parsedId = Number.parseInt(userId, 10)
  const validId = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : null

  const { data, isLoading, isError, error, refetch } = useUserWithMemberQuery(validId)
  const { mutate: mutateAccount, isPending: isAccountPending } =
    useUpdateMemberAccountMutation()
  const { mutate: mutateProfile, isPending: isProfilePending } =
    useUpdateMemberProfileMutation()
  const [formHydrated, setFormHydrated] = useState(false)

  const accountForm = useForm<MemberAccountEditFormData>({
    resolver: zodResolver(memberAccountEditSchema),
    defaultValues: ACCOUNT_DEFAULTS,
  })

  const profileForm = useForm<MemberProfileEditFormData>({
    resolver: zodResolver(memberProfileEditSchema),
    defaultValues: PROFILE_DEFAULTS,
  })

  useEffect(() => {
    if (data == null || data.member == null) {
      setFormHydrated(false)
      return
    }
    accountForm.reset({
      email: data.email,
      name: data.name,
      document: formatCPF(data.document),
    })
    profileForm.reset({
      fullname: data.member.fullname,
      whatsapp: formatPhone(data.member.whatsapp),
    })
    setFormHydrated(true)
  }, [data, accountForm.reset, profileForm.reset])

  const formReady = validId != null && data != null && data.member != null
  const formDisabled = !formReady || !formHydrated
  const showLoadingBanner = validId != null && isLoading

  function resetAccountFromServer() {
    if (data?.member == null) return
    accountForm.reset({
      email: data.email,
      name: data.name,
      document: formatCPF(data.document),
    })
  }

  function resetProfileFromServer() {
    if (data?.member == null) return
    profileForm.reset({
      fullname: data.member.fullname,
      whatsapp: formatPhone(data.member.whatsapp),
    })
  }

  function onSubmitAccount(values: MemberAccountEditFormData) {
    if (validId == null) return
    mutateAccount({ userId: validId, values })
  }

  function onSubmitProfile(values: MemberProfileEditFormData) {
    if (validId == null) return
    mutateProfile({ userId: validId, values })
  }

  if (validId == null) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="ghost" size="sm" className="-ml-3 w-fit gap-1" asChild>
          <Link to="/admin/associados">
            <ArrowLeft className="size-4" aria-hidden />
            Voltar à lista
          </Link>
        </Button>
        <div
          className="flex flex-col items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 py-10"
          role="alert"
        >
          <AlertCircle className="size-10 text-destructive" aria-hidden />
          <p className="text-center font-medium">Identificador inválido</p>
          <p className="text-center text-sm text-muted-foreground">
            O link de edição não contém um ID de usuário válido.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="-ml-3 w-fit gap-1" asChild>
            <Link to="/admin/associados">
              <ArrowLeft className="size-4" aria-hidden />
              Voltar à lista
            </Link>
          </Button>
          <h1 className="font-serif text-2xl font-bold tracking-tight">
            Editar associado
          </h1>
          <p className="text-sm text-muted-foreground">
            Atualize os dados da conta e do associado. O código único e o tipo de
            associado não podem ser alterados nesta tela.
          </p>
        </div>
      </div>

      {showLoadingBanner && (
        <div
          className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm shadow-sm"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="size-5 shrink-0 animate-spin text-primary" aria-hidden />
          <span>Carregando dados do associado…</span>
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 py-10">
          <AlertCircle className="size-10 text-destructive" />
          <div className="text-center">
            <p className="font-medium">Não foi possível carregar o associado</p>
            <p className="text-sm text-muted-foreground">
              {error?.message ?? 'Tente novamente mais tarde.'}
            </p>
          </div>
          <Button variant="outline" type="button" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!isError && data != null && data.member != null && (
        <div className="space-y-6" aria-busy={showLoadingBanner}>
          <Card className={showLoadingBanner ? 'opacity-80' : undefined}>
            <form onSubmit={accountForm.handleSubmit(onSubmitAccount)}>
              <CardHeader>
                <CardTitle className="font-serif">Conta de acesso</CardTitle>
                <CardDescription>
                  Dados do usuário utilizados para login e identificação na plataforma.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="edit-email">E-mail</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    autoComplete="email"
                    disabled={formDisabled}
                    aria-invalid={Boolean(accountForm.formState.errors.email)}
                    {...accountForm.register('email')}
                  />
                  {accountForm.formState.errors.email && (
                    <p className="text-sm text-destructive" role="alert">
                      {accountForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome completo</Label>
                  <Input
                    id="edit-name"
                    autoComplete="name"
                    disabled={formDisabled}
                    aria-invalid={Boolean(accountForm.formState.errors.name)}
                    {...accountForm.register('name')}
                  />
                  {accountForm.formState.errors.name && (
                    <p className="text-sm text-destructive" role="alert">
                      {accountForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-document">Documento (CPF)</Label>
                  <Controller
                    name="document"
                    control={accountForm.control}
                    render={({ field }) => (
                      <Input
                        id="edit-document"
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={14}
                        placeholder="000.000.000-00"
                        disabled={formDisabled}
                        aria-invalid={Boolean(accountForm.formState.errors.document)}
                        value={field.value}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        onChange={(e) => field.onChange(formatCPF(e.target.value))}
                      />
                    )}
                  />
                  {accountForm.formState.errors.document && (
                    <p className="text-sm text-destructive" role="alert">
                      {accountForm.formState.errors.document.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="edit-code">Código único (somente leitura)</Label>
                  <Input
                    id="edit-code"
                    readOnly
                    disabled
                    className="font-mono uppercase bg-muted/50"
                    value={data.code}
                    aria-describedby="edit-code-hint"
                  />
                  <p id="edit-code-hint" className="text-xs text-muted-foreground">
                    O código de 5 caracteres não pode ser alterado nesta tela.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-end">
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={resetAccountFromServer}
                    disabled={formDisabled || isAccountPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    disabled={formDisabled || isAccountPending}
                  >
                    {isAccountPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                        Salvando…
                      </>
                    ) : (
                      'Salvar alterações'
                    )}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>

          <Card className={showLoadingBanner ? 'opacity-80' : undefined}>
            <form onSubmit={profileForm.handleSubmit(onSubmitProfile)}>
              <CardHeader>
                <CardTitle className="font-serif">Associado</CardTitle>
                <CardDescription>
                  Informações pessoais do associado e dados de contato.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="edit-fullname">Nome completo</Label>
                  <Input
                    id="edit-fullname"
                    autoComplete="off"
                    disabled={formDisabled}
                    aria-invalid={Boolean(profileForm.formState.errors.fullname)}
                    {...profileForm.register('fullname')}
                  />
                  {profileForm.formState.errors.fullname && (
                    <p className="text-sm text-destructive" role="alert">
                      {profileForm.formState.errors.fullname.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-whatsapp">WhatsApp</Label>
                  <Controller
                    name="whatsapp"
                    control={profileForm.control}
                    render={({ field }) => (
                      <Input
                        id="edit-whatsapp"
                        inputMode="tel"
                        autoComplete="off"
                        maxLength={15}
                        placeholder="(00) 00000-0000"
                        disabled={formDisabled}
                        aria-invalid={Boolean(profileForm.formState.errors.whatsapp)}
                        value={field.value}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        onChange={(e) => field.onChange(formatPhone(e.target.value))}
                      />
                    )}
                  />
                  {profileForm.formState.errors.whatsapp && (
                    <p className="text-sm text-destructive" role="alert">
                      {profileForm.formState.errors.whatsapp.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Input
                    readOnly
                    disabled
                    className="bg-muted/50"
                    value={MEMBER_TYPE_LABELS[data.member.type]}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Situação do membro</Label>
                  <div>
                    {data.member.active ? (
                      <Badge
                        variant="default"
                        className="bg-emerald-600 text-white hover:bg-emerald-600/90"
                      >
                        Ativo
                      </Badge>
                    ) : (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border border-neutral-300',
                          'bg-neutral-50 px-2 py-0.5 text-[11px] font-bold text-neutral-500',
                        )}
                      >
                        Inativo
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-end">
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={resetProfileFromServer}
                    disabled={formDisabled || isProfilePending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    disabled={formDisabled || isProfilePending}
                  >
                    {isProfilePending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                        Salvando…
                      </>
                    ) : (
                      'Salvar alterações'
                    )}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>

          {data.member.subscriber != null && (
            <SubscriberBillingCard
              subscriber={data.member.subscriber}
              userId={validId}
            />
          )}

          {data.member.sponsored != null && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Patrocínio</CardTitle>
                <CardDescription>
                  Dados do patrocínio concedido ao associado.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Concedido por
                  </p>
                  <p className="font-medium">
                    {data.member.sponsored.grantedByUser?.name ??
                      `Utilizador #${data.member.sponsored.grantedByUserId}`}
                  </p>
                  <p className="break-all text-muted-foreground">
                    {data.member.sponsored.grantedByUser?.email ?? '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Início
                  </p>
                  <p className="font-medium">
                    {formatDatePtBR(data.member.sponsored.startAt) || '—'}
                  </p>
                </div>
                {data.member.sponsored.endAt && (
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Término
                    </p>
                    <p className="font-medium">
                      {formatDatePtBR(data.member.sponsored.endAt) || '—'}
                    </p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Patrocínio ativo
                  </p>
                  <p className="font-medium">
                    {data.member.sponsored.active ? 'Sim' : 'Não'}
                  </p>
                </div>
                {data.member.sponsored.reason && (
                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Motivo
                    </p>
                    <p className="font-medium">{data.member.sponsored.reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
