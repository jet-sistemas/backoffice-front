import { useMutation, useQueryClient } from '@tanstack/react-query'

import { uploadsApi } from '@/api/uploads-api'
import type { UploadDeleteDTO } from '@/types/upload'

export interface UploadDeleteVariables {
  payload: UploadDeleteDTO
  userIdForInvalidation: number
}

export function useUploadDeleteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ payload }: UploadDeleteVariables) => uploadsApi.deleteUpload(payload),
    onSuccess: (_data, { userIdForInvalidation }) => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      void queryClient.invalidateQueries({
        queryKey: ['user', userIdForInvalidation],
      })
    },
  })
}
