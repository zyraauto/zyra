🚗 ZYRA AUTO SaaS - Master Product & Architecture Document (PRD)
🎯 1. Visión General del Producto
Zyra es un SaaS multi-tenant (Multi-taller) integral diseñado para administrar la operación completa de talleres mecánicos y centros de servicio automotriz.
El objetivo es centralizar: CRM + ERP + Taller (Operación) + Inventario + Ventas + Facturación + Marketing, permitiendo que cada taller se autogestione de manera independiente.

🛠️ 2. Stack Tecnológico (Estrategia Zero-Cost / Capa Gratuita)
Para garantizar que el desarrollo y despliegue inicial sean 100% gratuitos, utilizaremos el siguiente stack aprovechando sus Free Tiers:

Frontend & SSR: Next.js (App Router) + React + Tailwind CSS. (Despliegue en Vercel - Plan Hobby).

Backend & Base de Datos: Supabase (PostgreSQL, Auth, Storage y Edge Functions). Nos da base de datos relacional, autenticación y políticas de seguridad gratis.

Gestión de Estado Local: Zustand (ligero, rápido y evita re-renders innecesarios).

Validación de Datos: Zod + React Hook Form (Seguridad desde el cliente hasta el servidor).

Gestión de Medios: Cloudinary (Plan gratuito para imágenes de vehículos y logotipos, liberando el almacenamiento de Supabase).

Geolocalización y Estandarización Fiscal: Catálogo Cepomex (Descargado en TXT e inyectado a la base de datos para no pagar APIs de terceros).

🔐 3. Arquitectura Multi-Tenant (Seguridad y Escalabilidad)
Esta es la regla de oro del proyecto: Un taller jamás debe ver los datos de otro.

A. Aislamiento Lógico (Row Level Security - RLS)
No confiaremos la seguridad al Frontend. Toda la seguridad vivirá en PostgreSQL mediante RLS.

Toda tabla operativa (clientes, citas, vehículos, ventas) tendrá una columna obligatoria: tenant_id.

El JWT de Supabase Auth inyectará el tenant_id del usuario al iniciar sesión.

PostgreSQL bloqueará automáticamente cualquier consulta que no coincida con el tenant_id del usuario, garantizando seguridad absoluta a nivel base de datos.

B. Rendimiento y Velocidad
Índices (Indexing): Toda columna tenant_id será indexada desde el día 1 para que las búsquedas entre millones de registros sean instantáneas.

🗄️ 4. Evolución de la Base de Datos (Dominios)
Para mantener el sistema escalable y fácil de mantener, dividiremos la base de datos en 3 Dominios Lógicos:

Dominio 1: Global (Sin tenant_id)
Datos compartidos por todo el SaaS.

cepomex_states, cepomex_municipalities, cepomex_zip_codes (Para direcciones estandarizadas y CFDI 4.0).

vehicle_brands, vehicle_models, vehicle_years (Catálogo maestro automotriz).

saas_plans (Planes de suscripción de nuestra plataforma).

Dominio 2: Administrativo / Configuración (Control del SaaS)
tenants (Perfil del taller: nombre, logo, horarios).

users (Usuarios globales ligados a Supabase Auth).

tenant_users (Tabla pivote: Qué usuario pertenece a qué taller y qué Rol tiene: SuperAdmin, Admin, Reception, Mechanic).

Dominio 3: Operativo (Con tenant_id obligatorio)
CRM: customers, customer_communications.

Taller: vehicles, appointments, quotes, work_orders (diagnóstico, fotos, técnico asignado).

Inventario & Catálogo: services_catalog, products, inventory_movements, suppliers.

Finanzas: sales, invoices, expenses.

📍 5. Integración de CEPOMEX y Preparación Fiscal (CFDI 4.0)
Para que el sistema sea profesional y esté listo para la facturación electrónica en México (CFDI 4.0) sin costos extra:

Descargaremos el archivo oficial cpdescarga.txt.

Crearemos un script para poblar las tablas Globales de estados, municipios, colonias y códigos postales en Supabase.

Beneficio: Cuando el taller registre a un cliente y escriba un Código Postal, el sistema autocompletará Estado, Municipio y Colonia de forma local (velocidad instantánea, 0 costo de API). Esto garantiza que los datos fiscales sean 100% correctos cuando en el futuro se conecte una API de facturación.

🔄 6. Flujo de Negocio Principal (El Core del Sistema)
Cualquier desarrollo debe respetar este ciclo de vida:

Recepción: Cliente nuevo/existente llega con un Vehículo. Se valida su dirección con Cepomex.

Cita / Cotización: Se levanta la Cita. Se genera una Cotización (Servicios + Refacciones estimadas).

Ingreso: El cliente aprueba. La Cotización se convierte en Orden de Servicio (Estado: En Progreso).

Taller: El Mecánico actualiza la Orden (Diagnóstico, añade fotos a Cloudinary, solicita refacciones).

Finalización: Orden cambia a estado Completado.

Punto de Venta (POS): La Orden de Servicio se convierte en una Venta. Se descuenta el inventario y se registra el ingreso.

Facturación & Historial: Opción a generar CFDI. El vehículo actualiza su historial.

Marketing Automático: El sistema agenda un evento a 6 meses para enviar un recordatorio por WhatsApp.

🏗️ 7. Convenciones de Desarrollo y Mantenimiento (Reglas para la IA)
Para que el código no se vuelva espagueti conforme crezca el proyecto:

Componentes Tontos e Inteligentes: Las vistas (app/) solo renderizan UI. Toda lógica de llamadas a Supabase vive separada en servicios (ej. src/lib/services/customerService.ts).

Transacciones SQL (RPC): Operaciones complejas (como cerrar una orden, generar una venta y descontar inventario) no se harán con múltiples llamadas desde el Frontend. Crearemos Funciones (RPC) en PostgreSQL para que se ejecuten en un solo paso, garantizando que si algo falla, no haya ventas fantasma.

Tipado Estricto: Utilizaremos el generador de tipos de Supabase (npx supabase gen types) para que TypeScript sepa exactamente qué columnas tiene la base de datos.

Modularidad de UI: Usaremos componentes de UI reutilizables (como los de shadcn/ui) para mantener coherencia visual (botones, tablas, modales).

🗺️ 8. Roadmap de Ejecución (Orden sugerido de trabajo)
Fase 1: Los Cimientos (Auth & Multi-Tenant)

Configurar Supabase, tablas tenants, users y tenant_users.

Implementar autenticación (Google/Email).

Establecer y probar las políticas RLS.

Fase 2: Catálogos Globales

Crear script de migración para inyectar Cepomex.

Crear catálogo de Marcas y Modelos de vehículos.

Fase 3: CRM y Recepción

CRUD de Clientes y Vehículos.

Dashboard base (Métricas iniciales).

Fase 4: El Corazón Operativo (Órdenes de Servicio)

Módulo de Catálogo de Servicios propios del taller.

Creación de Cotizaciones y Órdenes de Servicio (Integración con Cloudinary para fotos).

Fase 5: Finanzas e Inventario

Conversión de Órdenes a Ventas.

Control de stock y gastos.

Fase 6: Expansión (Futuro)

Integración API Facturación.

Integración API WhatsApp (Recordatorios).