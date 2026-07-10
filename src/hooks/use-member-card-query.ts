import { useQuery } from '@tanstack/react-query'

import { memberApi } from '@/api/member-api'
import { getApiErrorMessage } from '@/lib/api-error'

export function useMemberCardQuery() {
  return useQuery({
    queryKey: ['member', 'card'],
    queryFn: async () => {
      try {
        const response = await memberApi.getMemberCard()
        return response.data.data
      } catch (error) {
        throw new Error(getApiErrorMessage(error))
      }
    },
  })
}
