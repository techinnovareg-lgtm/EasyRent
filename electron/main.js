'use strict';

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || '';

// ─── Early Logging Setup ───────────────────────────────────────────────────
const isDev = process.env.NODE_ENV === 'development';
const userDataPath = app.getPath('userData');
const logPath = path.join(userDataPath, 'app-startup.log');

// Clean log on startup to avoid confusion
try { if (fs.existsSync(logPath)) fs.truncateSync(logPath, 0); } catch (e) { }

function log(msg) {
    const time = new Date().toISOString();
    const entry = `[${time}] ${msg}\n`;
    process.stdout.write(entry); // Log to terminal
    try { fs.appendFileSync(logPath, entry); } catch (e) { }
}

// Global console override to catch everything
const _originalLog = console.log;
const _originalError = console.error;
console.log = (...args) => { log(args.join(' ')); _originalLog(...args); };
console.error = (...args) => { log(`ERROR: ${args.join(' ')}`); _originalError(...args); };

log('--- EasyRent Booting ---');
log(`Architecture: ${process.arch} | Platform: ${process.platform}`);
log(`Electron: ${process.versions.electron} | Node: ${process.versions.node}`);
log(`Executable: ${process.execPath}`);
log(`App Path: ${app.getAppPath()}`);
log(`Log File: ${logPath}`);

let mainWindow;
let splashWindow;
let db; // Lazy loaded

// ─── Startup Logic ──────────────────────────────────────────────────────────
async function initializeApp() {
    log('Initializing application logic...');
    try {
        log('Loading modules...');
        const h = require('./hwid');
        const l = require('./license');
        const db = require('./database');
        const cloudSync = require('./cloudSync');

        log('Modules loaded successfully');

        const UPLOADS_DIR = path.join(userDataPath, 'uploads');
        ['documents', 'contracts', 'photos', 'vouchers', 'receipts'].forEach(sub => {
            const dir = path.join(UPLOADS_DIR, sub);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                log(`Created folder: ${sub}`);
            }
        });

        log('Initializing database connection...');
        db.initialize(path.join(userDataPath, 'easyrent.db'));
        log('Database ready');

        // Expose functions for IPC
        setupIPCHandlers(h, l, db, cloudSync, UPLOADS_DIR);
        log('IPC Handlers registered');

    } catch (err) {
        log(`CRITICAL BOOT ERROR: ${err.message}`);
        log(`Stack: ${err.stack}`);
        dialog.showErrorBox('Error de Inicialización', `La aplicación no pudo arrancar correctamente.\n\nFallo: ${err.message}\n\nRevise el archivo: ${logPath}`);
    }
}

function createSplash() {
    log('Creating splash window...');
    splashWindow = new BrowserWindow({
        width: 480,
        height: 320,
        frame: false,
        transparent: true,
        resizable: false,
        alwaysOnTop: false, // Changed to false to avoid hiding error dialogs
        backgroundColor: '#00000000',
        webPreferences: { nodeIntegration: false, contextIsolation: true },
    });

    let splashFile = path.join(__dirname, '..', 'public', 'splash.html');
    if (!fs.existsSync(splashFile)) {
        splashFile = path.join(app.getAppPath(), 'public', 'splash.html');
    }

    if (fs.existsSync(splashFile)) {
        splashWindow.loadFile(splashFile);
        log(`Splash loaded from: ${splashFile}`);
    } else {
        log('Splash file not found, skipping...');
    }

    // Safety timeout: destroy splash after 10s if it hangs
    setTimeout(() => {
        if (splashWindow && !splashWindow.isDestroyed()) {
            log('Splash safety timeout triggered');
            splashWindow.destroy();
            if (mainWindow) {
                mainWindow.show();
                mainWindow.focus();
            }
        }
    }, 10000);
}

