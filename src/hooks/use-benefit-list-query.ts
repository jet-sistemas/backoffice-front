import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { benefitApi } from '@/api/benefit-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { BenefitListParams } from '@/types/benefit'

export interface BenefitListUiParams {
  page: number
  size: number
  isActive?: boolean
  sponsorId?: number
}

export function useBenefitListQuery(uiParams: BenefitListUiParams) {
  const apiParams: BenefitListParams = {
    page: Math.max(0, uiParams.page - 1),
    size: uiParams.size,
    ...(uiParams.isActive !== undefined
      ? { isActive: uiParams.isActive }
      : {}),
    ...(uiParams.sponsorId != null ? { sponsorId: uiParams.sponsorId } : {}),
  }

  return useQuery({
    queryKey: ['benefits', apiParams],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const response = await benefitApi.getBenefits(apiParams)
        return response.data
      } catch (error) {
        throw new Error(getApiErrorMessage(error))
      }
    },
  })
}
