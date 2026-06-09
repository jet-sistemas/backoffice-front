import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { billingApi } from '@/api/billing-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { SubscriberBillingListParams, SubscriberBillingListResultDTO } from '@/types/billing'

export function useSubscriberBillingListQuery(params: SubscriberBillingListParams) {
  return useQuery<SubscriberBillingListResultDTO>({
    queryKey: ['subscriber-billing-list', params],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await billingApi.getSubscriberBillingList(params)
        const envelope = response.data
        const data = envelope.data
        if (data == null) {
          throw new Error('Resposta vazia da API de mensalidades.')
        }
        return data
      } catch (error) {
        throw new Error(getApiErrorMessage(error))
      }
    },
  })
}
