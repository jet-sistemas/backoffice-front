import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { userApi } from '@/api/user-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { SubscriberMemberPatchDTO } from '@/types/member'

export function usePatchSubscriberMemberMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      body,
    }: {
      userId: number
      body: SubscriberMemberPatchDTO
    }) => userApi.patchSubscriberUser(userId, body),
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
      toast.success('Dados da mensalidade atualizados.')
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Não foi possível atualizar a mensalidade.'),
      )
    },
  })
}
