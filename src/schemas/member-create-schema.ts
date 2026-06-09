import { z } from 'zod'

function optionalNumber() {
  return z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z.number().optional(),
  )
}

export const memberCreateSchema = z
  .object({
    email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
    name: z.string().min(1, 'Nome obrigatório'),
    document: z
      .string()
      .min(1, 'Documento obrigatório')
      .refine((v) => v.replace(/\D/g, '').length === 11, 'CPF inválido'),
    code: z.string().length(5, 'Código deve ter 5 caracteres'),
    fullname: z.string().min(1, 'Nome completo obrigatório'),
    whatsapp: z
      .string()
      .min(1, 'WhatsApp obrigatório')
      .refine((v) => {
        const d = v.replace(/\D/g, '')
        return d.length >= 10 && d.length <= 11
      }, 'WhatsApp inválido (DDD + número)'),
    type: z.enum(['SUBSCRIBER', 'SPONSORED']),
    monthlyFeeAmount: optionalNumber(),
    billingDay: optionalNumber(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'SUBSCRIBER') {
      if (data.monthlyFeeAmount == null || Number.isNaN(data.monthlyFeeAmount)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Valor da mensalidade obrigatório', path: ['monthlyFeeAmount'] })
      } else if (data.monthlyFeeAmount <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Valor deve ser maior que zero', path: ['monthlyFeeAmount'] })
      }
      if (data.billingDay == null || Number.isNaN(data.billingDay)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Dia de cobrança obrigatório (1–28)', path: ['billingDay'] })
      } else if (data.billingDay < 1 || data.billingDay > 28) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Dia de cobrança deve ser entre 1 e 28', path: ['billingDay'] })
      }
    }
  })

export type MemberCreateFormData = z.infer<typeof memberCreateSchema>
