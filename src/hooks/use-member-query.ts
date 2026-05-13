import { useQuery } from '@tanstack/react-query'

import { userApi } from '@/api/user-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { MemberDTO } from '@/types/member'

export function useMemberQuery(userId: number | null) {
  return useQuery({
    queryKey: ['member-user', userId],
    enabled: userId != null && userId > 0,
    queryFn: async () => {
      try {
        if (userId == null) return null
        const response = await userApi.getUserById(userId)
        const m = response.data.data?.member
        if (m == null) throw new Error('Associado não encontrado.')
        return m as MemberDTO
      } catch (error) {
        throw new Error(getApiErrorMessage(error))
      }
    },
  })
}
