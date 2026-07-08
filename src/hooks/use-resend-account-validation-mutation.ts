import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { userApi } from '@/api/user-api'
import { getApiErrorMessage } from '@/lib/api-error'

export function useResendAccountValidationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => userApi.resendAccountValidation(userId),
    onSuccess: () => {
      toast.success('Convite reenviado com sucesso.')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          'Não foi possível reenviar o convite. Tente novamente.',
        ),
      )
    },
  })
}
