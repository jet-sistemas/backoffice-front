import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { sponsorApi } from '@/api/sponsor-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { SponsorCheckinListParams } from '@/types/sponsor-checkin'

export function useSponsorCheckinListQuery(params: SponsorCheckinListParams) {
  return useQuery({
    queryKey: ['sponsor', 'checkins', params],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await sponsorApi.getCheckins(params)
        return response.data
      } catch (error) {
        throw new Error(getApiErrorMessage(error))
      }
    },
  })
}
