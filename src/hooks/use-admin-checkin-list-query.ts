import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { adminApi } from '@/api/admin-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { AdminCheckinListParams } from '@/types/admin-checkin'

export function useAdminCheckinListQuery(params: AdminCheckinListParams, enabled = true) {
  return useQuery({
    queryKey: ['admin', 'checkins', params],
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    queryFn: async () => {
      try {
        const response = await adminApi.getAdminCheckins(params)
        return response.data
      } catch (error) {
        throw new Error(getApiErrorMessage(error))
      }
    },
  })
}
