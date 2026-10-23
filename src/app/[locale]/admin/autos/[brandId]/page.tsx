import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, CarIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Brand detail" };

const LOGO_BUCKET = "logos"; // <-- el mismo nombre que en el listado

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AdminBrandDetailPage({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = await params;

  // Evita que rutas como /admin/autos/nueva se traten como un id
  if (!UUID_RE.test(brandId)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: brand } = await supabase
    .from("car_brands")
    .select("*")
    .eq("id", brandId)
    .maybeSingle();

  if (!brand) notFound();

  const { data: models } = await supabase
    .from("car_models")
    .select("id, name")
    .eq("brand_id", brandId)
    .order("name");

  const logoSrc = brand.logo_webp_path
    ? supabase.storage.from(LOGO_BUCKET).getPublicUrl(brand.logo_webp_path).data.publicUrl
    : brand.logo_url_fallback;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <Button variant="ghost" size="sm" className="w-fit -ml-2" asChild>
        <Link href="/admin/autos">
          <ArrowLeftIcon className="size-4 mr-1" />
          Cars Catalog
        </Link>
      </Button>

      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center size-16 rounded-xl bg-muted shrink-0 overflow-hidden">
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={brand.name}
              width={56}
              height={56}
              className="object-contain"
            />
          ) : (
            <CarIcon className="size-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">{brand.name}</h1>
          <p className="text-sm text-muted-foreground">{brand.slug}</p>
        </div>
        <Badge variant={brand.is_active ? "default" : "secondary"}>
          {brand.is_active ? "Active" : "Off"}
        </Badge>
      </div>

      <Card>
        <CardContent className="p-4 grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Country</p>
            <p>{brand.country ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Vehicle types</p>
            <p>{brand.vehicle_types?.join(", ") || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Founded</p>
            <p>{brand.founded_year ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Discontinued</p>
            <p>{brand.discontinued_year ?? "—"}</p>
          </div>
          {brand.website_url && (
            <div className="sm:col-span-2">
              <p className="text-muted-foreground text-xs">Website</p>
              <a
                href={brand.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {brand.website_url}
              </a>
            </div>
          )}
          {brand.description && (
            <div className="sm:col-span-2">
              <p className="text-muted-foreground text-xs">Description</p>
              <p>{brand.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          Models ({models?.length ?? 0})
        </h2>
        {models && models.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-2">
            {models.map((m) => (
              <Card key={m.id}>
                <CardContent className="p-3 text-sm">{m.name}</CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No models registered.</p>
        )}
      </div>
    </div>
  );
}