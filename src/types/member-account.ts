import type { ApiEnvelopeBase } from './auth'
import type { MemberStatusEnum } from './member'

export interface MemberAccountStatusDTO {
  status: MemberStatusEnum
  nextDueDate: string
  lastPaidAt?: string | null
  monthlyFeeAmount: number
  billingDay: number
}

export interface MemberPaymentHistoryDTO {
  id: number
  conferenceAt?: string | null
  adminName?: string | null
  amount?: number | null
  note?: string | null
}

export interface EnvelopeMemberAccountStatus extends ApiEnvelopeBase {
  data?: MemberAccountStatusDTO | null
}

export interface PaginatedMemberPaymentsResponse extends ApiEnvelopeBase {
  data?: MemberPaymentHistoryDTO[] | null
}

export interface MemberPaymentListParams {
  page: number
  size: number
}
