import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CarIcon,
  WrenchIcon,
  MapPinIcon,
  StarIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ClockIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { Metadata } from "next";
import type { Tables } from "@/types/database";

export const metadata: Metadata = {
  title:       "AutoService Pro — Your trusted workshop",
  description: "Book car services, get instant quotes and track your repairs.",
};

type ServiceRow  = Tables<"services">;
type WorkshopRow = Tables<"workshops">;

export default async function HomePage() {
  const supabase = await createClient();

  const [servicesResult, workshopsResult] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, category, description, duration_minutes")
      .eq("is_active", true)
      .order("sort_order")
      .limit(4),
    supabase
      .from("workshops")
      .select("id, name, city, rating, address")
      .eq("is_active", true)
      .order("rating", { ascending: false })
      .limit(3),
  ]);

  const services  = (servicesResult.data  as Pick<ServiceRow,  "id" | "name" | "category" | "description" | "duration_minutes">[]) ?? [];
  const workshops = (workshopsResult.data as Pick<WorkshopRow, "id" | "name" | "city"     | "rating"      | "address">[])          ?? [];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-background py-20 px-4">
        <div className="mx-auto max-w-4xl text-center flex flex-col items-center gap-6">
          <Badge variant="secondary" className="gap-1.5">
            <ShieldCheckIcon weight="fill" className="size-3.5 text-primary" />
            Trusted by thousands of drivers
          </Badge>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Your car deserves
            <span className="text-primary"> the best care</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl">
            Get instant quotes, book certified workshops, and track your
            service — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" asChild>
              <Link href="/public/cotizador">
                Get a free quote
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/public/talleres">
                Find a workshop
                <MapPinIcon className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
            {[
              { icon: <StarIcon weight="fill" className="size-4 text-yellow-500" />, label: "4.8 avg rating"       },
              { icon: <WrenchIcon className="size-4" />,                             label: "Certified mechanics"  },
              { icon: <ClockIcon className="size-4" />,                              label: "Same-day service"     },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                {icon}
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold">How it works</h2>
            <p className="text-muted-foreground mt-2">
              Book a service in under 2 minutes.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step:  "1",
                title: "Select your car",
                desc:  "Choose your brand, model and year from our catalog.",
                icon:  <CarIcon weight="fill" className="size-6 text-primary" />,
              },
              {
                step:  "2",
                title: "Pick a service",
                desc:  "Get an instant price estimate for any service.",
                icon:  <WrenchIcon weight="fill" className="size-6 text-primary" />,
              },
              {
                step:  "3",
                title: "Book & track",
                desc:  "Choose a workshop, pick a time, and track your repair.",
                icon:  <ArrowRightIcon weight="fill" className="size-6 text-primary" />,
              },
            ].map(({ step, title, desc, icon }) => (
              <div
                key={step}
                className="flex flex-col items-center text-center gap-3 p-6 rounded-xl bg-card border"
              >
                <div className="flex items-center justify-center size-12 rounded-full bg-primary/10">
                  {icon}
                </div>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services preview */}
      {services.length > 0 && (
        <section className="py-16 px-4">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">Our services</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Professional care for every vehicle.
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/public/servicios">
                  View all <ArrowRightIcon className="size-3" />
                </Link>
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {services.map((svc) => (
                <Link
                  key={svc.id}
                  href={`/public/servicios/${svc.id}`}
                  className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
                    <WrenchIcon className="size-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{svc.name}</p>
                    {svc.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {svc.description}
                      </p>
                    )}
                    {svc.duration_minutes && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <ClockIcon className="size-3" />
                        {svc.duration_minutes} min
                      </p>
                    )}
                  </div>
                  <ArrowRightIcon className="size-4 text-muted-foreground shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Workshops preview */}
      {workshops.length > 0 && (
        <section className="py-16 px-4 bg-muted/30">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">Top workshops</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Certified and highly rated near you.
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/public/talleres">
                  View all <ArrowRightIcon className="size-3" />
                </Link>
              </Button>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {workshops.map((w) => (
                <Link
                  key={w.id}
                  href={`/public/talleres/${w.id}`}
                  className="flex flex-col gap-2 p-4 rounded-xl border bg-card hover:bg-accent transition-colors"
                >
                  <p className="font-medium">{w.name}</p>
                  {w.address && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPinIcon className="size-3 shrink-0" />
                      {w.address}
                    </p>
                  )}
                  {w.rating !== null && w.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <StarIcon weight="fill" className="size-3 text-yellow-500" />
                      <span className="text-xs font-medium">{w.rating.toFixed(1)}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="mx-auto max-w-xl flex flex-col items-center gap-4">
          <CarIcon weight="fill" className="size-12 text-primary" />
          <h2 className="text-2xl font-bold">Ready to get started?</h2>
          <p className="text-muted-foreground">
            Join thousands of drivers who trust AutoService Pro for their car maintenance.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/registro">
              Create free account
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}