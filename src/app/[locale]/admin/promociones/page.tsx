import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PromoCard } from "@/components/loyalty/PromoCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import type { Promotion } from "@/types";

export const metadata: Metadata = { title: "Promotions" };

export default async function AdminPromocionesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: promos } = await supabase
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false });

  const list   = (promos ?? []) as Promotion[];
  const active = list.filter((p) => p.is_active);
  const inactive = list.filter((p) => !p.is_active);

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Promotions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {active.length} active · {inactive.length} inactive
          </p>
        </div>
        <Button size="sm">
          <TagIcon className="size-4" />
          New promotion
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active
            <span className="ml-1.5 text-[10px] bg-muted rounded-full px-1.5 py-0.5">
              {active.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inactive
            <span className="ml-1.5 text-[10px] bg-muted rounded-full px-1.5 py-0.5">
              {inactive.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {[
          { value: "active",   items: active   },
          { value: "inactive", items: inactive },
        ].map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {tab.items.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <TagIcon className="size-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No {tab.value} promotions.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {tab.items.map((p) => (
                  <PromoCard key={p.id} promo={p} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}