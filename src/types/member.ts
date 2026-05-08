import type { ApiEnvelopeBase } from './auth'

export type MemberTypeEnum = 'SUBSCRIBER' | 'SPONSORED'

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
  }
}

export interface MemberListParams {
  type?: MemberTypeEnum
  isActive?: boolean
  search?: string
  page: number
  size: number
}

export interface PaginatedMembersResponse extends ApiEnvelopeBase {
  data: MemberDTO[]
}

export interface EnvelopeMemberDTO extends ApiEnvelopeBase {
  data?: MemberDTO | null
}
