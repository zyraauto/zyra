import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pricing" };

export default async function AdminPreciosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: prices } = await supabase
    .from("service_prices")
    .select(`
      *,
      services (name, category),
      car_years (
        year,
        car_models (name, car_brands (name))
      )
    `)
    .order("updated_at", { ascending: false });

  const list = prices ?? [];

  // Group by service
  const byService: Record<string, typeof list> = {};
  list.forEach((p) => {
    const name = (p as never as { services: { name: string } }).services?.name ?? "Unknown";
    if (!byService[name]) byService[name] = [];
    byService[name].push(p);
  });

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pricing</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {list.length} price{list.length !== 1 ? "s" : ""} configured.
        </p>
      </div>

      {Object.entries(byService).map(([serviceName, rows]) => (
        <Card key={serviceName}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              {serviceName}
              <Badge variant="secondary" className="text-[10px]">
                {rows.length} vehicle{rows.length !== 1 ? "s" : ""}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col divide-y">
              {rows.map((row) => {
                const r = row as never as {
                  id: string;
                  base_price: number;
                  parts_included: boolean;
                  car_years: {
                    year: number;
                    car_models: { name: string; car_brands: { name: string } };
                  };
                };
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between py-2.5 gap-4"
                  >
                    <p className="text-sm">
                      {r.car_years?.car_models?.car_brands?.name}{" "}
                      {r.car_years?.car_models?.name}{" "}
                      {r.car_years?.year}
                    </p>
                    <div className="flex items-center gap-3 shrink-0">
                      {r.parts_included && (
                        <Badge variant="outline" className="text-[10px]">
                          Parts incl.
                        </Badge>
                      )}
                      <p className="font-bold">
                        ${Number(r.base_price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {list.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-sm">No prices configured yet.</p>
            <p className="text-xs mt-1">
              Use the API to add prices per service + vehicle year.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}