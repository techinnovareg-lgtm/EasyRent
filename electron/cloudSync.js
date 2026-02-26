'use strict';
/**
 * cloudSync.js — EasyRent Desktop ↔ Supabase Cloud Sync
 * Reads all local SQLite data and upserts it into Supabase,
 * associated with the authenticated user's ID.
 *
 * Only runs when the license has plan_type = 'hybrid' or 'cloud'
 * AND cloud_expires_at is in the future.
 */

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || '';

/**
 * Authenticate user with Supabase and return access token + user_id
 */
async function authenticateUser(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error_description || err.msg || 'Error de autenticación');
    }
    const data = await res.json();
    return { accessToken: data.access_token, userId: data.user.id };
}

/**
 * Upsert a batch of records into a Supabase table
 */
async function upsertTable(tableName, records, accessToken) {
    if (!records || records.length === 0) return 0;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(records),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Error en tabla ${tableName}: ${JSON.stringify(err)}`);
    }
    return records.length;
}

/**
 * Main sync function — called from IPC handler
 * @param {object} db - The database module instance
 * @param {string} email - User's Supabase email
 * @param {string} password - User's Supabase password
 * @returns {{ success: boolean, synced: number, errors: string[] }}
 */
async function syncToCloud(db, email, password) {
    if (!SUPABASE_URL || !SUPABASE_ANON) {
        return { success: false, synced: 0, errors: ['Supabase no está configurado en este entorno.'] };
    }

    const errors = [];
    let totalSynced = 0;

    try {
        // 1. Authenticate
        const { accessToken, userId } = await authenticateUser(email, password);

        // 2. Read all local data
        const properties = db.getAllProperties() || [];
        const tenants = db.getAllTenants() || [];
        const contracts = db.getAllContracts() || [];
        const finances = db.getAllFinances() || [];
        const contacts = db.getAllContacts() || [];

        // 3. Tag all records with user_id
        const tag = (records) => records.map(r => {
            // Remove SQLite-specific fields that don't exist in Supabase
            const { rowid, ...rest } = r;
            return { ...rest, user_id: userId };
        });

        // 4. Upsert each table
        const tables = [
            { name: 'properties', data: tag(properties) },
            { name: 'tenants', data: tag(tenants) },
            { name: 'contracts', data: tag(contracts) },
            { name: 'finances', data: tag(finances) },
            { name: 'contacts', data: tag(contacts) },
            { name: 'maintenance_tickets', data: tag(db.getAllMaintenanceTickets() || []) },
        ];

        for (const table of tables) {
            try {
                const count = await upsertTable(table.name, table.data, accessToken);
                totalSynced += count;
            } catch (err) {
                errors.push(err.message);
            }
        }

        return { success: errors.length === 0, synced: totalSynced, errors };

    } catch (err) {
        return { success: false, synced: 0, errors: [err.message] };
    }
}

module.exports = { syncToCloud };
