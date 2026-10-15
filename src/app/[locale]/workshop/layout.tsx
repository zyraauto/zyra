import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { NotifBell } from "@/components/shared/NotifBell";
import { Separator } from "@/components/ui/separator";

// Roles con acceso al ERP del taller.
//  - "owner" / "admin": claim app_metadata.role que escribe provisionTenant().
//  - "workshop": valor que provision_tenant() guarda en profiles.role del dueño.
//  - "workshop_admin" / "super_admin": roles anteriores, se conservan por compatibilidad.
const ALLOWED_ROLES = new Set(["owner", "admin", "workshop", "workshop_admin", "super_admin"]);

const claim = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

export default async function WorkshopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  // getUser() valida el token con Supabase Auth y trae el app_metadata ACTUAL (no el de una cookie vieja).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  // Sin taller registrado -> onboarding (el proxy ya lo hace, aquí es la red de seguridad).
  if (!claim(user.app_metadata?.tenant_id)) redirect(`/${locale}/onboarding`);

  // Mismo criterio que el store: primero el claim del JWT; si no existe, profiles.role.
  let role = claim(user.app_metadata?.role);
  if (!role) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = claim(profile?.role);
  }

  if (!role || !ALLOWED_ROLES.has(role)) {
    redirect(`/${locale}/login?error=unauthorized`);
  }

  return (
    <SidebarProvider>
      <AppSidebar locale={locale} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm font-medium text-muted-foreground">Workshop</span>
          <div className="ml-auto flex items-center gap-2">
            <NotifBell />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}