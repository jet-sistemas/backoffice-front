import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useConfirmAccountMutation } from '@/hooks/use-confirm-account-mutation'
import { formatCpfCnpjInput, removeSpecialCharacters } from '@/lib/utils'
import {
  accountValidationSchema,
  type AccountValidationFormData,
} from '@/schemas/account-validation-schema'

interface ValidarContaPageProps {
  token: string
}

export function ValidarContaPage({ token }: ValidarContaPageProps) {
  const [successEmail, setSuccessEmail] = useState<string | null>(null)
  const { mutate, isPending } = useConfirmAccountMutation()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccountValidationFormData>({
    resolver: zodResolver(accountValidationSchema),
    defaultValues: { code: '', document: '' },
  })

  const documentValue = watch('document')

  function onSubmit(data: AccountValidationFormData) {
    mutate(
      {
        token,
        code: data.code.toUpperCase(),
        document: removeSpecialCharacters(data.document),
      },
      {
        onSuccess: (response) => {
          setSuccessEmail(response.data.data?.email ?? null)
        },
      },
    )
  }

  if (successEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h1 className="font-serif text-2xl font-bold">Conta validada</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            A conta <strong>{successEmail}</strong> foi ativada. Faça login com
            a senha temporária enviada por e-mail.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            No primeiro acesso você precisará trocar a senha.
          </p>
          <Button asChild className="mt-6 w-full">
            <Link to="/login">Ir para login</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="font-serif text-2xl font-bold">Validar conta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Informe o código recebido por e-mail e seu CPF ou CNPJ cadastrado.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código de validação</Label>
            <Input
              id="code"
              maxLength={5}
              placeholder="AB12C"
              autoComplete="one-time-code"
              aria-invalid={!!errors.code}
              {...register('code')}
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="document">CPF ou CNPJ</Label>
            <Input
              id="document"
              placeholder="000.000.000-00"
              aria-invalid={!!errors.document}
              value={documentValue}
              onChange={(e) =>
                setValue('document', formatCpfCnpjInput(e.target.value), {
                  shouldValidate: true,
                })
              }
            />
            {errors.document && (
              <p className="text-sm text-destructive">
                {errors.document.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Validando...
              </>
            ) : (
              'Validar conta'
            )}
          </Button>
        </form>
      </div>
    </main>
  )
}
