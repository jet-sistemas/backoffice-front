import { useQuery } from '@tanstack/react-query'

import { userApi } from '@/api/user-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { MemberDTO } from '@/types/member'
import { isUserWithMember } from '@/types/user'

export function useMemberQuery(userId: number | null) {
  return useQuery({
    queryKey: ['member-user', userId],
    enabled: userId != null && userId > 0,
    queryFn: async () => {
      try {
        if (userId == null) return null
        const response = await userApi.getUserById(userId)
        const user = response.data.data
        if (user == null || !isUserWithMember(user) || user.member == null) {
          throw new Error('Associado não encontrado.')
        }
        return user.member satisfies MemberDTO
      } catch (error) {
        throw new Error(getApiErrorMessage(error))
      }
    },
  })
}
