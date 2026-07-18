import type { ApiEnvelopeBase } from './auth'

export type AccountValidationStatusEnum =
  | 'NOT_APPLICABLE'
  | 'PENDING'
  | 'INVITE_EXPIRED'
  | 'PASSWORD_CHANGE_PENDING'
  | 'VALIDATED'

export interface AccountValidationRequestDTO {
  token: string
  code: string
  document: string
}

export interface AccountValidationResultDTO {
  email: string
  accountActive: boolean
  mustChangePassword: boolean
}

export interface EnvelopeAccountValidationResultDTO extends ApiEnvelopeBase {
  data?: AccountValidationResultDTO | null
}

export interface ResendAccountValidationDTO {
  userId: number
  sent: boolean
  accountValidationStatus: AccountValidationStatusEnum
  resendType?: 'INVITE' | 'TEMPORARY_PASSWORD'
}

export interface EnvelopeResendAccountValidationDTO extends ApiEnvelopeBase {
  data?: ResendAccountValidationDTO | null
}
