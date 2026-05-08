import { z } from 'zod'

export const memberCreateSchema = z.object({
  email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
  name: z.string().min(1, 'Nome obrigatório'),
  document: z.string().min(11, 'Documento inválido'),
  code: z.string().length(5, 'Código deve ter 5 caracteres'),
  fullname: z.string().min(1, 'Nome completo obrigatório'),
  whatsapp: z.string().min(8, 'WhatsApp inválido').max(50, 'WhatsApp inválido'),
  type: z.enum(['SUBSCRIBER', 'SPONSORED']),
})

export type MemberCreateFormData = z.infer<typeof memberCreateSchema>
