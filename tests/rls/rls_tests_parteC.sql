-- =============================================================================
-- Zyra AutoSaaS: pruebas de permisos (RLS) de la parte C, cuatro scripts independientes
-- Validados en zyra-db entre el 5 y el 11 de noviembre de 2026.
--
-- COMO USARLOS
--  * Ejecutar UN script a la vez en el SQL Editor de Supabase.
--  * Cada script APLICA las politicas dentro del bloque y termina con `raise exception`
--    A PROPOSITO: el error (codigo P0001) trae la tabla de resultados y deshace todo,
--    incluidas las politicas. Para aplicarlas de verdad, copiar solo lo que esta entre
--    "INICIO DE LAS POLITICAS" y "FIN DE LAS POLITICAS" en una pestana nueva.
--  * Una vez aplicadas en produccion, los scripts siguen sirviendo como regresion: el drop
--    policy if exists y el create policy son idempotentes.
--  * Los ids de talleres y cuentas de prueba son los reales del proyecto. Si se borran las
--    cuentas de prueba de Authentication (rec, tec, cli), estos scripts dejan de funcionar:
--    hay que sustituir esos uuid por otros usuarios existentes.
--  * Usan session_replication_role = replica: apagan llaves foraneas y triggers. Validan
--    POLITICAS, no triggers.
-- =============================================================================


-- =============================================================================
-- SCRIPT D-1: plantillas de inspeccion (inspection_templates e inspection_template_items)
--
-- RESULTADO ESPERADO:
--   anon        | plantillas=0 | items=0 | crear_en_A=bloqueado
--   dueno_A     | plantillas=3 | items=3 | crear_en_A=permitido
--   dueno_B     | plantillas=2 | items=2 | crear_en_A=bloqueado
--   gerente     | plantillas=3 | items=3 | crear_en_A=permitido
--   recepcion   | plantillas=2 | items=2 | crear_en_A=bloqueado
--   tecnico     | plantillas=2 | items=2 | crear_en_A=bloqueado
--   cliente     | plantillas=1 | items=1 | crear_en_A=bloqueado
--   super_admin | plantillas=4 | items=4 | crear_en_A=permitido
-- Datos: 1 global activa, 1 del taller A activa, 1 del taller A inactiva, 1 del taller B activa.
-- =============================================================================
do $$
declare
  ws_a uuid := '95414f7d-3dc3-4123-8543-9d282d76a52a';
  ws_b uuid := '61f6abc0-27dd-4ed6-860e-f3408466526c';
  rec  uuid := 'a5453401-6bd5-4eac-8a3f-7435f38b8119';
  tec  uuid := 'e71ba7ed-70eb-477e-960d-4e9559165f47';
  cli  uuid := '14f1c38c-0680-4843-b469-e3c3360cfaaa';
  ger  uuid := gen_random_uuid();
  own_a uuid; own_b uuid; adm uuid;
  t_g uuid; t_a uuid; t_a2 uuid; t_b uuid;
  r record; salida text := ''; v_t int; v_i int; v_ins text;
