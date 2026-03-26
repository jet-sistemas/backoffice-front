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

export const sponsorEditFormSchema = z
  .object({
    email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
    name: z.string().min(1, 'Informe o nome do usuário'),
    document: z.string().min(1, 'Informe o documento'),
    publicName: z.string().min(1, 'Informe o nome público do patrocinador'),
    tier: z.enum(['OURO', 'PRATA', 'BRONZE']),
    entityType: z.enum(entityTypeValues),
    persona: z.enum(sponsorPersonaValues).optional(),
    logoUrl: optionalTrimmed,
    site: optionalTrimmed,
    instagram: optionalTrimmed,
    whatsapp: optionalTrimmed,
  })
  .refine(
    (data) => data.entityType !== 'PERSON' || data.persona != null,
    { message: 'Selecione a persona', path: ['persona'] },
  )

export type SponsorEditFormData = z.infer<typeof sponsorEditFormSchema>
