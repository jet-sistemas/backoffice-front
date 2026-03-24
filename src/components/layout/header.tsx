"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { navLinks } from "@/lib/data";
import { cn } from "@/lib/utils";
import { GradientSecondaryToRed } from "../ui/gradients/secondary-to-red";
import { useTheme } from "next-themes";

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const { theme } = useTheme();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-bg-primary-gradient",
          isScrolled
            ? "bg-primary/95 dark:bg-muted/95 backdrop-blur-md shadow-sm border-b"
            : "bg-primary dark:bg-muted"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo_jet_fenix.svg"
                alt="J&T Associação"
                width={48}
                height={48}
                className="size-10 md:size-12"
                priority
              />
              <span className="hidden font-serif text-lg font-bold text-jet-red sm:inline-block md:text-xl sm:self-end">
                J&T
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-white transition-colors hover:text-secondary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden items-center gap-3 lg:flex">
              <ThemeToggle />
              <Button
                asChild
                variant="secondary"
                size="lg"
                className={cn("gradient-gold-accent-glow")}
              >
                <Link href="#pre-cadastro">Torne-se um Parceiro</Link>
              </Button>
            </div>

            {/* Mobile Menu */}
            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle />
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="size-5 text-white" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px]">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Image
                        src="/logo_gradient.svg"
                        alt="J&T Associação"
                        width={32}
                        height={32}
                      />
                      <span className="font-serif">J&T Associação</span>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="mt-8 flex flex-col gap-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="rounded-md px-4 py-3 text-base font-medium text-foreground/80 transition-colors hover:bg-accent/10 hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                    <div className="mt-4 border-t pt-4">
                      <Button
                        asChild
                        variant="accent"
                        size="lg"
                        className="w-full"
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href="#pre-cadastro">Torne-se um Parceiro</Link>
                      </Button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
        <GradientSecondaryToRed />
      </header>
    </>
  );
}
