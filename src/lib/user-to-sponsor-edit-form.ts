import { formatCpfCnpjInput } from '@/lib/utils'
import type { SponsorEditFormData } from '@/schemas/sponsor-edit-schema'
import type { SponsorPersonaEnum, UserWithSponsorDTO } from '@/types/user'

const PERSONAS: SponsorPersonaEnum[] = [
  'POLITICIAN',
  'INFLUENCER',
  'ATHLETE',
  'OTHER',
]

export function userWithSponsorToEditForm(
  user: UserWithSponsorDTO,
): SponsorEditFormData | null {
  const s = user.sponsor
  if (!s) return null

  let persona: SponsorPersonaEnum | undefined
  if (s.entityType === 'PERSON') {
    const p = s.persona as SponsorPersonaEnum | undefined
    persona = p != null && PERSONAS.includes(p) ? p : 'OTHER'
  }

  return {
    email: user.email,
    name: user.name,
    document: formatCpfCnpjInput(user.document),
    publicName: s.publicName,
    tier: s.tier,
    entityType: s.entityType,
    persona,
    logoUrl: s.logoUrl,
    site: s.site,
    instagram: s.instagram,
    whatsapp: s.whatsapp,
  }
}
