export type CheckinLookupType = 'CODE' | 'DOCUMENT'
export type MemberType = 'SUBSCRIBER' | 'SPONSORED'

export interface SponsorMemberPreviewDTO {
  id: number
  name: string
  avatarUrl?: string | null
  code: string
  documentMasked: string
  memberType: MemberType
  eligible: boolean
  ineligibleReason?: string | null
  alreadyCheckedInToday: boolean
  lastCheckinAt?: string | null
}

export interface SponsorCheckinMemberMinDTO {
  id: number
  name: string
  code: string
  documentMasked: string
}

export interface SponsorCheckinDTO {
  id: number
  validated: boolean
  reason?: string | null
  duplicateConfirmed: boolean
  lookupType?: CheckinLookupType | null
  createdAt: string
  member: SponsorCheckinMemberMinDTO
}

export interface SponsorCheckinCreateDTO {
  lookup: string
  confirmDuplicateToday?: boolean
}

export interface SponsorCheckinListParams {
  page: number
  size: number
  startDate?: string
  endDate?: string
}

export interface PaginatedSponsorCheckinsResponse {
  status: string
  statusCode: number
  message?: string
  data: SponsorCheckinDTO[]
  totalElements: number
  totalPages: number
  pageSize: number
  currentPage: number
}

export interface EnvelopeSponsorMemberPreview {
  status: string
  statusCode: number
  message?: string
  data: SponsorMemberPreviewDTO
}

export interface EnvelopeSponsorCheckin {
  status: string
  statusCode: number
  message?: string
  data: SponsorCheckinDTO
}
