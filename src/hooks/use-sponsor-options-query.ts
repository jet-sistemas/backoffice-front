import { useQuery } from '@tanstack/react-query'

import { userApi } from '@/api/user-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { UserWithSponsorDTO } from '@/types/user'

const SPONSOR_OPTIONS_PAGE_SIZE = 500

export function useSponsorOptionsQuery() {
  return useQuery({
    queryKey: ['sponsor-options'],
    queryFn: async () => {
      try {
        const response = await userApi.getUsers({
          type: 'SPONSOR',
          page: 1,
          size: SPONSOR_OPTIONS_PAGE_SIZE,
        })
        const envelope = response.data
        const list = envelope.data ?? []
        return list.filter(
          (u): u is UserWithSponsorDTO & { sponsor: NonNullable<UserWithSponsorDTO['sponsor']> } =>
            u.sponsor != null,
        )
      } catch (error) {
        throw new Error(getApiErrorMessage(error))
      }
    },
    staleTime: 60_000,
  })
}
