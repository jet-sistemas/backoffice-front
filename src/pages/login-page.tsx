import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/hooks/use-login-mutation";
import { loginSchema, type LoginFormData } from "@/schemas/auth-schema";
import { Footer } from "@/components/layout/footer";

export function LoginPage() {
  const { mutate, isPending } = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  function onSubmit(data: LoginFormData) {
    mutate(data);
  }

  return (
    <main className="flex min-h-screen flex-col bg-background px-4">
      <div className="flex flex-1 flex-col items-center justify-center py-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex flex-col items-center gap-3">
            <img
              src="/logo_gradient.svg"
              alt="J&T Logo"
              className="h-16 w-auto"
            />
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="h-1.5 bg-primary-gradient" />

            <div className="p-6 pt-8">
              <div className="mb-6 text-center">
                <h1 className="font-serif text-2xl font-bold text-foreground">
                  Backoffice
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Acesse sua conta para continuar
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Associação Desportiva Artística e Cultural Joyce e Teatino
          </p>
        </div>
      </div>
      {/* <Footer /> */}
    </main>
  );
}
