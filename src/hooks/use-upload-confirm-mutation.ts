import { useMutation } from '@tanstack/react-query'

import { uploadsApi } from '@/api/uploads-api'
import type { UploadConfirmDTO } from '@/types/upload'

export function useUploadConfirmMutation() {
  return useMutation({
    mutationFn: (payload: UploadConfirmDTO) => uploadsApi.confirmUpload(payload),
  })
}
