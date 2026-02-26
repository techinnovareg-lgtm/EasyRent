# Guía de Despliegue en la Nube (Supabase Cloud Sync)

Esta guía detalla los pasos técnicos exactos para configurar la infraestructura en la nube necesaria para el plan "Hybrid" (Sincronización de Respaldo) y sentar las bases para el futuro plan "Cloud" (SaaS Multitenant). Se utiliza **Supabase**, el equivalente Open Source de Firebase soportado por PostgreSQL.

## 1. Creación del Proyecto en Supabase

1.  Ingrese a [Supabase.com](https://supabase.com) y acceda con la cuenta corporativa de HRA Estadística.
2.  Haga clic en **"New Project"**.
3.  Seleccione la Organización adecuada.
4.  Nombre del Proyecto: `easyrent-cloud`
5.  Defina una contraseña segura para la base de datos (Database Password) y guárdela de forma segura. No la pierda.
6.  Región: Seleccione una región cercana a la mayoría de los clientes (Ej: `US East (N. Virginia)` o `South America (São Paulo)`).
7.  Haga clic en **"Create new project"**. Espere unos minutos a que se aprovisione la base de datos y la API.

## 2. Obtención de Credenciales (API Keys)

Una vez que el proyecto esté listo, necesitamos enlazar el software Desktop/Hybrid a este backend.

1.  En el dashboard de Supabase, navegue a **Settings** (Icono de engranaje) -> **API**.
2.  Copie la **Project URL** (Ej: `https://xyz.supabase.co`).
3.  Copie la **Project API Key (anon, public)**.
4.  Pegue estas dos variables en el archivo `.env` del proyecto de EasyRent antes de compilar (o configúrelas en el empaquetador para que se incluyan de forma ofuscada).

```env
SUPABASE_URL=https://<tu-id>.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
```

## 3. Despliegue de la Base de Datos (PostgreSQL)

Necesitamos replicar las tablas vitales que están en el SQLite local (`database.js`) hacia Postgresql en Supabase. Supabase utilizará un modelo multi-inquilino (Multi-tenant), por lo que debemos asegurarnos de que los registros de cada cliente de escritorio estén aislados (Ej. atándolos a un `user_id` de Auth).

1.  Vaya a la sección **SQL Editor** en Supabase.
2.  Haga clic en **"New query"**.
3.  Pegue y ejecute el siguiente script SQL (Versión base para Cloud Sync):

```sql
-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: properties
CREATE TABLE IF NOT EXISTS public.properties (
    id SERIAL PRIMARY KEY,
    owner_id UUID REFERENCES auth.users NOT NULL, -- Agregado para aislar datos por cliente
    name TEXT NOT NULL,
    type TEXT DEFAULT 'casa',
    address TEXT,
    city TEXT,
    province TEXT,
    district TEXT,
    area_m2 REAL,
    levels INTEGER DEFAULT 1,
    bedrooms INTEGER,
    bathrooms INTEGER,
    floor INTEGER,
    unit_number TEXT,
    has_elevator BOOLEAN DEFAULT false,
    has_stairs BOOLEAN DEFAULT false,
    has_terrace BOOLEAN DEFAULT false,
    has_rooftop BOOLEAN DEFAULT false,
    has_parking BOOLEAN DEFAULT false,
    has_garden BOOLEAN DEFAULT false,
    has_kitchen BOOLEAN DEFAULT false,
    has_dining_room BOOLEAN DEFAULT false,
    has_laundry BOOLEAN DEFAULT false,
    has_living_room BOOLEAN DEFAULT false,
    shared_amenities JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'disponible',
    is_active BOOLEAN DEFAULT true,
    parent_id INTEGER REFERENCES public.properties(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Tabla: tenants
CREATE TABLE IF NOT EXISTS public.tenants (
    id SERIAL PRIMARY KEY,
    owner_id UUID REFERENCES auth.users NOT NULL,
    full_name TEXT NOT NULL,
    doc_type TEXT DEFAULT 'DNI',
    doc_number TEXT NOT NULL,
    doc_image_path TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    occupation TEXT,
    emergency_contact TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Tabla: contracts
CREATE TABLE IF NOT EXISTS public.contracts (
    id SERIAL PRIMARY KEY,
    owner_id UUID REFERENCES auth.users NOT NULL,
    property_id INTEGER REFERENCES public.properties(id) ON DELETE CASCADE,
    tenant_id INTEGER REFERENCES public.tenants(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent NUMERIC(15,2) NOT NULL,
    deposit_amount NUMERIC(15,2) DEFAULT 0,
    currency TEXT DEFAULT 'PEN',
    status TEXT DEFAULT 'activo',
    contract_file_path TEXT,
    payment_day INTEGER DEFAULT 1,
    tax_rate NUMERIC(5,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Tabla: finances
CREATE TABLE IF NOT EXISTS public.finances (
    id SERIAL PRIMARY KEY,
    owner_id UUID REFERENCES auth.users NOT NULL,
    contract_id INTEGER REFERENCES public.contracts(id) ON DELETE SET NULL,
    property_id INTEGER REFERENCES public.properties(id) ON DELETE CASCADE,
    tenant_id INTEGER REFERENCES public.tenants(id) ON DELETE SET NULL,
    type TEXT CHECK(type IN ('ingreso','egreso')) NOT NULL,
    category TEXT DEFAULT 'renta',
    amount NUMERIC(15,2) NOT NULL,
    late_fee NUMERIC(15,2) DEFAULT 0,
    currency TEXT DEFAULT 'PEN',
    payment_date DATE,
    due_date DATE,
    period_month TEXT,
    status TEXT DEFAULT 'pendiente',
    tax_rate NUMERIC(5,2) DEFAULT 0,
    tax_amount NUMERIC(15,2) DEFAULT 0,
    voucher_path TEXT,
    receipt_paths JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Tabla: maintenance_tickets
CREATE TABLE IF NOT EXISTS public.maintenance_tickets (
    id SERIAL PRIMARY KEY,
    owner_id UUID REFERENCES auth.users NOT NULL,
    property_id INTEGER REFERENCES public.properties(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    photos JSONB DEFAULT '[]'::jsonb,
    estimated_cost NUMERIC(15,2) DEFAULT 0,
    actual_cost NUMERIC(15,2) DEFAULT 0,
    finance_id INTEGER REFERENCES public.finances(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

## 4. Configurar Row Level Security (RLS) - ¡Crítico!

Para evitar que los datos de un administrador inmobiliario se mezclen gráficamente (o de forma maliciosa) con los de otro cliente, **es obligatorio 100% habilitar Row Level Security**. 
Esto le dice a la base de datos: *"Solo permite ver/insertar/borrar registros donde el `owner_id` coincida con el ID del usuario logueado en la aplicación Desktop actualmente"*.

Vaya de nuevo al **SQL Editor** y ejecute:

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;

-- Crear Políticas (Policies)
-- PROPERTIES
CREATE POLICY "Users can manage their own properties"
ON public.properties FOR ALL
USING (auth.uid() = owner_id);

-- TENANTS
CREATE POLICY "Users can manage their own tenants"
ON public.tenants FOR ALL
USING (auth.uid() = owner_id);

-- CONTRACTS
CREATE POLICY "Users can manage their own contracts"
ON public.contracts FOR ALL
USING (auth.uid() = owner_id);

-- FINANCES
CREATE POLICY "Users can manage their own finances"
ON public.finances FOR ALL
USING (auth.uid() = owner_id);

-- MAINTENANCE
CREATE POLICY "Users can manage their own tickets"
ON public.maintenance_tickets FOR ALL
USING (auth.uid() = owner_id);
```

## 5. Configurar Supabase Storage (Para Imágenes y PDFs)

Los contratos subidos y respaldados, además de fotos de mantenimiento, deben ir a un "Bucket".

1.  Navegue a **Storage** en el menú izquierdo.
2.  Haga clic en **"New bucket"**.
3.  Nombre del bucket: `easyrent_storage`
4.  Marque la opción de **Public bucket** (Si desea que los enlaces a imágenes en el PDF renderizado por React abran sin lidiar con tokens JWT temporales. En su defecto, déjelo privado pero la app Desktop deberá forjar URLs firmadas).
5.  Vaya a **Policies** en Storage y agregue una política para permitir a usuarios Autenticados (Authenticated) realizar operaciones `SELECT`, `INSERT`, `UPDATE`, y `DELETE` en este bucket.

```sql
-- (Ejemplo de Política de Storage SQL si lo automatiza por Editor)
CREATE POLICY "Permitir full control a usuarios auth"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'easyrent_storage' AND auth.uid() = owner);
```

## 6. Sincronización Push desde Electron

Con estas tablas creadas y seguras, el módulo `/electron/cloudSync.js` de la aplicación EasyRent utilizará el SDK de javascript (`@supabase/supabase-js`) para:

1. Autenticar al usuario local utilizando su email entregado por HRA a la hora de comprar el Plan "Hybrid".
2. Realizar un borrado seguro de sus tablas web (Ej. `DELETE FROM properties WHERE owner_id = auth.user()`).
3. Empujar secuencialmente la exportación SQLite local entera bajo formato JSON (Upsert masivo).

***¡Listo! La bóveda online estará preparada para recibir backups de todos los clientes "Hybrid" segregados de forma 100% segura gracias a Row Level Security (RLS).***
