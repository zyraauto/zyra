"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { CarIcon, ListIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const PUBLIC_LINKS = [
  { href: "/public/talleres",  labelKey: "nav.workshops" },
  { href: "/public/servicios", labelKey: "nav.services"  },
  { href: "/public/cotizador", labelKey: "nav.quoter"    },
];

export function Navbar() {
  const t        = useTranslations();
  const pathname = usePathname();
  const { profile, isAuthenticated, handleSignOut } = useAuth();
  const [open, setOpen] = useState(false);

  const dashboardHref = profile?.role
    ? `/${profile.role === "super_admin" ? "admin" : profile.role === "workshop_admin" ? "workshop" : profile.role}/dashboard`
    : "/auth/login";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <CarIcon weight="fill" className="size-6 text-primary" />
          <span>AutoService Pro</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {PUBLIC_LINKS.map(({ href, labelKey }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname.includes(href)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {t(labelKey)}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href={dashboardHref}>{t("nav.dashboard")}</Link>
              </Button>
              <Button size="sm" variant="outline" onClick={handleSignOut}>
                {t("nav.signOut")}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">{t("nav.login")}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/registro">{t("nav.register")}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <XIcon className="size-5" /> : <ListIcon className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t px-4 py-4 flex flex-col gap-3 bg-background">
          {PUBLIC_LINKS.map(({ href, labelKey }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium py-1"
              onClick={() => setOpen(false)}
            >
              {t(labelKey)}
            </Link>
          ))}
          <div className="pt-2 border-t flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Button size="sm" asChild>
                  <Link href={dashboardHref} onClick={() => setOpen(false)}>
                    {t("nav.dashboard")}
                  </Link>
                </Button>
                <Button size="sm" variant="outline" onClick={handleSignOut}>
                  {t("nav.signOut")}
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/auth/login" onClick={() => setOpen(false)}>
                    {t("nav.login")}
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/registro" onClick={() => setOpen(false)}>
                    {t("nav.register")}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}