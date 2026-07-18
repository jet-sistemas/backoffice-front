import { api } from '@/lib/axios'
import type { EnvelopeMemberCard } from '@/types/member-card'
import type {
  EnvelopeMemberAccountStatus,
  MemberPaymentListParams,
  PaginatedMemberPaymentsResponse,
} from '@/types/member-account'
import type {
  MemberBenefitListParams,
  PaginatedMemberBenefitsResponse,
} from '@/types/member-benefit'
import type {
  EnvelopeMemberCheckinSponsorOptions,
  MemberCheckinListParams,
  PaginatedMemberCheckinsResponse,
} from '@/types/member-checkin'

export const memberApi = {
  getMemberCard() {
    return api.get<EnvelopeMemberCard>('/v1/member/me/card')
  },

  getMemberAccount() {
    return api.get<EnvelopeMemberAccountStatus>('/v1/member/me/account')
  },

  getMemberPayments(params: MemberPaymentListParams) {
    return api.get<PaginatedMemberPaymentsResponse>('/v1/member/me/account/payments', {
      params: {
        page: params.page,
        size: params.size,
      },
    })
  },

  getMemberBenefits(params: MemberBenefitListParams) {
    return api.get<PaginatedMemberBenefitsResponse>('/v1/member/benefits', {
      params: {
        page: params.page,
        size: params.size,
        ...(params.sponsorId != null ? { sponsorId: params.sponsorId } : {}),
      },
    })
  },

  getMemberCheckins(params: MemberCheckinListParams) {
    return api.get<PaginatedMemberCheckinsResponse>('/v1/member/checkins', {
      params: {
        page: params.page,
        size: params.size,
        ...(params.sponsorId != null ? { sponsorId: params.sponsorId } : {}),
        ...(params.startDate ? { startDate: params.startDate } : {}),
        ...(params.endDate ? { endDate: params.endDate } : {}),
      },
    })
  },

  getMemberCheckinSponsors() {
    return api.get<EnvelopeMemberCheckinSponsorOptions>('/v1/member/checkins/sponsors')
  },
}
