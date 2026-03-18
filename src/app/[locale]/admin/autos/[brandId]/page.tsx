import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftIcon, CarIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import type { CarBrand } from "@/types";

export const metadata: Metadata = { title: "Brand Details" };

type CarYearRow = {
  id:            string;
  year:          number;
  engine_config: string | null;
  transmission:  string | null;
  fuel_type:     string | null;
};

type ModelWithYears = {
  id:        string;
  name:      string;
  body_type: string | null;
  car_years: CarYearRow[];
};

type BrandWithModels = CarBrand & { car_models: ModelWithYears[] };

type Params = { params: { brandId: string } };

export default async function AdminBrandPage({ params }: Params) {
  const { brandId } = params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data } = await supabase
    .from("car_brands")
    .select(`
      *,
      car_models (
        id,
        name,
        body_type,
        car_years (
          id,
          year,
          engine_config,
          transmission,
          fuel_type
        )
      )
    `)
    .eq("id", brandId)
    .single();

  if (!data) notFound();

  const brand      = data as BrandWithModels;
  const models     = brand.car_models ?? [];
  const totalYears = models.reduce((s, m) => s + m.car_years.length, 0);

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Back */}
      <Button variant="ghost" size="sm" className="w-fit -ml-2" asChild>
        <Link href="/admin/autos">
          <ArrowLeftIcon className="size-4" />
          Back to catalog
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center size-16 rounded-xl bg-muted shrink-0 overflow-hidden">
          {brand.logo_url ? (
            <Image
              src={brand.logo_url}
              alt={brand.name}
              width={48}
              height={48}
              className="object-contain"
            />
          ) : (
            <CarIcon className="size-8 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{brand.name}</h1>
            <Badge variant={brand.is_active ? "default" : "secondary"}>
              {brand.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            {models.length} model{models.length !== 1 ? "s" : ""} ·{" "}
            {totalYears} year configuration{totalYears !== 1 ? "s" : ""}
          </p>
        </div>

        <Button size="sm" className="shrink-0">
          <PlusIcon className="size-4" />
          Add model
        </Button>
      </div>

      {/* Models */}
      {models.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <CarIcon className="size-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No models for this brand yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {models.map((model) => (
            <Card key={model.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {model.name}
                    {model.body_type && (
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {model.body_type}
                      </Badge>
                    )}
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {model.car_years.length} year{model.car_years.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </CardHeader>

              {model.car_years.length > 0 && (
                <>
                  <Separator />
                  <CardContent className="pt-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {model.car_years
                        .sort((a, b) => b.year - a.year)
                        .map((yr) => (
                          <div
                            key={yr.id}
                            className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50 border"
                          >
                            <p className="font-bold text-sm">{yr.year}</p>
                            <div className="flex flex-wrap gap-1">
                              {yr.engine_config && (
                                <Badge variant="secondary" className="text-[10px]">
                                  {yr.engine_config}
                                </Badge>
                              )}
                              {yr.transmission && (
                                <Badge variant="outline" className="text-[10px] capitalize">
                                  {yr.transmission}
                                </Badge>
                              )}
                              {yr.fuel_type && (
                                <Badge variant="outline" className="text-[10px] capitalize">
                                  {yr.fuel_type}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}