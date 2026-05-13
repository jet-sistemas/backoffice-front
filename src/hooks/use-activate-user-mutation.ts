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
      void queryClient.invalidateQueries({ queryKey: ['members'] })
      void queryClient.invalidateQueries({ queryKey: ['user', userId] })
      void queryClient.invalidateQueries({ queryKey: ['benefits'] })
      void queryClient.invalidateQueries({ queryKey: ['sponsor-options'] })
      toast.success('Conta reativada.')
    },
    onError: (error) => {
      const fallback =
        error instanceof AxiosError && error.response?.status === 400
          ? 'Não foi possível reativar esta conta.'
          : 'Não foi possível reativar a conta. Tente novamente.'
      toast.error(getApiErrorMessage(error, fallback))
    },
  })
}
