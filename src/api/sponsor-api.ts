import { api } from '@/lib/axios'
import type {
  BenefitDTO,
  EnvelopeBenefitDTO,
  PaginatedBenefitsResponse,
} from '@/types/benefit'
import type {
  EnvelopeSponsorCheckin,
  EnvelopeSponsorMemberPreview,
  PaginatedSponsorCheckinsResponse,
  SponsorCheckinCreateDTO,
  SponsorCheckinListParams,
} from '@/types/sponsor-checkin'

interface BenefitDTOFromApi {
  id: number
  name: string
  description?: string
  address?: string
  isActive?: boolean
  active?: boolean
  createdAt?: string
}

function mapBenefitFromApi(raw: BenefitDTOFromApi): BenefitDTO {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    address: raw.address,
    isActive: raw.isActive ?? raw.active ?? false,
    createdAt: raw.createdAt,
  }
}

export const sponsorApi = {
  getMemberPreview(lookup: string) {
    return api.get<EnvelopeSponsorMemberPreview>(
      '/v1/sponsor/checkins/member-preview',
      { params: { lookup } },
    )
  },

  createCheckin(body: SponsorCheckinCreateDTO) {
    return api.post<EnvelopeSponsorCheckin>('/v1/sponsor/checkins', body)
  },

  getCheckins(params: SponsorCheckinListParams) {
    return api.get<PaginatedSponsorCheckinsResponse>('/v1/sponsor/checkins', {
      params: {
        page: params.page,
        size: params.size,
        ...(params.startDate ? { startDate: params.startDate } : {}),
        ...(params.endDate ? { endDate: params.endDate } : {}),
      },
    })
  },

  getBenefits(page: number, size: number) {
    return api
      .get<PaginatedBenefitsResponse>('/v1/sponsor/benefits', {
        params: { page, size },
      })
      .then((res) => {
        const envelope = res.data
        const data =
          envelope.data?.map((b) => mapBenefitFromApi(b as BenefitDTOFromApi)) ??
          []
        return { ...res, data: { ...envelope, data } }
      })
  },
}

export type { EnvelopeBenefitDTO }
