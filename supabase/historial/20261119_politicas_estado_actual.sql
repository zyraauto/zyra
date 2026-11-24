-- Foto del estado de produccion (zyra-db) al 19-nov-2026, exportada de la base. SOLO REFERENCIA: ya esta aplicado. No ejecutar desde migrations/.

create policy "super_admin accounts_payable" on public.accounts_payable for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "taller gestiona CXP" on public.accounts_payable for ALL to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "cliente ve sus citas" on public.appointments for SELECT to authenticated
  using ((customer_id IN ( SELECT my_customer_ids() AS my_customer_ids)));

create policy "equipo crea citas" on public.appointments for INSERT to authenticated
  with check ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])));

create policy "equipo edita citas" on public.appointments for UPDATE to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])))
  with check ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])));

create policy "equipo ve citas" on public.appointments for SELECT to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])));

create policy "gerencia borra citas" on public.appointments for DELETE to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text])));

create policy "super_admin appointments" on public.appointments for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "taller ve sus citas" on public.appointments for ALL to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "tecnico actualiza sus citas" on public.appointments for UPDATE to authenticated
  using ((staff_id IN ( SELECT workshop_staff.id
   FROM workshop_staff
  WHERE (workshop_staff.user_id = auth.uid()))));

create policy "tecnico ve sus citas" on public.appointments for SELECT to authenticated
  using ((staff_id IN ( SELECT workshop_staff.id
   FROM workshop_staff
  WHERE (workshop_staff.user_id = auth.uid()))));

create policy "super_admin audit" on public.audit_log for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "taller ve su audit" on public.audit_log for SELECT to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "owner ve sus cobros" on public.billing_invoices for SELECT to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "super_admin billing" on public.billing_invoices for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "ver posts publicados" on public.blog_posts for SELECT to public
  using (((is_published = true) AND (deleted_at IS NULL)));

create policy "admin aliases" on public.brand_aliases for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "ver aliases" on public.brand_aliases for SELECT to public
  using (true);

create policy "admin brand_gallery" on public.brand_gallery for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "ver brand_gallery" on public.brand_gallery for SELECT to public
  using (true);

create policy "admin brand_markets" on public.brand_markets for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "ver brand_markets" on public.brand_markets for SELECT to public
  using (true);

create policy "admin marcas" on public.car_brands for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "ver marcas" on public.car_brands for SELECT to public
  using ((is_active = true));

create policy "admin anos" on public.car_model_years for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "ver anos" on public.car_model_years for SELECT to public
  using (true);

create policy "admin modelos" on public.car_models for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "ver modelos" on public.car_models for SELECT to public
  using (true);

create policy "ver aÃ±os" on public.car_years for SELECT to public
  using (true);

create policy "admin customer_messages" on public.customer_messages for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "taller gestiona mensajes" on public.customer_messages for ALL to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "equipo crea customer_vehicles" on public.customer_vehicles for INSERT to authenticated
  with check ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])));

create policy "equipo edita customer_vehicles" on public.customer_vehicles for UPDATE to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])))
  with check ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])));

create policy "equipo ve customer_vehicles" on public.customer_vehicles for SELECT to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])));

create policy "gerencia borra customer_vehicles" on public.customer_vehicles for DELETE to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text])));

create policy "super_admin cv" on public.customer_vehicles for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "taller ve sus vehiculos" on public.customer_vehicles for ALL to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "tecnico ve vehiculos asignados" on public.customer_vehicles for SELECT to authenticated
  using (((EXISTS ( SELECT 1
   FROM work_orders w
  WHERE ((w.vehicle_id = customer_vehicles.id) AND (w.technician_id IN ( SELECT my_staff_ids() AS my_staff_ids))))) OR (EXISTS ( SELECT 1
   FROM appointments a
  WHERE ((a.vehicle_id = customer_vehicles.id) AND (a.staff_id IN ( SELECT my_staff_ids() AS my_staff_ids)))))));