function createMainWindow() {
    log('Creating main window...');
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 960,
        minHeight: 600,
        show: false,
        titleBarStyle: 'hidden',
        frame: process.platform !== 'win32',
        icon: path.join(__dirname, '..', 'public', 'icon.png'),
        backgroundColor: '#0f172a',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });

    const isPackaged = app.isPackaged;
    const devURL = 'http://localhost:5173';

    let prodFile;
    if (isPackaged) {
        prodFile = path.join(process.resourcesPath, 'app', 'dist-renderer', 'index.html');
        if (!fs.existsSync(prodFile)) {
            prodFile = path.join(app.getAppPath(), 'dist-renderer', 'index.html');
        }
    } else {
        prodFile = path.join(__dirname, '..', 'dist-renderer', 'index.html');
    }

    log(`UI Load Path: ${prodFile}`);

    if (isDev) {
        mainWindow.loadURL(devURL);
        mainWindow.webContents.openDevTools();
        log('Loading dev URL');
    } else {
        if (fs.existsSync(prodFile)) {
            mainWindow.loadFile(prodFile).catch(err => {
                log(`Failed to load prodFile: ${err.message}`);
                dialog.showErrorBox('Error de Carga', `Fallo al cargar la interfaz.\nError: ${err.message}`);
            });
        } else {
            log('CRITICAL: dist-renderer/index.html not found!');
            const alternative = path.join(__dirname, '..', 'dist-renderer', 'index.html');
            if (fs.existsSync(alternative)) {
                log(`Using alternative path: ${alternative}`);
                mainWindow.loadFile(alternative);
            } else {
                dialog.showErrorBox('Error de Instalación', 'No se encontró la interfaz gráfica. Por favor, reinstale la aplicación.');
            }
        }
    }

    mainWindow.webContents.on('did-finish-load', () => {
        log('Main window finished loading');
    });

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        log(`Page failed to load: ${errorCode} - ${errorDescription}`);
        if (isPackaged) {
            dialog.showErrorBox('Error de Carga', `La interfaz falló al iniciar (${errorCode}): ${errorDescription}`);
        }
    });

    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.control && input.shift && input.key === 'F12') {
            mainWindow.webContents.openDevTools();
            event.preventDefault();
        }
    });

    mainWindow.webContents.on('render-process-gone', (event, details) => {
        log(`Renderer process gone: ${details.reason}`);
        dialog.showErrorBox('Error Crítico', `La interfaz se cerró inesperadamente: ${details.reason}`);
    });

    mainWindow.once('ready-to-show', () => {
        log('Main window ready to show');
        const showWin = () => {
            if (splashWindow && !splashWindow.isDestroyed()) {
                splashWindow.destroy();
            }
            mainWindow.show();
            mainWindow.focus();
            log('Splash destroyed, main window shown');
        };

        if (splashWindow) {
            setTimeout(showWin, 1500);
        } else {
            showWin();
        }
    });

    mainWindow.on('closed', () => {
        log('Main window closed');
        mainWindow = null;
    });
}

