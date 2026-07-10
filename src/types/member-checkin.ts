export interface MemberCheckinHistorySponsorDTO {
  id: number
  publicName: string
  logoUrl?: string | null
  tier?: string | null
  active: boolean
}

export interface MemberCheckinSponsorOptionDTO {
  id: number
  publicName: string
  logoUrl?: string | null
  active: boolean
}

export interface MemberCheckinHistoryDTO {
  id: number
  checkedInAt: string
  validated: boolean
  duplicateConfirmed: boolean
  sponsor: MemberCheckinHistorySponsorDTO
}

export interface MemberCheckinListParams {
  page: number
  size: number
  sponsorId?: number
  startDate?: string
  endDate?: string
}

export interface PaginatedMemberCheckinsResponse {
  status: string
  statusCode: number
  message?: string
  data: MemberCheckinHistoryDTO[]
  totalElements: number
  totalPages: number
  pageSize: number
  currentPage: number
}

export interface EnvelopeMemberCheckinSponsorOptions {
  status: string
  statusCode: number
  message?: string
  data: MemberCheckinSponsorOptionDTO[]
}
