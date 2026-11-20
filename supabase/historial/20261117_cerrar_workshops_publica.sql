-- Aplicado en produccion (zyra-db) el 17-nov-2026 desde el SQL Editor.
-- Motivo: la politica publica "ver talleres activos" habia reaparecido y un
-- visitante sin sesion podia leer los 3 talleres (detectado por el script 4
-- de rls_tests.sql). Se elimino y se verifico: anon=0, duenos=1, super_admin=3.
-- Quedan 4 politicas en workshops: "equipo ve su taller", "owner edita su
-- taller", "owner ve su taller", "super_admin workshops".
-- SOLO REFERENCIA: ya esta aplicado. No ejecutar desde migrations/.

drop policy if exists "ver talleres activos" on public.workshops;

-- Vuelta atras (NO ejecutar salvo emergencia; reabre la lectura publica):
-- create policy "ver talleres activos" on public.workshops
--   for select to public
--   using (is_active = true and deleted_at is null);
