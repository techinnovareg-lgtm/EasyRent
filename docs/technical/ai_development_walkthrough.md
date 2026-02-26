# AI Agent Walkthrough: Desarrollo de EasyRent

Este documento está diseñado específicamente para proveer contexto inmediato a cualquier Agente de Inteligencia Artificial (AI Agent) que se integre al proyecto **EasyRent** en el futuro. Resume el ciclo de vida completo del desarrollo, las decisiones de diseño claves, la arquitectura profunda, y el estado actual del código fuente, permitiendo a la IA "ponerse al día" (onboarding) sin necesidad de escanear todo el repositorio secuencialmente.

## 1. Visión General del Proyecto (Contexto del Sistema)

*   **Nombre:** EasyRent (Gestión de Inmuebles).
*   **Propósito:** Sistema de escritorio/híbrido enfocado en simplificar y automatizar la gestión contable y administrativa de propiedades (inmuebles), inquilinos y sus respectivos contratos de arrendamiento.
*   **Target:** Administradores de inmuebles, agencias de rentas y propietarios arrendadores particulares (Cliente primario: HRA Estadística).
*   **Stack Principal:** Electron JS (Main) + React 18, Vite, Tailwind CSS (Renderer) + SQLite (DB Local) + Supabase (Cloud Sync).
*   **Arquitectura Clave:** Las operaciones de Base de Datos ocurren síncronamente en el Proceso Principal de Node.js via IPC para máxima velocidad y seguridad, aislando totalmente la vista (SPA).

## 2. Hitología del Desarrollo (Timeline & Fases de Implementación)

### Fase 1: Ingeniería Básica e Inicialización (Setup)
*   **Decisión Crítica:** Se descartó el uso de bases de datos centralizadas en la nube como única fuente de la verdad para priorizar el funcionamiento "Offline First" (Local) característico de un Punto de Venta (POS). Se optó por `better-sqlite3`.
*   **Estructura Base:** El proyecto integró Vite como bundler del frontend (`src/`) y un hilo ejecutable node plano para el backend (`electron/`).
*   **Integración IPC Segura:** Se estableció el patrón de `ContextBridge` en `preload.js` para exponer funciones a React bajo el namespace global de lectura `window.easyrent`.

### Fase 2: Diseño de Interfaz y Estructura de Módulos (UI/UX)
*   **Tema Oscuro (Sleek Dark Mode):** El CSS global (`index.css`) fue configurado para anular paletas corporativas aburridas en favor de una apariencia premium. El fondo `#0f172a` ancla el look general.
*   **Componentización:** Se definió un Layout matriz y un sistema de enrutamiento con `react-router-dom` v6. Se separó la lógica en "Modules", que a su vez se dividieron en vistas: "List" (Tablas) y "Form" (Creación/Edición).
*   **Animación Estándar:** Introducción de `framer-motion` para suavizar montajes del React DOM, dotando a la app de sentimiento de "velocidad y ligereza".

### Fase 3: Bases de Datos y Entidades de Negocio (Core Logic)
1.  **Propiedades (`properties`):** Se introdujo la llave recursiva `parent_id` resolviendo el problema lógico de rentar edificios vs. sub-unidades departamentales de una forma elegante en la misma tabla.
2.  **Inquilinos (`tenants`):** Registro de perfil plano. Implementación del *Soft-Delete* (`is_active = 0`) para preservar históricos financieros contables vitales.
3.  **Contratos (`contracts`):** Actúa como tabla pivote. Dicta la línea de tiempo obligacional entre un Inquilino y una Propiedad.
4.  **Finanzas (`finances`):** Implementación de Libro Diario y Mayor cruzado. Diferencia entre Ingresos (Rentabilidad) y Egresos (Mantenimiento, Daños).

### Fase 4: Sistemas Satélite y Monitoreo Financiero
*   **Dashboard y Vistas Agrupadas:** Creación de `v_dashboard` directo en base de datos para delegar el "number-crunching" pesado a SQL en lugar de filtrar enormes arrays JSON en el hilo principal JS.
*   **Mantenimiento (`maintenance_tickets`):** Incorporado posteriormente para enlazar peticiones de daño estructural y derivar sus resoluciones directamente hacia la tabla `finances` como egreso certificado.
*   **Licenciamiento y Seguridad (DRM Básico):** Módulo para prever fraude en la re-venta del instalador. Lectura del Hash Hardware (HWID) del CPU/Mainboard del PC para entrelazar localmente al "License Key" otorgado, impidiendo clonación vía UBS.

### Fase 5: Almacenamiento Remoto e Hibridación Web (Cloud Sync)
*   Se introdujo **Supabase** (`cloudSync.js`). En planes licenciados tipo *"Hybrid"*, se permite sincronizar transaccionalmente el Ledger local (vía REST/Postgrest) al bucket e instancia SQL en la nube, garantizando resiliencia contra corrupción de HDD, borrados accidentales del `appData` o robos del equipo terminal.

## 3. Guía Estilística y Patrones para Agentes IA 🤖

Si como Inteligencia Artificial se te solicita extender, refactorizar o arreglar un *bug* en EasyRent, atente a estos mandamientos inviolables del proyecto:

1.  **Nunca saltes a la Vista Directo:** Todos los datos fluyen unidireccionalmente. Si hay que agregar un campo (ej: "Fecha de Nacimiento" del Inquilino), primero altera la Migración dinámica en `database.js` -> luego el *Query* de inserción/actualización -> por último, el bloque React.
2.  **Migraciones "Lazy" en SQLite:** Revisa `database.js` bajo el método `ensureColumn`. No se emplean ORM rígidos de Typescript (ej. Prisma o TypeORM) para preservar el bajo tamaño del bundle. Muta la base con PRAGMAS y adiciones simples al hilo.
3.  **UI Minimalista y Utilidades Tailwind:**
    *   No crees archivos `.css` modulares interminables, excepto para reset o importaciones webfonts. Usa las clases estándar de Tailwind respetando la paleta "slate".
    *   No incorpores librerías enormes tipo *Material-UI* o *AntDesign*, el sistema se autogestiona con componentes funcionales propios armados con piezas crudas (Divs manipulados) y Lucide-React. Interés en lo visual sin inflado tecnológico (Bloatware).
4.  **Gestor de Estados:** No integres *Redux* o *Zustand* al azar. Gran parte de la aplicación vive del refresco inducido de `useEffect`, jalando información fresca del SQLite asíncronamente en cada montaje de módulo.
5.  **Multi-idioma Reactivo (Translations):** Toda adición de texto legible en los menús, reportes o *labels*, debe agregarse en español (`es`) respectivo en la carpeta de traducciones para ser parseado por `LanguageContext` mediante el Hook custom `{ t } = useLanguage()`. No escribas cadenas quemadas (Hardcoded UI Strings).
6.  **Errores en "Proceso Principal":** Logs valiosos de un cuelgue profundo de backend no se verán en las Developer Tools de React (Chrome DevTools). Tienes que revisar obligatoriamente el archivo plano `app-startup.log` en el directorio de usuario (AppData de Windows) implementado internamente en `main.js`.
