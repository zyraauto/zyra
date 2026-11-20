-- =============================================================================
-- Zyra AutoSaaS: pruebas de permisos (RLS), cuatro scripts independientes
-- Validados en zyra-db entre el 3 y el 4 de noviembre de 2026.
--
-- COMO USARLOS
--  * Ejecutar UN script a la vez en el SQL Editor de Supabase.
--  * Cada script termina con `raise exception` A PROPOSITO: el error (codigo P0001)
--    trae la tabla de resultados y deshace todo lo que insertó. No queda nada guardado.
--  * Los ids de talleres y cuentas de prueba son los reales del proyecto. Si se borran las
--    cuentas de prueba de Authentication (rec, tec, cli), estos scripts dejan de funcionar:
--    hay que sustituir esos uuid por otros usuarios existentes.
--  * Los scripts 1 y 2 y 4 usan session_replication_role = replica: apagan llaves foraneas y
--    triggers. Validan POLITICAS, no triggers. El script 3 enciende los triggers para probar
--    el trigger del tecnico.
--  * Los conteos suponen que las tablas estan vacias en produccion. Si hay datos reales,
--    lo importante es la diferencia entre perfiles.
-- =============================================================================


-- =============================================================================
-- SCRIPT 1: matriz de 7 perfiles sobre las tablas troncales
-- Perfiles: dueno_A, dueno_B, gerente (ficticio), recepcion, tecnico, cliente, super_admin
--
-- RESULTADO ESPERADO (con todo OT-3 aplicado):
--   mismo_dueno=f
--   dueno_A     | puesto=owner        | citas A/B=2/0 | clientes=2 | veh=1 | ot A/B=2/0 | cot=1 | piezas_ot=2 | partes=1 | pagos=1 | fact=1 | crear_cita=permitido | editar_ot=2 | borrar_ot=2
--   dueno_B     | puesto=(ninguno)    | citas A/B=0/1 | clientes=1 | veh=1 | ot A/B=0/1 | cot=1 | piezas_ot=1 | partes=1 | pagos=1 | fact=1 | crear_cita=bloqueado | editar_ot=0 | borrar_ot=0
--   gerente     | puesto=manager      | citas A/B=2/0 | clientes=2 | veh=1 | ot A/B=2/0 | cot=1 | piezas_ot=2 | partes=1 | pagos=1 | fact=1 | crear_cita=permitido | editar_ot=2 | borrar_ot=2
--   recepcion   | puesto=receptionist | citas A/B=2/0 | clientes=2 | veh=1 | ot A/B=2/0 | cot=1 | piezas_ot=2 | partes=1 | pagos=1 | fact=0 | crear_cita=permitido | editar_ot=2 | borrar_ot=0
--   tecnico     | puesto=technician   | citas A/B=1/0 | clientes=1 | veh=1 | ot A/B=1/0 | cot=0 | piezas_ot=1 | partes=0 | pagos=0 | fact=0 | crear_cita=bloqueado | editar_ot=1 | borrar_ot=0
--   cliente     | puesto=(ninguno)    | citas A/B=1/0 | clientes=0 | veh=0 | ot A/B=0/0 | cot=0 | piezas_ot=0 | partes=0 | pagos=0 | fact=0 | crear_cita=bloqueado | editar_ot=0 | borrar_ot=0
--   super_admin | puesto=(ninguno)    | citas A/B=2/1 | clientes=3 | veh=2 | ot A/B=2/1 | cot=2 | piezas_ot=3 | partes=2 | pagos=2 | fact=2 | crear_cita=permitido | editar_ot=2 | borrar_ot=2
--
-- Notas: el tecnico ve 1 pieza (la de su orden) porque tiene lectura de las hijas de sus
-- ordenes. 'editar_ot=1' del tecnico se debe a que el trigger esta apagado en este script;
-- con triggers encendidos (script 3) esa edicion se bloquea.
-- =============================================================================
do $$
declare
  ws_a uuid := '95414f7d-3dc3-4123-8543-9d282d76a52a';
  ws_b uuid := '61f6abc0-27dd-4ed6-860e-f3408466526c';
  rec  uuid := 'a5453401-6bd5-4eac-8a3f-7435f38b8119';
  tec  uuid := 'e71ba7ed-70eb-477e-960d-4e9559165f47';
  cli  uuid := '14f1c38c-0680-4843-b469-e3c3360cfaaa';
  ger  uuid := gen_random_uuid();   -- gerente ficticio (no necesita existir en Auth)
  own_a uuid; own_b uuid; adm uuid;
  cust_a uuid; cust_a2 uuid; cust_b uuid; staff_tec uuid;
  veh_a uuid; veh_b uuid;
  r record; salida text;
  v_puesto text;
  v_ca int; v_cb int; v_cli int; v_veh int; v_ota int; v_otb int;
  v_cot int; v_pot int; v_par int; v_pag int; v_fac int;
  v_ins text; v_upd int; v_del int;
