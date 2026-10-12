# 🚗 ARCHITECTURE.md - Zyra Auto SaaS

> **Propósito de este documento:** Este archivo define las reglas arquitectónicas, los patrones de diseño, las tecnologías y los límites de seguridad inquebrantables para el desarrollo de la plataforma Zyra Auto SaaS. Cualquier agente de IA, desarrollador o contribuyente debe seguir estrictamente estas directrices para mantener la escalabilidad, la seguridad y la integridad de los datos.

---

## 1. Visión General del Producto
Zyra Auto SaaS es una plataforma multi-taller (multi-tenant) de gestión integral para talleres mecánicos y centros de servicio automotriz. Integra de forma nativa:
* **ERP + CRM** automotriz.
* Gestión de citas, vehículos, órdenes de servicio y catálogos de refacciones/mano de obra.
* Módulos de ventas, control de inventario y preparación para facturación electrónica (CFDI 4.0).
* Fidelización de clientes mediante marketing y recordatorios automáticos (CRM + WhatsApp).

---

## 2. Stack Tecnológico Oficial
* **Frontend & SSR:** Next.js (App Router), React, Tailwind CSS.
* **Gestión de Estado & Formularios:** Zustand (`src/stores/`), React Hook Form + Zod.
* **Backend, Base de Datos & Auth:** Supabase (PostgreSQL, Row Level Security, RPCs, Supabase Auth con JWT).
* **Gestión de Archivos / Medios:** Cloudinary (fotografías de vehículos, logotipos de talleres, evidencias de servicio).
* **Ubicaciones & Direcciones:** Catálogo oficial de **Cepomex** (Estados, Municipios y Códigos Postales de México) para estandarización fiscal y de direcciones.
* **Despliegue & Infraestructura:** Vercel (Frontend/API routes) + Supabase Cloud (Base de datos y triggers).
* **Control de Versiones:** Git + GitHub.

---

## 3. Arquitectura Multi-Tenant y Seguridad Estricta
La plataforma está diseñada para albergar a múltiples talleres independientes (Tenants) bajo una misma base de datos lógica, garantizando aislamiento absoluto de la información.

### A. Aislamiento por `tenant_id`
* **Obligatoriedad:** Toda tabla transaccional u operativa (`customers`, `vehicles`, `work_orders`, `inventory`, `sales`, `services_catalog`, etc.) **DEBE** incluir una columna `tenant_id` de tipo UUID con clave foránea hacia la tabla `tenants`.
* **Row Level Security (RLS) en PostgreSQL:** La seguridad nunca dependerá exclusivamente del código del cliente (Frontend). Todas las tablas operativas deben tener RLS habilitado.
* **Política Base Obligatoria:**
  ```sql
  -- Ejemplo de política RLS para asegurar que el taller solo vea sus propios datos
  CREATE POLICY "Tenant isolation policy" ON public.customers
  FOR ALL 
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid)
  WITH CHECK (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);