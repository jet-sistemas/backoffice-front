import { Link } from "@tanstack/react-router";
import {
  MessageCircle,
  Mail,
  MapPin,
  Instagram,
  Heart,
  ArrowUpRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { navLinks, contactInfo } from "@/lib/data";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="contato"
      className="relative overflow-hidden bg-primary dark:bg-background text-primary-foreground dark:text-primary-foreground"
    >
      {/* Decorative top border */}
      <div className="h-1 bg-linear-to-r from-secondary via-accent to-primary" />

      {/* Main footer content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src="/logo.svg"
                alt="J&T Associação"
                width={48}
                height={48}
                loading="lazy"
                decoding="async"
                className="size-12"
              />
              <div>
                <span className="font-serif text-secondary text-2xl font-bold">
                  Associação J&T
                </span>
                <p className="text-sm text-accent">Joyce e Teatino</p>
              </div>
            </Link>
            <p className="mt-4 max-w-md text-primary-foreground/80">
              Nascemos do amor pelo vôlei e pelo propósito de desenvolver
              talentos no esporte, na arte e na cultura em todo o sul do Piauí.
              Venha fazer parte dessa família!
            </p>

            {/* Social links */}
            <div className="mt-6 flex gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant="secondary"
                      size="icon"
                      className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
                    >
                      <a
                        href={contactInfo.instagramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                      >
                        <Instagram className="size-5" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Instagram</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant="secondary"
                      size="icon"
                      className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
                    >
                      <a
                        href={contactInfo.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="WhatsApp"
                      >
                        <MessageCircle className="size-5" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>WhatsApp</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-4 font-serif text-lg font-semibold">
              Links Rápidos
            </h4>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="group inline-flex items-center gap-1 text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                >
                  {link.label}
                  <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
              <Link
                to="/"
                hash="pre-cadastro"
                className="group inline-flex items-center gap-1 font-medium text-secondary transition-colors hover:text-secondary/80"
              >
                Torne-se um Parceiro
                <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </nav>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="mb-4 font-serif text-lg font-semibold">Contato</h4>
            <div className="flex flex-col gap-4">
              <a
                href={`${contactInfo.whatsappLink}?text=${encodeURIComponent(
                  "Olá! Gostaria de mais informações sobre a Associação J&T.",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 text-primary-foreground/70 transition-colors hover:text-primary-foreground"
              >
                <MessageCircle className="mt-0.5 size-5 shrink-0 text-green-400" />
                <div>
                  <p className="font-medium text-primary-foreground">
                    WhatsApp
                  </p>
                  <p>{contactInfo.whatsapp}</p>
                </div>
              </a>

              <a
                href={`mailto:${contactInfo.email}`}
                className="group flex items-start gap-3 text-primary-foreground/70 transition-colors hover:text-primary-foreground"
              >
                <Mail className="mt-0.5 size-5 shrink-0 text-accent" />
                <div>
                  <p className="font-medium text-primary-foreground">E-mail</p>
                  <p>{contactInfo.email}</p>
                </div>
              </a>

              <div className="flex items-start gap-3 text-primary-foreground/70">
                <MapPin className="mt-0.5 size-5 shrink-0 text-secondary" />
                <div>
                  <p className="font-medium text-primary-foreground">
                    Localização
                  </p>
                  <p>{contactInfo.address}</p>
                </div>
              </div>

              <a
                href={contactInfo.instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 text-primary-foreground/70 transition-colors hover:text-primary-foreground"
              >
                <Instagram className="mt-0.5 size-5 shrink-0 text-pink-400" />
                <div>
                  <p className="font-medium text-primary-foreground">
                    Instagram
                  </p>
                  <p>{contactInfo.instagram}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
          <p className="text-center text-sm text-primary-foreground/60">
            © {currentYear} Associação Desportiva, Artística e Cultural J&T.
            Todos os direitos reservados.
          </p>
          <p className="flex items-center gap-1 text-sm text-primary-foreground/60">
            Feito com <Heart className="size-4 fill-accent text-accent" /> no
            sul do Piauí
          </p>
        </div>
      </div>
    </footer>
  );
}