create policy "equipo crea customers" on public.customers for INSERT to authenticated
  with check ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])));

create policy "equipo edita customers" on public.customers for UPDATE to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])))
  with check ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])));

create policy "equipo ve customers" on public.customers for SELECT to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])));

create policy "gerencia borra customers" on public.customers for DELETE to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text])));

create policy "super_admin customers" on public.customers for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "taller ve sus clientes" on public.customers for ALL to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "tecnico ve clientes asignados" on public.customers for SELECT to authenticated
  using (((EXISTS ( SELECT 1
   FROM work_orders w
  WHERE ((w.customer_id = customers.id) AND (w.technician_id IN ( SELECT my_staff_ids() AS my_staff_ids))))) OR (EXISTS ( SELECT 1
   FROM appointments a
  WHERE ((a.customer_id = customers.id) AND (a.staff_id IN ( SELECT my_staff_ids() AS my_staff_ids)))))));

create policy "admin folio_sequences" on public.folio_sequences for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "admin inspection_items" on public.inspection_items for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "taller gestiona inspection_items" on public.inspection_items for ALL to public
  using ((inspection_id IN ( SELECT vehicle_inspections.id
   FROM vehicle_inspections
  WHERE (vehicle_inspections.work_order_id IN ( SELECT work_orders.id
           FROM work_orders
          WHERE (work_orders.workshop_id IN ( SELECT workshops.id
                   FROM workshops
                  WHERE (workshops.owner_id = auth.uid()))))))));

create policy "admin template_items" on public.inspection_template_items for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "gerencia gestiona template_items" on public.inspection_template_items for ALL to authenticated
  using ((EXISTS ( SELECT 1
   FROM inspection_templates t
  WHERE ((t.id = inspection_template_items.template_id) AND (workshop_role(t.workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text]))))))
  with check ((EXISTS ( SELECT 1
   FROM inspection_templates t
  WHERE ((t.id = inspection_template_items.template_id) AND (workshop_role(t.workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text]))))));

create policy "ven items de plantillas visibles" on public.inspection_template_items for SELECT to authenticated
  using ((EXISTS ( SELECT 1
   FROM inspection_templates t
  WHERE (t.id = inspection_template_items.template_id))));

create policy "ver template_items" on public.inspection_template_items for SELECT to public
  using (true);

create policy "equipo ve plantillas" on public.inspection_templates for SELECT to authenticated
  using (((is_active = true) AND (workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'technician'::text, 'advisor'::text]))));

create policy "gerencia gestiona plantillas" on public.inspection_templates for ALL to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text])))
  with check ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text])));

create policy "globales visibles a autenticados" on public.inspection_templates for SELECT to authenticated
  using (((workshop_id IS NULL) AND (is_active = true)));

create policy "super_admin templates" on public.inspection_templates for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "taller gestiona plantillas" on public.inspection_templates for ALL to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "ver plantillas" on public.inspection_templates for SELECT to public
  using (((is_active = true) AND ((workshop_id IS NULL) OR (workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))))));

create policy "admin inventory_movements" on public.inventory_movements for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "gerencia crea inventory_movements" on public.inventory_movements for INSERT to authenticated
  with check ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text])));

create policy "gerencia ve inventory_movements" on public.inventory_movements for SELECT to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text])));

create policy "taller ve sus movimientos" on public.inventory_movements for ALL to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "gerencia gestiona invoices" on public.invoices for ALL to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text])))
  with check ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text])));

create policy "super_admin invoices" on public.invoices for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "taller ve sus facturas" on public.invoices for ALL to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "ver mis puntos" on public.loyalty_events for SELECT to public
  using ((auth.uid() = user_id));

create policy "admin model_year_gallery" on public.model_year_gallery for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "ver model_year_gallery" on public.model_year_gallery for SELECT to public
  using (true);

create policy "editar mis preferencias" on public.notification_preferences for ALL to public
  using ((auth.uid() = user_id));

