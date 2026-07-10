import { useQuery } from '@tanstack/react-query'

import { sponsorApi } from '@/api/sponsor-api'
import { getApiErrorMessage } from '@/lib/api-error'

export function useSponsorMemberPreviewQuery(lookup: string | null) {
  return useQuery({
    queryKey: ['sponsor', 'member-preview', lookup],
    enabled: !!lookup && lookup.trim().length > 0,
    queryFn: async () => {
      try {
        const response = await sponsorApi.getMemberPreview(lookup!.trim())
        return response.data.data
      } catch (error) {
        throw new Error(getApiErrorMessage(error))
      }
    },
  })
}