begin
  set local session_replication_role = replica;  -- sin FKs ni triggers: solo prueba politicas

  select owner_id into own_a from workshops where id = ws_a;
  select owner_id into own_b from workshops where id = ws_b;
  select id into adm from auth.users where email = 'luispasquett24@outlook.com';

  insert into workshop_staff (workshop_id, user_id, first_name, last_name, role) values
    (ws_a, rec, 'Test', 'Recepcion', 'receptionist'),
    (ws_a, tec, 'Test', 'Tecnico',   'technician'),
    (ws_a, ger, 'Test', 'Gerente',   'manager');
  select id into staff_tec from workshop_staff where workshop_id = ws_a and user_id = tec;

  insert into customers (workshop_id, first_name, last_name, user_id) values (ws_a,'Cliente','Uno',cli) returning id into cust_a;
  insert into customers (workshop_id, first_name, last_name) values (ws_a,'Cliente','Dos')  returning id into cust_a2;
  insert into customers (workshop_id, first_name, last_name) values (ws_b,'Cliente','Otro') returning id into cust_b;

  insert into customer_vehicles (customer_id, workshop_id) values (cust_a, ws_a) returning id into veh_a;
  insert into customer_vehicles (customer_id, workshop_id) values (cust_b, ws_b) returning id into veh_b;

  insert into appointments (workshop_id, customer_id, vehicle_id, scheduled_at, staff_id) values
    (ws_a, cust_a,  veh_a, now() + interval '1 day',  staff_tec),
    (ws_a, cust_a2, veh_a, now() + interval '2 days', null),
    (ws_b, cust_b,  veh_b, now() + interval '3 days', null);

  -- Ordenes: A1 asignada al tecnico, A2 sin asignar, B del otro taller
  with o as (
    insert into work_orders (workshop_id, customer_id, vehicle_id, technician_id) values
      (ws_a, cust_a,  veh_a, staff_tec),
      (ws_a, cust_a2, veh_a, null),
      (ws_b, cust_b,  veh_b, null)
    returning id, workshop_id, technician_id
  )
  insert into work_order_parts (work_order_id, description)
    select id, 'Pieza de prueba' from o;

  insert into quotes   (workshop_id, customer_id) values (ws_a, cust_a), (ws_b, cust_b);
  insert into parts    (workshop_id, name)        values (ws_a, 'Parte A'), (ws_b, 'Parte B');
  insert into payments (workshop_id, customer_id, amount) values (ws_a, cust_a, 100), (ws_b, cust_b, 50);
  insert into invoices (workshop_id, customer_id) values (ws_a, cust_a), (ws_b, cust_b);

  salida := format(E'mismo_dueno=%s\n', (own_a = own_b));

  for r in select * from (values ('dueno_A',own_a),('dueno_B',own_b),('gerente',ger),
                                 ('recepcion',rec),('tecnico',tec),('cliente',cli),
                                 ('super_admin',adm)) as t(quien, uid)
  loop
    perform set_config('request.jwt.claims', json_build_object('sub', r.uid, 'role', 'authenticated')::text, true);
    set local role authenticated;

    v_puesto := workshop_role(ws_a);
    select count(*) into v_ca  from appointments where workshop_id = ws_a;
    select count(*) into v_cb  from appointments where workshop_id = ws_b;
    select count(*) into v_cli from customers;
    select count(*) into v_veh from customer_vehicles;
    select count(*) into v_ota from work_orders where workshop_id = ws_a;
    select count(*) into v_otb from work_orders where workshop_id = ws_b;
    select count(*) into v_cot from quotes;
    select count(*) into v_pot from work_order_parts;
    select count(*) into v_par from parts;
    select count(*) into v_pag from payments;
    select count(*) into v_fac from invoices;

    begin   -- puede crear una cita en el taller A?
      insert into appointments (workshop_id, customer_id, vehicle_id, scheduled_at)
        values (ws_a, cust_a, veh_a, now() + interval '9 days');
      raise exception 'insert_ok';
    exception
      when insufficient_privilege then v_ins := 'bloqueado';
      when raise_exception then v_ins := 'permitido';
      when others then v_ins := 'error: ' || sqlerrm;
    end;

    update work_orders set internal_notes = internal_notes where workshop_id = ws_a;
    get diagnostics v_upd = row_count;

    begin   -- cuantas ordenes del taller A podria borrar? (se deshace siempre)
      delete from work_orders where workshop_id = ws_a;
      get diagnostics v_del = row_count;
      raise exception 'rollback_delete';
    exception
      when raise_exception then null;
      when others then v_del := -1;
    end;

    reset role;

    salida := salida || format(
      E'%s | puesto=%s | citas A/B=%s/%s | clientes=%s | veh=%s | ot A/B=%s/%s | cot=%s | piezas_ot=%s | partes=%s | pagos=%s | fact=%s | crear_cita=%s | editar_ot=%s | borrar_ot=%s\n',
      r.quien, coalesce(v_puesto,'(ninguno)'), v_ca, v_cb, v_cli, v_veh, v_ota, v_otb,
      v_cot, v_pot, v_par, v_pag, v_fac, v_ins, v_upd, v_del);
  end loop;

  raise exception E'\n%', salida;