create policy "ver mis preferencias" on public.notification_preferences for SELECT to public
  using ((auth.uid() = user_id));

create policy "marcar notificacion leida" on public.notifications for UPDATE to public
  using ((auth.uid() = user_id));

create policy "super_admin notifications" on public.notifications for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "taller gestiona notifs" on public.notifications for ALL to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "ver mis notificaciones" on public.notifications for SELECT to public
  using ((auth.uid() = user_id));

create policy "equipo ve parts" on public.parts for SELECT to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])));

create policy "gerencia gestiona parts" on public.parts for ALL to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text])))
  with check ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text])));

create policy "super_admin parts" on public.parts for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "taller ve sus partes" on public.parts for ALL to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "admin parts_categories" on public.parts_categories for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "equipo ve parts_categories" on public.parts_categories for SELECT to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])));

create policy "gerencia gestiona parts_categories" on public.parts_categories for ALL to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text])))
  with check ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text])));

create policy "taller ve sus categorias" on public.parts_categories for ALL to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "admin payments" on public.payments for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "gerencia gestiona payments" on public.payments for ALL to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text])))
  with check ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text])));

create policy "recepcion registra payments" on public.payments for INSERT to authenticated
  with check ((workshop_role(workshop_id) = 'receptionist'::text));

create policy "recepcion ve payments" on public.payments for SELECT to authenticated
  using ((workshop_role(workshop_id) = 'receptionist'::text));

create policy "taller gestiona payments" on public.payments for ALL to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "admin tiers" on public.platform_brand_tiers for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "ver tiers" on public.platform_brand_tiers for SELECT to public
  using (true);

create policy "Permitir lectura de cÃ³digos postales a usuarios autenticados" on public.postal_codes for SELECT to authenticated
  using (true);

create policy "editar perfil propio" on public.profiles for UPDATE to public
  using (((auth.uid() = id) AND (deleted_at IS NULL)));

create policy "solo trigger inserta" on public.profiles for INSERT to public
  with check (false);

create policy "super_admin profiles" on public.profiles for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "ver perfil propio" on public.profiles for SELECT to public
  using (((auth.uid() = id) AND (deleted_at IS NULL)));

create policy "ver promociones" on public.promotions for SELECT to public
  using (((is_active = true) AND (deleted_at IS NULL)));

create policy "admin po_items" on public.purchase_order_items for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "taller gestiona po_items" on public.purchase_order_items for ALL to public
  using ((purchase_order_id IN ( SELECT purchase_orders.id
   FROM purchase_orders
  WHERE (purchase_orders.workshop_id IN ( SELECT workshops.id
           FROM workshops
          WHERE (workshops.owner_id = auth.uid()))))));

create policy "super_admin purchase_orders" on public.purchase_orders for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "taller gestiona OC" on public.purchase_orders for ALL to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "admin quote_items" on public.quote_items for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "equipo gestiona quote_items" on public.quote_items for ALL to authenticated
  using ((EXISTS ( SELECT 1
   FROM quotes q
  WHERE ((q.id = quote_items.quote_id) AND (workshop_role(q.workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text]))))))
  with check ((EXISTS ( SELECT 1
   FROM quotes q
  WHERE ((q.id = quote_items.quote_id) AND (workshop_role(q.workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text]))))));

create policy "taller gestiona quote_items" on public.quote_items for ALL to public
  using ((quote_id IN ( SELECT quotes.id
   FROM quotes
  WHERE (quotes.workshop_id IN ( SELECT workshops.id
           FROM workshops
          WHERE (workshops.owner_id = auth.uid()))))));

create policy "equipo crea quotes" on public.quotes for INSERT to authenticated
  with check ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])));

create policy "equipo edita quotes" on public.quotes for UPDATE to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])))
  with check ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])));

create policy "equipo ve quotes" on public.quotes for SELECT to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])));

create policy "gerencia borra quotes" on public.quotes for DELETE to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text])));

