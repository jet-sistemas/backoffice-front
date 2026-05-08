import { useQuery } from '@tanstack/react-query'

import { memberApi } from '@/api/member-api'
import { getApiErrorMessage } from '@/lib/api-error'

export function useMemberQuery(memberId: number | null) {
  return useQuery({
    queryKey: ['member', memberId],
    enabled: memberId != null,
    queryFn: async () => {
      if (memberId == null) return null
      try {
        const response = await memberApi.getMemberById(memberId)
        return response.data.data ?? null
      } catch (error) {
        throw new Error(getApiErrorMessage(error))
      }
    },
  })
}
