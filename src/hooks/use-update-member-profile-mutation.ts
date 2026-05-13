import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

import { userApi } from '@/api/user-api'
import { getApiErrorMessage } from '@/lib/api-error'
import type { MemberProfileEditFormData } from '@/schemas/member-edit-schema'

export function useUpdateMemberProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      values,
    }: {
      userId: number
      values: MemberProfileEditFormData
    }) =>
      userApi.updateUser(userId, {
        member: {
          fullname: values.fullname.trim(),
          whatsapp: values.whatsapp,
        },
      }),
    onSuccess: async (_response, { userId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['member-user', userId] }),
        queryClient.invalidateQueries({ queryKey: ['user-with-member', userId] }),
        queryClient.invalidateQueries({ queryKey: ['user', userId] }),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['members'] }),
      ])
      toast.success('Dados do associado atualizados.')
    },
    onError: (error) => {
      const fallback =
        error instanceof AxiosError && error.response?.status === 400
          ? 'Verifique os dados informados.'
          : 'Não foi possível atualizar o associado. Tente novamente.'
      toast.error(getApiErrorMessage(error, fallback))
    },
  })
}
