export interface AdminCheckinSponsorMinDTO {
  id: number
  publicName: string
  tier?: string | null
  active: boolean
}

export interface AdminCheckinMemberMinDTO {
  id: number
  userId: number
  name: string
  code: string
  documentMasked: string
}

export interface AdminCheckinDTO {
  id: number
  checkedInAt: string
  validated: boolean
  reason?: string | null
  duplicateConfirmed: boolean
  lookupType?: string | null
  sponsor: AdminCheckinSponsorMinDTO
  member: AdminCheckinMemberMinDTO
}

export type AdminCheckinStatusFilter = 'all' | 'true' | 'false'

export interface AdminCheckinListParams {
  page: number
  size: number
  sponsorId?: number
  memberUserId?: number
  startDate?: string
  endDate?: string
  validated?: boolean
}

export interface PaginatedAdminCheckinsResponse {
  status: string
  statusCode: number
  message?: string
  data: AdminCheckinDTO[]
  totalElements: number
  totalPages: number
  pageSize: number
  currentPage: number
}
