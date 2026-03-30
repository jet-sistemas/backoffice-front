import { useMutation } from '@tanstack/react-query'

import { uploadsApi } from '@/api/uploads-api'
import type { UploadInitDTO } from '@/types/upload'

export function useUploadInitMutation() {
  return useMutation({
    mutationFn: (payload: UploadInitDTO) => uploadsApi.initUpload(payload),
  })
}
