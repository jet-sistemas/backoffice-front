import { useId, useRef, useState } from 'react'
import { AxiosError } from 'axios'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'

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
import { cn } from '@/lib/utils'
import type { UploadTarget } from '@/types/upload'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const KNOWN_UPLOAD_MESSAGES = new Set([
  IMAGE_UPLOAD_ERROR_INVALID_TYPE,
  IMAGE_UPLOAD_ERROR_TOO_LARGE,
  IMAGE_UPLOAD_ERROR_EXPIRED,
  IMAGE_UPLOAD_ERROR_NETWORK,
  IMAGE_UPLOAD_ERROR_CONFIRM,
])

function resolveUploadFailureMessage(error: unknown): string {
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

export interface ImageUploadFieldProps {
  entity: UploadTarget
  entityId: number
  userIdForInvalidation: number
  value: string | undefined
  onValueChange: (next: string | undefined) => void
  label: string
  description?: string
  disabled?: boolean
}

export function ImageUploadField({
  entity,
  entityId,
  userIdForInvalidation,
  value,
  onValueChange,
  label,
  description,
  disabled = false,
}: ImageUploadFieldProps) {
  const inputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const uploadMutation = useDirectImageUploadMutation()
  const deleteMutation = useUploadDeleteMutation()

  const previewSrc = resolveR2PublicUrl(value)
  const busy = uploadMutation.isPending || deleteMutation.isPending
  const controlsDisabled = disabled || busy

  function isStoredObjectKey(ref: string): boolean {
    return !/^https?:\/\//i.test(ref.trim())
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
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
      setLocalError(resolveUploadFailureMessage(err))
    }
  }

  async function handleRemove() {
    setLocalError(null)
    const current = value?.trim()
    if (!current) {
      onValueChange(undefined)
      return
    }
    if (isStoredObjectKey(current)) {
      try {
        await deleteMutation.mutateAsync({
          payload: { entity, entityId, objectKey: current },
          userIdForInvalidation,
        })
      } catch (err) {
        setLocalError(resolveUploadFailureMessage(err))
        return
      }
    }
    onValueChange(undefined)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <Label htmlFor={inputId}>{label}</Label>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          'flex flex-col gap-4 rounded-lg border border-border bg-card/50 p-4 shadow-sm sm:flex-row sm:items-center',
        )}
      >
        <div
          className={cn(
            'relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-muted-foreground/25 bg-muted/40',
            previewSrc && 'border-solid',
          )}
        >
          {busy ? (
            <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
          ) : previewSrc ? (
            <img
              src={previewSrc}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <ImagePlus className="size-8 text-muted-foreground" aria-hidden />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            disabled={controlsDisabled}
            onChange={(e) => void handleFileChange(e)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={controlsDisabled}
              className="transition-colors duration-200"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewSrc ? 'Substituir imagem' : 'Selecionar imagem'}
            </Button>
            {(value?.trim() ?? '') !== '' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={controlsDisabled}
                className="gap-1 text-destructive hover:bg-destructive/10"
                onClick={() => void handleRemove()}
              >
                <Trash2 className="size-4" aria-hidden />
                Remover
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            PNG, JPG ou WebP. Máximo 5 MB.
          </p>
        </div>
      </div>

      {localError ? (
        <p className="text-sm text-destructive" role="alert">
          {localError}
        </p>
      ) : null}
    </div>
  )
}
