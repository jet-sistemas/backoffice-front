import { CheckCircle, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

export function AdminHomePage() {
  const { user, signOut, isLoadingUser } = useAuth()

  if (isLoadingUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Autenticado com sucesso
          </h1>
          {user && (
            <p className="text-muted-foreground">
              Bem-vindo(a),{' '}
              <span className="font-medium text-foreground">{user.name}</span>
            </p>
          )}
        </div>

        <Button variant="outline" size="lg" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </main>
  )
}
