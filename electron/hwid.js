'use strict';
/**
 * Hardware ID Generator
 * Combines node-machine-id + system info for a stable HWID
 */
const { machineIdSync } = require('node-machine-id');
const crypto = require('crypto');

let _hwid = null;

function getHWID() {
    if (_hwid) return _hwid;
    try {
        const raw = machineIdSync(true); // returns UUID-like string
        _hwid = crypto.createHash('sha256').update(raw).digest('hex').substring(0, 32).toUpperCase();
    } catch (e) {
        // Fallback: use hostname + platform as a basic HWID
        const os = require('os');
        const fallback = `${os.hostname()}-${os.platform()}-${os.arch()}`;
        _hwid = crypto.createHash('sha256').update(fallback).digest('hex').substring(0, 32).toUpperCase();
    }
    return _hwid;
}

module.exports = { getHWID };
