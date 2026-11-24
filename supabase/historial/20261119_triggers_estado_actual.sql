-- Foto del estado de produccion (zyra-db) al 19-nov-2026, exportada de la base. SOLO REFERENCIA: ya esta aplicado. No ejecutar desde migrations/.

CREATE TRIGGER accounts_payable_folio BEFORE INSERT ON public.accounts_payable FOR EACH ROW EXECUTE FUNCTION set_accounts_payable_folio();

CREATE TRIGGER accounts_payable_updated_at BEFORE UPDATE ON public.accounts_payable FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER appointments_folio BEFORE INSERT ON public.appointments FOR EACH ROW EXECUTE FUNCTION set_appointment_folio();

CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER billing_invoices_updated_at BEFORE UPDATE ON public.billing_invoices FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER car_brands_updated_at BEFORE UPDATE ON public.car_brands FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER car_model_years_updated_at BEFORE UPDATE ON public.car_model_years FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER car_models_updated_at BEFORE UPDATE ON public.car_models FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER customer_vehicles_updated_at BEFORE UPDATE ON public.customer_vehicles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER inspection_templates_updated_at BEFORE UPDATE ON public.inspection_templates FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER invoices_folio BEFORE INSERT ON public.invoices FOR EACH ROW EXECUTE FUNCTION set_invoice_folio();

CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER parts_updated_at BEFORE UPDATE ON public.parts FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER payments_folio BEFORE INSERT ON public.payments FOR EACH ROW EXECUTE FUNCTION set_payment_folio();

CREATE TRIGGER platform_brand_tiers_updated_at BEFORE UPDATE ON public.platform_brand_tiers FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER protect_profile_role BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION protect_profile_role();

CREATE TRIGGER po_item_received_trigger AFTER UPDATE OF quantity_received ON public.purchase_order_items FOR EACH ROW EXECUTE FUNCTION handle_po_item_received();

CREATE TRIGGER purchase_order_items_updated_at BEFORE UPDATE ON public.purchase_order_items FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER purchase_orders_folio BEFORE INSERT ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION set_purchase_order_folio();

CREATE TRIGGER purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER quotes_folio BEFORE INSERT ON public.quotes FOR EACH ROW EXECUTE FUNCTION set_quote_folio();

CREATE TRIGGER quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER service_catalog_updated_at BEFORE UPDATE ON public.service_catalog FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER supplier_payment_trigger AFTER INSERT ON public.supplier_payments FOR EACH ROW EXECUTE FUNCTION handle_supplier_payment();

CREATE TRIGGER supplier_payments_folio BEFORE INSERT ON public.supplier_payments FOR EACH ROW EXECUTE FUNCTION set_supplier_payment_folio();

CREATE TRIGGER suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER user_cars_updated_at BEFORE UPDATE ON public.user_cars FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER vehicle_documents_updated_at BEFORE UPDATE ON public.vehicle_documents FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER vehicle_inspections_updated_at BEFORE UPDATE ON public.vehicle_inspections FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER work_order_parts_updated_at BEFORE UPDATE ON public.work_order_parts FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER work_order_services_updated_at BEFORE UPDATE ON public.work_order_services FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER work_order_status_audit AFTER UPDATE OF status ON public.work_orders FOR EACH ROW EXECUTE FUNCTION log_work_order_status_change();

CREATE TRIGGER work_orders_folio BEFORE INSERT ON public.work_orders FOR EACH ROW EXECUTE FUNCTION set_work_order_folio();

CREATE TRIGGER work_orders_guard_technician BEFORE UPDATE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION guard_work_order_technician();

CREATE TRIGGER work_orders_updated_at BEFORE UPDATE ON public.work_orders FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER workshop_modules_updated_at BEFORE UPDATE ON public.workshop_modules FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER workshop_settings_updated_at BEFORE UPDATE ON public.workshop_settings FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER workshop_staff_updated_at BEFORE UPDATE ON public.workshop_staff FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER on_workshop_created AFTER INSERT ON public.workshops FOR EACH ROW EXECUTE FUNCTION handle_new_workshop();

CREATE TRIGGER workshops_updated_at BEFORE UPDATE ON public.workshops FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
-- Trigger sobre auth.users (esquema auth, fuera del filtro 'public' de la exportacion). Agregado desde consulta del 23-nov-2026.
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
