import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { userApi } from '@/api/user-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { UserListParams } from '@/types/user'

export function useUserListQuery(params: UserListParams) {
  return useQuery({
    queryKey: ['users', params],
    placeholderData: keepPreviousData,
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
