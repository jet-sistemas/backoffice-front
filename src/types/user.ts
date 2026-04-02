import type { ApiEnvelopeBase, UserTypeEnum } from "./auth";

export type SponsorTierEnum = "OURO" | "PRATA" | "BRONZE";

export type SponsorTierApiEnum = "GOLD" | "SILVER" | "BRONZE";

export type EntityTypeEnum = "PERSON" | "COMPANY" | "GOVERNMENT" | "NGO";

export type SponsorPersonaEnum =
  | "POLITICIAN"
  | "INFLUENCER"
  | "ATHLETE"
  | "OTHER";

export interface SponsorDTO {
  id: number;
  publicName: string;
  tier: SponsorTierEnum;
  entityType: EntityTypeEnum;
  persona?: string;
  isActive: boolean;
  lastActiveSponsorship?: string;
  logoUrl?: string;
  site?: string;
  instagram?: string;
  whatsapp?: string;
}

export interface UserWithSponsorDTO {
  id: number;
  email: string;
  name: string;
  document: string;
  code: string;
  type: UserTypeEnum;
  accountActive: boolean;
  avatarUrl?: string;
  createdAt: string;
  sponsor?: SponsorDTO;
}

export interface UserListParams {
  type?: UserTypeEnum;
  tier?: SponsorTierEnum;
  isActive?: boolean;
  page: number;
  size: number;
}

export interface PaginatedUsersResponse extends ApiEnvelopeBase {
  data: UserWithSponsorDTO[];
}

export interface UserWithSponsorCreateDTO {
  user: {
    email: string;
    name: string;
    document: string;
    code: string;
    type: UserTypeEnum;
  };
  sponsor?: {
    publicName: string;
    tier: SponsorTierEnum;
    entityType: EntityTypeEnum;
    persona?: SponsorPersonaEnum;
    logoUrl?: string;
    site?: string;
    instagram?: string;
    whatsapp?: string;
  };
}

export interface EnvelopeUserWithSponsorDTO extends ApiEnvelopeBase {
  data?: UserWithSponsorDTO | null;
}

export interface SponsorDataUpdateDTO {
  publicName?: string;
  tier?: SponsorTierEnum;
  entityType?: EntityTypeEnum;
  persona?: SponsorPersonaEnum;
  logoUrl?: string;
  site?: string;
  instagram?: string;
  whatsapp?: string;
  isActive?: boolean;
}

export interface UserWithSponsorUpdateDTO {
  email?: string;
  name?: string;
  document?: string;
  avatarUrl?: string;
  sponsor?: SponsorDataUpdateDTO;
}