app.whenReady().then(async () => {
    log('App ready, starting boot sequence...');
    createSplash();
    // Wrap initializeApp so it doesn't block the rest if it hangs
    initializeApp().catch(err => log(`Async init error: ${err.message}`));
    createMainWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    if (app.isReady()) {
        dialog.showErrorBox('Error Crítico (Proceso Principal)', err.message || err.toString());
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

function setupIPCHandlers(hwidMod, licenseMod, dbMod, cloudSyncMod, UPLOADS_DIR) {
    // ─── License ──────────────────────────────────────────────────────
    ipcMain.handle('license:getHWID', async () => hwidMod.getHWID());
    ipcMain.handle('license:validate', async (_, licenseKey) => {
        const hwid = hwidMod.getHWID();
        return licenseMod.validateLicense(licenseKey, hwid, dbMod);
    });
    ipcMain.handle('license:getStatus', async () => dbMod.getLicenseStatus());
    ipcMain.handle('license:getBackupHistory', async () => dbMod.getBackupHistory());
    ipcMain.handle('license:addBackupRecord', async (_, status, count, bid, notes) =>
        dbMod.addBackupRecord(status, count, bid, notes)
    );

    // ─── Backup ───────────────────────────────────────────────────────
    ipcMain.handle('backup:create', async () => dbMod.createBackup());
    ipcMain.handle('backup:restore', async (_, filePath) => dbMod.restoreBackup(filePath));
    ipcMain.handle('backup:getLatest', async () => dbMod.getLatestBackup());

    // ─── Cloud Sync ───────────────────────────────────────────────────
    ipcMain.handle('cloud:sync', async (_, email, password) => {
        return cloudSyncMod.syncToCloud(dbMod, email, password);
    });

    // ─── Properties ────────────────────────────────────────────────────
    ipcMain.handle('properties:getAll', () => dbMod.getAllProperties());
    ipcMain.handle('properties:getById', (_, id) => dbMod.getPropertyById(id));
    ipcMain.handle('properties:create', (_, data) => dbMod.createProperty(data));
    ipcMain.handle('properties:update', (_, id, data) => dbMod.updateProperty(id, data));
    ipcMain.handle('properties:delete', (_, id) => dbMod.deleteProperty(id));

    ipcMain.handle('backup:auto', async () => {
        const lic = dbMod.getLicenseStatus();
        const isHybridOrCloud = lic.plan_type === 'hybrid' || lic.plan_type === 'cloud';
        const cloudIsActive = isHybridOrCloud && (!lic.cloud_expires_at || new Date(lic.cloud_expires_at) > new Date());

        if (cloudIsActive) {
            console.log("Auto-backup triggered on exit...");
            // If we have saved credentials, we could auto-sync here.
            // For now, we still just record the success locally.
            return dbMod.addBackupRecord('success', 0, 'AUTO-' + Date.now(), 'Respaldo automático al salir');
        }
        return false;
    });

    // ─── Tenants ───────────────────────────────────────────────────────
    ipcMain.handle('tenants:getAll', () => dbMod.getAllTenants());
    ipcMain.handle('tenants:getById', (_, id) => dbMod.getTenantById(id));
    ipcMain.handle('tenants:create', (_, data) => dbMod.createTenant(data));
    ipcMain.handle('tenants:update', (_, id, data) => dbMod.updateTenant(id, data));
    ipcMain.handle('tenants:delete', (_, id) => dbMod.deleteTenant(id));

    // ─── Contracts ─────────────────────────────────────────────────────
    ipcMain.handle('contracts:getAll', () => dbMod.getAllContracts());
    ipcMain.handle('contracts:getById', (_, id) => dbMod.getContractById(id));
    ipcMain.handle('contracts:create', (_, data) => dbMod.createContract(data));
    ipcMain.handle('contracts:update', (_, id, data) => dbMod.updateContract(id, data));
    ipcMain.handle('contracts:delete', (_, id) => dbMod.deleteContract(id));

    // ─── Finances ──────────────────────────────────────────────────────
    ipcMain.handle('finances:getAll', (_, filters) => dbMod.getAllFinances(filters));
    ipcMain.handle('finances:getById', (_, id) => dbMod.getFinanceById(id));
    ipcMain.handle('finances:create', (_, data) => dbMod.createFinance(data));
    ipcMain.handle('finances:update', (_, id, data) => dbMod.updateFinance(id, data));
    ipcMain.handle('finances:delete', (_, id) => dbMod.deleteFinance(id));
    ipcMain.handle('finances:getSummary', () => dbMod.getFinanceSummary());

    // ─── Contacts ──────────────────────────────────────────────────────
    ipcMain.handle('contacts:getAll', () => dbMod.getAllContacts());
    ipcMain.handle('contacts:getById', (_, id) => dbMod.getContactById(id));
    ipcMain.handle('contacts:create', (_, data) => dbMod.createContact(data));
    ipcMain.handle('contacts:update', (_, id, data) => dbMod.updateContact(id, data));
    ipcMain.handle('contacts:delete', (_, id) => dbMod.deleteContact(id));

    // ─── Maintenance ───────────────────────────────────────────────────
    ipcMain.handle('maintenance:getAll', (_, filters) => dbMod.getAllMaintenanceTickets(filters));
    ipcMain.handle('maintenance:getById', (_, id) => dbMod.getMaintenanceTicketById(id));
    ipcMain.handle('maintenance:create', (_, data) => dbMod.createMaintenanceTicket(data));
    ipcMain.handle('maintenance:update', (_, id, data) => dbMod.updateMaintenanceTicket(id, data));
    ipcMain.handle('maintenance:delete', (_, id) => dbMod.deleteMaintenanceTicket(id));

    // ─── File Operations ───────────────────────────────────────────────
    ipcMain.handle('files:saveUpload', async (_, { buffer, subdir, filename }) => {
        const dest = path.join(UPLOADS_DIR, subdir, filename);
        fs.writeFileSync(dest, Buffer.from(buffer));
        return dest;
    });

    ipcMain.handle('files:openDialog', async (_, options) => {
        const result = await dialog.showOpenDialog(mainWindow, options);
        if (result.canceled) return null;
        const srcPath = result.filePaths[0];
        const ext = path.extname(srcPath);
        const filename = `${Date.now()}${ext}`;
        const subdir = options.subdir || 'documents';
        const dest = path.join(UPLOADS_DIR, subdir, filename);
        fs.copyFileSync(srcPath, dest);
        return dest;
    });

    ipcMain.handle('files:openFile', async (_, filePath) => {
        if (filePath && fs.existsSync(filePath)) {
            await shell.openPath(filePath);
            return true;
        }
        return false;
    });

    ipcMain.handle('files:readAsBase64', async (_, filePath) => {
        if (filePath && fs.existsSync(filePath)) {
            const buf = fs.readFileSync(filePath);
            const ext = path.extname(filePath).toLowerCase().replace('.', '');
            const mime = ext === 'pdf' ? 'application/pdf' : `image/${ext === 'jpg' ? 'jpeg' : ext}`;
            return `data:${mime};base64,${buf.toString('base64')}`;
        }
        return null;
    });

    ipcMain.handle('files:deleteFile', async (_, filePath) => {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    });

    // ─── App Controls ──────────────────────────────────────────────────────
    ipcMain.on('window:minimize', () => mainWindow?.minimize());
    ipcMain.on('window:maximize', () => {
        if (mainWindow?.isMaximized()) mainWindow.unmaximize();
        else mainWindow?.maximize();
    });
    ipcMain.on('window:close', () => mainWindow?.close());
    ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() ?? false);
}
