"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
// Cliente con service role (se salta RLS). Solo se usa aquí, después de validar al usuario con getUser().
// No se exporta: un archivo "use server" solo puede exportar funciones async, y esto nunca debe llegar al cliente.
// SUPABASE_SERVICE_ROLE_KEY no debe llevar el prefijo NEXT_PUBLIC_.
function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Rol que se inyecta en app_metadata (claim del JWT). El layout de /workshop y el proxy deben aceptarlo.
const APP_ROLE = "owner";
// Valor que se guarda en profiles.role del dueño (provision_tenant() lo usa SOLO para profiles.role).
// El rol en workshop_staff lo fija la función SQL, no este archivo. CONFIRMA que coincide con get_my_role().
const PROFILE_ROLE = "workshop";

// El slug será el subdominio <slug>.zyra.app, así que se reservan los nombres del sistema.
const RESERVED_SLUGS = new Set([
  "www", "app", "api", "admin", "auth", "login", "signup", "dashboard", "workshop", "onboarding",
  "static", "assets", "mail", "support", "help", "billing", "status", "blog", "docs",
]);
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const POSTAL_CODE_RE = /^\d{5}$/;

export type ProvisionTenantField = "name" | "slug" | "ownerFirstName" | "ownerLastName" | "postalCode";

export type ProvisionTenantInput = {
  name: string;
  slug: string;
  ownerFirstName: string;
  ownerLastName: string;
  phone?: string;
  /** Calle, número y colonia (SIN código postal: va en su propia columna). */
  address?: string;
  /** 5 dígitos; se guarda en workshops.postal_code. */
  postalCode?: string;
  city?: string;
  state?: string;
};

export type ProvisionTenantResult =
  | { success: true; workshopId: string }
  | { success: false; error: string; field?: ProvisionTenantField };

const clean = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

/**
 * Alta de un taller (tenant) para el usuario autenticado:
 *  1. Valida la sesión y los datos en el servidor (nunca se confía en el cliente).
 *  2. provision_tenant() crea taller + personal + suscripción + rol en UNA transacción.
 *  3. auth.admin.updateUserById() escribe app_metadata.tenant_id (= workshops.id) y role.
 *
 * NO renueva el JWT: eso lo hace el cliente con refreshSession() justo después (ver onboarding/page.tsx).
 * Es seguro reintentar: si el paso 3 falla, provision_tenant() devuelve el taller ya creado en lugar de duplicarlo.
 */
export async function provisionTenant(input: ProvisionTenantInput): Promise<ProvisionTenantResult> {
  try {
    const supabase = await createClient();

    // getUser() valida el token con Supabase Auth; la identidad sale de aquí, nunca del input.
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "Tu sesión expiró. Inicia sesión de nuevo." };
    }

    // Ya provisionado: nada que hacer (doble clic, segunda pestaña).
    const existing: unknown = user.app_metadata?.tenant_id;
    if (typeof existing === "string" && existing.length > 0) {
      return { success: true, workshopId: existing };
    }

    // ----- Validación -----
    const name = clean(input?.name, 120);
    const slug = clean(input?.slug, 40).toLowerCase();
    const ownerFirstName = clean(input?.ownerFirstName, 80);
    const ownerLastName = clean(input?.ownerLastName, 80);
    const postalCode = clean(input?.postalCode, 5);

    if (name.length < 2) {
      return { success: false, field: "name", error: "Escribe el nombre de tu taller." };
    }
    if (slug.length < 3 || !SLUG_RE.test(slug)) {
      return {
        success: false,
        field: "slug",
        error: "El subdominio debe tener 3 a 40 caracteres: letras minúsculas, números y guiones.",
      };
    }
    if (RESERVED_SLUGS.has(slug)) {
      return { success: false, field: "slug", error: "Ese subdominio está reservado. Elige otro." };
    }
    if (!ownerFirstName) {
      return { success: false, field: "ownerFirstName", error: "Escribe tu nombre." };
    }
    if (!ownerLastName) {
      return { success: false, field: "ownerLastName", error: "Escribe tus apellidos." };
    }
    // El C.P. es opcional, pero si viene debe tener exactamente 5 dígitos.
    if (postalCode && !POSTAL_CODE_RE.test(postalCode)) {
      return { success: false, field: "postalCode", error: "El código postal debe tener 5 dígitos." };
    }

    // ----- 1) Taller + personal + suscripción + rol (una transacción) -----
    const admin = createAdminClient();
    const { data: workshopId, error: rpcError } = await admin.rpc("provision_tenant", {
      p_owner_id: user.id,
      p_name: name,
      p_slug: slug,
      p_owner_first_name: ownerFirstName,
      p_owner_last_name: ownerLastName,
      p_phone: clean(input.phone, 30) || undefined,
      p_address: clean(input.address, 200) || undefined,
      p_postal_code: postalCode || undefined, // -> workshops.postal_code (requiere el parámetro en la función SQL)
      p_city: clean(input.city, 80) || undefined,
      p_state: clean(input.state, 80) || undefined,
      p_owner_role: PROFILE_ROLE, // solo alimenta profiles.role (el rol de workshop_staff lo fija el SQL)
    });

    if (rpcError || !workshopId) {
      if (rpcError?.code === "23505") {
        return { success: false, field: "slug", error: "Ese subdominio ya está en uso. Prueba con otro." };
      }
      console.error("[workshop] provision_tenant falló:", rpcError?.code, rpcError?.message);
      return { success: false, error: "No pudimos crear tu taller. Intenta de nuevo en un momento." };
    }

    // ----- 2) Claims en Auth (app_metadata solo lo puede escribir service role) -----
    // Se reenvía el app_metadata actual para no depender de si la API fusiona o reemplaza.
    // Un administrador de plataforma conserva su rol; cualquier otro usuario pasa a ser "owner".
    const currentRole: unknown = user.app_metadata?.role;
    const { error: metaError } = await admin.auth.admin.updateUserById(user.id, {
      app_metadata: {
        ...user.app_metadata,
        tenant_id: workshopId,
        role: currentRole === "admin" ? "admin" : APP_ROLE,
      },
    });
    if (metaError) {
      console.error("[workshop] updateUserById falló:", metaError.message);
      return {
        success: false,
        error: "Tu taller se creó, pero no pudimos activarlo. Vuelve a intentarlo; no se duplicará.",
      };
    }

    return { success: true, workshopId: workshopId as string };
  } catch (err) {
    console.error("[workshop] error inesperado:", err);
    return { success: false, error: "Ocurrió un error inesperado. Intenta de nuevo." };
  }
}