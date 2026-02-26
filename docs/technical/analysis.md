# Análisis del Sistema EasyRent

## 1. Definición del Problema

La gestión manual de propiedades inmobiliarias (casas, departamentos, locales) presenta múltiples desafíos para los administradores y propietarios:
- Dificultad para mantener un registro actualizado del estado de cada inmueble.
- Pérdida de control sobre los contratos de arrendamiento, fechas de vencimiento y renovaciones.
- Ineficiencia en el seguimiento de los pagos de alquileres, generando morosidad y descontrol financiero.
- Falta de un registro centralizado para los inquilinos y su historial.
- Complicaciones para registrar y hacer seguimiento a las solicitudes de mantenimiento de las propiedades.
- Carencia de información estadística y reportes claros para la toma de decisiones.

## 2. Visión del Producto

**EasyRent** es un Sistema de Gestión Inmobiliaria de escritorio y entorno web (Híbrido), diseñado para simplificar, centralizar y automatizar los procesos relacionados con la administración de propiedades. Está dirigido a arrendadores, agentes inmobiliarios y pequeñas/medianas empresas de gestión de propiedades.

El sistema permite controlar propiedades, inquilinos, contratos, finanzas (ingresos y egresos) y tickets de mantenimiento, entregando reportes claros y un dashboard gerencial. Además, asegura los datos mediante copias de seguridad en la nube y un esquema de licenciamiento por niveles.

## 3. Requerimientos Funcionales

### Módulo de Propiedades
- **RF-P01**: Registrar, editar y eliminar propiedades, incluyendo características físicas (tamaño, pisos, número de cuartos, baños, amenidades).
- **RF-P02**: Visualizar información detallada y galería de fotos por propiedad.
- **RF-P03**: Cambiar el estado de la propiedad (Ej: disponible, alquilado, mantenimiento).

### Módulo de Inquilinos
- **RF-I01**: Registrar información personal y de contacto de inquilinos (DNI, nombre, ocupación, teléfono, email, contacto de emergencia).
- **RF-I02**: Adjuntar imágenes o copias de los documentos de identidad.
- **RF-I03**: Ver historial y contratos asociados a un inquilino.

### Módulo de Contratos
- **RF-C01**: Crear nuevos contratos vinculando una propiedad con un inquilino.
- **RF-C02**: Establecer monto de renta, fechas de inicio y fin, monto de depósito o garantía, día de pago del mes y moneda.
- **RF-C03**: Adjuntar documentos escaneados referentes al contrato firmado.
- **RF-C04**: Calcular y mostrar días restantes para el vencimiento del contrato.

### Módulo de Finanzas
- **RF-F01**: Registrar pagos de alquiler (Ingresos) asociados a un contrato.
- **RF-F02**: Registrar gastos o pagos por reparaciones (Egresos) de una propiedad.
- **RF-F03**: Generar y adjuntar comprobantes o recibos a los movimientos financieros.
- **RF-F04**: Calcular montos pendientes, moras (late fees) e impuestos si aplica.

### Módulo de Mantenimiento
- **RF-M01**: Crear tickets de mantenimiento para reportar fallas en una propiedad.
- **RF-M02**: Asignar prioridad (baja, media, alta) y estado (abierto, en progreso, resuelto).
- **RF-M03**: Registrar fotos, costo estimado, costo real y vincular a un movimiento financiero (egreso).

### Módulo de Contactos y Proveedores
- **RF-PROV01**: Mantener un directorio de proveedores de servicios (gasfiteros, electricistas, limpieza, etc.).

### Módulo de Reportes y Dashboard
- **RF-REP01**: Mostrar en un dashboard los totales de propiedades, contratos activos, ingresos del mes, egresos del mes y rentas vencidas.
- **RF-REP02**: Generación de reportes tabulares para revisión contable e histórica.

### Sistema de Licenciamiento y Respaldo
- **RF-SYS01**: Validación de licencia local o en la nube ligada al identificador de hardware (HWID).
- **RF-SYS02**: Generación de copias de seguridad de la base de datos (Cloud Sync con Supabase).

## 4. Requerimientos No Funcionales

- **RNF-01 (Arquitectura)**: Aplicación de escritorio multiplataforma utilizando tecnología web (Electron.js + React).
- **RNF-02 (Persistencia)**: Base de datos local transaccional rápida utilizando SQLite (`better-sqlite3`).
- **RNF-03 (Almacenamiento de Archivos)**: Los recursos (fotos, PDFs) deben guardarse organizadamente en el directorio de usuario (AppData/Roaming).
- **RNF-04 (Seguridad)**: Las credenciales y llaves de acceso a servicios en la nube (Supabase) deben manejarse mediante variables de entorno en el empaquetado inicial.
- **RNF-05 (UX/UI)**: Interfaz de usuario intuitiva, construida con React, Tailwind CSS y animaciones fluidas utilizando Framer Motion. El diseño debe contemplar un tema oscuro (`#0f172a`).
- **RNF-06 (Rendimiento)**: Tiempos de carga mínimos y carga de base de datos síncrona/optimizada para manejar miles de registros sin ralentización notable en la interfaz de usuario.
- **RNF-07 (Internacionalización)**: Soporte para configuración de idiomas mediante un `LanguageContext` pre-establecido en el código.

## 5. Actores del Sistema
- **Administrador Inmobiliario**: Usuario principal de la aplicación. Gestiona todas las propiedades, sube contratos, aprueba tickets de mantenimiento, revisa el estado de resultados mes a mes.
- **Agente Comercial**: Usuario que podría enfocarse únicamente en ver disponibilidad de propiedades e información de contratos.
- **Proveedor de Servicios** (Indirecto): Cuya información se registra para ser contactado.
