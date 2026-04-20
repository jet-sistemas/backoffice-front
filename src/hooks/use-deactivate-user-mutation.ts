import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

import { userApi } from '@/api/user-api'
import { getApiErrorMessage } from '@/lib/api-error'

export function useDeactivateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => userApi.deactivateUser(id),
    onSuccess: (_, userId) => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      void queryClient.invalidateQueries({ queryKey: ['user', userId] })
      toast.success('Patrocinador desativado.')
    },
    onError: (error) => {
      const fallback =
        error instanceof AxiosError && error.response?.status === 400
          ? 'Não foi possível desativar este utilizador.'
          : 'Não foi possível desativar o patrocinador. Tente novamente.'
      toast.error(getApiErrorMessage(error, fallback))
    },
  })
}
