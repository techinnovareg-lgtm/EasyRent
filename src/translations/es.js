const es = {
    common: {
        loading: "Cargando...",
        save: "Guardar",
        saving: "Guardando...",
        cancel: "Cancelar",
        edit: "Editar",
        delete: "Eliminar",
        actions: "Acciones",
        status: "Estado",
        all: "Todos",
        none: "Ninguno",
        back: "Volver",
        next: "Siguiente",
        search: "Buscar...",
        noData: "No hay datos disponibles",
        error: "Error",
        success: "Éxito",
        details: "Ver detalles",
        registered: "registradas",
        registered_plural: "registrados",
        noResults: "Sin resultados",
        noRecords: "Aún no tienes registros",
        addFirst: "Agregar primera",
        inactive: "Inactivo",
        floor: "Piso",
        unitNumber: "N°",
        noPhotos: "Sin fotos",
        confirmDelete: "¿Está seguro de eliminar este registro?",
        previous: "Anterior",
        required: "Obligatorio",
        onlyNumbers: "Solo números permitidos",
        active: "Activo",
        description: "Descripción",
        step: "Paso",
        of: "de",
        phone: "Teléfono",
        email: "Email",
        document: "Documento",
        contact: "Contacto",
        address: "Dirección",
        currency: "Moneda",
        select: "Seleccionar",
        theme: {
            light: "Claro",
            dark: "Oscuro"
        },
        language: {
            es: "Español",
            en: "English"
        }
    },
    sidebar: {
        dashboard: "Dashboard",
        properties: "Propiedades",
        tenants: "Inquilinos",
        contracts: "Contratos",
        finances: "Finanzas",
        reports: "Reportes",
        maintenance: "Mantenimiento",
        contacts: "Contactos",
        cloud: "Nube",
        support: "Soporte",
        admin: "Consola Admin",
        logout: "Cerrar Sesión",
        exit: "Salir",
        exitReminder: "Asegúrate de haber guardado todos tus cambios antes de salir de EasyRent.",
        collapse: "Colapsar menú",
        expand: "Expandir menú",
        checkUpdates: "Buscar actualizaciones",
        version: "v1.0.0 · Ene 2026",
        updateAlert: "Buscando actualizaciones... Versión actual (1.0.0) es la más reciente."
    },
    dashboard: {
        title: "Dashboard",
        subtitle: "Resumen de tus propiedades",
        newProperty: "Nueva Propiedad",
        stats: {
            properties: "Propiedades",
            tenants: "Inquilinos",
            contracts: "Contratos activos",
            income: "Ingresos",
            expenses: "Egresos",
            netProfit: "Ganancia neta"
        },
        filters: {
            thisMonth: "Este Mes",
            thisYear: "Este Año",
            total: "Total Histórico",
            custom: "Rango Personalizado",
            from: "Desde",
            to: "Hasta"
        },
        alerts: {
            contractsExpiring: "Contratos por vencer",
            overduePayments: "Rentas vencidas",
            noAlerts: "Sin alertas",
            upToDate: "Todo al día",
            expiredDaysAgo: "Venció hace {days} días",
            expiresInDays: "Vence en {days} días"
        },
        charts: {
            financialSummary: "Resumen Financiero",
            dailyView: "Vista Diaria",
            monthlyView: "Vista Mensual"
        }
    },
    properties: {
        title: "Propiedades",
        new: "Nueva propiedad",
        edit: "Editar propiedad",
        searchPlaceholder: "Buscar propiedad...",
        types: {
            all: "Todas",
            casa: "Casa",
            departamento: "Departamento",
            tienda: "Tienda",
            terreno: "Terreno",
            local: "Local",
            oficina: "Oficina",
            edificio: "Edificio",
            'depósito': "Depósito",
            otro: "Otro"
        },
        status: {
            disponible: "Disponible",
            alquilado: "Alquilado",
            'en mantenimiento': "Mantenimiento",
            reservado: "Reservado"
        },
        form: {
            steps: {
                basic: "Información Básica",
                location: "Ubicación y Medidas",
                photos: "Fotos"
            },
            name: "Nombre de la propiedad",
            namePlaceholder: "Ej: Departamento Miraflores 3B",
            type: "Tipo de inmueble",
            status: "Estado",
            isActive: "Inmueble Activo",
            descriptionPlaceholder: "Descripción breve del inmueble...",
            address: "Dirección completa",
            addressPlaceholder: "Jr. Las Flores 456, Piso 3",
            city: "Ciudad / Depto.",
            cityPlaceholder: "Ej: Lima",
            province: "Provincia",
            district: "Distrito",
            parent: "Agrupar en Edificio / Casa (Propiedad Padre)",
            noParent: "— Ninguna (Propiedad Principal) —",
            area: "Área (m²)",
            bedrooms: "Habitaciones",
            bathrooms: "Baños",
            levels: "Niveles / Pisos",
            unitNumber: "Número / Código",
            unitNumberPlaceholder: "Ej: 301-B",
            features: "Accesos y Espacios Propios",
            amenities: "Áreas Comunes / Amenidades",
            photosSubtitle: "Sube fotos de la propiedad para tener un registro visual.",
            dropzone: {
                active: "Suelta las fotos aquí",
                idle: "Arrastra fotos de la propiedad o haz clic",
                hint: "JPG, PNG — puedes subir varias a la vez"
            },
            errors: {
                typeRequired: "El tipo de inmueble es obligatorio"
            },
            featuresList: {
                kitchen: "Cocina",
                diningRoom: "Comedor",
                laundry: "Lavandería",
                livingRoom: "Sala",
                parking: "Cochera",
                garden: "Patio / Jardín",
                terrace: "Terraza",
                rooftop: "Azotea",
                elevator: "Ascensor",
                stairs: "Escaleras"
            },
            amenitiesList: {
                pool: "Piscina",
                gym: "Gimnasio",
                grill: "Área de Parrillas",
                cinema: "Sala de Cine",
                coworking: "Coworking",
                laundry: "Lavandería"
            }
        }
    },
    tenants: {
        title: "Inquilinos",
        new: "Nuevo inquilino",
        edit: "Editar inquilino",
        searchPlaceholder: "Buscar por nombre, documento...",
        registered_plural: "registrados",
        noRecords: "Aún no has registrado inquilinos",
        noResults: "Sin resultados para tu búsqueda",
        allStatus: "Todos los estados",
        onlyActive: "Solo Activos",
        onlyInactive: "Solo Inactivos",
        table: {
            tenant: "Inquilino",
            document: "Documento",
            contact: "Contacto",
            status: "Estado"
        },
        form: {
            subtitle: "Completa los datos del inquilino",
            personalData: "Datos personales",
            fullName: "Nombre completo / Razón Social",
            docType: "Tipo de documento",
            docNumber: "Número de documento",
            docNumberNumericError: "⚠ Solo números permitidos para este tipo de documento",
            phone: "Teléfono / WhatsApp",
            email: "Correo electrónico",
            address: "Dirección actual",
            occupation: "Ocupación / Trabajo",
            emergencyContact: "Contacto de emergencia",
            emergencyPhone: "Teléfono de emergencia",
            isActive: "Inquilino Activo",
            notes: "Notas adicionales",
            docImage: "Documento de identidad (foto o PDF)",
            docUploaded: "Documento cargado",
            dropzoneIdle: "Arrastra la foto del documento o haz clic para seleccionar",
            docTypeRequired: "El tipo de documento es obligatorio"
        }
    },
    contracts: {
        title: "Contratos",
        new: "Nuevo contrato",
        edit: "Editar contrato",
        searchPlaceholder: "Buscar propiedad o inquilino...",
        registered_plural: "contratos registrados",
        noResults: "Sin contratos encontrados",
        statusColors: {
            activo: "Activo",
            vencido: "Vencido",
            terminado: "Terminado"
        },
        daysRemaining: "d restantes",
        attached: "Contrato adjunto",
        attachFile: "Adjuntar foto o PDF del contrato",
        dropFile: "Suelta el archivo...",
        table: {
            property: "Propiedad",
            tenant: "Inquilino",
            period: "Periodo",
            rent: "Renta",
            status: "Estado",
            contract: "Contrato"
        },
        form: {
            property: "Propiedad",
            tenant: "Inquilino",
            startDate: "Inicio",
            endDate: "Vencimiento",
            monthlyRent: "Renta mensual",
            deposit: "Depósito",
            paymentDay: "Día de pago",
            lateFee: "Mora por atraso",
            file: "Archivo del contrato",
            notes: "Notas",
            save: "Guardar contrato"
        }
    },
    finances: {
        title: "Finanzas",
        new: "Nuevo registro",
        edit: "Editar registro",
        registered_plural: "registros",
        noResults: "Sin registros encontrados",
        stats: {
            income: "Ingresos cobrados",
            expenses: "Egresos pagados",
            netProfit: "Ganancia neta",
            pendingIncome: "Cobros Pendientes",
            pendingExpense: "Pagos Pendientes",
            realizedIncome: "Ingresos Realizados",
            realizedExpense: "Gastos Realizados"
        },
        types: {
            ingreso: "Ingreso",
            egreso: "Egreso"
        },
        categories: {
            renta: "Renta",
            'depósito': "Depósito",
            recargo: "Recargo",
            'otro ingreso': "Otro ingreso",
            mantenimiento: "Mantenimiento",
            limpieza: "Limpieza",
            impuesto: "Impuesto",
            'servicio agua': "Agua",
            'servicio luz': "Luz",
            seguro: "Seguro",
            'reparación': "Reparación",
            'otro egreso': "Otro egreso"
        },
        status: {
            pendiente: "Pendiente",
            pagado: "Pagado",
            vencido: "Vencido",
            anulado: "Anulado"
        },
        form: {
            type: "Tipo",
            category: "Concepto",
            amount: "Monto base",
            lateFee: "Mora / Recargo",
            paymentDate: "Fecha de pago",
            dueDate: "Fecha de vencimiento",
            periodMonth: "Mes del periodo",
            property: "Propiedad",
            contract: "Contrato",
            tenant: "Inquilino",
            receipts: "Recibos / Comprobantes",
            receiptsUploaded: "recibo(s)",
            noReceipts: "Sin recibos",
            dropReceipts: "Agregar recibo (foto o PDF) — puedes subir varios",
            notesPlaceholder: "Descripción extra (opcional)...",
            taxRate: "Tasa Impuesto (%)",
            taxAmount: "Monto Impuesto"
        },
        table: {
            typeCategory: "Tipo / Concepto",
            propertyTenant: "Propiedad / Inquilino",
            datesPeriod: "Fechas / Periodo",
            totalAmount: "Monto Total",
            receipts: "Recibos",
            due: "Vence",
            paid: "Pagado"
        }
    },
    support: {
        title: "Ayuda y Soporte",
        subtitle: "Información técnica y asistencia para tu licencia.",
        systemId: "Identificación del Sistema",
        systemIdHint: "Proporciona este código si necesitas renovar tu licencia manual o si tienes problemas técnicos.",
        hwid: "HWID",
        license: "LICENCIA",
        noLicense: "No activa",
        show: "Mostrar",
        hide: "Ocultar",
        copy: "Copiar",
        copied: "Copiado",
        renewTitle: "¿Necesitas renovar?",
        renewSubtitle: "Si tu periodo de soporte o nube ha vencido, puedes adquirir una renovación en nuestra tienda oficial. Asegúrate de tener a mano tu HWID para la validación.",
        goToStore: "Ir a la Tienda Tech Innova",
        directSupport: "Soporte Directo",
        whatsappTitle: "Asistencia vía WhatsApp",
        whatsappSubtitle: "Envía un mensaje predefinido con tus datos técnicos.",
        emailTitle: "Correo de Soporte",
        emailSubtitle: "Ideal para adjuntar capturas o detalles extensos.",
        faqTitle: "Preguntas Frecuentes",
        faqs: [
            {
                q: "¿Cómo se activa mi pago?",
                a: "Solo debes enviar tu comprobante y HWID. Nuestro equipo actualiza tu licencia remotamente. Reinicia la App y los cambios se verán reflejados automáticamente."
            },
            {
                q: "¿Qué sucede si cambio de equipo?",
                a: "Las licencias están ligadas al HWID de tu PC. Si cambias de equipo, contáctanos para reasignar tu licencia al nuevo identificador."
            },
            {
                q: "¿Cómo paso a la versión Desktop?",
                a: "Si deseas instalar la App en tu PC, contáctanos. Recibirás el link del instalador y tu clave por correo. Los datos de la nube se sincronizarán al iniciar sesión."
            }
        ],
        whatsappMsg: "Hola Tech Innova, solicito soporte para EasyRent.",
        emailSubject: "Soporte Técnico EasyRent",
        emailBody: "Solicitud de Soporte:\n\nSoftware: EasyRent\n\nDescripción del problema:"
    },
    reports: {
        title: "Reportes",
        subtitle: "Análisis y estadísticas de tus finanzas",
        incomeVsExpense: "Ingresos vs Egresos",
        monthlyTrend: "Tendencia Mensual",
        distribution: "Distribución por Categoría",
        noData: "No hay datos para el periodo seleccionado",
        export: "Exportar Reporte",
        filters: {
            period: "Periodo",
            property: "Propiedad"
        }
    },
    admin: {
        title: "Consola Admin",
        subtitle: "Ingrese el PIN de seguridad de 6 dígitos.",
        unlock: "Desbloquear",
        verifiedTitle: "Gestión de Licencias",
        verifiedSubtitle: "Panel de Control Tech Innova",
        newLicense: "Nueva Licencia",
        editLicense: "Configurar Licencia",
        generateLicense: "Generar Licencia",
        licenseKey: "Clave de Licencia",
        generateKey: "Generar Clave",
        ownerEmail: "Email del Propietario (Asociado)",
        resetPassword: "Solicitar Reset Password",
        plan: "Plan",
        plans: {
            desktop: "🖥️ Desktop (Lite)",
            hybrid: "🌐 Híbrido (Pro)",
            cloud: "☁️ Cloud Only"
        },
        hwid: "Hardware ID",
        unlinked: "Sin vincular",
        appExpiration: "Vencimiento App",
        cloudExpiration: "Vencimiento Cloud",
        notes: "Usuario / Notas de Cliente",
        notesPlaceholder: "Ej: Juan Pérez - Inmobiliaria Central",
        accessStatus: "Estado del Acceso",
        statusOptions: {
            active: "🟢 Activo",
            revoked: "🔴 Revocado",
            suspended: "🟡 Suspend."
        },
        table: {
            keyId: "Clave / Identificación",
            plan: "Plan",
            status: "Estado",
            baseExp: "Expiración Base",
            cloudSync: "Sincronización Cloud",
            unassigned: "Sin asignar",
            noNotes: "Sin descripción",
            linked: "Vinculado",
            free: "Libre",
            lifetime: "VITALICIO",
            baseSub: "Suscripción Base",
            activateSync: "Activar Sync"
        },
        actions: {
            freeHwid: "Liberar Hardware",
            config: "Configurar Licencia",
            delete: "Eliminar permanentemente"
        },
        prompts: {
            confirmDelete: "¿Está seguro de eliminar esta licencia permanentemente?",
            confirmFreeHwid: "Esto permitirá al usuario usar la clave en otra PC. ¿Continuar?"
        },
        messages: {
            saveError: "Error al guardar",
            updateSuccess: "Actualizar Cambios",
            createSuccess: "Confirmar y Crear"
        }
    },
    cloud: {
        title: "Respaldo en la Nube",
        desktopDesc: "Gestiona tus copias de seguridad y sincronización online.",
        webDesc: "Tus datos están sincronizados y protegidos en tiempo real.",
        syncNow: "Sincronizar ahora",
        syncingDescription: "Sincronizando...",
        expiredSub: "Suscripción Expirada",
        desktopPlan: "Plan Desktop",
        connected: "Conectado a la Nube",
        inactiveTitle: "Suscripción a la Nube Inactiva",
        inactiveDesc: "Tu suscripción mensual para respaldos en la nube ha expirado. Para continuar protegiendo tus datos y recibir actualizaciones, por favor renueva tu suscripción.",
        renewNow: "Renovar suscripción ahora",
        upgradeTitle: "Actualiza a Plan Híbrido",
        upgradeDesc: "Tu plan actual no incluye respaldos automáticos en la nube. Con el Plan Híbrido, tus datos estarán protegidos contra fallos de hardware y podrás acceder a actualizaciones automáticas.",
        viewPlans: "Ver planes y precios",
        status: "Estado",
        protected: "Protegido",
        lastBackup: "Último Backup",
        never: "Nunca",
        historyTitle: "Historial de Sincronización",
        table: {
            dateTime: "Fecha y Hora",
            backupId: "ID de Respaldo",
            records: "Registros",
            status: "Estado",
            noHistory: "No hay historial de respaldos disponible.",
            entries: "entr.",
            success: "Éxito",
            error: "Error"
        },
        planDetails: "Detalles del Plan",
        planType: "Tipo de Plan",
        syncStatus: "Sincronización",
        active: "Activa",
        inactive: "Desactivada",
        expires: "Expira",
        neverLifetime: "Nunca (Vitalicio)",
        autoNote: "Nota: Los respaldos se realizan de forma automática cada vez que cierras la aplicación.",
        auth: {
            title: "Confirmar Identidad",
            desc: "Ingresa tus credenciales de la plataforma para sincronizar tus datos locales con la nube de forma segura.",
            email: "Correo electrónico",
            password: "Contraseña",
            sync: "Sincronizar"
        },
        messages: {
            syncError: "Error de sincronización",
            criticalError: "Error crítico de red o servidor."
        }
    },
    contacts: {
        title: "Contactos de Servicios",
        count: "contactos registrados",
        newContact: "Nuevo Contacto",
        editContact: "Editar Contacto",
        searchPlaceholder: "Buscar por nombre o servicio...",
        noContacts: "No se encontraron contactos.",
        deleteConfirm: "¿Eliminar este contacto?",
        form: {
            fullName: "Nombre completo",
            serviceType: "Tipo de Servicio",
            phone: "Teléfono",
            email: "Email",
            notes: "Notas adicionales",
            save: "Guardar",
            update: "Actualizar"
        },
        serviceTypes: {
            carpinter: "Carpintero",
            plumber: "Gasfitero",
            painter: "Pintor",
            electrician: "Electricista",
            locksmith: "Cerrajero",
            mason: "Albañil",
            cleaning: "Limpieza",
            other: "Otro"
        },
        details: {
            notFound: "Contacto no encontrado",
            backToList: "Volver al listado",
            idData: "Datos de Identificación",
            notRegistered: "No registrado",
            notesTitle: "Notas y Especialidad",
            noNotes: "Sin notas adicionales para este contacto."
        }
    },
    auth: {
        signInTitle: "Acceso a plataforma web",
        signUpTitle: "Crear nueva cuenta",
        email: "Correo electrónico",
        password: "Contraseña",
        signIn: "Iniciar Sesión",
        signUp: "Crear Cuenta",
        processing: "Procesando...",
        noAccount: "¿No tienes cuenta? Regístrate aquí",
        hasAccount: "¿Ya tienes cuenta? Inicia sesión",
        signUpSuccess: "¡Registro exitoso! Por favor, verifica tu correo (si es requerido) o intenta iniciar sesión.",
        genericError: "Error al procesar la solicitud.",
        contactSupport: "Soporte Técnico",
        supportHint: "¿Tienes problemas para ingresar?",
        copyright: "Todos los derechos reservados"
    },
    license: {
        claim: {
            title: "Vincular Licencia",
            hello: "Hola",
            noLicense: "No hemos encontrado una licencia asociada a tu cuenta. Por favor, ingresa tu clave de activación.",
            label: "Clave de Activación",
            placeholder: "ER-XXXX-XXXX-XXXX",
            validating: "Validando...",
            submit: "Vincular y Entrar",
            logout: "Salir de esta cuenta",
            contactSales: "Si no tienes una licencia, contacta con",
            error: "No se pudo validar la licencia. Verifique el código."
        },
        validator: {
            title: "Activar Licencia",
            subtitle: "Sistema de Gestión Inmobiliaria",
            label: "Clave de licencia",
            placeholder: "XXXXX-XXXXX-XXXXX-XXXXX",
            activating: "Verificando...",
            submit: "Activar",
            demoPrompt: "¿Deseas probar la aplicación?",
            demoLink: "Usar clave de demostración →"
        }
    },
    property: {
        types: {
            house: "🏠 Casa",
            apartment: "🏢 Departamento",
            shop: "🛍️ Tienda",
            land: "🌳 Terreno",
            local: "🏪 Local",
            office: "🏛️ Oficina",
            other: "🏗️ Otro"
        },
        status: {
            available: "Disponible",
            rented: "Alquilado",
            maintenance: "En mantenimiento",
            reserved: "Reservado"
        },
        features: {
            kitchen: "Cocina",
            dining: "Comedor",
            laundry: "Lavandería",
            living: "Sala",
            elevator: "Ascensor",
            stairs: "Escaleras",
            terrace: "Terraza",
            rooftop: "Azotea",
            parking: "Cochera",
            garden: "Jardín"
        },
        details: {
            title: "Detalle de Propiedad",
            notFound: "Propiedad no encontrada",
            backToList: "Volver al listado",
            edit: "Editar",
            delete: "Eliminar",
            noPhotos: "Sin fotos registradas",
            area: "Área",
            levels: "Niveles",
            floor: "Piso",
            unit: "Unidad",
            descriptionTitle: "Descripción y Detalles",
            noDescription: "Sin descripción adicional disponible para esta propiedad.",
            locationTitle: "Ubicación",
            address: "Dirección",
            district: "Distrito",
            city: "Provincia / Ciudad",
            unitsTitle: "Unidades Internas",
            contractsTitle: "Historial de Contratos",
            viewAllContracts: "Ver todos los contratos",
            noContracts: "No hay registros de contratos para esta propiedad."
        }
    },
    contract: {
        status: {
            active: "Vigente",
            finished: "Terminado",
            pending: "Pendiente"
        },
        details: {
            title: "Detalle de Contrato",
            notFound: "Contrato no encontrado",
            backToList: "Volver al listado",
            daysRemaining: "días restantes",
            expired: "Vencido",
            registeredOn: "Registrado el",
            linkedProperty: "Propiedad Vinculada",
            viewProperty: "Ver ficha de propiedad",
            tenant: "Inquilino",
            conditions: "Condiciones del Contrato",
            monthlyRent: "Renta Mensual",
            paymentDay: "Día de pago",
            everyDayOfMonth: "Cada {day} de mes",
            startDate: "Fecha Inicio",
            endDate: "Fecha Fin",
            paymentsTitle: "Pagos de Renta registrados",
            periodMonth: "Periodo / Mes",
            status: "Estado",
            amountPaid: "Monto Pagado",
            noPayments: "No se han registrado pagos para este contrato aún.",
            legalDoc: "Documento Legal",
            openDoc: "Abrir",
            noLegalDoc: "No hay un archivo adjunto para este contrato.",
            pdfImage: "Archivo PDF / Imagen",
            reminder: "Recordatorio",
            expiresOn: "El contrato vence el",
            recommendRenewal: "Se recomienda contactar al inquilino para la renovación."
        }
    },
    tenant: {
        details: {
            title: "Detalle de Inquilino",
            notFound: "Inquilino no encontrado",
            backToList: "Volver al listado",
            active: "Activo",
            inactive: "Inactivo",
            contactInfo: "Datos de contacto",
            phone: "Teléfono",
            email: "Correo electrónico",
            address: "Dirección",
            noPhone: "Sin teléfono",
            noEmail: "Sin correo",
            noAddress: "Sin dirección registrada",
            additionalInfo: "Información adicional",
            occupation: "Ocupación",
            emergencyContact: "Contacto Emergencia",
            documentTitle: "Documento de Identidad",
            docPhoto: "Foto / Escaneo del",
            docRegistered: "Archivo digital registrado",
            viewDoc: "Ver Documento",
            noDocImage: "No se ha subido una imagen del documento.",
            notesTitle: "Notas y Observaciones",
            noNotes: "No hay notas adicionales sobre este inquilino.",
            historyTitle: "Historial de Alquileres",
            inProgress: "En curso",
            noContracts: "Este inquilino no tiene contratos registrados actualmente."
        }
    },
    finance: {
        status: {
            paid: "Pagado",
            pending: "Pendiente"
        },
        details: {
            title: "Detalle de Transacción",
            notFound: "Registro no encontrado",
            backToList: "Volver al listado",
            reference: "REF",
            income: "Ingreso",
            expense: "Egreso",
            property: "Propiedad",
            tenant: "Inquilino",
            period: "Periodo",
            paymentDate: "Fecha de pago",
            dueDate: "Fecha de vencimiento",
            notesTitle: "Notas del registro",
            noNotes: "No se ingresaron notas adicionales para esta transacción.",
            receiptsTitle: "Recibos y Comprobantes",
            viewReceipt: "Ver Recibo",
            noReceipts: "No hay recibos adjuntos a esta transacción."
        }
    },
    maintenance: {
        title: "Mantenimiento",
        subtitle: "Gestión de tickets de reparación y mejora",
        new: "Nuevo Ticket",
        edit: "Editar Ticket",
        searchPlaceholder: "Buscar por título o propiedad...",
        noResults: "No se encontraron tickets de mantenimiento.",
        loading: "Cargando tickets...",
        table: {
            title: "Título / Propiedad",
            status: "Estado",
            cost: "Costo Real",
            priority: "Prioridad",
            date: "Fecha"
        },
        form: {
            property: "Propiedad",
            title: "Título del Incidente",
            titlePlaceholder: "Ej: Fuga de tubería, pintura, cerrajería...",
            description: "Descripción Detallada",
            priority: "Prioridad",
            status: "Estado",
            estimatedCost: "Costo Estimado",
            actualCost: "Costo Real",
            photos: "Fotos / Evidencia",
            save: "Guardar Ticket"
        },
        priority: {
            low: "Baja",
            medium: "Media",
            high: "Alta"
        },
        status: {
            open: "Abierto",
            in_progress: "En Progreso",
            resolved: "Resuelto",
            closed: "Cerrado"
        }
    }
};

export default es;
