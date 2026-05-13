import type { ApiEnvelopeBase } from './auth'

export type MemberTypeEnum = 'SUBSCRIBER' | 'SPONSORED'

export type MemberStatusEnum = 'ACTIVE' | 'DUE_SOON' | 'OVERDUE' | 'INACTIVE'

export interface SubscriberMemberDTO {
  id: number
  monthlyFeeAmount: number
  billingDay: number
  status: MemberStatusEnum
  nextDueDate: string
  lastPaidAt?: string | null
  createdAt?: string | null
}

export interface SponsoredMemberDTO {
  memberId: number
  grantedByUserId: number
  startAt: string
  endAt?: string | null
  reason?: string | null
  active: boolean
  createdAt?: string | null
  updatedAt?: string | null
}

export interface MemberDTO {
  id: number
  userId: number
  email: string
  code: string
  document: string
  fullname: string
  whatsapp: string
  type: MemberTypeEnum
  active: boolean
  createdAt: string
  subscriber?: SubscriberMemberDTO | null
  sponsored?: SponsoredMemberDTO | null
}

export interface SubscriberDataCreateDTO {
  monthlyFeeAmount: number
  billingDay: number
  nextDueDate?: string
}

export interface SponsoredDataCreateDTO {
  grantedByUserId: number
  startAt: string
  endAt?: string
  reason?: string
}

export interface MemberCreateDTO {
  user: {
    email: string
    name: string
    document: string
    code: string
    type: 'MEMBER'
  }
  member: {
    fullname: string
    whatsapp: string
    type: MemberTypeEnum
    subscriber?: SubscriberDataCreateDTO
    sponsored?: SponsoredDataCreateDTO
  }
}

export interface SubscriberMemberPatchDTO {
  monthlyFeeAmount?: number
  billingDay?: number
  nextDueDate?: string
  status?: MemberStatusEnum
}

export interface MemberListParams {
  type?: MemberTypeEnum
  isActive?: boolean
  search?: string
  page: number
  size: number
}

/** Linha da listagem admin: membro + campos do utilizador necessários à UI. */
export interface MemberListRow {
  userId: number
  avatarUrl?: string
  accountActive: boolean
  member: MemberDTO
}

export interface PaginatedMemberListRowsResponse extends ApiEnvelopeBase {
  data: MemberListRow[]
}

export interface EnvelopeMemberDTO extends ApiEnvelopeBase {
  data?: MemberDTO | null
}
