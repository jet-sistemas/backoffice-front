import { useId, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { AxiosError } from 'axios'

import { useDirectImageUploadMutation } from '@/hooks/use-direct-image-upload-mutation'
import { useUploadDeleteMutation } from '@/hooks/use-upload-delete-mutation'
import { getApiErrorMessage } from '@/lib/api-error'
import {
  IMAGE_UPLOAD_ERROR_CONFIRM,
  IMAGE_UPLOAD_ERROR_EXPIRED,
  IMAGE_UPLOAD_ERROR_INVALID_TYPE,
  IMAGE_UPLOAD_ERROR_NETWORK,
  IMAGE_UPLOAD_ERROR_TOO_LARGE,
} from '@/lib/image-upload-constants'
import { resolveR2PublicUrl } from '@/lib/r2-public-url'
import type { UploadTarget } from '@/types/upload'

const KNOWN_UPLOAD_MESSAGES = new Set([
  IMAGE_UPLOAD_ERROR_INVALID_TYPE,
  IMAGE_UPLOAD_ERROR_TOO_LARGE,
  IMAGE_UPLOAD_ERROR_EXPIRED,
  IMAGE_UPLOAD_ERROR_NETWORK,
  IMAGE_UPLOAD_ERROR_CONFIRM,
])

export function resolveImageUploadFailureMessage(error: unknown): string {
  if (error instanceof Error && error.message && KNOWN_UPLOAD_MESSAGES.has(error.message)) {
    return error.message
  }
  if (error instanceof AxiosError) {
    return getApiErrorMessage(error, IMAGE_UPLOAD_ERROR_CONFIRM)
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return IMAGE_UPLOAD_ERROR_CONFIRM
}

export function isStoredImageObjectKey(ref: string): boolean {
  return !/^https?:\/\//i.test(ref.trim())
}

export interface UseImageUploadFieldOptions {
  entity: UploadTarget
  entityId: number
  userIdForInvalidation: number
  value: string | undefined
  onValueChange: (next: string | undefined) => void
  disabled?: boolean
}

export function useImageUploadField({
  entity,
  entityId,
  userIdForInvalidation,
  value,
  onValueChange,
  disabled = false,
}: UseImageUploadFieldOptions) {
  const inputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const uploadMutation = useDirectImageUploadMutation()
  const deleteMutation = useUploadDeleteMutation()

  const previewSrc = resolveR2PublicUrl(value)
  const busy = uploadMutation.isPending || deleteMutation.isPending
  const controlsDisabled = disabled || busy
  const hasValue = (value?.trim() ?? '') !== ''

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setLocalError(null)
    try {
      const result = await uploadMutation.mutateAsync({
        file,
        entity,
        entityId,
        userIdForInvalidation,
      })
      const next = result.objectKey?.trim()
      if (next) onValueChange(next)
    } catch (err) {
      setLocalError(resolveImageUploadFailureMessage(err))
    }
  }

  async function handleRemove() {
    setLocalError(null)
    const current = value?.trim()
    if (!current) {
      onValueChange(undefined)
      return
    }
    if (isStoredImageObjectKey(current)) {
      try {
        await deleteMutation.mutateAsync({
          payload: { entity, entityId, objectKey: current },
          userIdForInvalidation,
        })
      } catch (err) {
        setLocalError(resolveImageUploadFailureMessage(err))
        return
      }
    }
    onValueChange(undefined)
  }

  function openFilePicker() {
    fileInputRef.current?.click()
  }

  return {
    inputId,
    fileInputRef,
    localError,
    previewSrc,
    busy,
    controlsDisabled,
    hasValue,
    handleFileChange,
    handleRemove,
    openFilePicker,
  }
}
