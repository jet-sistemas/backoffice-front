import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import { CreditCard, Gift, History, LogOut, Wallet } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { useMemberCardQuery } from '@/hooks/use-member-card-query'
import { cn } from '@/lib/utils'

const BASE_NAV = [
  { to: '/membro/carteirinha', label: 'Carteirinha', icon: CreditCard },
  { to: '/membro/historico', label: 'Histórico', icon: History },
  { to: '/membro/beneficios', label: 'Benefícios', icon: Gift },
] as const

const SUBSCRIBER_NAV = {
  to: '/membro/conta',
  label: 'Situação da conta',
  icon: Wallet,
} as const

export function MemberLayout() {
  const { user, signOut } = useAuth()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { data: card } = useMemberCardQuery()

  const nav =
    card?.memberType === 'SUBSCRIBER'
      ? [BASE_NAV[0], SUBSCRIBER_NAV, BASE_NAV[1], BASE_NAV[2]]
      : [...BASE_NAV]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="J&T" className="size-6" />
            <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
              Área do Associado
            </span>
          </div>

          <nav className="flex items-center gap-1">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || pathname.startsWith(`${to}/`)
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
                    active
                      ? 'bg-muted font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  )}
                >
                  <Icon className="size-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Sair"
              onClick={() => signOut()}
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  )
}
