import type { ApiEnvelopeBase } from '@/types/auth'

export type UploadTarget = 'user' | 'sponsor'

export interface UploadInitDTO {
  entity: UploadTarget
  entityId: number
  fileName?: string
  contentType: string
  size: number
}

export interface UploadInitResponseDTO {
  objectKey: string
  uploadUrl: string
  publicUrl?: string
  expiresIn?: number
}

export interface UploadConfirmDTO {
  entity: UploadTarget
  entityId: number
  objectKey: string
}

export interface UploadConfirmResponseDTO {
  id?: number
  entity?: string
  entityId?: number
  objectKey: string
  url?: string
}

export interface UploadDeleteDTO {
  entity: UploadTarget
  entityId: number
  objectKey: string
}

export interface UploadDeleteResponseDTO {
  success?: boolean
}

export interface EnvelopeUploadInitDTO extends ApiEnvelopeBase {
  data?: UploadInitResponseDTO | null
}

export interface EnvelopeUploadConfirmDTO extends ApiEnvelopeBase {
  data?: UploadConfirmResponseDTO | null
}

export interface EnvelopeUploadDeleteDTO extends ApiEnvelopeBase {
  data?: UploadDeleteResponseDTO | null
}
