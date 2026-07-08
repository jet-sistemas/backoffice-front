import type { UserResponse, UserTypeEnum } from '@/types/auth'

export function resolvePostLoginPath(type: UserTypeEnum | undefined): string {
  if (type === 'ADM') return '/admin/patrocinadores'
  if (type === 'MEMBER') return '/membro'
  if (type === 'SPONSOR' || type === 'SPONSOR_MEMBER') return '/patrocinador'
  return '/login'
}

export function resolvePostAuthPath(
  user: Pick<UserResponse, 'type' | 'mustChangePassword'> | null | undefined,
): string {
  if (!user) return '/login'
  if (user.mustChangePassword) return '/alterar-senha-obrigatoria'
  return resolvePostLoginPath(user.type)
}
