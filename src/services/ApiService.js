import { supabase } from './supabaseClient'

/**
 * ApiService Bridge
 * This service abstracts the data layer. 
 * If running in Electron (Desktop/Hybrid), it uses IPC (window.easyrent).
 * If running in Web (Cloud), it uses Supabase REST API.
 */

const isElectron = Boolean(window.easyrent)
const isConfigured = !import.meta.env.VITE_SUPABASE_URL?.includes('placeholder') && import.meta.env.VITE_SUPABASE_URL !== undefined

// Retorna el ID del usuario autenticado en Supabase (web) o null en Electron
const getCurrentUserId = async () => {
    if (isElectron) return null
    const { data } = await supabase.auth.getSession()
    return data?.session?.user?.id ?? null
}

// Helper to handle Supabase responses
const handleSupa = async (promise, context) => {
    if (!isConfigured) {
        console.warn("Supabase not configured. Verifica que el archivo .env tenga VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY")
        return []
    }
    const { data, error } = await promise
    if (error) {
        console.error(`Supabase Error [${context}]:`, error)
        throw error
    }
    return data
}

// Deserializa un campo que puede ser JSON string o ya ser un array/objeto
const parseJson = (val, fallback = []) => {
    if (Array.isArray(val)) return val
    if (val !== null && typeof val === 'object') return [val]
    if (typeof val === 'string') {
        const trimmed = val.trim()
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            try {
                const parsed = JSON.parse(trimmed)
                return Array.isArray(parsed) ? parsed : [parsed]
            } catch { return fallback }
        }
    }
    return fallback
}

// Normaliza un registro de propiedad (asegura que photos y shared_amenities sean arrays y campos básicos existan)
const normalizeProperty = (p) => {
    if (!p) return null
    try {
        return {
            ...p,
            name: p.name || 'Sin nombre',
            address: p.address || '—',
            type: (p.type || 'otro').toLowerCase(),
            status: p.status || 'available',
            photos: parseJson(p.photos, []),
            shared_amenities: parseJson(p.shared_amenities, [])
        }
    } catch (err) {
        console.error("Normalize Property Error:", err, p)
        return { ...p, photos: [], shared_amenities: [], name: p?.name || 'Error' }
    }
}

// Limpia el objeto para enviar a Supabase (quita campos virtuales/joins)
const cleanUpdateData = (data) => {
    if (!data) return {}
    const {
        id,
        created_at,
        updated_at,
        // No strips user_id anymore, it's needed for Supabase RLS
        property_name,
        tenant_name,
        tenant_doc,
        properties,
        tenants,
        contracts,
        ...clean
    } = data
    return clean
}

// Normaliza un registro de finanza (asegura que receipt_paths sea un array y aplana joins)
const normalizeFinance = (f) => {
    if (!f) return null
    try {
        const prop = Array.isArray(f.properties) ? f.properties[0] : f.properties
        const ten = Array.isArray(f.tenants) ? f.tenants[0] : f.tenants
        return {
            ...f,
            amount: Number(f.amount || 0),
            late_fee: Number(f.late_fee || 0),
            receipt_paths: parseJson(f.receipt_paths, []),
            property_name: f.property_name || prop?.name || 'Propiedad desconocida',
            tenant_name: f.tenant_name || ten?.full_name || '',
            tenant_doc: f.tenant_doc || (ten ? `${ten.doc_type || ''} ${ten.doc_number || ''}`.trim() : ''),
            type: f.type || 'ingreso',
            status: f.status || 'pendiente',
            property_id: f.property_id || prop?.id || null
        }
    } catch (err) {
        console.error("Normalize Finance Error:", err, f)
        return { ...f, amount: 0, property_name: 'Error', tenant_name: 'Error' }
    }
}

