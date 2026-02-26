'use strict';
/**
 * SQLite Database Layer — EasyRent
 * Uses better-sqlite3 (synchronous API)
 */
let Database;
try {
  Database = require('better-sqlite3');
} catch (e) {
  // Fallback for dev without native rebuild
  console.error('better-sqlite3 not available:', e.message);
}

let db;

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS properties (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL,
  type         TEXT    DEFAULT 'casa',
  address      TEXT,
  city         TEXT,
  province     TEXT,
  district     TEXT,
  area_m2      REAL,
  levels       INTEGER DEFAULT 1,
  bedrooms     INTEGER,
  bathrooms    INTEGER,
  floor        INTEGER,
  unit_number  TEXT,
  has_elevator INTEGER DEFAULT 0,
  has_stairs   INTEGER DEFAULT 0,
  has_terrace  INTEGER DEFAULT 0,
  has_rooftop  INTEGER DEFAULT 0,
  has_parking  INTEGER DEFAULT 0,
  has_garden   INTEGER DEFAULT 0,
  has_kitchen  INTEGER DEFAULT 0,
  has_dining_room INTEGER DEFAULT 0,
  has_laundry  INTEGER DEFAULT 0,
  has_living_room INTEGER DEFAULT 0,
  shared_amenities TEXT DEFAULT '[]',
  description  TEXT,
  photos       TEXT    DEFAULT '[]',
  status       TEXT    DEFAULT 'disponible',
  is_active    INTEGER DEFAULT 1,
  parent_id    INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  created_at   TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tenants (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name        TEXT    NOT NULL,
  doc_type         TEXT    DEFAULT 'DNI',
  doc_number       TEXT    NOT NULL,
  doc_image_path   TEXT,
  phone            TEXT,
  email            TEXT,
  address          TEXT,
  occupation       TEXT,
  emergency_contact TEXT,
  notes            TEXT,
  is_active        INTEGER DEFAULT 1,
  created_at       TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contracts (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id       INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  tenant_id         INTEGER REFERENCES tenants(id) ON DELETE SET NULL,
  start_date        TEXT    NOT NULL,
  end_date          TEXT    NOT NULL,
  monthly_rent      REAL    NOT NULL,
  deposit_amount    REAL    DEFAULT 0,
  currency          TEXT    DEFAULT 'PEN',
  status            TEXT    DEFAULT 'activo',
  contract_file_path TEXT,
  payment_day       INTEGER DEFAULT 1,
  tax_rate          REAL    DEFAULT 0,
  notes             TEXT,
  created_at        TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS finances (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id   INTEGER REFERENCES contracts(id) ON DELETE SET NULL,
  property_id   INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  tenant_id     INTEGER REFERENCES tenants(id) ON DELETE SET NULL,
  type          TEXT    CHECK(type IN ('ingreso','egreso')) NOT NULL,
  category      TEXT    DEFAULT 'renta',
  amount        REAL    NOT NULL,
  late_fee      REAL    DEFAULT 0,
  currency      TEXT    DEFAULT 'PEN',
  payment_date  TEXT,
  due_date      TEXT,
  period_month  TEXT,
  status        TEXT    DEFAULT 'pendiente',
  tax_rate      REAL    DEFAULT 0,
  tax_amount    REAL    DEFAULT 0,
  voucher_path  TEXT,
  receipt_paths TEXT    DEFAULT '[]',
  notes         TEXT,
  created_at    TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contacts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL,
  service_type TEXT,
  phone        TEXT,
  email        TEXT,
  notes        TEXT,
  created_at   TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS license (
  id            INTEGER PRIMARY KEY CHECK(id = 1),
  license_key   TEXT,
  hwid          TEXT,
  validated_at  TEXT,
  expires_at    TEXT,
  plan_type     TEXT    DEFAULT 'desktop',
  cloud_expires_at TEXT,
  status        TEXT    DEFAULT 'unactivated'
);

CREATE TABLE IF NOT EXISTS cloud_backups (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  backup_date   TEXT    DEFAULT (datetime('now')),
  status        TEXT    DEFAULT 'success',
  records_count INTEGER DEFAULT 0,
  backup_id     TEXT,
  notes         TEXT
);

CREATE TABLE IF NOT EXISTS maintenance_tickets (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id  INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  title        TEXT    NOT NULL,
  description  TEXT,
  priority     TEXT    DEFAULT 'medium', -- low, medium, high
  status       TEXT    DEFAULT 'open',   -- open, in_progress, resolved, closed
  photos       TEXT    DEFAULT '[]',
  estimated_cost REAL  DEFAULT 0,
  actual_cost   REAL   DEFAULT 0,
  finance_id    INTEGER REFERENCES finances(id) ON DELETE SET NULL,
  created_at    TEXT    DEFAULT (datetime('now'))
);

-- Views for dashboard
CREATE VIEW IF NOT EXISTS v_dashboard AS
SELECT
  (SELECT COUNT(*) FROM properties) AS total_properties,
  (SELECT COUNT(*) FROM tenants) AS total_tenants,
  (SELECT COUNT(*) FROM contracts WHERE status = 'activo') AS active_contracts,
  (SELECT COALESCE(SUM(amount), 0) FROM finances WHERE type = 'ingreso' AND status = 'pagado' AND strftime('%Y-%m', payment_date) = strftime('%Y-%m', 'now')) AS income_this_month,
  (SELECT COALESCE(SUM(amount), 0) FROM finances WHERE type = 'egreso' AND status = 'pagado' AND strftime('%Y-%m', payment_date) = strftime('%Y-%m', 'now')) AS expenses_this_month,
  (SELECT COUNT(*) FROM finances WHERE type = 'ingreso' AND status = 'pendiente' AND due_date < date('now')) AS overdue_rents;
`;

function initialize(dbPath) {
  if (!Database) {
    console.error('DATABASE ERROR: better-sqlite3 not found');
    return;
  }
  try {
    console.log(`DB INIT: Opening ${dbPath}...`);
    db = new Database(dbPath);
    console.log('DB INIT: Running Schema...');
    db.exec(SCHEMA);

    // Migration: Add missing columns if they don't exist
    const ensureColumn = (table, column, type) => {
      try {
        const info = db.prepare(`PRAGMA table_info(${table})`).all();
        const exists = info.some(c => c.name === column);
        if (!exists) {
          console.log(`Migration: Adding ${column} to ${table}...`);
          db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`).run();
        }
      } catch (e) {
        console.error(`Migration Error on ${table}.${column}:`, e.message);
      }
    };

    ensureColumn('properties', 'city', 'TEXT');
    ensureColumn('properties', 'province', 'TEXT');
    ensureColumn('properties', 'district', 'TEXT');
    ensureColumn('properties', 'area_m2', 'REAL');
    ensureColumn('properties', 'levels', 'INTEGER DEFAULT 1');
    ensureColumn('properties', 'bedrooms', 'INTEGER');
    ensureColumn('properties', 'bathrooms', 'INTEGER');
    ensureColumn('properties', 'floor', 'INTEGER');
    ensureColumn('properties', 'unit_number', 'TEXT');
    ensureColumn('properties', 'is_active', 'INTEGER DEFAULT 1');
    ensureColumn('properties', 'parent_id', 'INTEGER REFERENCES properties(id) ON DELETE SET NULL');
    ensureColumn('properties', 'has_elevator', 'INTEGER DEFAULT 0');
    ensureColumn('properties', 'has_stairs', 'INTEGER DEFAULT 0');
    ensureColumn('properties', 'has_terrace', 'INTEGER DEFAULT 0');
    ensureColumn('properties', 'has_rooftop', 'INTEGER DEFAULT 0');
    ensureColumn('properties', 'has_parking', 'INTEGER DEFAULT 0');
    ensureColumn('properties', 'has_garden', 'INTEGER DEFAULT 0');
    ensureColumn('properties', 'has_kitchen', 'INTEGER DEFAULT 0');
    ensureColumn('properties', 'has_dining_room', 'INTEGER DEFAULT 0');
    ensureColumn('properties', 'has_laundry', 'INTEGER DEFAULT 0');
    ensureColumn('properties', 'has_living_room', 'INTEGER DEFAULT 0');
    ensureColumn('properties', 'shared_amenities', "TEXT DEFAULT '[]'");

    ensureColumn('tenants', 'is_active', 'INTEGER DEFAULT 1');

    ensureColumn('finances', 'late_fee', 'REAL DEFAULT 0');
    ensureColumn('finances', 'receipt_paths', "TEXT DEFAULT '[]'");
    ensureColumn('finances', 'period_month', 'TEXT');
    ensureColumn('finances', 'tax_rate', 'REAL DEFAULT 0');
    ensureColumn('finances', 'tax_amount', 'REAL DEFAULT 0');
    ensureColumn('contracts', 'tax_rate', 'REAL DEFAULT 0');
    ensureColumn('license', 'plan_type', "TEXT DEFAULT 'desktop'");
    ensureColumn('license', 'cloud_expires_at', "TEXT");

    // Insert default license row AFTER all migrations
    db.prepare("INSERT OR IGNORE INTO license (id, status, plan_type) VALUES (1, 'unactivated', 'desktop')").run();

    console.log('DB INIT: Successfully initialized');
  } catch (err) {
    console.error(`DB INIT ERROR: ${err.message}`);
    throw err;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────
const jsonCol = (v) => (typeof v === 'string' ? v : JSON.stringify(v ?? []));
const safeJson = (v) => { try { return JSON.parse(v); } catch { return []; } };
const idSan = (id) => {
  const parsed = parseInt(id);
  return isNaN(parsed) ? null : parsed;
};

function rowToObj(row) {
  if (!row) return null;
  if (row.photos) row.photos = safeJson(row.photos);
  if (row.receipt_paths) row.receipt_paths = safeJson(row.receipt_paths);
  if (row.shared_amenities) row.shared_amenities = safeJson(row.shared_amenities);
  return row;
}

// ─── Properties ───────────────────────────────────────────────────────────
function getAllProperties() {
  return db.prepare('SELECT * FROM properties ORDER BY created_at DESC').all().map(rowToObj);
}
function getPropertyById(id) {
  return rowToObj(db.prepare('SELECT * FROM properties WHERE id = ?').get(id));
}
function createProperty(data) {
  const { name, type, address, city, province, district, area_m2, levels, bedrooms, bathrooms, floor, unit_number, has_elevator, has_stairs, has_terrace, has_rooftop, has_parking, has_garden, has_kitchen, has_dining_room, has_laundry, has_living_room, shared_amenities, description, photos, status, is_active, parent_id } = data;
  const r = db.prepare(`
    INSERT INTO properties (name,type,address,city,province,district,area_m2,levels,bedrooms,bathrooms,floor,unit_number,has_elevator,has_stairs,has_terrace,has_rooftop,has_parking,has_garden,has_kitchen,has_dining_room,has_laundry,has_living_room,shared_amenities,description,photos,status,is_active,parent_id)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(name, type ?? 'casa', address, city, province, district, area_m2, levels ?? 1, bedrooms, bathrooms, floor, unit_number, has_elevator ? 1 : 0, has_stairs ? 1 : 0, has_terrace ? 1 : 0, has_rooftop ? 1 : 0, has_parking ? 1 : 0, has_garden ? 1 : 0, has_kitchen ? 1 : 0, has_dining_room ? 1 : 0, has_laundry ? 1 : 0, has_living_room ? 1 : 0, jsonCol(shared_amenities), description, jsonCol(photos), status ?? 'disponible', is_active ? 1 : 0, idSan(parent_id));
  return getPropertyById(r.lastInsertRowid);
}
function updateProperty(id, data) {
  try {
    console.log(`DB: Updating property ${id}...`);
    const current = getPropertyById(id);
    if (!current) throw new Error(`Property ${id} not found`);

    // Remove id from data to avoid conflicting with primary key during merge
    const { id: _, ...safeData } = data;
    const merged = {
      ...current,
      ...safeData,
      photos: jsonCol(safeData.photos ?? current.photos),
      shared_amenities: jsonCol(safeData.shared_amenities ?? current.shared_amenities)
    };

    db.prepare(`
      UPDATE properties SET name=?,type=?,address=?,city=?,province=?,district=?,area_m2=?,levels=?,bedrooms=?,bathrooms=?,floor=?,unit_number=?,has_elevator=?,has_stairs=?,has_terrace=?,has_rooftop=?,has_parking=?,has_garden=?,has_kitchen=?,has_dining_room=?,has_laundry=?,has_living_room=?,shared_amenities=?,description=?,photos=?,status=?,is_active=?,parent_id=?
      WHERE id=?
    `).run(merged.name, merged.type, merged.address, merged.city, merged.province, merged.district, merged.area_m2, merged.levels, merged.bedrooms, merged.bathrooms, merged.floor, merged.unit_number, merged.has_elevator ? 1 : 0, merged.has_stairs ? 1 : 0, merged.has_terrace ? 1 : 0, merged.has_rooftop ? 1 : 0, merged.has_parking ? 1 : 0, merged.has_garden ? 1 : 0, merged.has_kitchen ? 1 : 0, merged.has_dining_room ? 1 : 0, merged.has_laundry ? 1 : 0, merged.has_living_room ? 1 : 0, merged.shared_amenities, merged.description, merged.photos, merged.status, merged.is_active ? 1 : 0, idSan(merged.parent_id), id);

    console.log(`DB: Property ${id} updated successfully`);
    return getPropertyById(id);
  } catch (e) {
    console.error(`DB ERROR (updateProperty): ${e.message}`);
    throw e;
  }
}
function deleteProperty(id) {
  return db.prepare('DELETE FROM properties WHERE id = ?').run(id).changes > 0;
}

// ─── Tenants ──────────────────────────────────────────────────────────────
function getAllTenants() {
  return db.prepare('SELECT * FROM tenants ORDER BY full_name ASC').all();
}
function getTenantById(id) {
  return db.prepare('SELECT * FROM tenants WHERE id = ?').get(id);
}
function createTenant(data) {
  const { full_name, doc_type, doc_number, doc_image_path, phone, email, address, occupation, emergency_contact, notes, is_active } = data;
  const r = db.prepare(`
    INSERT INTO tenants (full_name,doc_type,doc_number,doc_image_path,phone,email,address,occupation,emergency_contact,notes,is_active)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
  `).run(full_name, doc_type ?? 'DNI', doc_number, doc_image_path, phone, email, address, occupation, emergency_contact, notes, is_active ? 1 : 0);
  return getTenantById(r.lastInsertRowid);
}
function updateTenant(id, data) {
  try {
    console.log(`DB: Updating tenant ${id}...`);
    const current = getTenantById(id);
    if (!current) throw new Error(`Tenant ${id} not found`);

    const { id: _, ...safeData } = data;
    const m = { ...current, ...safeData };

    db.prepare(`
      UPDATE tenants SET full_name=?,doc_type=?,doc_number=?,doc_image_path=?,phone=?,email=?,address=?,occupation=?,emergency_contact=?,notes=?,is_active=?
      WHERE id=?
    `).run(m.full_name, m.doc_type, m.doc_number, m.doc_image_path, m.phone, m.email, m.address, m.occupation, m.emergency_contact, m.notes, m.is_active ? 1 : 0, id);

    console.log(`DB: Tenant ${id} updated successfully`);
    return getTenantById(id);
  } catch (e) {
    console.error(`DB ERROR (updateTenant): ${e.message}`);
    throw e;
  }
}
function deleteTenant(id) {
  return db.prepare('DELETE FROM tenants WHERE id = ?').run(id).changes > 0;
}

// ─── Contracts ────────────────────────────────────────────────────────────
function getAllContracts() {
  return db.prepare(`
    SELECT c.*, p.name as property_name, p.address as property_address,
           t.full_name as tenant_name, t.doc_number as tenant_doc,
           julianday(c.end_date) - julianday('now') as days_remaining
    FROM contracts c
    LEFT JOIN properties p ON c.property_id = p.id
    LEFT JOIN tenants t ON c.tenant_id = t.id
    ORDER BY c.end_date ASC
  `).all();
}
function getContractById(id) {
  return db.prepare('SELECT * FROM contracts WHERE id = ?').get(id);
}
function createContract(data) {
  const { property_id, tenant_id, start_date, end_date, monthly_rent, deposit_amount, currency, status, contract_file_path, payment_day, tax_rate, notes } = data;
  const r = db.prepare(`
    INSERT INTO contracts (property_id,tenant_id,start_date,end_date,monthly_rent,deposit_amount,currency,status,contract_file_path,payment_day,tax_rate,notes)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(idSan(property_id), idSan(tenant_id), start_date, end_date, monthly_rent, deposit_amount ?? 0, currency ?? 'PEN', status ?? 'activo', contract_file_path, payment_day ?? 1, tax_rate ?? 0, notes);
  return getContractById(r.lastInsertRowid);
}
function updateContract(id, data) {
  const current = getContractById(id);
  const m = { ...current, ...data };
  db.prepare(`
    UPDATE contracts SET property_id=?,tenant_id=?,start_date=?,end_date=?,monthly_rent=?,deposit_amount=?,currency=?,status=?,contract_file_path=?,payment_day=?,tax_rate=?,notes=?
    WHERE id=?
  `).run(idSan(m.property_id), idSan(m.tenant_id), m.start_date, m.end_date, m.monthly_rent, m.deposit_amount, m.currency, m.status, m.contract_file_path, m.payment_day, m.tax_rate ?? 0, m.notes, id);
  return getContractById(id);
}
function deleteContract(id) {
  return db.prepare('DELETE FROM contracts WHERE id = ?').run(id).changes > 0;
}

// ─── Finances ─────────────────────────────────────────────────────────────
function getAllFinances(filters = {}) {
  let query = `
    SELECT f.*, p.name as property_name, t.full_name as tenant_name, t.doc_number as tenant_doc
    FROM finances f
    LEFT JOIN properties p ON f.property_id = p.id
    LEFT JOIN tenants t ON f.tenant_id = t.id
    WHERE 1=1
  `;
  const params = [];
  if (filters.type) { query += ' AND f.type = ?'; params.push(filters.type); }
  if (filters.tenant_id) { query += ' AND f.tenant_id = ?'; params.push(filters.tenant_id); }
  if (filters.property_id) { query += ' AND f.property_id = ?'; params.push(filters.property_id); }
  if (filters.status) { query += ' AND f.status = ?'; params.push(filters.status); }
  if (filters.month) { query += " AND strftime('%Y-%m', f.due_date) = ?"; params.push(filters.month); }
  query += ' ORDER BY f.due_date DESC';
  return db.prepare(query).all(...params).map(rowToObj);
}
function createFinance(data) {
  const { contract_id, property_id, tenant_id, type, category, amount, late_fee, currency, payment_date, due_date, period_month, status, tax_rate, tax_amount, voucher_path, receipt_paths, notes } = data;
  const r = db.prepare(`
    INSERT INTO finances (contract_id,property_id,tenant_id,type,category,amount,late_fee,currency,payment_date,due_date,period_month,status,tax_rate,tax_amount,voucher_path,receipt_paths,notes)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(idSan(contract_id), idSan(property_id), idSan(tenant_id), type, category ?? 'renta', amount, late_fee ?? 0, currency ?? 'PEN', payment_date, due_date, period_month, status ?? 'pendiente', tax_rate ?? 0, tax_amount ?? 0, voucher_path, jsonCol(receipt_paths), notes);
  return getAllFinances({ type: type });
}
function getFinanceById(id) {
  return rowToObj(db.prepare(`
    SELECT f.*, p.name as property_name, t.full_name as tenant_name, t.doc_number as tenant_doc
    FROM finances f
    LEFT JOIN properties p ON f.property_id = p.id
    LEFT JOIN tenants t ON f.tenant_id = t.id
    WHERE f.id = ?
  `).get(id));
}
function updateFinance(id, data) {
  const current = db.prepare('SELECT * FROM finances WHERE id = ?').get(id);
  const m = { ...current, ...data, receipt_paths: jsonCol(data.receipt_paths ?? safeJson(current.receipt_paths)) };
  db.prepare(`
    UPDATE finances SET contract_id=?,property_id=?,tenant_id=?,type=?,category=?,amount=?,late_fee=?,currency=?,payment_date=?,due_date=?,period_month=?,status=?,tax_rate=?,tax_amount=?,voucher_path=?,receipt_paths=?,notes=?
    WHERE id=?
  `).run(idSan(m.contract_id), idSan(m.property_id), idSan(m.tenant_id), m.type, m.category, m.amount, m.late_fee ?? 0, m.currency, m.payment_date, m.due_date, m.period_month, m.status, m.tax_rate ?? 0, m.tax_amount ?? 0, m.voucher_path, m.receipt_paths, m.notes, id);
  return rowToObj(db.prepare('SELECT * FROM finances WHERE id = ?').get(id));
}

// ─── Contacts ─────────────────────────────────────────────────────────────
function getAllContacts() {
  return db.prepare('SELECT * FROM contacts ORDER BY name ASC').all();
}
function getContactById(id) {
  return db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
}
function createContact(data) {
  const { name, service_type, phone, email, notes } = data;
  const r = db.prepare(`
    INSERT INTO contacts (name,service_type,phone,email,notes)
    VALUES (?,?,?,?,?)
  `).run(name, service_type, phone, email, notes);
  return r.lastInsertRowid;
}
function updateContact(id, data) {
  const current = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
  const m = { ...current, ...data };
  db.prepare(`
    UPDATE contacts SET name=?,service_type=?,phone=?,email=?,notes=? WHERE id=?
  `).run(m.name, m.service_type, m.phone, m.email, m.notes, id);
}
function deleteContact(id) {
  return db.prepare('DELETE FROM contacts WHERE id = ?').run(id).changes > 0;
}
function deleteFinance(id) {
  return db.prepare('DELETE FROM finances WHERE id = ?').run(id).changes > 0;
}
function getFinanceSummary() {
  return db.prepare('SELECT * FROM v_dashboard').get();
}

// ─── License ──────────────────────────────────────────────────────────────
function getLicenseStatus() {
  return db.prepare('SELECT * FROM license WHERE id = 1').get();
}
function saveLicense(licenseKey, hwid, expiresAt, status = 'active', planType = 'desktop', cloudExpiresAt = null) {
  db.prepare(`
    UPDATE license SET license_key=?, hwid=?, validated_at=datetime('now'), expires_at=?, status=?, plan_type=?, cloud_expires_at=?
    WHERE id=1
  `).run(licenseKey, hwid, expiresAt, status, planType, cloudExpiresAt);
}

// ─── Cloud Backups ────────────────────────────────────────────────────────
function getBackupHistory() {
  return db.prepare('SELECT * FROM cloud_backups ORDER BY backup_date DESC LIMIT 50').all();
}

// ─── Maintenance Tickets ──────────────────────────────────────────────────
function getAllMaintenanceTickets(filters = {}) {
  let query = `
    SELECT mt.*, p.name as property_name
    FROM maintenance_tickets mt
    LEFT JOIN properties p ON mt.property_id = p.id
    WHERE 1=1
  `;
  const params = [];
  if (filters.property_id) { query += ' AND mt.property_id = ?'; params.push(filters.property_id); }
  if (filters.status) { query += ' AND mt.status = ?'; params.push(filters.status); }
  if (filters.priority) { query += ' AND mt.priority = ?'; params.push(filters.priority); }
  query += ' ORDER BY mt.created_at DESC';
  return db.prepare(query).all(...params).map(rowToObj);
}

function getMaintenanceTicketById(id) {
  return rowToObj(db.prepare(`
    SELECT mt.*, p.name as property_name
    FROM maintenance_tickets mt
    LEFT JOIN properties p ON mt.property_id = p.id
    WHERE mt.id = ?
  `).get(id));
}

function createMaintenanceTicket(data) {
  const { property_id, title, description, priority, status, photos, estimated_cost, actual_cost, finance_id } = data;
  const r = db.prepare(`
    INSERT INTO maintenance_tickets (property_id, title, description, priority, status, photos, estimated_cost, actual_cost, finance_id)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).run(idSan(property_id), title, description, priority ?? 'medium', status ?? 'open', jsonCol(photos), estimated_cost ?? 0, actual_cost ?? 0, idSan(finance_id));
  return getMaintenanceTicketById(r.lastInsertRowid);
}

function updateMaintenanceTicket(id, data) {
  const current = db.prepare('SELECT * FROM maintenance_tickets WHERE id = ?').get(id);
  const m = { ...current, ...data, photos: jsonCol(data.photos ?? safeJson(current.photos)) };
  db.prepare(`
    UPDATE maintenance_tickets
    SET property_id=?, title=?, description=?, priority=?, status=?, photos=?, estimated_cost=?, actual_cost=?, finance_id=?
    WHERE id=?
  `).run(idSan(m.property_id), m.title, m.description, m.priority, m.status, m.photos, m.estimated_cost, m.actual_cost, idSan(m.finance_id), id);
  return getMaintenanceTicketById(id);
}

function deleteMaintenanceTicket(id) {
  return db.prepare('DELETE FROM maintenance_tickets WHERE id = ?').run(id).changes > 0;
}

function addBackupRecord(status, count, backup_id, notes) {
  return db.prepare('INSERT INTO cloud_backups (status, records_count, backup_id, notes) VALUES (?,?,?,?)')
    .run(status, count, backup_id, notes);
}
function revokeLicense() {
  db.prepare("UPDATE license SET status='revoked' WHERE id=1").run();
}

module.exports = {
  initialize,
  getAllProperties, getPropertyById, createProperty, updateProperty, deleteProperty,
  getAllTenants, getTenantById, createTenant, updateTenant, deleteTenant,
  getAllContracts, getContractById, createContract, updateContract, deleteContract,
  getAllFinances, getFinanceById, createFinance, updateFinance, deleteFinance, getFinanceSummary,
  getAllContacts, getContactById, createContact, updateContact, deleteContact,
  getLicenseStatus, saveLicense, revokeLicense,
  getBackupHistory, addBackupRecord,
  getAllMaintenanceTickets, getMaintenanceTicketById, createMaintenanceTicket, updateMaintenanceTicket, deleteMaintenanceTicket
};
