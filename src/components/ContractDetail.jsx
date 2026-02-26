import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
    ArrowLeft, FileText, Calendar, User,
    Building2, DollarSign, Clock, CheckCircle2,
    XCircle, Eye, TrendingUp, Info,
    Edit2, Trash2, X, Save, Loader2, Upload, AlertTriangle
} from 'lucide-react'
import { api } from '../services/ApiService'
import { useTranslation } from '../context/LanguageContext'

function ContractFileZone({ filePath, onUpload, onClear, uploading }) {
    const { t } = useTranslation()
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/*': [], 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        onDrop: async ([file]) => { if (file) await onUpload(file) },
    })

    if (filePath) return (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 w-full">
            <FileText size={16} className="text-emerald-500 shrink-0" />
            <span className="text-sm text-emerald-700 dark:text-emerald-400 flex-1 truncate">{t('contracts.attached')}</span>
            <button type="button" onClick={() => api.files.open(filePath)} className="btn-secondary !px-2 !py-1" title={t('common.details')}><Eye size={12} /></button>
            <button type="button" onClick={onClear} className="btn-danger !px-2 !py-1" title={t('common.delete')}><X size={12} /></button>
        </div>
    )

    return (
        <div {...getRootProps()} className={`dropzone w-full ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            {uploading ? <Loader2 size={20} className="animate-spin text-blue-400" /> : <Upload size={20} className="text-slate-400" />}
            <p className="text-[10px] text-slate-500 text-center">{isDragActive ? t('contracts.dropFile') : t('contracts.attachFile')}</p>
        </div>
    )
}

export default function ContractDetail() {
    const { t, language, formatCurrency } = useTranslation()
    const { id } = useParams()
    const navigate = useNavigate()
    const [contract, setContract] = useState(null)
    const [finances, setFinances] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({})

    useEffect(() => { load() }, [id])

    async function load() {
        setLoading(true)
        try {
            const [c, allF] = await Promise.all([
                api.contracts.getById(Number(id)),
                api.finances.getAll()
            ])
            if (c) {
                setContract(c)
                setFinances((allF || []).filter(f => f.contract_id === c.id))
            }
        } catch (err) {
            console.error("ContractDetail Load Error:", err)
        } finally {
            setLoading(false)
        }
    }

    function openEdit() {
        setForm({
            monthly_rent: contract.monthly_rent || '',
            deposit_amount: contract.deposit_amount || '',
            currency: contract.currency || 'PEN',
            payment_day: contract.payment_day || 1,
            tax_rate: contract.tax_rate || 0,
            late_fee: contract.late_fee || 0,
            start_date: contract.start_date || '',
            end_date: contract.end_date || '',
            status: contract.status || 'activo',
            contract_file_path: contract.contract_file_path || '',
            notes: contract.notes || ''
        })
        setShowModal(true)
    }

    async function handleFileUpload(file) {
        setSaving(true) // Reuse saving state for upload feedback
        try {
            const ext = file.name.split('.').pop()
            const filename = `contract_${Date.now()}.${ext}`
            const path = await api.files.saveUpload({ file, subdir: 'contracts', filename })
            set('contract_file_path', path)
        } finally {
            setSaving(false)
        }
    }

    async function handleSave(e) {
        e.preventDefault()
        setSaving(true)
        try {
            await api.contracts.update(Number(id), form)
            setShowModal(false)
            await load()
        } catch (err) {
            console.error('ContractDetail Save Error:', err)
            alert(t('common.saveError') || 'Error al guardar')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete() {
        if (!confirm(t('common.confirmDelete'))) return
        try {
            await api.contracts.delete(Number(id))
            navigate('/contratos')
        } catch (err) {
            console.error('ContractDetail Delete Error:', err)
            alert(t('common.deleteError') || 'Error al eliminar')
        }
    }

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if (!contract) return (
        <div className="p-10 text-center space-y-4">
            <XCircle size={48} className="mx-auto text-red-400" />
            <h2 className="text-xl font-bold">{t('contract.details.notFound')}</h2>
            <button onClick={() => navigate('/contratos')} className="btn-secondary">{t('contract.details.backToList')}</button>
        </div>
    )

    const isExpired = contract.days_remaining <= 0

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="btn-secondary !p-2.5">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('contract.details.title')}</h1>
                            <span className={`badge ${contract.days_remaining > 30 ? 'badge-green' : contract.days_remaining > 0 ? 'badge-yellow' : 'badge-red'}`}>
                                {contract.days_remaining > 0 ? `${contract.days_remaining} ${t('contract.details.daysRemaining')}` : t('contract.details.expired')}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">ID: #{id} · {t('contract.details.registeredOn')} {contract.created_at?.split(' ')[0]}</p>
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

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Core Info */}
                    <div className="card p-6 grid sm:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-widest flex items-center gap-2">
                                    <Building2 size={14} className="text-blue-500" /> {t('contract.details.linkedProperty')}
                                </h3>
                                <Link to={`/propiedades/${contract.property_id}`} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700 hover:border-blue-300 transition-all group">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
                                        <Building2 size={24} className="text-blue-600 dark:text-blue-400 outline-none" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate group-hover:text-blue-600">{contract.property_name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{t('contract.details.viewProperty')}</p>
                                    </div>
                                </Link>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-widest flex items-center gap-2">
                                    <User size={14} className="text-violet-500" /> {t('contract.details.tenant')}
                                </h3>
                                <Link to={`/inquilinos/${contract.tenant_id}`} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700 hover:border-violet-300 transition-all group">
                                    <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center shrink-0">
                                        <User size={24} className="text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate group-hover:text-violet-600">{contract.tenant_name}</p>
                                        <p className="text-xs text-slate-400 font-mono italic">{contract.tenant_doc}</p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        <div className="space-y-6 bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-3xl border border-slate-100 dark:border-slate-700">
                            <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-widest text-center">{t('contract.details.conditions')}</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><DollarSign size={14} /> {t('contract.details.monthlyRent')}</span>
                                    <span className="font-bold text-slate-800 dark:text-white text-lg">{formatCurrency(contract.monthly_rent)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 flex items-center gap-2"><Clock size={14} /> {t('contract.details.paymentDay')}</span>
                                    <span className="font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
                                        {t('contract.details.everyDayOfMonth', { day: contract.payment_day || 1 })}
                                    </span>
                                </div>
                                <div className="h-px bg-slate-200 dark:bg-slate-700" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{t('contract.details.startDate')}</p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{contract.start_date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{t('contract.details.endDate')}</p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{contract.end_date}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rent Payments History */}
                    <div className="card p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <TrendingUp size={18} className="text-emerald-500" /> {t('contract.details.paymentsTitle')}
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                        <th className="pb-3 font-medium">{t('contract.details.periodMonth')}</th>
                                        <th className="pb-3 font-medium text-center">{t('contract.details.status')}</th>
                                        <th className="pb-3 font-medium text-right">{t('contract.details.amountPaid')}</th>
                                        <th className="pb-3 font-medium text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {finances.length > 0 ? finances.map(f => (
                                        <tr key={f.id} className="group">
                                            <td className="py-3 font-bold text-slate-700 dark:text-slate-300 italic">{f.period_month || '—'}</td>
                                            <td className="py-3 text-center">
                                                <span className={`badge ${f.status === 'pagado' ? 'badge-green' : 'badge-yellow'}`}>
                                                    {f.status === 'pagado' ? t('finance.status.paid') : t('finance.status.pending')}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right font-mono font-bold text-slate-800 dark:text-white">{formatCurrency(f.amount)}</td>
                                            <td className="py-3 text-right">
                                                <Link to={`/finanzas/${f.id}`} className="btn-secondary !p-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Eye size={12} />
                                                </Link>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4} className="py-10 text-center text-slate-400 italic text-xs">{t('contract.details.noPayments')}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right: Documents & Files */}
                <div className="space-y-6">
                    <div className="card p-6 space-y-4 border-t-4 border-t-blue-500">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <FileText size={18} className="text-blue-500" /> {t('contract.details.legalDoc')}
                        </h3>
                        {contract.contract_file_path ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 flex flex-col items-center gap-3 text-center">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                                        <FileText size={24} className="text-blue-500" />
                                    </div>
                                    <div className="min-w-0 w-full">
                                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{contract.contract_file_path.split(/[\\/]/).pop()}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{t('contract.details.pdfImage')}</p>
                                    </div>
                                    <div className="flex w-full gap-2">
                                        <button
                                            onClick={() => api.files.open(contract.contract_file_path)}
                                            className="btn-primary flex-1 justify-center text-xs"
                                        >
                                            <Eye size={14} /> {t('contract.details.openDoc')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-center space-y-2">
                                <FileText size={32} className="mx-auto text-slate-200 dark:text-slate-800" />
                                <p className="text-xs text-slate-400">{t('contract.details.noLegalDoc')}</p>
                            </div>
                        )}
                    </div>

                    <div className="card p-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/10">
                        <div className="flex items-start gap-3">
                            <Info size={20} className="mt-1 opacity-60 shrink-0" />
                            <div className="space-y-1">
                                <p className="font-black text-xs uppercase tracking-widest opacity-60">{t('contract.details.reminder')}</p>
                                <p className="text-sm font-medium leading-relaxed">
                                    {t('contract.details.expiresOn')} <b>{contract.end_date}</b>.
                                    {contract.days_remaining > 0 && contract.days_remaining < 30 && ` ${t('contract.details.recommendRenewal')}`}
                                </p>
                            </div>
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
                            className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <h2 className="font-bold text-lg text-slate-800 dark:text-white">{t('common.edit')} {t('contract.details.title')}</h2>
                                <button onClick={() => setShowModal(false)} className="btn-secondary !p-2"><X size={18} /></button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="label">{t('contracts.form.monthlyRent')}</label>
                                        <input className="input" type="number" step="0.01"
                                            value={form.monthly_rent}
                                            onChange={e => set('monthly_rent', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="label">{t('contracts.form.deposit')}</label>
                                        <input className="input" type="number" step="0.01"
                                            value={form.deposit_amount}
                                            onChange={e => set('deposit_amount', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="label">{t('contracts.form.paymentDay')}</label>
                                        <input className="input" type="number" min="1" max="31"
                                            value={form.payment_day}
                                            onChange={e => set('payment_day', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="label">{t('contracts.form.currency')}</label>
                                        <select className="select" value={form.currency} onChange={e => set('currency', e.target.value)}>
                                            <option value="PEN">PEN (S/.)</option>
                                            <option value="USD">USD ($)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">{t('contracts.form.startDate')}</label>
                                        <input className="input" type="date"
                                            value={form.start_date}
                                            onChange={e => set('start_date', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="label">{t('contracts.form.endDate')}</label>
                                        <input className="input" type="date"
                                            value={form.end_date}
                                            onChange={e => set('end_date', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="label">Impuesto (%)</label>
                                        <input className="input" type="number" step="0.01"
                                            value={((form.tax_rate || 0) * 100).toFixed(2)}
                                            onChange={e => set('tax_rate', Number(e.target.value) / 100)} />
                                    </div>
                                    <div>
                                        <label className="label">{t('common.status')}</label>
                                        <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
                                            {['activo', 'vencido', 'terminado'].map(s => <option key={s} value={s}>{t(`contracts.statusColors.${s}`)}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="label text-red-600 font-bold">{t('contracts.form.lateFee')}</label>
                                        <input className="input text-red-600 font-bold" type="number" step="0.01" min="0"
                                            value={form.late_fee}
                                            onChange={e => set('late_fee', e.target.value)} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="label">{t('contracts.form.file')}</label>
                                        <ContractFileZone filePath={form.contract_file_path} uploading={saving} onUpload={handleFileUpload} onClear={() => set('contract_file_path', '')} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="label">{t('contracts.form.notes')}</label>
                                        <textarea className="input resize-none" rows={3}
                                            value={form.notes}
                                            onChange={e => set('notes', e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">{t('common.cancel')}</button>
                                    <button type="submit" disabled={saving} className="btn-primary flex-1">
                                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        {t('common.save')}
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
