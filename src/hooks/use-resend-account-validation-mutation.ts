import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { userApi } from '@/api/user-api'
import { getApiErrorMessage } from '@/lib/api-error'

export function useResendAccountValidationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => userApi.resendAccountValidation(userId),
    onSuccess: (response) => {
      const resendType = response.data.data?.resendType
      const message =
        resendType === 'TEMPORARY_PASSWORD'
          ? 'Senha temporária reenviada com sucesso.'
          : 'Convite reenviado com sucesso.'
      toast.success(message)
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          'Não foi possível reenviar as credenciais. Tente novamente.',
        ),
      )
    },
  })
}