end $$;


-- =============================================================================
-- SCRIPT 2: ordenes, hijas, vistas del cliente, directorio de personal y subida de fotos
-- Incluye una orden en borrador y una cotizacion sin enviar para comprobar que el cliente
-- NO las ve. K = filas de workshop_staff del taller A (3 de prueba + las reales).
--
-- RESULTADO ESPERADO:
--   dueno_A     | ot_A=3 | piezas=2 | serv=2 | fotos=2 | bitacora=2 | cli_cust=0 | cli_veh=0 | cli_ot=0 | cli_cot=0 | staff_A=K
--   dueno_B     | ot_A=0 | piezas=1 | serv=1 | fotos=1 | bitacora=1 | cli_cust=0 | cli_veh=0 | cli_ot=0 | cli_cot=0 | staff_A=0
--   gerente     | ot_A=3 | piezas=2 | serv=2 | fotos=2 | bitacora=2 | cli_cust=0 | cli_veh=0 | cli_ot=0 | cli_cot=0 | staff_A=K
--   recepcion   | ot_A=3 | piezas=2 | serv=2 | fotos=2 | bitacora=2 | cli_cust=0 | cli_veh=0 | cli_ot=0 | cli_cot=0 | staff_A=K
--   tecnico     | ot_A=1 | piezas=1 | serv=1 | fotos=1 | bitacora=1 | cli_cust=0 | cli_veh=0 | cli_ot=0 | cli_cot=0 | staff_A=K
--   cliente     | ot_A=0 | piezas=0 | serv=0 | fotos=0 | bitacora=0 | cli_cust=1 | cli_veh=1 | cli_ot=1 | cli_cot=1 | staff_A=0
--   super_admin | ot_A=3 | piezas=3 | serv=3 | fotos=3 | bitacora=3 | cli_cust=0 | cli_veh=0 | cli_ot=0 | cli_cot=0 | staff_A=K
--
--   tecnico   | foto a su orden, firmada por el  | ejecutado, filas=1
--   tecnico   | foto firmada como otra persona   | BLOQUEADO
--   tecnico   | foto a una orden ajena           | BLOQUEADO
--   recepcion | foto a una orden                 | ejecutado, filas=1
--   cliente   | foto a una orden                 | BLOQUEADO
-- (El 4 de noviembre K fue 4 en todas las filas con acceso.)
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
  cust_a uuid; cust_a2 uuid; cust_b uuid; veh_a uuid; veh_b uuid; staff_tec uuid;
  wo_a1 uuid; wo_a2 uuid; wo_b uuid; wo_draft uuid;
  r record; salida text := ''; resultado text; n int;
  v_ot int; v_pie int; v_srv int; v_fot int; v_log int;
  v_cc int; v_cv int; v_co int; v_cq int; v_sd int;
