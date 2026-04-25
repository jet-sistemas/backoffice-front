import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

import { userApi } from '@/api/user-api'
import { getApiErrorMessage } from '@/lib/api-error'

export function useActivateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => userApi.activateUser(id),
    onSuccess: (_, userId) => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      void queryClient.invalidateQueries({ queryKey: ['user', userId] })
      void queryClient.invalidateQueries({ queryKey: ['benefits'] })
      void queryClient.invalidateQueries({ queryKey: ['sponsor-options'] })
      toast.success('Patrocinador ativado.')
    },
    onError: (error) => {
      const fallback =
        error instanceof AxiosError && error.response?.status === 400
          ? 'Não foi possível ativar este utilizador.'
          : 'Não foi possível ativar o patrocinador. Tente novamente.'
      toast.error(getApiErrorMessage(error, fallback))
    },
  })
}