begin
  set local session_replication_role = replica;

  -- ===== INICIO DE LAS POLITICAS (esta parte es la que luego se aplica de verdad) =====
  drop policy if exists "ver plantillas" on inspection_templates;
  drop policy if exists "globales visibles a autenticados" on inspection_templates;
  drop policy if exists "equipo ve plantillas" on inspection_templates;
  drop policy if exists "gerencia gestiona plantillas" on inspection_templates;

  create policy "globales visibles a autenticados" on inspection_templates
    for select to authenticated
    using (workshop_id is null and is_active = true);

  create policy "equipo ve plantillas" on inspection_templates
    for select to authenticated
    using (is_active = true
           and workshop_role(workshop_id) in ('owner','manager','receptionist','technician','advisor'));

  create policy "gerencia gestiona plantillas" on inspection_templates
    for all to authenticated
    using      (workshop_role(workshop_id) in ('owner','manager'))
    with check (workshop_role(workshop_id) in ('owner','manager'));

  drop policy if exists "ver template_items" on inspection_template_items;
  drop policy if exists "ven items de plantillas visibles" on inspection_template_items;
  drop policy if exists "gerencia gestiona template_items" on inspection_template_items;

  create policy "ven items de plantillas visibles" on inspection_template_items
    for select to authenticated
    using (exists (select 1 from inspection_templates t where t.id = template_id));

  create policy "gerencia gestiona template_items" on inspection_template_items
    for all to authenticated
    using (exists (select 1 from inspection_templates t
                   where t.id = template_id and workshop_role(t.workshop_id) in ('owner','manager')))
    with check (exists (select 1 from inspection_templates t
                   where t.id = template_id and workshop_role(t.workshop_id) in ('owner','manager')));
  -- ===== FIN DE LAS POLITICAS =====

  select owner_id into own_a from workshops where id = ws_a;
  select owner_id into own_b from workshops where id = ws_b;
  select id into adm from auth.users where email = 'luispasquett24@outlook.com';

  insert into workshop_staff (workshop_id, user_id, first_name, last_name, role) values
    (ws_a, rec, 'Test', 'Recepcion', 'receptionist'),
    (ws_a, tec, 'Test', 'Tecnico',   'technician'),
    (ws_a, ger, 'Test', 'Gerente',   'manager');

  insert into inspection_templates (workshop_id, name, is_active) values (null, 'ZZ_global',    true)  returning id into t_g;
  insert into inspection_templates (workshop_id, name, is_active) values (ws_a, 'ZZ_taller_A',  true)  returning id into t_a;
  insert into inspection_templates (workshop_id, name, is_active) values (ws_a, 'ZZ_A_inactiva', false) returning id into t_a2;
  insert into inspection_templates (workshop_id, name, is_active) values (ws_b, 'ZZ_taller_B',  true)  returning id into t_b;

  insert into inspection_template_items (template_id, category, item_name) values
    (t_g,  'general', 'ZZ_item_global'),
    (t_a,  'general', 'ZZ_item_A'),
    (t_a2, 'general', 'ZZ_item_A_inactiva'),
    (t_b,  'general', 'ZZ_item_B');

  for r in select * from (values
      ('anon',        null::uuid),
      ('dueno_A',     own_a),
      ('dueno_B',     own_b),
      ('gerente',     ger),
      ('recepcion',   rec),
      ('tecnico',     tec),
      ('cliente',     cli),
      ('super_admin', adm)
    ) as t(quien, uid)
  loop
    if r.uid is null then
      perform set_config('request.jwt.claims', '', true);
      set local role anon;
    else
      perform set_config('request.jwt.claims',
        json_build_object('sub', r.uid, 'role', 'authenticated')::text, true);
      set local role authenticated;
    end if;

    select count(*) into v_t from inspection_templates       where name like 'ZZ%';
    select count(*) into v_i from inspection_template_items  where item_name like 'ZZ%';

    begin
      insert into inspection_templates (workshop_id, name) values (ws_a, 'ZZ_insert');
      raise exception 'insert_ok';
    exception
      when insufficient_privilege then v_ins := 'bloqueado';
      when raise_exception then v_ins := 'permitido';
      when others then v_ins := 'error: ' || sqlerrm;
    end;

    reset role;
    salida := salida || format(E'%s | plantillas=%s | items=%s | crear_en_A=%s\n', r.quien, v_t, v_i, v_ins);
  end loop;

  raise exception E'\n%', salida;
end $$;