begin
  set local session_replication_role = replica;

  select owner_id into own_a from workshops where id = ws_a;
  select owner_id into own_b from workshops where id = ws_b;
  select id into adm from auth.users where email = 'luispasquett24@outlook.com';

  insert into workshop_staff (workshop_id, user_id, first_name, last_name, role) values
    (ws_a, rec, 'Test', 'Recepcion', 'receptionist'),
    (ws_a, tec, 'Test', 'Tecnico',   'technician'),
    (ws_a, ger, 'Test', 'Gerente',   'manager');
  select id into staff_tec from workshop_staff where workshop_id = ws_a and user_id = tec;

  insert into customers (workshop_id, first_name, last_name, user_id) values (ws_a,'Cliente','Uno',cli) returning id into cust_a;
  insert into customers (workshop_id, first_name, last_name) values (ws_a,'Cliente','Dos')  returning id into cust_a2;
  insert into customers (workshop_id, first_name, last_name) values (ws_b,'Cliente','Otro') returning id into cust_b;
  insert into customer_vehicles (customer_id, workshop_id) values (cust_a, ws_a) returning id into veh_a;
  insert into customer_vehicles (customer_id, workshop_id) values (cust_b, ws_b) returning id into veh_b;

  insert into work_orders (workshop_id, customer_id, vehicle_id, technician_id, status)
    values (ws_a, cust_a,  veh_a, staff_tec, 'received') returning id into wo_a1;
  insert into work_orders (workshop_id, customer_id, vehicle_id, technician_id, status)
    values (ws_a, cust_a2, veh_a, null,      'received') returning id into wo_a2;
  insert into work_orders (workshop_id, customer_id, vehicle_id, technician_id, status)
    values (ws_b, cust_b,  veh_b, null,      'received') returning id into wo_b;
  insert into work_orders (workshop_id, customer_id, vehicle_id, technician_id, status)
    values (ws_a, cust_a,  veh_a, null,      'draft')    returning id into wo_draft;

  insert into work_order_parts    (work_order_id, description) select id, 'Pieza'    from work_orders where id in (wo_a1, wo_a2, wo_b);
  insert into work_order_services (work_order_id, description) select id, 'Servicio' from work_orders where id in (wo_a1, wo_a2, wo_b);
  insert into work_order_photos   (work_order_id, storage_path) select id, 'x/foto.jpg' from work_orders where id in (wo_a1, wo_a2, wo_b);
  insert into work_order_status_log (work_order_id, workshop_id, status_to)
    select id, workshop_id, 'received' from work_orders where id in (wo_a1, wo_a2, wo_b);

  -- Cotizaciones: enviada y NO enviada de cust_a, mas las de otros
  insert into quotes (workshop_id, customer_id, sent_at) values
    (ws_a, cust_a,  now()), (ws_a, cust_a,  null),
    (ws_a, cust_a2, now()), (ws_b, cust_b,  now());

  for r in select * from (values
      ('dueno_A', own_a), ('dueno_B', own_b), ('gerente', ger), ('recepcion', rec),
      ('tecnico', tec), ('cliente', cli), ('super_admin', adm)
    ) as t(quien, uid)
  loop
    perform set_config('request.jwt.claims', json_build_object('sub', r.uid, 'role', 'authenticated')::text, true);
    set local role authenticated;
    select count(*) into v_ot  from work_orders where workshop_id = ws_a;
    select count(*) into v_pie from work_order_parts;
    select count(*) into v_srv from work_order_services;
    select count(*) into v_fot from work_order_photos;
    select count(*) into v_log from work_order_status_log;
    select count(*) into v_cc  from client_customer;
    select count(*) into v_cv  from client_vehicles;
    select count(*) into v_co  from client_work_orders;
    select count(*) into v_cq  from client_quotes;
    select count(*) into v_sd  from staff_directory where workshop_id = ws_a;
    reset role;
    salida := salida || format(
      E'%s | ot_A=%s | piezas=%s | serv=%s | fotos=%s | bitacora=%s | cli_cust=%s | cli_veh=%s | cli_ot=%s | cli_cot=%s | staff_A=%s\n',
      r.quien, v_ot, v_pie, v_srv, v_fot, v_log, v_cc, v_cv, v_co, v_cq, v_sd);
  end loop;

  salida := salida || E'\n';

  -- Subida de fotos
  for r in select * from (values
    (1, 'tecnico',   tec, 'foto a su orden, firmada por el',
        format('insert into work_order_photos (work_order_id, storage_path, taken_by) values (%L, %L, %L)', wo_a1, 'x/1.jpg', tec)),
    (2, 'tecnico',   tec, 'foto firmada como otra persona',
        format('insert into work_order_photos (work_order_id, storage_path, taken_by) values (%L, %L, %L)', wo_a1, 'x/2.jpg', gen_random_uuid())),
    (3, 'tecnico',   tec, 'foto a una orden ajena',
        format('insert into work_order_photos (work_order_id, storage_path, taken_by) values (%L, %L, %L)', wo_a2, 'x/3.jpg', tec)),
    (4, 'recepcion', rec, 'foto a una orden',
        format('insert into work_order_photos (work_order_id, storage_path, taken_by) values (%L, %L, %L)', wo_a1, 'x/4.jpg', rec)),
    (5, 'cliente',   cli, 'foto a una orden',
        format('insert into work_order_photos (work_order_id, storage_path, taken_by) values (%L, %L, %L)', wo_a1, 'x/5.jpg', cli))
  ) as t(ord, quien, uid, prueba, sentencia) order by ord
  loop
    perform set_config('request.jwt.claims', json_build_object('sub', r.uid, 'role', 'authenticated')::text, true);
    set local role authenticated;
    begin
      execute r.sentencia;
      get diagnostics n = row_count;
      resultado := 'ejecutado, filas=' || n;
      raise exception 'rollback_prueba';
    exception
      when raise_exception then
        if sqlerrm <> 'rollback_prueba' then resultado := 'BLOQUEADO: ' || sqlerrm; end if;
      when others then
        resultado := 'BLOQUEADO: ' || sqlerrm;
    end;
    reset role;
    salida := salida || format(E'%s | %s | %s\n', r.quien, r.prueba, resultado);
  end loop;

  raise exception E'\n%', salida;
