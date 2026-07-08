import type { ReactNode } from 'react'
import { LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

interface PortalLayoutProps {
  title: string
  children: ReactNode
}

export function PortalLayout({ title, children }: PortalLayoutProps) {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:px-6">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="J&T" className="size-6" />
          <h1 className="text-sm font-medium text-muted-foreground">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
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
      </header>

      <main className="p-4 md:p-6">{children}</main>
    </div>
  )
}
