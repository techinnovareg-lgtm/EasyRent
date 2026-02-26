'use strict';
const { contextBridge, ipcRenderer } = require('electron');

const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args);
const send = (channel, ...args) => ipcRenderer.send(channel, ...args);

contextBridge.exposeInMainWorld('easyrent', {
    // ─ License ─────────────────────────────────────────────────────
    license: {
        getHWID: () => invoke('license:getHWID'),
        validate: (key) => invoke('license:validate', key),
        getStatus: () => invoke('license:getStatus'),
        getBackupHistory: () => invoke('license:getBackupHistory'),
        addBackupRecord: (status, count, bid, notes) => invoke('license:addBackupRecord', status, count, bid, notes),
        autoBackup: () => invoke('backup:auto'),
    },

    // ─ Properties ──────────────────────────────────────────────────
    properties: {
        getAll: () => invoke('properties:getAll'),
        getById: (id) => invoke('properties:getById', id),
        create: (data) => invoke('properties:create', data),
        update: (id, data) => invoke('properties:update', id, data),
        delete: (id) => invoke('properties:delete', id),
    },

    // ─ Tenants ─────────────────────────────────────────────────────
    tenants: {
        getAll: () => invoke('tenants:getAll'),
        getById: (id) => invoke('tenants:getById', id),
        create: (data) => invoke('tenants:create', data),
        update: (id, data) => invoke('tenants:update', id, data),
        delete: (id) => invoke('tenants:delete', id),
    },

    // ─ Contracts ───────────────────────────────────────────────────
    contracts: {
        getAll: () => invoke('contracts:getAll'),
        getById: (id) => invoke('contracts:getById', id),
        create: (data) => invoke('contracts:create', data),
        update: (id, data) => invoke('contracts:update', id, data),
        delete: (id) => invoke('contracts:delete', id),
    },

    // ─ Finances ────────────────────────────────────────────────────
    finances: {
        getAll: (filters) => invoke('finances:getAll', filters),
        getById: (id) => invoke('finances:getById', id),
        create: (data) => invoke('finances:create', data),
        update: (id, data) => invoke('finances:update', id, data),
        delete: (id) => invoke('finances:delete', id),
        getSummary: () => invoke('finances:getSummary'),
    },

    // ─ Contacts ────────────────────────────────────────────────────
    contacts: {
        getAll: () => invoke('contacts:getAll'),
        getById: (id) => invoke('contacts:getById', id),
        create: (data) => invoke('contacts:create', data),
        update: (id, data) => invoke('contacts:update', id, data),
        delete: (id) => invoke('contacts:delete', id),
    },

    // ─ Maintenance ───────────────────────────────────────────────────
    maintenance: {
        getAll: (filters) => invoke('maintenance:getAll', filters),
        getById: (id) => invoke('maintenance:getById', id),
        create: (data) => invoke('maintenance:create', data),
        update: (id, data) => invoke('maintenance:update', id, data),
        delete: (id) => invoke('maintenance:delete', id),
    },

    // ─ Files ───────────────────────────────────────────────────────
    files: {
        saveUpload: (opts) => invoke('files:saveUpload', opts),
        openDialog: (opts) => invoke('files:openDialog', opts),
        openFile: (filePath) => invoke('files:openFile', filePath),
        readAsBase64: (filePath) => invoke('files:readAsBase64', filePath),
        deleteFile: (filePath) => invoke('files:deleteFile', filePath),
    },

    // ─ Cloud Sync ──────────────────────────────────────────────────
    cloud: {
        sync: (email, password) => invoke('cloud:sync', email, password),
    },

    // ─ Window Controls ─────────────────────────────────────────────
    window: {
        minimize: () => send('window:minimize'),
        maximize: () => send('window:maximize'),
        close: () => send('window:close'),
        isMaximized: () => invoke('window:isMaximized'),
    },
});
