"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types";

const ROLE_DASHBOARD: Record<UserRole, string> = {
  super_admin:    "/admin/dashboard",
  workshop_admin: "/workshop/dashboard",
  mechanic:       "/mechanic/mis-citas",
  client:         "/client/dashboard",
  supplier:       "/supplier/ordenes",
  visitor:        "/",
};

export function useAuth() {
  const { profile, role, isLoading, fetchProfile, signOut, reset } = useAuthStore();
  const router   = useRouter();
  const pathname = usePathname();

  // Detecta el locale activo desde la URL: /es/... → "es"
  const locale = pathname.split("/")[1] ?? "es";

  useEffect(() => {
    const supabase = createClient();
    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_IN")  fetchProfile();
        if (event === "SIGNED_OUT") reset();
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile, reset]);

  const handleSignOut = async () => {
    await signOut();
    router.push(`/${locale}/auth/login`);
  };

  const redirectToDashboard = () => {
    if (!role) return;
    router.push(`/${locale}${ROLE_DASHBOARD[role]}`);
  };

  return {
    profile,
    role,
    isLoading,
    isAuthenticated: !!profile,
    handleSignOut,
    redirectToDashboard,
  };
}