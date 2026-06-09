import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

import { userApi } from '@/api/user-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { MemberAccountEditFormData } from '@/schemas/member-edit-schema'

export function useUpdateMemberAccountMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      values,
    }: {
      userId: number
      values: MemberAccountEditFormData
    }) =>
      userApi.updateUser(userId, {
        email: values.email.trim(),
        name: values.name.trim(),
        document: values.document,
      }),
    onSuccess: async (_response, { userId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['member-user', userId] }),
        queryClient.invalidateQueries({ queryKey: ['user-with-member', userId] }),
        queryClient.invalidateQueries({ queryKey: ['user', userId] }),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['members'] }),
      ])
      toast.success('Conta de acesso atualizada.')
    },
    onError: (error) => {
      const fallback =
        error instanceof AxiosError && error.response?.status === 400
          ? 'Verifique os dados informados.'
          : 'Não foi possível atualizar a conta. Tente novamente.'
      toast.error(getApiErrorMessage(error, fallback))
    },
  })
}
