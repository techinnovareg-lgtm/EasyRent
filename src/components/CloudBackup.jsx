import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Cloud, CloudOff, RefreshCw, History, CheckCircle2,
    AlertCircle, Clock, ShieldCheck, Database, ArrowRight
} from 'lucide-react'
import { api } from '../services/ApiService'
import { useTranslation } from '../context/LanguageContext'

export default function CloudBackup() {
    const { t, language } = useTranslation()
    const [status, setStatus] = useState('active') // active, warning, error
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [license, setLicense] = useState(null)

    const fmtDate = (d) => d ? new Date(d).toLocaleString(language === 'es' ? 'es-PE' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const [lic, hist] = await Promise.all([
                api.license.getStatus(),
                api.license.getBackupHistory()
            ])
            setLicense(lic)
            setHistory(hist || [])
        } catch (err) {
            console.error("CloudBackup Load Error:", err)
        } finally {
            setLoading(false)
        }
    }

    async function handleSync(email, password) {
        if (syncing) return
        setSyncing(true)
        setShowAuthModal(false)
        try {
            const res = await api.cloudSync.sync(email, password)

            if (res.success) {
                await api.license.addBackupRecord('success', res.synced, 'SYNC-' + Date.now(), 'Manual sync to cloud');
                // Guardar email para conveniencia (no la clave)
                localStorage.setItem('easyrent_sync_email', email);
                loadData()
            } else {
                alert(t('cloud.messages.syncError') + ":\n" + res.errors.join('\n'));
                await api.license.addBackupRecord('error', 0, 'SYNC-FAIL', 'Fail: ' + res.errors[0]);
            }
        } catch (err) {
            console.error("Sync Error:", err)
            alert(t('cloud.messages.criticalError'));
        } finally {
            setSyncing(false)
        }
    }

    const [showAuthModal, setShowAuthModal] = useState(false)

    if (loading) return (
        <div className="p-10 flex items-center justify-center">
            <RefreshCw className="animate-spin text-blue-500" size={32} />
        </div>
    )

    const isElectron = Boolean(window.easyrent)
    const isHybridOrCloud = license?.plan_type === 'hybrid' || license?.plan_type === 'cloud'
    const cloudIsActive = isHybridOrCloud && (
        !license.cloud_expires_at || new Date(license.cloud_expires_at) > new Date()
    )

    return (
        <div className="p-6 w-full mx-auto space-y-6">
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onConfirm={handleSync}
                initialEmail={localStorage.getItem('easyrent_sync_email') || ''}
                t={t}
            />
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                        <Cloud className="text-blue-500" /> {t('cloud.title')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        {isElectron ? t('cloud.desktopDesc') : t('cloud.webDesc')}
                    </p>
                </div>
                {isElectron ? (
                    cloudIsActive ? (
                        <button
                            onClick={() => setShowAuthModal(true)}
                            disabled={syncing}
                            className={`btn-primary !py-3 !px-6 shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2 ${syncing ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                            {syncing ? t('cloud.syncingDescription') : t('cloud.syncNow')}
                        </button>
                    ) : isHybridOrCloud ? (
                        <div className="badge badge-red !px-4 !py-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                            <CloudOff size={14} /> {t('cloud.expiredSub')}
                        </div>
                    ) : (
                        <div className="badge badge-blue !px-4 !py-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                            <Cloud size={14} /> {t('cloud.desktopPlan')}
                        </div>
                    )
                ) : (
                    <div className="badge badge-green !px-4 !py-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/10">
                        <ShieldCheck size={14} /> {t('cloud.connected')}
                    </div>
                )}
            </header>

            {isHybridOrCloud && !cloudIsActive && (
                <div className="card p-8 border-red-200 bg-red-50/30 dark:border-red-900/30 dark:bg-red-900/10">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                            <AlertCircle size={24} />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t('cloud.inactiveTitle')}</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mt-1">
                                    {t('cloud.inactiveDesc')}
                                </p>
                            </div>
                            <a
                                href="https://tech-innova.vercel.app/tienda"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline"
                            >
                                {t('cloud.renewNow')} <ArrowRight size={16} />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {!isHybridOrCloud && (
                <div className="card p-8 border-amber-200 bg-amber-50/30 dark:border-amber-900/30 dark:bg-amber-900/10">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                            <AlertCircle size={24} />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t('cloud.upgradeTitle')}</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mt-1">
                                    {t('cloud.upgradeDesc')}
                                </p>
                            </div>
                            <a
                                href="https://tech-innova.vercel.app/tienda"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline"
                            >
                                {t('cloud.viewPlans')} <ArrowRight size={16} />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {/* Status Card */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="card p-6 flex items-center gap-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-500">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('cloud.status')}</p>
                                <p className="text-lg font-black text-slate-800 dark:text-white">{t('cloud.protected')}</p>
                            </div>
                        </div>
                        <div className="card p-6 flex items-center gap-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-500">
                                <Database size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('cloud.lastBackup')}</p>
                                <p className="text-lg font-black text-slate-800 dark:text-white">
                                    {history.length > 0 ? history[0].backup_id : t('cloud.never')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="card overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                            <History size={16} className="text-slate-400" />
                            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('cloud.historyTitle')}</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">{t('cloud.table.dateTime')}</th>
                                        <th className="px-6 py-4">{t('cloud.table.backupId')}</th>
                                        <th className="px-6 py-4">{t('cloud.table.records')}</th>
                                        <th className="px-6 py-4 text-center">{t('cloud.table.status')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {history.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-slate-400 italic text-sm">
                                                {t('cloud.table.noHistory')}
                                            </td>
                                        </tr>
                                    ) : (
                                        history.map(row => (
                                            <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                                                    {fmtDate(row.backup_date)}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                                                    {row.backup_id}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                    {row.records_count} {t('cloud.table.entries')}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${row.status === 'success'
                                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                        : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                                        }`}>
                                                        {row.status === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                                        {row.status === 'success' ? t('cloud.table.success') : t('cloud.table.error')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 text-sm">
                    <div className="card p-6 space-y-4">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                            <Clock size={16} className="text-blue-500" /> {t('cloud.planDetails')}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between border-b border-slate-50 dark:border-slate-700 pb-2">
                                <span className="text-slate-500">{t('cloud.planType')}</span>
                                <span className="font-bold text-slate-800 dark:text-white capitalize">{license?.plan_type || 'Desktop'}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-50 dark:border-slate-700 pb-2">
                                <span className="text-slate-500">{t('cloud.syncStatus')}</span>
                                <span className="font-bold text-slate-800 dark:text-white">{isHybridOrCloud ? t('cloud.active') : t('cloud.inactive')}</span>
                            </div>
                            <div className="flex justify-between pb-2">
                                <span className="text-slate-500">{t('cloud.expires')}</span>
                                <span className="font-bold text-slate-800 dark:text-white">
                                    {license?.expires_at ? new Date(license.expires_at).toLocaleDateString(language === 'es' ? 'es-PE' : 'en-US') : t('cloud.neverLifetime')}
                                </span>
                            </div>
                        </div>
                        {isHybridOrCloud && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-700 dark:text-blue-400 text-xs">
                                <strong>{language === 'es' ? 'Nota:' : 'Note:'}</strong> {t('cloud.autoNote')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function AuthModal({ isOpen, onClose, onConfirm, initialEmail, t }) {
    const [credentials, setCredentials] = useState({ email: initialEmail, password: '' })

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700"
            >
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-500 mb-6 mx-auto">
                    <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white text-center mb-2">{t('cloud.auth.title')}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-8 px-2">
                    {t('cloud.auth.desc')}
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">{t('cloud.auth.email')}</label>
                        <input
                            type="email"
                            className="input w-full"
                            value={credentials.email}
                            onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                            placeholder="usuario@hraestadistica.com"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">{t('cloud.auth.password')}</label>
                        <input
                            type="password"
                            className="input w-full"
                            value={credentials.password}
                            onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">{t('common.cancel')}</button>
                    <button
                        onClick={() => onConfirm(credentials.email, credentials.password)}
                        className="flex-1 btn-primary py-3 px-4 shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm"
                    >
                        {t('cloud.auth.sync')}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
