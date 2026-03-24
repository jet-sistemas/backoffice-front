export interface AuthCreateDTO {
  email: string
  password: string
}

export type ApiStatus = 'OK' | 'ERROR'

export interface ApiEnvelopeBase {
  status: ApiStatus
  statusCode: number
  message?: string
  messages?: string[]
  totalElements?: number
  totalPages?: number
  pageSize?: number
  currentPage?: number
  stackTrace?: string[]
}

export interface AuthDTO {
  accessToken: string
}

export interface EnvelopeAuthDTO extends ApiEnvelopeBase {
  data?: AuthDTO | null
}

export type UserTypeEnum = 'ADM' | 'SPONSOR' | 'MEMBER' | 'SPONSOR_MEMBER'

export interface AuthExtDTO {
  id: number
  email: string
  name: string
  avatarUrl: string
  type: UserTypeEnum
  createdAt: string
  isAccountActive: boolean
}

export interface EnvelopeAuthExtDTO extends ApiEnvelopeBase {
  data?: AuthExtDTO | null
}

export type UserResponse = AuthExtDTO
