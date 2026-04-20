import type { SponsorTierApiEnum, SponsorTierEnum } from '@/types/user'

const SPONSOR_TIER_TO_API: Record<SponsorTierEnum, SponsorTierApiEnum> = {
  OURO: 'GOLD',
  PRATA: 'SILVER',
  BRONZE: 'BRONZE',
}

const SPONSOR_TIER_FROM_API: Record<SponsorTierApiEnum, SponsorTierEnum> = {
  GOLD: 'OURO',
  SILVER: 'PRATA',
  BRONZE: 'BRONZE',
}

export function sponsorTierToApi(tier: SponsorTierEnum): SponsorTierApiEnum {
  return SPONSOR_TIER_TO_API[tier]
}

export function sponsorTierFromApi(
  tier: string | undefined,
): SponsorTierEnum | undefined {
  if (tier == null) return undefined
  if (tier === 'OURO' || tier === 'PRATA' || tier === 'BRONZE') {
    return tier
  }
  return SPONSOR_TIER_FROM_API[tier as SponsorTierApiEnum]
}
