import { useQuery } from '@tanstack/react-query'

import { memberApi } from '@/api/member-api'
import { getApiErrorMessage } from '@/lib/api-error'

export function useMemberCheckinSponsorOptionsQuery() {
  return useQuery({
    queryKey: ['member', 'checkins', 'sponsors'],
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    queryFn: async () => {
      try {
        const response = await memberApi.getMemberCheckinSponsors()
        return response.data.data
      } catch (error) {
        throw new Error(getApiErrorMessage(error))
      }
    },
  })
}
