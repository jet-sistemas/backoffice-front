import { useQuery } from '@tanstack/react-query'

import { userApi } from '@/api/user-api'
import { getApiErrorMessage } from '@/lib/api-error'
import { isUserWithSponsor, type UserWithSponsorDTO } from '@/types/user'

export function useUserWithSponsorQuery(userId: number | null) {
  return useQuery<UserWithSponsorDTO>({
    queryKey: ['user', userId],
    enabled: userId != null && userId > 0,
    queryFn: async () => {
      try {
        const response = await userApi.getUserById(userId!)
        const data = response.data.data
        if (data == null) {
          throw new Error('Usuário não encontrado.')
        }
        if (!isUserWithSponsor(data)) {
          throw new Error('Usuário não é um patrocinador.')
        }
        return data
      } catch (error) {
        throw new Error(getApiErrorMessage(error))
      }
    },
  })
}
