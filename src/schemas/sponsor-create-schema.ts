import { z } from 'zod'

import type { EntityTypeEnum, SponsorPersonaEnum } from '@/types/user'

const sponsorPersonaValues: [SponsorPersonaEnum, ...SponsorPersonaEnum[]] = [
  'POLITICIAN',
  'INFLUENCER',
  'ATHLETE',
  'OTHER',
]

const entityTypeValues: [EntityTypeEnum, ...EntityTypeEnum[]] = [
  'PERSON',
  'COMPANY',
  'GOVERNMENT',
  'NGO',
]

const optionalTrimmed = z
  .string()
  .optional()
  .transform((v) => {
    const t = v?.trim()
    return t === '' || t == null ? undefined : t
  })

export const sponsorCreateFormSchema = z
  .object({
    email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
    name: z.string().min(1, 'Informe o nome do usuário'),
    document: z.string().min(1, 'Informe o documento'),
    code: z
      .string()
      .transform((v) => v.trim().toUpperCase())
      .pipe(z.string().length(5, 'O código deve ter exatamente 5 caracteres')),
    publicName: z.string().min(1, 'Informe o nome público do patrocinador'),
    tier: z.enum(['OURO', 'PRATA', 'BRONZE']),
    entityType: z.enum(entityTypeValues),
    persona: z.enum(sponsorPersonaValues).optional(),
    site: optionalTrimmed,
    instagram: optionalTrimmed,
    whatsapp: optionalTrimmed,
  })
  .refine(
    (data) => data.entityType !== 'PERSON' || data.persona != null,
    { message: 'Selecione a persona', path: ['persona'] },
  )

export type SponsorCreateFormData = z.infer<typeof sponsorCreateFormSchema>
