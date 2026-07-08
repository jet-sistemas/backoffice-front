import type { ApiEnvelopeBase, UserTypeEnum } from "./auth";
import type { AccountValidationStatusEnum } from "./account-validation";
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

export interface UserBaseDTO {
  id: number;
  email: string;
  name: string;
  document: string;
  code: string;
  type: UserTypeEnum;
  accountActive: boolean;
  avatarUrl?: string;
  createdAt: string;
  emailVerifiedAt?: string | null;
  mustChangePassword?: boolean;
  accountValidationStatus?: AccountValidationStatusEnum;
  canResendInvite?: boolean;
}

export interface UserWithSponsorDTO extends UserBaseDTO {
  sponsor?: SponsorDTO;
}

export interface UserWithMemberDTO extends UserBaseDTO {
  member?: MemberDTO;
}

export type UserDetailDTO = UserWithSponsorDTO | UserWithMemberDTO;

export function isUserWithSponsor(
  user: UserDetailDTO,
): user is UserWithSponsorDTO {
  return user.type === "SPONSOR" || user.type === "SPONSOR_MEMBER";
}

export function isUserWithMember(
  user: UserDetailDTO,
): user is UserWithMemberDTO {
  return user.type === "MEMBER";
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
  data: UserDetailDTO[];
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

export interface EnvelopeUserDetailDTO extends ApiEnvelopeBase {
  data?: UserDetailDTO | null;
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

export interface MemberDataUpdateDTO {
  fullname?: string;
  whatsapp?: string;
}

export interface UserWithSponsorUpdateDTO {
  email?: string;
  name?: string;
  document?: string;
  avatarUrl?: string;
  sponsor?: SponsorDataUpdateDTO;
  member?: MemberDataUpdateDTO;
}