-- =============================================================================
-- SCRIPT D-2: workshop_settings (solo dueno y gerente)
-- Borra DENTRO del bloque cualquier fila real de configuracion de los tres talleres para
-- que los conteos sean exactos; todo se deshace al final.
--
-- RESULTADO ESPERADO:
--   anon        | ver_A=0 | ver_B=0 | editar_A=0 | borrar_A=0 | mover_A=filas=0
--   dueno_A     | ver_A=1 | ver_B=0 | editar_A=1 | borrar_A=1 | mover_A=bloqueado
--   dueno_B     | ver_A=0 | ver_B=1 | editar_A=0 | borrar_A=0 | mover_A=filas=0
--   gerente     | ver_A=1 | ver_B=0 | editar_A=1 | borrar_A=1 | mover_A=bloqueado
--   recepcion   | ver_A=0 | ver_B=0 | editar_A=0 | borrar_A=0 | mover_A=filas=0
--   tecnico     | ver_A=0 | ver_B=0 | editar_A=0 | borrar_A=0 | mover_A=filas=0
--   cliente     | ver_A=0 | ver_B=0 | editar_A=0 | borrar_A=0 | mover_A=filas=0
--   super_admin | ver_A=1 | ver_B=1 | editar_A=1 | borrar_A=1 | mover_A=filas=1
-- "mover_A" intenta pasar la fila del taller A al taller zyra (cambiar workshop_id).
-- =============================================================================
do $$
declare
  ws_a uuid := '95414f7d-3dc3-4123-8543-9d282d76a52a';
  ws_b uuid := '61f6abc0-27dd-4ed6-860e-f3408466526c';
  ws_c uuid := '01872dee-4d0d-45ef-9cfa-59cfeba9192a';
  rec  uuid := 'a5453401-6bd5-4eac-8a3f-7435f38b8119';
  tec  uuid := 'e71ba7ed-70eb-477e-960d-4e9559165f47';
  cli  uuid := '14f1c38c-0680-4843-b469-e3c3360cfaaa';
  ger  uuid := gen_random_uuid();
  own_a uuid; own_b uuid; adm uuid;
  r record; salida text := '';
  v_a int; v_b int; v_upd int; v_del int; v_mov text; n int;
begin
  set local session_replication_role = replica;

  -- ===== INICIO DE LA POLITICA (esta parte es la que luego se aplica de verdad) =====
  drop policy if exists "gerencia gestiona config" on workshop_settings;

  create policy "gerencia gestiona config" on workshop_settings
    for all to authenticated
    using      (workshop_role(workshop_id) in ('owner','manager'))
    with check (workshop_role(workshop_id) in ('owner','manager'));
  -- ===== FIN DE LA POLITICA =====

  select owner_id into own_a from workshops where id = ws_a;
  select owner_id into own_b from workshops where id = ws_b;
  select id into adm from auth.users where email = 'luispasquett24@outlook.com';

  insert into workshop_staff (workshop_id, user_id, first_name, last_name, role) values
    (ws_a, rec, 'Test', 'Recepcion', 'receptionist'),
    (ws_a, tec, 'Test', 'Tecnico',   'technician'),
    (ws_a, ger, 'Test', 'Gerente',   'manager');

  -- Se quita lo real de estos 3 talleres DENTRO del bloque (todo se deshace al final)
  delete from workshop_settings where workshop_id in (ws_a, ws_b, ws_c);
  insert into workshop_settings (workshop_id, tax_id) values (ws_a, 'ZZ_A'), (ws_b, 'ZZ_B');

  for r in select * from (values
      ('anon',        null::uuid),
      ('dueno_A',     own_a),
      ('dueno_B',     own_b),
      ('gerente',     ger),
      ('recepcion',   rec),
      ('tecnico',     tec),
      ('cliente',     cli),
      ('super_admin', adm)
    ) as t(quien, uid)
  loop
    if r.uid is null then
      perform set_config('request.jwt.claims', '', true);
      set local role anon;
    else
      perform set_config('request.jwt.claims',
        json_build_object('sub', r.uid, 'role', 'authenticated')::text, true);
      set local role authenticated;
    end if;

    v_upd := -1; v_del := -1; v_mov := '?';

    begin select count(*) into v_a from workshop_settings where workshop_id = ws_a and tax_id like 'ZZ%';
    exception when others then v_a := -1; end;
    begin select count(*) into v_b from workshop_settings where workshop_id = ws_b and tax_id like 'ZZ%';
    exception when others then v_b := -1; end;

    begin   -- editar la config de A (se deshace siempre)
      update workshop_settings set tax_id = 'ZZ_A' where workshop_id = ws_a;
      get diagnostics v_upd = row_count;
      raise exception 'rollback_prueba';
    exception
      when raise_exception then null;
      when others then v_upd := -1;
    end;

    begin   -- borrar la config de A (se deshace siempre)
      delete from workshop_settings where workshop_id = ws_a;
      get diagnostics v_del = row_count;
      raise exception 'rollback_prueba';
    exception
      when raise_exception then null;
      when others then v_del := -1;
    end;

    begin   -- mover la fila de A al taller zyra (se deshace siempre)
      update workshop_settings set workshop_id = ws_c where workshop_id = ws_a;
      get diagnostics n = row_count;
      v_mov := 'filas=' || n;
      raise exception 'rollback_prueba';
    exception
      when raise_exception then null;
      when insufficient_privilege then v_mov := 'bloqueado';
      when others then v_mov := 'error: ' || sqlerrm;
    end;

    reset role;
    salida := salida || format(
      E'%s | ver_A=%s | ver_B=%s | editar_A=%s | borrar_A=%s | mover_A=%s\n',
      r.quien, v_a, v_b, v_upd, v_del, v_mov);
  end loop;

  raise exception E'\n%', salida;
