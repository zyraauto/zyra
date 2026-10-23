-- Endurecimiento de seguridad (aplicado manualmente el 2026-10-22)

-- 1. Roles: se permite super_admin y se protege el cambio de role
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role = any (array['super_admin','admin','owner','workshop','client']));

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and coalesce((select p.role from public.profiles p where p.id = auth.uid()), '')
         not in ('admin', 'super_admin')
  then
    raise exception 'role_change_not_allowed' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
before update on public.profiles
for each row execute function public.protect_profile_role();

-- 2. profiles: el navegador solo puede editar estas columnas
revoke update on public.profiles from anon, authenticated;
grant update (full_name, phone, avatar_url, notifications_enabled, updated_at)
  on public.profiles to authenticated;

-- 3. workshops: solo lectura desde el navegador
revoke insert, update, delete, truncate, references, trigger
  on public.workshops from anon, authenticated;

-- 4. Funciones que la app no llama desde el cliente
revoke execute on function public.next_folio(uuid, text, integer) from public, anon, authenticated;
revoke execute on function public.track_vehicle_event(public.popularity_event, uuid, uuid, uuid, uuid) from public, anon, authenticated;
