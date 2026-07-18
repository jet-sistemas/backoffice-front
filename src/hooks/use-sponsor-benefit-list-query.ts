import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { sponsorApi } from '@/api/sponsor-api'
import { getApiErrorMessage } from '@/lib/api-error'

export function useSponsorBenefitListQuery(page: number, size: number) {
  return useQuery({
    queryKey: ['sponsor', 'benefits', { page, size }],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await sponsorApi.getBenefits(page, size)
        return response.data
      } catch (error) {
        throw new Error(getApiErrorMessage(error))
      }
    },
  })
}
