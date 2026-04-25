import { api } from '@/lib/axios'
import { sponsorTierFromApi } from '@/lib/sponsor-tier'
import type {
  BenefitCreateDTO,
  BenefitDTO,
  BenefitListParams,
  BenefitUpdateDTO,
  EnvelopeBenefitDTO,
  PaginatedBenefitsResponse,
  SponsorMinDTO,
} from '@/types/benefit'

interface BenefitDTOFromApi {
  id: number
  name: string
  description?: string
  address?: string
  isActive?: boolean
  active?: boolean
  sponsor?: {
    id: number
    publicName: string
    tier?: string
    isActive?: boolean
    active?: boolean
  }
  createdAt?: string
}

function mapSponsorMinFromApi(
  raw: NonNullable<BenefitDTOFromApi['sponsor']>,
): SponsorMinDTO {
  const tier = sponsorTierFromApi(raw.tier) ?? 'BRONZE'
  const isActive = raw.isActive ?? raw.active ?? true
  return {
    id: raw.id,
    publicName: raw.publicName,
    tier,
    isActive,
  }
}

function mapBenefitFromApi(raw: BenefitDTOFromApi): BenefitDTO {
  const isActive = raw.isActive ?? raw.active ?? false
  const sponsor =
    raw.sponsor != null ? mapSponsorMinFromApi(raw.sponsor) : undefined
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    address: raw.address,
    isActive,
    sponsor,
    createdAt: raw.createdAt,
  }
}

function buildListParams(params: BenefitListParams) {
  const { page, size, isActive, sponsorId } = params
  return {
    page,
    size,
    ...(isActive !== undefined ? { isActive } : {}),
    ...(sponsorId != null ? { sponsorId } : {}),
  }
}

export const benefitApi = {
  getBenefits(params: BenefitListParams) {
    return api
      .get<PaginatedBenefitsResponse>('/v1/admin/benefit', {
        params: buildListParams(params),
      })
      .then((res) => {
        const envelope = res.data
        const data = envelope.data?.map((b) =>
          mapBenefitFromApi(b as BenefitDTOFromApi),
        ) ?? []
        return { ...res, data: { ...envelope, data } }
      })
  },

  createBenefit(body: BenefitCreateDTO) {
    const payload: BenefitCreateDTO = {
      name: body.name.trim(),
      sponsorId: body.sponsorId,
      ...(body.description != null && body.description.trim() !== ''
        ? { description: body.description.trim() }
        : {}),
      ...(body.address != null && body.address.trim() !== ''
        ? { address: body.address.trim() }
        : {}),
    }
    return api
      .post<EnvelopeBenefitDTO>('/v1/admin/benefit', payload)
      .then((res) => {
        const envelope = res.data
        const raw = envelope.data as BenefitDTOFromApi | null | undefined
        if (!raw) return res
        return {
          ...res,
          data: { ...envelope, data: mapBenefitFromApi(raw) },
        }
      })
  },

  updateBenefit(id: number, body: BenefitUpdateDTO) {
    const payload: Record<string, unknown> = {}
    if (body.name !== undefined) payload.name = body.name.trim()
    if (body.description !== undefined) {
      payload.description =
        body.description.trim() === '' ? undefined : body.description.trim()
    }
    if (body.address !== undefined) {
      payload.address =
        body.address.trim() === '' ? undefined : body.address.trim()
    }
    if (body.sponsorId !== undefined) {
      payload.sponsorId = body.sponsorId
    }
    return api
      .put<EnvelopeBenefitDTO>(`/v1/admin/benefit/${id}`, payload)
      .then((res) => {
        const envelope = res.data
        const raw = envelope.data as BenefitDTOFromApi | null | undefined
        if (!raw) return res
        return {
          ...res,
          data: { ...envelope, data: mapBenefitFromApi(raw) },
        }
      })
  },

  deactivateBenefit(id: number) {
    return api.patch(`/v1/admin/benefit/${id}/deactivate`)
  },

  activateBenefit(id: number) {
    return api.patch(`/v1/admin/benefit/${id}/activate`)
  },
}
