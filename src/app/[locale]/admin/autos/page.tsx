import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, CarIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import type { CarBrand } from "@/types";

export const metadata: Metadata = { title: "Cars Catalog" };

type BrandWithModels = CarBrand & { car_models: { id: string }[] };

export default async function AdminAutosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data } = await supabase
    .from("car_brands")
    .select("*, car_models (id)")
    .order("name");

  const list = (data ?? []) as BrandWithModels[];

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cars Catalog</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {list.length} brand{list.length !== 1 ? "s" : ""} registered.
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/autos/nueva">Add brand</Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((brand) => {
          const modelCount = brand.car_models?.length ?? 0;

          return (
            <Card key={brand.id}>
              <CardContent className="p-4 flex items-center gap-4">
                {/* Logo */}
                <div className="flex items-center justify-center size-12 rounded-xl bg-muted shrink-0 overflow-hidden">
                  {brand.logo_url ? (
                    <Image
                      src={brand.logo_url}
                      alt={brand.name}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  ) : (
                    <CarIcon className="size-6 text-muted-foreground" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{brand.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {modelCount} model{modelCount !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Status + action */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge variant={brand.is_active ? "default" : "secondary"}>
                    {brand.is_active ? "Active" : "Off"}
                  </Badge>
                  <Button variant="ghost" size="icon" className="size-7" asChild>
                    <Link href={`/admin/autos/${brand.id}`}>
                      <ArrowRightIcon className="size-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {list.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl text-muted-foreground">
            <CarIcon className="size-10 mb-3 opacity-30" />
            <p className="text-sm">No brands registered yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}