import { useQuery } from '@tanstack/react-query'

import { memberApi } from '@/api/member-api'
import { getApiErrorMessage } from '@/lib/api-error'

export function useMemberAccountQuery() {
  return useQuery({
    queryKey: ['member', 'account'],
    queryFn: async () => {
      try {
        const response = await memberApi.getMemberAccount()
        return response.data.data
      } catch (error) {
        throw new Error(getApiErrorMessage(error))
      }
    },
  })
}
