import { z } from 'zod'

function optionalNumber() {
  return z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z.number().optional(),
  )
}

function optionalPositiveInt() {
  return z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z.number().int().positive().optional(),
  )
}

export const memberCreateSchema = z
  .object({
    email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
    name: z.string().min(1, 'Nome obrigatório'),
    document: z.string().min(11, 'Documento inválido'),
    code: z.string().length(5, 'Código deve ter 5 caracteres'),
    fullname: z.string().min(1, 'Nome completo obrigatório'),
    whatsapp: z.string().min(8, 'WhatsApp inválido').max(50, 'WhatsApp inválido'),
    type: z.enum(['SUBSCRIBER', 'SPONSORED']),
    monthlyFeeAmount: optionalNumber(),
    billingDay: optionalNumber(),
    grantedByUserId: optionalPositiveInt(),
    startAt: z.string().optional(),
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
    if (data.type === 'SPONSORED') {
      if (data.grantedByUserId == null || Number.isNaN(data.grantedByUserId)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'ID do patrocinador concedente obrigatório', path: ['grantedByUserId'] })
      }
      if (data.startAt == null || data.startAt.trim() === '') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Data de início obrigatória', path: ['startAt'] })
      }
    }
  })

export type MemberCreateFormData = z.infer<typeof memberCreateSchema>