const TYPES = ['casa', 'departamento', 'tienda', 'terreno', 'local', 'oficina', 'edificio', 'depósito', 'otro']
const STATUS_OPTS = ['disponible', 'alquilado', 'en mantenimiento', 'reservado']
// Normaliza un ticket de mantenimiento
const normalizeMaintenance = (m) => {
    if (!m) return { id: 'unknown-' + Math.random(), title: 'Ticket inválido', property_name: '—', photos: [] }
    try {
        const prop = Array.isArray(m.properties) ? m.properties[0] : m.properties
        return {
            ...m,
            title: m.title || 'Mantenimiento sin título',
            description: m.description || '',
            priority: m.priority || 'medium',
            status: m.status || 'open',
            actual_cost: Number(m.actual_cost || 0),
            estimated_cost: Number(m.estimated_cost || 0),
            photos: parseJson(m.photos, []),
            property_name: m.property_name || prop?.name || 'Propiedad no especificada',
            created_at: m.created_at || new Date().toISOString()
        }
    } catch (err) {
        console.error("Normalize Maintenance Error:", err, m)
        return {
            ...m,
            title: m?.title || 'Error',
            property_name: 'Error',
            actual_cost: 0,
            estimated_cost: 0,
            photos: []
        }
    }
}

// Normaliza un registro de contrato (aplana datos de joins y calcula días restantes)
const normalizeContract = (c) => {
    if (!c) return null
    try {
        const prop = Array.isArray(c.properties) ? c.properties[0] : c.properties
        const ten = Array.isArray(c.tenants) ? c.tenants[0] : c.tenants

        // Handle flattened fields (Electron) or joined fields (Supabase)
        const pName = c.property_name || prop?.name || 'Propiedad desconocida'
        const tName = c.tenant_name || ten?.full_name || 'Inquilino desconocido'
        const tDoc = c.tenant_doc || (ten ? `${ten.doc_type || ''} ${ten.doc_number || ''}`.trim() : '—')

        const end = c.end_date ? new Date(c.end_date + 'T00:00') : null
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const days_remaining = end ? Math.ceil((end - today) / (1000 * 60 * 60 * 24)) : 0

        return {
            ...c,
            amount: Number(c.monthly_rent || c.amount || 0),
            deposit: Number(c.deposit_amount || c.deposit || 0),
            property_name: pName,
            tenant_name: tName,
            tenant_doc: tDoc,
            days_remaining: c.days_remaining ?? days_remaining,
            status: c.status || 'activo'
        }
    } catch (err) {
        console.error("Normalize Contract Error:", err, c)
        return { ...c, property_name: 'Error', tenant_name: 'Error', days_remaining: 0 }
    }
}

// Normaliza un inquilino
const normalizeTenant = (t) => {
    if (!t) return null
    try {
        return {
            ...t,
            full_name: t.full_name || 'Sin nombre',
            doc_number: t.doc_number || '—',
            doc_type: t.doc_type || 'DNI',
            phone: t.phone || '',
            email: t.email || '',
            is_active: t.is_active !== undefined ? Boolean(t.is_active) : true
        }
    } catch (err) {
        console.error("Normalize Tenant Error:", err, t)
        return { ...t, full_name: t?.full_name || 'Error' }
    }
}

// Helper centralizado para consultas de lista con fallback
const fetchListWithFallback = async (electronMethod, table, joinedSelect, simpleSelect = '*') => {
    try {
        if (isElectron) return await electronMethod()
        if (!isConfigured) return []

        try {
            // Intento 1: Con joins
            const { data, error } = await supabase.from(table).select(joinedSelect).order('created_at', { ascending: false })
            if (!error && data) return data
            throw error || new Error("No data")
        } catch (err) {
            console.warn(`Fallback triggered for ${table} due to:`, err.message)
            // Intento 2: Consulta simple
            const { data, error } = await supabase.from(table).select(simpleSelect).order('created_at', { ascending: false })
            if (error) throw error
            return data || []
        }
    } catch (err) {
        console.error(`Systemic failure fetching ${table}:`, err)
        return []
    }
}

