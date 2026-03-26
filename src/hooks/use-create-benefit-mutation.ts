import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

import { benefitApi } from '@/api/benefit-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { BenefitCreateDTO } from '@/types/benefit'

export function useCreateBenefitMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: BenefitCreateDTO) => benefitApi.createBenefit(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['benefits'] })
      toast.success('Benefício criado com sucesso.')
    },
    onError: (error) => {
      const fallback =
        error instanceof AxiosError && error.response?.status === 400
          ? 'Verifique os dados informados.'
          : 'Não foi possível criar o benefício. Tente novamente.'
      toast.error(getApiErrorMessage(error, fallback))
    },
  })
}