end $$;


-- =============================================================================
-- SCRIPT D-3: vehicle_inspections e inspection_items
--
-- RESULTADO ESPERADO (una fila por prueba, una columna por perfil):
--                   anon        dueno_A     dueno_B     gerente     recepcion   tecnico     cliente     super_admin
-- ver_insp          0           2           1           2           2           1           0           3
-- ver_items         0           2           1           2           2           1           0           3
-- crear_propia      BLOQUEADO   filas=1     BLOQUEADO   filas=1     filas=1     filas=1     BLOQUEADO   filas=1
-- crear_como_otro   BLOQUEADO   filas=1     BLOQUEADO   filas=1     filas=1     BLOQUEADO   BLOQUEADO   filas=1
-- crear_en_ajena    BLOQUEADO   filas=1     BLOQUEADO   filas=1     filas=1     BLOQUEADO   BLOQUEADO   filas=1
-- editar_insp       filas=0     filas=2     filas=1     filas=2     filas=2     filas=1     filas=0     filas=3
-- mover_a_B         filas=0     BLOQUEADO   filas=0     BLOQUEADO   BLOQUEADO   BLOQUEADO   filas=0     filas=1
-- borrar_insp       filas=0     filas=2     filas=1     filas=2     filas=0     filas=0     filas=0     filas=3
-- crear_item_I1     BLOQUEADO   filas=1     BLOQUEADO   filas=1     filas=1     filas=1     BLOQUEADO   filas=1
-- crear_item_I2     BLOQUEADO   filas=1     BLOQUEADO   filas=1     filas=1     BLOQUEADO   BLOQUEADO   filas=1
-- editar_items      filas=0     filas=2     filas=1     filas=2     filas=2     filas=1     filas=0     filas=3
-- borrar_items      filas=0     filas=2     filas=1     filas=2     filas=0     filas=0     filas=0     filas=3
-- Notas: anon puede mostrar BLOQUEADO en lugar de filas=0 si la tabla no le concede el privilegio
-- (equivale a lo mismo). "crear_como_otro" firma con el id de la recepcionista; "crear_en_ajena"
-- crea en la orden A2, que no esta asignada al tecnico; "mover_a_B" pasa la inspeccion de A1 a la
-- orden de B. El trigger handle_updated_at no se ejercita (triggers apagados).
-- =============================================================================
do $$
declare
  ws_a uuid := '95414f7d-3dc3-4123-8543-9d282d76a52a';
  ws_b uuid := '61f6abc0-27dd-4ed6-860e-f3408466526c';
  rec  uuid := 'a5453401-6bd5-4eac-8a3f-7435f38b8119';
  tec  uuid := 'e71ba7ed-70eb-477e-960d-4e9559165f47';
  cli  uuid := '14f1c38c-0680-4843-b469-e3c3360cfaaa';
  ger  uuid := gen_random_uuid();
  own_a uuid; own_b uuid; adm uuid;
  cust_a uuid; cust_b uuid; veh_a uuid; veh_b uuid;
  staff_tec uuid; staff_rec uuid;
  wo_a1 uuid; wo_a2 uuid; wo_b uuid;
  i1 uuid; i2 uuid; ib uuid;
  r record; p record;
  nombres text[] := '{}'; acum text[] := '{}';
  encabezado text := ''; salida text := '';
  resultado text; n int; k int;
