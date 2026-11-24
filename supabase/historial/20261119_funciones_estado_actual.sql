-- Foto del estado de produccion (zyra-db) al 19-nov-2026, exportada de la base. SOLO REFERENCIA: ya esta aplicado. No ejecutar desde migrations/.

CREATE OR REPLACE FUNCTION public.decode_vin_full(p_vin text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'vpic'
AS $function$
DECLARE
  v text:=upper(trim(p_vin)); w3 text; w6 text; yc text; yr integer;
  row_wmi record; mk text; vt text; mf text;
BEGIN
  IF length(v)!=17 THEN RETURN jsonb_build_object('valid',false,'error','VIN debe tener 17 caracteres'); END IF;
  IF v~'[IOQ]'    THEN RETURN jsonb_build_object('valid',false,'error','VIN no puede contener I, O ni Q'); END IF;
  w3:=left(v,3); w6:=left(v,6); yc:=substring(v from 10 for 1);
  yr:=CASE yc WHEN 'A' THEN 2010 WHEN 'B' THEN 2011 WHEN 'C' THEN 2012 WHEN 'D' THEN 2013
    WHEN 'E' THEN 2014 WHEN 'F' THEN 2015 WHEN 'G' THEN 2016 WHEN 'H' THEN 2017
    WHEN 'J' THEN 2018 WHEN 'K' THEN 2019 WHEN 'L' THEN 2020 WHEN 'M' THEN 2021
    WHEN 'N' THEN 2022 WHEN 'P' THEN 2023 WHEN 'R' THEN 2024 WHEN 'S' THEN 2025
    WHEN 'T' THEN 2026 WHEN 'V' THEN 2027 WHEN 'W' THEN 2028 WHEN 'X' THEN 2029
    WHEN 'Y' THEN 2030 WHEN '1' THEN 2001 WHEN '2' THEN 2002 WHEN '3' THEN 2003
    WHEN '4' THEN 2004 WHEN '5' THEN 2005 WHEN '6' THEN 2006 WHEN '7' THEN 2007
    WHEN '8' THEN 2008 WHEN '9' THEN 2009 ELSE NULL END;
  BEGIN SELECT * INTO row_wmi FROM vpic.wmi WHERE wmi=w6 LIMIT 1; EXCEPTION WHEN OTHERS THEN NULL; END;
  IF NOT FOUND THEN
    BEGIN SELECT * INTO row_wmi FROM vpic.wmi WHERE wmi=w3 LIMIT 1; EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid',true,'vin',v,'year',yr,'wmi',w3,'make',null,
      'vehicle_type',null,'manufacturer',null,'source','fallback_api',
      'api_url','https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/'||v||'?format=json');
  END IF;
  BEGIN SELECT name INTO mk FROM vpic.make        WHERE id=row_wmi.makeid         LIMIT 1; EXCEPTION WHEN OTHERS THEN mk:=null; END;
  BEGIN SELECT name INTO vt FROM vpic.vehicletype WHERE id=row_wmi.vehicletypeid  LIMIT 1; EXCEPTION WHEN OTHERS THEN vt:=null; END;
  BEGIN SELECT name INTO mf FROM vpic.manufacturer WHERE id=row_wmi.manufacturerid LIMIT 1; EXCEPTION WHEN OTHERS THEN mf:=null; END;
  RETURN jsonb_build_object('valid',true,'vin',v,'year',yr,'wmi',row_wmi.wmi,
    'make',mk,'vehicle_type',vt,'manufacturer',mf,'source','vpic_local');
END; $function$
;

CREATE OR REPLACE FUNCTION public.get_brands_for_workshop(p_workshop_id uuid, p_vehicle_type vehicle_type DEFAULT 'car'::vehicle_type)
 RETURNS TABLE(brand_id uuid, name text, slug text, logo_svg_path text, logo_webp_path text, logo_placeholder text, logo_url_fallback text, score_30d integer, is_pinned boolean, sort_order integer)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_country char(2); v_has_full boolean;
