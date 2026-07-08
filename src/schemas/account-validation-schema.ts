import { z } from 'zod'

export const accountValidationSchema = z.object({
  code: z
    .string()
    .min(5, 'Código deve ter 5 caracteres')
    .max(5, 'Código deve ter 5 caracteres'),
  document: z.string().min(1, 'Documento é obrigatório'),
})

export type AccountValidationFormData = z.infer<typeof accountValidationSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Precisa de letra maiúscula')
      .regex(/[a-z]/, 'Precisa de letra minúscula')
      .regex(/\d/, 'Precisa de número')
      .regex(/[!@#$%&*\-_+=?]/, 'Precisa de caractere especial'),
    confirmPassword: z.string().min(1, 'Confirmação é obrigatória'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Confirmação deve ser igual à nova senha',
    path: ['confirmPassword'],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
