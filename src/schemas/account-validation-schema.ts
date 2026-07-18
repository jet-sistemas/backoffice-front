import { z } from 'zod'

import { PASSWORD_CRITERIA } from '@/lib/password-criteria'

export const accountValidationSchema = z.object({
  code: z
    .string()
    .min(5, 'Código deve ter 5 caracteres')
    .max(5, 'Código deve ter 5 caracteres'),
  document: z.string().min(1, 'Documento é obrigatório'),
})

export type AccountValidationFormData = z.infer<typeof accountValidationSchema>

const newPasswordSchema = PASSWORD_CRITERIA.reduce(
  (schema, criterion) =>
    schema.refine((value) => criterion.test(value), {
      message: criterion.label,
    }),
  z.string().min(1, 'Nova senha é obrigatória'),
)

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: newPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirmação é obrigatória'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Confirmação deve ser igual à nova senha',
    path: ['confirmPassword'],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
