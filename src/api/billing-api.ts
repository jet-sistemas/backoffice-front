import { api } from '@/lib/axios'
import type { EnvelopeMemberDTO } from '@/types/member'
import type {
  EnvelopeSubscriberBillingListResultDTO,
  SubscriberBillingListParams,
  SubscriberMarkPaidBodyDTO,
  SubscriberPaymentEventDTO,
} from '@/types/billing'
import type { ApiEnvelopeBase } from '@/types/auth'

type EnvelopePaymentEventsDTO = ApiEnvelopeBase & {
  data?: SubscriberPaymentEventDTO[] | null
}

export const billingApi = {
  getSubscriberBillingList(params: SubscriberBillingListParams) {
    const apiParams: Record<string, string | number> = {
      page: params.page,
      size: params.size,
    }
    if (params.status != null && params.status !== 'ALL') {
      apiParams.status = params.status
    }
    if (params.dueFrom != null && params.dueFrom !== '') {
      apiParams.dueFrom = params.dueFrom
    }
    if (params.dueTo != null && params.dueTo !== '') {
      apiParams.dueTo = params.dueTo
    }
    if (params.search != null && params.search.trim() !== '') {
      apiParams.search = params.search.trim()
    }
    return api.get<EnvelopeSubscriberBillingListResultDTO>(
      '/v1/admin/subscribers/billing',
      { params: apiParams },
    )
  },

  markSubscriberPaid(userId: number, body?: SubscriberMarkPaidBodyDTO) {
    return api.patch<EnvelopeMemberDTO>(
      `/v1/admin/user/${userId}/subscriber/paid`,
      body ?? {},
    )
  },

  getSubscriberPaymentEvents(userId: number, page: number, size: number) {
    return api.get<EnvelopePaymentEventsDTO>(
      `/v1/admin/user/${userId}/subscriber/events`,
      { params: { page, size } },
    )
  },
}
