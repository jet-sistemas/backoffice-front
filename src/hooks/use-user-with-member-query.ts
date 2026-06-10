import { useQuery } from '@tanstack/react-query'

import { userApi } from '@/api/user-api'
import { getApiErrorMessage } from '@/lib/api-error'
import { isUserWithMember, type UserWithMemberDTO } from '@/types/user'

export function useUserWithMemberQuery(userId: number | null) {
  return useQuery<UserWithMemberDTO>({
    queryKey: ['user-with-member', userId],
    enabled: userId != null && userId > 0,
    queryFn: async () => {
      try {
        const response = await userApi.getUserById(userId!)
        const data = response.data.data
        if (data == null) {
          throw new Error('Usuário não encontrado.')
        }
        if (!isUserWithMember(data) || data.member == null) {
          throw new Error('Usuário não é um associado.')
        }
        return data
      } catch (error) {
        throw new Error(getApiErrorMessage(error))
      }
    },
  })
}
