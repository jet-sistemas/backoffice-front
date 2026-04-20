import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

import { benefitApi } from '@/api/benefit-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { BenefitUpdateDTO } from '@/types/benefit'

export function useUpdateBenefitMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: BenefitUpdateDTO }) =>
      benefitApi.updateBenefit(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['benefits'] })
      toast.success('Benefício atualizado com sucesso.')
    },
    onError: (error) => {
      const fallback =
        error instanceof AxiosError && error.response?.status === 400
          ? 'Verifique os dados informados.'
          : 'Não foi possível atualizar o benefício. Tente novamente.'
      toast.error(getApiErrorMessage(error, fallback))
    },
  })
}
