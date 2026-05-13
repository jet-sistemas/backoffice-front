import type { ApiEnvelopeBase, UserTypeEnum } from "./auth";
import type { MemberCreateDTO, MemberDTO, MemberTypeEnum } from "./member";

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
  member?: MemberDTO;
}

export interface UserListParams {
  type?: UserTypeEnum;
  tier?: SponsorTierEnum;
  entityType?: EntityTypeEnum;
  persona?: SponsorPersonaEnum;
  isActive?: boolean;
  /** Busca no servidor: nome da conta, nome público, documento ou código */
  search?: string;
  memberType?: MemberTypeEnum;
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
  member?: MemberCreateDTO["member"];
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
