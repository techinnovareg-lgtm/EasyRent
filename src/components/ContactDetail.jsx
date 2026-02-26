import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft, Phone, Mail, FileText,
    Edit2, Trash2, XCircle, Info, Hammer,
    X, Save, Loader2
} from 'lucide-react'
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

export default function ContactDetail() {
    const { t } = useTranslation()
    const { id } = useParams()
    const navigate = useNavigate()
    const [contact, setContact] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ name: '', service_type: 'Otro', phone: '', email: '', notes: '' })

    useEffect(() => { load() }, [id])

    async function load() {
        setLoading(true)
        try {
            const data = await api.contacts.getById(Number(id))
            setContact(data)
        } catch (err) {
            console.error("ContactDetail Load Error:", err)
        } finally {
            setLoading(false)
        }
    }

    function openEdit() {
        setForm({ ...contact })
        setShowModal(true)
    }

    async function handleSave(e) {
        e.preventDefault()
        setSaving(true)
        try {
            await api.contacts.update(Number(id), form)
            setShowModal(false)
            await load()
        } catch (err) {
            console.error("ContactDetail Save Error:", err)
            alert(t('common.saveError') || 'Error al guardar')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete() {
        if (!confirm(t('common.confirmDelete'))) return
        try {
            await api.contacts.delete(Number(id))
            navigate('/contactos')
        } catch (err) {
            console.error("ContactDetail Delete Error:", err)
            alert(t('common.deleteError') || 'Error al eliminar')
        }
    }

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if (!contact) return (
        <div className="p-10 text-center space-y-4">
            <XCircle size={48} className="mx-auto text-red-400" />
            <h2 className="text-xl font-bold">{t('contacts.details.notFound')}</h2>
            <button onClick={() => navigate('/contactos')} className="btn-secondary">{t('contacts.details.backToList')}</button>
        </div>
    )

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="btn-secondary !p-2.5">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                            <Hammer size={28} className="text-slate-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{contact.name}</h1>
                            <span className="badge badge-blue">{contact.service_type}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={openEdit} className="btn-secondary">
                        <Edit2 size={16} /> {t('common.edit')}
                    </button>
                    <button onClick={handleDelete} className="btn-danger">
                        <Trash2 size={16} /> {t('common.delete')}
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="card p-8 space-y-6">
                    <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-widest flex items-center gap-2">
                        <Info size={14} className="text-blue-500" /> {t('contacts.details.idData')}
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-center">
                                <Phone size={18} className="text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t('contacts.form.phone')}</p>
                                <p className="text-base font-bold text-slate-700 dark:text-slate-200 font-mono italic">{contact.phone || t('contacts.details.notRegistered')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-center">
                                <Mail size={18} className="text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t('contacts.form.email')}</p>
                                <p className="text-base font-bold text-slate-700 dark:text-slate-200">{contact.email || t('contacts.details.notRegistered')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card p-8 space-y-4 bg-slate-50/50 dark:bg-slate-800/30">
                    <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-widest flex items-center gap-2">
                        <FileText size={14} className="text-slate-400" /> {t('contacts.details.notesTitle')}
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 min-h-[100px]">
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                {contact.notes || t('contacts.details.noNotes')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <Hammer size={16} className="text-blue-500" />
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">{contact.service_type}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <h2 className="font-bold text-lg text-slate-800 dark:text-white">{t('contacts.editContact')}</h2>
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
                                        <input className="input font-mono" value={form.phone || ''} onChange={e => set('phone', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="label">{t('contacts.form.email')}</label>
                                        <input className="input" type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="label">{t('contacts.form.notes')}</label>
                                    <textarea className="input resize-none" rows={3} value={form.notes || ''} onChange={e => set('notes', e.target.value)} />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">{t('common.cancel')}</button>
                                    <button type="submit" disabled={saving} className="btn-primary flex-1">
                                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        {t('contacts.form.update')}
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
