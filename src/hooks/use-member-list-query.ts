import { useQuery } from '@tanstack/react-query'

import { memberApi } from '@/api/member-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { MemberListParams } from '@/types/member'

export function useMemberListQuery(params: MemberListParams) {
  return useQuery({
    queryKey: ['members', params],
    queryFn: async () => {
      try {
        const response = await memberApi.getMembers(params)
        return response.data
      } catch (error) {
        throw new Error(getApiErrorMessage(error))
      }
    },
  })
}