create policy "super_admin quotes" on public.quotes for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "taller ve sus cotizaciones" on public.quotes for ALL to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "admin servicios" on public.service_catalog for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "equipo ve service_catalog" on public.service_catalog for SELECT to authenticated
  using ((workshop_role(workshop_id) IS NOT NULL));

create policy "gerencia gestiona service_catalog" on public.service_catalog for ALL to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text])))
  with check ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text])));

create policy "taller gestiona servicios" on public.service_catalog for ALL to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "ver servicios" on public.service_catalog for SELECT to public
  using ((is_active = true));

create policy "ver precios" on public.service_prices for SELECT to public
  using (true);

create policy "ver servicios" on public.services for SELECT to public
  using (((is_active = true) AND (deleted_at IS NULL)));

create policy "super_admin planes" on public.subscription_plans for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "ver planes" on public.subscription_plans for SELECT to public
  using ((is_active = true));

create policy "owner ve su suscripcion" on public.subscriptions for SELECT to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "super_admin subscriptions" on public.subscriptions for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "admin supplier_payments" on public.supplier_payments for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "taller gestiona supplier_payments" on public.supplier_payments for ALL to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "super_admin suppliers" on public.suppliers for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "taller ve sus proveedores" on public.suppliers for ALL to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "admin user_cars" on public.user_cars for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "editar mis autos" on public.user_cars for UPDATE to public
  using ((auth.uid() = user_id));

create policy "insertar mis autos" on public.user_cars for INSERT to public
  with check ((auth.uid() = user_id));

create policy "ver mis autos" on public.user_cars for SELECT to public
  using (((auth.uid() = user_id) AND (deleted_at IS NULL)));

create policy "admin docs" on public.vehicle_documents for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "ver documentos" on public.vehicle_documents for SELECT to public
  using ((is_active = true));

create policy "admin vehicle_inspections" on public.vehicle_inspections for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "taller gestiona inspecciones" on public.vehicle_inspections for ALL to public
  using ((work_order_id IN ( SELECT work_orders.id
   FROM work_orders
  WHERE (work_orders.workshop_id IN ( SELECT workshops.id
           FROM workshops
          WHERE (workshops.owner_id = auth.uid()))))));

create policy "ver scores" on public.vehicle_popularity for SELECT to public
  using (((workshop_id IS NULL) OR (workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid())))));

create policy "admin eventos" on public.vehicle_search_events for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "insertar eventos" on public.vehicle_search_events for INSERT to public
  with check ((auth.role() = 'authenticated'::text));

create policy "admin wo_parts" on public.work_order_parts for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "equipo crea work_order_parts" on public.work_order_parts for INSERT to authenticated
  with check ((EXISTS ( SELECT 1
   FROM work_orders w
  WHERE ((w.id = work_order_parts.work_order_id) AND (workshop_role(w.workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text]))))));

create policy "equipo edita work_order_parts" on public.work_order_parts for UPDATE to authenticated
  using ((EXISTS ( SELECT 1
   FROM work_orders w
  WHERE ((w.id = work_order_parts.work_order_id) AND (workshop_role(w.workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text]))))))
  with check ((EXISTS ( SELECT 1
   FROM work_orders w
  WHERE ((w.id = work_order_parts.work_order_id) AND (workshop_role(w.workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text]))))));

create policy "equipo ve work_order_parts" on public.work_order_parts for SELECT to authenticated
  using ((EXISTS ( SELECT 1
   FROM work_orders w
  WHERE ((w.id = work_order_parts.work_order_id) AND (workshop_role(w.workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text]))))));

create policy "gerencia borra work_order_parts" on public.work_order_parts for DELETE to authenticated
  using ((EXISTS ( SELECT 1
   FROM work_orders w
  WHERE ((w.id = work_order_parts.work_order_id) AND (workshop_role(w.workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text]))))));

