import type { ApiEnvelopeBase } from '@/types/auth'
import type { MemberTypeEnum } from '@/types/member'

export interface MemberCardDTO {
  id: number
  userId: number
  name: string
  document: string
  code: string
  avatarUrl?: string | null
  memberType: MemberTypeEnum
  accountActive: boolean
}

export interface EnvelopeMemberCard extends ApiEnvelopeBase {
  data?: MemberCardDTO | null
}
