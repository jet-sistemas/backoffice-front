import { useQuery } from '@tanstack/react-query'
import { userApi } from '@/api/user-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { UserListParams } from '@/types/user'

function searchKeyPart(search: string | undefined) {
  return search ?? ''
}

export function useUserListQuery(params: UserListParams) {
  return useQuery({
    queryKey: ['users', params],
    placeholderData: (previousData, previousQuery) => {
      const prevParams = previousQuery?.queryKey[1] as
        | UserListParams
        | undefined
      if (
        prevParams != null &&
        searchKeyPart(prevParams.search) !== searchKeyPart(params.search)
      ) {
        return undefined
      }
      return previousData
    },
    queryFn: async () => {
      try {
        const response = await userApi.getUsers(params)
        return response.data
      } catch (error) {
        throw new Error(getApiErrorMessage(error))
      }
    },
  })
}
