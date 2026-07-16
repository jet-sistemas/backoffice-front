import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { authApi } from '@/api/auth-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { ChangePasswordRequestDTO } from '@/types/auth'

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequestDTO) => authApi.changePassword(data),
    onError: (error) => {
      const fallback =
        error instanceof AxiosError && error.response?.status === 400
          ? 'Não foi possível alterar a senha. Verifique os dados informados.'
          : 'Não foi possível alterar a senha. Tente novamente.'
      toast.error(getApiErrorMessage(error, fallback))
    },
  })
}
