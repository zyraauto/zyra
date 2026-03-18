import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

type ProfileRow  = Tables<"profiles">;
type UserRole    = ProfileRow["role"];

type ProfileUpdates = Partial<Pick<ProfileRow, "full_name" | "phone" | "avatar_url" | "notifications_enabled">>;

type AuthState = {
  profile:       ProfileRow | null;
  role:          UserRole | null;
  isLoading:     boolean;
  fetchProfile:  () => Promise<void>;
  updateProfile: (data: ProfileUpdates) => Promise<void>;
  signOut:       () => Promise<void>;
  reset:         () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  profile:   null,
  role:      null,
  isLoading: true,

  fetchProfile: async () => {
    const supabase = createClient();
    set({ isLoading: true });

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      set({ profile: null, role: null, isLoading: false });
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const profile = data as ProfileRow | null;

    set({
      profile,
      role:      profile?.role ?? null,
      isLoading: false,
    });
  },

  updateProfile: async (updates: ProfileUpdates) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    const profile = data as ProfileRow | null;
    if (profile) set({ profile, role: profile.role });
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ profile: null, role: null, isLoading: false });
  },

  reset: () => set({ profile: null, role: null, isLoading: false }),
}));