begin
  set local session_replication_role = replica;

  -- ===== INICIO DE LAS POLITICAS (esta parte es la que luego se aplica de verdad) =====
  drop policy if exists "equipo ve inspecciones"    on vehicle_inspections;
  drop policy if exists "equipo crea inspecciones"  on vehicle_inspections;
  drop policy if exists "equipo edita inspecciones" on vehicle_inspections;
  drop policy if exists "gerencia borra inspecciones" on vehicle_inspections;

  create policy "equipo ve inspecciones" on vehicle_inspections
    for select to authenticated
    using (exists (select 1 from work_orders wo
                   where wo.id = work_order_id
                     and workshop_role(wo.workshop_id) in ('owner','manager','receptionist','technician','advisor')));

  create policy "equipo crea inspecciones" on vehicle_inspections
    for insert to authenticated
    with check (
      exists (select 1 from work_orders wo
              where wo.id = work_order_id
                and workshop_role(wo.workshop_id) in ('owner','manager','receptionist','advisor'))
      or
      (exists (select 1 from work_orders wo
               where wo.id = work_order_id
                 and workshop_role(wo.workshop_id) = 'technician')
       and exists (select 1 from workshop_staff s
                   where s.id = inspector_id and s.user_id = auth.uid()))
    );

  create policy "equipo edita inspecciones" on vehicle_inspections
    for update to authenticated
    using (exists (select 1 from work_orders wo
                   where wo.id = work_order_id
                     and workshop_role(wo.workshop_id) in ('owner','manager','receptionist','technician','advisor')))
    with check (exists (select 1 from work_orders wo
                        where wo.id = work_order_id
                          and workshop_role(wo.workshop_id) in ('owner','manager','receptionist','technician','advisor')));

  create policy "gerencia borra inspecciones" on vehicle_inspections
    for delete to authenticated
    using (exists (select 1 from work_orders wo
                   where wo.id = work_order_id
                     and workshop_role(wo.workshop_id) in ('owner','manager')));

  drop policy if exists "equipo ve items de inspeccion"    on inspection_items;
  drop policy if exists "equipo crea items de inspeccion"  on inspection_items;
  drop policy if exists "equipo edita items de inspeccion" on inspection_items;
  drop policy if exists "gerencia borra items de inspeccion" on inspection_items;

  create policy "equipo ve items de inspeccion" on inspection_items
    for select to authenticated
    using (exists (select 1 from vehicle_inspections vi where vi.id = inspection_id));

  create policy "equipo crea items de inspeccion" on inspection_items
    for insert to authenticated
    with check (exists (select 1 from vehicle_inspections vi where vi.id = inspection_id));

  create policy "equipo edita items de inspeccion" on inspection_items
    for update to authenticated
    using      (exists (select 1 from vehicle_inspections vi where vi.id = inspection_id))
    with check (exists (select 1 from vehicle_inspections vi where vi.id = inspection_id));

  create policy "gerencia borra items de inspeccion" on inspection_items
    for delete to authenticated
    using (exists (select 1 from vehicle_inspections vi
                   join work_orders wo on wo.id = vi.work_order_id
                   where vi.id = inspection_id
                     and workshop_role(wo.workshop_id) in ('owner','manager')));
  -- ===== FIN DE LAS POLITICAS =====

  select owner_id into own_a from workshops where id = ws_a;
  select owner_id into own_b from workshops where id = ws_b;
  select id into adm from auth.users where email = 'luispasquett24@outlook.com';

  insert into workshop_staff (workshop_id, user_id, first_name, last_name, role) values
    (ws_a, rec, 'Test', 'Recepcion', 'receptionist'),
    (ws_a, tec, 'Test', 'Tecnico',   'technician'),
    (ws_a, ger, 'Test', 'Gerente',   'manager');
  select id into staff_tec from workshop_staff where workshop_id = ws_a and user_id = tec;
  select id into staff_rec from workshop_staff where workshop_id = ws_a and user_id = rec;

  insert into customers (workshop_id, first_name, last_name) values (ws_a,'Cliente','Uno')  returning id into cust_a;
  insert into customers (workshop_id, first_name, last_name) values (ws_b,'Cliente','Otro') returning id into cust_b;
  insert into customer_vehicles (customer_id, workshop_id) values (cust_a, ws_a) returning id into veh_a;
  insert into customer_vehicles (customer_id, workshop_id) values (cust_b, ws_b) returning id into veh_b;

  -- A1 asignada al tecnico, A2 sin asignar, B del otro taller
  insert into work_orders (workshop_id, customer_id, vehicle_id, technician_id) values (ws_a, cust_a, veh_a, staff_tec) returning id into wo_a1;
  insert into work_orders (workshop_id, customer_id, vehicle_id, technician_id) values (ws_a, cust_a, veh_a, null)      returning id into wo_a2;
  insert into work_orders (workshop_id, customer_id, vehicle_id, technician_id) values (ws_b, cust_b, veh_b, null)      returning id into wo_b;

  insert into vehicle_inspections (work_order_id, inspector_id, notes) values (wo_a1, staff_tec, 'ZZ_i1') returning id into i1;
  insert into vehicle_inspections (work_order_id, inspector_id, notes) values (wo_a2, null,      'ZZ_i2') returning id into i2;
  insert into vehicle_inspections (work_order_id, inspector_id, notes) values (wo_b,  null,      'ZZ_iB') returning id into ib;
  insert into inspection_items (inspection_id, category, item_name) values
    (i1, 'general', 'ZZ_it1'), (i2, 'general', 'ZZ_it2'), (ib, 'general', 'ZZ_itB');

  for r in select * from (values
      ('anon',        null::uuid),
      ('dueno_A',     own_a),
      ('dueno_B',     own_b),
      ('gerente',     ger),
      ('recepcion',   rec),
      ('tecnico',     tec),
      ('cliente',     cli),
      ('super_admin', adm)
    ) as t(quien, uid)
  loop
    if r.uid is null then
      perform set_config('request.jwt.claims', '', true);
      set local role anon;
    else
      perform set_config('request.jwt.claims',
        json_build_object('sub', r.uid, 'role', 'authenticated')::text, true);
      set local role authenticated;
    end if;

    encabezado := encabezado || rpad(r.quien, 12);

    for p in select * from (values
      (1,  'ver_insp',      'c', $q$select count(*) from vehicle_inspections where notes like 'ZZ%'$q$),
      (2,  'ver_items',     'c', $q$select count(*) from inspection_items where item_name like 'ZZ%'$q$),
      (3,  'crear_propia',  'd', format($q$insert into vehicle_inspections (work_order_id, inspector_id, notes) values (%L, %L, 'ZZ_n1')$q$, wo_a1, staff_tec)),
      (4,  'crear_como_otro','d', format($q$insert into vehicle_inspections (work_order_id, inspector_id, notes) values (%L, %L, 'ZZ_n2')$q$, wo_a1, staff_rec)),
      (5,  'crear_en_ajena','d', format($q$insert into vehicle_inspections (work_order_id, inspector_id, notes) values (%L, %L, 'ZZ_n3')$q$, wo_a2, staff_tec)),
      (6,  'editar_insp',   'd', $q$update vehicle_inspections set notes = notes where notes like 'ZZ%'$q$),
      (7,  'mover_a_B',     'd', format($q$update vehicle_inspections set work_order_id = %L where id = %L$q$, wo_b, i1)),
      (8,  'borrar_insp',   'd', $q$delete from vehicle_inspections where notes like 'ZZ%'$q$),
      (9,  'crear_item_I1', 'd', format($q$insert into inspection_items (inspection_id, category, item_name) values (%L, 'general', 'ZZ_x')$q$, i1)),
      (10, 'crear_item_I2', 'd', format($q$insert into inspection_items (inspection_id, category, item_name) values (%L, 'general', 'ZZ_x')$q$, i2)),
      (11, 'editar_items',  'd', $q$update inspection_items set notes = notes where item_name like 'ZZ%'$q$),
      (12, 'borrar_items',  'd', $q$delete from inspection_items where item_name like 'ZZ%'$q$)
    ) as t(ord, nombre, tipo, sentencia) order by ord
    loop
      begin
        if p.tipo = 'c' then
          execute p.sentencia into n;
          resultado := n::text;
        else
          execute p.sentencia;
          get diagnostics n = row_count;
          resultado := 'filas=' || n;
        end if;
        raise exception 'rollback_prueba';
      exception
        when raise_exception then
          if sqlerrm <> 'rollback_prueba' then resultado := 'error: ' || sqlerrm; end if;
        when others then
          resultado := case when sqlstate = '42501' then 'BLOQUEADO'
                            else 'error ' || sqlstate || ': ' || sqlerrm end;
      end;
      nombres[p.ord] := p.nombre;
      acum[p.ord] := coalesce(acum[p.ord], '') || rpad(resultado, 12);
    end loop;

    reset role;
  end loop;

  salida := rpad('prueba', 18) || encabezado || E'\n';
  for k in 1..array_length(nombres, 1) loop
    salida := salida || rpad(nombres[k], 18) || acum[k] || E'\n';
  end loop;

  raise exception E'\n%', salida;
