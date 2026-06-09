import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { useCreateMemberMutation } from '@/hooks/use-create-member-mutation'
import { formatCPF, formatPhone } from '@/lib/utils'
import { memberCreateSchema, type MemberCreateFormData } from '@/schemas/member-create-schema'

function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function MemberCreatePage() {
  const { mutate, isPending } = useCreateMemberMutation()
  const { user } = useAuth()
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<MemberCreateFormData>({
    resolver: zodResolver(memberCreateSchema),
    defaultValues: {
      email: '',
      name: '',
      document: '',
      code: '',
      fullname: '',
      whatsapp: '',
      type: 'SUBSCRIBER',
      monthlyFeeAmount: undefined,
      billingDay: undefined,
    },
  })

  const memberType = watch('type')

  const onSubmit = handleSubmit((values) => {
    const baseMember = {
      fullname: values.fullname.trim(),
      whatsapp: onlyDigits(values.whatsapp),
      type: values.type,
    }

    mutate({
      user: {
        email: values.email.trim(),
        name: values.name.trim(),
        document: onlyDigits(values.document),
        code: values.code.trim().toUpperCase(),
        type: 'MEMBER',
      },
      member:
        values.type === 'SUBSCRIBER'
          ? {
              ...baseMember,
              subscriber: {
                monthlyFeeAmount: values.monthlyFeeAmount!,
                billingDay: values.billingDay!,
              },
            }
          : {
              ...baseMember,
              sponsored: {
                grantedByUserId: user!.id,
                startAt: todayISO(),
              },
            },
    })
  })

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
          <h1 className="font-serif text-2xl font-bold tracking-tight">Novo associado</h1>
          <p className="text-sm text-muted-foreground">
            Cadastro vinculado a um usuário do tipo associado (MEMBER). Informe os dados
            da conta e selecione o tipo inicial (assinante ou patrocinado).
          </p>
        </div>
      </div>
      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Dados do associado</CardTitle>
            <CardDescription>Criação de usuário MEMBER e cadastro de membro.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="member-email">E-mail</Label>
              <Input
                id="member-email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-name">Nome da conta</Label>
              <Input
                id="member-name"
                autoComplete="username"
                aria-invalid={Boolean(errors.name)}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-fullname">Nome completo</Label>
              <Input
                id="member-fullname"
                autoComplete="name"
                aria-invalid={Boolean(errors.fullname)}
                {...register('fullname')}
              />
              {errors.fullname && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.fullname.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-document">Documento</Label>
              <Controller
                name="document"
                control={control}
                render={({ field }) => (
                  <Input
                    id="member-document"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={14}
                    placeholder="000.000.000-00"
                    aria-invalid={Boolean(errors.document)}
                    value={field.value}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    onChange={(e) => field.onChange(formatCPF(e.target.value))}
                  />
                )}
              />
              {errors.document && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.document.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-code">Código (5)</Label>
              <Input
                id="member-code"
                maxLength={5}
                autoComplete="off"
                className="font-mono uppercase"
                aria-invalid={Boolean(errors.code)}
                {...register('code')}
              />
              {errors.code && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.code.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-whatsapp">WhatsApp</Label>
              <Controller
                name="whatsapp"
                control={control}
                render={({ field }) => (
                  <Input
                    id="member-whatsapp"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={15}
                    placeholder="(00) 00000-0000"
                    aria-invalid={Boolean(errors.whatsapp)}
                    value={field.value}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    onChange={(e) => field.onChange(formatPhone(e.target.value))}
                  />
                )}
              />
              {errors.whatsapp && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.whatsapp.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-type-select">Tipo inicial</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => field.onChange(v as 'SUBSCRIBER' | 'SPONSORED')}
                  >
                    <SelectTrigger id="member-type-select" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUBSCRIBER">Assinante</SelectItem>
                      <SelectItem value="SPONSORED">Patrocinado</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {memberType === 'SUBSCRIBER' ? (
              <>
                <div className="space-y-2 sm:col-span-2 border-t pt-4">
                  <p className="text-sm font-medium text-foreground">Mensalidade</p>
                  <p className="text-xs text-muted-foreground">
                    Valor mensal e dia de cobrança (1 a 28). A próxima data de vencimento é calculada pelo backend se não informada.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-monthly-fee">Valor da mensalidade (R$)</Label>
                  <Input
                    id="member-monthly-fee"
                    type="number"
                    step="0.01"
                    min="0.01"
                    aria-invalid={Boolean(errors.monthlyFeeAmount)}
                    {...register('monthlyFeeAmount')}
                  />
                  {errors.monthlyFeeAmount && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.monthlyFeeAmount.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-billing-day">Dia de cobrança</Label>
                  <Input
                    id="member-billing-day"
                    type="number"
                    min={1}
                    max={28}
                    aria-invalid={Boolean(errors.billingDay)}
                    {...register('billingDay')}
                  />
                  {errors.billingDay && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.billingDay.message}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-2 sm:col-span-2 border-t pt-4">
                <p className="text-sm font-medium text-foreground">Patrocínio</p>
                <p className="text-xs text-muted-foreground">
                  Este associado será vinculado automaticamente ao seu usuário como
                  concedente, com início na data de hoje.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" asChild><Link to="/admin/associados">Cancelar</Link></Button>
            <Button type="submit" disabled={isPending}>{isPending ? 'Salvando...' : 'Criar associado'}</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
