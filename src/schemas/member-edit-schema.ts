import { z } from 'zod'

export const memberEditFormSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
  name: z.string().min(1, 'Informe o nome do usuário'),
  document: z
    .string()
    .min(1, 'Informe o documento')
    .refine((v) => v.replace(/\D/g, '').length === 11, 'CPF inválido'),
  fullname: z.string().min(1, 'Informe o nome completo do associado'),
  whatsapp: z
    .string()
    .min(1, 'Informe o WhatsApp')
    .refine((v) => {
      const d = v.replace(/\D/g, '')
      return d.length >= 10 && d.length <= 11
    }, 'WhatsApp inválido (DDD + número)'),
})

export type MemberEditFormData = z.infer<typeof memberEditFormSchema>

export const memberAccountEditSchema = memberEditFormSchema.pick({
  email: true,
  name: true,
  document: true,
})

export type MemberAccountEditFormData = z.infer<typeof memberAccountEditSchema>

export const memberProfileEditSchema = memberEditFormSchema.pick({
  fullname: true,
  whatsapp: true,
})

export type MemberProfileEditFormData = z.infer<typeof memberProfileEditSchema>
