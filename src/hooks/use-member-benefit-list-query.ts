import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { memberApi } from '@/api/member-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { MemberBenefitListParams } from '@/types/member-benefit'

export function useMemberBenefitListQuery(params: MemberBenefitListParams) {
  return useQuery({
    queryKey: ['member', 'benefits', params],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await memberApi.getMemberBenefits(params)
        return response.data
      } catch (error) {
        throw new Error(getApiErrorMessage(error))
      }
    },
  })
}
