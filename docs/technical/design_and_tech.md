# Diseño UI/UX y Stack Tecnológico

## 1. Stack Tecnológico (Tech Stack)

EasyRent emplea tecnologías modernas de desarrollo web integradas bajo el paraguas de Electron para ofrecer una experiencia nativa de escritorio rápida, mantenible y escalable.

### Frontend (Proceso de Renderizado)
- **Vite:** Herramienta de compilación ultrarrápida y servidor de desarrollo con Hot Module Replacement (HMR). Seleccionado frente a Webpack o CRA por su altísimo rendimiento inicial.
- **React 18:** Librería principal de construcción de interfaces de usuario. La aplicación emplea intensamente Context API, Hooks y Functional Components.
- **Tailwind CSS (v3.4):** Framework CSS basado en utilidades que permite estilizar componentes en línea drásticamente más rápido sin tener que abandonar el HTML (JSX).
- **Framer Motion:** Biblioteca de animaciones de grado productivo para React. Provee transiciones tersas e interacciones dinámicas de un modo declarativo (ej., en ventanas multimodales y despliegues de sub-menús).
- **React Router DOM (v6):** Manejo declarativo del enrutamiento SPA (Single Page Application) sin recarga, ideal para componentes anidados como `Layout.jsx` y su respectivo `Outlet`.
- **Lucide React:** Colección de iconografía SVG ligera y estéticamente consistente en todo el diseño.
- **Recharts:** Librería de React con base en D3.js para el dashboard gerencial, encargada de proyectar estadísticas de propiedades, ingresos vs. egresos de forma comprensible.

### Backend Integrado (Proceso Principal / Desktop Node.js)
- **Electron (v29):** Shell multiplataforma para encapsular aplicaciones de Node.js + JavaScript en ejecutables de Windows (NSIS).
- **better-sqlite3:** Driver C++ ultra eficiente de SQLite síncrono para bases de datos relacionales sin configurar un motor servidor independiente, indispensable para la operatividad offline inmediata del punto de venta (POV).
- **Electon-Builder:** Herramienta para realizar releases y compilar los archivos fuentes hacia ejecutables auto-contenidos, incluyendo su iconografía e información de autor (`appId`, `productName`).
- **@supabase/supabase-js:** Cliente oficial para consumir la infraestructura en la nube (Postgres, Storage, Auth) para la sub-funcionalidad de *Cloud Sync* en licencias híbridas.
- **node-machine-id:** Módulo central de obtención de identificadores del hardware (HWID) que aseguran de que una licencia opere legalmente en el computador asignado inicialmente.

### Utilidades Extra
- **jsPDF / jspdf-autotable:** Utilizados en la generación sobre demanda (on the fly) de facturas, contratos y recibos de pagos tabulados para ser impresos por el usuario directamente.
- **exceljs:** Lector y escritor avanzado para posibilitar importación o exportaciones masivas del catálogo hacia formato `.xlsx`.

## 2. Sistema de Diseño (Design System)

El producto ha sido diseñado centrándose fuertemente en un perfil **moderno, elegante y "premium"**. Se descartan estéticas genéricas y corporativas obsoletas, implementándose el estilo *Sleek Dark Mode*.

### 2.1 Tema Gráfico General (Dark Theme)

-   **Color de Fondo Principal (Root):** `#0f172a` (Tono derivado de `slate-900` de Tailwind). Garantiza menor fatiga visual durante jornadas administrativas extendidas, otorgando una apariencia altamente profesional y costosa.
-   **Superficies de Elementos (Cards / Paneles):** Normalmente estilizados con clases utilitarias de fondo translucido u opaco (`bg-white/5` o `bg-slate-800`), logrando una diferenciación en la jerarquía visual entre el tapiz de fondo y los paneles de contenido.
-   **Tonalidad Principal (Brand Color):** Diferentes tonalidades de acentuación basadas a menudo en gradientes cálidos sutiles o azules según el estado y módulo que evocan interactividad viva.

### 2.2 Micro-interacciones y Animaciones

Gracias a **Framer Motion**, toda la interfaz es viva (Dynamic Design):
-   Paginación y transiciones de módulos se suceden suavemente (`initial={{ opacity: 0, y: 20 }}`).
-   Las tarjetas en listas reaccionan al **Hover** de manera micro-animada (ej. suben unos píxeles o incrementan su resplandor - shadow) otorgando inmediatez en el *feedback* háptico al operador.
-   Mensajes "Toast" para avisos de corrección (pagos de contratos realizados) o excepciones.

### 2.3 Tipografía (Typography)

Se ha descartado la tipografía por defecto del navegador apostando preferentemente por variantes hiper-leíbles sans-serif traídas vía internet (ej. **Inter**, **Roboto** u **Outfit**) configurables vía `index.css`. Estas otorgan personalidad firme a la métrica contable, previniendo confusión en cuentas de inquilinos y montos a pagar.

## 3. Principios y Flujo Frontend

1.  **Encasillado de Layout (`Layout.jsx`):** Dispone siempre una barra lateral retráctil de navegación general, o superior (header), manteniendo el *Viewport* central mutable para los contextos respectivos (`<Outlet />`).
2.  **Abstracción mediante Servicios (`window.easyrent` / IPC):**
    En lugar de acoplar lógica compleja en cada interfaz visual, React envía llamadas funcionales a un nivel superior:
    ```javascript
    // Ejemplo de un Submit en Frontend de EasyRent
    const onSubmit = async (data) => {
       await window.easyrent.finances.create(data);
    }
    ```
    Lo cual lo vuelve completamente "mudo" a las particularidades de si graba en SQLite, en Memoria o en Supabase, reforzando alta cohesión y bajo acoplamiento (Clean Architecture - Data Access Layer Separation).
