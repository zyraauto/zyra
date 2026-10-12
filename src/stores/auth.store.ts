import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Tables, TablesUpdate } from "@/types/database";

type ProfileRow = Tables<"profiles">;

// Solo campos que el usuario puede editar de su propio perfil. `role` y `loyalty_points` quedan fuera a propósito.
export type ProfileUpdates = Pick<
  TablesUpdate<"profiles">,
  "full_name" | "phone" | "avatar_url" | "notifications_enabled"
>;

type AuthState = {
  user: User | null;
  profile: ProfileRow | null;
  /** id del taller (workshops.id / workshop_id). Viene del JWT: user.app_metadata.tenant_id */
  tenantId: string | null;
  /** Prioridad: claim app_metadata.role del JWT; si no existe, profiles.role */
  role: string | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: ProfileUpdates) => Promise<boolean>;
  signOut: () => Promise<void>;
  reset: () => void;
};

const EMPTY_STATE = {
  user: null,
  profile: null,
  tenantId: null,
  role: null,
  isLoading: false,
  error: null,
} satisfies Partial<AuthState>;

// Solo se leen claims de app_metadata (escribible únicamente con service role).
// user_metadata lo puede editar el propio usuario, así que nunca se usa para tenant ni rol.
function readStringClaim(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}
const readTenantId = (user: User) => readStringClaim(user.app_metadata?.tenant_id);
const readJwtRole = (user: User) => readStringClaim(user.app_metadata?.role);

// Evita que una respuesta lenta pise el estado después de un signOut/reset u otro fetch más reciente.
let latestRequest = 0;

export const useAuthStore = create<AuthState>((set, get) => ({
  ...EMPTY_STATE,
  isLoading: true, // hasta que fetchProfile termine

  fetchProfile: async () => {
    const requestId = ++latestRequest;
    const supabase = createClient();
    set({ isLoading: true, error: null });

    try {
      // getUser() valida el token con Supabase Auth y devuelve app_metadata actualizado.
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (requestId !== latestRequest) return;

      if (userError || !user) {
        // Sin sesión es un caso normal (AuthSessionMissingError); cualquier otro error sí se reporta.
        const unexpected = userError && userError.name !== "AuthSessionMissingError";
        if (unexpected) console.error("[auth.store] getUser falló:", userError.message);
        set({ ...EMPTY_STATE, error: unexpected ? "No pudimos verificar tu sesión." : null });
        return;
      }

      // Contexto disponible de inmediato (sin esperar a la base de datos).
      const jwtRole = readJwtRole(user);
      set({ user, tenantId: readTenantId(user), role: jwtRole });

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .is("deleted_at", null)
        .maybeSingle();
      if (requestId !== latestRequest) return;

      if (profileError) console.error("[auth.store] no se pudo cargar el perfil:", profileError.message);

      set({
        profile: profile ?? null,
        role: jwtRole ?? profile?.role ?? null,
        isLoading: false,
        error: profileError ? "No pudimos cargar tu perfil." : null,
      });
    } catch (err) {
      if (requestId !== latestRequest) return;
      console.error("[auth.store] fetchProfile falló:", err);
      set({ isLoading: false, error: "Ocurrió un error inesperado al cargar tu sesión." });
    }
  },

  updateProfile: async (updates) => {
    const supabase = createClient();
    set({ error: null });

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        set({ error: "Tu sesión expiró. Inicia sesión de nuevo." });
        return false;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        console.error("[auth.store] updateProfile falló:", error.message);
        set({ error: "No pudimos guardar tus cambios." });
        return false;
      }

      set({ profile, role: readJwtRole(user) ?? profile.role });
      return true;
    } catch (err) {
      console.error("[auth.store] updateProfile falló:", err);
      set({ error: "Ocurrió un error inesperado al guardar tus cambios." });
      return false;
    }
  },

  signOut: async () => {
    latestRequest++; // invalida cualquier fetchProfile en vuelo
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error("[auth.store] signOut devolvió error:", error.message);
    } catch (err) {
      console.error("[auth.store] signOut falló:", err);
    } finally {
      // Aunque falle la red, el estado local siempre se limpia.
      get().reset();
    }
  },

  reset: () => {
    latestRequest++;
    set({ ...EMPTY_STATE });
  },
}));