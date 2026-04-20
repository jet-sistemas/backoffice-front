import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Outlet />
        <Toaster richColors closeButton position="top-right" />
      </div>
    </AuthProvider>
  ),
});
