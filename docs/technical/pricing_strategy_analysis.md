# Análisis Competitivo y Estrategia de Precios (EasyRent)

Este documento presenta un análisis de mercado de los principales software de gestión inmobiliaria a nivel global y regional (LATAM), con el objetivo de sustentar la estrategia de precios para los 3 planes de **EasyRent** (Desktop, Hybrid, Cloud).

## 1. Análisis de Competidores Globales

Los competidores globales suelen estar orientados a carteras grandes e incluyen características avanzadas como contabilidad compleja, portales web para inquilinos y cobro automático de rentas.

| Plataforma | Plan Básico / Inicio | Costo por Unidad | Notas Adicionales |
| :--- | :--- | :--- | :--- |
| **Buildium** | $55 - $62 / mes | N/A (Por tramos) | Enfocado en < 150 unidades. Cobra tarifas de instalación ($99) y por transacciones electrónicas. Planes superiores superan los $174/mes. |
| **AppFolio** | $280 / mes (Mínimo) | $1.49 / unidad | Dirigido a grandes portafolios (Mínimo 50 unidades recomendadas). Incluye tarifas de onboarding obligatorias basadas en el tamaño de la cartera. |
| **TenantCloud** | $18 / mes (Starter) | N/A (Unidades Ilimitadas) | Muy popular para rentistas pequeños (DIY). El plan intermedio cuesta $35/mes. Es el competidor global más cercano en precio, pero 100% web. |

## 2. Análisis de Competidores Regionales (LATAM / España)

Las herramientas en español y adaptadas al mercado latinoamericano suelen tener precios más accesibles, pero a menudo se enfocan más en el CRM (venta/captación) que puramente en la _gestión contable de alquileres_ como EasyRent.

| Plataforma | Plan Básico / Inicio | Costo por Unidad | Notas Adicionales |
| :--- | :--- | :--- | :--- |
| **Wasi** | $27 / mes ($324/año) | N/A (Ilimitado) | Fuerte enfoque en Red Inmobiliaria, páginas web web y alianzas. Permite propiedades ilimitadas. 1 Usuario. |
| **Tokko Broker** | ~$75 / mes (Dúo) | N/A | Muy posicionado como CRM para publicar en portales (Inmuebles24, Urbania). Costoso para pequeños rentistas puros. |
| **Rentger** | €3.75 / mes por activo | Sí | Tiene plan gratuito hasta 9 inmuebles. Si gestionas 50 propiedades, el costo asciende a aprox. $100 - $187 USD al mes. |

## 3. Conclusiones del Mercado

1.  **Hay un vacío (Gap) en el mercado para soluciones puramente Offline/Locales.** Casi el 100% de la competencia obliga a la suscripción mensual/anual basada en la nube. Muchos administradores tradicionales en LATAM son recelosos de tener sus finanzas en la nube pública.
2.  **Los costos de entrada son altos.** Software como Buildium o AppFolio dejan fuera al inversor de 15 a 30 propiedades.
3.  **El cobro por "Unidad" castiga el crecimiento.** Plataformas como Rentger o AppFolio merman la rentabilidad del administrador a medida que crece.

## 4. Estrategia de Precios para EasyRent (Propuesta)

Dada la arquitectura de **EasyRent** (Electron local + SQLite + Sincronización Opcional Supabase), proponemos un modelo de **Pago Único (Perpetuo)** para el software local, combinado con un modelo escalonado estándar para servicios en la nube.

Esta estrategia es altamente disruptiva y atractiva en LATAM, donde se prefiere poseer el activo (el software) en lugar de rentarlo de por vida.

### Plan 1: Desktop (Local Perpetuo) - "Paga una vez, úsalo siempre"
-   **Enfoque:** Administradores clásicos que trabajan desde su oficina sin necesidad de llevarse la data a casa o al celular. Privacidad total (datos en su PC).
-   **Características:** Todas las funcionalidades activas (Inmuebles, Contratos, Finanzas, Mantenimiento, Exportación a Excel/PDF). Inmuebles **ilimitados**. Sin sincronización web.
-   **Precio Sugerido:** **$149 USD** (Pago único de por vida).
-   _Justificación:_ Equivale a 5 meses de Wasi o 2 meses de TokkoBroker. El administrador ahorra infinitamente a partir del mes 6.

### Plan 2: Hybrid (Desktop + Backup en la Nube) - "Seguridad y Tranquilidad"
-   **Enfoque:** Operadores locales que valoran tener su base de datos respaldada en caso de robo o daño del disco duro de su oficina.
-   **Características:** Todo lo del plan Desktop **+** Botón de Sincronización Automática a Supabase. Si su PC se daña, instala el software en una nueva y recupera todo.
-   **Precio Sugerido:** **$199 USD** (Software permanente) + **$49 / año** (Suscripción al servicio Cloud Sync).
-   _Justificación:_ El costo anual ($49) es extremadamente competitivo comparado con el hospedaje más barato de TenantCloud ($216/año). Cubre los costos de servidor de HRA Estadística.

### Plan 3: Cloud / Web (Multi-dispositivo) - "Para las Agencias Modernas"
*Nota: Este plan requiere el desarrollo futuro de un front-end puramente web (Next.js/React hospedado) conectando directamente a Postgres, tal como Wasi.*
-   **Enfoque:** Agencias con múltiples trabajadores simultáneos (comerciales, cobradores, gerentes) operando al mismo tiempo desde distintas ciudades o dispositivos (PC, Múltiples Laptops, Tablets).
-   **Características:** SaaS clásico 100% online. Multi-usuario con roles.
-   **Precio Sugerido:** **$29 / mes** (facturado anualmente a $348/año).
-   _Justificación:_ Se posiciona directamente a competir contra Wasi, ofreciendo mejor UI/UX y más enfoque financiero que comercial.

## 5. Resumen de Propuesta de Valor

Al cobrar una tarifa única atractiva para la versión Desktop, **EasyRent logrará una penetración de mercado masiva e inmediata** entre los arrendadores informales y pequeños administradores en LATAM que hoy usan Excel y se resisten a pagar membresías perpetuas de $30 dólares mensuales a softwares extranjeros.
