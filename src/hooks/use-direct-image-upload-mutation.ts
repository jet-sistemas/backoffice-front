import { useMutation, useQueryClient } from '@tanstack/react-query'

import { uploadsApi } from '@/api/uploads-api'
import { validateImageFileForUpload } from '@/lib/image-upload-constants'
import { putPresignedUpload } from '@/lib/put-presigned-upload'
import type { UploadConfirmResponseDTO, UploadTarget } from '@/types/upload'

export interface DirectImageUploadVariables {
  file: File
  entity: UploadTarget
  entityId: number
  userIdForInvalidation: number
}

export function useDirectImageUploadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      file,
      entity,
      entityId,
    }: DirectImageUploadVariables): Promise<UploadConfirmResponseDTO> => {
      validateImageFileForUpload(file)
      const init = await uploadsApi.initUpload({
        entity,
        entityId,
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      })
      await putPresignedUpload(init.uploadUrl, file, file.type)
      return uploadsApi.confirmUpload({
        entity,
        entityId,
        objectKey: init.objectKey,
      })
    },
    onSuccess: (_data, { userIdForInvalidation }) => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      void queryClient.invalidateQueries({
        queryKey: ['user', userIdForInvalidation],
      })
    },
  })
}
