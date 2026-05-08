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
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    mutate({
      user: {
        email: values.email.trim(),
        name: values.name.trim(),
        document: values.document.trim(),
        code: values.code.trim().toUpperCase(),
        type: 'MEMBER',
      },
      member: {
        fullname: values.fullname.trim(),
        whatsapp: values.whatsapp.trim(),
        type: values.type,
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
            <div className="space-y-2 sm:col-span-2"><Label>E-mail</Label><Input {...form.register('email')} /></div>
            <div className="space-y-2"><Label>Nome da conta</Label><Input {...form.register('name')} /></div>
            <div className="space-y-2"><Label>Nome completo</Label><Input {...form.register('fullname')} /></div>
            <div className="space-y-2"><Label>Documento</Label><Input {...form.register('document')} /></div>
            <div className="space-y-2"><Label>Código (5)</Label><Input maxLength={5} {...form.register('code')} /></div>
            <div className="space-y-2"><Label>WhatsApp</Label><Input {...form.register('whatsapp')} /></div>
            <div className="space-y-2">
              <Label>Tipo inicial</Label>
              <Select value={form.watch('type')} onValueChange={(v) => form.setValue('type', v as 'SUBSCRIBER' | 'SPONSORED')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUBSCRIBER">Assinante</SelectItem>
                  <SelectItem value="SPONSORED">Patrocinado</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
