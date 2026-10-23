import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { PackageIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Orders" };

export default async function SupplierOrdenesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Purchase orders for your parts supply.
        </p>
      </div>

      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <PackageIcon className="size-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Orders will appear here soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}