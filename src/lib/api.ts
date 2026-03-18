import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type ProfileRow = Tables<"profiles">;
type UserRole   = ProfileRow["role"];

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireAuth(allowedRoles?: UserRole[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, error: err("Unauthorized", 401) };
  }

  if (allowedRoles) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const profile = data as ProfileRow | null;

    if (!profile || !allowedRoles.includes(profile.role)) {
      return { user, profile: null, error: err("Forbidden", 403) };
    }

    return { user, profile, error: null };
  }

  return { user, profile: null, error: null };
}