end $$;


-- =============================================================================
-- SCRIPT D-4: audit_log (solo lectura, tambien para el super admin)
--
-- RESULTADO ESPERADO (una fila por prueba, una columna por perfil):
--                  anon        dueno_A     dueno_B     gerente     recepcion   tecnico     cliente     super_admin
-- ver_A            0           1           0           1           0           0           0           1
-- ver_B            0           0           1           0           0           0           0           1
-- ver_sin_taller   0           0           0           0           0           0           0           1
-- insertar         BLOQUEADO   BLOQUEADO   BLOQUEADO   BLOQUEADO   BLOQUEADO   BLOQUEADO   BLOQUEADO   BLOQUEADO
-- editar           filas=0     filas=0     filas=0     filas=0     filas=0     filas=0     filas=0     filas=0
-- borrar           filas=0     filas=0     filas=0     filas=0     filas=0     filas=0     filas=0     filas=0
-- Nota: anon puede mostrar BLOQUEADO en editar o borrar en lugar de filas=0 (equivale a lo mismo).
-- Las filas de prueba llevan table_name = 'ZZ_t', asi que los conteos no mezclan filas reales.
-- =============================================================================
do $$
declare
  ws_a uuid := '95414f7d-3dc3-4123-8543-9d282d76a52a';
  ws_b uuid := '61f6abc0-27dd-4ed6-860e-f3408466526c';
  rec  uuid := 'a5453401-6bd5-4eac-8a3f-7435f38b8119';
  tec  uuid := 'e71ba7ed-70eb-477e-960d-4e9559165f47';
  cli  uuid := '14f1c38c-0680-4843-b469-e3c3360cfaaa';
  ger  uuid := gen_random_uuid();
  own_a uuid; own_b uuid; adm uuid;
  r record; p record;
  nombres text[] := '{}'; acum text[] := '{}';
  encabezado text := ''; salida text := '';
  resultado text; n int; k int;