end $$;


-- =============================================================================
-- SCRIPT 3: trigger del tecnico (guard_work_order_technician) con triggers ENCENDIDOS
--
-- RESULTADO ESPERADO:
--   tecnico ve: ordenes=1 clientes=1 vehiculos=1
--   tecnico   | diagnostico de su orden    | ejecutado, filas=1
--   tecnico   | diagnostico de orden ajena | ejecutado, filas=0
--   tecnico   | cambiar total              | BLOQUEADO: tecnico_no_puede_modificar_estas_columnas
--   tecnico   | quitarse la asignacion     | BLOQUEADO: tecnico_no_puede_modificar_estas_columnas
--   tecnico   | received -> diagnosing     | ejecutado, filas=1
--   tecnico   | received -> in_progress    | BLOQUEADO: tecnico_transicion_no_permitida: received -> in_progress
--   tecnico   | received -> completed      | BLOQUEADO: tecnico_transicion_no_permitida: received -> completed
--   tecnico   | borrar su orden            | ejecutado, filas=0
--   recepcion | cambiar total              | ejecutado, filas=1
--   recepcion | received -> completed      | ejecutado, filas=1
--
-- filas=0 no es un fallo: con RLS, tocar filas que no puedes ver afecta cero filas sin error.
-- Las pruebas de cambio de estado disparan el trigger de bitacora (SECURITY DEFINER).
-- =============================================================================
do $$
declare
  ws_a uuid := '95414f7d-3dc3-4123-8543-9d282d76a52a';
  rec  uuid := 'a5453401-6bd5-4eac-8a3f-7435f38b8119';
  tec  uuid := 'e71ba7ed-70eb-477e-960d-4e9559165f47';
  cust_a uuid; cust_a2 uuid; veh_a uuid; staff_tec uuid;
  wo_a1 uuid; wo_a2 uuid;
  r record; salida text := ''; resultado text; n int; c1 int; c2 int; c3 int;
