import { useQuery } from '@tanstack/react-query'

import { billingApi } from '@/api/billing-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { SubscriberPaymentEventDTO } from '@/types/billing'

export interface SubscriberEventsPage {
  events: SubscriberPaymentEventDTO[]
  totalElements: number
  totalPages: number
  pageSize: number
  currentPage: number
}

export function useSubscriberPaymentEventsQuery(
  userId: number | null,
  page: number,
  size: number,
) {
  return useQuery<SubscriberEventsPage>({
    queryKey: ['subscriber-events', userId, page, size],
    enabled: userId != null && userId > 0,
    queryFn: async () => {
      try {
        const response = await billingApi.getSubscriberPaymentEvents(userId!, page, size)
        const envelope = response.data
        return {
          events: envelope.data ?? [],
          totalElements: envelope.totalElements ?? 0,
          totalPages: envelope.totalPages ?? 0,
          pageSize: envelope.pageSize ?? size,
          currentPage: envelope.currentPage ?? page,
        }
      } catch (error) {
        throw new Error(getApiErrorMessage(error))
      }
    },
  })
}
