import type { ApiEnvelopeBase } from './auth'
import type { SponsorTierEnum } from './user'

export interface SponsorMinDTO {
  id: number
  publicName: string
  tier: SponsorTierEnum
  isActive: boolean
}

export interface BenefitDTO {
  id: number
  name: string
  description?: string
  address?: string
  isActive: boolean
  sponsor?: SponsorMinDTO
  createdAt?: string
}

export interface BenefitCreateDTO {
  name: string
  description?: string
  address?: string
  sponsorId: number | null
}

export interface BenefitUpdateDTO {
  name?: string
  description?: string
  address?: string
  sponsorId?: number | null
}

export interface BenefitListParams {
  page: number
  size: number
  isActive?: boolean
  sponsorId?: number
}

export interface PaginatedBenefitsResponse extends ApiEnvelopeBase {
  data: BenefitDTO[]
}

export interface EnvelopeBenefitDTO extends ApiEnvelopeBase {
  data?: BenefitDTO | null
}
