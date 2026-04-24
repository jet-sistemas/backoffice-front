import { Loader2, Trash2, ImagePlus } from 'lucide-react'

import { useImageUploadField } from '@/hooks/use-image-upload-field'
import { cn } from '@/lib/utils'
import type { UploadTarget } from '@/types/upload'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

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
  const {
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
  } = useImageUploadField({
    entity,
    entityId,
    userIdForInvalidation,
    value,
    onValueChange,
    disabled,
  })

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <Label htmlFor={inputId} className="text-foreground">
            {label}
          </Label>
          {description ? (
            <p className="text-xs text-muted-foreground/90">{description}</p>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          'flex flex-col gap-4 rounded-lg border border-border bg-muted/40 p-4 sm:flex-row sm:items-center',
          'dark:bg-muted/25',
        )}
      >
        <div
          className={cn(
            'relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-foreground/20 bg-background shadow-inner',
            previewSrc && 'border-solid border-border',
          )}
        >
          {busy ? (
            <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
          ) : previewSrc ? (
            <img src={previewSrc} alt="" className="size-full object-cover" />
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
              variant="outline"
              size="sm"
              disabled={controlsDisabled}
              className={cn(
                'border-border bg-background font-medium text-foreground shadow-xs',
                'hover:bg-muted hover:text-foreground',
                'dark:border-input dark:bg-background dark:hover:bg-muted/60',
              )}
              onClick={openFilePicker}
            >
              {previewSrc ? 'Substituir imagem' : 'Selecionar imagem'}
            </Button>
            {hasValue && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={controlsDisabled}
                className="gap-1 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => void handleRemove()}
              >
                <Trash2 className="size-4" aria-hidden />
                Remover
              </Button>
            )}
          </div>
          <p className="text-xs text-foreground/70 dark:text-foreground/65">
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