begin
  set local session_replication_role = replica;   -- sin FKs ni triggers, para armar los datos

  insert into workshop_staff (workshop_id, user_id, first_name, last_name, role) values
    (ws_a, rec, 'Test', 'Recepcion', 'receptionist'),
    (ws_a, tec, 'Test', 'Tecnico',   'technician');
  select id into staff_tec from workshop_staff where workshop_id = ws_a and user_id = tec;

  insert into customers (workshop_id, first_name, last_name) values (ws_a,'Cliente','Uno')  returning id into cust_a;
  insert into customers (workshop_id, first_name, last_name) values (ws_a,'Cliente','Dos')  returning id into cust_a2;
  insert into customer_vehicles (customer_id, workshop_id) values (cust_a, ws_a) returning id into veh_a;

  -- A1: asignada al tecnico. A2: sin asignar. Ambas en estado 'received'
  insert into work_orders (workshop_id, customer_id, vehicle_id, technician_id, status)
    values (ws_a, cust_a,  veh_a, staff_tec, 'received') returning id into wo_a1;
  insert into work_orders (workshop_id, customer_id, vehicle_id, technician_id, status)
    values (ws_a, cust_a2, veh_a, null,      'received') returning id into wo_a2;

  set local session_replication_role = origin;    -- AHORA SI corren los triggers

  perform set_config('request.jwt.claims', json_build_object('sub', tec, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into c1 from work_orders;
  select count(*) into c2 from customers;
  select count(*) into c3 from customer_vehicles;
  reset role;
  salida := format(E'tecnico ve: ordenes=%s clientes=%s vehiculos=%s\n', c1, c2, c3);

  for r in select * from (values
    (1, 'tecnico',   tec, 'diagnostico de su orden',
        format('update work_orders set diagnosis = %L where id = %L', 'x', wo_a1)),
    (2, 'tecnico',   tec, 'diagnostico de orden ajena',
        format('update work_orders set diagnosis = %L where id = %L', 'x', wo_a2)),
    (3, 'tecnico',   tec, 'cambiar total',
        format('update work_orders set total = 999 where id = %L', wo_a1)),
    (4, 'tecnico',   tec, 'quitarse la asignacion',
        format('update work_orders set technician_id = null where id = %L', wo_a1)),
    (5, 'tecnico',   tec, 'received -> diagnosing',
        format('update work_orders set status = %L where id = %L', 'diagnosing', wo_a1)),
    (6, 'tecnico',   tec, 'received -> in_progress',
        format('update work_orders set status = %L where id = %L', 'in_progress', wo_a1)),
    (7, 'tecnico',   tec, 'received -> completed',
        format('update work_orders set status = %L where id = %L', 'completed', wo_a1)),
    (8, 'tecnico',   tec, 'borrar su orden',
        format('delete from work_orders where id = %L', wo_a1)),
    (9, 'recepcion', rec, 'cambiar total',
        format('update work_orders set total = 999 where id = %L', wo_a1)),
    (10,'recepcion', rec, 'received -> completed',
        format('update work_orders set status = %L where id = %L', 'completed', wo_a1))
  ) as t(ord, quien, uid, prueba, sentencia) order by ord
  loop
    perform set_config('request.jwt.claims', json_build_object('sub', r.uid, 'role', 'authenticated')::text, true);
    set local role authenticated;
    begin
      execute r.sentencia;
      get diagnostics n = row_count;
      resultado := 'ejecutado, filas=' || n;
      raise exception 'rollback_prueba';
    exception
      when raise_exception then
        if sqlerrm <> 'rollback_prueba' then resultado := 'BLOQUEADO: ' || sqlerrm; end if;
      when others then
        resultado := 'BLOQUEADO: ' || sqlerrm;
    end;
    reset role;
    salida := salida || format(E'%s | %s | %s\n', r.quien, r.prueba, resultado);
  end loop;

  raise exception E'\n%', salida;
end $$;


-- =============================================================================
-- SCRIPT 4: efecto de cerrar la tabla workshops (quita la politica publica DENTRO del
-- bloque; al terminar todo se deshace, incluido el drop)
--
-- RESULTADO ESPERADO (N = talleres activos, igual en las 7 filas; el 4 de nov fue 3):
--   anon        | workshops=0 | workshops_public=N
--   dueno_A     | workshops=1 | workshops_public=N
--   dueno_B     | workshops=1 | workshops_public=N
--   recepcion   | workshops=1 | workshops_public=N
--   tecnico     | workshops=1 | workshops_public=N
--   cliente     | workshops=0 | workshops_public=N
--   super_admin | workshops=3 | workshops_public=N
--
-- Una vez cerrada la tabla en produccion, este script ya no tiene la politica que quitar
-- y fallara en la linea del `drop policy`: quitar esa linea para repetir la prueba.
-- =============================================================================
do $$
declare
  ws_a uuid := '95414f7d-3dc3-4123-8543-9d282d76a52a';
  ws_b uuid := '61f6abc0-27dd-4ed6-860e-f3408466526c';
  rec  uuid := 'a5453401-6bd5-4eac-8a3f-7435f38b8119';
  tec  uuid := 'e71ba7ed-70eb-477e-960d-4e9559165f47';
  cli  uuid := '14f1c38c-0680-4843-b469-e3c3360cfaaa';
  own_a uuid; own_b uuid; adm uuid;
  r record; salida text := ''; v_w int; v_p int;
begin
  set local session_replication_role = replica;
  select owner_id into own_a from workshops where id = ws_a;
  select owner_id into own_b from workshops where id = ws_b;
  select id into adm from auth.users where email = 'luispasquett24@outlook.com';

  insert into workshop_staff (workshop_id, user_id, first_name, last_name, role) values
    (ws_a, rec, 'Test', 'Recepcion', 'receptionist'),
    (ws_a, tec, 'Test', 'Tecnico',   'technician');

  for r in select * from (values
      ('anon',        null::uuid),
      ('dueno_A',     own_a),
      ('dueno_B',     own_b),
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

    select count(*) into v_w from workshops;
    select count(*) into v_p from workshops_public;
    reset role;

    salida := salida || format(E'%s | workshops=%s | workshops_public=%s\n', r.quien, v_w, v_p);
  end loop;

  raise exception E'\n%', salida;
end $$;