create policy "taller gestiona wo_parts" on public.work_order_parts for ALL to public
  using ((work_order_id IN ( SELECT work_orders.id
   FROM work_orders
  WHERE (work_orders.workshop_id IN ( SELECT workshops.id
           FROM workshops
          WHERE (workshops.owner_id = auth.uid()))))));

create policy "tecnico ve piezas de sus ordenes" on public.work_order_parts for SELECT to authenticated
  using ((EXISTS ( SELECT 1
   FROM work_orders w
  WHERE ((w.id = work_order_parts.work_order_id) AND (w.technician_id IN ( SELECT my_staff_ids() AS my_staff_ids))))));

create policy "admin wo_photos" on public.work_order_photos for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "equipo crea work_order_photos" on public.work_order_photos for INSERT to authenticated
  with check ((EXISTS ( SELECT 1
   FROM work_orders w
  WHERE ((w.id = work_order_photos.work_order_id) AND (workshop_role(w.workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text]))))));

create policy "equipo edita work_order_photos" on public.work_order_photos for UPDATE to authenticated
  using ((EXISTS ( SELECT 1
   FROM work_orders w
  WHERE ((w.id = work_order_photos.work_order_id) AND (workshop_role(w.workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text]))))))
  with check ((EXISTS ( SELECT 1
   FROM work_orders w
  WHERE ((w.id = work_order_photos.work_order_id) AND (workshop_role(w.workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text]))))));

create policy "equipo ve work_order_photos" on public.work_order_photos for SELECT to authenticated
  using ((EXISTS ( SELECT 1
   FROM work_orders w
  WHERE ((w.id = work_order_photos.work_order_id) AND (workshop_role(w.workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text]))))));

create policy "gerencia borra work_order_photos" on public.work_order_photos for DELETE to authenticated
  using ((EXISTS ( SELECT 1
   FROM work_orders w
  WHERE ((w.id = work_order_photos.work_order_id) AND (workshop_role(w.workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text]))))));

create policy "taller gestiona wo_photos" on public.work_order_photos for ALL to public
  using ((work_order_id IN ( SELECT work_orders.id
   FROM work_orders
  WHERE (work_orders.workshop_id IN ( SELECT workshops.id
           FROM workshops
          WHERE (workshops.owner_id = auth.uid()))))));

create policy "tecnico sube fotos" on public.work_order_photos for INSERT to authenticated
  with check (((taken_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM work_orders w
  WHERE ((w.id = work_order_photos.work_order_id) AND (w.technician_id IN ( SELECT my_staff_ids() AS my_staff_ids)))))));

create policy "tecnico ve fotos de sus ordenes" on public.work_order_photos for SELECT to authenticated
  using ((EXISTS ( SELECT 1
   FROM work_orders w
  WHERE ((w.id = work_order_photos.work_order_id) AND (w.technician_id IN ( SELECT my_staff_ids() AS my_staff_ids))))));

create policy "admin wo_services" on public.work_order_services for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "equipo crea work_order_services" on public.work_order_services for INSERT to authenticated
  with check ((EXISTS ( SELECT 1
   FROM work_orders w
  WHERE ((w.id = work_order_services.work_order_id) AND (workshop_role(w.workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text]))))));

create policy "equipo edita work_order_services" on public.work_order_services for UPDATE to authenticated
  using ((EXISTS ( SELECT 1
   FROM work_orders w
  WHERE ((w.id = work_order_services.work_order_id) AND (workshop_role(w.workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text]))))))
  with check ((EXISTS ( SELECT 1
   FROM work_orders w
  WHERE ((w.id = work_order_services.work_order_id) AND (workshop_role(w.workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text]))))));

create policy "equipo ve work_order_services" on public.work_order_services for SELECT to authenticated
  using ((EXISTS ( SELECT 1
   FROM work_orders w
  WHERE ((w.id = work_order_services.work_order_id) AND (workshop_role(w.workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text]))))));

