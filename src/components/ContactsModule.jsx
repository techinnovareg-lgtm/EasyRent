import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Search, Phone, Mail, FileText, Trash2, Edit2, X, Save, Loader2, Eye } from 'lucide-react'
import { api } from '../services/ApiService'
import { useTranslation } from '../context/LanguageContext'

const SERVICE_TYPE_KEYS = [
    { key: 'carpinter', value: 'Carpintero' },
    { key: 'plumber', value: 'Gasfitero' },
    { key: 'painter', value: 'Pintor' },
    { key: 'electrician', value: 'Electricista' },
    { key: 'locksmith', value: 'Cerrajero' },
    { key: 'mason', value: 'Albañil' },
    { key: 'cleaning', value: 'Limpieza' },
    { key: 'other', value: 'Otro' }
]

export default function ContactsModule() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [contacts, setContacts] = useState([])
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ name: '', service_type: 'Otro', phone: '', email: '', notes: '' })

    useEffect(() => { load() }, [])

    async function load() {
        setLoading(true)
        try {
            const data = await api.contacts.getAll().catch(() => [])
            setContacts(data || [])
        } catch (err) {
            console.error("Contacts Load Error:", err)
        } finally {
            setLoading(false)
        }
    }

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    async function handleSave(e) {
        e.preventDefault()
        setSaving(true)
        try {
            if (editing) await api.contacts.update(editing.id, form)
            else await api.contacts.create(form)
            setShowModal(false)
            setEditing(null)
            setForm({ name: '', service_type: 'Otro', phone: '', email: '', notes: '' })
            load()
        } finally { setSaving(false) }
    }

    async function del(id) {
        if (!confirm(t('contacts.deleteConfirm'))) return
        await api.contacts.delete(id)
        load()
    }

    const filtered = (contacts || []).filter(c => {
        if (!c) return false;
        const name = (c.name || '').toLowerCase()
        const service = (c.service_type || '').toLowerCase()
        const term = (search || '').toLowerCase()
        return name.includes(term) || service.includes(term)
    })

    const getServiceLabel = (val) => {
        const found = SERVICE_TYPE_KEYS.find(sk => sk.value === val)
        return found ? t(`contacts.serviceTypes.${found.key}`) : val
    }

    return (
        <div className="p-6 w-full mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('contacts.title')}</h1>
                    <p className="text-sm text-slate-500">{contacts.length} {t('contacts.count')}</p>
                </div>
                <button
                    onClick={() => { setEditing(null); setForm({ name: '', service_type: 'Otro', phone: '', email: '', notes: '' }); setShowModal(true) }}
                    className="btn-primary"
                >
                    <Plus size={16} /> {t('contacts.newContact')}
                </button>
            </div>

            <div className="relative w-full max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    className="input pl-10"
                    placeholder={t('contacts.searchPlaceholder')}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400">{t('common.loading')}</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="card p-12 text-center">
                    <Users size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-slate-500">{t('contacts.noContacts')}</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(c => (
                        <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-4 space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="min-w-0">
                                    <h3 className="font-bold text-slate-800 dark:text-white truncate">{c.name}</h3>
                                    <span className="badge badge-blue">{getServiceLabel(c.service_type)}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => navigate(`/contactos/${c.id}`)}
                                        className="btn-secondary !p-1.5 text-blue-500"
                                    >
                                        <Eye size={13} />
                                    </button>
                                    <button
                                        onClick={() => { setEditing(c); setForm({ ...c }); setShowModal(true) }}
                                        className="btn-secondary !p-1.5"
                                    >
                                        <Edit2 size={13} />
                                    </button>
                                    <button onClick={() => del(c.id)} className="btn-danger !p-1.5"><Trash2 size={13} /></button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                {c.phone && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-mono">
                                        <Phone size={13} className="text-slate-400" /> {c.phone}
                                    </div>
                                )}
                                {c.email && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Mail size={13} className="text-slate-400" /> {c.email}
                                    </div>
                                )}
                                {c.notes && (
                                    <div className="flex items-start gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700">
                                        <FileText size={13} className="text-slate-400 shrink-0" /> {c.notes}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <h2 className="font-bold text-lg text-slate-800 dark:text-white">{editing ? t('contacts.editContact') : t('contacts.newContact')}</h2>
                                <button onClick={() => setShowModal(false)} className="btn-secondary !p-2"><X size={18} /></button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div>
                                    <label className="label">{t('contacts.form.fullName')}</label>
                                    <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="label">{t('contacts.form.serviceType')}</label>
                                    <select className="select" value={form.service_type} onChange={e => set('service_type', e.target.value)}>
                                        {SERVICE_TYPE_KEYS.map(sk => <option key={sk.key} value={sk.value}>{t(`contacts.serviceTypes.${sk.key}`)}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="label">{t('contacts.form.phone')}</label>
                                        <input className="input font-mono" value={form.phone} onChange={e => set('phone', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="label">{t('contacts.form.email')}</label>
                                        <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="label">{t('contacts.form.notes')}</label>
                                    <textarea className="input resize-none" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">{t('common.cancel')}</button>
                                    <button type="submit" disabled={saving} className="btn-primary flex-1">
                                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        {editing ? t('contacts.form.update') : t('contacts.form.save')}
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
