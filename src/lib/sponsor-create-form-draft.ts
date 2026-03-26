import type { SponsorCreateFormData } from '@/schemas/sponsor-create-schema'

export const SPONSOR_CREATE_FORM_DRAFT_STORAGE_KEY =
  'backoffice:sponsor-create-draft'

export function getSponsorCreateFormEmptyValues(): SponsorCreateFormData {
  return {
    email: '',
    name: '',
    document: '',
    code: '',
    publicName: '',
    tier: 'BRONZE',
    entityType: 'COMPANY',
    persona: undefined,
    logoUrl: '',
    site: '',
    instagram: '',
    whatsapp: '',
  }
}

export function loadSponsorCreateFormDraft(): SponsorCreateFormData {
  if (typeof sessionStorage === 'undefined') {
    return getSponsorCreateFormEmptyValues()
  }
  try {
    const raw = sessionStorage.getItem(SPONSOR_CREATE_FORM_DRAFT_STORAGE_KEY)
    if (!raw) return getSponsorCreateFormEmptyValues()
    const parsed = JSON.parse(raw) as Partial<SponsorCreateFormData>
    const base = getSponsorCreateFormEmptyValues()
    return {
      ...base,
      ...parsed,
      persona: parsed.persona ?? undefined,
      logoUrl: parsed.logoUrl ?? '',
      site: parsed.site ?? '',
      instagram: parsed.instagram ?? '',
      whatsapp: parsed.whatsapp ?? '',
    }
  } catch {
    return getSponsorCreateFormEmptyValues()
  }
}

function isBlankSponsorDraft(values: SponsorCreateFormData) {
  const empty = getSponsorCreateFormEmptyValues()
  return (
    values.email === empty.email &&
    values.name === empty.name &&
    values.document === empty.document &&
    values.code === empty.code &&
    values.publicName === empty.publicName &&
    values.tier === empty.tier &&
    values.entityType === empty.entityType &&
    values.persona === empty.persona &&
    (values.logoUrl ?? '') === empty.logoUrl &&
    (values.site ?? '') === empty.site &&
    (values.instagram ?? '') === empty.instagram &&
    (values.whatsapp ?? '') === empty.whatsapp
  )
}

export function saveSponsorCreateFormDraft(values: SponsorCreateFormData) {
  try {
    if (isBlankSponsorDraft(values)) {
      sessionStorage.removeItem(SPONSOR_CREATE_FORM_DRAFT_STORAGE_KEY)
      return
    }
    sessionStorage.setItem(
      SPONSOR_CREATE_FORM_DRAFT_STORAGE_KEY,
      JSON.stringify(values),
    )
  } catch {
    // quota ou ambiente restrito
  }
}

export function clearSponsorCreateFormDraft() {
  sessionStorage.removeItem(SPONSOR_CREATE_FORM_DRAFT_STORAGE_KEY)
}
