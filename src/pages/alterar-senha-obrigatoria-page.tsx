import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { flushSync } from 'react-dom'

import { PasswordCriteriaList } from '@/components/password-criteria-list'
import { PasswordInput } from '@/components/password-input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { useChangePasswordMutation } from '@/hooks/use-change-password-mutation'
import { resolvePostLoginPath } from '@/lib/post-login-path'
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from '@/schemas/account-validation-schema'

export function AlterarSenhaObrigatoriaPage() {
  const { updateUser } = useAuth()
  const navigate = useNavigate()
  const { mutate, isPending } = useChangePasswordMutation()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const newPassword = watch('newPassword')

  function onSubmit(data: ChangePasswordFormData) {
    mutate(data, {
      onSuccess: (response) => {
        const nextUser = response.data.data
        if (!nextUser) {
          return
        }

        flushSync(() => {
          updateUser(nextUser)
        })

        navigate({
          to: resolvePostLoginPath(nextUser.type),
          replace: true,
        })
      },
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="font-serif text-2xl font-bold">Trocar senha</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Por segurança, defina uma nova senha antes de continuar.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <PasswordInput
              id="currentPassword"
              autoComplete="current-password"
              aria-invalid={!!errors.currentPassword}
              {...register('currentPassword')}
            />
            {errors.currentPassword && (
              <p className="text-sm text-destructive">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <PasswordInput
              id="newPassword"
              autoComplete="new-password"
              aria-invalid={!!errors.newPassword}
              {...register('newPassword')}
            />
            <PasswordCriteriaList password={newPassword ?? ''} />
            {errors.newPassword && (
              <p className="text-sm text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar nova senha'
            )}
          </Button>
        </form>
      </div>
    </main>
  )
}
