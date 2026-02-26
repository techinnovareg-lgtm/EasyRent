'use strict';
/**
 * License Validator — EasyRent DRM
 * Validates license key + HWID against Supabase REST API
 * Falls back to "demo" mode if no internet or no Supabase env vars
 */

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || '';
const DEMO_KEY = 'EASYRENT-DEMO-0000-0000-XXXX';
const LICENSE_OFFLINE_DAYS = 30; // grace period for offline use

async function validateLicense(licenseKey, hwid, db) {
    // ── DEMO MODE ──────────────────────────────────────────────────────────
    if (licenseKey === DEMO_KEY) {
        const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
        db.saveLicense(licenseKey, hwid, expiresAt, 'demo');
        return { valid: true, status: 'demo', message: 'Modo demostración activo (30 días)', expiresAt };
    }

    // ── OFFLINE GRACE PERIOD ───────────────────────────────────────────────
    const stored = db.getLicenseStatus();
    if (stored && stored.license_key === licenseKey && stored.hwid === hwid && stored.status === 'active') {
        const expires = new Date(stored.expires_at);
        if (expires > new Date()) {
            return { valid: true, status: 'active', message: 'Licencia válida (caché)', expiresAt: stored.expires_at };
        }
    }

    // ── ONLINE VALIDATION ─────────────────────────────────────────────────
    if (!SUPABASE_URL || !SUPABASE_ANON) {
        // No Supabase config → check if we have a locally stored valid license
        if (stored && stored.license_key === licenseKey && stored.status === 'active') {
            const expires = new Date(stored.expires_at);
            if (expires > new Date()) {
                return { valid: true, status: 'active', message: 'Licencia válida (offline)', expiresAt: stored.expires_at };
            }
        }
        return { valid: false, status: 'no_server', message: 'Servidor de licencias no configurado. Use la clave DEMO.' };
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(`${SUPABASE_URL}/rest/v1/licenses?license_key=eq.${licenseKey}&select=*`, {
            headers: {
                'apikey': SUPABASE_ANON,
                'Authorization': `Bearer ${SUPABASE_ANON}`,
                'Content-Type': 'application/json',
            },
            signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const rows = await res.json();

        if (!rows || rows.length === 0) {
            return { valid: false, status: 'not_found', message: 'Licencia no encontrada.' };
        }

        const license = rows[0];

        if (license.status === 'revoked' || license.status === 'suspended') {
            db.revokeLicense();
            return { valid: false, status: license.status, message: 'Esta licencia ha sido revocada.' };
        }

        if (license.hwid && license.hwid !== hwid) {
            return { valid: false, status: 'hwid_mismatch', message: 'Esta licencia está registrada en otro dispositivo.' };
        }

        const expiresAt = license.expires_at;
        const planType = license.plan || 'desktop';
        const cloudExpiresAt = license.cloud_expires_at || null;

        if (expiresAt && new Date(expiresAt) < new Date()) {
            return { valid: false, status: 'expired', message: 'La licencia ha expirado.' };
        }

        // Register HWID if first activation
        if (!license.hwid) {
            await fetch(`${SUPABASE_URL}/rest/v1/licenses?license_key=eq.${licenseKey}`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_ANON,
                    'Authorization': `Bearer ${SUPABASE_ANON}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal',
                },
                body: JSON.stringify({ hwid, activated_at: new Date().toISOString() }),
            });
        }

        db.saveLicense(licenseKey, hwid, expiresAt ?? new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(), 'active', planType, cloudExpiresAt);
        return { valid: true, status: 'active', message: 'Licencia activada correctamente.', expiresAt, plan: planType, cloudExpiresAt };

    } catch (err) {
        // Network error → check local cache
        if (stored && stored.license_key === licenseKey && stored.hwid === hwid && stored.status === 'active') {
            const expires = new Date(stored.expires_at);
            if (expires > new Date()) {
                return { valid: true, status: 'active', message: 'Sin conexión — usando licencia en caché.', expiresAt: stored.expires_at };
            }
        }
        return { valid: false, status: 'network_error', message: `Error de red: ${err.message}` };
    }
}

module.exports = { validateLicense };
