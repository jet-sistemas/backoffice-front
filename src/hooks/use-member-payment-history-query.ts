import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { memberApi } from '@/api/member-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { MemberPaymentHistoryDTO } from '@/types/member-account'

export interface MemberPaymentHistoryPage {
  payments: MemberPaymentHistoryDTO[]
  totalElements: number
  totalPages: number
  pageSize: number
  currentPage: number
}

export function useMemberPaymentHistoryQuery(page: number, size: number) {
  return useQuery<MemberPaymentHistoryPage>({
    queryKey: ['member', 'account', 'payments', page, size],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await memberApi.getMemberPayments({ page, size })
        const envelope = response.data
        return {
          payments: envelope.data ?? [],
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
