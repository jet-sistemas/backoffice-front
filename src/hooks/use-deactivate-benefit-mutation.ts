import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

import { benefitApi } from '@/api/benefit-api'
import { getApiErrorMessage } from '@/lib/api-error'

export function useDeactivateBenefitMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => benefitApi.deactivateBenefit(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['benefits'] })
      toast.success('Benefício desativado.')
    },
    onError: (error) => {
      const fallback =
        error instanceof AxiosError && error.response?.status === 400
          ? 'Não foi possível desativar este benefício.'
          : 'Não foi possível desativar o benefício. Tente novamente.'
      toast.error(getApiErrorMessage(error, fallback))
    },
  })
}
