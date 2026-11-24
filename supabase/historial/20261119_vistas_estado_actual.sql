-- Foto del estado de produccion (zyra-db) al 19-nov-2026, exportada de la base. SOLO REFERENCIA: ya esta aplicado. No ejecutar desde migrations/.

-- opciones: security_invoker=false
create or replace view public.client_customer as  SELECT id,
    workshop_id,
    user_id,
    first_name,
    last_name,
    email,
    phone,
    phone_alt,
    address,
    city,
    state,
    tax_id,
    tax_name,
    tax_address,
    visit_count,
    last_visit_at
   FROM customers
  WHERE (id IN ( SELECT my_customer_ids() AS my_customer_ids));

-- opciones: security_invoker=false
create or replace view public.client_quote_items as  SELECT id,
    quote_id,
    item_type,
    description,
    quantity,
    unit_price,
    discount_pct,
    total,
    notes,
    sort_order
   FROM quote_items qi
  WHERE (EXISTS ( SELECT 1
           FROM quotes q
          WHERE ((q.id = qi.quote_id) AND (q.customer_id IN ( SELECT my_customer_ids() AS my_customer_ids)) AND (q.sent_at IS NOT NULL))));

-- opciones: security_invoker=false
create or replace view public.client_quotes as  SELECT id,
    workshop_id,
    customer_id,
    vehicle_id,
    work_order_id,
    folio,
    status,
    notes,
    valid_until,
    subtotal,
    discount_amount,
    tax_rate,
    tax_amount,
    total,
    sent_at,
    approved_at,
    rejected_at,
    created_at,
    updated_at
   FROM quotes
  WHERE ((customer_id IN ( SELECT my_customer_ids() AS my_customer_ids)) AND (sent_at IS NOT NULL));

-- opciones: security_invoker=false
create or replace view public.client_vehicles as  SELECT id,
    customer_id,
    workshop_id,
    brand_id,
    model_id,
    model_year_id,
    brand_name,
    model_name,
    year,
    engine,
    vehicle_type,
    vin,
    plate,
    color,
    mileage_km,
    fuel_type,
    transmission,
    image_url
   FROM customer_vehicles
  WHERE (customer_id IN ( SELECT my_customer_ids() AS my_customer_ids));

-- opciones: security_invoker=false
create or replace view public.client_work_orders as  SELECT id,
    workshop_id,
    customer_id,
    vehicle_id,
    appointment_id,
    folio,
    status,
    mileage_in,
    mileage_out,
    customer_complaint,
    diagnosis,
    promised_at,
    received_at,
    completed_at,
    delivered_at,
    subtotal,
    discount_amount,
    tax_rate,
    tax_amount,
    total,
    paid_amount,
    requires_approval,
    approved_by_customer,
    approved_at,
    approval_channel,
    created_at,
    updated_at
   FROM work_orders
  WHERE ((customer_id IN ( SELECT my_customer_ids() AS my_customer_ids)) AND (status <> 'draft'::work_order_status));

-- opciones: security_invoker=false
create or replace view public.staff_directory as  SELECT id,
    workshop_id,
    first_name,
    last_name,
    role,
    specialty,
    avatar_url,
    is_active
   FROM workshop_staff
  WHERE ((workshop_role(workshop_id) IS NOT NULL) OR (get_my_role() = 'super_admin'::text));

-- opciones: security_invoker=true
create or replace view public.wmi_quick_lookup as  SELECT w.wmi,
    mk.name AS make_name,
    vt.name AS vehicle_type,
    mf.name AS manufacturer_name,
    cb.id AS brand_id,
    cb.slug AS brand_slug,
    cb.logo_svg_path,
    cb.logo_webp_path,
    cb.logo_url_fallback
   FROM ((((vpic.wmi w
     LEFT JOIN vpic.make mk ON ((mk.id = w.makeid)))
     LEFT JOIN vpic.vehicletype vt ON ((vt.id = w.vehicletypeid)))
     LEFT JOIN vpic.manufacturer mf ON ((mf.id = w.manufacturerid)))
     LEFT JOIN car_brands cb ON (((lower(cb.name) = lower((mk.name)::text)) OR (lower((mk.name)::text) ~~ (('%'::text || lower(cb.slug)) || '%'::text)))));

-- opciones: security_invoker=false
create or replace view public.workshops_public as  SELECT id,
    name,
    slug,
    address,
    lat,
    lng,
    city,
    phone_wa,
    logo_url,
    rating,
    total_reviews,
    opening_hours,
    accepts_vehicles,
    schedule
   FROM workshops
  WHERE ((is_active = true) AND (deleted_at IS NULL));