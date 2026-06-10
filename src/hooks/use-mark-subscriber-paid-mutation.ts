import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { billingApi } from '@/api/billing-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { SubscriberMarkPaidBodyDTO } from '@/types/billing'

export function useMarkSubscriberPaidMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      body,
    }: {
      userId: number
      body?: SubscriberMarkPaidBodyDTO
    }) => billingApi.markSubscriberPaid(userId, body),
    onSuccess: async (_response, { userId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['member-user', userId] }),
        queryClient.invalidateQueries({ queryKey: ['user-with-member', userId] }),
        queryClient.invalidateQueries({ queryKey: ['user', userId] }),
        queryClient.invalidateQueries({ queryKey: ['members'] }),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['subscriber-billing-list'] }),
        queryClient.invalidateQueries({ queryKey: ['subscriber-events', userId] }),
      ])
      toast.success('Pagamento registrado.')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Não foi possível registrar o pagamento.'))
    },
  })
}
