import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { accountValidationApi } from '@/api/account-validation-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { AccountValidationRequestDTO } from '@/types/account-validation'

export function useConfirmAccountMutation() {
  return useMutation({
    mutationFn: (data: AccountValidationRequestDTO) =>
      accountValidationApi.confirm(data),
    onError: (error) => {
      const fallback =
        error instanceof AxiosError && error.response?.status === 400
          ? 'Não foi possível validar a conta. Verifique código e documento.'
          : 'Não foi possível validar a conta. Tente novamente.'
      toast.error(getApiErrorMessage(error, fallback))
    },
  })
}