begin
  set local session_replication_role = replica;

  -- ===== INICIO DE LAS POLITICAS (esta parte es la que luego se aplica de verdad) =====
  drop policy if exists "gerencia ve audit" on audit_log;
  create policy "gerencia ve audit" on audit_log
    for select to authenticated
    using (workshop_role(workshop_id) in ('owner','manager'));

  drop policy if exists "super_admin audit" on audit_log;
  drop policy if exists "super_admin lee audit" on audit_log;
  create policy "super_admin lee audit" on audit_log
    for select to authenticated
    using (get_my_role() = 'super_admin');
  -- ===== FIN DE LAS POLITICAS =====

  select owner_id into own_a from workshops where id = ws_a;
  select owner_id into own_b from workshops where id = ws_b;
  select id into adm from auth.users where email = 'luispasquett24@outlook.com';

  insert into workshop_staff (workshop_id, user_id, first_name, last_name, role) values
    (ws_a, rec, 'Test', 'Recepcion', 'receptionist'),
    (ws_a, tec, 'Test', 'Tecnico',   'technician'),
    (ws_a, ger, 'Test', 'Gerente',   'manager');

  insert into audit_log (table_name, record_id, action, workshop_id) values
    ('ZZ_t', gen_random_uuid(), 'INSERT', ws_a),
    ('ZZ_t', gen_random_uuid(), 'INSERT', ws_b),
    ('ZZ_t', gen_random_uuid(), 'INSERT', null);

  for r in select * from (values
      ('anon',        null::uuid),
      ('dueno_A',     own_a),
      ('dueno_B',     own_b),
      ('gerente',     ger),
      ('recepcion',   rec),
      ('tecnico',     tec),
      ('cliente',     cli),
      ('super_admin', adm)
    ) as t(quien, uid)
  loop
    if r.uid is null then
      perform set_config('request.jwt.claims', '', true);
      set local role anon;
    else
      perform set_config('request.jwt.claims',
        json_build_object('sub', r.uid, 'role', 'authenticated')::text, true);
      set local role authenticated;
    end if;

    encabezado := encabezado || rpad(r.quien, 12);

    for p in select * from (values
      (1, 'ver_A',          'c', format($q$select count(*) from audit_log where table_name = 'ZZ_t' and workshop_id = %L$q$, ws_a)),
      (2, 'ver_B',          'c', format($q$select count(*) from audit_log where table_name = 'ZZ_t' and workshop_id = %L$q$, ws_b)),
      (3, 'ver_sin_taller', 'c', $q$select count(*) from audit_log where table_name = 'ZZ_t' and workshop_id is null$q$),
      (4, 'insertar',       'd', format($q$insert into audit_log (table_name, record_id, action, workshop_id) values ('ZZ_t', %L, 'INSERT', %L)$q$, gen_random_uuid(), ws_a)),
      (5, 'editar',         'd', $q$update audit_log set action = action where table_name = 'ZZ_t'$q$),
      (6, 'borrar',         'd', $q$delete from audit_log where table_name = 'ZZ_t'$q$)
    ) as t(ord, nombre, tipo, sentencia) order by ord
    loop
      begin
        if p.tipo = 'c' then
          execute p.sentencia into n;
          resultado := n::text;
        else
          execute p.sentencia;
          get diagnostics n = row_count;
          resultado := 'filas=' || n;
        end if;
        raise exception 'rollback_prueba';
      exception
        when raise_exception then
          if sqlerrm <> 'rollback_prueba' then resultado := 'error: ' || sqlerrm; end if;
        when others then
          resultado := case when sqlstate = '42501' then 'BLOQUEADO'
                            else 'error ' || sqlstate || ': ' || sqlerrm end;
      end;
      nombres[p.ord] := p.nombre;
      acum[p.ord] := coalesce(acum[p.ord], '') || rpad(resultado, 12);
    end loop;

    reset role;
  end loop;

  salida := rpad('prueba', 16) || encabezado || E'\n';
  for k in 1..array_length(nombres, 1) loop
    salida := salida || rpad(nombres[k], 16) || acum[k] || E'\n';
  end loop;

  raise exception E'\n%', salida;
end $$;
