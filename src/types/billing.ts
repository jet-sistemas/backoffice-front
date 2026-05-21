import type { ApiEnvelopeBase } from './auth'
import type { MemberDTO, MemberStatusEnum } from './member'

export interface BillingAdminUserDTO {
  id: number
  email: string
  name: string
}

export type SubscriberPaymentEventTypeEnum =
  | 'STATUS_AUTO_UPDATED'
  | 'PAYMENT_MARKED_PAID'
  | 'BILLING_CONFIG_UPDATED'

export interface SubscriberBillingSummaryDTO {
  overdueCount: number
  dueSoonCount: number
  activeCount: number
  inactiveCount: number
}

export interface SubscriberBillingRowDTO {
  userId: number
  memberId: number
  fullname: string
  email: string
  document: string
  whatsapp: string
  monthlyFeeAmount: number
  billingDay: number
  status: MemberStatusEnum
  nextDueDate: string
  lastPaidAt?: string | null
  canMarkPayment?: boolean
  paymentMarkBlockedReason?: string | null
}

export interface SubscriberBillingListResultDTO {
  summary: SubscriberBillingSummaryDTO
  rows: SubscriberBillingRowDTO[]
  totalElements: number
  totalPages: number
  pageSize: number
  currentPage: number
}

export interface SubscriberPaymentEventDTO {
  id: number
  eventType: SubscriberPaymentEventTypeEnum
  oldStatus: MemberStatusEnum
  newStatus: MemberStatusEnum
  oldNextDueDate: string
  newNextDueDate: string
  oldMonthlyFeeAmount: number
  newMonthlyFeeAmount: number
  oldBillingDay: number
  newBillingDay: number
  amount?: number | null
  note?: string | null
  createdAt?: string | null
  adminUser?: BillingAdminUserDTO | null
}

export interface EnvelopeSubscriberBillingListResultDTO extends ApiEnvelopeBase {
  data?: SubscriberBillingListResultDTO | null
}

export interface EnvelopeMemberFromBillingDTO extends ApiEnvelopeBase {
  data?: MemberDTO | null
}

export interface SubscriberMarkPaidBodyDTO {
  note?: string
  amountPaid?: number
}

export interface SubscriberBillingListParams {
  status?: MemberStatusEnum | 'ALL'
  dueFrom?: string
  dueTo?: string
  search?: string
  page: number
  size: number
}
