import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateMemberMutation } from '@/hooks/use-create-member-mutation'
import { memberCreateSchema, type MemberCreateFormData } from '@/schemas/member-create-schema'

export function MemberCreatePage() {
  const { mutate, isPending } = useCreateMemberMutation()
  const form = useForm<MemberCreateFormData>({
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
      grantedByUserId: undefined,
      startAt: '',
    },
  })

  const memberType = form.watch('type')

  const onSubmit = form.handleSubmit((values) => {
    const baseMember = {
      fullname: values.fullname.trim(),
      whatsapp: values.whatsapp.trim(),
      type: values.type,
    }

    mutate({
      user: {
        email: values.email.trim(),
        name: values.name.trim(),
        document: values.document.trim(),
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
                grantedByUserId: values.grantedByUserId!,
                startAt: values.startAt!.trim(),
              },
            },
    })
  })

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">Novo associado</h1>
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
              <Input id="member-email" {...form.register('email')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-name">Nome da conta</Label>
              <Input id="member-name" {...form.register('name')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-fullname">Nome completo</Label>
              <Input id="member-fullname" {...form.register('fullname')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-document">Documento</Label>
              <Input id="member-document" {...form.register('document')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-code">Código (5)</Label>
              <Input id="member-code" maxLength={5} {...form.register('code')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-whatsapp">WhatsApp</Label>
              <Input id="member-whatsapp" {...form.register('whatsapp')} />
            </div>
            <div className="space-y-2">
              <Label>Tipo inicial</Label>
              <Select
                value={form.watch('type')}
                onValueChange={(v) => form.setValue('type', v as 'SUBSCRIBER' | 'SPONSORED')}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUBSCRIBER">Assinante</SelectItem>
                  <SelectItem value="SPONSORED">Patrocinado</SelectItem>
                </SelectContent>
              </Select>
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
                    {...form.register('monthlyFeeAmount')}
                  />
                  {form.formState.errors.monthlyFeeAmount && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.monthlyFeeAmount.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-billing-day">Dia de cobrança</Label>
                  <Input id="member-billing-day" type="number" min={1} max={28} {...form.register('billingDay')} />
                  {form.formState.errors.billingDay && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.billingDay.message}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2 sm:col-span-2 border-t pt-4">
                  <p className="text-sm font-medium text-foreground">Patrocínio</p>
                  <p className="text-xs text-muted-foreground">
                    Informe o usuário patrocinador concedente (tipo SPONSOR ou SPONSOR_MEMBER) e a data de início.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-granted-by">ID do usuário concedente</Label>
                  <Input id="member-granted-by" type="number" min={1} {...form.register('grantedByUserId')} />
                  {form.formState.errors.grantedByUserId && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.grantedByUserId.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-sponsored-start">Início do patrocínio</Label>
                  <Input id="member-sponsored-start" type="date" {...form.register('startAt')} />
                  {form.formState.errors.startAt && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.startAt.message}
                    </p>
                  )}
                </div>
              </>
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
