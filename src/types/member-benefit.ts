import type { ApiEnvelopeBase } from './auth'
import type { SponsorTierEnum } from './user'

export interface MemberBenefitSponsorDTO {
  id: number
  publicName: string
  tier: SponsorTierEnum
  logoUrl?: string | null
}

export interface MemberBenefitDTO {
  id: number
  name: string
  description?: string | null
  address?: string | null
  sponsor?: MemberBenefitSponsorDTO | null
}

export interface MemberBenefitListParams {
  page: number
  size: number
  sponsorId?: number
}

export interface PaginatedMemberBenefitsResponse extends ApiEnvelopeBase {
  data: MemberBenefitDTO[]
  totalElements: number
  totalPages: number
  pageSize: number
  currentPage: number
}