create policy "gerencia borra work_order_services" on public.work_order_services for DELETE to authenticated
  using ((EXISTS ( SELECT 1
   FROM work_orders w
  WHERE ((w.id = work_order_services.work_order_id) AND (workshop_role(w.workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text]))))));

create policy "taller gestiona wo_services" on public.work_order_services for ALL to public
  using ((work_order_id IN ( SELECT work_orders.id
   FROM work_orders
  WHERE (work_orders.workshop_id IN ( SELECT workshops.id
           FROM workshops
          WHERE (workshops.owner_id = auth.uid()))))));

create policy "tecnico ve servicios de sus ordenes" on public.work_order_services for SELECT to authenticated
  using ((EXISTS ( SELECT 1
   FROM work_orders w
  WHERE ((w.id = work_order_services.work_order_id) AND (w.technician_id IN ( SELECT my_staff_ids() AS my_staff_ids))))));

create policy "equipo crea work_order_status_log" on public.work_order_status_log for INSERT to authenticated
  with check ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])));

create policy "equipo ve work_order_status_log" on public.work_order_status_log for SELECT to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])));

create policy "super_admin wo_log" on public.work_order_status_log for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "taller ve audit OT" on public.work_order_status_log for SELECT to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "tecnico ve bitacora de sus ordenes" on public.work_order_status_log for SELECT to authenticated
  using ((EXISTS ( SELECT 1
   FROM work_orders w
  WHERE ((w.id = work_order_status_log.work_order_id) AND (w.technician_id IN ( SELECT my_staff_ids() AS my_staff_ids))))));

create policy "equipo crea work_orders" on public.work_orders for INSERT to authenticated
  with check ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])));

create policy "equipo edita work_orders" on public.work_orders for UPDATE to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])))
  with check ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])));

create policy "equipo ve work_orders" on public.work_orders for SELECT to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text, 'receptionist'::text, 'advisor'::text])));

create policy "gerencia borra work_orders" on public.work_orders for DELETE to authenticated
  using ((workshop_role(workshop_id) = ANY (ARRAY['owner'::text, 'manager'::text])));

create policy "super_admin work_orders" on public.work_orders for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "taller ve sus OT" on public.work_orders for ALL to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "tecnico actualiza sus ordenes" on public.work_orders for UPDATE to authenticated
  using ((technician_id IN ( SELECT my_staff_ids() AS my_staff_ids)))
  with check ((technician_id IN ( SELECT my_staff_ids() AS my_staff_ids)));

create policy "tecnico ve sus ordenes" on public.work_orders for SELECT to authenticated
  using ((technician_id IN ( SELECT my_staff_ids() AS my_staff_ids)));

create policy "owner ve sus modulos" on public.workshop_modules for SELECT to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "super_admin modulos" on public.workshop_modules for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "admin workshop_reviews" on public.workshop_reviews for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "taller gestiona resenas" on public.workshop_reviews for ALL to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "ver resenas publicas" on public.workshop_reviews for SELECT to public
  using ((is_public = true));

create policy "owner ve config" on public.workshop_settings for ALL to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "super_admin settings" on public.workshop_settings for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "staff ve su fila" on public.workshop_staff for SELECT to authenticated
  using ((user_id = auth.uid()));

create policy "super_admin staff" on public.workshop_staff for ALL to public
  using ((get_my_role() = 'super_admin'::text));

create policy "taller ve su staff" on public.workshop_staff for ALL to public
  using ((workshop_id IN ( SELECT workshops.id
   FROM workshops
  WHERE (workshops.owner_id = auth.uid()))));

create policy "equipo ve su taller" on public.workshops for SELECT to authenticated
  using ((workshop_role(id) IS NOT NULL));

create policy "owner edita su taller" on public.workshops for UPDATE to public
  using ((owner_id = auth.uid()));

create policy "owner ve su taller" on public.workshops for SELECT to public
  using ((owner_id = auth.uid()));

create policy "super_admin workshops" on public.workshops for ALL to public
  using ((get_my_role() = 'super_admin'::text));
