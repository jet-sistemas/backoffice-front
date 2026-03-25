import type { ApiEnvelopeBase, UserTypeEnum } from './auth'

export type SponsorTierEnum = 'BRONZE' | 'PRATA' | 'OURO'

export type EntityTypeEnum = 'PERSON' | 'COMPANY'

export interface SponsorDTO {
  id: number
  publicName: string
  tier: SponsorTierEnum
  entityType: EntityTypeEnum
  persona?: string
  isActive: boolean
  lastActiveSponsorship?: string
  logoUrl?: string
}

export interface UserWithSponsorDTO {
  id: number
  email: string
  name: string
  document: string
  code: string
  type: UserTypeEnum
  isAccountActive: boolean
  avatarUrl?: string
  createdAt: string
  sponsor?: SponsorDTO
}

export interface UserListParams {
  type?: UserTypeEnum
  tier?: SponsorTierEnum
  isActive?: boolean
  page: number
  size: number
}

export interface PaginatedUsersResponse extends ApiEnvelopeBase {
  data: UserWithSponsorDTO[]
}

export interface UserWithSponsorCreateDTO {
  user: {
    email: string
    name: string
    document: string
    code: string
    type: UserTypeEnum
  }
  sponsor?: {
    publicName: string
    tier: SponsorTierEnum
    entityType: EntityTypeEnum
    persona?: string
  }
}