BEGIN
  SELECT country_code INTO v_country FROM public.workshops WHERE id=p_workshop_id;
  IF    p_vehicle_type = 'car'        THEN v_has_full := public.workshop_has_module(p_workshop_id,'catalog_cars');
  ELSIF p_vehicle_type = 'motorcycle' THEN v_has_full := public.workshop_has_module(p_workshop_id,'catalog_motos');
  ELSIF p_vehicle_type IN ('truck','bus','van','pickup') THEN v_has_full := public.workshop_has_module(p_workshop_id,'catalog_trucks');
  ELSE v_has_full := false;
  END IF;
  RETURN QUERY
  SELECT cb.id, cb.name, cb.slug,
         cb.logo_svg_path, cb.logo_webp_path, cb.logo_placeholder, cb.logo_url_fallback,
         COALESCE(vp.score_30d,0)+COALESCE(vp_g.score_30d,0),
         COALESCE(pbt.is_pinned,false),
         COALESCE(pbt.sort_order,999)
  FROM public.car_brands cb
  INNER JOIN public.brand_markets bm
    ON bm.brand_id=cb.id AND bm.country_code=v_country AND bm.is_available=true
  LEFT JOIN public.platform_brand_tiers pbt ON pbt.brand_id=cb.id AND pbt.country_code=v_country
  LEFT JOIN public.vehicle_popularity vp
    ON vp.entity_id=cb.id AND vp.entity_type='brand' AND vp.workshop_id=p_workshop_id
  LEFT JOIN public.vehicle_popularity vp_g
    ON vp_g.entity_id=cb.id AND vp_g.entity_type='brand'
    AND vp_g.workshop_id IS NULL AND vp_g.country_code=v_country
  WHERE p_vehicle_type=ANY(cb.vehicle_types) AND cb.is_active=true
    AND (v_has_full=true OR EXISTS (
      SELECT 1 FROM public.platform_brand_tiers t2
      WHERE t2.brand_id=cb.id AND t2.country_code=v_country AND t2.tier=1))
  ORDER BY COALESCE(pbt.is_pinned,false) DESC,
           COALESCE(pbt.sort_order,999) ASC,
           COALESCE(vp.score_30d,0)+COALESCE(vp_g.score_30d,0) DESC,
           cb.name ASC;
END; $function$
;

