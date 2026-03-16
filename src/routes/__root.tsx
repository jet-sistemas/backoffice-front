import { Outlet, RootRoute } from '@tanstack/react-router'

export const Route = new RootRoute({
  component: () => (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
    </div>
  ),
})

