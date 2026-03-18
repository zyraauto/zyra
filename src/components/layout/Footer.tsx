import Link from "next/link";
import { CarIcon } from "@phosphor-icons/react/dist/ssr";

const LINKS = {
  company: [
    { href: "/public/talleres",  label: "Workshops"  },
    { href: "/public/servicios", label: "Services"   },
    { href: "/public/cotizador", label: "Get a Quote" },
  ],
  account: [
    { href: "/auth/login",    label: "Sign In"  },
    { href: "/auth/registro", label: "Register" },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {/* Brand */}
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-base">
            <CarIcon weight="fill" className="size-5 text-primary" />
            AutoService Pro
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">
            Your trusted workshop, always nearby.
          </p>
        </div>

        {/* Company */}
        <div>
          <p className="text-sm font-semibold mb-3">Explore</p>
          <ul className="flex flex-col gap-2">
            {LINKS.company.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div>
          <p className="text-sm font-semibold mb-3">Account</p>
          <ul className="flex flex-col gap-2">
            {LINKS.account.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {year} AutoService Pro. All rights reserved.
      </div>
    </footer>
  );
}