CREATE OR REPLACE FUNCTION public.get_models_for_brand(p_brand_id uuid, p_workshop_id uuid DEFAULT NULL::uuid, p_vehicle_type vehicle_type DEFAULT NULL::vehicle_type)
 RETURNS TABLE(model_id uuid, name text, slug text, category text, year_start integer, year_end integer, score_30d integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT cm.id, cm.name, cm.slug, cm.category, cm.year_start, cm.year_end,
         COALESCE(vp.score_30d,0)+COALESCE(vp_g.score_30d,0)
  FROM public.car_models cm
  LEFT JOIN public.vehicle_popularity vp
    ON vp.entity_id=cm.id AND vp.entity_type='model' AND vp.workshop_id=p_workshop_id
  LEFT JOIN public.vehicle_popularity vp_g
    ON vp_g.entity_id=cm.id AND vp_g.entity_type='model' AND vp_g.workshop_id IS NULL
  WHERE cm.brand_id=p_brand_id AND cm.is_active=true
    AND (p_vehicle_type IS NULL OR cm.vehicle_type=p_vehicle_type)
  ORDER BY COALESCE(vp.score_30d,0)+COALESCE(vp_g.score_30d,0) DESC,
           cm.year_end DESC NULLS FIRST, cm.name ASC;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_role()
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v text; BEGIN SELECT role INTO v FROM public.profiles WHERE id = auth.uid(); RETURN v; END; $function$
;

CREATE OR REPLACE FUNCTION public.get_years_for_model(p_model_id uuid)
 RETURNS TABLE(year integer, variant_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT year, count(*) AS variant_count
  FROM public.car_model_years
  WHERE model_id=p_model_id AND is_active=true
  GROUP BY year ORDER BY year DESC;
$function$
;

CREATE OR REPLACE FUNCTION public.guard_work_order_technician()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare
  v_permitidas text[] := array['status','diagnosis','technician_notes','mileage_out',
                               'completed_at','updated_at','updated_by'];
begin
  if workshop_role(OLD.workshop_id) is distinct from 'technician' then
    return NEW;
  end if;

  if (to_jsonb(NEW) - v_permitidas) is distinct from (to_jsonb(OLD) - v_permitidas) then
    raise exception 'tecnico_no_puede_modificar_estas_columnas' using errcode = '42501';
  end if;

  if NEW.status is distinct from OLD.status then
    if not (
         (OLD.status = 'received'                    and NEW.status = 'diagnosing')
      or (OLD.status = 'diagnosing'                  and NEW.status = 'waiting_approval')
      or (OLD.status in ('approved','waiting_parts') and NEW.status = 'in_progress')
      or (OLD.status = 'in_progress'                 and NEW.status in ('waiting_parts','completed'))
    ) then
      raise exception 'tecnico_transicion_no_permitida: % -> %', OLD.status, NEW.status
        using errcode = '42501';
    end if;
  end if;
  return NEW;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, full_name, role, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'client',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_workshop()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.workshop_settings (workshop_id,created_by)
  VALUES (NEW.id,NEW.created_by) ON CONFLICT (workshop_id) DO NOTHING;
  RETURN NEW;
END; $function$
;

CREATE OR REPLACE FUNCTION public.handle_po_item_received()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_wid uuid; v_before numeric(10,3); v_delta numeric(10,3);
BEGIN
  v_delta := NEW.quantity_received - OLD.quantity_received;
  IF v_delta > 0 AND NEW.part_id IS NOT NULL THEN
    SELECT workshop_id INTO v_wid FROM public.purchase_orders WHERE id=NEW.purchase_order_id;
    SELECT stock_qty INTO v_before FROM public.parts WHERE id=NEW.part_id;
    INSERT INTO public.inventory_movements (workshop_id,part_id,movement_type,quantity,unit_cost,reference_type,reference_id,stock_before,stock_after)
    VALUES (v_wid,NEW.part_id,'purchase',v_delta,NEW.unit_cost,'purchase_order',NEW.purchase_order_id,v_before,v_before+v_delta);
    UPDATE public.parts SET stock_qty=stock_qty+v_delta,updated_at=now() WHERE id=NEW.part_id;
  END IF;
  RETURN NEW;
END; $function$
;

CREATE OR REPLACE FUNCTION public.handle_supplier_payment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.payable_id IS NOT NULL THEN
    UPDATE public.accounts_payable
    SET paid_amount=paid_amount+NEW.amount,
        status=CASE WHEN (paid_amount+NEW.amount)>=amount THEN 'paid'::payable_status
                    WHEN (paid_amount+NEW.amount)>0       THEN 'partial'::payable_status
                    ELSE status END, updated_at=now()
    WHERE id=NEW.payable_id;
  END IF;
  UPDATE public.suppliers SET current_balance=current_balance-NEW.amount,updated_at=now() WHERE id=NEW.supplier_id;
  RETURN NEW;
END; $function$
;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $function$
;

CREATE OR REPLACE FUNCTION public.log_work_order_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.work_order_status_log (work_order_id,workshop_id,status_from,status_to,changed_by,total_snapshot)
    VALUES (NEW.id,NEW.workshop_id,OLD.status,NEW.status,auth.uid(),NEW.total);
  END IF; RETURN NEW;
END; $function$
;

CREATE OR REPLACE FUNCTION public.my_customer_ids()
 RETURNS SETOF uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select id from customers where user_id = auth.uid()
$function$
;

CREATE OR REPLACE FUNCTION public.my_staff_ids()
 RETURNS SETOF uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ select id from workshop_staff where user_id = auth.uid() and is_active; $function$
;

CREATE OR REPLACE FUNCTION public.next_folio(p_workshop_id uuid, p_prefix text, p_digits integer DEFAULT 5)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_year integer := date_part('year',now())::integer; v_next integer;
BEGIN
  INSERT INTO public.folio_sequences (workshop_id,prefix,year,last_number) VALUES (p_workshop_id,p_prefix,v_year,1)
  ON CONFLICT (workshop_id,prefix,year) DO UPDATE SET last_number=folio_sequences.last_number+1 RETURNING last_number INTO v_next;
  RETURN p_prefix||'-'||v_year||'-'||lpad(v_next::text,p_digits,'0');
END; $function$
;

CREATE OR REPLACE FUNCTION public.protect_profile_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.provision_tenant(p_owner_id uuid, p_name text, p_slug text, p_owner_first_name text, p_owner_last_name text, p_phone text DEFAULT NULL::text, p_address text DEFAULT NULL::text, p_city text DEFAULT NULL::text, p_state text DEFAULT NULL::text, p_owner_role text DEFAULT NULL::text, p_plan_slug text DEFAULT NULL::text, p_postal_code text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_workshop_id uuid;
  v_email        text;
  v_phone        text := nullif(btrim(p_phone), '');
  v_postal       text := nullif(btrim(p_postal_code), '');
  v_plan         public.subscription_plans%rowtype;
  v_trial_days   int;
  v_staff_role   text := 'manager';
begin
  if p_owner_id is null then
    raise exception 'owner_required';
  end if;

  p_name := btrim(coalesce(p_name, ''));
  p_slug := lower(btrim(coalesce(p_slug, '')));
  p_owner_first_name := btrim(coalesce(p_owner_first_name, ''));
  p_owner_last_name  := btrim(coalesce(p_owner_last_name, ''));

  if char_length(p_name) not between 2 and 120 then
    raise exception 'invalid_name';
  end if;
  if char_length(p_slug) not between 3 and 40 or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'invalid_slug';
  end if;
  if p_owner_first_name = '' or p_owner_last_name = '' then
    raise exception 'invalid_owner_name';
  end if;
  if v_postal is not null and v_postal !~ '^[0-9]{5}$' then
    raise exception 'invalid_postal_code';
  end if;

  select email into v_email from auth.users where id = p_owner_id;
  if not found then
    raise exception 'owner_not_found';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('provision_tenant:' || p_owner_id::text, 0));

  select id into v_workshop_id
    from public.workshops
   where owner_id = p_owner_id and deleted_at is null
   order by created_at asc
   limit 1;
  if found then
    return v_workshop_id;
  end if;

  insert into public.workshops (name, slug, owner_id, created_by, email, phone, address, postal_code, city, state)
  values (p_name, p_slug, p_owner_id, p_owner_id, v_email, v_phone,
         nullif(btrim(p_address), ''), v_postal, nullif(btrim(p_city), ''), nullif(btrim(p_state), ''))
  returning id into v_workshop_id;

  insert into public.workshop_staff (workshop_id, user_id, first_name, last_name, email, phone, role, created_by)
  values (v_workshop_id, p_owner_id, p_owner_first_name, p_owner_last_name, v_email, v_phone, v_staff_role, p_owner_id);

  select * into v_plan
    from public.subscription_plans
   where is_active and (p_plan_slug is null or slug = p_plan_slug)
   order by sort_order asc nulls last, price_monthly asc
   limit 1;

  if found then
    v_trial_days := coalesce(v_plan.trial_days, 14);
    insert into public.subscriptions (
      workshop_id, plan_id, status, billing_cycle, price, currency,
      trial_start, trial_end, current_period_start, current_period_end, created_by
    ) values (
      v_workshop_id, v_plan.id, 'trialing', 'monthly', v_plan.price_monthly, v_plan.currency,
      now(), now() + make_interval(days => v_trial_days),
      now(), now() + make_interval(days => v_trial_days), p_owner_id
    );
  else
    raise warning 'provision_tenant: no hay planes activos; el taller % queda sin suscripción', v_workshop_id;
  end if;

  insert into public.profiles (id) values (p_owner_id) on conflict (id) do nothing;

  update public.profiles
     set full_name  = coalesce(nullif(full_name, ''), btrim(p_owner_first_name || ' ' || p_owner_last_name)),
         phone      = coalesce(phone, v_phone),
         role       = case when role = 'admin' then role else coalesce(p_owner_role, role) end,
         updated_at = now()
   where id = p_owner_id;

  return v_workshop_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.set_accounts_payable_folio()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN IF NEW.folio IS NULL THEN NEW.folio:=public.next_folio(NEW.workshop_id,'CXP'); END IF; RETURN NEW; END; $function$
;

CREATE OR REPLACE FUNCTION public.set_appointment_folio()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN IF NEW.folio IS NULL THEN NEW.folio:=public.next_folio(NEW.workshop_id,'APT'); END IF; RETURN NEW; END; $function$
;

CREATE OR REPLACE FUNCTION public.set_invoice_folio()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN IF NEW.folio IS NULL THEN NEW.folio:=public.next_folio(NEW.workshop_id,'FAC'); END IF; RETURN NEW; END; $function$
;

CREATE OR REPLACE FUNCTION public.set_payment_folio()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN IF NEW.folio IS NULL THEN NEW.folio:=public.next_folio(NEW.workshop_id,'PAY'); END IF; RETURN NEW; END; $function$
;

CREATE OR REPLACE FUNCTION public.set_purchase_order_folio()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN IF NEW.folio IS NULL THEN NEW.folio:=public.next_folio(NEW.workshop_id,'OC'); END IF; RETURN NEW; END; $function$
;

CREATE OR REPLACE FUNCTION public.set_quote_folio()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN IF NEW.folio IS NULL THEN NEW.folio:=public.next_folio(NEW.workshop_id,'COT'); END IF; RETURN NEW; END; $function$
;

CREATE OR REPLACE FUNCTION public.set_supplier_payment_folio()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN IF NEW.folio IS NULL THEN NEW.folio:=public.next_folio(NEW.workshop_id,'PAGP'); END IF; RETURN NEW; END; $function$
;

CREATE OR REPLACE FUNCTION public.set_work_order_folio()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN IF NEW.folio IS NULL THEN NEW.folio:=public.next_folio(NEW.workshop_id,'OT'); END IF; RETURN NEW; END; $function$
;

CREATE OR REPLACE FUNCTION public.track_vehicle_event(p_event_type popularity_event, p_brand_id uuid DEFAULT NULL::uuid, p_model_id uuid DEFAULT NULL::uuid, p_model_year_id uuid DEFAULT NULL::uuid, p_workshop_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_country char(2);
BEGIN
  IF p_workshop_id IS NOT NULL THEN
    SELECT country_code INTO v_country FROM public.workshops WHERE id=p_workshop_id;
  END IF;
  INSERT INTO public.vehicle_search_events
    (brand_id,model_id,model_year_id,workshop_id,country_code,event_type)
  VALUES (p_brand_id,p_model_id,p_model_year_id,p_workshop_id,v_country,p_event_type);
  IF p_brand_id IS NOT NULL THEN
    UPDATE public.vehicle_popularity
      SET score_7d=score_7d+1, score_30d=score_30d+1, score_total=score_total+1,
          last_event=now(), updated_at=now()
    WHERE entity_type='brand' AND entity_id=p_brand_id
      AND (workshop_id=p_workshop_id OR (workshop_id IS NULL AND p_workshop_id IS NULL))
      AND (country_code=v_country OR (country_code IS NULL AND v_country IS NULL));
    IF NOT FOUND THEN
      INSERT INTO public.vehicle_popularity
        (entity_type,entity_id,workshop_id,country_code,score_7d,score_30d,score_total,last_event)
      VALUES ('brand',p_brand_id,p_workshop_id,v_country,1,1,1,now());
    END IF;
  END IF;
  IF p_model_id IS NOT NULL THEN
    UPDATE public.vehicle_popularity
      SET score_7d=score_7d+1, score_30d=score_30d+1, score_total=score_total+1,
          last_event=now(), updated_at=now()
    WHERE entity_type='model' AND entity_id=p_model_id
      AND (workshop_id=p_workshop_id OR (workshop_id IS NULL AND p_workshop_id IS NULL))
      AND (country_code=v_country OR (country_code IS NULL AND v_country IS NULL));
    IF NOT FOUND THEN
      INSERT INTO public.vehicle_popularity
        (entity_type,entity_id,workshop_id,country_code,score_7d,score_30d,score_total,last_event)
      VALUES ('model',p_model_id,p_workshop_id,v_country,1,1,1,now());
    END IF;
  END IF;
END; $function$
;

CREATE OR REPLACE FUNCTION public.workshop_has_feature(p_workshop_id uuid, p_feature text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_features jsonb; v_status subscription_status;
BEGIN
  SELECT sp.features, s.status INTO v_features, v_status
  FROM public.subscriptions s
  JOIN public.subscription_plans sp ON sp.id=s.plan_id
  WHERE s.workshop_id=p_workshop_id;
  IF v_status NOT IN ('active','trialing') THEN RETURN false; END IF;
  RETURN COALESCE((v_features->>p_feature)::boolean,false);
END; $function$
;

CREATE OR REPLACE FUNCTION public.workshop_has_module(p_workshop_id uuid, p_module module_type)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_in_plan boolean; v_status subscription_status;
BEGIN
  SELECT p_module = ANY(sp.included_modules), s.status
  INTO v_in_plan, v_status
  FROM public.subscriptions s
  JOIN public.subscription_plans sp ON sp.id=s.plan_id
  WHERE s.workshop_id=p_workshop_id;
  IF v_status IN ('active','trialing') AND COALESCE(v_in_plan,false) THEN RETURN true; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.workshop_modules
    WHERE workshop_id=p_workshop_id AND module_type=p_module AND is_active=true
      AND (expires_at IS NULL OR expires_at>now())
  );
END; $function$
;

CREATE OR REPLACE FUNCTION public.workshop_role(p_workshop_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select case
    when exists (select 1 from workshops w
                 where w.id = p_workshop_id and w.owner_id = auth.uid()) then 'owner'
    else (select s.role from workshop_staff s
          where s.workshop_id = p_workshop_id and s.user_id = auth.uid() and s.is_active
          limit 1)
  end;
$function$
;