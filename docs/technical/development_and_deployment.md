# Guía de Desarrollo y Despliegue

## 1. Configuración del Entorno de Desarrollo (Dev Setup)

EasyRent utiliza una arquitectura híbrida con Vite y Electron. Siga estas instrucciones para preparar su entorno local.

### Prerrequisitos
-   **Node.js**: Versión 18.x o superior (`LTS` recomendada).
-   **NPM**: Versión 9.x o superior.
-   **Git**: Para control de versiones.
-   (Opcional pero recomendado para Windows) **Build Tools para C++**: Necesario para compilar dependencias nativas como `better-sqlite3`. Instálelo ejecutando `npm install -g windows-build-tools` con permisos de administrador o mediante Visual Studio Installer.

### Pasos de Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone <url_del_repositorio>
    cd GestionInmuebles
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Configurar Variables de Entorno (.env):**
    Copie el archivo `.env.example` a `.env` y configure las llaves correspondientes. El archivo `.env.example` define las llaves públicas de Supabase para la función Cloud Sync.
    ```env
    # Variables de acceso a la nube pública HRA
    SUPABASE_URL="https://tu-proyecto.supabase.co"
    SUPABASE_ANON_KEY="tu-anon-key-larga"
    ```

### Ejecutar el Servidor de Desarrollo

Para trabajar simultáneamente en el proceso de Renderizado (React/Vite) y el Proceso Principal (Electron), ejecute:
```bash
npm run dev
```
Esto lanzará dos procesos concurrentemente (`concurrently`):
-   Un servidor Vite en `http://localhost:5173`.
-   La ventana de Electron apuntando a esa misma URL. El Hot Module Replacement (HMR) funcionará en los componentes React de inmediato. Si edita `main.js` o scripts de backend, debe recargar la ventana de Electron (Ctrl+R / Cmd+R).

## 2. Compilación y Empaquetado (Build & Release)

La meta final es generar un ejecutable (`.exe`) auto-contenido e instalable, el cual no demande de Node.js en las computadoras de los clientes de HRA Estadística. Se emplea `electron-builder` para ello.

### Flujo de Compilación (Scripts NPM)

1.  **Compilar Frontend (Vite):**
    ```bash
    npm run build:renderer
    ```
    Esto transmuta el JSX/Tailwind desde `/src/` hacia HTML/JS/CSS minificado que acaba en `/dist-renderer/`.
    
2.  **Empaquetar la Aplicación hacia instalador .EXE:**
    ```bash
    npm run build:win
    ```
    Llama internamente a `electron-builder --win --x64`. Electron Builder leerá la llave `"build"` del `package.json` para saber qué empaquetar de las carpetas `/electron/`, `/public/` y `/dist-renderer/`. El producto final estará en la carpeta `/dist`.

3.  **Compilación Limpia (Full Clean Build):**
    Recomendado antes de entregar un Release final. Refresca e invoca ambas tareas superiores:
    ```bash
    npm run build:clean
    ```

## 3. Despliegue del Sistema Analógico "Punto de Venta"

Dado que es un software nativo, el modo estándar de despliegue ("Distribución") es entregar el instalador empaquetado `EasyRent Setup 1.0.0.exe` a los administradores inmobiliarios.

El usuario solo hará doble clic, permitiendo a Windows instalar la aplicación en su carpeta AppData u originando un atajo en el escritorio por defecto gracias al sistema **NSIS (Nullsoft Scriptable Install System)** configurado en `package.json`.

Al instalar:
-   Los datos guardados (`easyrent.db`), las fotos locales subidas (`/uploads/`) y los logs formarán su estado interno en la carpeta: `C:\Users\<USUARIO>\AppData\Roaming\EasyRent`.
-   Esto salvaguarda sus finanzas aunque el cliente "desinstale" la aplicación. Se actualizará leyendo esa carpeta.

## 4. Distribución del Backend Remoto (Supabase Cloud Backup)

Si se compran "Licencias Híbridas", la funcionalidad de sincronización (Cloud Sync) requiere un proyecto vivo de Supabase. A diferencia de las bases de datos de usuario final disjuntas localmente, la nube actúa como un almacenamiento centralizado multi-tenant.

**Paso a despliegue en la Nube de Supabase:**
1. Crear un proyecto nuevo en la cónsola de Supabase de **HRA Estadistica**.
2. Desplegar los scripts SQL del modelo de modelo de datos (`/docs/technical/data_model.md`) directamente en el Editor de SQL del Dashboard de Supabase, imitando la estructura de local a red con el agregado de RLS (Row Level Security).
3. Asegurarse que la autenticación de email y subida de archivos (Storage) a "easyrent_cloud_bucket" estén públicas para los Tokens emitidos a las licencias pagadas.

## 5. Licenciamiento & Activación de Usuarios Finales

-   El sistema está diseñado para venderse bajo planes prepagos ("keys" o códigos seriales).
-   El administrador/cliente descarga el instalador público, pero al no tener conectividad oficial, será bloqueado por un portal local `LicenseClaim.jsx` / `LicenseValidator.jsx`, previniendo que manejen sus finanzas sin antes digitar un Serial.
-   Ese serial se amarra asimétricamente a su identificador de PC (`HWID`). El servidor externo de HRA anota ese uso, previniendo clonación de instancias e imponiendo las reglas del negocio.
