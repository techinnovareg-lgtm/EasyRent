const en = {
    common: {
        loading: "Loading...",
        save: "Save",
        saving: "Saving...",
        cancel: "Cancel",
        edit: "Edit",
        delete: "Delete",
        actions: "Actions",
        status: "Status",
        all: "All",
        none: "None",
        back: "Back",
        next: "Next",
        search: "Search...",
        noData: "No data available",
        error: "Error",
        success: "Success",
        details: "View details",
        registered: "registered",
        registered_plural: "registered",
        noResults: "No results",
        noRecords: "No records found",
        addFirst: "Add first",
        inactive: "Inactive",
        floor: "Floor",
        unitNumber: "N°",
        noPhotos: "No photos",
        confirmDelete: "Are you sure you want to delete this record?",
        previous: "Previous",
        required: "Required",
        onlyNumbers: "Only numbers allowed",
        active: "Active",
        description: "Description",
        step: "Step",
        of: "of",
        phone: "Phone",
        email: "Email",
        document: "Document",
        contact: "Contact",
        address: "Address",
        currency: "Currency",
        select: "Select",
        theme: {
            light: "Light",
            dark: "Dark"
        },
        language: {
            es: "Spanish",
            en: "English"
        }
    },
    sidebar: {
        dashboard: "Dashboard",
        properties: "Properties",
        tenants: "Tenants",
        contracts: "Contracts",
        finances: "Finances",
        reports: "Reports",
        maintenance: "Maintenance",
        contacts: "Contacts",
        cloud: "Cloud",
        support: "Support",
        admin: "Admin Console",
        logout: "Logout",
        exit: "Exit",
        exitReminder: "Make sure you have saved all your changes before leaving EasyRent.",
        collapse: "Collapse menu",
        expand: "Expand menu",
        checkUpdates: "Check for updates",
        version: "v1.0.0 · Jan 2026",
        updateAlert: "Checking for updates... Current version (1.0.0) is the most recent."
    },
    dashboard: {
        title: "Dashboard",
        subtitle: "Your properties summary",
        newProperty: "New Property",
        stats: {
            properties: "Properties",
            tenants: "Tenants",
            contracts: "Active contracts",
            income: "Income",
            expenses: "Expenses",
            netProfit: "Net profit"
        },
        filters: {
            thisMonth: "This Month",
            thisYear: "This Year",
            total: "Historic Total",
            custom: "Custom Range",
            from: "From",
            to: "To"
        },
        alerts: {
            contractsExpiring: "Contracts about to expire",
            overduePayments: "Overdue payments",
            noAlerts: "No alerts",
            upToDate: "Everything up to date",
            expiredDaysAgo: "Expired {days} days ago",
            expiresInDays: "Expires in {days} days"
        },
        charts: {
            financialSummary: "Financial Summary",
            dailyView: "Daily View",
            monthlyView: "Monthly View"
        }
    },
    properties: {
        title: "Properties",
        new: "New Property",
        edit: "Edit Property",
        searchPlaceholder: "Search property...",
        types: {
            all: "All",
            casa: "House",
            departamento: "Apartment",
            tienda: "Store",
            terreno: "Land",
            local: "Local",
            oficina: "Office",
            edificio: "Building",
            'depósito': "Storage",
            otro: "Other"
        },
        status: {
            disponible: "Available",
            alquilado: "Rented",
            'en mantenimiento': "Maintaining",
            reservado: "Reserved"
        },
        form: {
            steps: {
                basic: "Basic Information",
                location: "Location & Measures",
                photos: "Photos"
            },
            name: "Property Name",
            namePlaceholder: "Ex: Miraflores Apartment 3B",
            type: "Property Type",
            status: "Status",
            isActive: "Active Property",
            descriptionPlaceholder: "Short description of the property...",
            address: "Full Address",
            addressPlaceholder: "St. Las Flores 456, Floor 3",
            city: "City / State",
            cityPlaceholder: "Ex: Lima",
            province: "Province",
            district: "District",
            parent: "Group in Building / House (Parent Property)",
            noParent: "— None (Main Property) —",
            area: "Area (m²)",
            bedrooms: "Bedrooms",
            bathrooms: "Bathrooms",
            levels: "Levels / Floors",
            unitNumber: "Unit Number / Code",
            unitNumberPlaceholder: "Ex: 301-B",
            features: "Own Access and Spaces",
            amenities: "Shared Areas / Amenities",
            photosSubtitle: "Upload photos of the property for visual record.",
            dropzone: {
                active: "Drop photos here",
                idle: "Drag property photos or click",
                hint: "JPG, PNG — you can upload several at once"
            },
            errors: {
                typeRequired: "Property type is required"
            },
            featuresList: {
                kitchen: "Kitchen",
                diningRoom: "Dining Room",
                laundry: "Laundry",
                livingRoom: "Living Room",
                parking: "Parking",
                garden: "Patio / Garden",
                terrace: "Terrace",
                rooftop: "Rooftop",
                elevator: "Elevator",
                stairs: "Stairs"
            },
            amenitiesList: {
                pool: "Pool",
                gym: "Gym",
                grill: "Grill Area",
                cinema: "Cinema Room",
                coworking: "Coworking",
                laundry: "Laundry"
            }
        }
    },
    tenants: {
        title: "Tenants",
        new: "New Tenant",
        edit: "Edit Tenant",
        searchPlaceholder: "Search by name, document...",
        registered_plural: "registered",
        noRecords: "No tenants registered yet",
        noResults: "No results for your search",
        allStatus: "All levels",
        onlyActive: "Only Active",
        onlyInactive: "Only Inactive",
        table: {
            tenant: "Tenant",
            document: "Document",
            contact: "Contact",
            status: "Status"
        },
        form: {
            subtitle: "Complete tenant data",
            personalData: "Personal Data",
            fullName: "Full Name / Legal Name",
            docType: "Document Type",
            docNumber: "Document Number",
            docNumberNumericError: "⚠ Only numbers allowed for this document type",
            phone: "Phone / WhatsApp",
            email: "Email Address",
            address: "Current Address",
            occupation: "Occupation / Job",
            emergencyContact: "Emergency Contact",
            emergencyPhone: "Emergency Phone",
            isActive: "Active Tenant",
            notes: "Additional notes",
            docImage: "ID Document (photo or PDF)",
            docUploaded: "Document uploaded",
            dropzoneIdle: "Drag document photo or click to select",
            docTypeRequired: "Document type is required"
        }
    },
    contracts: {
        title: "Contracts",
        new: "New Contract",
        edit: "Edit Contract",
        searchPlaceholder: "Search property or tenant...",
        registered_plural: "contracts registered",
        noResults: "No contracts found",
        statusColors: {
            activo: "Active",
            vencido: "Expired",
            terminado: "Finished"
        },
        daysRemaining: "d remaining",
        attached: "Contract attached",
        attachFile: "Attach photo or PDF of contract",
        dropFile: "Drop file...",
        table: {
            property: "Property",
            tenant: "Tenant",
            period: "Period",
            rent: "Rent",
            status: "Status",
            contract: "Contract"
        },
        form: {
            property: "Property",
            tenant: "Tenant",
            startDate: "Start Date",
            endDate: "End Date",
            monthlyRent: "Monthly Rent",
            deposit: "Deposit",
            paymentDay: "Payment Day",
            lateFee: "Late Fee",
            file: "Contract File",
            notes: "Notes",
            save: "Save Contract"
        }
    },
    finances: {
        title: "Finances",
        new: "New Entry",
        edit: "Edit Entry",
        registered_plural: "entries",
        noResults: "No entries found",
        stats: {
            income: "Collected income",
            expenses: "Paid expenses",
            netProfit: "Net profit",
            pendingIncome: "Pending Collection",
            pendingExpense: "Pending Payments",
            realizedIncome: "Realized Income",
            realizedExpense: "Realized Expenses"
        },
        types: {
            ingreso: "Income",
            egreso: "Expense"
        },
        categories: {
            renta: "Rent",
            'depósito': "Deposit",
            recargo: "Surcharge",
            'otro ingreso': "Other income",
            mantenimiento: "Maintenance",
            limpieza: "Cleaning",
            impuesto: "Tax",
            'servicio agua': "Water",
            'servicio luz': "Electricity",
            seguro: "Insurance",
            'reparación': "Repair",
            'otro egreso': "Other expense"
        },
        status: {
            pendiente: "Pending",
            pagado: "Paid",
            vencido: "Overdue",
            anulado: "Voided"
        },
        form: {
            type: "Type",
            category: "Category",
            amount: "Base amount",
            lateFee: "Late Fee / Surcharge",
            paymentDate: "Payment date",
            dueDate: "Due date",
            periodMonth: "Period month",
            property: "Property",
            contract: "Contract",
            tenant: "Tenant",
            receipts: "Receipts / Payments",
            receiptsUploaded: "receipt(s)",
            noReceipts: "No receipts",
            dropReceipts: "Add receipt (photo or PDF) — you can upload several",
            notesPlaceholder: "Extra description (optional)...",
            taxRate: "Tax Rate (%)",
            taxAmount: "Tax Amount"
        },
        table: {
            typeCategory: "Type / Category",
            propertyTenant: "Property / Tenant",
            datesPeriod: "Dates / Period",
            totalAmount: "Total Amount",
            receipts: "Receipts",
            due: "Due",
            paid: "Paid"
        }
    },
    support: {
        title: "Help & Support",
        subtitle: "Technical information and license assistance.",
        systemId: "System Identification",
        systemIdHint: "Provide this code if you need to renew your manual license or if you have technical problems.",
        hwid: "HWID",
        license: "LICENSE",
        noLicense: "Not active",
        show: "Show",
        hide: "Hide",
        copy: "Copy",
        copied: "Copied",
        renewTitle: "Need to renew?",
        renewSubtitle: "If your support or cloud period has expired, you can purchase a renewal in our official store. Make sure to have your HWID ready for validation.",
        goToStore: "Go to Tech Innova Store",
        directSupport: "Direct Support",
        whatsappTitle: "Assistant via WhatsApp",
        whatsappSubtitle: "Send a predefined message with your technical data.",
        emailTitle: "Support Email",
        emailSubtitle: "Ideal for attaching screenshots or extensive details.",
        faqTitle: "Frequently Asked Questions",
        faqs: [
            {
                q: "How is my payment activated?",
                a: "You just need to send your receipt and HWID. Our team updates your license remotely. Restart the App and the changes will be reflected automatically."
            },
            {
                q: "What happens if I change computers?",
                a: "Licenses are linked to your PC's HWID. If you change equipment, contact us to reassign your license to the new identifier."
            },
            {
                q: "How do I switch to the Desktop version?",
                a: "If you wish to install the App on your PC, contact us. You will receive the installer link and your key by email. Cloud data will sync when you log in."
            }
        ],
        whatsappMsg: "Hello Tech Innova, I'm requesting support for EasyRent.",
        emailSubject: "EasyRent Technical Support",
        emailBody: "Support Request:\n\nSoftware: EasyRent\n\nIssue description:"
    },
    reports: {
        title: "Reports",
        subtitle: "Analysis and statistics of your finances",
        incomeVsExpense: "Income vs Expenses",
        monthlyTrend: "Monthly Trend",
        distribution: "Distribution by Category",
        noData: "No data for the selected period",
        export: "Export Report",
        filters: {
            period: "Period",
            property: "Property"
        }
    },
    admin: {
        title: "Admin Console",
        subtitle: "Please enter the 6-digit security PIN.",
        unlock: "Unlock",
        verifiedTitle: "License Management",
        verifiedSubtitle: "Tech Innova Control Panel",
        newLicense: "New License",
        editLicense: "Configure License",
        generateLicense: "Generate License",
        licenseKey: "License Key",
        generateKey: "Generate Key",
        ownerEmail: "Owner Email (Associated)",
        resetPassword: "Request Password Reset",
        plan: "Plan",
        plans: {
            desktop: "🖥️ Desktop (Lite)",
            hybrid: "🌐 Hybrid (Pro)",
            cloud: "☁️ Cloud Only"
        },
        hwid: "Hardware ID",
        unlinked: "Not linked",
        appExpiration: "App Expiration",
        cloudExpiration: "Cloud Expiration",
        notes: "User / Customer Notes",
        notesPlaceholder: "Ex: John Doe - Central Real Estate",
        accessStatus: "Access Status",
        statusOptions: {
            active: "🟢 Active",
            revoked: "🔴 Revoked",
            suspended: "🟡 Suspend."
        },
        table: {
            keyId: "Key / Identification",
            plan: "Plan",
            status: "Status",
            baseExp: "Base Expiration",
            cloudSync: "Cloud Sync",
            unassigned: "Unassigned",
            noNotes: "No description",
            linked: "Linked",
            free: "Free",
            lifetime: "LIFETIME",
            baseSub: "Base Subscription",
            activateSync: "Activate Sync"
        },
        actions: {
            freeHwid: "Free Hardware",
            config: "Configure License",
            delete: "Permanently Delete"
        },
        prompts: {
            confirmDelete: "Are you sure you want to delete this license permanently?",
            confirmFreeHwid: "This will allow the user to use the key on another PC. Continue?"
        },
        messages: {
            saveError: "Error saving",
            updateSuccess: "Update Changes",
            createSuccess: "Confirm and Create"
        }
    },
    admin: {
        title: "Admin Console",
        subtitle: "Please enter the 6-digit security PIN.",
        unlock: "Unlock",
        verifiedTitle: "License Management",
        verifiedSubtitle: "Tech Innova Control Panel",
        newLicense: "New License",
        editLicense: "Configure License",
        generateLicense: "Generate License",
        licenseKey: "License Key",
        generateKey: "Generate Key",
        ownerEmail: "Owner Email (Associated)",
        resetPassword: "Request Password Reset",
        plan: "Plan",
        plans: {
            desktop: "🖥️ Desktop (Lite)",
            hybrid: "🌐 Hybrid (Pro)",
            cloud: "☁️ Cloud Only"
        },
        hwid: "Hardware ID",
        unlinked: "Not linked",
        appExpiration: "App Expiration",
        cloudExpiration: "Cloud Expiration",
        notes: "User / Customer Notes",
        notesPlaceholder: "Ex: John Doe - Central Real Estate",
        accessStatus: "Access Status",
        statusOptions: {
            active: "🟢 Active",
            revoked: "🔴 Revoked",
            suspended: "🟡 Suspend."
        },
        table: {
            keyId: "Key / Identification",
            plan: "Plan",
            status: "Status",
            baseExp: "Base Expiration",
            cloudSync: "Cloud Sync",
            unassigned: "Unassigned",
            noNotes: "No description",
            linked: "Linked",
            free: "Free",
            lifetime: "LIFETIME",
            baseSub: "Base Subscription",
            activateSync: "Activate Sync"
        },
        actions: {
            freeHwid: "Free Hardware",
            config: "Configure License",
            delete: "Permanently Delete"
        },
        prompts: {
            confirmDelete: "Are you sure you want to delete this license permanently?",
            confirmFreeHwid: "This will allow the user to use the key on another PC. Continue?"
        },
        messages: {
            saveError: "Error saving",
            updateSuccess: "Update Changes",
            createSuccess: "Confirm and Create"
        }
    },
    cloud: {
        title: "Cloud Backup",
        desktopDesc: "Manage your online backups and synchronization.",
        webDesc: "Your data is synchronized and protected in real time.",
        syncNow: "Sync Now",
        syncingDescription: "Syncing...",
        expiredSub: "Subscription Expired",
        desktopPlan: "Desktop Plan",
        connected: "Connected to Cloud",
        inactiveTitle: "Inactive Cloud Subscription",
        inactiveDesc: "Your monthly subscription for cloud backups has expired. To continue protecting your data and receiving updates, please renew your subscription.",
        renewNow: "Renew subscription now",
        upgradeTitle: "Upgrade to Hybrid Plan",
        upgradeDesc: "Your current plan does not include automatic cloud backups. With the Hybrid Plan, your data will be protected against hardware failures and you will have access to automatic updates.",
        viewPlans: "View plans and pricing",
        status: "Status",
        protected: "Protected",
        lastBackup: "Last Backup",
        never: "Never",
        historyTitle: "Sync History",
        table: {
            dateTime: "Date and Time",
            backupId: "Backup ID",
            records: "Records",
            status: "Status",
            noHistory: "No backup history available.",
            entries: "entr.",
            success: "Success",
            error: "Error"
        },
        planDetails: "Plan Details",
        planType: "Plan Type",
        syncStatus: "Synchronization",
        active: "Active",
        inactive: "Inactive",
        expires: "Expires",
        neverLifetime: "Never (Lifetime)",
        autoNote: "Note: Backups are performed automatically every time you close the application.",
        auth: {
            title: "Confirm Identity",
            desc: "Enter your platform credentials to securely sync your local data with the cloud.",
            email: "Email address",
            password: "Password",
            sync: "Sync"
        },
        messages: {
            syncError: "Sync error",
            criticalError: "Critical network or server error."
        }
    },
    contacts: {
        title: "Service Contacts",
        count: "registered contacts",
        newContact: "New Contact",
        editContact: "Edit Contact",
        searchPlaceholder: "Search by name or service...",
        noContacts: "No contacts found.",
        deleteConfirm: "Delete this contact?",
        form: {
            fullName: "Full Name",
            serviceType: "Service Type",
            phone: "Phone",
            email: "Email",
            notes: "Additional Notes",
            save: "Save",
            update: "Update"
        },
        serviceTypes: {
            carpinter: "Carpenter",
            plumber: "Plumber",
            painter: "Painter",
            electrician: "Electrician",
            locksmith: "Locksmith",
            mason: "Mason",
            cleaning: "Cleaning",
            other: "Other"
        },
        details: {
            notFound: "Contact not found",
            backToList: "Back to list",
            idData: "Identification Data",
            notRegistered: "Not registered",
            notesTitle: "Notes & Specialty",
            noNotes: "No additional notes for this contact."
        }
    },
    auth: {
        signInTitle: "Web platform access",
        signUpTitle: "Create new account",
        email: "Email address",
        password: "Password",
        signIn: "Sign In",
        signUp: "Sign Up",
        processing: "Processing...",
        noAccount: "Don't have an account? Register here",
        hasAccount: "Already have an account? Sign in",
        signUpSuccess: "Registration successful! Please check your email (if required) or try logging in.",
        genericError: "Error processing request.",
        contactSupport: "Technical Support",
        supportHint: "Having trouble signing in?",
        copyright: "All rights reserved"
    },
    license: {
        claim: {
            title: "Link License",
            hello: "Hello",
            noLicense: "We haven't found a license associated with your account. Please enter your activation key.",
            label: "Activation Key",
            placeholder: "ER-XXXX-XXXX-XXXX",
            validating: "Validating...",
            submit: "Link and Enter",
            logout: "Sign out of this account",
            contactSales: "If you don't have a license, contact",
            error: "Could not validate license. Check the code."
        },
        validator: {
            title: "Activate License",
            subtitle: "Real Estate Management System",
            label: "License key",
            placeholder: "XXXXX-XXXXX-XXXXX-XXXXX",
            activating: "Verifying...",
            submit: "Activate",
            demoPrompt: "Do you want to try the application?",
            demoLink: "Use demonstration key →"
        }
    },
    property: {
        types: {
            house: "🏠 House",
            apartment: "🏢 Apartment",
            shop: "🛍️ Shop",
            land: "🌳 Land",
            local: "🏪 Local",
            office: "🏛️ Office",
            other: "🏗️ Other"
        },
        status: {
            available: "Available",
            rented: "Rented",
            maintenance: "Maintenance",
            reserved: "Reserved"
        },
        features: {
            kitchen: "Kitchen",
            dining: "Dining Room",
            laundry: "Laundry",
            living: "Living Room",
            elevator: "Elevator",
            stairs: "Stairs",
            terrace: "Terrace",
            rooftop: "Rooftop",
            parking: "Parking",
            garden: "Garden"
        },
        details: {
            title: "Property Details",
            notFound: "Property not found",
            backToList: "Back to list",
            edit: "Edit",
            delete: "Delete",
            noPhotos: "No photos registered",
            area: "Area",
            levels: "Levels",
            floor: "Floor",
            unit: "Unit",
            descriptionTitle: "Description & Details",
            noDescription: "No additional description available for this property.",
            locationTitle: "Location",
            address: "Address",
            district: "District",
            city: "Province / City",
            unitsTitle: "Internal Units",
            contractsTitle: "Contract History",
            viewAllContracts: "View all contracts",
            noContracts: "No contract records found for this property."
        }
    },
    contract: {
        status: {
            active: "Active",
            finished: "Finished",
            pending: "Pending"
        },
        details: {
            title: "Contract Details",
            notFound: "Contract not found",
            backToList: "Back to list",
            daysRemaining: "days remaining",
            expired: "Expired",
            registeredOn: "Registered on",
            linkedProperty: "Linked Property",
            viewProperty: "View property details",
            tenant: "Tenant",
            conditions: "Contract Conditions",
            monthlyRent: "Monthly Rent",
            paymentDay: "Payment Day",
            everyDayOfMonth: "Every {day} of month",
            startDate: "Start Date",
            endDate: "End Date",
            paymentsTitle: "Registered Rent Payments",
            periodMonth: "Period / Month",
            status: "Status",
            amountPaid: "Amount Paid",
            noPayments: "No payments have been registered for this contract yet.",
            legalDoc: "Legal Document",
            openDoc: "Open",
            noLegalDoc: "There is no attached file for this contract.",
            pdfImage: "PDF / Image File",
            reminder: "Reminder",
            expiresOn: "The contract expires on",
            recommendRenewal: "It is recommended to contact the tenant for renewal."
        }
    },
    tenant: {
        details: {
            title: "Tenant Details",
            notFound: "Tenant not found",
            backToList: "Back to list",
            active: "Active",
            inactive: "Inactive",
            contactInfo: "Contact Information",
            phone: "Phone",
            email: "Email",
            address: "Address",
            noPhone: "No phone",
            noEmail: "No email",
            noAddress: "No address registered",
            additionalInfo: "Additional Information",
            occupation: "Occupation",
            emergencyContact: "Emergency Contact",
            documentTitle: "Identity Document",
            docPhoto: "Photo / Scan of",
            docRegistered: "Digital file registered",
            viewDoc: "View Document",
            noDocImage: "No document image has been uploaded.",
            notesTitle: "Notes & Observations",
            noNotes: "No additional notes about this tenant.",
            historyTitle: "Rental History",
            inProgress: "In progress",
            noContracts: "This tenant currently has no contracts registered."
        }
    },
    finance: {
        status: {
            paid: "Paid",
            pending: "Pending"
        },
        details: {
            title: "Transaction Details",
            notFound: "Record not found",
            backToList: "Back to list",
            reference: "REF",
            income: "Income",
            expense: "Expense",
            property: "Property",
            tenant: "Tenant",
            period: "Period",
            paymentDate: "Payment Date",
            dueDate: "Due Date",
            notesTitle: "Record Notes",
            noNotes: "No additional notes were entered for this transaction.",
            receiptsTitle: "Receipts & Vouchers",
            viewReceipt: "View Receipt",
            noReceipts: "There are no receipts attached to this transaction."
        }
    },
    maintenance: {
        title: "Maintenance",
        subtitle: "Management of repair and improvement tickets",
        new: "New Ticket",
        edit: "Edit Ticket",
        searchPlaceholder: "Search by title or property...",
        noResults: "No maintenance tickets found.",
        loading: "Loading tickets...",
        table: {
            title: "Title / Property",
            status: "Status",
            cost: "Actual Cost",
            priority: "Priority",
            date: "Date"
        },
        form: {
            property: "Property",
            title: "Incident Title",
            titlePlaceholder: "Ex: Water leak, paint repair, locksmith...",
            description: "Detailed Description",
            priority: "Priority",
            status: "Status",
            estimatedCost: "Estimated Cost",
            actualCost: "Actual Cost",
            photos: "Photos / Evidence",
            save: "Save Ticket"
        },
        priority: {
            low: "Low",
            medium: "Medium",
            high: "High"
        },
        status: {
            open: "Open",
            in_progress: "In Progress",
            resolved: "Resolved",
            closed: "Closed"
        }
    }
};

export default en;
