import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ShieldAlert, Key, Plus, RefreshCw, Trash2,
    Unlock, Globe, Monitor, Filter, CheckCircle2,
    XCircle, Clock, Save, X, Calendar, Cloud,
    ShieldCheck, AlertCircle, HardDrive, Mail
} from 'lucide-react'
import { api } from '../services/ApiService'
import { useTranslation } from '../context/LanguageContext'

const ADMIN_EMAIL = 'tech.innova.reg@gmail.com'
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '512085'

export default function AdminConsole() {
    const { t, language } = useTranslation()
    const [isVerified, setIsVerified] = useState(false)
    const [pin, setPin] = useState('')
    const [error, setError] = useState('')
    const [licenses, setLicenses] = useState([])
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [currentLicense, setCurrentLicense] = useState(null)
    const [form, setForm] = useState({
        license_key: '',
        plan: 'desktop',
        status: 'active',
        expires_at: '',
        cloud_expires_at: '',
        notes: '',
        hwid: '',
        owner_email: ''
    })

    function generateKey() {
        const segments = ['ER']
        for (let i = 0; i < 3; i++) {
            segments.push(Math.random().toString(36).substring(2, 6).toUpperCase())
        }
        setForm({ ...form, license_key: segments.join('-') })
    }

    useEffect(() => {
        api.auth.getSession().then(({ session }) => {
            if (session?.user?.email !== ADMIN_EMAIL) {
                window.location.href = '#/'
            }
        })
    }, [])

    useEffect(() => {
        if (isVerified) loadLicenses()
    }, [isVerified])

    async function loadLicenses() {
        setLoading(true)
        try {
            const data = await api.admin.licenses.getAll().catch(() => [])
            setLicenses(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error("Load error:", err)
            setLicenses([])
        } finally {
            setLoading(false)
        }
    }

    function handlePinSubmit(e) {
        e.preventDefault()
        if (pin === ADMIN_PIN) {
            setIsVerified(true)
            setError('')
        } else {
            setError(t('admin.subtitle')) // Or a specific error message if defined
            setPin('')
        }
    }

    async function handleSave(e) {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = { ...form }
            if (!payload.expires_at) payload.expires_at = null
            if (!payload.cloud_expires_at) payload.cloud_expires_at = null

            if (currentLicense) {
                await api.admin.licenses.update(currentLicense.license_key, payload)
            } else {
                await api.admin.licenses.create(payload)
            }
            setShowModal(false)
            loadLicenses()
        } catch (err) {
            alert(err.message || t('admin.messages.saveError'))
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(key) {
        if (!confirm(t('admin.prompts.confirmDelete'))) return
        try {
            await api.admin.licenses.delete(key)
            loadLicenses()
        } catch (err) {
            alert(err.message)
        }
    }

    async function freeHWID(license) {
        if (!confirm(t('admin.prompts.confirmFreeHwid'))) return
        try {
            await api.admin.licenses.update(license.license_key, { hwid: null })
            loadLicenses()
        } catch (err) {
            alert(err.message)
        }
    }

    async function renewCloud(license, days = 30) {
        const current = license.cloud_expires_at ? new Date(license.cloud_expires_at) : new Date()
        if (current < new Date()) current.setTime(Date.now())
        current.setDate(current.getDate() + days)

        try {
            await api.admin.licenses.update(license.license_key, {
                cloud_expires_at: current.toISOString(),
                plan: (license.plan === 'desktop') ? 'hybrid' : license.plan
            })
            loadLicenses()
        } catch (err) {
            alert(err.message)
        }
    }

    if (!isVerified) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-sm"
                >
                    <div className="card p-8 border-slate-800 shadow-2xl bg-slate-900 text-white">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6 mx-auto">
                            <ShieldAlert size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-center mb-2">{t('admin.title')}</h2>
                        <p className="text-slate-500 text-sm text-center mb-8">{t('admin.subtitle')}</p>

                        <form onSubmit={handlePinSubmit} className="space-y-6">
                            <input
                                type="password"
                                maxLength={6}
                                className="input w-full text-center text-3xl tracking-[1em] font-mono bg-slate-800 border-slate-700 text-white"
                                value={pin}
                                autoFocus
                                onChange={e => setPin(e.target.value)}
                            />
                            {error && <p className="text-red-400 text-xs text-center font-bold">{error}</p>}
                            <button className="btn-primary w-full py-4 uppercase tracking-widest font-black">
                                {t('admin.unlock')}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                            <Key size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{t('admin.verifiedTitle')}</h1>
                    </div>
                    <p className="text-slate-500 mt-1 uppercase text-[10px] font-black tracking-widest">{t('admin.verifiedSubtitle')}</p>
                </div>

                <div className="flex gap-4">
                    <button onClick={loadLicenses} className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl hover:bg-slate-200 transition-colors dark:text-white">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => {
                            setForm({ license_key: '', plan: 'desktop', status: 'active', expires_at: '', cloud_expires_at: '', notes: '', hwid: '', owner_email: '' })
                            setCurrentLicense(null)
                            setShowModal(true)
                        }}
                        className="btn-primary flex items-center gap-2 !px-6"
                    >
                        <Plus size={18} /> {t('admin.newLicense')}
                    </button>
                </div>
            </header>

            <div className="card overflow-hidden shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-5">{t('admin.table.keyId')}</th>
                                <th className="px-6 py-5">{t('admin.table.plan')}</th>
                                <th className="px-6 py-5">{t('admin.table.status')}</th>
                                <th className="px-6 py-5">{t('admin.table.baseExp')}</th>
                                <th className="px-6 py-5">{t('admin.table.cloudSync')}</th>
                                <th className="px-6 py-5 text-center">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {licenses.map(lic => (
                                <tr key={lic.license_key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">{lic.license_key}</div>
                                        <div className="text-[10px] text-slate-500 mt-1">
                                            {lic.owner_email ? lic.owner_email : <span className="italic opacity-50">{t('admin.table.unassigned')}</span>}
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-0.5 max-w-[180px] truncate italic" title={lic.notes}>{lic.notes || t('admin.table.noNotes')}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${lic.plan === 'hybrid' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' :
                                            lic.plan === 'cloud' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' :
                                                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                            {lic.plan === 'hybrid' ? <Globe size={10} /> : <Monitor size={10} />}
                                            {lic.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`text-[10px] font-black uppercase flex items-center gap-1.5 ${lic.status === 'active' ? 'text-emerald-500' : 'text-red-500'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${lic.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                            {t(`admin.statusOptions.${lic.status}`) || lic.status}
                                        </div>
                                        <div className="text-[9px] text-slate-400 mt-0.5">HWID: {lic.hwid ? t('admin.table.linked') : t('admin.table.free')}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {lic.expires_at ? new Date(lic.expires_at).toLocaleDateString(language === 'es' ? 'es-PE' : 'en-US') : t('admin.table.lifetime')}
                                        </div>
                                        <div className="text-[9px] text-slate-400">{t('admin.table.baseSub')}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {lic.cloud_expires_at ? (
                                            <div className="space-y-1">
                                                <div className={`text-xs font-black ${new Date(lic.cloud_expires_at) > new Date() ? 'text-blue-500' : 'text-red-400'}`}>
                                                    {new Date(lic.cloud_expires_at).toLocaleDateString(language === 'es' ? 'es-PE' : 'en-US')}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => renewCloud(lic, 30)} className="text-[9px] font-black text-indigo-500 hover:text-indigo-700 underline uppercase">+30d</button>
                                                    <button onClick={() => renewCloud(lic, 365)} className="text-[9px] font-black text-indigo-500 hover:text-indigo-700 underline uppercase">+1 {language === 'es' ? 'año' : 'year'}</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button onClick={() => renewCloud(lic)} className="bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg text-[10px] font-black text-indigo-600 uppercase hover:scale-105 transition-transform">
                                                {t('admin.table.activateSync')}
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                title={t('admin.actions.freeHwid')}
                                                onClick={() => freeHWID(lic)}
                                                className={`p-2 rounded-lg transition-colors ${lic.hwid ? 'text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10' : 'text-slate-300 cursor-not-allowed'}`}
                                                disabled={!lic.hwid}
                                            >
                                                <Unlock size={18} />
                                            </button>
                                            <button
                                                title={t('admin.actions.config')}
                                                onClick={() => {
                                                    setForm({
                                                        license_key: lic.license_key,
                                                        plan: lic.plan,
                                                        status: lic.status,
                                                        expires_at: lic.expires_at ? lic.expires_at.split('T')[0] : '',
                                                        cloud_expires_at: lic.cloud_expires_at ? lic.cloud_expires_at.split('T')[0] : '',
                                                        notes: lic.notes || '',
                                                        hwid: lic.hwid || '',
                                                        owner_email: lic.owner_email || ''
                                                    })
                                                    setCurrentLicense(lic)
                                                    setShowModal(true)
                                                }}
                                                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors"
                                            >
                                                <Clock size={18} />
                                            </button>
                                            <button
                                                title={t('admin.actions.delete')}
                                                onClick={() => handleDelete(lic.license_key)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                                        {currentLicense ? t('admin.editLicense') : t('admin.generateLicense')}
                                    </h3>
                                    <p className="text-slate-500 text-xs">{t('admin.subtitle')}</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">{t('admin.licenseKey')}</label>
                                        <div className="flex gap-2">
                                            <input
                                                className={`input flex-1 font-mono uppercase tracking-widest text-lg ${currentLicense ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}
                                                required
                                                disabled={!!currentLicense}
                                                value={form.license_key}
                                                onChange={e => setForm({ ...form, license_key: e.target.value })}
                                                placeholder="EASY-XXXX-XXXX"
                                            />
                                            {!currentLicense && (
                                                <button
                                                    type="button"
                                                    onClick={generateKey}
                                                    className="bg-slate-100 dark:bg-slate-800 px-4 rounded-2xl text-indigo-500 hover:bg-slate-200 transition-colors"
                                                    title={t('admin.generateKey')}
                                                >
                                                    <RefreshCw size={20} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1 flex items-center justify-between">
                                            <div className="flex items-center gap-1"><Mail size={12} /> {t('admin.ownerEmail')}</div>
                                            {form.owner_email && (
                                                <button
                                                    type="button"
                                                    onClick={() => api.admin.users.resetPassword(form.owner_email)}
                                                    className="text-[9px] font-black text-blue-500 hover:text-blue-700 underline uppercase"
                                                >
                                                    {t('admin.resetPassword')}
                                                </button>
                                            )}
                                        </label>
                                        <input
                                            type="email"
                                            className="input w-full"
                                            value={form.owner_email}
                                            onChange={e => setForm({ ...form, owner_email: e.target.value })}
                                            placeholder="user@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">{t('admin.plan')}</label>
                                        <select className="select w-full" value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}>
                                            <option value="desktop">{t('admin.plans.desktop')}</option>
                                            <option value="hybrid">{t('admin.plans.hybrid')}</option>
                                            <option value="cloud">{t('admin.plans.cloud')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">{t('admin.hwid')}</label>
                                        <div className="relative">
                                            <input
                                                className="input w-full font-mono text-[10px] pr-8"
                                                value={form.hwid}
                                                onChange={e => setForm({ ...form, hwid: e.target.value })}
                                                placeholder={t('admin.unlinked')}
                                            />
                                            {form.hwid && <button type="button" onClick={() => setForm({ ...form, hwid: '' })} className="absolute right-2 top-1.5 p-1 text-red-400"><X size={14} /></button>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1 flex items-center gap-1"><Calendar size={12} /> {t('admin.appExpiration')}</label>
                                        <input type="date" className="input w-full" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1.5 block ml-1 flex items-center gap-1 font-bold"><Cloud size={12} /> {t('admin.cloudExpiration')}</label>
                                        <input type="date" className="input w-full border-blue-200 dark:border-blue-900" value={form.cloud_expires_at} onChange={e => setForm({ ...form, cloud_expires_at: e.target.value })} />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">{t('admin.notes')}</label>
                                        <textarea className="input w-full min-h-[100px] text-sm" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder={t('admin.notesPlaceholder')} />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">{t('admin.accessStatus')}</label>
                                        <div className="flex gap-4">
                                            {['active', 'revoked', 'suspended'].map(st => (
                                                <button
                                                    key={st}
                                                    type="button"
                                                    onClick={() => setForm({ ...form, status: st })}
                                                    className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${form.status === st
                                                        ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-105'
                                                        : 'border-slate-200 text-slate-400 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {t(`admin.statusOptions.${st}`)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">{t('common.cancel')}</button>
                                    <button type="submit" disabled={loading} className="flex-[2] btn-primary py-4 flex items-center justify-center gap-3">
                                        {loading ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                                        <span className="font-black uppercase tracking-widest">{currentLicense ? t('admin.messages.updateSuccess') : t('admin.messages.createSuccess')}</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