export const api = {
    properties: {
        getAll: () => fetchListWithFallback(
            () => window.easyrent.properties.getAll(),
            'properties',
            '*'
        ).then(data => (data || []).map(normalizeProperty)),
        getById: async (id) => {
            try {
                const data = await (isElectron ? window.easyrent.properties.getById(id) : handleSupa(supabase.from('properties').select('*').eq('id', id).single(), 'properties.getById'))
                return normalizeProperty(data)
            } catch (err) { console.error("Property getById error:", err); return null }
        },
        create: async (data) => {
            if (isElectron) return window.easyrent.properties.create(data)
            const user_id = await getCurrentUserId()
            const cleanData = { ...cleanUpdateData(data), user_id }
            return handleSupa(supabase.from('properties').insert([cleanData]).select().single(), 'properties.create')
        },
        update: (id, data) => {
            const cleanData = cleanUpdateData(data)
            return isElectron ? window.easyrent.properties.update(id, cleanData) : handleSupa(supabase.from('properties').update(cleanData).eq('id', id).select().single(), 'properties.update')
        },
        delete: (id) => isElectron ? window.easyrent.properties.delete(id) : handleSupa(supabase.from('properties').delete().eq('id', id), 'properties.delete'),
    },
    tenants: {
        getAll: () => fetchListWithFallback(
            () => window.easyrent.tenants.getAll(),
            'tenants',
            '*'
        ).then(data => (data || []).map(normalizeTenant)),
        getById: async (id) => {
            try {
                const data = await (isElectron ? window.easyrent.tenants.getById(id) : handleSupa(supabase.from('tenants').select('*').eq('id', id).single(), 'tenants.getById'))
                return normalizeTenant(data)
            } catch (err) { console.error("Tenant getById error:", err); return null }
        },
        create: async (data) => {
            if (isElectron) return window.easyrent.tenants.create(data)
            const user_id = await getCurrentUserId()
            const cleanData = { ...cleanUpdateData(data), user_id }
            return handleSupa(supabase.from('tenants').insert([cleanData]).select().single(), 'tenants.create')
        },
        update: (id, data) => {
            const cleanData = cleanUpdateData(data)
            return isElectron ? window.easyrent.tenants.update(id, cleanData) : handleSupa(supabase.from('tenants').update(cleanData).eq('id', id).select().single(), 'tenants.update')
        },
        delete: (id) => isElectron ? window.easyrent.tenants.delete(id) : handleSupa(supabase.from('tenants').delete().eq('id', id), 'tenants.delete'),
    },
    contracts: {
        getAll: () => fetchListWithFallback(
            () => window.easyrent.contracts.getAll(),
            'contracts',
            '*, properties(name), tenants(full_name, doc_type, doc_number)'
        ).then(data => (data || []).map(normalizeContract)),
        getById: async (id) => {
            try {
                let data
                if (isElectron) {
                    data = await window.easyrent.contracts.getById(id)
                } else {
                    try {
                        data = await handleSupa(supabase.from('contracts').select('*, properties(name), tenants(full_name, doc_type, doc_number)').eq('id', id).single())
                    } catch {
                        data = await handleSupa(supabase.from('contracts').select('*').eq('id', id).single())
                    }
                }
                return normalizeContract(data)
            } catch (err) { console.error("Contract getById error:", err); return null }
        },
        // ... rest same
        create: async (data) => {
            if (isElectron) return window.easyrent.contracts.create(data)
            const user_id = await getCurrentUserId()
            const cleanData = { ...cleanUpdateData(data), user_id }
            return handleSupa(supabase.from('contracts').insert([cleanData]).select().single(), 'contracts.create')
        },
        update: (id, data) => {
            const cleanData = cleanUpdateData(data)
            return isElectron ? window.easyrent.contracts.update(id, cleanData) : handleSupa(supabase.from('contracts').update(cleanData).eq('id', id).select().single(), 'contracts.update')
        },
        delete: (id) => isElectron ? window.easyrent.contracts.delete(id) : handleSupa(supabase.from('contracts').delete().eq('id', id), 'contracts.delete'),
        getProjections: async () => {
            try {
                const contracts = await api.contracts.getAll()
                const active = (contracts || []).filter(c => {
                    const end = new Date(c.end_date)
                    return end > new Date()
                })

                const months = []
                const now = new Date()
                for (let i = 0; i < 12; i++) {
                    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
                    const monthStr = d.toISOString().substring(0, 7) // YYYY-MM
                    let totalPEN = 0
                    let totalUSD = 0

                    active.forEach(c => {
                        const start = new Date(c.start_date)
                        const end = new Date(c.end_date)
                        if (d >= new Date(start.getFullYear(), start.getMonth(), 1) && d <= end) {
                            if (c.currency === 'PEN') totalPEN += Number(c.monthly_rent || c.amount || 0)
                            else totalUSD += Number(c.monthly_rent || c.amount || 0)
                        }
                    })

                    months.push({ month: monthStr, PEN: totalPEN, USD: totalUSD })
                }
                return months
            } catch (err) { console.error("Projections error:", err); return [] }
        }
    },
    finances: {
        getAll: (filters) => fetchListWithFallback(
            () => window.easyrent.finances.getAll(filters),
            'finances',
            '*, properties(name), tenants(full_name, doc_type, doc_number)'
        ).then(data => (data || []).map(normalizeFinance)),
        getById: async (id) => {
            try {
                let data
                if (isElectron) {
                    data = await window.easyrent.finances.getById(id)
                } else {
                    try {
                        data = await handleSupa(supabase.from('finances').select('*, properties(name), tenants(full_name, doc_type, doc_number)').eq('id', id).single())
                    } catch {
                        data = await handleSupa(supabase.from('finances').select('*').eq('id', id).single())
                    }
                }
                return normalizeFinance(data)
            } catch (err) { console.error("Finance getById error:", err); return null }
        },
        create: async (data) => {
            if (isElectron) {
                const results = await window.easyrent.finances.create(data)
                return Array.isArray(results) ? results[0] : results
            }
            const user_id = await getCurrentUserId()
            const cleanData = { ...cleanUpdateData(data), user_id }
            return handleSupa(supabase.from('finances').insert([cleanData]).select().single(), 'finances.create')
        },
        update: (id, data) => {
            const cleanData = cleanUpdateData(data)
            return isElectron ? window.easyrent.finances.update(id, cleanData) : handleSupa(supabase.from('finances').update(cleanData).eq('id', id).select().single(), 'finances.update')
        },
        delete: (id) => isElectron ? window.easyrent.finances.delete(id) : handleSupa(supabase.from('finances').delete().eq('id', id), 'finances.delete'),
        getSummary: () => isElectron ? window.easyrent.finances.getSummary() : Promise.resolve({}),
    },
    contacts: {
        getAll: async () => {
            try {
                return await (isElectron ? window.easyrent.contacts.getAll() : handleSupa(supabase.from('contacts').select('*').order('name')))
            } catch (err) { console.error("Contacts getAll error:", err); return [] }
        },
        getById: async (id) => {
            try {
                return await (isElectron ? window.easyrent.contacts.getById(id) : handleSupa(supabase.from('contacts').select('*').eq('id', id).single()))
            } catch (err) { console.error("Contact getById error:", err); return null }
        },
        create: async (data) => {
            if (isElectron) return window.easyrent.contacts.create(data)
            const user_id = await getCurrentUserId()
            const cleanData = { ...cleanUpdateData(data), user_id }
            return handleSupa(supabase.from('contacts').insert([cleanData]).select().single(), 'contacts.create')
        },
        update: (id, data) => {
            const cleanData = cleanUpdateData(data)
            return isElectron ? window.easyrent.contacts.update(id, cleanData) : handleSupa(supabase.from('contacts').update(cleanData).eq('id', id).select().single(), 'contacts.update')
        },
        delete: (id) => isElectron ? window.easyrent.contacts.delete(id) : handleSupa(supabase.from('contacts').delete().eq('id', id), 'contacts.delete'),
    },
    maintenance: {
        getAll: (filters) => fetchListWithFallback(
            () => window.easyrent.maintenance.getAll(filters),
            'maintenance_tickets',
            '*, properties(name)'
        ).then(data => (data || []).map(normalizeMaintenance)),
        getById: async (id) => {
            try {
                let data
                if (isElectron) {
                    data = await window.easyrent.maintenance.getById(id)
                } else {
                    try {
                        data = await handleSupa(supabase.from('maintenance_tickets').select('*, properties(name)').eq('id', id).single())
                    } catch {
                        data = await handleSupa(supabase.from('maintenance_tickets').select('*').eq('id', id).single())
                    }
                }
                return normalizeMaintenance(data)
            } catch (err) { console.error("Maintenance getById error:", err); return null }
        },
        create: async (data) => {
            if (isElectron) return window.easyrent.maintenance.create(data)
            const user_id = await getCurrentUserId()
            const cleanData = { ...cleanUpdateData(data), user_id }
            return handleSupa(supabase.from('maintenance_tickets').insert([cleanData]).select().single(), 'maintenance.create')
        },
        update: (id, data) => {
            const cleanData = cleanUpdateData(data)
            return isElectron ? window.easyrent.maintenance.update(id, cleanData) : handleSupa(supabase.from('maintenance_tickets').update(cleanData).eq('id', id).select().single(), 'maintenance.update')
        },
        delete: (id) => isElectron ? window.easyrent.maintenance.delete(id) : handleSupa(supabase.from('maintenance_tickets').delete().eq('id', id), 'maintenance.delete'),
    },
    auth: {
        signIn: async (email, password) => {
            if (isElectron) return { user: { email: 'admin@easyrent.local' }, error: null }
            const { data, error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) throw error
            return data
        },
        signUp: async (email, password) => {
            if (isElectron) throw new Error("Registro solo disponible en versión Web/Cloud")
            const { data, error } = await supabase.auth.signUp({ email, password })
            if (error) throw error
            return data
        },
        signOut: async () => {
            if (isElectron) return
            const { error } = await supabase.auth.signOut()
            if (error) throw error
        },
        getSession: async () => {
            if (isElectron) return { session: { user: { email: 'admin@easyrent.local' } } }
            const { data, error } = await supabase.auth.getSession()
            if (error) throw error
            return data
        },
        onAuthStateChange: (cb) => {
            if (isElectron) return () => { }
            const { data: { subscription } } = supabase.auth.onAuthStateChange(cb)
            return () => subscription.unsubscribe()
        }
    },
    license: {
        getStatus: () => isElectron ? window.easyrent.license.getStatus() : Promise.resolve({ status: 'active', expires_at: '2099-12-31', cloud_expires_at: '2099-12-31', plan_type: 'cloud' }),
        getLicense: () => isElectron ? window.easyrent.license.getStatus() : Promise.resolve({ license_key: 'WEB-VERSION-MOCK', plan_type: 'Cloud' }),
        getHardwareId: () => isElectron ? window.easyrent.license.getHWID() : Promise.resolve('WEB-ENVIRONMENT-HWID'),
        getByEmail: async (email) => {
            if (isElectron) return null
            try {
                const { data, error } = await supabase.from('licenses').select('*').eq('owner_email', email).maybeSingle()
                if (error) throw error
                return data
            } catch (err) {
                console.error("License getByEmail error:", err)
                return null
            }
        },
        claim: async (key, email) => {
            if (isElectron) throw new Error("Reclamo de licencia debe ser vía Web/Cloud")
            const { data: lic, error: err1 } = await supabase.from('licenses').select('*').eq('license_key', key).maybeSingle()
            if (err1) throw err1
            if (!lic) throw new Error("La clave de licencia no es válida.")
            if (lic.owner_email && lic.owner_email !== email) throw new Error("Esta licencia ya pertenece a otro usuario.")
            const { data, error: err2 } = await supabase.from('licenses').update({ owner_email: email }).eq('license_key', key).select().single()
            if (err2) throw err2
            return data
        },
        validate: async (key) => {
            if (isElectron) return window.easyrent.license.validate(key)
            const { data, error } = await supabase.from('licenses').select('*').eq('license_key', key).maybeSingle()
            if (error || !data) return { status: 'invalid' }
            return data
        },
        autoBackup: () => isElectron ? window.easyrent.license.autoBackup() : Promise.resolve(),
        getBackupHistory: async () => {
            try {
                return await (isElectron ? window.easyrent.license.getBackupHistory() : Promise.resolve([]))
            } catch (err) {
                console.error("getBackupHistory error:", err)
                return []
            }
        },
        addBackupRecord: async (status, count, bid, notes) => {
            try {
                return await (isElectron ? window.easyrent.license.addBackupRecord(status, count, bid, notes) : Promise.resolve())
            } catch (err) {
                console.error("addBackupRecord error:", err)
            }
        },
    },
    cloudSync: {
        sync: (email, password) => isElectron ? window.easyrent.cloud.sync(email, password) : Promise.reject("Sync solo disponible en versión Desktop"),
    },
    admin: {
        licenses: {
            getAll: async () => {
                if (isElectron) return []
                try {
                    const data = await handleSupa(supabase.from('licenses').select('*').order('created_at', { ascending: false }))
                    return Array.isArray(data) ? data : []
                } catch (err) {
                    console.error("Admin licenses getAll error:", err)
                    return []
                }
            },
            create: async (data) => {
                if (isElectron) throw new Error("Admin solo disponible en Web")
                return handleSupa(supabase.from('licenses').insert([data]).select().single())
            },
            update: async (key, data) => {
                if (isElectron) throw new Error("Admin solo disponible en Web")
                return handleSupa(supabase.from('licenses').update(data).eq('license_key', key).select().single())
            },
            delete: async (key) => {
                if (isElectron) throw new Error("Admin solo disponible en Web")
                return handleSupa(supabase.from('licenses').delete().eq('license_key', key))
            },
        },
        users: {
            resetPassword: async (email) => {
                if (isElectron) return
                console.log("Password reset requested for:", email)
                alert(`Se ha solicitado un restablecimiento de contraseña para ${email}. (Stub comercial)`)
                return { success: true }
            }
        }
    },
    files: {
        saveUpload: async ({ buffer, subdir, filename, file }) => {
            // Priority: File object (preserves MIME type), then raw buffer
            const dataToUpload = file || buffer

            // 1. Detect Content-Type with fallbacks
            let contentType = file?.type
            if (!contentType || contentType === '') {
                const ext = filename.split('.').pop().toLowerCase()
                const mimeMap = {
                    'pdf': 'application/pdf',
                    'jpg': 'image/jpeg',
                    'jpeg': 'image/jpeg',
                    'png': 'image/png',
                    'webp': 'image/webp'
                }
                contentType = mimeMap[ext] || 'application/octet-stream'
            }

            console.log(`[ApiService] Uploading ${filename} to ${subdir}. Detected Content-Type: ${contentType}`)

            if (isElectron) {
                // Electron version still needs buffer for fs modules
                const finalBuffer = buffer || (file ? new Uint8Array(await file.arrayBuffer()) : null)
                return window.easyrent.files.saveUpload({ buffer: finalBuffer, subdir, filename })
            }

            const path = `${subdir}/${filename}`
            const bucket = 'uploads'
            const { error } = await supabase.storage
                .from(bucket)
                .upload(path, dataToUpload, {
                    upsert: true,
                    contentType: contentType
                })

            if (error) {
                console.error("[ApiService] Upload Error:", error)
                throw error
            }

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(path)

            return publicUrl
        },
        open: (path) => {
            if (isElectron && window.easyrent?.files?.openFile) {
                window.easyrent.files.openFile(path)
            } else {
                window.open(path, '_blank')
            }
        }
    }
}
