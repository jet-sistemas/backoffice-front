import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { memberApi } from '@/api/member-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { MemberCheckinListParams } from '@/types/member-checkin'

export function useMemberCheckinListQuery(params: MemberCheckinListParams, enabled = true) {
  return useQuery({
    queryKey: ['member', 'checkins', params],
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    queryFn: async () => {
      try {
        const response = await memberApi.getMemberCheckins(params)
        return response.data
      } catch (error) {
        throw new Error(getApiErrorMessage(error))
      }
    },
  })
}
